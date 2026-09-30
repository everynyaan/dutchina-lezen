<script lang="ts">
	import { paragraphsOf } from '$lib/reading/annotations';
	import {
		isHeading,
		isListParagraph,
		listLines,
		markQuotes,
		type TextRun
	} from '$lib/reading/loop';
	import type { Evidence } from '$lib/reading/types';

	interface PassageView {
		name: string;
		intro: string;
		text: string;
	}

	interface Props {
		passage: PassageView;
		highlight?: Evidence[];
		locateMode?: boolean;
		onLocate?: (p: number) => void;
		locatedP?: number | null;
		scrollToEvidence?: boolean;
	}

	let {
		passage,
		highlight = [],
		locateMode = false,
		onLocate,
		locatedP = null,
		scrollToEvidence = false
	}: Props = $props();

	let root = $state<HTMLElement | null>(null);
	let paragraphs = $derived(paragraphsOf(passage.text));
	let quotes = $derived(highlight.map((item) => item.quote));

	function runs(text: string): TextRun[] {
		return markQuotes(text, quotes);
	}

	function onKey(event: KeyboardEvent, index: number) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		onLocate?.(index);
	}

	$effect(() => {
		if (!scrollToEvidence || !root) return;
		const mark = root.querySelector('mark');
		const block = mark?.closest('[data-p]');
		if (block && 'scrollIntoView' in block) {
			block.scrollIntoView({ block: 'center' });
		}
	});
</script>

{#snippet marked(text: string)}
	{#each runs(text) as run, runIndex (runIndex)}
		{#if run.mark}<mark>{run.text}</mark>{:else}{run.text}{/if}
	{/each}
{/snippet}

<div class="pane" bind:this={root}>
	{#if passage.intro}
		<p class="source">{passage.intro}</p>
	{/if}
	<h1>{passage.name}</h1>
	{#each paragraphs as paragraph, index (index)}
		{@const heading = isHeading(paragraph, index)}
		{@const list = isListParagraph(paragraph)}
		{#if locateMode}
			<div
				class="block"
				class:heading
				class:selected={locatedP === index}
				role="button"
				tabindex="0"
				data-p={index}
				onclick={() => onLocate?.(index)}
				onkeydown={(event) => onKey(event, index)}
			>
				{#if heading}
					<h2>{@render marked(paragraph)}</h2>
				{:else if list}
					<ul>
						{#each listLines(paragraph) as line, lineIndex (lineIndex)}
							<li>{@render marked(line)}</li>
						{/each}
					</ul>
				{:else}
					<p>{@render marked(paragraph)}</p>
				{/if}
			</div>
		{:else}
			<div class="block" class:heading class:selected={locatedP === index} data-p={index}>
				{#if heading}
					<h2>{@render marked(paragraph)}</h2>
				{:else if list}
					<ul>
						{#each listLines(paragraph) as line, lineIndex (lineIndex)}
							<li>{@render marked(line)}</li>
						{/each}
					</ul>
				{:else}
					<p>{@render marked(paragraph)}</p>
				{/if}
			</div>
		{/if}
	{/each}
</div>

<style>
	.pane {
		max-width: 100%;
		font-size: 18px;
		line-height: 1.6;
		color: var(--color-ink);
		overflow-wrap: break-word;
	}
	.source {
		margin: 0 0 0.35rem;
		color: var(--color-muted-ink);
		font-size: 0.85rem;
		line-height: 1.4;
	}
	h1 {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: 1.6rem;
		line-height: 1.25;
	}
	.block {
		margin: 0 0 0.9rem;
	}
	.block p,
	.block h2,
	.block ul {
		margin: 0;
	}
	.block h2 {
		font-family: var(--font-display);
		font-size: 1.15rem;
		line-height: 1.35;
	}
	.block ul {
		padding-left: 1.2rem;
	}
	.block[role='button'] {
		cursor: pointer;
		border-radius: 8px;
		padding: 0.35rem 0.45rem;
	}
	.block[role='button']:hover,
	.block.selected {
		background: color-mix(in srgb, var(--color-teal) 18%, white);
	}
	mark {
		background: color-mix(in srgb, var(--color-teal) 45%, white);
		color: inherit;
		padding: 0 2px;
	}
</style>
