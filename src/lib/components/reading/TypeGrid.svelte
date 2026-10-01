<script lang="ts">
	import { resolve } from '$app/paths';
	import { QTYPES } from '$lib/reading/types';
	import { qtypeReadiness, type QtypeRow } from '$lib/reading/readiness';
	import { getGameContext } from '$lib/state/context';

	interface Tile {
		qtype: string;
		label: string;
		rate: number | null;
	}

	interface Props {
		rows?: Tile[];
		limit?: number;
	}

	let { rows, limit }: Props = $props();

	const ctx = getGameContext();

	function order(list: QtypeRow[]): Tile[] {
		const any = list.some((row) => row.attempts > 0);
		const source = any
			? list
			: [...list].sort((a, b) => QTYPES.indexOf(a.qtype) - QTYPES.indexOf(b.qtype));
		return source.map((row) => ({
			qtype: row.qtype,
			label: row.label,
			rate: row.rate
		}));
	}

	let tiles = $derived.by(() => {
		const source = rows ?? (ctx ? order(qtypeReadiness(ctx.state.readingFork)) : []);
		return typeof limit === 'number' ? source.slice(0, limit) : source;
	});

	function percent(rate: number): string {
		return `${Math.round(rate * 100)}%`;
	}
</script>

<div class="type-grid">
	{#each tiles as tile (tile.qtype)}
		<a class="tile" href="{resolve('/cards')}?qtype={tile.qtype}">
			<span class="label">{tile.label}</span>
			{#if tile.rate === null}
				<span class="empty">no attempts</span>
			{:else}
				<span class="rate">{percent(tile.rate)}</span>
			{/if}
			<span class="go" aria-hidden="true">→</span>
			<span class="sr">Practice this</span>
		</a>
	{/each}
</div>

<style>
	.type-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}

	.tile {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-height: 72px;
		padding: 10px 10px 12px;
		text-decoration: none;
		color: var(--color-ink);
		background: color-mix(in srgb, var(--color-lavender) 22%, white);
		border-radius: 16px;
		box-shadow: var(--shadow-offset-pill);
	}

	.label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 14px;
		line-height: 1.25;
	}

	.rate {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 18px;
		color: var(--color-teal-deep);
	}

	.empty {
		font-size: 14px;
		color: var(--color-muted-ink);
		border-bottom: 1px solid var(--color-muted-ink);
		align-self: flex-start;
	}

	.go {
		position: absolute;
		right: 8px;
		bottom: 8px;
		opacity: 0;
		font-weight: 700;
	}

	.tile:hover .go,
	.tile:focus-visible .go {
		opacity: 1;
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
