<script lang="ts">
	import type { PageBlockRead } from '$lib/state/schema';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';

	interface Props {
		block: PageBlockRead;
	}

	let { block }: Props = $props();
</script>

<section class="read-block">
	{#if block.title}
		<h3 class="read-title">{block.title}</h3>
	{/if}
	<div class="bubble-k pair">
		<div class="nl-row">
			<span class="nl">{block.nl}</span>
			<SpeakerButton text={block.nl} size={16} />
		</div>
		<span class="en">{block.en}</span>
	</div>
</section>

<style>
	.read-block {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.read-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.3;
		word-break: break-word;
	}

	.pair {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 11px 14px;
		box-sizing: border-box;
		min-width: 0;
	}

	.nl-row {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
	}

	.nl {
		flex: 1;
		min-width: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.5;
		word-break: break-word;
	}

	.en {
		font-size: var(--text-base);
		color: var(--color-muted-ink);
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
</style>
