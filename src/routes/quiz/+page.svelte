<script lang="ts">
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { loadRustyWords } from '$lib/fresh/freshSource';
	import { WORD_POOL } from '$lib/data/wordPool';
	import { STORIES } from '$lib/conversation/CONVERSATION_CONTENT';
	import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
	import {
		currentGateFromState,
		dailyQuizNeedsRegen,
		examInHomework,
		getStoriesUpToGate,
		getWordsUpToGate,
		type GateId
	} from '$lib/gates/gates';
	import {
		selectQuestionIds,
		buildQuestions,
		type QuizSourceData,
		type QuizConversationSource,
		type QuizLezenSource
	} from '$lib/quiz/generator';
	import type { QuizBuiltQuestion, QuizQuestion } from '$lib/quiz/types';
	import { playSfx } from '$lib/sound/sfx';
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import QuestionView from '$lib/components/question/QuestionView.svelte';
	import TypedRecallQuestion from '$lib/components/question/TypedRecallQuestion.svelte';
	import { resolve } from '$app/paths';
	import { addToast } from '$lib/components/toastStore';
	import { commitDailyQuiz, unlockToastMessage } from '$lib/gates/mastery';
	import {
		applyQuizSwap,
		emptySwaps,
		rebuildQuizAt,
		swapsForToday,
		undoQuizSwap
	} from '$lib/quiz/swap';
	const ctx = getGameContext();
	let sourceData = $state<QuizSourceData | null>(null);
	let quizSeed = $state('');
	let engineGate = $state<GateId>(1);
	let replayNoAward = $state(false);

	let questions = $state<QuizBuiltQuestion[]>([]);
	let currentIndex = $state(0);
	let completed = $state(false);
	let loadingState = $state(true);

	// Per-question UI state
	let selectedIndex = $state<number | null>(null);
	let selectedLetter = $state<string | null>(null);
	let submittedAnswer = $state<string | null>(null);
	let showResult = $state(false);
	let wasCorrect = $state(false);
	let expandedLezenPassage = $state(false);

	let currentQuestion = $derived<QuizQuestion | null>(
		questions.length > 0 && currentIndex < questions.length
			? questions[currentIndex].question
			: null
	);

	let totalCorrect = $derived(
		Object.values(ctx.state.dailyQuiz.results).filter((v) => v === true).length
	);

	let reactorMood = $derived(showResult ? (wasCorrect ? 'hehe' : 'shocked') : 'talk');
	let reactorAnimated = $derived(showResult && wasCorrect);
	let allCorrect = $derived(questions.length > 0 && totalCorrect === questions.length);
	let lowScore = $derived(totalCorrect <= 2);
	let summaryMood = $derived.by(() => {
		if (allCorrect) return 'excited';
		if (lowScore) return 'defeated';
		return 'wink';
	});
	let summaryAnimated = $derived(allCorrect || lowScore);

	// Reset per-question UI state when advancing to a new question.
	$effect(() => {
		void currentIndex;
		selectedIndex = null;
		selectedLetter = null;
		submittedAnswer = null;
		showResult = false;
		wasCorrect = false;
		expandedLezenPassage = false;
	});

	function collectFromStories(
		stories: typeof STORIES,
		chapterFilter: ((id: string) => boolean) | null
	): QuizConversationSource[] {
		const out: QuizConversationSource[] = [];
		for (const story of stories) {
			for (const chapter of story.chapters) {
				if (chapterFilter && !chapterFilter(chapter.id)) continue;
				for (const question of chapter.questions) {
					out.push({
						question,
						chapterId: chapter.id,
						chapterText: chapter.text
					});
				}
			}
		}
		return out;
	}

	/** Precedence pool used only for selection (new day). Never climbs to all stories. */
	function buildConversationPoolForSelection(
		gate: ReturnType<typeof currentGateFromState>,
		readChapters: string[]
	): QuizConversationSource[] {
		const storiesInGate = getStoriesUpToGate(gate);
		const readSet = new Set(readChapters);
		let pool = collectFromStories(storiesInGate, (id) => readSet.has(id));
		if (pool.length === 0) {
			pool = collectFromStories(storiesInGate, null);
		}
		// Empty Gate 1 story pool stays empty — selectQuestionIds tops up with vocab.
		return pool;
	}

	function buildLezenPool(includeExam: boolean): QuizLezenSource[] {
		if (!includeExam) return [];
		const out: QuizLezenSource[] = [];
		for (const exam of LEZEN_EXAMS) {
			for (const passage of exam.passages) {
				for (const question of passage.questions) {
					out.push({
						question,
						passageName: passage.name,
						passageText: passage.text
					});
				}
			}
		}
		return out;
	}

	onMount(async () => {
		const today = getTodayDate();
		const gate = currentGateFromState(ctx.state);
		const gateWords = getWordsUpToGate(gate);
		const rustyWords = await loadRustyWords(today, 40, gateWords);
		const candidateWords = gateWords;
		const allWords = WORD_POOL;
		const lezenPool = buildLezenPool(examInHomework(gate));
		// Rebuild catalog: in-gate stories only. G1 is empty on purpose.
		const conversationPoolFull = collectFromStories(getStoriesUpToGate(gate), null);

		const seed = `${ctx.activeProfile}|${today}`;

		const staleExam =
			ctx.state.dailyQuiz.date === today &&
			dailyQuizNeedsRegen(ctx.state.dailyQuiz.questionIds, gate);

		if (ctx.state.dailyQuiz.date !== today || staleExam) {
			// Selection uses the precedence pool (read chapters first, then rank, then all).
			const selectionData: QuizSourceData = {
				rustyWords,
				candidateWords,
				allWords,
				conversationPool: buildConversationPoolForSelection(
					gate,
					ctx.state.conversation.readChapters
				),
				lezenPool
			};
			const ids = selectQuestionIds(selectionData, seed, ctx.state.appConfig.quiz.focusCategories);
			ctx.state.dailyQuiz = {
				date: today,
				questionIds: ids,
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: swapsForToday(ctx.state.dailyQuiz.swaps, today)
			};
		}

		// Rebuild always uses the full conversation pool so persisted ids resolve.
		const data: QuizSourceData = {
			rustyWords,
			candidateWords,
			allWords,
			conversationPool: conversationPoolFull,
			lezenPool
		};
		sourceData = data;
		quizSeed = seed;
		engineGate = gate;
		const built = buildQuestions(ctx.state.dailyQuiz.questionIds, data, seed);
		questions = built;

		// Restore progress: first unanswered question, or summary if complete.
		const results = ctx.state.dailyQuiz.results;
		if (ctx.state.dailyQuiz.completed) {
			completed = true;
			currentIndex = built.length;
			persistQuizLog(engineGate);
		} else {
			const firstUnanswered = built.findIndex((entry) => !(entry.id in results));
			if (firstUnanswered === -1) {
				// All questions answered; show summary without re-awarding LP.
				completed = true;
				currentIndex = built.length;
				ctx.state.dailyQuiz.completed = true;
				persistQuizLog(engineGate);
			} else {
				currentIndex = firstUnanswered;
				completed = false;
			}
		}

		loadingState = false;
		if (!completed) playSfx('session_start');
	});

	function persistQuizLog(gate: GateId) {
		const next = commitDailyQuiz(
			ctx.state.gates,
			gate,
			ctx.state.dailyQuiz,
			ctx.state.cardReviews
		);
		if (!next.entry) return;
		ctx.state.gates = next.gates;
		if (next.unlocked) {
			addToast(unlockToastMessage(next.unlocked), 'var(--color-teal-deep)');
		}
	}

	function persistAnswer(correct: boolean) {
		showResult = true;
		wasCorrect = correct;

		if (replayNoAward) {
			playSfx(correct ? 'correct' : 'wrong');
			return;
		}

		const idAtThisIndex = questions[currentIndex]?.id;
		if (idAtThisIndex) {
			ctx.state.dailyQuiz.results[idAtThisIndex] = correct;
		}

		if (correct) {
			playSfx('correct');
		} else {
			playSfx('wrong');
		}

		// Completion: last question and not already completed.
		const isLast = currentIndex >= questions.length - 1;
		if (isLast && !ctx.state.dailyQuiz.completed) {
			ctx.state.dailyQuiz.completed = true;
			const r1 = ctx.applyLpEvent({ type: 'quiz_complete' });
			ctx.state.dailyQuiz.lpEarned += Math.max(0, r1.delta);

			const allCorrect = Object.values(ctx.state.dailyQuiz.results).every((v) => v === true);
			if (allCorrect && Object.keys(ctx.state.dailyQuiz.results).length === questions.length) {
				const r2 = ctx.applyLpEvent({ type: 'quiz_perfect' });
				ctx.state.dailyQuiz.lpEarned += Math.max(0, r2.delta);
			}

			playSfx('session_complete');
			persistQuizLog(engineGate);
		}
	}

	function handleAnswer(key: number | string) {
		if (!currentQuestion || showResult) return;
		switch (currentQuestion.type) {
			case 'match':
			case 'conversation':
				selectedIndex = key as number;
				persistAnswer(key === currentQuestion.correctIndex);
				break;
			case 'lezen':
				selectedLetter = key as string;
				persistAnswer(key === currentQuestion.answer);
				break;
			default:
				break;
		}
	}

	function handleTypedAnswer(typedText: string, correct: boolean) {
		if (showResult) return;
		submittedAnswer = typedText;
		persistAnswer(correct);
	}

	function nextQuestion() {
		if (!questions.length) return;
		const last = currentIndex >= questions.length - 1;
		if (last) {
			completed = true;
			if (!ctx.state.dailyQuiz.completed) {
				ctx.state.dailyQuiz.completed = true;
			}
			persistQuizLog(engineGate);
		} else {
			currentIndex = currentIndex + 1;
		}
	}

	function restartQuiz() {
		replayNoAward = ctx.state.dailyQuiz.completed || ctx.state.dailyQuiz.lpEarned > 0;
		currentIndex = 0;
		completed = false;
		playSfx('session_start');
	}

	function skipQuestion() {
		if (!sourceData || completed || showResult) return;
		const today = getTodayDate();
		const result = applyQuizSwap({
			questionIds: ctx.state.dailyQuiz.questionIds,
			index: currentIndex,
			results: ctx.state.dailyQuiz.results,
			completed: ctx.state.dailyQuiz.completed,
			swaps: ctx.state.dailyQuiz.swaps,
			today,
			gate: engineGate,
			data: sourceData,
			seed: quizSeed
		});
		if (!result.ok) {
			if (result.reason === 'capped') {
				addToast("That's all for today.", 'var(--color-peach-deep)');
			}
			return;
		}
		ctx.state.dailyQuiz.questionIds = result.questionIds;
		ctx.state.dailyQuiz.swaps = result.swaps;
		questions = rebuildQuizAt(result.questionIds, sourceData, quizSeed);
		const undoIndex = currentIndex;
		const previousId = result.previousId;
		addToast('Question swapped.', 'var(--color-teal-deep)', {
			label: 'Undo',
			run: () => {
				if (!sourceData) return false;
				const undone = undoQuizSwap(
					ctx.state.dailyQuiz.questionIds,
					undoIndex,
					ctx.state.dailyQuiz.swaps ?? emptySwaps(),
					previousId,
					today
				);
				ctx.state.dailyQuiz.questionIds = undone.questionIds;
				ctx.state.dailyQuiz.swaps = undone.swaps;
				questions = rebuildQuizAt(undone.questionIds, sourceData, quizSeed);
				return true;
			}
		});
	}
</script>

<div class="quiz-page">
	{#if loadingState}
		<div class="loading">Loading today's quiz…</div>
	{:else if completed}
		<div class="summary-view">
			<div class="summary-card qcard-plain pop-in">
				<div class="summary-squiggle" aria-hidden="true">
					<Doodle name="shape-swirl-loops-4" size={64} color="var(--color-rose-deep)" tilt={-3} />
				</div>
				<div class="summary-reactor">
					<Character who="kuromi" mood={summaryMood} size={64} animated={summaryAnimated} />
					{#if allCorrect}
						<div class="confetti" aria-hidden="true">
							<span class="confetti-doodle confetti-1">
								<Doodle
									name="spark-sparkle-26"
									size={22}
									color="var(--color-teal-deep)"
									tilt={-8}
								/>
							</span>
							<span class="confetti-doodle confetti-2">
								<Doodle
									name="spark-sparks-sparkle-stars-30"
									size={20}
									color="var(--color-rose-deep)"
									tilt={12}
								/>
							</span>
						</div>
					{/if}
					{#if lowScore}
						<div class="melody-cameo">
							<Character who="melody" mood="smile" size={32} animated={false} />
						</div>
					{/if}
				</div>
				<div class="summary-eyebrow">Daily Quiz</div>
				<div class="summary-title">Quiz complete!</div>
				<div class="summary-score">
					<span class="score-num">{totalCorrect}</span>
					<span class="score-sep">/</span>
					<span class="score-den">{questions.length}</span>
				</div>
				<div class="score-label">correct</div>

				<div class="summary-stats">
					<span class="stat-chip r-chip offset-pill">{totalCorrect} correct</span>
				</div>

				<div class="summary-actions">
					<a class="summary-btn summary-btn-primary" href={resolve('/')}>Home</a>
					<button
						class="summary-btn"
						onclick={() => {
							playSfx('button_tap');
							restartQuiz();
						}}
					>
						Practice Again
					</button>
				</div>
			</div>
		</div>
	{:else if currentQuestion}
		<div class="quiz-chrome r-card offset-card--soft">
			<div class="chrome-sparkle" aria-hidden="true">
				<Doodle name="spark-sparkle-26" size={28} color="var(--color-teal-deep)" tilt={-6} />
			</div>
			<div class="quiz-topbar">
				<a class="chrome-back" href={resolve('/')} aria-label="Back to Home">
					<Icon name="chevron-left" size={18} color="var(--color-teal-deep)" />
				</a>
				<div class="chrome-identity">
					<span class="identity-badge">
						<Icon name="check" size={13} color="var(--color-teal-deep)" />
					</span>
					<span class="identity-label">Daily Quiz</span>
					<span class="chrome-squiggle" aria-hidden="true">
						<Doodle name="shape-swirl-loops-4" size={44} color="var(--color-teal-deep)" tilt={-2} />
					</span>
				</div>
			</div>
			<div
				class="quiz-dots"
				role="img"
				aria-label="Question {currentIndex + 1} of {questions.length}"
			>
				{#each questions as q, i (q.id)}
					<span
						class="dot"
						class:dot-current={i === currentIndex && !showResult}
						class:dot-correct={(i < currentIndex || (i === currentIndex && showResult)) &&
							ctx.state.dailyQuiz.results[q.id] === true}
						class:dot-wrong={(i < currentIndex || (i === currentIndex && showResult)) &&
							ctx.state.dailyQuiz.results[q.id] === false}
					></span>
				{/each}
			</div>
			{#if !showResult}
				<button type="button" class="skip-btn" onclick={skipQuestion}>Skip</button>
			{/if}
		</div>

		<div class="quiz-hero-wrap">
			{#if currentQuestion.type === 'quiz-recall'}
				<TypedRecallQuestion
					question={currentQuestion}
					{showResult}
					{submittedAnswer}
					onanswer={handleTypedAnswer}
				/>
			{:else}
				<QuestionView
					question={currentQuestion}
					{showResult}
					{selectedIndex}
					{selectedLetter}
					onanswer={handleAnswer}
					expandedLezen={expandedLezenPassage}
					ontoggleexpand={() => {
						expandedLezenPassage = !expandedLezenPassage;
					}}
				/>
			{/if}
			<div class="reactor" aria-hidden="true">
				<Character who="kuromi" mood={reactorMood} size={32} animated={reactorAnimated} />
			</div>
		</div>

		{#if showResult}
			<Sticker variant={wasCorrect ? 'tip' : 'trap'}>
				<span class="result-line">
					{#if wasCorrect}
						<Icon name="check" size={16} color="var(--color-ink)" /> Correct!
					{:else}
						<Icon name="xmark" size={16} color="var(--color-ink)" /> Not quite.
					{/if}
				</span>
			</Sticker>

			<button class="next-btn" onclick={nextQuestion}>
				{#if currentIndex >= questions.length - 1}
					<span>Finish</span>
					<Icon name="check" size={16} color="var(--color-teal-deep)" />
				{:else}
					<span>Next</span>
					<Icon name="arrow-right" size={16} color="var(--color-teal-deep)" />
				{/if}
			</button>
		{/if}
	{:else}
		<div class="error-card qcard-plain">
			<p class="error-text">No quiz available right now. Try again later.</p>
			<a class="summary-btn summary-btn-primary" href={resolve('/')}>Home</a>
		</div>
	{/if}
</div>

<style>
	.quiz-page {
		padding: 0.5rem 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
		color: var(--color-muted-ink);
	}

	.quiz-chrome {
		position: relative;
		overflow: visible;
		padding: 12px 14px 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.chrome-sparkle {
		position: absolute;
		top: -10px;
		right: 12px;
		pointer-events: none;
		line-height: 0;
	}

	.quiz-topbar {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.chrome-back {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		flex-shrink: 0;
		background: color-mix(in srgb, white 55%, transparent);
		text-decoration: none;
		transition: transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.chrome-back:active {
		transform: scale(var(--press-scale));
	}

	.chrome-identity {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6px;
		padding-bottom: 4px;
	}

	.identity-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: color-mix(in srgb, white 60%, transparent);
		flex-shrink: 0;
	}

	.identity-label {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-teal-deep);
		letter-spacing: -0.01em;
	}

	.chrome-squiggle {
		position: absolute;
		left: 0;
		bottom: -8px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.chrome-squiggle :global(.doodle) {
		width: 44px !important;
		height: 10px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.quiz-dots {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: color-mix(in srgb, white 45%, transparent);
		border: 1.5px solid color-mix(in srgb, var(--color-teal-deep) 45%, transparent);
		transition:
			transform 0.15s ease,
			background 0.15s ease;
	}

	.dot-current {
		width: 13px;
		height: 13px;
		background: white;
		border: 2px solid var(--color-teal-deep);
	}

	.dot-correct {
		background: var(--color-teal-deep);
		border-color: var(--color-teal-deep);
	}

	.dot-wrong {
		background: var(--color-rose-deep);
		border-color: var(--color-rose-deep);
	}

	.skip-btn {
		align-self: flex-end;
		margin-top: 4px;
		padding: 4px 10px;
		border: none;
		background: none;
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-teal-deep);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.quiz-hero-wrap {
		position: relative;
	}

	.reactor {
		position: absolute;
		top: -14px;
		right: -8px;
		z-index: 2;
		pointer-events: none;
		line-height: 0;
	}

	.result-line {
		display: flex;
		align-items: center;
		gap: 8px;
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
		padding: 14px;
		background: var(--color-teal);
		color: var(--color-ink);
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition: filter 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.next-btn:hover {
		filter: brightness(0.96);
	}

	.next-btn:active {
		transform: scale(var(--press-scale));
	}

	.summary-view {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 55vh;
	}

	.qcard-plain {
		background: var(--color-s1);
		border: 2px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--shadow-offset-card);
	}

	.summary-card {
		position: relative;
		text-align: center;
		max-width: 360px;
		width: 100%;
		padding: 36px 28px 32px;
		overflow: visible;
	}

	.summary-squiggle {
		position: absolute;
		top: -10px;
		left: 24px;
		pointer-events: none;
		line-height: 0;
	}

	.summary-reactor {
		position: relative;
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
	}

	.confetti {
		position: absolute;
		inset: -10px -10px auto -10px;
		pointer-events: none;
	}

	.confetti-doodle {
		position: absolute;
		animation: confetti-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	.confetti-1 {
		top: -6px;
		left: 6px;
	}

	.confetti-2 {
		top: 4px;
		right: 6px;
		animation-delay: 80ms;
	}

	@keyframes confetti-pop {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.melody-cameo {
		position: absolute;
		bottom: -6px;
		right: calc(50% - 46px);
		pointer-events: none;
		line-height: 0;
	}

	.summary-eyebrow {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin-bottom: 6px;
	}

	.summary-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		margin-bottom: 18px;
	}

	.summary-score {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 4px;
		margin-bottom: 4px;
	}

	.score-num {
		font-family: var(--font-display);
		/* Deliberate exception to the type scale: dramatic display numeral for the summary screen. */
		font-size: 52px;
		font-weight: 700;
		color: var(--color-teal-deep);
	}

	.score-sep,
	.score-den {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		color: var(--color-muted-ink);
	}

	.score-label {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin-bottom: 14px;
	}

	.summary-stats {
		display: flex;
		justify-content: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 22px;
	}

	.stat-chip {
		display: inline-flex;
		align-items: center;
		padding: 6px 14px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--color-teal-deep);
		background: color-mix(in srgb, var(--color-teal) 35%, white);
		border: 1.5px solid color-mix(in srgb, var(--color-teal-deep) 30%, transparent);
	}

	.summary-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.summary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px 14px;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
		text-decoration: none;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		background: color-mix(in srgb, white 70%, var(--color-teal));
		color: var(--color-ink);
		-webkit-tap-highlight-color: transparent;
	}

	.summary-btn:active {
		transform: scale(var(--press-scale));
	}

	.summary-btn-primary {
		background: var(--color-teal);
		color: var(--color-ink);
	}

	.summary-btn-primary:hover {
		filter: brightness(0.96);
	}

	.error-card {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: center;
		padding: 24px;
	}

	.error-text {
		color: var(--color-muted-ink);
		font-size: var(--text-base);
	}

	@media (prefers-reduced-motion: reduce) {
		.confetti-doodle {
			animation: none;
		}
		.pop-in {
			animation: none;
		}
	}
</style>
