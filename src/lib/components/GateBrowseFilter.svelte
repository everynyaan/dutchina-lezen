<script lang="ts">
	import { BROWSE_GATES, browseCaption, persistBrowseGate } from '$lib/gates/browse';
	import type { GateId } from '$lib/gates/gates';

	interface Props {
		current: GateId;
		selected: GateId;
		onSelect: (gate: GateId) => void;
		noun?: string;
	}

	let { current, selected, onSelect, noun = 'set' }: Props = $props();

	let caption = $derived(browseCaption(selected, current, noun));

	function pick(gate: GateId) {
		persistBrowseGate(gate);
		onSelect(gate);
	}
</script>

<div class="browse-filter">
	<div class="chips" role="tablist" aria-label="Look up a gate">
		{#each BROWSE_GATES as gate (gate)}
			<button
				type="button"
				class="chip"
				class:active={selected === gate}
				class:current-room={gate === current}
				role="tab"
				aria-selected={selected === gate}
				onclick={() => pick(gate)}
			>
				Gate {gate}
			</button>
		{/each}
	</div>
	<p class="caption">{caption}</p>
</div>

<style>
	.browse-filter {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chip {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1.5px solid var(--color-ink);
		background: color-mix(in srgb, white 70%, transparent);
		color: var(--color-ink);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.chip.current-room {
		box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 12%, transparent);
	}

	.chip.active {
		background: var(--color-ink);
		color: var(--color-cream);
	}

	.caption {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-micro);
		line-height: 1.4;
		color: var(--color-muted-ink);
	}
</style>
