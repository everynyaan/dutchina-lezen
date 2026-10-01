<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { entryFor, openedBook, wordsForLetter } from '$lib/reading/practiceBook';

	interface Props {
		years?: number[];
	}

	let { years = [2024, 2025] }: Props = $props();

	const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	let open = $state(false);
	let letter = $state('A');
	let picked = $state<string | null>(null);

	function show() {
		const next = openedBook();
		letter = next.letter;
		picked = next.headword;
		open = true;
	}

	function hide() {
		open = false;
		letter = 'A';
		picked = null;
	}

	function chooseLetter(next: string) {
		letter = next;
		picked = null;
	}

	let list = $derived(wordsForLetter(letter, years));
	let entry = $derived(picked ? entryFor(picked, years) : null);
</script>

<button type="button" class="book-btn" onclick={show}>
	<Icon name="book-open-cover" size={18} />
	Book
</button>

{#if open}
	<div class="sheet" role="dialog" aria-label="Book">
		<div class="sheet-bar">
			<p class="sheet-title">Book</p>
			<button type="button" class="close" onclick={hide}>Close</button>
		</div>
		<p class="hint">Hunt by letter. The clock keeps going.</p>
		<div class="letters">
			{#each LETTERS as item (item)}
				<button
					type="button"
					class="letter"
					class:on={letter === item}
					onclick={() => chooseLetter(item)}
				>
					{item}
				</button>
			{/each}
		</div>

		{#if entry}
			<article class="gloss-card">
				<h2>{entry.headword}</h2>
				{#if entry.gender}<p class="meta">{entry.gender}</p>{/if}
				{#if entry.extra}<p class="meta">{entry.extra}</p>{/if}
				<p class="gloss">{entry.gloss}</p>
				{#if entry.example}<p class="example">{entry.example}</p>{/if}
				<button type="button" class="back" onclick={() => (picked = null)}>Back to {letter}</button>
			</article>
		{:else if list.length === 0}
			<p class="empty">Nothing on this letter.</p>
		{:else}
			<ul class="heads">
				{#each list as item (item.headword)}
					<li>
						<button type="button" class="head" onclick={() => (picked = item.headword)}>
							{item.headword}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.book-btn {
		position: sticky;
		top: 0;
		z-index: 30;
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border-radius: 999px;
		border: 3px solid var(--color-ink);
		background: #fff;
		font-weight: 700;
		cursor: pointer;
		box-shadow: var(--card-shadow);
	}
	.sheet {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: #fffaf7;
		overflow: auto;
		padding: 16px 16px calc(24px + env(safe-area-inset-bottom, 0px));
	}
	.sheet-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.sheet-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		margin: 0;
	}
	.close,
	.back,
	.head,
	.letter {
		cursor: pointer;
		border: 3px solid var(--color-ink);
		background: #fff;
		border-radius: 12px;
	}
	.close,
	.back {
		padding: 8px 12px;
		font-weight: 700;
	}
	.hint,
	.empty {
		color: var(--color-muted-ink);
		margin: 12px 0;
	}
	.letters {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 6px;
	}
	.letter {
		padding: 8px 0;
		font-weight: 700;
	}
	.letter.on {
		background: color-mix(in srgb, var(--color-lavender) 55%, white);
	}
	.heads {
		list-style: none;
		padding: 0;
		margin: 16px 0 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.head {
		width: 100%;
		text-align: left;
		padding: 12px 14px;
		font-size: 18px;
	}
	.gloss-card {
		margin-top: 16px;
	}
	h2 {
		font-family: var(--font-display);
		margin: 0 0 8px;
	}
	.meta {
		margin: 0;
		font-weight: 700;
	}
	.gloss,
	.example {
		font-size: 18px;
		line-height: 1.5;
	}
	.example {
		color: var(--color-muted-ink);
	}
</style>
