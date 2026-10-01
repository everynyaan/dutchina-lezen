<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { LUISTEREN_EXAMS } from '$lib/luisteren/LUISTEREN_CONTENT';
	import {
		R2_BASE,
		type LuisterenExam,
		type LuisterenPassage,
		type LuisterenQuestion,
		type Answer
	} from '$lib/luisteren/types';
	import { playSfx } from '$lib/sound/sfx';
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Pager from '$lib/components/ui/Pager.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import { resolve } from '$app/paths';
	import ExamPaperBanner from '$lib/components/ExamPaperBanner.svelte';
	import GateBrowseFilter from '$lib/components/GateBrowseFilter.svelte';
	import { currentGateFromState } from '$lib/gates/gates';
	import { examYearsForBrowse, initialBrowseGate } from '$lib/gates/browse';

	const ctx = getGameContext();
	let engineGate = $derived(currentGateFromState(ctx.state));
	let browseGate = $state(initialBrowseGate(currentGateFromState(ctx.state)));
	let roomYears = $derived(examYearsForBrowse(browseGate));

	// ============================================================
	// VIEW STATE
	// ============================================================
	type View = 'exams' | 'practice';

	let view = $state<View>('exams');
	let selectedYear = $state(2025);
	let activePassage = $state<LuisterenPassage | null>(null);
	let activeExam = $state<LuisterenExam | null>(null);

	// Practice state
	let questionIndex = $state(0);
	let selectedAnswer = $state<Answer | null>(null);
	let showResult = $state(false);
	let wasCorrect = $state(false);
	// Session-local memory of which letter was picked (not persisted — ctx only
	// stores correctness). Reset whenever a new passage opens.
	let sessionAnswers = $state<Record<string, Answer>>({});

	// Media
	let mediaRef = $state<HTMLAudioElement | HTMLVideoElement | null>(null);
	let isPlaying = $state(false);
	let hasPlayed = $state(false);

	// ============================================================
	// DERIVED
	// ============================================================
	let exam = $derived(LUISTEREN_EXAMS.find((e) => e.year === selectedYear)!);

	let examProg = $derived(getExamProgress(exam));

	let currentQuestion = $derived<LuisterenQuestion | null>(
		activePassage && questionIndex < activePassage.questions.length
			? activePassage.questions[questionIndex]
			: null
	);

	let mediaUrl = $derived(
		currentQuestion ? `${R2_BASE}/${activeExam?.year}/${currentQuestion.filename}` : ''
	);

	let isVideo = $derived(currentQuestion?.mediaType === 'video');

	// ============================================================
	// PROGRESS HELPERS
	// ============================================================
	function getPassageProgress(passage: LuisterenPassage): {
		answered: number;
		correct: number;
		total: number;
	} {
		let answered = 0;
		let correct = 0;
		for (const q of passage.questions) {
			const result = ctx.state.luisteren.questionResults[q.id];
			if (result) {
				answered++;
				if (result.correct) correct++;
			}
		}
		return { answered, correct, total: passage.questions.length };
	}

	function getExamProgress(ex: LuisterenExam): {
		answered: number;
		correct: number;
		total: number;
	} {
		let answered = 0;
		let correct = 0;
		let total = 0;
		for (const p of ex.passages) {
			const prog = getPassageProgress(p);
			answered += prog.answered;
			correct += prog.correct;
			total += prog.total;
		}
		return { answered, correct, total };
	}

	function isQuestionAnswered(qId: string): boolean {
		return !!ctx.state.luisteren.questionResults[qId];
	}

	function wasQuestionCorrect(qId: string): boolean {
		return ctx.state.luisteren.questionResults[qId]?.correct ?? false;
	}

	// ============================================================
	// ACTIONS
	// ============================================================
	function selectYear(year: number) {
		selectedYear = year;
	}

	function openPassage(ex: LuisterenExam, passage: LuisterenPassage) {
		activeExam = ex;
		activePassage = passage;
		questionIndex = 0;
		selectedAnswer = null;
		showResult = false;
		hasPlayed = false;
		isPlaying = false;
		sessionAnswers = {};
		view = 'practice';
	}

	function backToExams() {
		view = 'exams';
		activePassage = null;
		activeExam = null;
		stopMedia();
	}

	function playMedia() {
		if (!mediaRef) return;
		mediaRef.play().catch((err: unknown) => {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			console.error('luisteren media playback failed:', err);
		});
		isPlaying = true;
		hasPlayed = true;
	}

	function pauseMedia() {
		if (!mediaRef) return;
		mediaRef.pause();
		isPlaying = false;
	}

	function replayMedia() {
		if (!mediaRef) return;
		mediaRef.currentTime = 0;
		mediaRef.play();
		isPlaying = true;
	}

	function stopMedia() {
		if (!mediaRef) return;
		mediaRef.pause();
		mediaRef.currentTime = 0;
		isPlaying = false;
	}

	function handleMediaEnded() {
		isPlaying = false;
	}

	function selectOption(answer: Answer) {
		if (showResult || !currentQuestion) return;
		selectedAnswer = answer;
		showResult = true;
		wasCorrect = answer === currentQuestion.answer;
		sessionAnswers[currentQuestion.id] = answer;

		if (wasCorrect) {
			playSfx('correct');
		} else {
			playSfx('wrong');
		}

		// Record result in state (only first attempt counts)
		if (!isQuestionAnswered(currentQuestion.id)) {
			ctx.state.luisteren.questionResults[currentQuestion.id] = {
				correct: wasCorrect,
				attemptedAt: new Date().toISOString()
			};

			// LP on correct (first attempt only)
			if (wasCorrect) {
				ctx.applyLpEvent({ type: 'luisteren_correct' });
				ctx.updateMissions('luisteren_correct', 1);
			}
		}
	}

	function nextQuestion() {
		if (!activePassage) return;
		stopMedia();

		if (questionIndex < activePassage.questions.length - 1) {
			questionIndex++;
			selectedAnswer = null;
			showResult = false;
			hasPlayed = false;
		} else {
			// End of passage
			backToExams();
		}
	}

	function goToQuestion(newIndex: number) {
		if (!activePassage) return;
		if (newIndex < 0 || newIndex >= activePassage.questions.length) return;
		stopMedia();
		questionIndex = newIndex;
		const q = activePassage.questions[newIndex];
		if (isQuestionAnswered(q.id)) {
			showResult = true;
			wasCorrect = wasQuestionCorrect(q.id);
			selectedAnswer = sessionAnswers[q.id] ?? null;
		} else {
			showResult = false;
			selectedAnswer = null;
		}
		hasPlayed = false;
		isPlaying = false;
	}

	function goPrevQuestion() {
		goToQuestion(questionIndex - 1);
	}

	function goNextQuestion() {
		goToQuestion(questionIndex + 1);
	}

	function getOptionClass(opt: Answer): string {
		if (!showResult) return selectedAnswer === opt ? 'selected' : '';
		if (!currentQuestion) return '';
		if (opt === currentQuestion.answer) return 'correct';
		if (opt === selectedAnswer && opt !== currentQuestion.answer) return 'wrong';
		return 'dimmed';
	}

	// Reset media element when question changes
	$effect(() => {
		if (currentQuestion) {
			// Force re-render of media element by reacting to mediaUrl
			isPlaying = false;
			hasPlayed = false;
		}
	});

	// Kuromi's corner reaction on the practice view - state-driven, never
	// random, same protocol as /quiz's corner reactor (V3_DESIGN section 8).
	// 'hehe' has an animated variant and this is an answer EVENT, so it is
	// allowed to animate (section 7); 'shocked'/'question' are static-only
	// moods per the manifest and are never forced to animate.
	let reactorMood = $derived(!showResult ? 'question' : wasCorrect ? 'hehe' : 'shocked');
</script>

{#if view === 'exams'}
	<div class="luisteren">
		<a href={resolve('/')} class="back-link">
			<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
			<span>Home</span>
		</a>

		<div class="page-head">
			<div class="page-head-copy">
				<h1 class="page-title">
					<Icon name="headphones" size={22} color="var(--color-lavender-deep)" />
					<span class="title-word">
						Listening
						<span class="squiggle">
							<Doodle name="swirl-spiral-117" size={100} color="var(--color-rose-deep)" tilt={-3} />
						</span>
					</span>
				</h1>
				<p class="page-subtitle">NT2 Listening practice from official exams</p>
			</div>
			<div class="head-cameo jit-b">
				<Character who="melody" mood="glasses" size={40} />
			</div>
		</div>


		<ExamPaperBanner note="Official NT2 exam." />

		<GateBrowseFilter
			current={engineGate}
			selected={browseGate}
			noun="exam papers"
			onSelect={(g) => (browseGate = g)}
		/>

		{#if roomYears.length === 0}
			<p class="page-subtitle">
				Exam papers live in Gate 4. Looking them up is browsing — homework stays on Gate {engineGate}.
			</p>
		{:else}
		<div class="year-tabs r-chip offset-pill edge-hair">
			{#each roomYears as year (year)}
				{@const prog = getExamProgress(LUISTEREN_EXAMS.find((e) => e.year === year)!)}
				<button
					class="year-tab"
					class:active={selectedYear === year}
					onclick={() => selectYear(year)}
				>
					<span class="year-label">{year}</span>
					{#if prog.answered > 0}
						<span class="year-prog">{prog.correct}/{prog.total}</span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="passages">
			{#each exam.passages as passage, pIdx (pIdx)}
				{@const prog = getPassageProgress(passage)}
				<button
					class="passage-card r-card offset-card edge-hair"
					onclick={() => openPassage(exam, passage)}
				>
					<div class="passage-header">
						<div class="passage-icon">
							<Icon name="headphones" size={16} color="var(--color-lavender-deep)" />
						</div>
						<div class="passage-info">
							<span class="passage-name">{passage.name}</span>
							<span class="passage-meta">
								{passage.questions.length} questions
								{#if passage.mediaType === 'video'}
									&middot; video
								{/if}
							</span>
						</div>
						<div class="passage-progress">
							{#if prog.answered === 0}
								<Pill variant="lavender" size="sm">New</Pill>
							{:else if prog.answered === prog.total}
								<Pill variant="teal" size="sm">
									<Icon name="check" size={12} />
									{prog.correct}/{prog.total}
								</Pill>
							{:else}
								<Pill variant="peach" size="sm">{prog.answered}/{prog.total}</Pill>
							{/if}
						</div>
					</div>
					<p class="passage-intro">{passage.intro}</p>
				</button>
			{/each}
		</div>

		<div class="exam-stats r-card offset-card edge-ink">
			<span class="stats-sparkle">
				<Doodle name="spark-sparkle-26" size={24} color="var(--color-rose-deep)" tilt={6} />
			</span>
			<span class="stat-label">Score: {examProg.correct} / {examProg.total}</span>
			{#if examProg.answered === examProg.total && examProg.total > 0}
				{#if examProg.correct >= exam.passingScore}
					<Pill variant="teal" size="sm">
						<Icon name="check" size={12} />
						Passed
					</Pill>
				{:else}
					<Pill variant="rose" size="sm">
						Need {exam.passingScore - examProg.correct} more
					</Pill>
				{/if}
			{:else if examProg.total > 0}
				<span class="stat-hint">Pass: {exam.passingScore}+ correct</span>
			{/if}
		</div>
		{/if}
	</div>
{:else if view === 'practice' && activePassage && currentQuestion}
	<div class="practice">
		<button class="back-btn" onclick={backToExams}>
			<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
			<span>{activePassage.name}</span>
		</button>

		<div class="q-counter">
			<span class="q-reactor">
				<Character who="kuromi" mood={reactorMood} size={32} animated={reactorMood === 'hehe'} />
			</span>
			Question {questionIndex + 1} / {activePassage.questions.length}
			<span class="q-opgave">Question {currentQuestion.opgave}</span>
			<span class="q-sparkle">
				<Doodle name="spark-sparkle-26" size={16} color="var(--color-rose-deep)" tilt={10} />
			</span>
		</div>

		<div class="q-dots">
			{#each activePassage.questions as q, i (q.id)}
				{@const answered = isQuestionAnswered(q.id)}
				{@const correct = wasQuestionCorrect(q.id)}
				<div
					class="q-dot"
					class:current={i === questionIndex}
					class:answered
					class:correct={answered && correct}
					class:wrong={answered && !correct}
				></div>
			{/each}
		</div>

		<Sticker variant="audio" title="Listen">
			Play the audio or video, then answer below. You can replay it as many times as you like.
		</Sticker>

		<div class="media-section">
			<span class="media-sparkle">
				<Doodle name="spark-sparkle-26" size={22} color="var(--color-rose-deep)" tilt={-8} />
			</span>
			{#if isVideo}
				{#key mediaUrl}
					<video
						bind:this={mediaRef}
						src={mediaUrl}
						class="video-player"
						onended={handleMediaEnded}
						playsinline
					></video>
				{/key}
			{:else}
				{#key mediaUrl}
					<audio bind:this={mediaRef} src={mediaUrl} onended={handleMediaEnded} preload="auto"
					></audio>
				{/key}
			{/if}

			<div class="media-controls">
				{#if !hasPlayed}
					<button class="play-btn" onclick={playMedia}>
						<Icon name="play" size={18} />
						<span>Play {isVideo ? 'video' : 'audio'}</span>
					</button>
				{:else if isPlaying}
					<button class="play-btn pause" onclick={pauseMedia}>
						<div class="pulse-ring"></div>
						<Icon name="pause" size={16} />
						<span>Pause</span>
					</button>
				{:else}
					<div class="media-btn-row">
						<button class="play-btn" onclick={playMedia}>
							<Icon name="play" size={16} />
							<span>Resume</span>
						</button>
						<button class="play-btn replay" onclick={replayMedia}>
							<Icon name="rotate-left" size={16} />
							<span>Restart</span>
						</button>
					</div>
				{/if}
			</div>
		</div>

		<Card variant="white" class="question-card">
			<p class="question-text">{currentQuestion.question}</p>

			<div class="options">
				{#each ['A', 'B', 'C'] as const as opt (opt)}
					<button
						class="option-btn {getOptionClass(opt)}"
						onclick={() => selectOption(opt)}
						disabled={showResult}
					>
						<span class="option-letter">{opt}</span>
						<span class="option-text">{currentQuestion.options[opt]}</span>
						{#if showResult && opt === currentQuestion.answer}
							<Icon name="check" size={16} color="var(--color-teal-deep)" class="option-icon" />
						{:else if showResult && opt === selectedAnswer && opt !== currentQuestion.answer}
							<Icon name="xmark" size={16} color="var(--color-rose-deep)" class="option-icon" />
						{/if}
					</button>
				{/each}
			</div>

			{#if showResult}
				{#if wasCorrect}
					<Sticker variant="tip">
						<span class="result-copy"><Icon name="check" size={16} /> Correct!</span>
					</Sticker>
				{:else}
					<Sticker variant="trap">
						<span class="result-copy"
							><Icon name="xmark" size={16} /> Wrong. The answer is {currentQuestion.answer}.</span
						>
					</Sticker>
				{/if}

				<button class="next-btn" onclick={nextQuestion}>
					{#if questionIndex < activePassage.questions.length - 1}
						<span>Next question</span>
						<Icon name="arrow-right" size={16} />
					{:else}
						<span>Finish</span>
						<Icon name="check" size={16} />
					{/if}
				</button>
			{/if}
		</Card>

		<Pager
			page={questionIndex + 1}
			total={activePassage.questions.length}
			onprev={goPrevQuestion}
			onnext={goNextQuestion}
			label="Question pages"
			unit="Question"
		/>
	</div>
{/if}

<style>
	.luisteren,
	.practice {
		padding: 0.5rem 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--color-muted-ink);
		text-decoration: none;
		font-size: var(--text-small);
		margin-bottom: -0.25rem;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		color: var(--color-muted-ink);
		font-size: var(--text-small);
		cursor: pointer;
		padding: 0;
		-webkit-tap-highlight-color: transparent;
	}

	.page-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	.page-head-copy {
		min-width: 0;
	}
	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.title-word {
		position: relative;
		display: inline-block;
		padding-bottom: 4px;
	}
	.squiggle {
		position: absolute;
		left: 0;
		bottom: -4px;
		line-height: 0;
		pointer-events: none;
	}
	.squiggle :global(.doodle) {
		width: 100% !important;
		height: 12px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}
	.page-subtitle {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin-top: 6px;
	}
	.head-cameo {
		flex-shrink: 0;
		line-height: 0;
	}

	.year-tabs {
		display: flex;
		gap: 6px;
		background: var(--color-s1);
		padding: 4px;
	}

	.year-tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 8px 4px;
		border: none;
		background: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.year-tab.active {
		background: color-mix(in srgb, var(--color-lavender) 55%, white);
	}

	.year-label {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-text);
	}

	.year-tab.active .year-label {
		color: var(--color-lavender-deep);
	}

	.year-prog {
		font-size: var(--text-micro);
		color: var(--color-muted-ink);
	}

	.year-tab.active .year-prog {
		color: var(--color-lavender-deep);
	}

	/* Passage cards */
	.passages {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.passage-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px 16px 14px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white) 0%,
			color-mix(in srgb, var(--color-lavender) 26%, white) 100%
		);
		cursor: pointer;
		text-align: left;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.passage-card:active {
		transform: scale(var(--press-scale));
		filter: brightness(0.97);
	}

	.passage-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.passage-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: color-mix(in srgb, white 55%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.passage-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.passage-name {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-lavender-deep);
	}

	.passage-meta {
		font-size: var(--text-micro);
		color: var(--color-lavender-deep);
		opacity: 0.85;
	}

	.passage-intro {
		font-size: var(--text-small);
		color: var(--color-lavender-deep);
		opacity: 0.9;
		line-height: 1.4;
		margin: 0;
	}

	/* Exam stats bar */
	.exam-stats {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px;
		padding: 14px 16px;
		background: var(--color-s1);
		font-size: var(--text-small);
	}
	.stats-sparkle {
		position: absolute;
		top: -10px;
		right: 12px;
		line-height: 0;
		pointer-events: none;
	}

	.stat-label {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--color-ink);
	}

	.stat-hint {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}

	/* ============================================================ */
	/* PRACTICE VIEW */
	/* ============================================================ */
	.q-counter {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-ink);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.q-reactor {
		line-height: 0;
		flex-shrink: 0;
	}
	.q-sparkle {
		line-height: 0;
		flex-shrink: 0;
		margin-left: auto;
	}

	.q-opgave {
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-muted-ink);
		background: var(--color-s2);
		padding: 2px 7px;
		border-radius: 5px;
	}

	/* Progress dots */
	.q-dots {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.q-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-s2);
		border: 2px solid var(--color-border2);
		transition: all 0.2s;
	}

	.q-dot.current {
		border-color: var(--color-lavender-deep);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-lavender-deep) 30%, transparent);
	}

	.q-dot.correct {
		background: var(--color-teal-deep);
		border-color: var(--color-teal-deep);
	}

	.q-dot.wrong {
		background: var(--color-rose-deep);
		border-color: var(--color-rose-deep);
	}

	/* Media section */
	.media-section {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.media-sparkle {
		position: absolute;
		top: -12px;
		right: 4px;
		line-height: 0;
		pointer-events: none;
	}

	.video-player {
		width: 100%;
		border-radius: 16px;
		background: var(--color-ink);
		max-height: 260px;
	}

	.media-controls {
		display: flex;
		justify-content: center;
	}

	.play-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 24px;
		border: 2px solid var(--color-ink);
		background: var(--color-rose);
		border-radius: 999px;
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s;
		-webkit-tap-highlight-color: transparent;
		position: relative;
		box-shadow: var(--shadow-offset-pill);
	}

	.play-btn:hover:not(:disabled) {
		background: var(--color-rose-deep);
		color: var(--color-cream);
	}

	.play-btn.replay {
		border-color: var(--color-ink);
		background: var(--color-s2);
		color: var(--color-ink);
	}

	.play-btn.pause {
		border-color: var(--color-ink);
		background: color-mix(in srgb, var(--color-peach) 55%, white);
		color: var(--color-ink);
	}

	.media-btn-row {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.pulse-ring {
		position: absolute;
		inset: -3px;
		border-radius: 999px;
		border: 2px solid var(--color-rose-deep);
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.02);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse-ring {
			animation: none;
			opacity: 0.6;
		}
	}

	.question-text {
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--color-text);
		margin: 0;
	}

	/* MC options */
	.options {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.option-btn {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 14px 16px;
		background: var(--color-s1);
		border: 2px solid var(--color-ink);
		border-radius: 16px;
		box-shadow: var(--shadow-offset-pill);
		cursor: pointer;
		text-align: left;
		transition: all 0.15s;
		-webkit-tap-highlight-color: transparent;
		position: relative;
	}

	.option-btn:hover:not(:disabled) {
		border-color: var(--color-lavender-deep);
	}

	.option-btn.selected {
		border-color: var(--color-lavender-deep);
		background: color-mix(in srgb, var(--color-lavender) 14%, transparent);
	}

	.option-btn.correct {
		border-color: var(--color-teal-deep);
		background: color-mix(in srgb, var(--color-teal) 22%, white);
	}

	.option-btn.wrong {
		border-color: var(--color-rose-deep);
		background: color-mix(in srgb, var(--color-rose) 20%, white);
	}

	.option-btn.dimmed {
		opacity: 0.5;
	}

	.option-letter {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 800;
		color: var(--color-muted-ink);
		width: 20px;
		flex-shrink: 0;
		padding-top: 1px;
	}

	.option-btn.correct .option-letter {
		color: var(--color-teal-deep);
	}

	.option-btn.wrong .option-letter {
		color: var(--color-rose-ink);
	}

	.option-text {
		font-size: var(--text-base);
		line-height: 1.4;
		color: var(--color-text);
		flex: 1;
	}

	:global(.option-icon) {
		flex-shrink: 0;
		margin-top: 1px;
	}

	.result-copy {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-ink);
	}

	/* Next button */
	.next-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px;
		background: var(--color-rose);
		color: var(--color-ink);
		border: none;
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		cursor: pointer;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.next-btn:hover {
		background: var(--color-rose-deep);
		color: var(--color-cream);
	}

	.next-btn:active {
		transform: scale(var(--press-scale));
	}
</style>
