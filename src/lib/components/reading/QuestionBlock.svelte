<script lang="ts">
	import { QTYPE_LABEL } from '$lib/reading/annotations';
	import AnswerFeedback from './AnswerFeedback.svelte';
	import {
		displayOptions,
		resolveLoopItem,
		shownPhase,
		type LoopItem,
		type LoopPhase,
		type ParagraphMapEntry
	} from '$lib/reading/loop';
	import { buildCoachContext, coachSourceFromLoop } from '$lib/kuromi/coach';
	import { setHintItem } from '$lib/kuromi/focus';
	import { reflexLine } from '$lib/kuromi/lines';
	import { isKuromiLive } from '$lib/kuromi/live';
	import { requestKuromiChat } from '$lib/kuromi/visibility.svelte';

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
		paragraphMap?: ParagraphMapEntry[];
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
		onFlag,
		paragraphMap = []
	}: Props = $props();

	let hintLabel = reflexLine('hint-label');
	let live = isKuromiLive();
	let resolved = $derived(resolveLoopItem(item));
	let phaseNow = $derived(shownPhase(phase, resolved.wholeText));
	let rows = $derived(displayOptions(item.options, shuffle, seed || item.id));

	function askHint() {
		const coachPhase = phaseNow === 'options' ? 'options' : 'locate';
		setHintItem(buildCoachContext(coachPhase, coachSourceFromLoop(item, paragraphMap)));
		requestKuromiChat();
	}
</script>

<section class="question">
	<p class="sticker jit-2">{QTYPE_LABEL[resolved.qtype]}</p>
	<p class="ask">{item.question}</p>
	{#if phaseNow !== 'feedback'}
		<p class="move">{resolved.move}</p>
	{/if}

	{#if phaseNow === 'locate'}
		<p class="prompt">Click the paragraph where the answer is</p>
		<button type="button" class="skip" onclick={() => onSkip?.()}>Skip</button>
		{#if live && hintLabel}
			<button type="button" class="hint" onclick={askHint}>{hintLabel}</button>
		{/if}
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
		{#if live && hintLabel}
			<button type="button" class="hint" onclick={askHint}>{hintLabel}</button>
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
	.sticker {
		align-self: flex-start;
		margin: 0;
		padding: 3px 8px;
		border-radius: 999px;
		background: var(--color-rose);
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.2;
	}
	.ask {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		line-height: 1.35;
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
		border: none;
		border-radius: 10px;
		background: white;
		box-shadow: var(--shadow-offset-pill);
		padding: 0.55rem 0.7rem;
	}
	.opt.picked {
		background: color-mix(in srgb, var(--color-lavender) 35%, white);
	}
	.check,
	.flag {
		border: none;
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		background: var(--color-rose);
		font-weight: 700;
	}
	.skip,
	.hint {
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
