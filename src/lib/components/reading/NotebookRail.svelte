<script lang="ts">
	import { TRAP_LABEL } from '$lib/reading/annotations';
	import {
		caseFacts,
		countsFor,
		lemmaRecord,
		lookupLabel,
		signalLine,
		whereElse
	} from '$lib/reading/notebook';
	import { NOTE_TAGS, type NotebookEntry } from '$lib/reading/types';

	interface Props {
		entries: NotebookEntry[];
		slug: string;
		opened: string[];
		left: number;
		showMine: boolean;
		onShowMine: (value: boolean) => void;
		onPatch: (
			id: string,
			patch: Partial<Pick<NotebookEntry, 'note' | 'tags' | 'starred' | 'englishRevealed'>>
		) => void;
	}

	let { entries, slug, opened, left, showMine, onShowMine, onPatch }: Props = $props();

	let mine = $derived(entries.filter((entry) => entry.passageSlug === slug));
	let openedSet = $derived(new Set(opened));
</script>

<label class="show">
	<input
		type="checkbox"
		checked={showMine}
		onchange={(event) => onShowMine((event.currentTarget as HTMLInputElement).checked)}
	/>
	show my words
</label>
{#if left <= 0}
	<p class="nudge">{lookupLabel(0)}</p>
{/if}
{#if mine.length === 0}
	<p class="empty">No notes for this text yet. Select a word and add it.</p>
{:else}
	<ul class="entries">
		{#each mine as entry (entry.id)}
			<li>
				{#if entry.kind === 'word'}
					{@const record = lemmaRecord(entry.surface ?? entry.lemma ?? '')}
					{@const counts = countsFor(entry.lemma ?? '', slug)}
					{@const line = signalLine(entry.surface ?? entry.lemma ?? '')}
					<p class="head">
						{entry.surface}
						{#if entry.lemma}({entry.lemma}{record?.pos ? `, ${record.pos}` : ''}){/if}
						<button
							type="button"
							class="star"
							aria-pressed={entry.starred}
							onclick={() => onPatch(entry.id, { starred: !entry.starred })}
							>{entry.starred ? 'Starred' : 'Star'}</button
						>
					</p>
					<p class="quote">{entry.quote}</p>
					{#if record?.nl}<p>{record.nl}</p>{/if}
					{#if entry.englishRevealed && record?.en}
						<p class="en">{record.en}</p>
					{:else if record?.en}
						<button
							type="button"
							class="link"
							onclick={() => onPatch(entry.id, { englishRevealed: true })}>show English</button
						>
					{/if}
					{#if counts.forms.length > 0}
						<p>
							{counts.forms.map((row) => `${row.form} ${row.count}`).join(', ')}
						</p>
					{/if}
					<p>in this text: {counts.inText} times</p>
					<p>
						across all texts: {counts.across} times in {counts.texts}
						{counts.texts === 1 ? 'text' : 'texts'}
					</p>
					<p>{counts.genres}</p>
					{#if line}<p>{line}</p>{/if}
					{#if entry.metSince > 0}
						<p>met {entry.metSince} times since you noted it</p>
					{/if}
					{#each whereElse(entry.lemma ?? '', openedSet, slug) as row (row.slug + row.sentence)}
						<p class="else">
							<a href="/lezen?passage={row.slug}">{row.name}</a>: {row.sentence}
						</p>
					{/each}
				{:else if entry.kind === 'sentence'}
					<p class="head">{entry.sentenceType}</p>
					<p class="quote">{entry.quote}</p>
					{#if entry.sentenceType === 'rule'}
						<p>Case facts: {caseFacts(entry.quote).join(', ') || 'none listed'}</p>
					{/if}
				{:else}
					<p class="head">
						{entry.trap ? TRAP_LABEL[entry.trap] : 'Trap'}
						{#if entry.picked}You picked {entry.picked}.{/if}
					</p>
					<p class="quote">{entry.quote}</p>
				{/if}
				<label class="note">
					Note
					<textarea
						rows="2"
						value={entry.note}
						onblur={(event) =>
							onPatch(entry.id, { note: (event.currentTarget as HTMLTextAreaElement).value })}
					></textarea>
				</label>
				<div class="tags">
					{#each NOTE_TAGS as tag (tag)}
						<button
							type="button"
							class:on={entry.tags.includes(tag)}
							onclick={() => {
								const tags = entry.tags.includes(tag)
									? entry.tags.filter((item) => item !== tag)
									: [...entry.tags, tag];
								onPatch(entry.id, { tags });
							}}>{tag}</button
						>
					{/each}
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.show,
	.note {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.92rem;
	}
	.nudge,
	.empty,
	p {
		margin: 0.2rem 0;
	}
	.entries {
		list-style: none;
		padding: 0;
		margin: 0.4rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.head {
		font-weight: 700;
	}
	.quote {
		font-style: italic;
	}
	.en {
		color: var(--color-muted-ink);
	}
	.else {
		font-size: 0.92rem;
	}
	button,
	textarea {
		font: inherit;
		cursor: pointer;
	}
	textarea {
		width: 100%;
		cursor: text;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.tags button.on {
		font-weight: 700;
	}
	.link,
	.star {
		font: inherit;
		cursor: pointer;
	}
</style>
