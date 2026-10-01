<script lang="ts">
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { findPassage } from '$lib/reading/bank';
	import { TRAP_LABEL } from '$lib/reading/annotations';
	import {
		bankFrequency,
		caseFacts,
		lemmaRecord,
		notebookOf,
		openedSlugs,
		patchEntry,
		senseChecks,
		sortByFrequency,
		sortByLastMet,
		withNotebook
	} from '$lib/reading/notebook';
	import { NOTE_TAGS, type NotebookEntry } from '$lib/reading/types';

	const ctx = getGameContext();

	let kind = $state<'all' | NotebookEntry['kind']>('all');
	let tag = $state('');
	let text = $state('');
	let hiddenEnglish = $state(false);
	let printing = $state(false);
	let picked = $state<Record<string, string>>({});

	let book = $derived(notebookOf(ctx.state.readingFork));
	let opened = $derived(openedSlugs(ctx.state.readingFork));
	let checks = $derived(senseChecks(book, opened));
	let rows = $derived.by(() => {
		const filtered = book.entries.filter((entry) => {
			if (kind !== 'all' && entry.kind !== kind) return false;
			if (tag && !entry.tags.includes(tag)) return false;
			if (text && entry.passageSlug !== text && !nameOf(entry.passageSlug).toLowerCase().includes(text.toLowerCase())) {
				return false;
			}
			if (hiddenEnglish && !(entry.kind === 'word' && !entry.englishRevealed)) return false;
			return true;
		});
		return printing ? sortByFrequency(filtered) : sortByLastMet(filtered);
	});
	let slugs = $derived([...new Set(book.entries.map((entry) => entry.passageSlug).filter(Boolean))]);

	function nameOf(slug: string): string {
		return findPassage(slug)?.name ?? slug;
	}

	function save(id: string, patch: Partial<Pick<NotebookEntry, 'note' | 'tags' | 'starred' | 'englishRevealed'>>) {
		ctx.state.readingFork = withNotebook(
			ctx.state.readingFork,
			patchEntry(notebookOf(ctx.state.readingFork), id, patch)
		);
	}

	function printSheet() {
		printing = true;
		queueMicrotask(() => window.print());
	}
</script>

<div class="notebook-page" class:printing>
	<p class="eyebrow">Your words</p>
	<h1>Notebook</h1>
	<p>Guess from the sentence first. English stays hidden until you ask for it.</p>

	{#if book.entries.length === 0}
		<p>No notes yet. Select a word in a text and add it here.</p>
		<a class="btn ghost" href={resolve('/eval')}>Daily text</a>
	{:else}
		<div class="filters">
			<label>
				Type
				<select bind:value={kind}>
					<option value="all">All</option>
					<option value="word">Words</option>
					<option value="sentence">Sentences</option>
					<option value="trap">Traps</option>
				</select>
			</label>
			<label>
				Tag
				<select bind:value={tag}>
					<option value="">Any</option>
					{#each NOTE_TAGS as item (item)}
						<option value={item}>{item}</option>
					{/each}
				</select>
			</label>
			<label>
				Text
				<select bind:value={text}>
					<option value="">Any</option>
					{#each slugs as slug (slug)}
						<option value={slug}>{nameOf(slug)}</option>
					{/each}
				</select>
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={hiddenEnglish} />
				still hidden English
			</label>
			<button type="button" class="btn ghost" onclick={printSheet}>Print for the final week</button>
		</div>

		{#if printing}
			<h2>Final week, by frequency in the bank</h2>
		{/if}

		{#if rows.length === 0}
			<p>Nothing matches these filters.</p>
		{:else}
			<ul class="entries">
				{#each rows as entry (entry.id)}
					{@const record = entry.kind === 'word' ? lemmaRecord(entry.surface ?? entry.lemma ?? '') : null}
					<li>
						<p class="head">
							{entry.kind === 'word' ? entry.surface : entry.kind}
							{#if entry.lemma}({entry.lemma}){/if}
							{#if entry.starred}Starred{/if}
						</p>
						<p>{nameOf(entry.passageSlug)}</p>
						<p class="quote">{entry.quote}</p>
						{#if record?.nl}<p>{record.nl}</p>{/if}
						{#if entry.englishRevealed && record?.en}<p>{record.en}</p>{/if}
						{#if entry.kind === 'word'}
							<p>In the bank: {bankFrequency(entry)} times</p>
							{#if entry.metSince > 0}
								<p>met {entry.metSince} times since you noted it</p>
							{/if}
						{/if}
						{#if entry.kind === 'sentence' && entry.sentenceType === 'rule'}
							<p>Case facts: {caseFacts(entry.quote).join(', ') || 'none listed'}</p>
						{/if}
						{#if entry.kind === 'trap' && entry.trap}
							<p>{TRAP_LABEL[entry.trap]}. You picked {entry.picked}.</p>
						{/if}
						{#if entry.note}<p>{entry.note}</p>{/if}
						<button type="button" onclick={() => save(entry.id, { starred: !entry.starred })}
							>{entry.starred ? 'Unstar' : 'Star'}</button
						>
					</li>
				{/each}
			</ul>
		{/if}

		<h2>5 words in new sentences</h2>
		{#if checks.length === 0}
			<p>Open another text that uses a word you noted. This check uses a new sentence, not a translation.</p>
		{:else}
			{#each checks as check (check.entryId)}
				<article>
					<p class="quote">{check.sentence}</p>
					<p>{check.prompt}</p>
					{#each check.choices as choice, index (`${check.entryId}-${index}`)}
						<button
							type="button"
							onclick={() => (picked = { ...picked, [check.entryId]: choice.nl })}
						>
							{choice.nl}
						</button>
					{/each}
					{#if picked[check.entryId]}
						<p>
							{check.choices.find((choice) => choice.nl === picked[check.entryId])?.right
								? 'Right.'
								: 'Not this one.'}
						</p>
					{/if}
				</article>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.notebook-page {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding-bottom: 2rem;
	}
	.eyebrow {
		margin: 0;
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
	}
	h1,
	h2 {
		font-family: var(--font-display);
		margin: 0;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		align-items: end;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.92rem;
	}
	.check {
		flex-direction: row;
		align-items: center;
	}
	.entries {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.head {
		font-weight: 700;
		margin: 0;
	}
	.quote {
		font-style: italic;
	}
	p {
		margin: 0.15rem 0;
	}
	button,
	select {
		font: inherit;
		cursor: pointer;
	}
	article {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		align-items: flex-start;
	}
	@media print {
		.filters,
		article button,
		.btn {
			display: none;
		}
	}
</style>
