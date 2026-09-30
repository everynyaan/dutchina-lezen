<script lang="ts">
	import { TRAP_LABEL } from '$lib/reading/annotations';
	import { temptingLure, type LoopItem, type ResolvedLoopItem } from '$lib/reading/loop';

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
</script>

<div class="feedback">
	{#if correct}
		<p class="verdict">Right.</p>
		<p>{resolved.why}</p>
	{:else}
		<p class="verdict">Not this one.</p>
		{#if pickedTrap}
			<p>{TRAP_LABEL[pickedTrap.trap]}. {pickedTrap.why}</p>
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
		font-size: 1rem;
		line-height: 1.45;
	}
	.verdict {
		font-weight: 700;
		margin: 0;
	}
	p {
		margin: 0;
	}
</style>
