<script lang="ts" module>
	export interface OptionItem {
		key: string | number;
		letter?: string;
		text: string;
	}
</script>

<script lang="ts">
	import { Check, X } from 'lucide-svelte';

	interface Props {
		options: OptionItem[];
		selectedKey: string | number | null;
		correctKey: string | number | null;
		showResult: boolean;
		onselect: (key: string | number) => void;
	}

	let { options, selectedKey, correctKey, showResult, onselect }: Props = $props();
</script>

<div class="options-col">
	{#each options as item (item.key)}
		<button
			class="option-btn"
			class:correct={showResult && item.key === correctKey}
			class:wrong={showResult && selectedKey === item.key && item.key !== correctKey}
			class:dimmed={showResult && selectedKey !== item.key && item.key !== correctKey}
			onclick={() => onselect(item.key)}
			disabled={showResult}
		>
			{#if item.letter}
				<span class="option-letter">{item.letter}</span>
			{/if}
			<span class="option-text">{item.text}</span>
			{#if showResult && item.key === correctKey}
				<Check size={16} class="option-icon" />
			{:else if showResult && selectedKey === item.key}
				<X size={16} class="option-icon" />
			{/if}
		</button>
	{/each}
</div>

<style>
	.options-col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.option-btn {
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		background: var(--color-s1);
		border: none;
		border-radius: 16px;
		box-shadow: var(--shadow-offset-pill);
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.option-btn:hover:not(:disabled) {
		box-shadow: var(--shadow-offset-pill);
		background: color-mix(in srgb, var(--color-s1) 92%, var(--color-ink));
	}

	.option-btn:active:not(:disabled) {
		transform: scale(var(--press-scale));
	}

	.option-btn.correct {
		border: 2px solid var(--color-teal-deep);
		background: color-mix(in srgb, var(--color-teal) 30%, white);
		color: var(--color-teal-deep);
	}

	.option-btn.wrong {
		border: 2px solid var(--color-rose-deep);
		background: color-mix(in srgb, var(--color-rose) 30%, white);
		color: var(--color-rose-deep);
	}

	.option-btn.dimmed {
		opacity: 0.45;
		border: none;
	}

	.option-btn:disabled {
		cursor: default;
	}

	.option-letter {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 800;
		color: var(--color-muted-ink);
		width: 20px;
		flex-shrink: 0;
		padding-top: 1px;
	}

	.option-btn.correct .option-letter {
		color: var(--color-teal-deep);
	}

	.option-btn.wrong .option-letter {
		color: var(--color-rose-deep);
	}

	.option-text {
		flex: 1;
		line-height: 1.4;
	}

	:global(.option-icon) {
		flex-shrink: 0;
		margin-left: auto;
	}
</style>
