<script lang="ts">
	import type { Snippet } from 'svelte';
	import Character from '$lib/components/art/Character.svelte';

	interface Props {
		mood?: string;
		size?: number;
		children?: Snippet;
	}

	let { mood = 'talk', size = 44, children }: Props = $props();
</script>

<div class="kuromi-line">
	<Character who="kuromi" {mood} {size} alt="" />
	<div class="bubble">
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

	.bubble :global(p) {
		margin: 0;
	}
</style>
