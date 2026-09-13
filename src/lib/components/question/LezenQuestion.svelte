<script lang="ts">
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import type { DailyLezenQuestion } from '$lib/daily/types';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import OptionList, { type OptionItem } from './OptionList.svelte';

	interface Props {
		question: DailyLezenQuestion;
		showResult: boolean;
		selectedLetter: string | null;
		onanswer: (letter: string) => void;
		expanded: boolean;
		ontoggleexpand: () => void;
	}

	let { question, showResult, selectedLetter, onanswer, expanded, ontoggleexpand }: Props =
		$props();

	interface TextParagraph {
		sentences: string[];
	}

	function splitIntoParagraphs(text: string): TextParagraph[] {
		return text
			.split(/\n\n+/)
			.filter((p) => p.trim())
			.map((para) => {
				const parts = para.trim().split(/(?<=[.!?]['’”"]?)\s+(?=[A-ZÀ-ÖØ-Þ''"])/);
				return { sentences: parts.map((s) => s.trim()).filter((s) => s.length > 0) };
			});
	}

	function lezenLetters(opts: Record<string, string>): string[] {
		return Object.keys(opts).sort();
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
		void question.questionId;
		clearAudioSelection();
	});

	let options = $derived<OptionItem[]>(
		lezenLetters(question.options).map((letter) => ({
			key: letter,
			letter,
			text: question.options[letter]
		}))
	);

	let lezenParas = $derived(
		splitIntoParagraphs(expanded ? question.fullPassage : question.excerpt)
	);
</script>

<div class="question-card qcard">
	<div class="q-eyebrow">{question.passageName} — Reading</div>
	<div class="q-excerpt tappable-text">
		{#each lezenParas as para, pi (pi)}
			<p class="excerpt-para">
				{#each para.sentences as sentence, si (si)}
					{@const key = `lz-${expanded ? 'f' : 'e'}-${pi}-${si}`}
					<span
						class="tappable-sentence"
						class:selected={selectedKey === key}
						role="button"
						tabindex="0"
						onclick={(e) => handleAudioTap(e, key, sentence)}>{sentence}</span
					>
				{/each}
			</p>
		{/each}
	</div>
	<button
		class="passage-toggle"
		onclick={() => {
			clearAudioSelection();
			ontoggleexpand();
		}}
	>
		{#if expanded}
			<ChevronUp size={14} /> Hide full passage
		{:else}
			<ChevronDown size={14} /> Read full passage
		{/if}
	</button>
	<div class="q-prompt">{question.question}</div>
	{#if selectedKey?.startsWith('lz-') && selectedText && popoverPos}
		<div class="tts-popover" style="top: {popoverPos.top}px; left: {popoverPos.left}px;">
			<SpeakerButton text={selectedText} />
			<SpeakerButton text={selectedText} slow />
		</div>
	{/if}
</div>

<OptionList
	{options}
	selectedKey={selectedLetter}
	correctKey={question.answer}
	{showResult}
	onselect={(key) => onanswer(key as string)}
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

	/* Tappable sentences inside reading passages (Lezen + story
	   excerpt in Conversation). Same idiom as /conversation and
	   /lezen — tap opens a small popover with regular + slow audio. */
	.excerpt-para {
		margin: 0 0 8px 0;
	}

	.excerpt-para:last-child {
		margin-bottom: 0;
	}

	.tappable-sentence {
		display: inline;
		cursor: pointer;
		border-radius: 4px;
		padding: 1px 2px;
		transition:
			background 0.15s,
			color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.tappable-sentence:hover {
		background: color-mix(in srgb, var(--color-blush) 60%, white);
	}

	.tappable-sentence.selected {
		background: color-mix(in srgb, var(--color-peach) 45%, white);
		color: var(--color-ink);
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

	.q-prompt {
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--color-text);
		font-weight: 500;
	}

	.q-excerpt {
		font-size: 19px;
		line-height: 1.6;
		color: var(--color-text);
		background: color-mix(in srgb, var(--color-rose) 30%, white);
		padding: 10px 12px;
		border-radius: 12px;
		white-space: pre-line;
		max-height: 220px;
		overflow-y: auto;
	}

	.passage-toggle {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		color: var(--color-rose-deep);
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		cursor: pointer;
		padding: 4px 0;
		-webkit-tap-highlight-color: transparent;
	}

	.passage-toggle:hover {
		opacity: 0.9;
	}
</style>
