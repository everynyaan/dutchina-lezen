<script lang="ts">
	import { resolve } from '$app/paths';
	import type { KuromiPage } from '$lib/state/schema';
	import Pill from '$lib/components/ui/Pill.svelte';

	interface Props {
		page: KuromiPage;
		index: number;
	}

	let { page, index }: Props = $props();

	const JIT_CLASSES = ['jit-a', 'jit-b', 'jit-c', 'jit-1', 'jit-2'] as const;

	function formatDate(iso: string): string {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	let jit = $derived(JIT_CLASSES[index % JIT_CLASSES.length]);
	let blockLabel = $derived(page.blocks.length === 1 ? '1 block' : `${page.blocks.length} blocks`);
	let href = $derived(resolve('/kuromi/shelf/[id]', { id: page.id }));
</script>

<a class="page-card-link tappable" {href} aria-label={page.title}>
	<div class="page-card r-card offset-card edge-hair {jit}">
		<div class="card-top">
			<span class="card-title">{page.title}</span>
			{#if page.archived}
				<span class="archived-badge">Archived</span>
			{/if}
		</div>
		{#if page.quip}
			<p class="card-quip">{page.quip}</p>
		{/if}
		{#if page.labels.length > 0}
			<div class="card-labels">
				{#each page.labels as label (label)}
					<Pill variant="lavender" size="sm">{label}</Pill>
				{/each}
			</div>
		{/if}
		<div class="card-meta">
			<span>{formatDate(page.createdAt)}</span>
			<span aria-hidden="true">&middot;</span>
			<span>{blockLabel}</span>
		</div>
	</div>
</a>

<style>
	.page-card-link {
		display: block;
		width: 100%;
		min-width: 0;
		text-decoration: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
	}

	.page-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		min-width: 0;
		min-height: 96px;
		text-align: left;
		box-sizing: border-box;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 28%, white),
			color-mix(in srgb, var(--color-lavender) 12%, white)
		);
		height: 100%;
	}

	.card-top {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
	}

	.card-title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.25;
		overflow-wrap: anywhere;
		color: var(--color-ink);
		flex: 1;
		min-width: 0;
	}

	.archived-badge {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		padding: 3px 8px;
		border-radius: 999px;
		font-family: var(--font-sans);
		font-size: var(--text-micro);
		line-height: 1.2;
		color: var(--color-muted-ink);
		background: color-mix(in srgb, white 60%, transparent);
		border: 1px solid var(--color-line);
		white-space: nowrap;
	}

	.card-quip {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		line-height: 1.4;
		color: var(--color-muted-ink);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.card-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.card-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-top: auto;
		font-family: var(--font-sans);
		font-size: var(--text-micro);
		line-height: 1.2;
		color: var(--color-muted-ink);
	}
</style>
