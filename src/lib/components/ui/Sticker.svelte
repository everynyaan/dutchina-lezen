<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'tip' | 'trap' | 'audio';
		title?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { variant = 'tip', title, class: className = '', children, ...rest }: Props = $props();
</script>

<div class={['sticker', className]} data-variant={variant} {...rest}>
	{#if title}
		<strong class="sticker-title">{title}</strong>
	{/if}
	{@render children?.()}
</div>

<style>
	.sticker {
		border-radius: 18px;
		padding: 14px 16px;
		font-size: var(--text-small);
	}

	.sticker[data-variant='tip'] {
		border: 3px dashed var(--color-rose);
		background: color-mix(in srgb, var(--color-blush) 60%, white);
	}

	.sticker[data-variant='trap'] {
		border: 3px solid var(--color-kuromi);
		background: var(--color-lilac);
	}

	.sticker[data-variant='audio'] {
		border: 3px solid var(--color-kuromi);
		background: color-mix(in srgb, var(--color-peach) 55%, white);
	}

	.sticker-title {
		font-family: var(--font-display);
		font-size: var(--text-small);
		color: var(--color-kuromi);
		margin-bottom: 6px;
		display: block;
	}
</style>
