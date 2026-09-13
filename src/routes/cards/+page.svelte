<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { dueTrapCards } from '$lib/reading/eval';
	import { TRAP_LABEL } from '$lib/reading/types';
	import { playSfx } from '$lib/sound/sfx';
	import Card from '$lib/components/ui/Card.svelte';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();

	let due = $derived(dueTrapCards(ctx.state.readingFork, today));
	let index = $state(0);
	let flipped = $state(false);

	let card = $derived(due[index] ?? null);
	let collected = $derived(ctx.state.readingFork.trapStickers);

	function mark(knew: boolean) {
		if (!card) return;
		playSfx(knew ? 'correct' : 'wrong');
		const nextDue = knew
			? addDays(today, card.reps === 0 ? 1 : 3)
			: today;
		ctx.state.readingFork.trapCards = ctx.state.readingFork.trapCards.map((c) =>
			c.id === card.id
				? { ...c, reps: knew ? c.reps + 1 : c.reps, dueDate: nextDue }
				: c
		);
		flipped = false;
		if (index >= due.length - 1) index = 0;
		else index += 1;
	}

	function addDays(ymd: string, days: number): string {
		const t = Date.parse(ymd + 'T00:00:00Z') + days * 86400000;
		return new Date(t).toISOString().slice(0, 10);
	}
</script>

<div class="cards-page stagger">
	<p class="eyebrow">Trap cards · from eval misses</p>
	<h1>Pattern cards</h1>
	<p class="lede">
		Not translations. Each card is the move you missed — referent, gist, trap option.
	</p>

	<div class="sticker-row">
		{#each collected as trap (trap)}
			<Sticker variant="trap" title={TRAP_LABEL[trap]}></Sticker>
		{/each}
		{#if collected.length === 0}
			<p class="empty">No stickers yet. Miss a pulse question and one shows up.</p>
		{/if}
	</div>

	{#if !card}
		<Card variant="soft-peach">
			<p>Nothing due. Finish today’s eval to mint cards from misses.</p>
			<a class="btn" href={resolve('/eval')}>Open eval</a>
		</Card>
	{:else}
		<Card>
			<p class="meta">{card.passageName}</p>
			<p class="snippet">{card.snippet}</p>
			<p class="q">{card.question}</p>
			{#if !flipped}
				<button type="button" class="btn" onclick={() => (flipped = true)}>Show the move</button>
			{:else}
				<Sticker variant="trap" title={TRAP_LABEL[card.trap]}>
					Correct: {card.correct}. {card.correctText}
				</Sticker>
				<p class="tiny">You picked {card.picked}.</p>
				<div class="row">
					<button type="button" class="btn ghost" onclick={() => mark(false)}>Still shaky</button>
					<button type="button" class="btn" onclick={() => mark(true)}>Got the move</button>
				</div>
			{/if}
		</Card>
		<p class="tiny">{due.length} due · {ctx.state.readingFork.trapCards.length} in the deck</p>
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
	.empty {
		line-height: 1.5;
		font-size: var(--text-base);
	}
	.snippet {
		font-size: 18px;
		line-height: 1.55;
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
	.btn.ghost {
		background: #fff;
	}
	.row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
</style>
