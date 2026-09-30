<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { evalResults } from '$lib/reading/eval';
	import { dailyLoopItem } from '$lib/reading/daily';
	import { resolveLoopItem } from '$lib/reading/loop';
	import {
		BOOKLET_PASS_LABEL,
		NOT_A_PREDICTION,
		passLineFor,
		targetFor,
		yearStudied
	} from '$lib/reading/mock';
	import {
		SEEN_PAPER_WARNING,
		chooseMockPaper,
		examForYear,
		flagSplit,
		formatRemaining,
		handInMock,
		remainingMs,
		startMockSession,
		switchText,
		textScores,
		unansweredCount
	} from '$lib/reading/mockSession';
	import { setHistoryLabel } from '$lib/reading/sets';
	import { QTYPE_LABEL } from '$lib/reading/annotations';
	import type { QType } from '$lib/reading/types';
	import AnswerFeedback from '$lib/components/reading/AnswerFeedback.svelte';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import ReadingLoop from '$lib/components/reading/ReadingLoop.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import Card from '$lib/components/ui/Card.svelte';
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import { setMockDebrief, setTextChat } from '$lib/kuromi/focus';
	import { playSfx } from '$lib/sound/sfx';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	let now = $state(Date.now());
	let openId = $state<string | null>(null);
	let confirmHandIn = $state(false);
	let finishing = false;

	let studied = $derived(
		[2023, 2024, 2025].filter((year) =>
			yearStudied(
				year,
				ctx.state.lezen.questionResults,
				evalResults(ctx.state.readingFork.eval),
				ctx.state.readingFork.misses.map((miss) => miss.questionId)
			)
		)
	);
	let choice = $derived(chooseMockPaper(ctx.state.readingFork, studied));
	let sitting = $derived(ctx.state.readingFork.mockInProgress);
	let session = $derived(sitting && !sitting.setId ? sitting : null);
	let exam = $derived(session ? examForYear(session.paperYear) : examForYear(choice.year));
	let passage = $derived(exam && session ? exam.passages[session.activeText] : undefined);
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));
	let result = $derived(ctx.state.readingFork.mocks.find((mock) => mock.id === openId) ?? null);
	let resultExam = $derived(result ? examForYear(result.paperYear) : null);
	let flat = $derived(
		exam ? exam.passages.flatMap((row) => row.questions.map((question) => question)) : []
	);

	$effect(() => {
		setKuromiVisible(session === null);
		return () => setKuromiVisible(true);
	});

	$effect(() => {
		if (session) {
			setTextChat(null);
			setMockDebrief(null);
			return;
		}
		if (!result || !resultExam) {
			setMockDebrief(null);
			return;
		}
		const flags = flagSplit(resultExam, result);
		setMockDebrief({
			correct: result.correct,
			total: result.total,
			passLine: result.passLine,
			target: result.passLine + 1,
			passed: result.correct >= result.passLine,
			minutesPerText: result.textMs.map((ms) => Math.round(ms / 60000)),
			flaggedRight: flags.right,
			flaggedWrong: flags.wrong,
			byQtype: Object.entries(result.byQtype).map(([qtype, row]) => ({
				qtype,
				correct: row.c,
				total: row.t
			}))
		});
		return () => setMockDebrief(null);
	});

	$effect(() => {
		if (!session) return;
		const timer = setInterval(() => {
			now = Date.now();
		}, 250);
		return () => clearInterval(timer);
	});

	$effect(() => {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current || current.setId || current.endsAt > now) return;
		commit(true);
	});

	function start(booklet: boolean) {
		if (ctx.state.readingFork.mockInProgress?.setId) return;
		ctx.state.readingFork.mockInProgress = startMockSession(choice.year, booklet, Date.now());
		openId = null;
		confirmHandIn = false;
		now = Date.now();
		setKuromiVisible(false);
		playSfx('session_start');
	}

	function patchSession(next: NonNullable<typeof session>) {
		ctx.state.readingFork.mockInProgress = next;
	}

	function select(id: string, letter: string) {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current) return;
		patchSession({ ...current, answers: { ...current.answers, [id]: letter } });
	}

	function toggleFlag(id: string) {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current) return;
		patchSession({
			...current,
			flagged: { ...current.flagged, [id]: !current.flagged[id] }
		});
	}

	function go(index: number) {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current) return;
		patchSession(switchText(current, index, Date.now()));
	}

	function jump(id: string) {
		if (!exam) return;
		const index = exam.passages.findIndex((row) =>
			row.questions.some((question) => question.id === id)
		);
		if (index < 0) return;
		go(index);
		queueMicrotask(() => {
			const nodes = [...document.querySelectorAll(`[data-q="${id}"]`)];
			const visible = nodes.find((node) => node.getClientRects().length > 0);
			visible?.scrollIntoView({ block: 'center' });
		});
	}

	function askHandIn() {
		const current = ctx.state.readingFork.mockInProgress;
		const paper = exam;
		if (!current || !paper) return;
		if (unansweredCount(paper, current.answers) > 0) {
			confirmHandIn = true;
			return;
		}
		commit(false);
	}

	function commit(expired: boolean) {
		if (finishing) return;
		const current = ctx.state.readingFork.mockInProgress;
		if (!current) return;
		finishing = true;
		const finished = handInMock(ctx.state.readingFork, current, Date.now(), today, expired);
		openId = current.id;
		ctx.state.readingFork = finished;
		confirmHandIn = false;
		setKuromiVisible(true);
		const score = finished.lastMockScore;
		playSfx(score?.passed ? 'rank_up' : 'session_complete');
		finishing = false;
	}

	function minutes(ms: number | undefined): number {
		return Math.round((ms ?? 0) / 60000);
	}
</script>

{#snippet questions(active: {
	questions: { id: string; vraag: number; question: string; options: Record<string, string> }[];
})}
	{#each active.questions as question (question.id)}
		<section class="q-block" data-q={question.id}>
			<div class="qhead">
				<p class="q">{question.vraag}. {question.question}</p>
				<button
					type="button"
					class="flag"
					class:on={session?.flagged[question.id]}
					onclick={() => toggleFlag(question.id)}
				>
					{session?.flagged[question.id] ? 'Flagged' : 'Flag'}
				</button>
			</div>
			<div class="opts">
				{#each Object.entries(question.options) as [letter, text] (letter)}
					<button
						type="button"
						class="opt"
						class:picked={session?.answers[question.id] === letter}
						onclick={() => select(question.id, letter)}
					>
						<strong>{letter}</strong>
						{text}
					</button>
				{/each}
			</div>
		</section>
	{/each}
{/snippet}

<div class="mock-page">
	<p class="eyebrow">110 minutes</p>
	<h1>Mock</h1>

	{#if session && exam && passage}
		{@const activePassage = passage}
		<p class="clock">{formatRemaining(remainingMs(session, now))}</p>
		<nav class="switcher" aria-label="Texts">
			{#each exam.passages as row, index (row.slug)}
				<button type="button" class:on={session.activeText === index} onclick={() => go(index)}>
					{index + 1}
				</button>
			{/each}
		</nav>
		<nav class="grid" aria-label="Questions">
			{#each flat as question, index (question.id)}
				<button
					type="button"
					class="cell"
					class:answered={Boolean(session.answers[question.id])}
					class:blank={!session.answers[question.id]}
					class:flagged={session.flagged[question.id]}
					onclick={() => jump(question.id)}
				>
					{index + 1}
				</button>
			{/each}
		</nav>
		<PracticeBook years={bookYears} />
		{#if session.booklet}
			<p class="note">Booklet mode. The texts are on paper. The screen is only questions.</p>
			{@render questions(activePassage)}
		{:else}
			<ReadingLoop passage={activePassage}>
				{#snippet question()}
					{@render questions(activePassage)}
				{/snippet}
			</ReadingLoop>
		{/if}
		{#if confirmHandIn}
			{@const blank = unansweredCount(exam, session.answers)}
			<p class="warn">
				{blank === 1
					? '1 question is still unanswered.'
					: `${blank} questions are still unanswered.`}
				Hand in anyway?
			</p>
			<button type="button" class="btn" onclick={() => commit(false)}>Hand in</button>
			<button type="button" class="btn ghost" onclick={() => (confirmHandIn = false)}
				>Keep going</button
			>
		{:else}
			<button type="button" class="btn" onclick={askHandIn}>Hand in</button>
		{/if}
	{:else if result && resultExam}
		<Card variant="soft-lavender">
			<h2>
				{result.correct >= result.passLine ? 'This sitting passes.' : 'Under the pass line.'}
			</h2>
			{#if result.expired}<p>Time is up.</p>{/if}
			<p>{result.correct} / {result.total}</p>
			<p>Pass line {result.passLine} of {result.total}. Target {result.passLine + 1}.</p>
			<p>{BOOKLET_PASS_LABEL}</p>
			{#if studied.includes(result.paperYear)}
				<p>{NOT_A_PREDICTION}</p>
			{/if}
		</Card>
		<h2>By question type</h2>
		<ul>
			{#each Object.entries(result.byQtype) as [qtype, row] (qtype)}
				<li>{QTYPE_LABEL[qtype as QType]}: {row.c} of {row.t}</li>
			{/each}
		</ul>
		{@const flags = flagSplit(resultExam, result)}
		<p>Flagged and right: {flags.right}. Flagged and wrong: {flags.wrong}.</p>
		{#each textScores(resultExam, result.answers) as row, index (row.slug)}
			<section class="text-score">
				<h2>Text {index + 1}. {row.name}</h2>
				<p>{row.correct} of {row.total}. {minutes(result.textMs[index])} min.</p>
				{#each resultExam.passages[index].questions as question (question.id)}
					{@const item = dailyLoopItem(
						{ ...resultExam.passages[index], year: result.paperYear },
						question.id
					)}
					<article class="item">
						<p>
							{#if result.answers[question.id]}
								You answered {result.answers[question.id]}. The key is {question.answer}.
							{:else}
								You left this blank. The key is {question.answer}.
							{/if}
						</p>
						{#if item}
							<AnswerFeedback
								{item}
								resolved={resolveLoopItem(item)}
								picked={result.answers[question.id] ?? ''}
							/>
						{/if}
					</article>
				{/each}
			</section>
		{/each}
		<button type="button" class="btn ghost" onclick={() => (openId = null)}>Back</button>
	{:else if sitting?.setId}
		<p>A practice set is in progress.</p>
		<a class="btn ghost" href={resolve('/sets')}>Back to practice sets</a>
	{:else if exam}
		<Card variant="soft-teal">
			{#if choice.sealed}
				<p>{choice.year}. 35 items. Sealed. Sat once.</p>
				<p>This paper passes at {passLineFor(exam)}. Aim for {targetFor(exam)}.</p>
			{:else}
				<p>{choice.year}. 35 items.</p>
				<p>This paper passes at {passLineFor(exam)}. Aim for {targetFor(exam)}.</p>
			{/if}
			<p>{BOOKLET_PASS_LABEL}</p>
			<p>110 minutes for the whole paper.</p>
			{#if choice.seen}<p>{SEEN_PAPER_WARNING}</p>{/if}
			{#if choice.studied}<p>{NOT_A_PREDICTION}</p>{/if}
			<p>
				Print the booklet and answer on the screen, as on the exam day. Use the booklet for every
				full mock, with her Van Dale NT2 dictionary on the desk.
			</p>
			<a class="btn ghost" href="{resolve('/mock/booklet')}?paper={choice.year}"
				>Print the booklet</a
			>
			<button type="button" class="btn start" onclick={() => start(false)}>
				Start with the text on screen
			</button>
			<button type="button" class="btn start" onclick={() => start(true)}>
				Start with questions only
			</button>
		</Card>
		{#if ctx.state.readingFork.mocks.length > 0}
			<h2>History</h2>
			<ul class="history">
				{#each ctx.state.readingFork.mocks as mock (mock.id)}
					<li>
						{#if mock.setId}
							<a href="{resolve('/sets')}?result={mock.id}">
								{setHistoryLabel(mock.setId)}: {mock.correct}/{mock.total}
							</a>
						{:else}
							<button type="button" onclick={() => (openId = mock.id)}>
								{mock.paperYear}: {mock.correct}/{mock.total}
								{mock.correct >= mock.passLine ? 'pass' : 'not yet'}
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<p>No paper is ready.</p>
	{/if}
</div>

<style>
	.mock-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
		padding: 0.5rem 0 2rem;
	}
	.eyebrow {
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1,
	h2 {
		font-family: var(--font-display);
		margin: 0;
	}
	h1 {
		font-size: var(--text-hero);
		line-height: 1.1;
	}
	h2 {
		font-size: var(--text-title);
	}
	.clock {
		margin: 0;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		font-size: 1.4rem;
	}
	.switcher,
	.grid,
	.history {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.switcher button,
	.cell,
	.flag,
	.opt,
	.btn,
	.history button,
	.history a {
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		border: 2px solid var(--color-ink);
		background: #fff;
		color: var(--color-ink);
	}
	.history a {
		text-decoration: none;
		padding: 0.35rem 0.7rem;
		border-radius: 999px;
	}
	.switcher button,
	.cell {
		width: 2rem;
		height: 2rem;
		border-radius: 8px;
	}
	.switcher button.on,
	.cell.answered,
	.opt.picked {
		background: var(--color-lilac, #ede4ff);
	}
	.cell.flagged {
		outline: 3px solid var(--color-rose-deep, #c43b6e);
	}
	.q-block {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		margin-bottom: 1rem;
	}
	.qhead {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		align-items: flex-start;
	}
	.q,
	.note,
	.warn {
		margin: 0;
		line-height: 1.45;
	}
	.flag {
		border-radius: 999px;
		padding: 0.25rem 0.6rem;
		flex-shrink: 0;
	}
	.flag.on {
		background: var(--color-blush, #ffd6e0);
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.opt {
		text-align: left;
		border-radius: 10px;
		padding: 0.55rem 0.7rem;
	}
	.btn {
		display: inline-flex;
		padding: 10px 16px;
		border-radius: 999px;
		border-width: 3px;
		background: var(--color-pink, #ff9bb8);
		text-decoration: none;
	}
	.btn.start {
		justify-content: center;
	}
	.btn.ghost {
		background: #fff;
	}
	.item,
	.text-score {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	ul {
		margin: 0;
		padding-left: 1.2rem;
	}
</style>
