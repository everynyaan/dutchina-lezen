<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { findPassage } from '$lib/reading/bank';
	import { appendAttempt, dailyLoopItem } from '$lib/reading/daily';
	import { QTYPE_LABEL } from '$lib/reading/annotations';
	import { resolveLoopItem } from '$lib/reading/loop';
	import type { LoopPhase } from '$lib/reading/loop';
	import {
		flagSplit,
		formatRemaining,
		handInMock,
		remainingMs,
		startSetSession,
		switchText,
		textScores,
		unansweredCount
	} from '$lib/reading/mockSession';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import {
		HORIZON_SLUG,
		SET_MIX_NOTE,
		SET_SIZE,
		SET_TARGET,
		examForSet,
		horizonLocked,
		latestSetResult,
		originForItem,
		practiceSets,
		setHistoryLabel
	} from '$lib/reading/sets';
	import { recordMiss } from '$lib/reading/traps';
	import { textChatFromLoop } from '$lib/kuromi/coach';
	import { chatNotebook, notebookOf } from '$lib/reading/notebook';
	import { setMockDebrief, setTextChat } from '$lib/kuromi/focus';
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import AnswerFeedback from '$lib/components/reading/AnswerFeedback.svelte';
	import DebriefNotes from '$lib/components/reading/DebriefNotes.svelte';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import QuestionBlock from '$lib/components/reading/QuestionBlock.svelte';
	import ReadingLoop from '$lib/components/reading/ReadingLoop.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import type { QType } from '$lib/reading/types';

	const ctx = getGameContext();
	const today = getTodayDate();

	let now = $state(Date.now());
	let confirmHandIn = $state(false);
	let bookletSet = $state(false);
	let finishing = false;
	let practiceSlug = $state<string | null>(null);
	let phase = $state<LoopPhase>('locate');
	let picked = $state('');
	let locatedP = $state<number | null>(null);
	let index = $state(0);
	let flags = $state<Record<string, boolean>>({});
	let answers = $state<
		Record<string, { picked: string; correct: boolean; locateP: number | null }>
	>({});

	let resultId = $derived($page.url.searchParams.get('result'));
	let horizonOpen = $derived(!horizonLocked(ctx.state.readingFork.mocks));
	let sitting = $derived(ctx.state.readingFork.mockInProgress);
	let setSitting = $derived(sitting?.setId ? sitting : null);
	let officialBusy = $derived(Boolean(sitting && !sitting.setId));
	let exam = $derived(setSitting?.setId ? examForSet(setSitting.setId, horizonOpen) : null);
	let passage = $derived(exam && setSitting ? exam.passages[setSitting.activeText] : undefined);
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));
	let result = $derived(
		ctx.state.readingFork.mocks.find((mock) => mock.id === resultId && mock.setId) ?? null
	);
	let resultExam = $derived(
		result?.setId
			? examForSet(result.setId, result.setId !== 'set1' || result.total === SET_SIZE)
			: null
	);
	let flat = $derived(
		exam ? exam.passages.flatMap((row) => row.questions.map((question) => question)) : []
	);
	let practicePassage = $derived(practiceSlug ? findPassage(practiceSlug) : undefined);
	let practiceIds = $derived(
		practicePassage ? practicePassage.questions.map((question) => question.id) : []
	);
	let practiceId = $derived(practiceIds[index] ?? null);
	let practiceItem = $derived(
		practicePassage && practiceId ? dailyLoopItem(practicePassage, practiceId) : null
	);
	let answerP = $derived(practiceItem?.evidence?.[0]?.p ?? null);

	$effect(() => {
		setKuromiVisible(setSitting === null);
		return () => setKuromiVisible(true);
	});

	$effect(() => {
		if (setSitting || practicePassage) {
			setMockDebrief(null);
			return;
		}
		if (!result || !resultExam) {
			setMockDebrief(null);
			return;
		}
		const flagsNow = flagSplit(resultExam, result);
		setMockDebrief({
			correct: result.correct,
			total: result.total,
			passLine: SET_TARGET,
			target: SET_TARGET,
			passed: result.correct >= SET_TARGET,
			minutesPerText: result.textMs.map((ms) => Math.round(ms / 60000)),
			flaggedRight: flagsNow.right,
			flaggedWrong: flagsNow.wrong,
			byQtype: Object.entries(result.byQtype).map(([qtype, row]) => ({
				qtype,
				correct: row.c,
				total: row.t
			}))
		});
		return () => setMockDebrief(null);
	});

	$effect(() => {
		if (!practicePassage || !practiceItem || !practiceId) {
			if (!setSitting) setTextChat(null);
			return;
		}
		setTextChat(
			textChatFromLoop({
				passageText: practicePassage.text,
				paragraphMap: [],
				items: [{ id: practiceId, item: practiceItem }],
				answeredIds: phase === 'feedback' ? new Set([practiceId]) : new Set(),
				activeId: practiceId,
				activePhase: phase,
				notebook: chatNotebook(notebookOf(ctx.state.readingFork).entries, practicePassage.slug)
			})
		);
		return () => setTextChat(null);
	});

	$effect(() => {
		if (!setSitting) return;
		const timer = setInterval(() => {
			now = Date.now();
		}, 250);
		return () => clearInterval(timer);
	});

	$effect(() => {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current?.setId || current.endsAt > now) return;
		commit(true);
	});

	function start(setId: string, booklet: boolean) {
		if (officialBusy || setSitting) return;
		const next = startSetSession(setId, booklet, horizonOpen, Date.now());
		if (!next) return;
		ctx.state.readingFork.mockInProgress = next;
		confirmHandIn = false;
		practiceSlug = null;
		now = Date.now();
		setKuromiVisible(false);
		playSfx('session_start');
	}

	function patchSession(next: NonNullable<typeof setSitting>) {
		ctx.state.readingFork.mockInProgress = next;
	}

	function select(id: string, letter: string) {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current?.setId) return;
		patchSession({ ...current, answers: { ...current.answers, [id]: letter } });
	}

	function toggleFlag(id: string) {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current?.setId) return;
		patchSession({
			...current,
			flagged: { ...current.flagged, [id]: !current.flagged[id] }
		});
	}

	function go(nextIndex: number) {
		const current = ctx.state.readingFork.mockInProgress;
		if (!current?.setId) return;
		patchSession(switchText(current, nextIndex, Date.now()));
	}

	function jump(id: string) {
		if (!exam) return;
		const at = exam.passages.findIndex((row) =>
			row.questions.some((question) => question.id === id)
		);
		if (at < 0) return;
		go(at);
		queueMicrotask(() => {
			const nodes = [...document.querySelectorAll(`[data-q="${id}"]`)];
			const visible = nodes.find((node) => node.getClientRects().length > 0);
			visible?.scrollIntoView({ block: 'center' });
		});
	}

	function askHandIn() {
		const current = ctx.state.readingFork.mockInProgress;
		const paper = exam;
		if (!current?.setId || !paper) return;
		if (unansweredCount(paper, current.answers) > 0) {
			confirmHandIn = true;
			return;
		}
		commit(false);
	}

	function commit(expired: boolean) {
		if (finishing) return;
		const current = ctx.state.readingFork.mockInProgress;
		if (!current?.setId) return;
		finishing = true;
		const finished = handInMock(ctx.state.readingFork, current, Date.now(), today, expired);
		ctx.state.readingFork = finished;
		confirmHandIn = false;
		setKuromiVisible(true);
		playSfx('session_complete');
		finishing = false;
		void goto(`${resolve('/sets')}?result=${current.id}`, { replaceState: true, noScroll: true });
	}

	function minutes(ms: number | undefined): number {
		return Math.round((ms ?? 0) / 60000);
	}

	function openPractice(slug: string) {
		if (slug === HORIZON_SLUG && !horizonOpen) return;
		practiceSlug = slug;
		index = 0;
		phase = 'locate';
		picked = '';
		locatedP = null;
		flags = {};
		answers = {};
	}

	function locate(p: number) {
		locatedP = p;
		phase = 'options';
	}

	function skipLocate() {
		locatedP = null;
		phase = 'options';
	}

	function checkPractice() {
		if (!picked || !practiceItem || !practicePassage || !practiceId) return;
		const correct = picked === practiceItem.answer;
		const locateHit = locatedP === null || answerP === null ? null : locatedP === answerP;
		ctx.state.readingFork.attempts = appendAttempt(ctx.state.readingFork.attempts, {
			itemId: practiceId,
			origin: originForItem(practiceId),
			passageSlug: practicePassage.slug,
			source: 'texts',
			at: today,
			picked,
			correct,
			locateP: locatedP,
			locateHit,
			ms: 0
		});
		if (!correct) {
			ctx.state.readingFork.traps = recordMiss(
				ctx.state.readingFork,
				practiceId,
				picked,
				today
			).traps;
		}
		answers = {
			...answers,
			[practiceId]: { picked, correct, locateP: locatedP }
		};
		playSfx(correct ? 'correct' : 'wrong');
		phase = 'feedback';
	}

	function advancePractice() {
		if (index + 1 < practiceIds.length) {
			index += 1;
			phase = 'locate';
			picked = '';
			locatedP = null;
			return;
		}
		practiceSlug = null;
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
					class:on={setSitting?.flagged[question.id]}
					onclick={() => toggleFlag(question.id)}
				>
					{setSitting?.flagged[question.id] ? 'Flagged' : 'Flag'}
				</button>
			</div>
			<div class="opts">
				{#each Object.entries(question.options) as [letter, text] (letter)}
					<button
						type="button"
						class="opt"
						class:picked={setSitting?.answers[question.id] === letter}
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

<div class="sets-page" class:exam-chrome={Boolean(setSitting)}>
	{#if setSitting && exam && passage}
		{@const activePassage = passage}
		<p class="eyebrow">110 minutes</p>
		<h1>{setHistoryLabel(setSitting.setId ?? '')}</h1>
		<p class="note">Practice set, unofficial.</p>
		<p class="clock">{formatRemaining(remainingMs(setSitting, now))}</p>
		<nav class="switcher" aria-label="Texts">
			{#each exam.passages as row, textIndex (row.slug)}
				<button
					type="button"
					class:on={setSitting.activeText === textIndex}
					onclick={() => go(textIndex)}
				>
					{textIndex + 1}
				</button>
			{/each}
		</nav>
		<nav class="grid" aria-label="Questions">
			{#each flat as question, questionIndex (question.id)}
				<button
					type="button"
					class="cell"
					class:answered={Boolean(setSitting.answers[question.id])}
					class:flagged={setSitting.flagged[question.id]}
					onclick={() => jump(question.id)}
				>
					{questionIndex + 1}
				</button>
			{/each}
		</nav>
		<PracticeBook years={bookYears} />
		{#if setSitting.booklet}
			<p class="note">Booklet mode. The texts are on paper. The screen is only questions.</p>
			{@render questions(activePassage)}
		{:else}
			<ReadingLoop passage={activePassage} hideNotebook={true}>
				{#snippet question()}
					{@render questions(activePassage)}
				{/snippet}
			</ReadingLoop>
		{/if}
		{#if confirmHandIn}
			{@const blank = unansweredCount(exam, setSitting.answers)}
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
	{:else if practicePassage && practiceItem}
		<button type="button" class="btn ghost" onclick={() => (practiceSlug = null)}>Back</button>
		<PracticeBook years={bookYears} />
		<p class="count">Question {index + 1} of {practiceIds.length}</p>
		<ReadingLoop
			passage={practicePassage}
			highlight={phase === 'feedback' ? (practiceItem.evidence ?? []) : []}
			locateMode={phase === 'locate'}
			onLocate={locate}
			{locatedP}
			scrollToEvidence={phase === 'feedback'}
		>
			{#snippet question()}
				<QuestionBlock
					item={practiceItem}
					{phase}
					paragraphMap={[]}
					{picked}
					shuffle={true}
					seed={practiceItem.id}
					flaggable={true}
					flagged={!!flags[practiceItem.id]}
					{locatedP}
					{answerP}
					onPick={(letter) => (picked = letter)}
					onCheck={checkPractice}
					onSkip={skipLocate}
					onFlag={() => {
						flags = { ...flags, [practiceItem.id]: !flags[practiceItem.id] };
					}}
				/>
				{#if phase === 'feedback'}
					<button type="button" class="btn" onclick={advancePractice}>Next</button>
				{/if}
			{/snippet}
		</ReadingLoop>
	{:else if result && resultExam}
		<Card variant="soft-lavender">
			<h2>Practice set, unofficial.</h2>
			{#if result.expired}<p>Time is up.</p>{/if}
			<p>{result.correct} of {result.total}.</p>
			<p>Target {SET_TARGET} of {SET_SIZE}.</p>
			{#if result.total !== SET_SIZE}
				<p>Horizon College stayed out of this sitting.</p>
			{/if}
		</Card>
		<h2>By question type</h2>
		<ul>
			{#each Object.entries(result.byQtype) as [qtype, row] (qtype)}
				<li>{QTYPE_LABEL[qtype as QType]}: {row.c} of {row.t}</li>
			{/each}
		</ul>
		{@const flagsNow = flagSplit(resultExam, result)}
		<p>Flagged and right: {flagsNow.right}. Flagged and wrong: {flagsNow.wrong}.</p>
		<DebriefNotes slugs={resultExam.passages.map((row) => row.slug)} />
		{#each textScores(resultExam, result.answers) as row, textIndex (row.slug)}
			<section class="text-score">
				<h2>Text {textIndex + 1}. {row.name}</h2>
				<p>{row.correct} of {row.total}. {minutes(result.textMs[textIndex])} min.</p>
				{#each resultExam.passages[textIndex].questions as question (question.id)}
					{@const item = dailyLoopItem({ ...resultExam.passages[textIndex], year: 0 }, question.id)}
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
		<a class="btn ghost" href={resolve('/sets')}>Back</a>
	{:else}
		<p class="eyebrow">Unofficial</p>
		<h1>Practice sets</h1>
		<p class="note">Suggested order: set 2, then set 3, then set 1 after the 2025 mock.</p>
		<p class="note">{SET_MIX_NOTE}</p>
		{#if officialBusy}
			<p class="warn">Finish the official mock first.</p>
		{/if}
		{#each practiceSets() as set (set.id)}
			{@const taken = latestSetResult(ctx.state.readingFork.mocks, set.id)}
			<section class="card">
				<h2>{setHistoryLabel(set.id)}</h2>
				<p class="note">{set.title}</p>
				<ul class="text-grid">
					{#each set.passages as row (row.slug)}
						<li>
							{row.name}
							{#if row.slug === HORIZON_SLUG && !horizonOpen}
								<span class="lock">
									Horizon College stays locked until the 2025 paper has been taken as a mock.
								</span>
							{/if}
						</li>
					{/each}
				</ul>
				{#if taken}
					<div class="badge-row">
						<span class="chip">{taken.finishedAt.slice(0, 10)}</span>
						<span class="chip">{taken.correct} / {taken.total}</span>
					</div>
					<div class="actions">
						{#each set.passages as row (row.slug)}
							{#if row.slug === HORIZON_SLUG && !horizonOpen}
								<p class="lock">Text 6 stays locked.</p>
							{:else}
								<button type="button" class="btn ghost" onclick={() => openPractice(row.slug)}>
									Practice {row.name}
								</button>
							{/if}
						{/each}
					</div>
				{:else}
					{#if set.id === 'set1' && !horizonOpen}
						<p class="lock">Text 6 stays out of this sitting until the 2025 mock is done.</p>
					{/if}
					<label class="toggle">
						<input type="checkbox" bind:checked={bookletSet} />
						Booklet mode
					</label>
					<div class="actions">
						<button
							type="button"
							class="btn"
							disabled={officialBusy || Boolean(setSitting)}
							onclick={() => start(set.id, bookletSet)}
						>
							Start
						</button>
						<a class="btn ghost" href="{resolve('/mock/booklet')}?set={set.id}">Print the booklet</a
						>
					</div>
				{/if}
			</section>
		{/each}
	{/if}
</div>

<style>
	.sets-page {
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
	.note,
	.warn,
	.lock,
	.count,
	.q {
		margin: 0;
		line-height: 1.45;
	}
	.lock {
		display: block;
		color: var(--color-muted-ink);
	}
	.clock {
		margin: 0;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		font-size: 1.4rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding: 0.9rem;
		border: 2px solid var(--color-ink);
		border-radius: 16px;
		background: #fff;
	}
	.card ul {
		margin: 0;
		padding-left: 1.2rem;
	}
	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.4rem;
	}
	.switcher,
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
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
	.btn {
		display: inline-flex;
		padding: 10px 16px;
		border-radius: 999px;
		border-width: 3px;
		background: var(--color-pink, #ff9bb8);
		text-decoration: none;
		width: fit-content;
	}
	.btn.ghost {
		background: #fff;
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
	.q-block,
	.item,
	.text-score {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-bottom: 1rem;
	}
	.qhead {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		align-items: flex-start;
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
	ul {
		margin: 0;
		padding-left: 1.2rem;
	}
	.text-grid {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	.badge-row,
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		display: inline-flex;
		padding: 3px 8px;
		border-radius: 999px;
		background: white;
		font-size: 14px;
		font-weight: 700;
	}
	.toggle {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 17px;
	}
	h2 {
		font-size: 22px;
	}
	@media (max-width: 900px) {
		.text-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
