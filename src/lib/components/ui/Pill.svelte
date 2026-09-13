<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'rose' | 'lavender' | 'teal' | 'peach' | 'kuromi';
		size?: 'sm' | 'md';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { variant = 'rose', size = 'md', class: className = '', children, ...rest }: Props = $props();
</script>

<span class={['pill', className]} data-variant={variant} data-size={size} {...rest}>
	{@render children?.()}
</span>

<style>
	.pill {
		border-radius: 999px;
		border: 2px solid var(--color-ink);
		box-shadow: var(--sticker-shadow);
		font-family: var(--font-display);
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		color: var(--color-ink);
	}

	.pill[data-size='sm'] {
		font-size: var(--text-micro);
		padding: 3px 10px;
	}

	.pill[data-size='md'] {
		font-size: var(--text-small);
		padding: 5px 14px;
	}

	.pill[data-variant='lavender'] {
		background: var(--color-lavender);
	}

	.pill[data-variant='teal'] {
		background: color-mix(in srgb, var(--color-teal) 42%, white);
	}

	.pill[data-variant='peach'] {
		background: color-mix(in srgb, var(--color-peach) 55%, white);
	}

	.pill[data-variant='rose'] {
		background: var(--color-rose);
	}

	.pill[data-variant='kuromi'] {
		background: var(--color-ink);
		color: var(--color-cream);
	}
</style>
