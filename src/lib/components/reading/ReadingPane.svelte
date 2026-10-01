<script lang="ts">
	import { paragraphsOf } from '$lib/reading/annotations';
	import {
		isHeading,
		isListParagraph,
		listLines,
		markQuotes,
		type TextRun
	} from '$lib/reading/loop';
	import { paintWords, type WordMark } from '$lib/reading/notebook';
	import type { Evidence } from '$lib/reading/types';

	interface PassageView {
		name: string;
		intro: string;
		text: string;
		slug?: string;
		paragraphLabels?: string[];
		paragraphMap?: Record<string, number>;
	}

	interface TextSelection {
		text: string;
		p: number;
		sentence: boolean;
	}

	interface Props {
		passage: PassageView;
		highlight?: Evidence[];
		locateMode?: boolean;
		onLocate?: (p: number) => void;
		locatedP?: number | null;
		scrollToEvidence?: boolean;
		marks?: WordMark[];
		onSelect?: (selection: TextSelection) => void;
	}

	let {
		passage,
		highlight = [],
		locateMode = false,
		onLocate,
		locatedP = null,
		scrollToEvidence = false,
		marks = [],
		onSelect
	}: Props = $props();

	let root = $state<HTMLElement | null>(null);
	let paragraphs = $derived(paragraphsOf(passage.text));
	let quotes = $derived(highlight.map((item) => item.quote));

	function runs(text: string): TextRun[] {
		return markQuotes(text, quotes);
	}

	function wholeSentence(text: string, paragraph: string): boolean {
		const trimmed = text.trim();
		if (trimmed.split(/\s+/).length >= 6 && /[.!?]$/.test(trimmed)) return true;
		return paragraph
			.split(/(?<=[.!?])\s+/)
			.some((sentence) => sentence.replace(/\s+/g, ' ').trim() === trimmed);
	}

	function onMouseUp() {
		if (locateMode || !onSelect) return;
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed) return;
		const text = sel.toString().replace(/\s+/g, ' ').trim();
		if (!text || text.length > 280) return;
		const node = sel.anchorNode;
		const el = node instanceof Element ? node : node?.parentElement;
		const block = el?.closest('[data-p]');
		if (!block || !root?.contains(block)) return;
		const p = Number(block.getAttribute('data-p'));
		if (!Number.isInteger(p)) return;
		onSelect({ text, p, sentence: wholeSentence(text, paragraphs[p] ?? '') });
	}

	function marginLabel(index: number): string | null {
		const map = passage.paragraphMap;
		if (!map) return null;
		const labels = passage.paragraphLabels ?? Object.keys(map);
		for (const label of labels) {
			if (map[label] === index) return label;
		}
		return null;
	}

	function onKey(event: KeyboardEvent, index: number) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		onLocate?.(index);
	}

	$effect(() => {
		const el = root;
		if (!el || !onSelect) return;
		passage.text;
		locateMode;
		const onUp = () => onMouseUp();
		el.addEventListener('mouseup', onUp);
		return () => el.removeEventListener('mouseup', onUp);
	});

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
		{#if run.mark}<mark>{@render words(run.text)}</mark>{:else}{@render words(run.text)}{/if}
	{/each}
{/snippet}

{#snippet words(text: string)}
	{#each paintWords(text, marks) as piece, pieceIndex (pieceIndex)}
		{#if piece.tone}
			<span class="noted" class:faint={piece.tone === 'faint'} title={piece.note || undefined}
				>{piece.text}</span
			>
		{:else}{piece.text}{/if}
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
		{@const label = marginLabel(index)}
		{#if locateMode}
			<div
				class="block"
				class:heading
				class:labelled={label !== null}
				class:selected={locatedP === index}
				role="button"
				tabindex="0"
				data-p={index}
				onclick={() => onLocate?.(index)}
				onkeydown={(event) => onKey(event, index)}
			>
				{#if label}<span class="alinea">{label}</span>{/if}
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
			<div
				class="block"
				class:heading
				class:labelled={label !== null}
				class:selected={locatedP === index}
				data-p={index}
			>
				{#if label}<span class="alinea">{label}</span>{/if}
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
	.block.labelled {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		column-gap: 0.35rem;
		align-items: start;
	}
	.alinea {
		color: var(--color-muted-ink);
		font-weight: 650;
		line-height: 1.6;
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
	.noted {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 3px;
		text-decoration-color: color-mix(in srgb, var(--color-rose-deep) 70%, white);
	}
	.noted.faint {
		text-decoration-color: color-mix(in srgb, var(--color-muted-ink) 55%, white);
		text-decoration-thickness: 1px;
	}
</style>
