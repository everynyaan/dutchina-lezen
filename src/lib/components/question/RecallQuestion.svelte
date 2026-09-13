<script lang="ts">
	import type { DailyRecallQuestion } from '$lib/daily/types';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import OptionList, { type OptionItem } from './OptionList.svelte';

	interface Props {
		question: DailyRecallQuestion;
		showResult: boolean;
		selectedIndex: number | null;
		onanswer: (index: number) => void;
	}

	let { question, showResult, selectedIndex, onanswer }: Props = $props();

	let options = $derived<OptionItem[]>(question.options.map((opt, i) => ({ key: i, text: opt })));
</script>

<div class="question-card qcard">
	<div class="q-eyebrow">What does this Dutch word mean?</div>
	<div class="q-headword">
		<span class="headword">{question.dutchWord}</span>
		<span class="headword-pos">{question.pos}</span>
	</div>
	<div class="speaker-group">
		<SpeakerButton text={question.dutchWord} />
	</div>
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

	.q-headword {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}

	.headword {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-ink);
	}

	.headword-pos {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-muted-ink);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.speaker-group {
		display: flex;
		gap: 4px;
	}
</style>
