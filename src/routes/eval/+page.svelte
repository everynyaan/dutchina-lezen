<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import {
		applyShowUpStreak,
		cardFromGistMiss,
		cardFromMiss,
		ensureTodayEval,
		stampStickers,
		upsertCard
	} from '$lib/reading/eval';
	import { findPassage, findQuestion } from '$lib/reading/bank';
	import { TRAP_LABEL } from '$lib/reading/types';
	import type { TrapType } from '$lib/reading/types';
	import { playSfx } from '$lib/sound/sfx';
	import Card from '$lib/components/ui/Card.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import Character from '$lib/components/art/Character.svelte';
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

	type Step = 'gist' | 'q0' | 'q1' | 'done';
	let step = $state<Step>('gist');

	$effect(() => {
		if (evalState.completed) step = 'done';
	});

	let gistPicked = $state<string | null>(null);
	let gistRevealed = $state(false);
	let qIndex = $state(0);
	let picked = $state<string | null>(null);
	let revealed = $state(false);

	let currentQ = $derived(
		evalState.questionIds[qIndex] ? findQuestion(evalState.questionIds[qIndex]) : null
	);

	let previewText = $derived.by(() => {
		if (!passage) return '';
		const parts = passage.text.split(/\n\n+/).slice(0, 2);
		return parts.join('\n\n');
	});

	function finishShowUp() {
		const streak = applyShowUpStreak(ctx.state.readingFork, today);
		ctx.state.readingFork.showUpStreak = streak.showUpStreak;
		ctx.state.readingFork.lastEvalDate = streak.lastEvalDate;
		ctx.state.readingFork.eval.completed = true;
		playSfx('session_complete');
		step = 'done';
	}

	function mintTrap(card: ReturnType<typeof cardFromMiss>) {
		if (!card) return;
		ctx.state.readingFork.trapCards = upsertCard(ctx.state.readingFork.trapCards, card);
		ctx.state.readingFork.trapStickers = stampStickers(
			ctx.state.readingFork.trapStickers,
			card.trap
		);
	}

	function submitGist() {
		if (!gistPicked || !evalState.passageSlug) return;
		const ok = gistPicked === evalState.gistAnswer;
		ctx.state.readingFork.eval.gistPicked = gistPicked;
		gistRevealed = true;
		playSfx(ok ? 'correct' : 'wrong');
		if (!ok) {
			mintTrap(
				cardFromGistMiss({ passageSlug: evalState.passageSlug, picked: gistPicked, today })
			);
		}
	}

	function afterGist() {
		qIndex = 0;
		picked = null;
		revealed = false;
		step = 'q0';
	}

	function submitQuestion() {
		if (!picked || !currentQ) return;
		const id = currentQ.question.id;
		const ok = picked === currentQ.question.answer;
		ctx.state.readingFork.eval.results = { ...ctx.state.readingFork.eval.results, [id]: ok };
		revealed = true;
		playSfx(ok ? 'correct' : 'wrong');
		if (!ok) {
			mintTrap(cardFromMiss({ questionId: id, picked, today }));
		}
	}

	function nextAfterQuestion() {
		const last = qIndex >= evalState.questionIds.length - 1;
		if (last) {
			finishShowUp();
			return;
		}
		qIndex += 1;
		picked = null;
		revealed = false;
		step = 'q1';
	}

	let gistMissed = $derived(
		evalState.gistPicked !== null && evalState.gistPicked !== evalState.gistAnswer
	);
	let earnedToday = $derived(
		Object.entries(evalState.results)
			.filter(([, v]) => v === false)
			.map(([id]) => cardFromMiss({ questionId: id, picked: '?', today })?.trap)
			.filter((t): t is TrapType => Boolean(t))
	);
	let mintedThisPulse = $derived(earnedToday.length > 0 || gistMissed);
</script>

<div class="eval-page stagger">
	<p class="eyebrow">5 minutes · feeds trap cards · not exam prep</p>
	<h1>Today’s eval</h1>
	<p class="kuromi-line">
		Show up. One passage, then we stop. You need 22 on the real paper — skip, flag, don’t hunt one
		word.
	</p>

	{#if !passage}
		<p>Loading…</p>
	{:else if step === 'done'}
		<Card variant="soft-lavender">
			<Character who="kuromi" mood="wink" size={88} />
			<h2>You showed up. That’s the streak.</h2>
			<p class="body">
				Show-up streak: <strong>{ctx.state.readingFork.showUpStreak}</strong> — finishing this
				pulse counts. Not a 5/5.
			</p>
			{#if mintedThisPulse}
				<p class="body">Misses became trap drills. The eval’s job is to feed those cards.</p>
			{:else}
				<p class="body">No new stickers. You still showed up — that’s what this timer is for.</p>
			{/if}
			<a class="btn" href={resolve('/cards')}>Drill trap stickers</a>
			<a class="btn ghost" href={resolve('/')}>Home</a>
		</Card>
	{:else if step === 'gist'}
		<Card>
			<p class="job">Job 1 · gist · then we stop after 1–2 questions</p>
			<h2>{passage.name}</h2>
			<p class="passage">{previewText}</p>
			<p class="prompt">Which intro matches this text?</p>
			<div class="opts">
				{#each evalState.gistOptions as opt (opt)}
					<button
						type="button"
						class="opt"
						class:picked={gistPicked === opt}
						class:right={gistRevealed && opt === evalState.gistAnswer}
						class:wrong={gistRevealed && gistPicked === opt && opt !== evalState.gistAnswer}
						onclick={() => {
							if (!gistRevealed) gistPicked = opt;
						}}
					>
						{opt}
					</button>
				{/each}
			</div>
			{#if !gistRevealed}
				<button type="button" class="btn" disabled={!gistPicked} onclick={submitGist}>Check</button>
			{:else}
				<p class="body">
					{gistPicked === evalState.gistAnswer ? 'That’s the gist.' : 'Same text, new job next.'}
					Then {evalState.questionIds.length === 1 ? 'one real question' : 'two real questions'}
					on this passage. Then we stop — this pulse feeds cards, it is not exam prep.
				</p>
				<button type="button" class="btn" onclick={afterGist}>Job 2</button>
			{/if}
		</Card>
	{:else if currentQ}
		<Card>
			<p class="job">Job {qIndex + 2} · same text · last jobs, then stop</p>
			<p class="passage slim">{previewText}</p>
			<p class="prompt">{currentQ.question.question}</p>
			<div class="opts">
				{#each Object.entries(currentQ.question.options) as [letter, text] (letter)}
					<button
						type="button"
						class="opt"
						class:picked={picked === letter}
						class:right={revealed && letter === currentQ.question.answer}
						class:wrong={revealed && picked === letter && letter !== currentQ.question.answer}
						onclick={() => {
							if (!revealed) picked = letter;
						}}
					>
						<span class="letter">{letter}</span>
						{text}
					</button>
				{/each}
			</div>
			{#if revealed && picked && picked !== currentQ.question.answer}
				{@const trap = cardFromMiss({ questionId: currentQ.question.id, picked, today })?.trap}
				<p class="trap">
					Trap: {trap ? TRAP_LABEL[trap] : 'almost-right'}
				</p>
				<Sticker rotate={-2}>{trap ? TRAP_LABEL[trap] : 'trap'}</Sticker>
			{/if}
			{#if !revealed}
				<button type="button" class="btn" disabled={!picked} onclick={submitQuestion}>Check</button>
			{:else}
				<button type="button" class="btn" onclick={nextAfterQuestion}>
					{qIndex >= evalState.questionIds.length - 1 ? 'That’s the stop' : 'Next'}
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
	.body,
	.prompt {
		color: var(--color-ink);
		font-size: var(--text-base);
		line-height: 1.5;
	}
	.passage {
		white-space: pre-wrap;
		font-size: 18px;
		line-height: 1.6;
		margin: 0.5rem 0 1rem;
	}
	.passage.slim {
		max-height: 9rem;
		overflow: auto;
		font-size: var(--text-small);
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
	.trap {
		font-weight: 700;
		margin: 0.5rem 0;
	}
</style>
