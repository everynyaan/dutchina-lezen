<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { markMissSeen, unseenMisses } from '$lib/reading/eval';
	import MissReview from '$lib/components/reading/MissReview.svelte';
	import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
	import { bookYearsFor } from '$lib/reading/practiceBook';
	import Card from '$lib/components/ui/Card.svelte';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();

	let open = $derived(unseenMisses(ctx.state.readingFork.misses));
	let bookYears = $derived(bookYearsFor(ctx.state.readingFork, ctx.state.lezen.questionResults));

	function seen(questionId: string) {
		ctx.state.readingFork.misses = markMissSeen(ctx.state.readingFork.misses, questionId);
	}
</script>

<div class="cards-page stagger">
	<p class="eyebrow">The miss, on the sentence</p>
	<h1>Debrief</h1>

	{#if open.length === 0}
		<Card variant="soft-peach">
			<p>Nothing to debrief. Finish today's text.</p>
			<a class="btn" href={resolve('/eval')}>Daily text</a>
		</Card>
	{:else}
		<PracticeBook years={bookYears} />
		{#each open as miss (miss.questionId)}
			<Card>
				<MissReview questionId={miss.questionId} picked={miss.picked} />
				<button type="button" class="btn" onclick={() => seen(miss.questionId)}>Seen</button>
			</Card>
		{/each}
	{/if}
</div>

<style>
	.cards-page {
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
	h1 {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		margin: 0;
	}
	.btn {
		display: inline-flex;
		padding: 10px 16px;
		border-radius: 999px;
		border: 3px solid var(--color-ink);
		background: var(--color-pink, #ff9bb8);
		font-weight: 700;
		text-decoration: none;
		color: var(--color-ink);
		cursor: pointer;
		margin-top: 10px;
	}
</style>
