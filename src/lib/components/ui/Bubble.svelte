<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		side?: 'left' | 'right';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { side = 'left', class: className = '', children, ...rest }: Props = $props();
</script>

<div class={['bubble', className]} data-side={side} {...rest}>
	{@render children?.()}
</div>

<style>
	.bubble {
		background: #fff;
		border: 2px solid var(--color-line);
		padding: 12px 15px;
		font-size: var(--text-base);
		line-height: 1.55;
		display: inline-block;
		max-width: 100%;
	}

	.bubble[data-side='left'] {
		border-radius: 18px 18px 18px 6px;
	}

	.bubble[data-side='right'] {
		border-radius: 18px 18px 6px 18px;
	}
</style>
