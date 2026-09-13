<script lang="ts">
	import { mintDrillIds, type KuromiDrillSet, type KuromiQuestion } from '$lib/kuromi/drill';
	import { normalizeAnswer } from '$lib/quiz/normalizeAnswer';
	import OptionList from '$lib/components/question/OptionList.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import { Check, X, ArrowRight } from 'lucide-svelte';

	interface DrillItem {
		id: string;
		question: KuromiQuestion;
	}

	interface Props {
		set: KuromiDrillSet;
		onreset?: () => void;
	}

	let { set, onreset }: Props = $props();

	let items = $state<DrillItem[]>([]);
	let cursor = $state(0);
	let results = $state<Record<string, boolean>>({});
	let showResult = $state(false);
	let selectedKey = $state<string | number | null>(null);
	let typed = $state('');
	let finished = $state(false);

	function buildItems(drillSet: KuromiDrillSet): DrillItem[] {
		const ids = mintDrillIds(drillSet.questions);
		return drillSet.questions.map((question, i) => ({
			id: ids[i],
			question
		}));
	}

	$effect(() => {
		items = buildItems(set);
		cursor = 0;
		results = {};
		showResult = false;
		selectedKey = null;
		typed = '';
		finished = false;
	});

	let current = $derived(items.length > 0 && cursor < items.length ? items[cursor] : null);
	let total = $derived(items.length);
	let correctCount = $derived(Object.values(results).filter((v) => v === true).length);
	let canSubmitRecall = $derived(typed.trim().length > 0 && !showResult);

	function mcqOptions(question: KuromiQuestion) {
		return question.options.map((text, i) => ({ key: i, text }));
	}

	function mcqCorrectKey(question: KuromiQuestion): number | null {
		const idx = question.options.findIndex((o) => o === question.answer);
		return idx >= 0 ? idx : null;
	}

	function recordAnswer(id: string, correct: boolean) {
		results = { ...results, [id]: correct };
		showResult = true;
	}

	function onMcqSelect(key: string | number) {
		if (!current || showResult) return;
		selectedKey = key;
		const correct = key === mcqCorrectKey(current.question);
		recordAnswer(current.id, correct);
	}

	function submitRecall() {
		if (!current || showResult) return;
		const raw = typed;
		if (!raw.trim()) return;
		const correct = normalizeAnswer(raw) === normalizeAnswer(current.question.answer);
		recordAnswer(current.id, correct);
	}

	function onRecallKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			submitRecall();
		}
	}

	function advance() {
		if (!current) return;
		if (cursor >= items.length - 1) {
			finished = true;
			return;
		}
		cursor = cursor + 1;
		showResult = false;
		selectedKey = null;
		typed = '';
	}

	function makeAnother() {
		onreset?.();
	}
</script>

<div class="quiz-runner">
	{#if finished}
		<Card variant="soft-lavender" class="summary-card">
			<div class="summary-eyebrow">Sandbox drill</div>
			<div class="summary-title">{set.title}</div>
			<div class="summary-score">
				<span class="score-num">{correctCount}</span>
				<span class="score-sep">/</span>
				<span class="score-den">{total}</span>
			</div>
			<div class="score-label">correct — no LP, no cards, just practice</div>
			<div class="summary-actions">
				<button type="button" class="action-btn" onclick={makeAnother}>Make another</button>
			</div>
		</Card>
	{:else if current}
		<div class="runner-header">
			<span class="progress-label">Question {cursor + 1} of {total}</span>
			<Pill variant="kuromi" size="sm">{current.question.type}</Pill>
		</div>

		{#if set.intro_quip && cursor === 0 && !showResult}
			<p class="intro-quip">{set.intro_quip}</p>
		{/if}

		{#key current.id}
			{#if current.question.type === 'mcq'}
				<Card class="question-card" variant="white">
					<div class="prompt">{current.question.prompt}</div>
					<OptionList
						options={mcqOptions(current.question)}
						{selectedKey}
						correctKey={mcqCorrectKey(current.question)}
						{showResult}
						onselect={onMcqSelect}
					/>
				</Card>
			{:else}
				<Card class="question-card" variant="white">
					<div class="prompt">{current.question.prompt}</div>
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
							onkeydown={onRecallKeydown}
							aria-label="Dutch answer"
						/>
						{#if !showResult}
							<button
								class="submit-btn"
								type="button"
								disabled={!canSubmitRecall}
								onclick={submitRecall}
							>
								Check
							</button>
						{/if}
					</div>
					{#if showResult}
						<div class="reveal">
							<div class="reveal-label">Answer</div>
							<div class="reveal-answer">{current.question.answer}</div>
						</div>
					{/if}
				</Card>
			{/if}
		{/key}

		{#if showResult}
			{@const wasCorrect = results[current.id] === true}
			<div class="result-row">
				<Character who="kuromi" mood={wasCorrect ? 'hehe' : 'grumpy'} size={48} animated alt="" />
				<div class="result-body">
					<Sticker variant={wasCorrect ? 'tip' : 'trap'}>
						<span class="result-line">
							{#if wasCorrect}
								<Check size={16} /> Correct!
							{:else}
								<X size={16} /> Not quite.
							{/if}
						</span>
					</Sticker>
					<p class="explanation">{current.question.explanation_quip}</p>
				</div>
			</div>
			<button type="button" class="next-btn" onclick={advance}>
				{#if cursor >= items.length - 1}
					<span>Finish</span>
					<Check size={16} />
				{:else}
					<span>Next</span>
					<ArrowRight size={16} />
				{/if}
			</button>
		{/if}
	{/if}
</div>

<style>
	.quiz-runner {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.runner-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.progress-label {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-kuromi);
		text-transform: uppercase;
	}

	.intro-quip {
		font-size: var(--text-small);
		line-height: 1.45;
		color: var(--color-kuromi-mid);
		margin: 0;
		font-style: italic;
	}

	.prompt {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-kuromi);
		line-height: 1.3;
		margin-bottom: 12px;
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
		border: 2px solid var(--color-kuromi);
		border-radius: 14px;
		background: var(--color-s1);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-kuromi);
		outline: none;
	}

	.typed-input:focus {
		background: #fff;
		box-shadow: var(--sticker-shadow);
	}

	.typed-input:disabled,
	.typed-input[readonly] {
		opacity: 0.9;
		background: var(--color-s2);
	}

	.submit-btn {
		padding: 12px 16px;
		background: var(--color-rose);
		color: var(--color-kuromi);
		border: 2px solid var(--color-kuromi);
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
		background: var(--color-accent);
		color: var(--color-cream);
	}

	.reveal {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 2px dashed color-mix(in srgb, var(--color-kuromi) 25%, transparent);
	}

	.reveal-label {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-kuromi-mid);
	}

	.reveal-answer {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-kuromi);
	}

	.result-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.result-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.result-line {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
	}

	.explanation {
		font-size: var(--text-small);
		line-height: 1.45;
		color: var(--color-text);
		margin: 0;
	}

	.next-btn,
	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 18px;
		background: var(--color-rose);
		color: var(--color-kuromi);
		border: 2px solid var(--color-kuromi);
		border-radius: 999px;
		box-shadow: var(--sticker-shadow);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		align-self: stretch;
	}

	.next-btn:hover,
	.action-btn:hover {
		background: var(--color-accent);
		color: var(--color-cream);
	}

	.next-btn:active,
	.action-btn:active {
		transform: scale(var(--press-scale));
	}

	.summary-eyebrow {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-kuromi-mid);
	}

	.summary-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-kuromi);
		margin-top: 4px;
	}

	.summary-score {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-top: 12px;
	}

	.score-num {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-kuromi);
	}

	.score-sep,
	.score-den {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-kuromi-mid);
	}

	.score-label {
		font-size: var(--text-small);
		color: var(--color-kuromi-mid);
		margin-top: 4px;
	}

	.summary-actions {
		margin-top: 16px;
	}
</style>
