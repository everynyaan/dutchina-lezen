<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import type { Evidence } from '$lib/reading/types';
	import { lookupForm } from '$lib/reading/lexicon';
	import {
		addSentenceEntry,
		addWordEntry,
		entriesForSlug,
		lookupsLeft,
		noteEncounter,
		notebookOf,
		openedSlugs,
		spendLookup,
		withNotebook,
		wordMarks
	} from '$lib/reading/notebook';
	import { LOOKUPS_PER_TEXT, type SentenceNoteType } from '$lib/reading/types';
	import NotebookRail from './NotebookRail.svelte';
	import ReadingPane from './ReadingPane.svelte';
	import WordPopover from './WordPopover.svelte';

	interface Props {
		passage: { name: string; intro: string; text: string; slug?: string };
		highlight?: Evidence[];
		locateMode?: boolean;
		onLocate?: (p: number) => void;
		locatedP?: number | null;
		scrollToEvidence?: boolean;
		hideNotebook?: boolean;
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
		hideNotebook = false,
		question,
		notebook
	}: Props = $props();

	const ctx = getGameContext();
	let mounted = $state(false);
	let notes = $state<'tab' | 'rail' | 'wide'>('rail');
	let showMine = $state(true);
	let selection = $state<{ text: string; p: number; sentence: boolean } | null>(null);

	onMount(() => {
		mounted = true;
	});

	let live = $derived(Boolean(ctx && mounted && !hideNotebook));
	let slug = $derived(passage.slug ?? '');
	let fork = $derived(live && ctx ? ctx.state.readingFork : null);
	let book = $derived(fork ? notebookOf(fork) : null);
	let count = $derived(book ? entriesForSlug(book, slug).length : 0);
	let budget = $derived(fork?.settings?.lookupsPerText ?? LOOKUPS_PER_TEXT);
	let left = $derived(book ? lookupsLeft(book, slug, budget) : budget);
	let marks = $derived(book ? wordMarks(book, slug, showMine) : []);
	let opened = $derived(fork ? [...openedSlugs(fork), slug].filter(Boolean) : []);

	$effect(() => {
		if (!live || !ctx || !slug) return;
		const current = notebookOf(ctx.state.readingFork);
		const next = noteEncounter(current, slug, passage.text, new Date().toISOString());
		if (next !== current) {
			ctx.state.readingFork = withNotebook(ctx.state.readingFork, next);
		}
	});

	function commit(notebookNext: ReturnType<typeof notebookOf>) {
		if (!ctx) return;
		ctx.state.readingFork = withNotebook(ctx.state.readingFork, notebookNext);
		selection = null;
	}
</script>

<p class="narrow">Use a wider window.</p>
<div
	class="desk"
	class:tab={notes === 'tab'}
	class:wide={notes === 'wide'}
	class:exam={hideNotebook}
>
	<div class="text">
		<ReadingPane
			{passage}
			{highlight}
			{locateMode}
			{onLocate}
			{locatedP}
			{scrollToEvidence}
			{marks}
			onSelect={live && !locateMode ? (next) => (selection = next) : undefined}
		/>
		{#if live && selection && book}
			<WordPopover
				{selection}
				record={lookupForm(selection.text) ??
					lookupForm(selection.text.split(/\s+/)[0] ?? selection.text)}
				{left}
				onLookup={() => {
					if (!ctx || !book) return;
					ctx.state.readingFork = withNotebook(
						ctx.state.readingFork,
						spendLookup(notebookOf(ctx.state.readingFork), slug, budget)
					);
				}}
				onAddWord={(input) => {
					if (!book || !selection) return;
					commit(
						addWordEntry(notebookOf(ctx!.state.readingFork), {
							surface: selection.text,
							quote: selection.text,
							passageSlug: slug,
							p: selection.p,
							guessed: input.guessed,
							guessText: input.guessText,
							englishRevealed: input.englishRevealed
						})
					);
				}}
				onAddSentence={(sentenceType: SentenceNoteType) => {
					if (!selection) return;
					commit(
						addSentenceEntry(notebookOf(ctx!.state.readingFork), {
							quote: selection.text,
							passageSlug: slug,
							p: selection.p,
							sentenceType
						})
					);
				}}
				onClose={() => (selection = null)}
			/>
		{/if}
	</div>
	<div class="ask">
		{@render question()}
	</div>
	{#if !hideNotebook}
		<aside class="notes" aria-label="Notebook">
			{#if notes === 'tab'}
				<button type="button" class="tab" onclick={() => (notes = 'rail')}>
					Notebook {count}
				</button>
			{:else}
				<div class="note-bar">
					<span>Notebook {count}</span>
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
					{:else if live && book}
						<NotebookRail
							entries={book.entries}
							{slug}
							{opened}
							{left}
							{showMine}
							onShowMine={(value) => (showMine = value)}
							onPatch={(id, patch) => {
								if (!ctx) return;
								const current = notebookOf(ctx.state.readingFork);
								ctx.state.readingFork = withNotebook(ctx.state.readingFork, {
									...current,
									entries: current.entries.map((entry) =>
										entry.id === id ? { ...entry, ...patch } : entry
									)
								});
							}}
						/>
					{:else}
						<p>Notes for this text land here.</p>
					{/if}
				</div>
			{/if}
		</aside>
	{/if}
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
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 30%;
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
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr);
		}
		.desk.tab {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) 2.75rem;
		}
		.desk.exam {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
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
