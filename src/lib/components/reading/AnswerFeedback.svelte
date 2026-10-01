<script lang="ts">
	import { TRAP_LABEL } from '$lib/reading/annotations';
	import { findQuestion } from '$lib/reading/bank';
	import { temptingLure, type LoopItem, type ResolvedLoopItem } from '$lib/reading/loop';
	import { addTrapEntry, notebookOf, withNotebook } from '$lib/reading/notebook';
	import { reflexLine } from '$lib/kuromi/lines';
	import { getGameContext } from '$lib/state/context';

	interface Props {
		item: LoopItem;
		resolved: ResolvedLoopItem;
		picked: string;
		locatedP?: number | null;
		answerP?: number | null;
	}

	let { item, resolved, picked, locatedP = null, answerP = null }: Props = $props();

	let correct = $derived(picked === item.answer);
	let pickedTrap = $derived(resolved.distractors[picked]);
	let lure = $derived(temptingLure(resolved.distractors, item.options));
	let looked = $derived(typeof locatedP === 'number' ? locatedP : null);
	let answerAt = $derived(typeof answerP === 'number' ? answerP : null);
	let samePlace = $derived(looked !== null && answerAt !== null && looked === answerAt);
	let missAsk = reflexLine('miss-ask');
	const ctx = getGameContext();

	function saveTrap() {
		if (!ctx || correct || !pickedTrap) return;
		const found = findQuestion(item.id);
		const evidence = resolved.evidence[0];
		ctx.state.readingFork = withNotebook(
			ctx.state.readingFork,
			addTrapEntry(notebookOf(ctx.state.readingFork), {
				question: item.question,
				passageSlug: found?.passage.slug ?? '',
				p: evidence?.p ?? 0,
				evidence: evidence?.quote ?? '',
				trap: pickedTrap.trap,
				itemId: item.id,
				picked,
				why: pickedTrap.why
			})
		);
	}
</script>

<div class="feedback">
	{#if correct}
		<p class="verdict">Right.</p>
		<p>{resolved.why}</p>
	{:else}
		<p class="verdict">Not this one.</p>
		{#if missAsk}
			<p>{missAsk}</p>
		{/if}
		{#if pickedTrap}
			<p>{TRAP_LABEL[pickedTrap.trap]}. {pickedTrap.why}</p>
			{#if ctx}
				<button type="button" class="add" onclick={saveTrap}>Add to notebook</button>
			{/if}
		{/if}
		<p>{resolved.why}</p>
	{/if}
	{#if lure}
		<p>The lure here: {lure.text} ({TRAP_LABEL[lure.trap]})</p>
	{/if}
	{#if looked !== null}
		{#if samePlace}
			<p>You found the right place.</p>
		{:else if answerAt !== null}
			<p>You looked in paragraph {looked + 1}; the answer is in paragraph {answerAt + 1}.</p>
		{/if}
	{/if}
</div>

<style>
	.feedback {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		font-size: 17px;
		line-height: 1.45;
		padding: 10px 12px;
		border-radius: 16px;
		background: color-mix(in srgb, var(--color-teal) 28%, white);
	}
	.verdict {
		font-weight: 700;
		margin: 0;
	}
	p {
		margin: 0;
	}
	.add {
		font: inherit;
		cursor: pointer;
		align-self: flex-start;
	}
</style>
