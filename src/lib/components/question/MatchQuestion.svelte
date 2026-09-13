<script lang="ts">
	import type { DailyMatchQuestion } from '$lib/daily/types';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import OptionList, { type OptionItem } from './OptionList.svelte';

	interface Props {
		question: DailyMatchQuestion;
		showResult: boolean;
		selectedIndex: number | null;
		onanswer: (index: number) => void;
	}

	let { question, showResult, selectedIndex, onanswer }: Props = $props();

	function escapeRegExp(s: string): string {
		return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	/**
	 * Split a sentence around the highlighted target word.
	 * Returns null if the target isn't found.
	 */
	function highlightTarget(
		sentence: string,
		target: string
	): { before: string; word: string; after: string } | null {
		if (!target) return null;
		const re = new RegExp(`\\b(${escapeRegExp(target)})\\b`, 'i');
		const match = re.exec(sentence);
		if (!match) return null;
		return {
			before: sentence.slice(0, match.index),
			word: match[0],
			after: sentence.slice(match.index + match[0].length)
		};
	}

	let selectedKey = $state<string | null>(null);
	let selectedText = $state<string | null>(null);
	let popoverPos = $state<{ top: number; left: number } | null>(null);

	function handleAudioTap(e: MouseEvent, key: string, text: string) {
		if (selectedKey === key) {
			clearAudioSelection();
			return;
		}
		selectedKey = key;
		selectedText = text;

		const span = e.currentTarget as HTMLElement;
		const card = span.closest('.question-card') as HTMLElement;
		if (!card) return;
		const spanRect = span.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();

		popoverPos = {
			top: spanRect.top - cardRect.top - 42,
			left: Math.max(0, Math.min(spanRect.left - cardRect.left, cardRect.width - 110))
		};
	}

	function clearAudioSelection() {
		selectedKey = null;
		selectedText = null;
		popoverPos = null;
	}

	// Reset popover when the question changes (component instance is reused).
	$effect(() => {
		void question.wordId;
		clearAudioSelection();
	});

	let options = $derived<OptionItem[]>(question.options.map((opt, i) => ({ key: i, text: opt })));
	let hl = $derived(highlightTarget(question.sentenceNl, question.targetDutch));
</script>

<div class="question-card qcard">
	<div class="q-eyebrow">Translate the highlighted word</div>
	<div class="q-sentence">
		{#if hl}
			{hl.before}<button
				type="button"
				class="hl-word"
				class:selected={selectedKey === 'match-target'}
				onclick={(e) => handleAudioTap(e, 'match-target', hl.word)}
				aria-label="Listen to the highlighted word">{hl.word}</button
			>{hl.after}
		{:else}
			{question.sentenceNl}
		{/if}
	</div>
	<div class="speaker-group">
		<SpeakerButton text={question.sentenceNl} />
		<SpeakerButton text={question.sentenceNl} slow />
	</div>
	{#if selectedKey === 'match-target' && selectedText && popoverPos}
		<div class="tts-popover" style="top: {popoverPos.top}px; left: {popoverPos.left}px;">
			<SpeakerButton text={selectedText} />
			<SpeakerButton text={selectedText} slow />
		</div>
	{/if}
</div>

<OptionList
	{options}
	selectedKey={selectedIndex}
	correctKey={question.correctIndex}
	{showResult}
	onselect={(key) => onanswer(key as number)}
/>

<style>
	.qcard {
		background: var(--color-s1);
		border: 2px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--shadow-offset-card);
		padding: 18px;
	}

	.q-eyebrow {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-muted-ink);
		text-transform: uppercase;
	}

	.q-sentence {
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--color-text);
	}

	/* Tappable target word inside the Match sentence — looks like a
	   button but flows inline. Tap fires the SpeakerButton popover. */
	.hl-word {
		display: inline;
		background: color-mix(in srgb, var(--color-blush) 75%, white);
		color: var(--color-ink);
		font-weight: 700;
		border: none;
		padding: 0 4px;
		border-radius: 4px;
		font: inherit;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--color-ink);
		transition: background 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.hl-word:hover,
	.hl-word.selected {
		background: color-mix(in srgb, var(--color-peach) 45%, white);
	}

	/* Popover anchoring a SpeakerButton pair to whatever sentence
	   or word is currently selected. Card-relative positioning is
	   computed in handleAudioTap(). */
	.tts-popover {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px;
		background: var(--color-s1);
		border: 2px solid var(--color-ink);
		border-radius: 14px;
		box-shadow: var(--sticker-shadow);
		z-index: 5;
	}

	.speaker-group {
		display: flex;
		gap: 4px;
	}
</style>
