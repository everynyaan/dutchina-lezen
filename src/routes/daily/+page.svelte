<script lang="ts">
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import { generateDailySession } from '$lib/daily/generator';
	import { currentGateFromState, weekSetNeedsRegen } from '$lib/gates/gates';
	import type { DailyQuestion } from '$lib/daily/types';
	import { playSfx } from '$lib/sound/sfx';
	import { getISOWeekKey } from '$lib/time/week';
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import QuestionView from '$lib/components/question/QuestionView.svelte';
	import { resolve } from '$app/paths';
	import { addToast } from '$lib/components/toastStore';
	import {
		maybeAdvanceGates,
		recordWeekCompletion,
		unlockToastMessage,
		weekEntryFromSession
	} from '$lib/gates/mastery';
	import { getTodayDate } from '$lib/match/engine';
	import {
		applyHomeworkSwap,
		emptySwaps,
		swapsForToday,
		undoHomeworkSwap
	} from '$lib/quiz/swap';

	const ctx = getGameContext();
	let replayNoAward = $state(false);

	// ============================================================
	// SESSION LIFECYCLE
	// On mount: if there's an active session for today, resume.
	// Otherwise generate a fresh one and persist it to state.
	// ============================================================
	let session = $state<DailyQuestion[]>([]);
	let currentIndex = $state(0);
	let completed = $state(false);
	let loadingState = $state(true);

	// Per-question UI state
	let selectedIndex = $state<number | null>(null);
	let selectedLetter = $state<string | null>(null);
	let showResult = $state(false);
	let wasCorrect = $state(false);
	let expandedLezenPassage = $state(false);

	let currentQuestion = $derived<DailyQuestion | null>(
		session.length > 0 && currentIndex < session.length ? session[currentIndex] : null
	);

	// Reset per-question UI state when advancing to a new question.
	$effect(() => {
		// React to currentIndex changing
		void currentIndex;
		selectedIndex = null;
		selectedLetter = null;
		showResult = false;
		wasCorrect = false;
		expandedLezenPassage = false;
	});

	onMount(() => {
		// dailyHomework.date holds an ISO week key (e.g. "2026-W28"); the
		// weekly set persists until the week rolls over. A stale pre-weekly
		// day-value never matches a week key, so it regenerates cleanly.
		const thisWeek = getISOWeekKey();
		const stored = ctx.state.dailyHomework;

		const gate = currentGateFromState(ctx.state);
		const staleExam =
			stored.date === thisWeek &&
			Array.isArray(stored.questions) &&
			stored.questions.length > 0 &&
			weekSetNeedsRegen(stored.questions as DailyQuestion[], gate);

		if (
			stored.date === thisWeek &&
			Array.isArray(stored.questions) &&
			stored.questions.length > 0 &&
			!staleExam
		) {
			// Resume in-progress session.
			session = stored.questions as DailyQuestion[];
			currentIndex = stored.currentIndex;
			completed = stored.completed;
			ctx.state.dailyHomework.swaps = swapsForToday(stored.swaps, getTodayDate());
			if (stored.completed) persistWeekLog();
		} else {
			// New session, or one-shot regen when a stale week still has NT2.
			const fresh = generateDailySession(ctx.state.rank, undefined, gate);
			session = fresh;
			currentIndex = 0;
			completed = false;
			ctx.state.dailyHomework = {
				date: thisWeek,
				questions: fresh,
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: swapsForToday(stored.swaps, getTodayDate())
			};
		}
		loadingState = false;
		if (!completed) playSfx('session_start');
	});

	// ============================================================
	// ANSWER HANDLERS
	// ============================================================

	function persistWeekLog() {
		const entry = weekEntryFromSession(
			currentGateFromState(ctx.state),
			ctx.state.dailyHomework
		);
		if (!entry) return;
		ctx.state.gates = recordWeekCompletion(ctx.state.gates, entry);
		const next = maybeAdvanceGates(ctx.state.gates, ctx.state.cardReviews);
		ctx.state.gates = next.gates;
		if (next.unlocked) {
			addToast(unlockToastMessage(next.unlocked), 'var(--color-teal-deep)');
		}
	}

	function applyAnswer(correct: boolean) {
		showResult = true;
		wasCorrect = correct;

		if (replayNoAward) {
			playSfx(correct ? 'correct' : 'wrong');
			return;
		}

		// Persist result to state
		ctx.state.dailyHomework.results[currentIndex] = correct;

		if (correct) {
			playSfx('correct');
			const result = ctx.applyLpEvent({ type: 'daily_correct' });
			ctx.state.dailyHomework.lpEarned += Math.max(0, result.delta);
		} else {
			playSfx('wrong');
		}
	}

	function selectIndexAnswer(idx: number, correctIdx: number) {
		if (showResult || !currentQuestion) return;
		selectedIndex = idx;
		applyAnswer(idx === correctIdx);
	}

	function selectLetterAnswer(letter: string, correctLetter: string) {
		if (showResult || !currentQuestion) return;
		selectedLetter = letter;
		applyAnswer(letter === correctLetter);
	}

	function handleAnswer(key: number | string) {
		if (!currentQuestion) return;
		switch (currentQuestion.type) {
			case 'match':
			case 'recall':
			case 'conversation':
				selectIndexAnswer(key as number, currentQuestion.correctIndex);
				break;
			case 'lezen':
			case 'luisteren':
				selectLetterAnswer(key as string, currentQuestion.answer);
				break;
		}
	}

	function nextQuestion() {
		if (!session.length) return;

		const last = currentIndex >= session.length - 1;
		if (last) {
			completed = true;
			if (!replayNoAward) {
				ctx.state.dailyHomework.completed = true;
				ctx.state.dailyHomework.currentIndex = session.length;
				ctx.updateMissions('daily_complete', 1);
				playSfx('daily_homework_complete');
				persistWeekLog();
			}
		} else {
			currentIndex = currentIndex + 1;
			ctx.state.dailyHomework.currentIndex = currentIndex;
		}
	}

	// ============================================================
	// SUMMARY
	// ============================================================
	let totalCorrect = $derived(
		Object.values(ctx.state.dailyHomework.results).filter((v) => v === true).length
	);

	let reactorMood = $derived(showResult ? (wasCorrect ? 'hehe' : 'shocked') : 'talk');
	let reactorAnimated = $derived(showResult && wasCorrect);
	let sessionRatio = $derived(session.length > 0 ? totalCorrect / session.length : 0);
	let allCorrect = $derived(session.length > 0 && totalCorrect === session.length);
	let lowScore = $derived(sessionRatio <= 0.4);
	let summaryMood = $derived.by(() => {
		if (allCorrect) return 'hehe';
		if (lowScore) return 'defeated';
		return 'wink';
	});
	let summaryAnimated = $derived(allCorrect || lowScore);

	function restartSession() {
		replayNoAward =
			ctx.state.dailyHomework.completed || ctx.state.dailyHomework.lpEarned > 0;
		const fresh = generateDailySession(
			ctx.state.rank,
			undefined,
			currentGateFromState(ctx.state)
		);
		session = fresh;
		currentIndex = 0;
		completed = false;
		playSfx('session_start');
	}

	function skipQuestion() {
		if (completed || showResult || replayNoAward) return;
		const today = getTodayDate();
		const result = applyHomeworkSwap({
			questions: session,
			index: currentIndex,
			results: ctx.state.dailyHomework.results,
			completed: ctx.state.dailyHomework.completed,
			swaps: ctx.state.dailyHomework.swaps,
			today,
			gate: currentGateFromState(ctx.state),
			rank: ctx.state.rank
		});
		if (!result.ok) {
			if (result.reason === 'capped') {
				addToast("That's all for today.", 'var(--color-peach-deep)');
			}
			return;
		}
		session = result.questions;
		ctx.state.dailyHomework.questions = result.questions;
		ctx.state.dailyHomework.swaps = result.swaps;
		const undoIndex = currentIndex;
		const previous = result.previous;
		const previousId = result.previousId;
		addToast('Question swapped.', 'var(--color-teal-deep)', {
			label: 'Undo',
			run: () => {
				const undone = undoHomeworkSwap(
					session,
					undoIndex,
					ctx.state.dailyHomework.swaps ?? emptySwaps(),
					previous,
					previousId,
					today
				);
				session = undone.questions;
				ctx.state.dailyHomework.questions = undone.questions;
				ctx.state.dailyHomework.swaps = undone.swaps;
				return true;
			}
		});
	}
</script>

<div class="daily-page">
	{#if loadingState}
		<div class="loading">Loading this week's set…</div>
	{:else if completed}
		<div class="summary-view">
			<div class="summary-card ink-card pop-in">
				<div class="summary-squiggle" aria-hidden="true">
					<Doodle name="shape-swirl-loops-4" size={60} color="var(--color-orchid)" tilt={-3} />
				</div>
				<div class="summary-reactor">
					<Character who="kuromi" mood={summaryMood} size={64} animated={summaryAnimated} />
					{#if lowScore}
						<div class="melody-cameo">
							<Character who="melody" mood="smile" size={32} animated={false} />
						</div>
					{/if}
				</div>
				<div class="summary-eyebrow">Weekly Practice</div>
				<div class="summary-title">Done for this week!</div>
				<div class="summary-score">
					<span class="score-num">{totalCorrect}</span>
					<span class="score-sep">/</span>
					<span class="score-den">{session.length}</span>
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
							restartSession();
						}}
					>
						Practice Again
					</button>
				</div>
			</div>
		</div>
	{:else if currentQuestion}
		<div class="daily-chrome r-card offset-ink">
			<div class="chrome-arrow" aria-hidden="true">
				<Doodle name="arrow-9" size={26} color="var(--color-orchid)" tilt={18} />
			</div>
			<div class="daily-topbar">
				<a class="chrome-back" href={resolve('/')} aria-label="Back to Home">
					<Icon name="chevron-left" size={18} color="var(--color-cream)" />
				</a>
				<div class="chrome-identity">
					<span class="identity-badge">
						<Icon name="calendar-check" size={13} color="var(--color-cream)" />
					</span>
					<span class="identity-label">Week set</span>
					<span class="chrome-squiggle" aria-hidden="true">
						<Doodle name="shape-swirl-loops-4" size={40} color="var(--color-orchid)" tilt={-2} />
					</span>
				</div>
			</div>
			<div class="daily-progress">
				<span class="progress-label">Weekly {currentIndex + 1} / {session.length}</span>
				<div class="progress-track">
					<div
						class="progress-fill"
						style="width: {((currentIndex + (showResult ? 1 : 0)) / session.length) * 100}%"
					></div>
				</div>
			</div>
			{#if !showResult && !replayNoAward}
				<button type="button" class="skip-btn" onclick={skipQuestion}>Skip</button>
			{/if}
		</div>

		<div class="quiz-hero-wrap">
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
				{#if currentIndex >= session.length - 1}
					<span>Finish</span>
					<Icon name="check" size={16} color="var(--color-ink)" />
				{:else}
					<span>Next</span>
					<Icon name="arrow-right" size={16} color="var(--color-ink)" />
				{/if}
			</button>
		{/if}
	{:else}
		<div class="error-card qcard-plain">
			<p class="error-text">No weekly session available. Please try again.</p>
		</div>
	{/if}
</div>

<style>
	.daily-page {
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

	.daily-chrome {
		position: relative;
		overflow: visible;
		padding: 12px 14px 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-ink) 80%, white) 0%,
			var(--color-ink) 62%
		);
	}

	.chrome-arrow {
		position: absolute;
		top: -12px;
		right: 14px;
		pointer-events: none;
		line-height: 0;
	}

	.daily-topbar {
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
		background: color-mix(in srgb, white 18%, transparent);
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
		background: color-mix(in srgb, var(--color-orchid) 25%, transparent);
		flex-shrink: 0;
	}

	.identity-label {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-cream);
		letter-spacing: -0.01em;
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
		color: var(--color-cream);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
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
		width: 40px !important;
		height: 9px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.daily-progress {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.progress-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--color-cream) 78%, transparent);
		text-transform: uppercase;
	}

	.progress-track {
		height: 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-orchid) 18%, transparent);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--color-orchid);
		transition: width 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
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
		background: var(--color-orchid);
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

	.ink-card {
		position: relative;
		text-align: center;
		max-width: 360px;
		width: 100%;
		padding: 36px 28px 32px;
		overflow: visible;
		border-radius: 22px;
		box-shadow: var(--shadow-offset-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-ink) 80%, white) 0%,
			var(--color-ink) 62%
		);
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
		color: color-mix(in srgb, var(--color-cream) 78%, transparent);
		margin-bottom: 6px;
	}

	.summary-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-cream);
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
		/* Deliberate exception to the type scale (D10): dramatic display numeral for the summary screen. */
		font-size: 52px;
		font-weight: 700;
		color: var(--color-orchid);
	}

	.score-sep,
	.score-den {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		color: color-mix(in srgb, var(--color-cream) 78%, transparent);
	}

	.score-label {
		font-size: var(--text-small);
		color: color-mix(in srgb, var(--color-cream) 78%, transparent);
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
		gap: 5px;
		padding: 6px 14px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--color-ink);
		background: color-mix(in srgb, var(--color-orchid) 35%, white);
		border: 1.5px solid color-mix(in srgb, var(--color-orchid) 55%, transparent);
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
		border: 2px solid var(--color-cream);
		border-radius: 999px;
		color: var(--color-cream);
		background: none;
		text-decoration: none;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.summary-btn:active {
		transform: scale(var(--press-scale));
	}

	.summary-btn-primary {
		background: var(--color-orchid);
		color: var(--color-ink);
		border-color: var(--color-orchid);
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
		.pop-in {
			animation: none;
		}
	}
</style>
