<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { findPassage } from '$lib/reading/bank';
	import {
		lookupsLeft,
		notebookOf,
		openedSlugs,
		patchEntry,
		withNotebook
	} from '$lib/reading/notebook';
	import { LOOKUPS_PER_TEXT } from '$lib/reading/types';
	import NotebookRail from './NotebookRail.svelte';

	interface Props {
		slugs: string[];
	}

	let { slugs }: Props = $props();
	const ctx = getGameContext();
	let showMine = $state(true);
	let book = $derived(notebookOf(ctx.state.readingFork));
	let noted = $derived(slugs.filter((slug) => book.entries.some((entry) => entry.passageSlug === slug)));
	let opened = $derived([...openedSlugs(ctx.state.readingFork)]);
	let budget = $derived(ctx.state.readingFork.settings?.lookupsPerText ?? LOOKUPS_PER_TEXT);
</script>

<aside class="debrief-notes" aria-label="Notebook">
	<h2>Notebook</h2>
	{#if noted.length === 0}
		<p>No notes from this sitting. After a miss, add the trap if you want to keep it.</p>
	{:else}
		{#each noted as slug (slug)}
			<h3>{findPassage(slug)?.name ?? slug}</h3>
			<NotebookRail
				entries={book.entries}
				{slug}
				{opened}
				left={lookupsLeft(book, slug, budget)}
				{showMine}
				onShowMine={(value) => (showMine = value)}
				onPatch={(id, patch) => {
					ctx.state.readingFork = withNotebook(
						ctx.state.readingFork,
						patchEntry(notebookOf(ctx.state.readingFork), id, patch)
					);
				}}
			/>
		{/each}
	{/if}
</aside>

<style>
	.debrief-notes {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	h2,
	h3 {
		font-family: var(--font-display);
		margin: 0;
	}
	p {
		margin: 0;
	}
</style>
