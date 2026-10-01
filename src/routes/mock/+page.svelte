<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { evalResults } from '$lib/reading/eval';
	import { dailyLoopItem } from '$lib/reading/daily';
	import { resolveLoopItem } from '$lib/reading/loop';
	import { NOT_A_PREDICTION, passLineFor, yearStudied } from '$lib/reading/mock';
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
	import { QTYPE_LABEL } from '$lib/reading/annotations';
	import type { QType } from '$lib/reading/types';
	import AnswerFeedback from '$lib/components/reading/AnswerFeedback.svelte';
	import DebriefNotes from '$lib/components/reading/DebriefNotes.svelte';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import ReadingLoop from '$lib/components/reading/ReadingLoop.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import Card from '$lib/components/ui/Card.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import KuromiBubble from '$lib/components/reading/KuromiBubble.svelte';
	import StatBadge from '$lib/components/reading/StatBadge.svelte';
	import TypeGrid from '$lib/components/reading/TypeGrid.svelte';
	import { registerMockOpener } from '$lib/shell/desk.svelte';
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import { setMockDebrief, setTextChat } from '$lib/kuromi/focus';
	import { playSfx } from '$lib/sound/sfx';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	let now = $state(Date.now());
	let openId = $state<string | null>(null);
	let confirmHandIn = $state(false);
	let bookletMode = $state(false);
	let showOverview = $state(false);
	let openItems = $state<Record<string, boolean>>({});
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

	$effect(() => registerMockOpener((id) => (openId = id)));

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
					aria-label={session?.flagged[question.id] ? 'Flagged' : 'Flag'}
					aria-pressed={session?.flagged[question.id] ? 'true' : 'false'}
					onclick={() => toggleFlag(question.id)}
				>
					⚑
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

<div class="mock-page" class:exam-chrome={Boolean(session)} class:mock-setup={!session && !result}>
	{#if !(session && exam && passage)}
		<p class="eyebrow">110 minutes</p>
		<h1>Mock</h1>
		<span class="spark jit-5">
			<Doodle name="spark-sparkle-26" size={22} color="var(--color-rose-deep)" />
		</span>
	{/if}

	{#if session && exam && passage}
		{@const activePassage = passage}
		{@const answered = Object.keys(session.answers).length}
		{@const flagged = Object.values(session.flagged).filter(Boolean).length}
		<header class="exam-bar">
			<p class="clock">{formatRemaining(remainingMs(session, now))}</p>
			<nav class="switcher" aria-label="Texts">
				{#each exam.passages as row, index (row.slug)}
					<button type="button" class:on={session.activeText === index} onclick={() => go(index)}>
						{index + 1}
					</button>
				{/each}
			</nav>
			<span class="chip">{answered} answered</span>
			<span class="chip">{flagged} flagged</span>
			<button type="button" class="btn ghost" onclick={() => (showOverview = !showOverview)}>
				Overview
			</button>
			<PracticeBook years={bookYears} />
			{#if confirmHandIn}
				{@const blank = unansweredCount(exam, session.answers)}
				<span class="warn">
					{blank === 1 ? '1 still open.' : `${blank} still open.`}
				</span>
				<button type="button" class="btn" onclick={() => commit(false)}>Hand in</button>
				<button type="button" class="btn ghost" onclick={() => (confirmHandIn = false)}
					>Keep going</button
				>
			{:else}
				<button type="button" class="btn" onclick={askHandIn}>Hand in</button>
			{/if}
		</header>
		{#if showOverview}
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
		{/if}
		{#if session.booklet}
			<p class="note">Booklet mode. The texts are on paper. The screen is only questions.</p>
			{@render questions(activePassage)}
		{:else}
			<ReadingLoop passage={activePassage} hideNotebook={true}>
				{#snippet question()}
					{@render questions(activePassage)}
				{/snippet}
			</ReadingLoop>
		{/if}
	{:else if result && resultExam}
		{@const flags = flagSplit(resultExam, result)}
		<Card variant="soft-lavender">
			<p class="score">{result.correct}</p>
			<div class="badge-row">
				<StatBadge label="of" value={String(result.total)} tint="lavender" mark="/" />
				<StatBadge label="Pass line" value={String(result.passLine)} tint="teal" mark="P" />
				<StatBadge label="target" value={String(result.passLine + 1)} tint="rose" mark="T" />
			</div>
			<KuromiBubble mood={result.correct >= result.passLine ? 'wink' : 'hmph'}>
				<p>
					{result.correct >= result.passLine ? 'This sitting passes.' : 'Under the pass line.'}
					{#if result.expired}
						Time is up.{/if}
				</p>
			</KuromiBubble>
			{#if studied.includes(result.paperYear)}
				<p class="note">{NOT_A_PREDICTION}</p>
			{/if}
		</Card>
		<div class="debrief-grid">
			<div class="text-col">
				{#each textScores(resultExam, result.answers) as row, index (row.slug)}
					<article class="text-score">
						<h2>Text {index + 1}. {row.name}</h2>
						<div class="badge-row">
							<StatBadge
								label="score"
								value={`${row.correct} / ${row.total}`}
								tint="teal"
								mark="S"
							/>
							<StatBadge
								label="min"
								value={String(minutes(result.textMs[index]))}
								tint="peach"
								mark="m"
							/>
						</div>
					</article>
				{/each}
				<div class="badge-row">
					<StatBadge label="Flagged and right" value={String(flags.right)} tint="teal" mark="+" />
					<StatBadge label="flagged wrong" value={String(flags.wrong)} tint="rose" mark="-" />
				</div>
			</div>
			<TypeGrid
				rows={Object.entries(result.byQtype).map(([qtype, row]) => ({
					qtype,
					label: QTYPE_LABEL[qtype as QType],
					rate: row.t === 0 ? null : row.c / row.t
				}))}
			/>
		</div>
		<DebriefNotes slugs={resultExam.passages.map((row) => row.slug)} />
		<div class="review">
			{#each textScores(resultExam, result.answers) as row, index (row.slug)}
				{#each resultExam.passages[index].questions as question (question.id)}
					{@const item = dailyLoopItem(
						{ ...resultExam.passages[index], year: result.paperYear },
						question.id
					)}
					{@const missed = result.answers[question.id] !== question.answer}
					<details
						class="item"
						open={openItems[question.id]}
						ontoggle={(event) => {
							openItems[question.id] = (event.currentTarget as HTMLDetailsElement).open;
						}}
					>
						<summary>
							{question.vraag}. {result.answers[question.id] ?? 'blank'} / {question.answer}
						</summary>
						{#if item}
							<AnswerFeedback
								{item}
								resolved={resolveLoopItem(item)}
								picked={result.answers[question.id] ?? ''}
							/>
							{#if missed}
								<a class="btn ghost" href="{resolve('/cards')}?qtype={item.qtype ?? ''}"
									>Add to drills</a
								>
							{/if}
						{/if}
					</details>
				{/each}
			{/each}
		</div>
		<button type="button" class="btn ghost" onclick={() => (openId = null)}>Back</button>
	{:else if sitting?.setId}
		<p>A practice set is in progress.</p>
		<a class="btn ghost" href={resolve('/sets')}>Back to practice sets</a>
	{:else if exam}
		<Card variant="soft-teal">
			<h2>{choice.year}</h2>
			<div class="badge-row">
				<StatBadge label="questions" value="35" tint="teal" mark="Q" />
				<StatBadge label="minutes" value="110" tint="peach" mark="m" />
				<StatBadge label="Pass line" value={String(passLineFor(exam))} tint="rose" mark="P" />
			</div>
			<KuromiBubble mood="mischief">
				<p>Sealed. Print the booklet, Van Dale NT2 dictionary on the desk, phone away.</p>
			</KuromiBubble>
			{#if choice.seen}<p class="note">{SEEN_PAPER_WARNING}</p>{/if}
			{#if choice.studied}<p class="note">{NOT_A_PREDICTION}</p>{/if}
			<label class="toggle">
				<input type="checkbox" bind:checked={bookletMode} />
				Booklet mode
			</label>
			<div class="actions">
				<button id="mock-start" type="button" class="btn start" onclick={() => start(bookletMode)}>
					Start
				</button>
				<a class="btn ghost" href="{resolve('/mock/booklet')}?paper={choice.year}"
					>Print the booklet</a
				>
			</div>
		</Card>
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
	.grid {
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
	.btn {
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		border: 2px solid var(--color-ink);
		background: #fff;
		color: var(--color-ink);
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
	.mock-page {
		position: relative;
	}
	.spark {
		position: absolute;
		top: 0;
		right: 8px;
	}
	.exam-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		position: sticky;
		top: 0;
		z-index: 2;
		background: #fff;
		padding-bottom: 8px;
	}
	.chip {
		display: inline-flex;
		padding: 3px 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-lavender) 35%, white);
		font-size: 14px;
		font-weight: 700;
	}
	.score {
		margin: 0;
		font-family: var(--font-display);
		font-size: 64px;
		font-weight: 700;
		line-height: 0.95;
	}
	.badge-row,
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}
	.debrief-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.text-score {
		padding: 12px;
		border-radius: 16px;
		background: color-mix(in srgb, var(--color-peach) 35%, white);
		box-shadow: var(--shadow-offset-pill);
	}
	.q-block {
		border: none;
		border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
		padding: 10px 0;
	}
	.item {
		border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
		padding: 8px 0;
	}
	.item summary {
		cursor: pointer;
		font-weight: 700;
		font-size: 17px;
	}
	.toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 17px;
	}
	@media (max-width: 800px) {
		.debrief-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
