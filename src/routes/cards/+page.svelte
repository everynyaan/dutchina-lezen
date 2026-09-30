<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { findPassage } from '$lib/reading/bank';
	import { appendAttempt, dailyLoopItem } from '$lib/reading/daily';
	import {
		itemSlug,
		selectLures,
		selectParaphraseDrills,
		selectQtypeItems,
		selectTrapItem,
		type LurePrompt
	} from '$lib/reading/drills';
	import { originForItem } from '$lib/reading/sets';
	import { dueTraps, gradeTrap, recordMiss } from '$lib/reading/traps';
	import { QTYPE_LABEL, TRAP_EXPLANATION, TRAP_LABEL } from '$lib/reading/annotations';
	import {
		QTYPES,
		TRAP_KINDS,
		type AttemptSource,
		type QType,
		type TrapKind
	} from '$lib/reading/types';
	import { paragraphMapFor } from '$lib/reading/practice';
	import { textChatFromLoop } from '$lib/kuromi/coach';
	import { setTextChat } from '$lib/kuromi/focus';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import QuestionBlock from '$lib/components/reading/QuestionBlock.svelte';
	import ReadingLoop from '$lib/components/reading/ReadingLoop.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import { untrack } from 'svelte';
	import type { LoopPhase } from '$lib/reading/loop';

	const ctx = getGameContext();
	const today = getTodayDate();

	let mode = $derived($page.url.searchParams.get('mode'));
	let qtypeParam = $derived($page.url.searchParams.get('qtype'));
	let qtypeOk = $derived(qtypeParam !== null && (QTYPES as readonly string[]).includes(qtypeParam));
	let trapParam = $derived($page.url.searchParams.get('trap'));
	let namedTrap = $derived(
		trapParam !== null && (TRAP_KINDS as readonly string[]).includes(trapParam)
			? (trapParam as TrapKind)
			: null
	);
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));

	let snapKey = $state('');
	let lures = $state<LurePrompt[]>([]);
	let paraphraseIds = $state<string[]>([]);
	let qtypeIds = $state<string[]>([]);
	let step = $state(0);
	let phase = $state<LoopPhase>('locate');
	let picked = $state('');
	let locatedP = $state<number | null>(null);
	let heldId = $state<string | null>(null);
	let heldTrap = $state<TrapKind | null>(null);

	$effect(() => {
		const key = `${today}|${mode ?? ''}|${qtypeParam ?? ''}|${trapParam ?? ''}`;
		if (snapKey === key) return;
		snapKey = key;
		step = 0;
		phase = mode === 'lure' ? 'options' : 'locate';
		picked = '';
		locatedP = null;
		heldId = null;
		heldTrap = null;
		const state = untrack(() => ctx.state.readingFork);
		lures = selectLures(state, today);
		paraphraseIds = selectParaphraseDrills(state, today).map((row) => row.id);
		qtypeIds = qtypeOk && qtypeParam ? selectQtypeItems(state, qtypeParam as QType, today) : [];
	});

	let dueTrap = $derived(dueTraps(ctx.state.readingFork, today)[0]?.trap ?? null);
	let activeTrap = $derived(
		qtypeParam || mode === 'lure' || mode === 'paraphrase' ? null : (namedTrap ?? dueTrap)
	);
	let watchTrap = $derived(heldTrap ?? activeTrap);
	let trapItemId = $derived.by(() => {
		if (qtypeParam || mode === 'lure' || mode === 'paraphrase') return null;
		if (phase === 'feedback' && heldId) return heldId;
		if (!activeTrap) return null;
		return selectTrapItem(ctx.state.readingFork, activeTrap, today);
	});
	let loopIds = $derived(qtypeParam ? qtypeIds : mode === 'paraphrase' ? paraphraseIds : []);
	let loopId = $derived(
		heldId && (qtypeParam || mode === 'paraphrase') ? heldId : (loopIds[step] ?? null)
	);
	let lure = $derived(mode === 'lure' ? (lures[step] ?? null) : null);
	let activeId = $derived(
		mode === 'lure'
			? (lure?.itemId ?? null)
			: qtypeParam || mode === 'paraphrase'
				? loopId
				: trapItemId
	);
	let passage = $derived(activeId ? findPassage(itemSlug(activeId) ?? '') : undefined);
	let item = $derived(passage && activeId ? dailyLoopItem(passage, activeId) : null);
	let answerP = $derived(item?.evidence?.[0]?.p ?? null);
	let mapEntries = $derived(passage ? paragraphMapFor(passage.slug) : []);

	$effect(() => {
		if (!passage || !item || !activeId) {
			setTextChat(null);
			return;
		}
		setTextChat(
			textChatFromLoop({
				passageText: passage.text,
				paragraphMap: mapEntries,
				items: [{ id: activeId, item }],
				answeredIds: phase === 'feedback' ? new Set([activeId]) : new Set(),
				activeId,
				activePhase: phase
			})
		);
		return () => setTextChat(null);
	});
	let sequenceDone = $derived(
		(mode === 'lure' && lures.length > 0 && step >= lures.length) ||
			((Boolean(qtypeParam) || mode === 'paraphrase') &&
				loopIds.length > 0 &&
				step >= loopIds.length)
	);

	function logAttempt(
		itemId: string,
		passageSlug: string,
		source: AttemptSource,
		letter: string,
		correct: boolean
	) {
		const locateHit = locatedP === null || answerP === null ? null : locatedP === answerP;
		ctx.state.readingFork.attempts = appendAttempt(ctx.state.readingFork.attempts, {
			itemId,
			origin: originForItem(itemId),
			passageSlug,
			source,
			at: today,
			picked: letter,
			correct,
			locateP: locatedP,
			locateHit,
			ms: 0
		});
	}

	function locate(p: number) {
		locatedP = p;
		phase = 'options';
	}

	function skipLocate() {
		locatedP = null;
		phase = 'options';
	}

	function checkLoop() {
		const itemId = activeId;
		const current = item;
		const currentPassage = passage;
		const kind = watchTrap;
		const letter = picked;
		if (!letter || !current || !currentPassage || !itemId || phase === 'feedback') return;
		const correct = letter === current.answer;
		const trapDrill = !qtypeParam && mode !== 'lure' && mode !== 'paraphrase';
		const source: AttemptSource = mode === 'paraphrase' ? 'paraphrase' : 'drill';
		logAttempt(itemId, currentPassage.slug, source, letter, correct);
		if (trapDrill) {
			if (!correct) {
				ctx.state.readingFork.traps = recordMiss(
					ctx.state.readingFork,
					itemId,
					letter,
					today
				).traps;
			}
			if (kind) {
				ctx.state.readingFork.traps = ctx.state.readingFork.traps.map((card) =>
					card.trap === kind ? gradeTrap(card, correct, today) : card
				);
			}
			heldTrap = kind;
		} else if (!correct) {
			ctx.state.readingFork.traps = recordMiss(ctx.state.readingFork, itemId, letter, today).traps;
		}
		heldId = itemId;
		phase = 'feedback';
		void ctx.refreshCardsDue();
		playSfx(correct ? 'correct' : 'wrong');
	}

	function checkLure() {
		if (!lure || !picked || !passage || phase === 'feedback') return;
		const correct = picked === lure.trap;
		logAttempt(lure.itemId, passage.slug, 'lure', picked, correct);
		phase = 'feedback';
		playSfx(correct ? 'correct' : 'wrong');
	}

	function advance() {
		phase = mode === 'lure' ? 'options' : 'locate';
		picked = '';
		locatedP = null;
		heldId = null;
		heldTrap = null;
		if (mode === 'lure' || mode === 'paraphrase' || qtypeParam) step += 1;
	}
</script>

<div class="cards-page stagger">
	<p class="eyebrow">The trap, on the text</p>
	<h1>Debrief</h1>
	<nav class="modes" aria-label="Drill modes">
		<a href={resolve('/cards')} class:on={!mode && !qtypeParam}>Traps</a>
		<a href="{resolve('/cards')}?mode=lure" class:on={mode === 'lure'}>Spot the lure</a>
		<a href="{resolve('/cards')}?mode=paraphrase" class:on={mode === 'paraphrase'}>Paraphrase</a>
	</nav>

	{#if qtypeParam && !qtypeOk}
		<Card variant="soft-peach">
			<p>That question type is not on the exam.</p>
		</Card>
	{:else if sequenceDone}
		<Card variant="soft-lavender">
			<h2>Done for now.</h2>
			<a class="btn" href={resolve('/cards')}>Back to traps</a>
		</Card>
	{:else if mode === 'lure' && lures.length === 0}
		<Card variant="soft-peach">
			<p>Nothing to spot yet. Finish the daily text.</p>
			<a class="btn" href={resolve('/eval')}>Daily text</a>
		</Card>
	{:else if mode === 'paraphrase' && paraphraseIds.length === 0}
		<Card variant="soft-peach">
			<p>No paraphrase yet. Finish the daily text.</p>
			<a class="btn" href={resolve('/eval')}>Daily text</a>
		</Card>
	{:else if qtypeParam && qtypeIds.length === 0}
		<Card variant="soft-peach">
			<p>No items of that type are ready.</p>
		</Card>
	{:else if !qtypeParam && mode !== 'lure' && mode !== 'paraphrase' && !activeTrap && !heldId}
		<Card variant="soft-peach">
			<p>Nothing to debrief. Finish the daily text.</p>
			<a class="btn" href={resolve('/eval')}>Daily text</a>
		</Card>
	{:else if passage && mode === 'lure' && lure}
		<PracticeBook years={bookYears} />
		<ReadingLoop
			{passage}
			highlight={phase === 'feedback' ? (item?.evidence ?? []) : []}
			scrollToEvidence={phase === 'feedback'}
		>
			{#snippet question()}
				<p class="lure-kicker">What is wrong with this option?</p>
				<p class="lure-text">{lure.text}</p>
				{#if phase !== 'feedback'}
					<div class="opts">
						{#each lure.choices as choice (choice)}
							<button
								type="button"
								class="opt"
								class:picked={picked === choice}
								onclick={() => (picked = choice)}
							>
								{TRAP_LABEL[choice]}
							</button>
						{/each}
					</div>
					<button type="button" class="btn" disabled={!picked} onclick={checkLure}>Check</button>
				{:else}
					<p class="verdict">{picked === lure.trap ? 'Right.' : 'Not this one.'}</p>
					<p>{TRAP_LABEL[lure.trap]}. {lure.why}</p>
					<button type="button" class="btn" onclick={advance}>Next</button>
				{/if}
			{/snippet}
		</ReadingLoop>
	{:else if passage && item && (mode === 'paraphrase' || qtypeParam || watchTrap)}
		<PracticeBook years={bookYears} />
		<ReadingLoop
			{passage}
			highlight={phase === 'feedback' ? (item.evidence ?? []) : []}
			locateMode={phase === 'locate'}
			onLocate={locate}
			{locatedP}
			scrollToEvidence={phase === 'feedback'}
		>
			{#snippet question()}
				{#if watchTrap && !qtypeParam && mode !== 'paraphrase'}
					<p class="watch">Watch for: {TRAP_LABEL[watchTrap]}</p>
					<p class="watch-why">{TRAP_EXPLANATION[watchTrap]}</p>
				{/if}
				{#if qtypeOk && qtypeParam}
					<p class="watch">{QTYPE_LABEL[qtypeParam as QType]}</p>
				{/if}
				<QuestionBlock
					{item}
					{phase}
					paragraphMap={mapEntries}
					{picked}
					shuffle={true}
					seed={`${item.id}|${today}`}
					{locatedP}
					{answerP}
					onPick={(letter) => (picked = letter)}
					onCheck={checkLoop}
					onSkip={skipLocate}
				/>
				{#if phase === 'feedback'}
					<button type="button" class="btn" onclick={advance}>Next</button>
				{/if}
			{/snippet}
		</ReadingLoop>
	{:else if watchTrap}
		<Card variant="soft-peach">
			<p>No fresh item for {TRAP_LABEL[watchTrap]}.</p>
			<a class="btn" href={resolve('/eval')}>Daily text</a>
		</Card>
	{/if}
</div>

<style>
	.cards-page {
		padding: 0.5rem 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	.eyebrow {
		font-size: var(--text-micro);
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
	}
	h2 {
		font-size: var(--text-title);
		margin-bottom: 0.75rem;
	}
	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.modes a {
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 2px solid var(--color-ink);
		text-decoration: none;
		color: var(--color-ink);
		font-weight: 700;
		background: #fff;
	}
	.modes a.on {
		background: var(--color-pink, #ff9bb8);
	}
	.watch,
	.watch-why,
	.lure-kicker,
	.lure-text,
	.verdict {
		margin: 0;
		line-height: 1.45;
	}
	.watch,
	.verdict,
	.lure-kicker {
		font-weight: 700;
	}
	.watch-why,
	.lure-text {
		color: var(--color-ink);
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.opt {
		font: inherit;
		text-align: left;
		cursor: pointer;
		border: 2px solid var(--color-ink);
		border-radius: 10px;
		background: white;
		padding: 0.55rem 0.7rem;
	}
	.opt.picked {
		background: color-mix(in srgb, var(--color-lavender) 35%, white);
	}
	.btn {
		display: inline-flex;
		margin-top: 8px;
		padding: 10px 16px;
		border-radius: 999px;
		border: 3px solid var(--color-ink);
		background: var(--color-pink, #ff9bb8);
		color: var(--color-ink);
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}
	.btn:disabled {
		opacity: 0.45;
		cursor: default;
	}
</style>
