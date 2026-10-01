<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		source?: string;
		tint?: 'rose' | 'teal' | 'lavender' | 'peach';
		locked?: boolean;
		onclick?: () => void;
		href?: string;
		badges?: Snippet;
	}

	let {
		title,
		source = '',
		tint = 'peach',
		locked = false,
		onclick,
		href,
		badges
	}: Props = $props();
</script>

{#if href && !locked}
	<a class="text-card" data-tint={tint} {href}>
		{@render body()}
	</a>
{:else if onclick && !locked}
	<button type="button" class="text-card" data-tint={tint} {onclick}>
		{@render body()}
	</button>
{:else}
	<article class="text-card" data-tint={tint} class:locked>
		{@render body()}
	</article>
{/if}

{#snippet body()}
	<span class="title">{title}</span>
	{#if source}
		<span class="source">{source}</span>
	{/if}
	<span class="badges">
		{#if badges}
			{@render badges()}
		{/if}
	</span>
{/snippet}

<style>
	.text-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
		text-align: left;
		text-decoration: none;
		font: inherit;
		color: var(--color-ink);
		width: 100%;
		padding: 14px 14px 12px;
		border: none;
		border-radius: 18px;
		box-shadow: var(--shadow-offset-card);
		cursor: pointer;
		background: color-mix(in srgb, var(--wash, var(--color-peach)) 42%, white);
	}

	a.text-card,
	article.text-card {
		cursor: default;
	}

	a.text-card {
		cursor: pointer;
	}

	.text-card[data-tint='peach'] {
		--wash: var(--color-peach);
	}
	.text-card[data-tint='teal'] {
		--wash: var(--color-teal);
	}
	.text-card[data-tint='lavender'] {
		--wash: var(--color-lavender);
	}
	.text-card[data-tint='rose'] {
		--wash: var(--color-rose);
	}

	.locked {
		cursor: default;
		background: color-mix(in srgb, var(--color-ink) 8%, white);
	}

	.title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 18px;
		line-height: 1.25;
	}

	.source {
		font-size: 14px;
		line-height: 1.35;
		color: var(--color-muted-ink);
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.badges :global(.chip) {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		border-radius: 999px;
		background: white;
		font-size: 14px;
		line-height: 1.2;
		font-weight: 700;
		color: var(--color-ink);
	}

	.badges :global(.chip.teal) {
		background: color-mix(in srgb, var(--color-teal) 55%, white);
	}

	.badges :global(.chip.ink) {
		background: var(--color-ink);
		color: var(--color-cream);
	}
</style>
