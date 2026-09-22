<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { findPassage, findQuestion } from '$lib/reading/bank';
	import { applyShowUpStreak, enqueueMiss, ensureTodayEval } from '$lib/reading/eval';
	import { evidenceOf } from '$lib/reading/evidence';
	import { MOVE_LINE, moveOf } from '$lib/reading/moves';
	import { MINUTES_PER_TEXT } from '$lib/reading/mock';
	import { looksLikeWordCopy, WORD_COPY_LINE } from '$lib/reading/wordCopy';
	import TimeBox from '$lib/components/reading/TimeBox.svelte';
	import PassageText from '$lib/components/reading/PassageText.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	function primeEval() {
		const next = ensureTodayEval(ctx.state.readingFork.eval, today);
		if (next !== ctx.state.readingFork.eval) {
			ctx.state.readingFork.eval = next;
		}
	}
	primeEval();

	$effect.pre(() => {
		primeEval();
	});

	let evalState = $derived(ctx.state.readingFork.eval);
	let passage = $derived(evalState.passageSlug ? findPassage(evalState.passageSlug) : undefined);
	let questions = $derived(passage?.questions ?? []);

	let qIndex = $state(0);
	let picked = $state<string | null>(null);
	let revealed = $state(false);
	let booted = $state(false);

	$effect.pre(() => {
		if (booted || !passage || evalState.completed) return;
		const open = passage.questions.findIndex((q) => evalState.results[q.id] === undefined);
		qIndex = open < 0 ? 0 : open;
		booted = true;
	});

	let current = $derived(questions[qIndex] ? findQuestion(questions[qIndex].id) : null);
	let pickedText = $derived(
		current && picked ? (current.question.options[picked] ?? '') : ''
	);
	let showEcho = $derived(
		revealed &&
			current &&
			picked &&
			picked !== current.question.answer &&
			looksLikeWordCopy(pickedText, current.passage.text)
	);

	function finish() {
		const streak = applyShowUpStreak(ctx.state.readingFork, today);
		ctx.state.readingFork.showUpStreak = streak.showUpStreak;
		ctx.state.readingFork.lastEvalDate = streak.lastEvalDate;
		ctx.state.readingFork.eval.completed = true;
		playSfx('session_complete');
	}

	function submitQuestion() {
		if (!picked || !current || !passage) return;
		const id = current.question.id;
		const ok = picked === current.question.answer;
		ctx.state.readingFork.eval.results = { ...ctx.state.readingFork.eval.results, [id]: ok };
		if (!ok) {
			ctx.state.readingFork.misses = enqueueMiss(ctx.state.readingFork.misses, id, picked);
		}
		revealed = true;
		playSfx(ok ? 'correct' : 'wrong');
	}

	function nextAfterQuestion() {
		if (qIndex >= questions.length - 1) {
			finish();
			return;
		}
		qIndex += 1;
		picked = null;
		revealed = false;
	}
</script>

<div class="eval-page stagger">
	<p class="eyebrow">One full text · all its questions</p>
	<h1>Today</h1>
	<p class="kuromi-line">
		Live paper is 22 of 36. Skip, flag, don't hunt one word. This clock is a pace cue.
	</p>

	{#if !passage}
		<p>Loading…</p>
	{:else if evalState.completed}
		<Card variant="soft-lavender">
			<h2>Finished today's text.</h2>
			<a class="btn" href={resolve('/cards')}>Debrief</a>
			<a class="btn ghost" href={resolve('/lezen')}>browse the training paper</a>
			<a class="btn ghost" href={resolve('/')}>Home</a>
		</Card>
	{:else if current}
		<div class="pace">
			<TimeBox totalSeconds={MINUTES_PER_TEXT * 60} label="~18 min pace" />
		</div>
		<Card>
			<h2>{passage.name}</h2>
			<PassageText
				text={passage.text}
				needle={revealed && picked !== current.question.answer ? evidenceOf(current.question.id) : null}
			/>
			<p class="job">Question {qIndex + 1} of {questions.length}</p>
			<p class="prompt">{current.question.question}</p>
			<div class="opts">
				{#each Object.entries(current.question.options) as [letter, text] (letter)}
					<button
						type="button"
						class="opt"
						class:picked={picked === letter}
						class:right={revealed && letter === current.question.answer}
						class:wrong={revealed && picked === letter && letter !== current.question.answer}
						onclick={() => {
							if (!revealed) picked = letter;
						}}
					>
						<span class="letter">{letter}</span>
						{text}
					</button>
				{/each}
			</div>
			{#if revealed && picked && picked !== current.question.answer}
				<p class="move">{MOVE_LINE[moveOf(current.question.id)]}</p>
				{#if showEcho}
					<p class="move">{WORD_COPY_LINE}</p>
				{/if}
			{/if}
			{#if !revealed}
				<button type="button" class="btn" disabled={!picked} onclick={submitQuestion}>Check</button>
			{:else}
				<button type="button" class="btn" onclick={nextAfterQuestion}>
					{qIndex >= questions.length - 1 ? 'Finish' : 'Next'}
				</button>
			{/if}
		</Card>
	{/if}
</div>

<style>
	.eval-page {
		padding: 0.5rem 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.eyebrow,
	.job {
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1 {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		margin: 0;
		line-height: 1.1;
	}
	h2 {
		font-family: var(--font-display);
		font-size: var(--text-title);
		margin: 0.35rem 0 0.75rem;
	}
	.kuromi-line,
	.prompt,
	.move {
		color: var(--color-ink);
		font-size: var(--text-base);
		line-height: 1.5;
	}
	.move {
		font-weight: 700;
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0.75rem 0 1rem;
	}
	.opt {
		text-align: left;
		border: 3px solid var(--color-ink);
		border-radius: 16px;
		padding: 12px 14px;
		background: #fff;
		cursor: pointer;
		font-size: var(--text-base);
		line-height: 1.4;
	}
	.opt.picked {
		background: var(--color-lilac, #ede4ff);
	}
	.opt.right {
		background: color-mix(in srgb, var(--color-teal) 35%, white);
	}
	.opt.wrong {
		background: var(--color-blush, #ffe8ef);
	}
	.letter {
		font-weight: 700;
		margin-right: 8px;
	}
	.btn {
		display: inline-flex;
		margin-top: 8px;
		margin-right: 8px;
		padding: 10px 16px;
		border-radius: 999px;
		border: 3px solid var(--color-ink);
		background: var(--color-pink, #ff9bb8);
		color: var(--color-ink);
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}
	.btn:disabled {
		opacity: 0.4;
	}
	.btn.ghost {
		background: #fff;
	}
	.pace {
		display: flex;
	}
</style>
