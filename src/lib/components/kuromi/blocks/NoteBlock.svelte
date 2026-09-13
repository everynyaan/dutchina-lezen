<script lang="ts">
	import type { PageBlockNote } from '$lib/state/schema';

	interface Props {
		block: PageBlockNote;
	}

	let { block }: Props = $props();
</script>

<div class="note r-chip edge-hair">
	<p class="note-body">{block.body}</p>
</div>

<style>
	.note {
		padding: 12px 14px;
		background: color-mix(in srgb, white 72%, var(--color-cream));
		box-sizing: border-box;
		min-width: 0;
	}

	.note-body {
		margin: 0;
		font-size: var(--text-base);
		color: var(--color-ink);
		line-height: 1.55;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
