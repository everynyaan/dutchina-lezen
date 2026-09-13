<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	interface Props {
		page: number;
		total: number;
		onprev: () => void;
		onnext: () => void;
		label?: string;
		unit?: string;
		class?: string;
		[key: string]: unknown;
	}

	let {
		page,
		total,
		onprev,
		onnext,
		label = 'Pages',
		unit = 'Page',
		class: className = '',
		...rest
	}: Props = $props();
</script>

{#if total > 1}
	<div class={['pager', className]} role="navigation" aria-label={label} {...rest}>
		<button
			type="button"
			class="pager-btn"
			disabled={page <= 1}
			onclick={onprev}
			aria-label="Previous {label.toLowerCase()}"
		>
			<Icon name="chevron-left" size={16} color="currentColor" />
		</button>
		<span class="pager-status" aria-live="polite">{unit} {page} of {total}</span>
		<button
			type="button"
			class="pager-btn"
			disabled={page >= total}
			onclick={onnext}
			aria-label="Next {label.toLowerCase()}"
		>
			<Icon name="chevron-right" size={16} color="currentColor" />
		</button>
	</div>
{/if}

<style>
	.pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 4px;
		background: var(--color-s1);
		border: 1px solid var(--color-line);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
		width: fit-content;
		margin-inline: auto;
	}

	.pager-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: none;
		color: var(--color-ink);
		cursor: pointer;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease,
			background 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.pager-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-lavender) 28%, white);
	}

	.pager-btn:active:not(:disabled) {
		transform: scale(var(--press-scale));
		filter: brightness(0.97);
	}

	.pager-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.pager-btn:focus-visible {
		outline: 2px solid var(--color-lavender-deep);
		outline-offset: 2px;
	}

	.pager-status {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		color: var(--color-muted-ink);
		min-width: 5.5em;
		text-align: center;
		user-select: none;
	}
</style>
