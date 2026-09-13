<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	interface Props {
		labels: string[];
		selectedLabels: string[];
		query: string;
		archived: boolean;
		onToggleLabel: (label: string) => void;
		onQueryChange: (query: string) => void;
		onToggleArchived: () => void;
	}

	let {
		labels,
		selectedLabels,
		query,
		archived,
		onToggleLabel,
		onQueryChange,
		onToggleArchived
	}: Props = $props();

	const JIT_CLASSES = ['jit-a', 'jit-b', 'jit-c', 'jit-1', 'jit-2', 'jit-3', 'jit-4'] as const;
</script>

<div class="shelf-filters">
	<div class="search-wrap">
		<span class="search-prefix" aria-hidden="true">
			<Icon name="magnifying-glass" size={16} color="var(--color-muted-ink)" />
		</span>
		<input
			type="text"
			class="search-input"
			placeholder="Search pages..."
			value={query}
			oninput={(e) => onQueryChange(e.currentTarget.value)}
			aria-label="Search pages"
		/>
		{#if query}
			<button
				type="button"
				class="search-clear tappable"
				onclick={() => onQueryChange('')}
				aria-label="Clear search"
			>
				<Icon name="xmark" size={16} color="var(--color-muted-ink)" />
			</button>
		{/if}
	</div>

	{#if labels.length > 0}
		<div class="label-chips" role="group" aria-label="Filter by label">
			{#each labels as label, index (label)}
				{@const jit = JIT_CLASSES[index % JIT_CLASSES.length]}
				{@const selected = selectedLabels.includes(label)}
				<button
					type="button"
					class="label-chip r-pill {jit}"
					class:selected
					aria-pressed={selected}
					onclick={() => onToggleLabel(label)}
				>
					{#if selected}
						<Icon name="check" size={14} color="currentColor" />
					{/if}
					{label}
				</button>
			{/each}
		</div>
	{/if}

	<button
		type="button"
		class="archived-toggle r-pill"
		aria-pressed={archived}
		onclick={onToggleArchived}
	>
		{archived ? 'Archived' : 'Active'}
	</button>
</div>

<style>
	.shelf-filters {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.search-wrap {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.search-prefix {
		position: absolute;
		left: 12px;
		display: flex;
		align-items: center;
		pointer-events: none;
		line-height: 0;
	}

	.search-input {
		width: 100%;
		min-width: 0;
		padding: 10px 40px 10px 38px;
		background: color-mix(in srgb, white 70%, transparent);
		border: 1px solid var(--color-line);
		border-radius: 999px;
		color: var(--color-ink);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		outline: none;
		box-sizing: border-box;
	}

	.search-input::placeholder {
		color: var(--color-muted-ink);
	}

	.search-input:focus {
		border-color: var(--color-lavender-deep);
	}

	.search-clear {
		position: absolute;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.label-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-width: 0;
	}

	.label-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		border: 2px solid var(--color-ink);
		background: color-mix(in srgb, white 75%, var(--color-lavender));
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		box-shadow: var(--sticker-shadow);
	}

	.label-chip.selected {
		background: var(--color-lavender);
		color: var(--color-lavender-deep);
	}

	.archived-toggle {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		padding: 6px 14px;
		border: 2px solid var(--color-ink);
		background: color-mix(in srgb, white 80%, var(--color-cream));
		color: var(--color-muted-ink);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		box-shadow: var(--sticker-shadow);
	}

	.archived-toggle[aria-pressed='true'] {
		background: color-mix(in srgb, var(--color-lavender) 40%, white);
		color: var(--color-ink);
	}
</style>
