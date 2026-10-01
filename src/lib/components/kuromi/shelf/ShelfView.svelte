<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { labelsInUse, filterPages } from '$lib/kuromi/pageStore';
	import { resolve } from '$app/paths';
	import KuromiBubble from '$lib/components/reading/KuromiBubble.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import ShelfFilters from './ShelfFilters.svelte';
	import PageCard from './PageCard.svelte';

	const ctx = getGameContext();
	let query = $state('');
	let selectedLabels = $state<string[]>([]);
	let archived = $state(false);

	let allLabels = $derived(labelsInUse(ctx.state.pages));
	let filtered = $derived(
		filterPages(ctx.state.pages, { labels: selectedLabels, query, archived })
	);

	function toggleLabel(label: string) {
		selectedLabels = selectedLabels.includes(label)
			? selectedLabels.filter((l) => l !== label)
			: [...selectedLabels, label];
	}
</script>

<div class="shelf-view">
	<div class="shelf-flavor" aria-hidden="true">
		<Doodle name="spark-sparkle-26" size={24} color="var(--color-lavender-deep)" tilt={-6} />
		<Doodle name="shape-swirl-loops-4" size={56} color="var(--color-rose-deep)" tilt={-3} />
	</div>

	<ShelfFilters
		labels={allLabels}
		{selectedLabels}
		{query}
		{archived}
		onToggleLabel={toggleLabel}
		onQueryChange={(q) => (query = q)}
		onToggleArchived={() => (archived = !archived)}
	/>

	{#if filtered.length > 0}
		<div class="page-grid">
			{#each filtered as page, index (page.id)}
				<PageCard {page} {index} />
			{/each}
		</div>
	{:else if ctx.state.pages.length === 0}
		<div class="empty-state">
			<KuromiBubble mood="question">
				<p>Nothing here yet.</p>
			</KuromiBubble>
			<a class="ask" href={resolve('/kuromi')}>Ask her</a>
		</div>
	{:else}
		<div class="empty-state">
			<KuromiBubble mood="question" bare>
				<p>Nothing matches.</p>
			</KuromiBubble>
		</div>
	{/if}
</div>

<style>
	.shelf-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 16px;
		min-width: 0;
		position: relative;
	}

	.shelf-flavor {
		display: flex;
		align-items: center;
		gap: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.page-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		min-width: 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: 18px 12px;
		min-width: 0;
	}

	.ask {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-ink);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
