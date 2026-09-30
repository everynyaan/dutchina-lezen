<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Evidence } from '$lib/reading/types';
	import ReadingPane from './ReadingPane.svelte';

	interface Props {
		passage: { name: string; intro: string; text: string };
		highlight?: Evidence[];
		locateMode?: boolean;
		onLocate?: (p: number) => void;
		locatedP?: number | null;
		scrollToEvidence?: boolean;
		question: Snippet;
		notebook?: Snippet;
	}

	let {
		passage,
		highlight = [],
		locateMode = false,
		onLocate,
		locatedP = null,
		scrollToEvidence = false,
		question,
		notebook
	}: Props = $props();

	let notes: 'tab' | 'rail' | 'wide' = $state('rail');
</script>

<p class="narrow">Use a wider window.</p>
<div class="desk" class:tab={notes === 'tab'} class:wide={notes === 'wide'}>
	<div class="text">
		<ReadingPane {passage} {highlight} {locateMode} {onLocate} {locatedP} {scrollToEvidence} />
	</div>
	<div class="ask">
		{@render question()}
	</div>
	<aside class="notes" aria-label="Notebook">
		{#if notes === 'tab'}
			<button type="button" class="tab" onclick={() => (notes = 'rail')}>Notebook</button>
		{:else}
			<div class="note-bar">
				<span>Notebook</span>
				<button type="button" onclick={() => (notes = 'tab')}>Collapse</button>
				{#if notes === 'rail'}
					<button type="button" onclick={() => (notes = 'wide')}>Widen</button>
				{:else}
					<button type="button" onclick={() => (notes = 'rail')}>Narrow</button>
				{/if}
			</div>
			<div class="note-body">
				{#if notebook}
					{@render notebook()}
				{:else}
					<p>Notes for this text land here.</p>
				{/if}
			</div>
		{/if}
	</aside>
</div>

<style>
	.narrow {
		margin: 0;
		font-weight: 700;
	}
	.desk {
		display: none;
		width: 100%;
		min-width: 0;
	}
	@media (min-width: 1200px) {
		.narrow {
			display: none;
		}
		.desk {
			display: grid;
			grid-template-columns: minmax(0, 11fr) minmax(0, 6fr) minmax(0, 3fr);
			grid-template-rows: minmax(0, 1fr);
			width: 100%;
			min-width: 0;
			height: calc(100vh - 12rem);
			min-height: 24rem;
			gap: 0.75rem;
		}
		.desk.wide {
			grid-template-columns: minmax(0, 8fr) minmax(0, 6fr) minmax(0, 6fr);
		}
		.desk.tab {
			grid-template-columns: minmax(0, 11fr) minmax(0, 6fr) 2.75rem;
		}
		.text {
			grid-column: 1;
			grid-row: 1;
		}
		.ask {
			grid-column: 2;
			grid-row: 1;
		}
		.notes {
			grid-column: 3;
			grid-row: 1;
		}
		.text,
		.ask,
		.notes {
			min-width: 0;
			max-width: 100%;
			min-height: 0;
			overflow: auto;
		}
		.note-bar {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
			align-items: center;
			font-weight: 700;
		}
		.note-bar button,
		.tab {
			font: inherit;
			cursor: pointer;
		}
		.note-body p {
			color: var(--color-muted-ink);
		}
	}
</style>
