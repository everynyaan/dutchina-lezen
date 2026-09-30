<script lang="ts">
	import { page } from '$app/stores';
	import { getGameContext } from '$lib/state/context';
	import { examForYear } from '$lib/reading/mockSession';
	import { examForSet, horizonLocked } from '$lib/reading/sets';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	let year = $derived(Number($page.url.searchParams.get('paper')));
	let setId = $derived($page.url.searchParams.get('set'));
	let exam = $derived(
		setId ? examForSet(setId, !horizonLocked(ctx.state.readingFork.mocks)) : examForYear(year)
	);
</script>

<div class="booklet">
	{#if exam}
		<p class="screen-only">
			{#if setId}
				<a href={resolve('/sets')}>Back to practice sets</a>
			{:else}
				<a href={resolve('/mock')}>Back to the mock</a>
			{/if}
			<button type="button" onclick={() => window.print()}>Print</button>
		</p>
		{#each exam.passages as passage, index (passage.slug)}
			<article class="passage">
				<p class="source">{passage.intro}</p>
				<h1>{passage.name}</h1>
				<p class="text">{passage.text}</p>
				<p class="mark">Text {index + 1}</p>
			</article>
		{/each}
	{:else}
		<p>That paper is not in the bank.</p>
		{#if setId}
			<a href={resolve('/sets')}>Back to practice sets</a>
		{:else}
			<a href={resolve('/mock')}>Back to the mock</a>
		{/if}
	{/if}
</div>

<style>
	.booklet {
		font-family: Georgia, 'Times New Roman', serif;
		color: #111;
		background: #fff;
	}
	.source {
		margin: 0 0 0.4rem;
		font-size: 12pt;
	}
	h1 {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 18pt;
		line-height: 1.25;
		margin: 0 0 0.8rem;
	}
	.text {
		font-size: 12pt;
		line-height: 1.45;
		white-space: pre-wrap;
		margin: 0;
	}
	.mark {
		margin: 1rem 0 0;
		font-size: 11pt;
	}
	.passage {
		break-after: page;
		page-break-after: always;
		margin-bottom: 2rem;
	}
	.screen-only {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	.screen-only button,
	.screen-only a {
		font: inherit;
	}
	@media print {
		@page {
			size: A4;
			margin: 16mm;
		}
		.screen-only {
			display: none;
		}
		.passage {
			margin: 0;
		}
		:global(.rail),
		:global(.tab-bar),
		:global(.summon-btn) {
			display: none !important;
		}
		:global(.frame) {
			display: block;
			border: none;
			box-shadow: none;
			max-width: none;
			height: auto;
			overflow: visible;
		}
		:global(.content) {
			height: auto;
			overflow: visible;
		}
	}
</style>
