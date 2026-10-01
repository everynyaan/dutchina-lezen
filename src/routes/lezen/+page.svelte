<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
	import { findPassage } from '$lib/reading/bank';
	import { appendAttempt, dailyLoopItem } from '$lib/reading/daily';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import KuromiBubble from '$lib/components/reading/KuromiBubble.svelte';
	import TextCard from '$lib/components/reading/TextCard.svelte';
	import TypeGrid from '$lib/components/reading/TypeGrid.svelte';
	import { paragraphMapFor, practiceItemsFor } from '$lib/reading/practice';
	import { page } from '$app/stores';
	import { textChatFromLoop } from '$lib/kuromi/coach';
	import { chatNotebook, notebookOf } from '$lib/reading/notebook';
	import { setTextChat } from '$lib/kuromi/focus';
	import { reflexLine } from '$lib/kuromi/lines';
	import { isKuromiLive } from '$lib/kuromi/live';
	import { requestKuromiChat } from '$lib/kuromi/visibility.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import { recentOfficial, seenLabel, seenTimes } from '$lib/reading/texts';
	import { originForItem } from '$lib/reading/sets';
	import { recordMiss } from '$lib/reading/traps';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import QuestionBlock from '$lib/components/reading/QuestionBlock.svelte';
	import ReadingLoop from '$lib/components/reading/ReadingLoop.svelte';
	import type { LoopPhase } from '$lib/reading/loop';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';

	const ctx = getGameContext();
	const today = getTodayDate();

	type Mode = 'official' | 'practice';
	type Stage = 'list' | 'warn' | 'loop' | 'done';
	type Stored = { picked: string; correct: boolean; locateP: number | null };

	let stage = $state<Stage>('list');
	let listFilter = $state<'all' | 'unseen' | 'seen' | 'type'>('all');
	let mode = $state<Mode>('official');
	let slug = $state<string | null>(null);
	let examStyle = $state(false);
	let reviewing = $state(false);
	let index = $state(0);
	let phase = $state<LoopPhase>('locate');
	let picked = $state('');
	let locatedP = $state<number | null>(null);
	let answers = $state<Record<string, Stored>>({});
	let flags = $state<Record<string, boolean>>({});

	let reserved = $derived(ctx.state.readingFork.settings?.reservedPapers ?? [2023]);
	let years = $derived([...LEZEN_EXAMS].sort((a, b) => b.year - a.year));
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));
	let passage = $derived(slug ? findPassage(slug) : undefined);
	let attempted = $derived(ctx.state.readingFork.attempts.map((row) => row.itemId));
	let practiceCount = $derived(passage ? practiceItemsFor(passage.slug, attempted).length : 0);
	let ids = $derived(
		passage
			? mode === 'practice'
				? practiceItemsFor(passage.slug, attempted).map((item) => item.id)
				: passage.questions.map((question) => question.id)
			: []
	);
	let activeId = $derived(ids[index] ?? null);
	let item = $derived(passage && activeId ? dailyLoopItem(passage, activeId) : null);
	let answerP = $derived(item?.evidence?.[0]?.p ?? null);
	let live = isKuromiLive();
	let askLabel = reflexLine('ask-label');
	let mapEntries = $derived(passage ? paragraphMapFor(passage.slug) : []);

	$effect(() => {
		if (!passage || stage === 'list') {
			setTextChat(null);
			return;
		}
		const rows = ids.flatMap((id) => {
			const loop = dailyLoopItem(passage, id);
			return loop ? [{ id, item: loop }] : [];
		});
		setTextChat(
			textChatFromLoop({
				passageText: passage.text,
				paragraphMap: mapEntries,
				items: rows,
				answeredIds: new Set(Object.keys(answers)),
				activeId,
				activePhase: phase,
				notebook: chatNotebook(notebookOf(ctx.state.readingFork).entries, passage.slug)
			})
		);
		return () => setTextChat(null);
	});

	$effect(() => {
		const wanted = $page.url.searchParams.get('passage');
		if (!wanted || wanted === slug) return;
		openPassage(wanted);
	});

	function timesFor(passageSlug: string): string {
		return seenLabel(seenTimes(ctx.state.readingFork, passageSlug));
	}

	function resetRun() {
		index = 0;
		phase = 'locate';
		picked = '';
		locatedP = null;
		reviewing = false;
		answers = {};
		flags = {};
	}

	function openPassage(nextSlug: string) {
		const next = findPassage(nextSlug);
		if (!next || reserved.includes(next.year)) return;
		slug = nextSlug;
		mode = 'official';
		resetRun();
		stage = recentOfficial(ctx.state.readingFork, next, today) ? 'warn' : 'loop';
	}

	function startPractice() {
		if (!passage || practiceItemsFor(passage.slug, attempted).length === 0) return;
		mode = 'practice';
		resetRun();
		stage = 'loop';
	}

	function startOfficial() {
		mode = 'official';
		resetRun();
		stage = 'loop';
	}

	function backToList() {
		stage = 'list';
		slug = null;
		resetRun();
	}

	function locate(p: number) {
		locatedP = p;
		phase = 'options';
	}

	function skipLocate() {
		locatedP = null;
		phase = 'options';
	}

	function toggleFlag() {
		const id = activeId;
		if (!id) return;
		flags = { ...flags, [id]: !flags[id] };
	}

	function showStored(nextIndex: number) {
		const id = ids[nextIndex];
		const stored = id ? answers[id] : undefined;
		index = nextIndex;
		picked = stored?.picked ?? '';
		locatedP = stored?.locateP ?? null;
		phase = 'feedback';
	}

	function check() {
		if (!picked || !item || !passage || !activeId) return;
		const itemId = activeId;
		const slugNow = passage.slug;
		const answer = item.answer;
		const evidenceP = item.evidence?.[0]?.p ?? null;
		const pickedNow = picked;
		const locatedNow = locatedP;
		const correct = pickedNow === answer;
		const locateHit = locatedNow === null || evidenceP === null ? null : locatedNow === evidenceP;
		const atIndex = index;
		const defer = examStyle && !reviewing;
		ctx.state.readingFork.attempts = appendAttempt(ctx.state.readingFork.attempts, {
			itemId,
			origin: originForItem(itemId),
			passageSlug: slugNow,
			source: 'texts',
			at: today,
			picked: pickedNow,
			correct,
			locateP: locatedNow,
			locateHit,
			ms: 0
		});
		if (!correct) {
			const next = recordMiss(ctx.state.readingFork, itemId, pickedNow, today);
			ctx.state.readingFork.traps = next.traps;
		}
		answers = {
			...answers,
			[itemId]: { picked: pickedNow, correct, locateP: locatedNow }
		};
		playSfx(correct ? 'correct' : 'wrong');
		if (defer) {
			if (atIndex + 1 < ids.length) {
				index = atIndex + 1;
				phase = 'locate';
				picked = '';
				locatedP = null;
			} else {
				reviewing = true;
				showStored(0);
			}
			return;
		}
		phase = 'feedback';
	}

	function advance() {
		if (index + 1 < ids.length) {
			if (reviewing) showStored(index + 1);
			else {
				index += 1;
				phase = 'locate';
				picked = '';
				locatedP = null;
			}
			return;
		}
		stage = 'done';
	}
</script>

<div class="texts-page">
	{#if stage === 'list'}
		<p class="eyebrow">Training papers</p>
		<h1>Texts</h1>
		<div class="filters">
			{#each ['all', 'unseen', 'seen', 'type'] as chip (chip)}
				<button
					type="button"
					class="chip"
					class:on={listFilter === chip}
					onclick={() => (listFilter = chip as typeof listFilter)}
				>
					{chip === 'type' ? 'by type' : chip}
				</button>
			{/each}
		</div>
		{#if listFilter === 'type'}
			<TypeGrid />
		{:else}
			{#each years as exam (exam.year)}
				{@const rows = exam.passages.filter((row) => {
					const times = seenTimes(ctx.state.readingFork, row.slug);
					if (listFilter === 'unseen') return times === 0;
					if (listFilter === 'seen') return times > 0;
					return true;
				})}
				<section class="year">
					<h2 class="jit-a">
						{exam.year}
						<Doodle name="shape-swirl-loops-4" size={28} color="var(--color-rose-deep)" />
					</h2>
					{#if reserved.includes(exam.year) && listFilter === 'all'}
						<TextCard
							title={`${exam.year}, sealed for your mock on 12 Oct`}
							source="Reserved paper"
							tint="lavender"
							locked
						>
							{#snippet badges()}
								<span class="chip ink">locked</span>
							{/snippet}
						</TextCard>
					{:else if !reserved.includes(exam.year)}
						<div class="text-grid">
							{#each rows as row (row.slug)}
								{@const times = seenTimes(ctx.state.readingFork, row.slug)}
								<TextCard
									title={row.name}
									source={row.intro}
									tint="peach"
									onclick={() => openPassage(row.slug)}
								>
									{#snippet badges()}
										<span class="chip">{exam.year}</span>
										<span class="chip">{row.questions.length} questions</span>
										{#if times === 0}
											<span class="chip teal">unseen</span>
										{:else}
											<span class="chip">{timesFor(row.slug)}</span>
										{/if}
									{/snippet}
								</TextCard>
							{:else}
								<KuromiBubble>
									<p>Nothing in this filter. Try all.</p>
								</KuromiBubble>
							{/each}
						</div>
					{/if}
				</section>
			{/each}
		{/if}
	{:else if passage}
		<button type="button" class="back" onclick={backToList}>Back</button>
		{#if live && askLabel}
			<button type="button" class="back" onclick={() => requestKuromiChat()}>{askLabel}</button>
		{/if}
		{#if stage === 'warn'}
			<Card variant="soft-peach">
				<p>You answered these recently. Try the practice questions instead.</p>
				{#if practiceCount > 0}
					<button type="button" class="btn" onclick={startPractice}>Practice questions</button>
				{:else}
					<p>There are no practice questions for this text.</p>
				{/if}
				<button type="button" class="btn ghost" onclick={startOfficial}>Official questions</button>
			</Card>
		{:else if stage === 'done'}
			<Card variant="soft-lavender">
				<h2>Finished this text.</h2>
				<p>
					{Object.values(answers).filter((row) => row.correct).length} of {ids.length} right.
				</p>
			</Card>
		{:else if item}
			<PracticeBook years={bookYears} />
			<label class="exam-style">
				<input type="checkbox" bind:checked={examStyle} disabled={reviewing || index > 0} />
				Exam style: feedback at the end
			</label>
			<p class="sr-only">
				Question {index + 1} of {ids.length}
				{#if flags[item.id]}Flagged{/if}
			</p>
			<div class="dots" aria-hidden="true">
				{#each ids as id, dot (id)}
					<span class:on={dot === index} class:done={Boolean(answers[id])}></span>
				{/each}
			</div>
			<ReadingLoop
				{passage}
				highlight={phase === 'feedback' ? (item.evidence ?? []) : []}
				locateMode={phase === 'locate'}
				onLocate={locate}
				{locatedP}
				scrollToEvidence={phase === 'feedback'}
			>
				{#snippet question()}
					<QuestionBlock
						{item}
						{phase}
						paragraphMap={mapEntries}
						{picked}
						shuffle={true}
						seed={item.id}
						flaggable={true}
						flagged={!!flags[item.id]}
						{locatedP}
						{answerP}
						onPick={(letter) => (picked = letter)}
						onCheck={check}
						onSkip={skipLocate}
						onFlag={toggleFlag}
					/>
					{#if phase === 'feedback'}
						<button type="button" class="btn" onclick={advance}>Next</button>
					{/if}
				{/snippet}
			</ReadingLoop>
		{/if}
	{/if}
</div>

<style>
	.texts-page {
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
	.filters,
	.text-grid,
	.dots {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.text-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		margin-top: 8px;
	}
	.filters .chip,
	.dots span {
		font: inherit;
	}
	.filters .chip {
		border: none;
		background: white;
		border-radius: 999px;
		padding: 6px 12px;
		font-weight: 700;
		font-size: 14px;
		cursor: pointer;
		box-shadow: var(--shadow-offset-pill);
	}
	.filters .chip.on {
		background: var(--color-rose);
	}
	.dots span {
		width: 10px;
		height: 10px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-ink) 18%, white);
	}
	.dots span.on {
		background: var(--color-rose-deep);
	}
	.dots span.done {
		background: var(--color-teal-deep);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	h2 :global(.doodle) {
		vertical-align: middle;
	}
	@media (max-width: 900px) {
		.text-grid {
			grid-template-columns: 1fr;
		}
	}
	.exam-style {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
	}
	.back,
	.btn {
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		border: 3px solid var(--color-ink);
		border-radius: 999px;
		background: var(--color-pink, #ff9bb8);
		color: var(--color-ink);
		padding: 10px 16px;
	}
	.back,
	.btn.ghost {
		background: #fff;
	}
	.btn {
		display: inline-flex;
		margin: 0.75rem 0.5rem 0 0;
	}
</style>
