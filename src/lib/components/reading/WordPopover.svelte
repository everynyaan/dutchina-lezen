<script lang="ts">
	import { reflexLine } from '$lib/kuromi/lines';
	import { lookupLabel } from '$lib/reading/notebook';
	import type { LexRecord } from '$lib/reading/lexicon';
	import type { SentenceNoteType } from '$lib/reading/types';

	interface Selection {
		text: string;
		p: number;
		sentence: boolean;
	}

	interface Props {
		selection: Selection;
		record: LexRecord | null;
		left: number;
		onLookup: () => void;
		onAddWord: (input: {
			guessed: 'knew' | 'unsure' | null;
			guessText: string;
			englishRevealed: boolean;
		}) => void;
		onAddSentence: (sentenceType: SentenceNoteType) => void;
		onClose: () => void;
	}

	let { selection, record, left, onLookup, onAddWord, onAddSentence, onClose }: Props = $props();

	let step = $state<'actions' | 'guess' | 'meaning'>('actions');
	let guessed = $state<'knew' | 'unsure' | null>(null);
	let guessText = $state('');
	let english = $state(false);
	let sentenceType = $state<SentenceNoteType>('hard');
	let looked = $state(false);
	let guessHint = reflexLine('notebook-guess');

	function showMeaning() {
		step = 'meaning';
	}

	function guess(kind: 'knew' | 'unsure') {
		guessed = kind;
		showMeaning();
	}

	function lookUp() {
		looked = true;
		onLookup();
		showMeaning();
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
			return;
		}
		if (event.key !== 'Enter') return;
		const target = event.target as HTMLElement | null;
		if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) return;
		if (selection.sentence) return;
		if (step === 'actions') {
			event.preventDefault();
			step = 'guess';
		}
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="pop" role="dialog" aria-label="Notebook">
	<p class="surface">{selection.text}</p>
	{#if selection.sentence}
		<label>
			Type
			<select bind:value={sentenceType}>
				<option value="signal">signal word</option>
				<option value="rule">rule or condition</option>
				<option value="opinion">opinion</option>
				<option value="hard">hard sentence</option>
			</select>
		</label>
		<button type="button" class="btn" onclick={() => onAddSentence(sentenceType)}>Add sentence</button>
	{:else if step === 'actions'}
		<p class="hint">{guessHint}</p>
		<p>{lookupLabel(left)}</p>
		<button type="button" class="btn" onclick={() => (step = 'guess')}>Guess</button>
		<button type="button" class="btn ghost" onclick={lookUp}>Look up</button>
		<button
			type="button"
			class="btn ghost"
			onclick={() => onAddWord({ guessed: null, guessText: '', englishRevealed: false })}
			>Add to notebook</button
		>
	{:else if step === 'guess'}
		<p>What do you think it means here?</p>
		<textarea bind:value={guessText} rows="2" placeholder="You can skip this"></textarea>
		<button type="button" class="btn" onclick={() => guess('knew')}>I know it</button>
		<button type="button" class="btn ghost" onclick={() => guess('unsure')}>Not sure</button>
	{:else}
		{#if record?.nl}
			<p>{record.nl}</p>
		{:else}
			<p>No Dutch definition for this word.</p>
		{/if}
		{#if english && record?.en}
			<p class="en">{record.en}</p>
		{:else if record?.en}
			<button type="button" class="btn ghost" onclick={() => (english = true)}>show English</button>
		{/if}
		<button
			type="button"
			class="btn"
			onclick={() =>
				onAddWord({
					guessed: looked ? null : guessed,
					guessText,
					englishRevealed: english
				})}
			>Add to notebook</button
		>
	{/if}
	<button type="button" class="btn ghost" onclick={onClose}>Close</button>
</div>

<style>
	.pop {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin: 0.6rem 0;
		padding: 0.7rem;
		border: 1px solid var(--color-line, #e4d7df);
		border-radius: 10px;
		background: #fff;
	}
	.surface {
		font-weight: 700;
		margin: 0;
	}
	.hint,
	.en,
	p {
		margin: 0;
	}
	textarea,
	select {
		font: inherit;
		width: 100%;
	}
	.btn {
		font: inherit;
		cursor: pointer;
	}
</style>
