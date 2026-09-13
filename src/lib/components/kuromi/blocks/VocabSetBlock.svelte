<script lang="ts">
	import type { PageBlockVocabSet } from '$lib/state/schema';
	import { WORD_POOL, type WordEntry } from '$lib/data/wordPool';
	import Pill from '$lib/components/ui/Pill.svelte';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';

	interface Props {
		block: PageBlockVocabSet;
	}

	let { block }: Props = $props();

	const pool = new Map(WORD_POOL.map((w) => [w.id, w]));

	type VocabRow = { nl: string; en: string; pos?: string };

	let rows = $derived.by((): VocabRow[] => {
		const fromPool: VocabRow[] = block.wordIds
			.map((id) => pool.get(id))
			.filter((w): w is WordEntry => w !== undefined)
			.map((w) => ({ nl: w.dutch, en: w.english, pos: w.pos }));
		const custom: VocabRow[] = block.custom.map((c) => ({ nl: c.nl, en: c.en }));
		return [...fromPool, ...custom];
	});
</script>

<section class="vocab-set">
	{#if block.title}
		<h3 class="set-title">{block.title}</h3>
	{/if}

	{#if rows.length === 0}
		<p class="empty-note">Hmm… nothing here yet. Maybe I misplaced the words.</p>
	{:else}
		<div class="word-list">
			{#each rows as row, i (i)}
				<div class="word-row r-chip edge-hair">
					<div class="word-row1">
						<span class="word-dutch">{row.nl}</span>
						{#if row.pos}
							<Pill variant="lavender" size="sm">{row.pos}</Pill>
						{/if}
						<span class="word-tts">
							<SpeakerButton text={row.nl} size={16} />
						</span>
					</div>
					<div class="word-english">{row.en}</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.vocab-set {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}

	.set-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.3;
		word-break: break-word;
	}

	.empty-note {
		margin: 0;
		padding: 12px 14px;
		font-size: var(--text-base);
		color: var(--color-muted-ink);
		line-height: 1.45;
		font-style: italic;
	}

	.word-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.word-row {
		padding: 12px;
		background: color-mix(in srgb, white 72%, var(--color-cream));
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-sizing: border-box;
	}

	.word-row1 {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.word-dutch {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.25;
		overflow-wrap: anywhere;
		min-width: 0;
	}

	.word-tts {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		margin-left: auto;
	}

	.word-english {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-muted-ink);
		line-height: 1.35;
		overflow-wrap: anywhere;
	}
</style>
