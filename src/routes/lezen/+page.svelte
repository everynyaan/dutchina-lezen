<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
	import { findPassage } from '$lib/reading/bank';
	import { appendAttempt, dailyLoopItem } from '$lib/reading/daily';
	import { BOOKLET_PASS_LABEL } from '$lib/reading/mock';
	import { practiceItemsFor } from '$lib/reading/practice';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import { recentOfficial, seenLabel, seenTimes } from '$lib/reading/texts';
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
	let practiceCount = $derived(passage ? practiceItemsFor(passage.slug).length : 0);
	let ids = $derived(
		passage
			? mode === 'practice'
				? practiceItemsFor(passage.slug).map((item) => item.id)
				: passage.questions.map((question) => question.id)
			: []
	);
	let activeId = $derived(ids[index] ?? null);
	let item = $derived(passage && activeId ? dailyLoopItem(passage, activeId) : null);
	let answerP = $derived(item?.evidence?.[0]?.p ?? null);

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
		if (!passage || practiceItemsFor(passage.slug).length === 0) return;
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
			origin: itemId.startsWith('lezen-') ? 'official' : 'practice',
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
		<p class="pass">{BOOKLET_PASS_LABEL}</p>
		<PracticeBook years={bookYears} />
		{#each years as exam (exam.year)}
			<section class="year">
				<h2>{exam.year}</h2>
				{#if reserved.includes(exam.year)}
					<p class="saved">{exam.year} is saved for your mock.</p>
				{:else}
					<ul>
						{#each exam.passages as row (row.slug)}
							<li>
								<button type="button" class="passage" onclick={() => openPassage(row.slug)}>
									<span class="name">{row.name}</span>
									<span class="intro">{row.intro}</span>
									<span class="meta">{timesFor(row.slug)}. {row.questions.length} questions</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/each}
	{:else if passage}
		<button type="button" class="back" onclick={backToList}>Back</button>
		<PracticeBook years={bookYears} />
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
			<label class="exam-style">
				<input type="checkbox" bind:checked={examStyle} disabled={reviewing || index > 0} />
				Exam style: feedback at the end
			</label>
			<p class="count">
				Question {index + 1} of {ids.length}
				{#if flags[item.id]}<span class="flagged">Flagged</span>{/if}
			</p>
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
	.pass,
	.saved,
	.intro,
	.meta,
	.count {
		margin: 0;
		line-height: 1.45;
	}
	.pass,
	.saved,
	.intro,
	.meta {
		color: var(--color-ink);
	}
	.year ul {
		list-style: none;
		margin: 0.6rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.passage {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		text-align: left;
		font: inherit;
		color: var(--color-ink);
		background: #fff;
		border: 2px solid var(--color-ink);
		border-radius: 12px;
		padding: 0.75rem 0.9rem;
		cursor: pointer;
	}
	.name {
		font-weight: 700;
	}
	.meta {
		color: var(--color-muted-ink);
		font-size: 0.92rem;
	}
	.exam-style {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
	}
	.count {
		font-weight: 700;
	}
	.flagged {
		margin-left: 0.5rem;
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
