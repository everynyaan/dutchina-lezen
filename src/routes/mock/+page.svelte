<script lang="ts">
	import type { LezenExam } from '$lib/lezen/types';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { examByYear } from '$lib/reading/bank';
	import {
		BOOKLET_PASS_LABEL,
		LIVE_PASS,
		MOCK_MINUTES,
		NOT_A_PREDICTION,
		passedSitting,
		pickMockExam,
		practiceYears,
		yearStudied
	} from '$lib/reading/mock';
	import { MOVES, moveOf } from '$lib/reading/moves';
	import TimeBox from '$lib/components/reading/TimeBox.svelte';
	import MissReview from '$lib/components/reading/MissReview.svelte';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	let sitting = $state<LezenExam | null>(null);
	let scoreIsPrediction = $state(false);
	let rehearsalWasStudied = $state(false);
	let rehearsalPick = $state<number | null>(null);
	let studied2023 = $derived(
		yearStudied(
			2023,
			ctx.state.lezen.questionResults,
			ctx.state.readingFork.eval.results,
			ctx.state.readingFork.misses.map((miss) => miss.questionId)
		)
	);
	let predictive = $derived(pickMockExam(ctx.state.readingFork.satMocks, studied2023));
	let rehearsalYears = $derived(practiceYears(ctx.state.readingFork.satMocks, studied2023));
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));
	let paper = $derived(sitting);
	let allQuestions = $derived(
		paper
			? paper.passages.flatMap((p) =>
					p.questions.map((q) => ({ ...q, slug: p.slug, passageName: p.name }))
				)
			: []
	);
	let passageIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let flagged = $state<Record<string, boolean>>({});
	let done = $state(false);

	let passage = $derived(paper?.passages[passageIndex]);
	let correctCount = $derived(allQuestions.filter((q) => answers[q.id] === q.answer).length);
	let passed = $derived(passedSitting(correctCount));
	let last = $derived(ctx.state.readingFork.lastMockScore);

	let misses = $derived(
		done
			? allQuestions.filter((q) => answers[q.id] !== q.answer)
			: []
	);
	let grouped = $derived(
		MOVES.map((move) => ({
			move,
			items: misses.filter((q) => moveOf(q.id) === move)
		})).filter((group) => group.items.length > 0)
	);

	function begin(exam: LezenExam, prediction: boolean) {
		sitting = exam;
		scoreIsPrediction = prediction;
		rehearsalWasStudied =
			!prediction &&
			(ctx.state.readingFork.satMocks.includes(exam.year) ||
				yearStudied(
					exam.year,
					ctx.state.lezen.questionResults,
					ctx.state.readingFork.eval.results,
					ctx.state.readingFork.misses.map((miss) => miss.questionId)
				));
		playSfx('session_start');
	}

	function startPredictive() {
		if (!predictive) return;
		begin(predictive, true);
	}

	function startRehearsal() {
		if (rehearsalPick === null) return;
		if (rehearsalPick === 2023 && predictive) return;
		const exam = examByYear(rehearsalPick);
		if (!exam || exam.year !== rehearsalPick) return;
		begin(exam, false);
	}

	function select(id: string, letter: string) {
		answers = { ...answers, [id]: letter };
	}

	function jumpTo(id: string) {
		if (!sitting) return;
		const paper = sitting;
		const index = paper.passages.findIndex((p) => p.questions.some((q) => q.id === id));
		if (index >= 0) passageIndex = index;
	}

	function finish() {
		if (done || !sitting) return;
		done = true;
		const year = sitting.year;
		ctx.state.readingFork.lastMockAt = today;
		ctx.state.readingFork.lastMockScore = {
			correct: correctCount,
			total: allQuestions.length,
			passed: passedSitting(correctCount),
			year
		};
		if (!ctx.state.readingFork.satMocks.includes(year)) {
			ctx.state.readingFork.satMocks = [...ctx.state.readingFork.satMocks, year];
		}
		playSfx(passedSitting(correctCount) ? 'rank_up' : 'session_complete');
	}
</script>

<div class="mock-page stagger">
	<p class="eyebrow">{predictive ? 'Predictive mock · once' : 'Format rehearsal'} · {MOCK_MINUTES} min</p>
	<h1>Mock</h1>

	{#if sitting && done}
		{#if misses.length > 0}
			<PracticeBook years={bookYears} />
		{/if}
		<Card variant="soft-lavender">
			<h2>{passed ? 'This sitting passes.' : 'Under 22.'}</h2>
			<p>{correctCount} / {allQuestions.length}</p>
			<p>{BOOKLET_PASS_LABEL}</p>
			{#if scoreIsPrediction}
				<p>November prediction.</p>
			{:else if rehearsalWasStudied}
				<p>{NOT_A_PREDICTION}</p>
			{:else}
				<p>Format rehearsal.</p>
			{/if}
		</Card>
		{#each grouped as group (group.move)}
			<h2 class="move-head">{group.move}</h2>
			{#each group.items as q (q.id)}
				<Card>
					<MissReview questionId={q.id} picked={answers[q.id] ?? ''} />
				</Card>
			{/each}
		{/each}
	{:else if sitting && passage}
		<PracticeBook years={bookYears} />
		<div class="toolbar">
			<TimeBox totalSeconds={MOCK_MINUTES * 60} label="Paper 110" onExpire={finish} />
		</div>
		<nav class="grid" aria-label="Questions">
			{#each allQuestions as q, i (q.id)}
				<button
					type="button"
					class="cell"
					class:answered={Boolean(answers[q.id])}
					class:flagged={flagged[q.id]}
					class:blank={!answers[q.id]}
					onclick={() => jumpTo(q.id)}
				>
					{i + 1}
				</button>
			{/each}
		</nav>

		<Card>
			<p class="intro">{passage.intro}</p>
			<div class="text">{passage.text}</div>
		</Card>

		{#each passage.questions as q (q.id)}
			<Card>
				<div class="qhead">
					<p class="q">{q.question}</p>
					<button
						type="button"
						class="flag"
						class:on={flagged[q.id]}
						onclick={() => (flagged = { ...flagged, [q.id]: !flagged[q.id] })}
					>
						{flagged[q.id] ? 'Flagged' : 'Flag'}
					</button>
				</div>
				<div class="opts">
					{#each Object.entries(q.options) as [letter, text] (letter)}
						<button
							type="button"
							class="opt"
							class:picked={answers[q.id] === letter}
							onclick={() => select(q.id, letter)}
						>
							<strong>{letter}</strong>
							{text}
						</button>
					{/each}
				</div>
			</Card>
		{/each}

		<p class="tiny">
			{Object.keys(answers).length} answered · {Object.values(flagged).filter(Boolean).length} flagged
			· pass {LIVE_PASS}
		</p>
		<button type="button" class="btn" onclick={finish}>Hand in</button>
	{:else}
		{#if predictive}
			<Card variant="soft-teal">
				<p>2023 · 35 items. Sealed. Sat once.</p>
				<p>{BOOKLET_PASS_LABEL}</p>
				<p>This sitting is a November prediction.</p>
				<p>The live paper is 110 minutes and a bit longer.</p>
				<button type="button" class="btn start" onclick={startPredictive}>Start the clock</button>
			</Card>
		{/if}
		<Card variant="soft-lavender">
			{#if predictive}
				<p>Format rehearsal of 2024 or 2025. Those papers stay in the training bank.</p>
			{:else}
				<p>No paper is sealed. All three are practice.</p>
			{/if}
			<p>{BOOKLET_PASS_LABEL}</p>
			<p>The live paper is 110 minutes and a bit longer.</p>
			<div class="years">
				{#each rehearsalYears as year (year)}
					{#if !(year === 2023 && predictive)}
						<button
							type="button"
							class="year"
							class:picked={rehearsalPick === year}
							onclick={() => (rehearsalPick = year)}
						>
							{year}
						</button>
					{/if}
				{/each}
			</div>
			{#if rehearsalPick !== null && (ctx.state.readingFork.satMocks.includes(rehearsalPick) || yearStudied(rehearsalPick, ctx.state.lezen.questionResults, ctx.state.readingFork.eval.results, ctx.state.readingFork.misses.map((miss) => miss.questionId)))}
				<p>{NOT_A_PREDICTION}</p>
			{/if}
			{#if rehearsalPick !== null}
				<button type="button" class="btn start" onclick={startRehearsal}>Start the clock</button>
			{/if}
			{#if last && last.year !== 0}
				<p class="tiny">
					Last sitting: {last.correct}/{last.total}
					({last.passed ? 'pass' : 'not yet'}).
				</p>
			{/if}
			<a class="ghost" href={resolve('/')}>Back home</a>
		</Card>
	{/if}
</div>

<style>
	.mock-page {
		padding: 0.5rem 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.eyebrow {
		font-size: var(--text-micro);
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1,
	h2,
	.move-head {
		font-family: var(--font-display);
		margin: 0;
	}
	h1 {
		font-size: var(--text-hero);
	}
	.move-head {
		font-size: var(--text-title);
		text-transform: capitalize;
	}
	.intro,
	.q,
	.text {
		line-height: 1.6;
		font-size: var(--text-base);
	}
	.text {
		font-size: 18px;
		white-space: pre-wrap;
	}
	.toolbar {
		display: flex;
	}
	.grid {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 8px 0;
		background: var(--color-paper, #fffaf6);
	}
	.cell,
	.flag,
	.opt,
	.btn {
		border: 3px solid var(--color-ink);
		background: #fff;
		cursor: pointer;
	}
	.cell {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		font-weight: 700;
		font-size: var(--text-small);
	}
	.cell.blank {
		background: #fff;
	}
	.cell.answered {
		background: var(--color-lilac, #ede4ff);
	}
	.cell.flagged {
		outline: 3px solid var(--color-rose-deep, #c43b6e);
	}
	.qhead {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		align-items: flex-start;
	}
	.flag {
		border-radius: 999px;
		padding: 4px 10px;
		flex-shrink: 0;
	}
	.flag.on {
		background: var(--color-blush);
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}
	.opt {
		text-align: left;
		border-radius: 14px;
		padding: 10px 12px;
	}
	.opt.picked {
		background: var(--color-lilac, #ede4ff);
	}
	.years {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}
	.year {
		flex: 1;
		border-radius: 14px;
		padding: 10px 8px;
		font-weight: 700;
		border: 3px solid var(--color-ink);
		background: #fff;
		cursor: pointer;
	}
	.year.picked {
		background: var(--color-lilac, #ede4ff);
	}
	.btn {
		display: inline-flex;
		padding: 10px 16px;
		border-radius: 999px;
		background: var(--color-pink, #ff9bb8);
		font-weight: 700;
		text-decoration: none;
		color: var(--color-ink);
		cursor: pointer;
		border: 3px solid var(--color-ink);
	}
	.btn.start {
		display: flex;
		width: 100%;
		justify-content: center;
		margin-top: 12px;
	}
	.ghost {
		margin-left: 8px;
		color: var(--color-ink);
	}
	.tiny {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}
</style>
