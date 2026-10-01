<script lang="ts">
	interface Props {
		label: string;
		value: string;
		tint?: 'rose' | 'teal' | 'lavender' | 'peach' | 'ink';
		mark?: string;
	}

	let { label, value, tint = 'rose', mark = '•' }: Props = $props();
</script>

<span class="stat" data-tint={tint}>
	<span class="mark" aria-hidden="true">{mark}</span>
	<span class="copy">
		<span class="label">{label}</span>
		<span class="value">{value}</span>
	</span>
</span>

<style>
	.stat {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px 6px 6px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--tint, var(--color-rose)) 28%, white);
		box-shadow: var(--shadow-offset-pill);
		max-width: 100%;
	}

	.stat[data-tint='rose'] {
		--tint: var(--color-rose);
	}
	.stat[data-tint='teal'] {
		--tint: var(--color-teal);
	}
	.stat[data-tint='lavender'] {
		--tint: var(--color-lavender);
	}
	.stat[data-tint='peach'] {
		--tint: var(--color-peach);
	}
	.stat[data-tint='ink'] {
		--tint: var(--color-lavender);
	}

	.mark {
		width: 28px;
		height: 28px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: white;
		color: var(--color-ink);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 14px;
		flex-shrink: 0;
	}

	.copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.label,
	.value {
		font-size: 14px;
		line-height: 1.2;
	}

	.label {
		color: var(--color-muted-ink);
	}

	.value {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--color-ink);
	}
</style>
