<!--
  InlineQuestion.svelte -- Phase 6 Unit C.

  Renders one tappable multiple-choice question inside a Kuromi chat bubble,
  parsed from a [question]...[/question] block by mood.ts (parseReply). Reuses
  the shared OptionList.svelte -- never a parallel renderer.

  THE SANDBOX GUARANTEE: this file imports nothing from $lib/lp/*,
  $lib/cards/srs, cardStore, or any mission/achievement engine. Answering
  here changes no persisted learning state -- no LP, no cardReviews write,
  no mission progress, no achievement. Chat is a sandbox.
-->
<script lang="ts">
	import OptionList, { type OptionItem } from '$lib/components/question/OptionList.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import type { ParsedQuestion } from '$lib/kuromi/mood';
	import { playSfx } from '$lib/sound/sfx';

	interface Props {
		question: ParsedQuestion;
	}

	let { question }: Props = $props();

	// Answered state lives in this component instance's own state. It survives
	// scrolling the transcript away and back, since the instance stays mounted --
	// that is all section 4 asks for ("remembered for the rest of the session").
	// It is never written to storage of any kind, so a hard reload naturally
	// re-parses the stored [question] block and re-renders it fresh and
	// interactive -- the round-trip section 3 promises for old conversations.
	let selected = $state<string | null>(null);

	const options = $derived<OptionItem[]>(question.options.map((text) => ({ key: text, text })));
	const showResult = $derived(selected !== null);
	const isCorrect = $derived(selected !== null && selected === question.correct);

	// Her reaction is entirely local -- no extra model round trip. Picked from the
	// manifest moods already in PERSONA_MOODS (section 4): correct -> hehe/excited,
	// wrong -> shocked/grumpy. A stable, deterministic pick per option text, not
	// random, so the same wrong tap always shows the same face.
	const CORRECT_MOODS = ['hehe', 'excited'] as const;
	const WRONG_MOODS = ['shocked', 'grumpy'] as const;

	function pickMood(pool: readonly string[], seed: string): string {
		let sum = 0;
		for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
		return pool[sum % pool.length];
	}

	const reactionMood = $derived(
		selected === null ? null : pickMood(isCorrect ? CORRECT_MOODS : WRONG_MOODS, selected)
	);

	// Sound and expression are one event -- both keyed off the same `selected`
	// write, in the same synchronous handler, never independently (section 4:
	// "sound + expression together or not at all"). Re-wired to the same
	// already-registered SfxEvent names DrillPanel/QuizRunner would reach for --
	// no new files under static/sfx/.
	function handleSelect(key: string | number) {
		if (selected !== null) return;
		const value = key as string;
		selected = value;
		playSfx(value === question.correct ? 'correct' : 'wrong');
	}
</script>

<div class="inline-question">
	<p class="iq-prompt">{question.prompt}</p>
	<OptionList
		{options}
		selectedKey={selected}
		correctKey={question.correct}
		{showResult}
		onselect={handleSelect}
	/>
	{#if selected !== null}
		{@const rMood = reactionMood ?? 'talk'}
		<div class="iq-result-row" aria-live="polite">
			<Character who="kuromi" mood={rMood} size={36} animated alt="" />
			<span class="iq-result-label" class:iq-correct={isCorrect} class:iq-wrong={!isCorrect}>
				{isCorrect ? 'Correct.' : 'Not quite.'}
			</span>
		</div>
		{#if question.explanation}
			<p class="iq-explanation">{question.explanation}</p>
		{/if}
	{/if}
</div>

<style>
	.inline-question {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.iq-prompt {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-text);
		line-height: 1.4;
	}

	.iq-result-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.iq-result-label {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.iq-result-label.iq-correct {
		color: var(--color-teal-deep);
	}

	.iq-result-label.iq-wrong {
		color: var(--color-rose-deep);
	}

	.iq-explanation {
		margin: 0;
		font-size: var(--text-small);
		line-height: 1.45;
		color: var(--color-muted-ink);
	}
</style>
