<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'verb' | 'subject' | 'ghost';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { variant = 'default', class: className = '', children, ...rest }: Props = $props();
</script>

<span class={['bead', className]} data-variant={variant} {...rest}>
	{@render children?.()}
</span>

<style>
	.bead {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 5px 13px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		border: 2px solid var(--color-kuromi);
		box-shadow: 0 2px 0 var(--color-kuromi);
		color: var(--color-kuromi);
		background: #fff;
	}

	.bead[data-variant='verb'] {
		background: var(--color-rose);
		color: #fff;
	}

	.bead[data-variant='subject'] {
		background: color-mix(in srgb, var(--color-lavender) 28%, white);
	}

	.bead[data-variant='ghost'] {
		border-style: dashed;
		background: transparent;
		box-shadow: none;
		color: var(--color-soft);
	}
</style>
