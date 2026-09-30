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
		max-width: 100%;
		min-width: 0;
	}
	/* 42rem is the app card's content box, not the viewport. */
	@container app-card (min-width: 42rem) {
		.narrow {
			display: none;
		}
		.desk {
			display: grid;
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(7.5rem, 9rem);
			grid-template-rows: minmax(0, 1fr);
			width: 100%;
			max-width: 100%;
			min-width: 0;
			height: calc(100dvh - 18rem);
			min-height: 22rem;
			gap: 1rem;
			overflow: hidden;
		}
		.desk.wide {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
		}
		.desk.tab {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) 2.75rem;
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
			contain: inline-size;
			min-width: 0;
			max-width: 100%;
			min-height: 0;
			overflow-x: clip;
			overflow-y: auto;
			background: #fff;
			padding: 0 0.85rem;
			box-sizing: border-box;
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
