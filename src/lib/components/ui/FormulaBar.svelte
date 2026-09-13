<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'rose' | 'lavender' | 'teal' | 'peach';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { tone = 'rose', class: className = '', children, ...rest }: Props = $props();
</script>

<div class={['formula-bar', className]} data-tone={tone} {...rest}>
	{@render children?.()}
</div>

<style>
	.formula-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border-radius: 16px;
		border: 2px solid color-mix(in srgb, var(--color-rose) 34%, white);
	}

	.formula-bar[data-tone='rose'] {
		background: color-mix(in srgb, var(--color-rose) 30%, white);
	}

	.formula-bar[data-tone='lavender'] {
		background: color-mix(in srgb, var(--color-lavender) 24%, white);
	}

	.formula-bar[data-tone='teal'] {
		background: color-mix(in srgb, var(--color-teal) 42%, white);
	}

	.formula-bar[data-tone='peach'] {
		background: color-mix(in srgb, var(--color-peach) 55%, white);
	}
</style>
