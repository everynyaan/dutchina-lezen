<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { findPassage } from '$lib/reading/bank';
	import { appendAttempt, dailyLoopItem, mapAttempt } from '$lib/reading/daily';
	import { applyShowUpStreak, ensureTodayEval } from '$lib/reading/eval';
	import { QTYPE_LABEL, TRAP_LABEL } from '$lib/reading/annotations';
	import { paragraphMapFor, paraphraseById } from '$lib/reading/practice';
	import { recordMiss } from '$lib/reading/traps';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import ParagraphMap from '$lib/components/reading/ParagraphMap.svelte';
	import QuestionBlock from '$lib/components/reading/QuestionBlock.svelte';
	import ReadingLoop from '$lib/components/reading/ReadingLoop.svelte';
	import type { LoopPhase } from '$lib/reading/loop';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	function primeEval() {
		const next = ensureTodayEval(ctx.state.readingFork, today);
		if (next !== ctx.state.readingFork.eval) {
			ctx.state.readingFork.eval = next;
		}
	}
	primeEval();

	$effect.pre(() => {
		primeEval();
	});

	let evalState = $derived(ctx.state.readingFork.eval);
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));
	let passage = $derived(evalState.passageSlug ? findPassage(evalState.passageSlug) : undefined);
	let mapEntries = $derived(passage ? paragraphMapFor(passage.slug) : []);
	let openId = $derived(
		evalState.itemIds.find((id) => evalState.answers[id] === undefined) ?? null
	);
	let holding = $state<string | null>(null);
	let activeId = $derived(holding ?? openId);
	let finished = $derived(
		!holding &&
			(evalState.completed ||
				(evalState.mapDone && evalState.itemIds.length > 0 && openId === null))
	);
	let item = $derived(passage && activeId ? dailyLoopItem(passage, activeId) : null);

	let phase = $state<LoopPhase>('locate');
	let picked = $state('');
	let locatedP = $state<number | null>(null);

	let answerP = $derived(item?.evidence?.[0]?.p ?? null);

	function finishMap() {
		if (!passage) return;
		ctx.state.readingFork.attempts = appendAttempt(
			ctx.state.readingFork.attempts,
			mapAttempt(passage.slug, today)
		);
		ctx.state.readingFork.eval.mapDone = true;
	}

	function locate(p: number) {
		locatedP = p;
		phase = 'options';
	}

	function skipLocate() {
		locatedP = null;
		phase = 'options';
	}

	function check() {
		if (!picked || !item || !passage || !activeId || holding) return;
		const correct = picked === item.answer;
		const locateHit = locatedP === null || answerP === null ? null : locatedP === answerP;
		const itemId = activeId;
		ctx.state.readingFork.eval.answers = {
			...ctx.state.readingFork.eval.answers,
			[itemId]: { picked, correct, locateP: locatedP }
		};
		ctx.state.readingFork.attempts = appendAttempt(ctx.state.readingFork.attempts, {
			itemId,
			origin: itemId.startsWith('lezen-') ? 'official' : 'practice',
			passageSlug: passage.slug,
			source: paraphraseById(itemId) ? 'paraphrase' : 'daily',
			at: today,
			picked,
			correct,
			locateP: locatedP,
			locateHit,
			ms: 0
		});
		if (!correct) {
			const next = recordMiss(ctx.state.readingFork, itemId, picked, today);
			ctx.state.readingFork.traps = next.traps;
		}
		holding = itemId;
		phase = 'feedback';
		playSfx(correct ? 'correct' : 'wrong');
	}

	function advance() {
		holding = null;
		phase = 'locate';
		picked = '';
		locatedP = null;
		const answers = ctx.state.readingFork.eval.answers;
		const allIn = evalState.itemIds.every((id) => answers[id]);
		if (allIn) {
			const streak = applyShowUpStreak(ctx.state.readingFork, today);
			ctx.state.readingFork.showUpStreak = streak.showUpStreak;
			ctx.state.readingFork.lastEvalDate = streak.lastEvalDate;
			ctx.state.readingFork.eval.completed = true;
		}
	}

	function foundLabel(itemId: string): string {
		const attempt = [...ctx.state.readingFork.attempts]
			.reverse()
			.find((row) => row.itemId === itemId && row.source !== 'map');
		if (!attempt || attempt.locateHit === null) return 'Not asked';
		return attempt.locateHit ? 'Yes' : 'No';
	}

	function rowLabel(itemId: string): string {
		if (paraphraseById(itemId)) return 'Paraphrase';
		const loop = passage ? dailyLoopItem(passage, itemId) : null;
		return loop?.qtype ? QTYPE_LABEL[loop.qtype] : 'Question';
	}

	function trapLabel(itemId: string, pickedLetter: string): string {
		const loop = passage ? dailyLoopItem(passage, itemId) : null;
		const trap = loop?.distractors?.[pickedLetter]?.trap;
		return trap ? TRAP_LABEL[trap] : '';
	}
</script>

<div class="eval-page stagger">
	<p class="eyebrow">One passage</p>
	<h1>Daily text</h1>
	<p class="kuromi-line">
		About 15 minutes. The published papers needed 24 of 35. Aim for 25 or more.
	</p>

	{#if !passage}
		<p>No text is ready today.</p>
	{:else if !evalState.mapDone}
		<p class="kuromi-line">About 2 minutes. Map the paragraphs before the questions.</p>
		<PracticeBook years={bookYears} />
		<ParagraphMap
			{passage}
			entries={mapEntries}
			seed={`${passage.slug}|${today}`}
			onDone={finishMap}
		/>
	{:else if finished || !item}
		<Card variant="soft-lavender">
			<h2>Done for today.</h2>
			<ul class="done">
				{#each evalState.itemIds as id (id)}
					{@const answer = evalState.answers[id]}
					<li>
						<strong>{rowLabel(id)}.</strong>
						{answer?.correct ? 'Right.' : 'Wrong.'}
						{#if answer && !answer.correct && trapLabel(id, answer.picked)}
							{trapLabel(id, answer.picked)}.
						{/if}
						Found the paragraph: {foundLabel(id)}.
					</li>
				{/each}
			</ul>
			<a class="btn" href={resolve('/cards')}>Debrief</a>
			<a class="btn ghost" href={resolve('/lezen')}>browse the training papers</a>
			<a class="btn ghost" href={resolve('/')}>Home</a>
		</Card>
	{:else}
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
				<QuestionBlock
					{item}
					{phase}
					{picked}
					shuffle={true}
					seed={`${item.id}|${today}`}
					{locatedP}
					{answerP}
					onPick={(letter) => (picked = letter)}
					onCheck={check}
					onSkip={skipLocate}
				/>
				{#if phase === 'feedback'}
					<button type="button" class="btn" onclick={advance}>Next</button>
				{/if}
			{/snippet}
		</ReadingLoop>
	{/if}
</div>

<style>
	.eval-page {
		padding: 0.5rem 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	.eyebrow {
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1 {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		margin: 0;
		line-height: 1.1;
	}
	h2 {
		font-family: var(--font-display);
		font-size: var(--text-title);
		margin: 0.35rem 0 0.75rem;
	}
	.kuromi-line {
		color: var(--color-ink);
		font-size: var(--text-base);
		line-height: 1.5;
		margin: 0;
	}
	.done {
		margin: 0 0 1rem;
		padding-left: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.btn {
		display: inline-flex;
		margin-top: 8px;
		margin-right: 8px;
		padding: 10px 16px;
		border-radius: 999px;
		border: 3px solid var(--color-ink);
		background: var(--color-pink, #ff9bb8);
		color: var(--color-ink);
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}
	.btn.ghost {
		background: #fff;
	}
</style>
