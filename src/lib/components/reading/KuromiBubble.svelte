<script lang="ts">
	import type { Snippet } from 'svelte';
	import Character from '$lib/components/art/Character.svelte';

	interface Props {
		mood?: string;
		size?: number;
		/** Drop the ink box when the bubble sits inside a hero card. */
		bare?: boolean;
		children?: Snippet;
	}

	let { mood = 'talk', size = 44, bare = false, children }: Props = $props();
</script>

<div class="kuromi-line">
	<Character who="kuromi" {mood} {size} alt="" />
	<div class="bubble" class:bare>
		{@render children?.()}
	</div>
</div>

<style>
	.kuromi-line {
		display: flex;
		align-items: flex-end;
		gap: 10px;
		min-width: 0;
	}

	.bubble {
		background: color-mix(in srgb, var(--color-lavender) 28%, white);
		border: 2px solid var(--color-ink);
		border-radius: 18px 18px 18px 5px;
		padding: 10px 14px;
		font-size: 17px;
		line-height: 1.45;
		color: var(--color-ink);
		min-width: 0;
	}

	.bubble.bare {
		border: none;
		background: transparent;
		padding: 4px 0 8px;
	}

	.bubble :global(p) {
		margin: 0;
	}
</style>
