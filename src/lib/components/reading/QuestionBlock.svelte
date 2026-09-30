<script lang="ts">
	import AnswerFeedback from './AnswerFeedback.svelte';
	import {
		displayOptions,
		resolveLoopItem,
		shownPhase,
		type LoopItem,
		type LoopPhase
	} from '$lib/reading/loop';

	interface Props {
		item: LoopItem;
		phase: LoopPhase;
		picked?: string;
		shuffle?: boolean;
		seed?: string;
		flaggable?: boolean;
		flagged?: boolean;
		locatedP?: number | null;
		answerP?: number | null;
		onPick?: (original: string) => void;
		onCheck?: () => void;
		onSkip?: () => void;
		onFlag?: () => void;
	}

	let {
		item,
		phase,
		picked = '',
		shuffle = false,
		seed = '',
		flaggable = false,
		flagged = false,
		locatedP = null,
		answerP = null,
		onPick,
		onCheck,
		onSkip,
		onFlag
	}: Props = $props();

	let resolved = $derived(resolveLoopItem(item));
	let phaseNow = $derived(shownPhase(phase, resolved.wholeText));
	let rows = $derived(displayOptions(item.options, shuffle, seed || item.id));
</script>

<section class="question">
	<p class="ask">{item.question}</p>
	{#if phaseNow !== 'feedback'}
		<p class="move">{resolved.move}</p>
	{/if}

	{#if phaseNow === 'locate'}
		<p class="prompt">Click the paragraph where the answer is</p>
		<button type="button" class="skip" onclick={() => onSkip?.()}>Skip</button>
	{:else if phaseNow === 'options'}
		<div class="opts">
			{#each rows as row (row.original)}
				<button
					type="button"
					class="opt"
					class:picked={picked === row.original}
					data-original={row.original}
					data-display={row.display}
					onclick={() => onPick?.(row.original)}
				>
					<strong>{row.display}</strong>
					{row.text}
				</button>
			{/each}
		</div>
		<button type="button" class="check" disabled={!picked} onclick={() => picked && onCheck?.()}>
			Check
		</button>
		{#if flaggable}
			<button type="button" class="flag" onclick={() => onFlag?.()}>
				{flagged ? 'Flagged' : 'Flag'}
			</button>
		{/if}
	{:else}
		<AnswerFeedback {item} {resolved} {picked} {locatedP} {answerP} />
	{/if}
</section>

<style>
	.question {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.ask {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.45;
		font-weight: 700;
	}
	.move,
	.prompt {
		margin: 0;
		color: var(--color-muted-ink);
		line-height: 1.45;
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.opt,
	.check,
	.flag,
	.skip {
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.opt {
		border: 2px solid var(--color-ink);
		border-radius: 10px;
		background: white;
		padding: 0.55rem 0.7rem;
	}
	.opt.picked {
		background: color-mix(in srgb, var(--color-lavender) 35%, white);
	}
	.check,
	.flag {
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		background: var(--color-rose);
		font-weight: 700;
	}
	.skip {
		align-self: flex-start;
		border: 0;
		background: transparent;
		color: var(--color-muted-ink);
		text-decoration: underline;
		padding: 0;
		font-size: 0.85rem;
	}
	.check:disabled {
		opacity: 0.45;
		cursor: default;
	}
</style>
