<script lang="ts">
	interface Props {
		percent: number;
		label: string;
		kind: 'locked' | 'open' | 'done';
		showPercent?: boolean;
	}

	let { percent, label, kind, showPercent = false }: Props = $props();

	let clamped = $derived(Math.max(0, Math.min(100, percent)));
</script>

<div
	class="mastery"
	class:is-locked={kind === 'locked'}
	class:is-done={kind === 'done'}
	data-mastery-bar
	data-kind={kind}
	data-percent={clamped}
>
	<div
		class="track"
		role="progressbar"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={clamped}
		aria-label={label}
	>
		<div
			class="fill"
			class:has-progress={clamped > 0}
			style="width: {clamped}%"
		></div>
	</div>
	{#if showPercent && kind === 'open'}
		<span class="caption pct">{clamped}%</span>
	{:else if kind === 'locked'}
		<span class="caption">Locked</span>
	{:else if kind === 'done'}
		<span class="caption">Done</span>
	{/if}
</div>

<style>
	.mastery {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		margin-top: 12px;
		flex-shrink: 0;
		opacity: 1;
	}

	.track {
		flex: 1;
		min-width: 0;
		min-height: 10px;
		height: 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.72);
		box-shadow: inset 0 0 0 1px rgba(61, 53, 80, 0.28);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		min-height: 10px;
		border-radius: 999px;
		background: var(--color-rose-deep);
		transition: width 0.4s ease;
	}

	.fill.has-progress {
		min-width: 12px;
	}

	.caption {
		flex-shrink: 0;
		font-size: var(--text-micro);
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 1;
	}

	.pct {
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
	}

	.is-locked .track {
		background: rgba(255, 255, 255, 0.5);
		box-shadow: inset 0 0 0 1px rgba(61, 53, 80, 0.2);
	}

	.is-locked .fill {
		width: 0;
		background: transparent;
	}

	.is-done .fill {
		background: var(--color-teal-deep);
	}

	@media (prefers-reduced-motion: reduce) {
		.fill {
			transition: none;
		}
	}
</style>
