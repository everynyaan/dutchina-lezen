<script lang="ts">
	import { tick } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
	import {
		type LezenExam,
		type LezenPassage,
		type LezenQuestion,
		type LezenAnswer
	} from '$lib/lezen/types';
	import { playSfx } from '$lib/sound/sfx';
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import PassageText from '$lib/components/reading/PassageText.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Pager from '$lib/components/ui/Pager.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import { resolve } from '$app/paths';
	import ExamPaperBanner from '$lib/components/ExamPaperBanner.svelte';
	import TimeBox from '$lib/components/reading/TimeBox.svelte';
	import {
		BOOKLET_PASS_LABEL,
		MINUTES_PER_TEXT,
		passLineFor,
		passedSitting,
		practiceYears,
		yearStudied
	} from '$lib/reading/mock';
	import { evalResults } from '$lib/reading/eval';
	import { evidenceOf } from '$lib/reading/evidence';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import { MOVE_LINE, moveOf } from '$lib/reading/moves';

	const ctx = getGameContext();

	/** Paragraphs shown per reading page. Tuned for typical NT2 passages (≈3–6 pages). */
	const PARAGRAPHS_PER_PAGE = 4;

	type View = 'exams' | 'reading' | 'questions';

	let view = $state<View>('exams');
	let selectedYear = $state(2025);
	let activePassage = $state<LezenPassage | null>(null);
	let activeExam = $state<LezenExam | null>(null);

	// Question state
	let questionIndex = $state(0);
	let selectedAnswer = $state<LezenAnswer | null>(null);
	let showResult = $state(false);
	let wasCorrect = $state(false);

	// Local reading pager state — never persisted
	let readingPage = $state(1);

	let studied2023 = $derived(
		yearStudied(
			2023,
			ctx.state.lezen.questionResults,
			evalResults(ctx.state.readingFork.eval),
			ctx.state.readingFork.misses.map((miss) => miss.questionId)
		)
	);
	let years = $derived(practiceYears(ctx.state.readingFork.satMocks, studied2023));
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));
	let exam = $derived(
		LEZEN_EXAMS.find((e) => e.year === selectedYear) ?? LEZEN_EXAMS.find((e) => e.year === 2025)!
	);

	$effect(() => {
		if (!years.includes(selectedYear)) selectedYear = years[0] ?? 2025;
	});
	let examProg = $derived(getExamProgress(exam));

	// Sentence splitting for TTS with paragraph type classification
	type ParaType = 'title' | 'heading' | 'body';
	interface TextParagraph {
		sentences: string[];
		type: ParaType;
	}

	function splitIntoParagraphs(text: string): TextParagraph[] {
		const raw = text.split(/\n\n+/).filter((p) => p.trim());
		return raw.map((para, i) => {
			const trimmed = para.trim();
			const parts = trimmed.split(
				/(?<=[.!?]['\u2019\u201D"]?)\s+(?=[A-Z\u00C0-\u00D6\u00D8-\u00DE\u2018\u201C\u201E])/
			);
			const sentences = parts.map((s) => s.trim()).filter((s) => s.length > 0);

			let type: ParaType = 'body';
			if (i === 0) {
				type = 'title';
			} else if (sentences.length === 1 && trimmed.length < 80 && !/[.!?)\u201D"]$/.test(trimmed)) {
				type = 'heading';
			}

			return { sentences, type };
		});
	}

	let paragraphs = $derived<TextParagraph[]>(
		activePassage ? splitIntoParagraphs(activePassage.text) : []
	);

	let pageTotal = $derived(Math.max(1, Math.ceil(paragraphs.length / PARAGRAPHS_PER_PAGE)));
	let pageStart = $derived((readingPage - 1) * PARAGRAPHS_PER_PAGE);
	let pageParagraphs = $derived(paragraphs.slice(pageStart, pageStart + PARAGRAPHS_PER_PAGE));

	let selectedKey = $state<string | null>(null);
	let selectedText = $state<string | null>(null);
	let popoverPos = $state<{ top: number; left: number } | null>(null);

	// Reset to page 1 when the active passage identity changes (SvelteKit reuses this
	// component across in-route navigations, so onDestroy will not fire).
	$effect(() => {
		void activePassage?.slug;
		readingPage = 1;
		selectedKey = null;
		selectedText = null;
		popoverPos = null;
	});

	function handleSentenceClick(
		e: MouseEvent | KeyboardEvent,
		pIdx: number,
		sIdx: number,
		text: string
	) {
		if ('key' in e) {
			if (e.key !== 'Enter' && e.key !== ' ') return;
			e.preventDefault();
		}
		const key = `${pIdx}-${sIdx}`;
		if (selectedKey === key) {
			selectedKey = null;
			selectedText = null;
			popoverPos = null;
			return;
		}
		selectedKey = key;
		selectedText = text;

		const span = e.currentTarget as HTMLElement;
		const card = span.closest('.passage-text-card') as HTMLElement;
		if (!card) return;
		const spanRect = span.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();

		popoverPos = {
			top: spanRect.top - cardRect.top - 42,
			left: Math.max(0, Math.min(spanRect.left - cardRect.left, cardRect.width - 110))
		};
	}

	function clearSentenceSelection() {
		selectedKey = null;
		selectedText = null;
		popoverPos = null;
	}

	function scrollPassageCardIntoView() {
		const card = document.querySelector('.reading .passage-text-card');
		if (!(card instanceof HTMLElement)) return;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		card.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	async function goPrevPage() {
		if (readingPage <= 1) return;
		readingPage -= 1;
		clearSentenceSelection();
		await tick();
		scrollPassageCardIntoView();
	}

	async function goNextPage() {
		if (readingPage >= pageTotal) return;
		readingPage += 1;
		clearSentenceSelection();
		await tick();
		scrollPassageCardIntoView();
	}

	let currentQuestion = $derived<LezenQuestion | null>(
		activePassage && questionIndex < activePassage.questions.length
			? activePassage.questions[questionIndex]
			: null
	);

	function getPassageProgress(passage: LezenPassage) {
		let answered = 0,
			correct = 0;
		for (const q of passage.questions) {
			const r = ctx.state.lezen.questionResults[q.id];
			if (r) {
				answered++;
				if (r.correct) correct++;
			}
		}
		return { answered, correct, total: passage.questions.length };
	}

	function getExamProgress(ex: LezenExam) {
		let answered = 0,
			correct = 0,
			total = 0;
		for (const p of ex.passages) {
			const prog = getPassageProgress(p);
			answered += prog.answered;
			correct += prog.correct;
			total += prog.total;
		}
		return { answered, correct, total };
	}

	function isQuestionAnswered(qId: string) {
		return !!ctx.state.lezen.questionResults[qId];
	}
	function wasQuestionCorrect(qId: string) {
		return ctx.state.lezen.questionResults[qId]?.correct ?? false;
	}

	function openPassage(ex: LezenExam, passage: LezenPassage) {
		activeExam = ex;
		activePassage = passage;
		questionIndex = 0;
		selectedAnswer = null;
		showResult = false;
		view = 'reading';
	}

	function startQuestions() {
		questionIndex = 0;
		selectedAnswer = null;
		showResult = false;
		view = 'questions';
	}

	function backToExams() {
		view = 'exams';
		activePassage = null;
		activeExam = null;
		clearSentenceSelection();
	}

	function backToReading() {
		view = 'reading';
		selectedAnswer = null;
		showResult = false;
	}

	function selectOption(answer: LezenAnswer) {
		if (showResult || !currentQuestion) return;
		selectedAnswer = answer;
		showResult = true;
		wasCorrect = answer === currentQuestion.answer;
		playSfx(wasCorrect ? 'correct' : 'wrong');

		if (!isQuestionAnswered(currentQuestion.id)) {
			ctx.state.lezen.questionResults[currentQuestion.id] = {
				correct: wasCorrect,
				attemptedAt: new Date().toISOString()
			};
			if (wasCorrect) {
				ctx.applyLpEvent({ type: 'lezen_correct' });
				ctx.updateMissions('lezen_correct', 1);
			}
		}
	}

	function nextQuestion() {
		if (!activePassage) return;
		if (questionIndex < activePassage.questions.length - 1) {
			questionIndex++;
			selectedAnswer = null;
			showResult = false;
		} else {
			backToExams();
		}
	}

	function getOptionClass(opt: LezenAnswer): string {
		if (!showResult) return selectedAnswer === opt ? 'selected' : '';
		if (!currentQuestion) return '';
		if (opt === currentQuestion.answer) return 'correct';
		if (opt === selectedAnswer && opt !== currentQuestion.answer) return 'wrong';
		return 'dimmed';
	}

	// Kuromi's corner reaction on the question view - state-driven, never
	// random, same protocol as /quiz's corner reactor (V3_DESIGN section 8).
	// 'hehe' has an animated variant and this is an answer EVENT, so it is
	// allowed to animate (section 7); 'shocked'/'question' are static-only
	// moods per the manifest and are never forced to animate.
</script>

{#if view === 'exams'}
	<div class="lezen">
		<a href={resolve('/')} class="back-link">
			<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
			<span>Home</span>
		</a>

		<div class="page-head">
			<div class="page-head-copy">
				<h1 class="page-title">
					<Icon name="book-open-cover" size={22} color="var(--color-lavender-deep)" />
					<span class="title-word">
						Reading
						<span class="squiggle">
							<Doodle name="swirl-spiral-117" size={64} color="var(--color-rose-deep)" tilt={-3} />
						</span>
					</span>
				</h1>
				<p class="page-subtitle">NT2 Reading practice from official exams</p>
			</div>
			<div class="head-cameo jit-b">
				<Character who="melody" mood="reading" size={40} />
			</div>
		</div>

		<ExamPaperBanner
			note={years.includes(2023)
				? 'Practice papers, 2023–2025. A studied paper is not a November prediction.'
				: 'Training papers, 2024 and 2025. Not the dress rehearsal.'}
		/>

		<div class="year-row">
			{#each years as year (year)}
				<button
					type="button"
					class="year-pick"
					class:active={year === exam.year}
					onclick={() => (selectedYear = year)}
				>
					{year}
				</button>
			{/each}
		</div>
		<p class="year-label">
			{years.includes(2023) ? 'Practice papers' : 'Training papers · 2024 and 2025'}
		</p>

		<div class="passages">
			{#each exam.passages as passage (passage.slug)}
				{@const prog = getPassageProgress(passage)}
				<button
					class="passage-card r-card offset-card edge-hair"
					onclick={() => openPassage(exam, passage)}
				>
					<div class="passage-header">
						<div class="passage-icon">
							<Icon name="book-open-cover" size={16} color="var(--color-lavender-deep)" />
						</div>
						<div class="passage-info">
							<span class="passage-name">{passage.name}</span>
							<span class="passage-meta">{passage.questions.length} questions</span>
						</div>
						<div class="passage-progress">
							{#if prog.answered === 0}<Pill variant="lavender" size="sm">New</Pill>
							{:else if prog.answered === prog.total}<Pill variant="teal" size="sm"
									><Icon name="check" size={12} />{prog.correct}/{prog.total}</Pill
								>
							{:else}<Pill variant="peach" size="sm">{prog.answered}/{prog.total}</Pill>{/if}
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
			<p class="stat-hint">{BOOKLET_PASS_LABEL}</p>
			{#if examProg.answered === examProg.total && examProg.total > 0}
				{#if passedSitting(examProg.correct, exam)}<Pill variant="teal" size="sm"
						><Icon name="check" size={12} />Sitting passes</Pill
					>
				{:else}<Pill variant="rose" size="sm">Need {passLineFor(exam) - examProg.correct} more</Pill
					>{/if}
			{/if}
		</div>
	</div>
{:else if view === 'reading' && activePassage && activeExam}
	<div class="reading">
		<button class="back-btn" onclick={backToExams}>
			<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
			<span>Back</span>
		</button>
		<PracticeBook years={bookYears} />
		<h2 class="reading-title">{activePassage.name}</h2>
		<p class="reading-intro">{activePassage.intro}</p>
		<p class="time-hint">About {MINUTES_PER_TEXT} minutes for this text. {BOOKLET_PASS_LABEL}</p>
		<div class="time-dock">
			<TimeBox
				totalSeconds={MINUTES_PER_TEXT * 60}
				warnSeconds={120}
				label={`~${MINUTES_PER_TEXT} min`}
			/>
		</div>

		<Card variant="white" class="passage-text-card">
			<span class="passage-sparkle">
				<Doodle name="spark-sparkle-26" size={22} color="var(--color-rose-deep)" tilt={-8} />
			</span>
			{#key readingPage}
				<div class="passage-text page-fade">
					{#each pageParagraphs as para, localPi (pageStart + localPi)}
						{@const pi = pageStart + localPi}
						{#if para.type === 'title'}
							<h2 class="passage-title">
								{#each para.sentences as sentence, si (si)}
									<span
										class="passage-sentence"
										class:selected={selectedKey === `${pi}-${si}`}
										onclick={(e) => handleSentenceClick(e, pi, si, sentence)}
										onkeydown={(e) => handleSentenceClick(e, pi, si, sentence)}
										role="button"
										tabindex="0">{sentence}</span
									>
								{/each}
							</h2>
						{:else if para.type === 'heading'}
							<h3 class="passage-heading">
								{#each para.sentences as sentence, si (si)}
									<span
										class="passage-sentence"
										class:selected={selectedKey === `${pi}-${si}`}
										onclick={(e) => handleSentenceClick(e, pi, si, sentence)}
										onkeydown={(e) => handleSentenceClick(e, pi, si, sentence)}
										role="button"
										tabindex="0">{sentence}</span
									>
								{/each}
							</h3>
						{:else}
							<p class="passage-para">
								{#each para.sentences as sentence, si (si)}
									<span
										class="passage-sentence"
										class:selected={selectedKey === `${pi}-${si}`}
										onclick={(e) => handleSentenceClick(e, pi, si, sentence)}
										onkeydown={(e) => handleSentenceClick(e, pi, si, sentence)}
										role="button"
										tabindex="0">{sentence}</span
									>
								{/each}
							</p>
						{/if}
					{/each}
				</div>
			{/key}

			<div class="reading-cameo jit-c">
				<Character who="melody" mood="reading" size={36} />
			</div>
		</Card>

		<Pager
			page={readingPage}
			total={pageTotal}
			onprev={goPrevPage}
			onnext={goNextPage}
			label="Passage pages"
		/>

		<div class="cta-row">
			<span class="cta-arrow">
				<Doodle name="arrow-down-33" size={22} color="var(--color-rose-deep)" tilt={20} />
			</span>
			<button class="start-questions-btn r-pill offset-pill edge-ink-2" onclick={startQuestions}>
				<Icon name="eye" size={18} />
				<span>Answer {activePassage.questions.length} questions</span>
				<Icon name="arrow-right" size={16} />
			</button>
		</div>
	</div>
{:else if view === 'questions' && activePassage && currentQuestion && activeExam}
	<div class="practice">
		<button class="back-btn" onclick={backToReading}>
			<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
			<span>Back to Text</span>
		</button>
		<PracticeBook years={bookYears} />

		<div class="q-counter">
			Question {questionIndex + 1} / {activePassage.questions.length}
			<span class="q-opgave">Question {currentQuestion.vraag}</span>
			<span class="q-sparkle">
				<Doodle name="spark-sparkle-26" size={16} color="var(--color-rose-deep)" tilt={10} />
			</span>
		</div>
		<p class="time-hint">{BOOKLET_PASS_LABEL}</p>

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

		<PassageText
			text={activePassage.text}
			needle={showResult && currentQuestion ? evidenceOf(currentQuestion.id) : null}
		/>

		<Card variant="white" class="question-card">
			<span class="question-sparkle">
				<Doodle name="spark-sparkle-26" size={20} color="var(--color-rose-deep)" tilt={-6} />
			</span>
			<p class="question-text">{currentQuestion.question}</p>
			<div class="options">
				{#each Object.entries(currentQuestion.options) as [opt, text] (opt)}
					<button
						class="option-btn {getOptionClass(opt as LezenAnswer)}"
						onclick={() => selectOption(opt as LezenAnswer)}
						disabled={showResult}
					>
						<span class="option-letter">{opt}</span>
						<span class="option-text">{text}</span>
						{#if showResult && opt === currentQuestion.answer}<Icon
								name="check"
								size={16}
								color="var(--color-teal-deep)"
								class="option-icon"
							/>
						{:else if showResult && opt === selectedAnswer && opt !== currentQuestion.answer}<Icon
								name="xmark"
								size={16}
								color="var(--color-rose-deep)"
								class="option-icon"
							/>{/if}
					</button>
				{/each}
			</div>

			{#if showResult}
				<p class="move-line">{MOVE_LINE[moveOf(currentQuestion.id)]}</p>
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
					{#if questionIndex < activePassage.questions.length - 1}<span>Next question</span><Icon
							name="arrow-right"
							size={16}
						/>
					{:else}<span>Finish</span><Icon name="check" size={16} />{/if}
				</button>
			{/if}
		</Card>
	</div>
{/if}

<style>
	.lezen,
	.reading,
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

	.year-row {
		display: flex;
		gap: 8px;
	}
	.year-pick {
		flex: 1;
		border-radius: 14px;
		padding: 8px 4px;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		border: 3px solid var(--color-ink);
		background: #fff;
		cursor: pointer;
	}
	.year-pick.active {
		background: color-mix(in srgb, var(--color-lavender) 55%, white);
	}
	.year-label {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-text);
	}
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

	/* Reading view */
	.reading-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
	}
	.reading-intro {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: -0.25rem 0 0;
		line-height: 1.4;
	}
	.time-hint {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: 0;
		line-height: 1.4;
	}
	.time-dock {
		position: sticky;
		top: 0;
		z-index: 5;
		padding: 8px 0;
		background: color-mix(in srgb, var(--color-cream, #fff8f4) 92%, white);
	}

	:global(.passage-text-card) {
		position: relative;
	}
	.passage-sparkle {
		position: absolute;
		top: -10px;
		right: 14px;
		line-height: 0;
		pointer-events: none;
	}
	.reading-cameo {
		position: absolute;
		right: 12px;
		bottom: 10px;
		line-height: 0;
		pointer-events: none;
	}
	.passage-text {
		font-family: var(--font-sans);
		font-size: 19px;
		line-height: 1.75;
		color: var(--color-text);
	}
	.page-fade {
		animation: pageFade 180ms ease-out;
	}
	@keyframes pageFade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.page-fade {
			animation: none;
		}
	}
	.passage-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		line-height: 1.3;
		color: var(--color-ink);
		margin: 0 0 1.2em;
	}
	.passage-heading {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-text);
		margin: 1.6em 0 0.5em;
	}
	.passage-para {
		margin: 0 0 1em;
	}
	.passage-para:last-child {
		margin-bottom: 0;
	}
	.passage-sentence {
		cursor: pointer;
		border-radius: 3px;
		padding: 1px 0;
		transition:
			background 0.15s,
			color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}
	.passage-sentence:hover {
		background: color-mix(in srgb, var(--color-lavender) 16%, transparent);
	}
	.passage-sentence.selected {
		background: color-mix(in srgb, var(--color-lavender) 28%, transparent);
		color: var(--color-lavender-deep);
	}
	.passage-sentence:focus-visible {
		outline: 2px solid var(--color-lavender-deep);
		outline-offset: 2px;
	}
	.tts-popover {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: color-mix(in srgb, var(--color-peach) 55%, white);
		border: 2px solid var(--color-ink);
		border-radius: 14px;
		box-shadow: var(--shadow-offset-pill);
		z-index: 10;
		animation: popIn 0.15s ease-out;
	}
	@keyframes popIn {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.cta-row {
		position: relative;
	}
	.cta-arrow {
		position: absolute;
		left: 18px;
		top: -20px;
		line-height: 0;
		pointer-events: none;
	}
	.start-questions-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 14px;
		background: var(--color-rose);
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		cursor: pointer;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}
	.start-questions-btn:hover {
		background: var(--color-rose-deep);
		color: var(--color-cream);
	}
	.start-questions-btn:active {
		transform: scale(var(--press-scale));
	}

	/* Practice view */
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

	.question-sparkle {
		position: absolute;
		top: -10px;
		right: 14px;
		line-height: 0;
		pointer-events: none;
	}

	.question-text {
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--color-text);
		margin: 0;
	}
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
