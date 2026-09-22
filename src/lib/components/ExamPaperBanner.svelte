<script lang="ts">
	interface Props {
		note?: string;
	}
	let { note = 'Training papers, 2024 and 2025. Not the dress rehearsal.' }: Props = $props();
</script>

<div class="exam-banner" role="note">
	<strong>B1 paper</strong>
	<span>{note}</span>
</div>

<style>
	.exam-banner {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px 10px;
		padding: 10px 14px;
		border-radius: 14px;
		background: color-mix(in srgb, var(--color-teal) 28%, white);
		color: var(--color-teal-deep);
		font-size: var(--text-small);
		line-height: 1.35;
	}

	.exam-banner strong {
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.02em;
	}
</style>
