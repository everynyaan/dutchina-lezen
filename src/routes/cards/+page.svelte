<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { dueTrapCards, resolveTrapDrill } from '$lib/reading/eval';
	import { pickDrill, type DrillPrompt } from '$lib/reading/drills';
	import { TRAP_LABEL, TRAP_MOVE } from '$lib/reading/types';
	import { playSfx } from '$lib/sound/sfx';
	import Card from '$lib/components/ui/Card.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	let due = $derived(dueTrapCards(ctx.state.readingFork, today));
	let index = $state(0);
	let picked = $state<string | null>(null);
	let revealed = $state(false);

	let card = $derived(due[index] ?? due[0] ?? null);
	let collected = $derived(ctx.state.readingFork.trapStickers);

	let drill = $derived.by((): DrillPrompt | null => {
		if (!card) return null;
		return pickDrill({
			trap: card.trap,
			avoidIds: [card.questionId, ...(card.seenDrillIds ?? [])],
			seed: `${card.id}:${today}:${card.reps}:${(card.seenDrillIds ?? []).length}`
		});
	});

	function submit() {
		if (!picked || !drill) return;
		revealed = true;
		playSfx(picked === drill.answer ? 'correct' : 'wrong');
	}

	function mark(knew: boolean) {
		if (!card || !drill) return;
		playSfx(knew ? 'correct' : 'wrong');
		ctx.state.readingFork.trapCards = resolveTrapDrill(
			ctx.state.readingFork.trapCards,
			card.trap,
			knew,
			today,
			drill.questionId
		);
		picked = null;
		revealed = false;
		const nextDue = dueTrapCards(ctx.state.readingFork, today);
		if (nextDue.length === 0) {
			index = 0;
			return;
		}
		if (knew) {
			if (index >= nextDue.length) index = 0;
		} else {
			index = (index + 1) % nextDue.length;
		}
	}
</script>

<div class="cards-page stagger">
	<p class="eyebrow">Trap stickers · drill the move</p>
	<h1>Trap drills</h1>
	<p class="lede">
		A miss stamps a sticker. You practice that move on a <strong>new exam snippet</strong> — not
		the same sentence, not a translation.
	</p>

	<div class="sticker-row">
		{#each collected as trap (trap)}
			<Sticker variant="trap" title={TRAP_LABEL[trap]}></Sticker>
		{/each}
		{#if collected.length === 0}
			<p class="empty">No stickers yet. Miss something on the 5-minute eval and one shows up.</p>
		{/if}
	</div>

	{#if !card || !drill}
		<Card variant="soft-peach">
			<p>Nothing due. Finish today’s eval — it feeds these drills. It is not exam prep.</p>
			<a class="btn" href={resolve('/eval')}>Open eval</a>
		</Card>
	{:else}
		<Card>
			<Sticker variant="trap" title={TRAP_LABEL[card.trap]}>{TRAP_MOVE[card.trap]}</Sticker>
			<p class="meta">
				{drill.passageName} · {drill.year}
				{#if drill.fallback}
					· close cousin (thin bank on this trap)
				{:else if drill.reused}
					· seen this stem before — still the move
				{/if}
			</p>
			<p class="snippet">{drill.snippet}</p>
			<p class="q">{drill.question}</p>
			<div class="opts">
				{#each Object.entries(drill.options) as [letter, text] (letter)}
					<button
						type="button"
						class="opt"
						class:picked={picked === letter}
						class:right={revealed && letter === drill.answer}
						class:wrong={revealed && picked === letter && letter !== drill.answer}
						onclick={() => {
							if (!revealed) picked = letter;
						}}
					>
						<span class="letter">{letter}</span>
						{text}
					</button>
				{/each}
			</div>
			{#if !revealed}
				<button type="button" class="btn" disabled={!picked} onclick={submit}>Check</button>
			{:else}
				<p class="teach">
					{picked === drill.answer
						? 'That’s the move.'
						: `Trap option. Correct is ${drill.answer}.`}
					{TRAP_MOVE[card.trap]}
				</p>
				<div class="row">
					<button type="button" class="btn ghost" onclick={() => mark(false)}>Still shaky</button>
					<button type="button" class="btn" onclick={() => mark(true)}>Got the move</button>
				</div>
			{/if}
		</Card>
		<p class="tiny">{due.length} due · {ctx.state.readingFork.trapCards.length} sticker{ctx.state.readingFork.trapCards.length === 1 ? '' : 's'}</p>
	{/if}
</div>

<style>
	.cards-page {
		padding: 0.5rem 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.eyebrow {
		font-size: var(--text-micro);
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1 {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		margin: 0;
	}
	.lede,
	.snippet,
	.q,
	.empty,
	.teach {
		line-height: 1.5;
		font-size: var(--text-base);
	}
	.snippet {
		font-size: 18px;
		line-height: 1.55;
		white-space: pre-wrap;
	}
	.meta,
	.tiny {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}
	.sticker-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
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
		padding: 10px 16px;
		border-radius: 999px;
		border: 3px solid var(--color-ink);
		background: var(--color-pink, #ff9bb8);
		font-weight: 700;
		text-decoration: none;
		color: var(--color-ink);
		cursor: pointer;
		margin-top: 10px;
	}
	.btn:disabled {
		opacity: 0.4;
	}
	.btn.ghost {
		background: #fff;
	}
	.row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
</style>
