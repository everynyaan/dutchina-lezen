<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'white' | 'soft-rose' | 'soft-lavender' | 'soft-teal' | 'soft-peach';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { variant = 'white', class: className = '', children, ...rest }: Props = $props();
</script>

<div class={['card', className]} data-variant={variant} {...rest}>
	{@render children?.()}
</div>

<style>
	.card {
		border: 3px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--card-shadow);
		padding: 18px;
		background: #fff;
	}

	.card[data-variant='soft-rose'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-rose) 30%, white) 0%,
			#fff 62%
		);
	}

	.card[data-variant='soft-lavender'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-lavender) 24%, white) 0%,
			#fff 62%
		);
	}

	.card[data-variant='soft-teal'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-teal) 42%, white) 0%,
			#fff 62%
		);
	}

	.card[data-variant='soft-peach'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-peach) 55%, white) 0%,
			#fff 62%
		);
	}
</style>
