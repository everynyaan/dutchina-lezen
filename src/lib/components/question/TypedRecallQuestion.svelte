<script lang="ts">
	import type { QuizRecallQuestion } from '$lib/quiz/types';
	import { normalizeAnswer } from '$lib/quiz/normalizeAnswer';

	interface Props {
		question: QuizRecallQuestion;
		showResult: boolean;
		submittedAnswer: string | null;
		onanswer: (typedText: string, correct: boolean) => void;
	}

	let { question, showResult, submittedAnswer, onanswer }: Props = $props();

	let typed = $state('');

	function submit() {
		if (showResult) return;
		const raw = typed;
		if (!raw.trim()) return;
		const correct = normalizeAnswer(raw) === normalizeAnswer(question.answer);
		onanswer(raw, correct);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			submit();
		}
	}

	// Reset local input when the question identity changes (instance is reused).
	$effect(() => {
		void question.questionId;
		typed = '';
	});

	// When restoring a submitted answer (reload mid-quiz with showResult),
	// surface the persisted typed value in the input.
	$effect(() => {
		if (submittedAnswer !== null) {
			typed = submittedAnswer;
		}
	});

	let canSubmit = $derived(typed.trim().length > 0 && !showResult);
</script>

<div class="question-card qcard">
	<div class="q-eyebrow">Type the Dutch word</div>
	<div class="q-headword">
		<span class="headword">{question.english}</span>
		<span class="headword-pos">{question.pos}</span>
	</div>

	<div class="input-row">
		<input
			class="typed-input"
			type="text"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			placeholder="Type in Dutch…"
			bind:value={typed}
			disabled={showResult}
			readonly={showResult}
			{onkeydown}
			aria-label="Dutch translation"
		/>
		{#if !showResult}
			<button class="submit-btn" type="button" disabled={!canSubmit} onclick={submit}>
				Check
			</button>
		{/if}
	</div>

	{#if showResult}
		<div class="reveal">
			<div class="reveal-label">Answer</div>
			<div class="reveal-answer">{question.answer}</div>
			{#if question.sentenceNl}
				<div class="reveal-sentence">{question.sentenceNl}</div>
			{/if}
			{#if question.sentenceEn}
				<div class="reveal-sentence-en">{question.sentenceEn}</div>
			{/if}
		</div>
	{/if}
</div>

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
		flex-wrap: wrap;
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

	.input-row {
		display: flex;
		gap: 8px;
		align-items: stretch;
	}

	.typed-input {
		flex: 1;
		min-width: 0;
		padding: 12px 14px;
		border: 2px solid var(--color-ink);
		border-radius: 14px;
		background: var(--color-s1);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-ink);
		outline: none;
	}

	.typed-input:focus {
		background: #fff;
		box-shadow: var(--sticker-shadow);
	}

	.typed-input:disabled,
	.typed-input[readonly] {
		opacity: 0.9;
		background: color-mix(in srgb, var(--color-rose) 30%, white);
	}

	.submit-btn {
		padding: 12px 16px;
		background: var(--color-teal);
		color: var(--color-teal-deep);
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		box-shadow: var(--sticker-shadow);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		flex-shrink: 0;
	}

	.submit-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}

	.submit-btn:not(:disabled):hover {
		background: var(--color-teal-deep);
		color: var(--color-cream);
	}

	.submit-btn:not(:disabled):active {
		transform: scale(var(--press-scale));
	}

	.reveal {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 4px;
		padding-top: 10px;
		border-top: 2px dashed color-mix(in srgb, var(--color-ink) 25%, transparent);
	}

	.reveal-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
	}

	.reveal-answer {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
	}

	.reveal-sentence {
		font-size: 19px;
		line-height: 1.6;
		color: var(--color-text);
	}

	.reveal-sentence-en {
		font-size: var(--text-small);
		line-height: 1.5;
		color: var(--color-muted-ink);
	}
</style>
