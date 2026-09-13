<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import Character from '$lib/components/art/Character.svelte';
	import { getGameContext } from '$lib/state/context';
	import { currentGateFromState, getWordsUpToGate } from '$lib/gates/gates';
	import { schrijvenTasksForBrowse } from '$lib/gates/browse';
	import { woordparenLabel, kaartenLabel, takenOpenLabel } from './pluralize';

	const ctx = getGameContext();

	let matchPairs = $derived(getWordsUpToGate(currentGateFromState(ctx.state)).length);
	let cardsDue = $derived(ctx.cardsDue);
	let takenOpen = $derived.by(() => {
		const submittedTaskIds = new Set(
			Object.values(ctx.state.reviews.submissions).map((s) => s.taskId)
		);
		const room = schrijvenTasksForBrowse(currentGateFromState(ctx.state));
		return Math.max(0, room.filter((t) => !submittedTaskIds.has(t.id)).length);
	});

	interface PracticeCard {
		href: Pathname;
		label: string;
		subline: string;
		mood: string;
		identity: 'rose' | 'lavender' | 'peach' | 'boss';
		jit: 'jit-2' | 'jit-6' | 'jit-3' | 'jit-7';
		aria: string;
	}

	let cards = $derived<PracticeCard[]>([
		{
			href: '/match',
			label: 'match',
			subline: woordparenLabel(matchPairs),
			mood: 'mischief',
			identity: 'rose',
			jit: 'jit-2',
			aria: `match, ${woordparenLabel(matchPairs)}`
		},
		{
			href: '/cards',
			label: 'cards',
			subline: kaartenLabel(cardsDue),
			mood: 'question',
			identity: 'lavender',
			jit: 'jit-6',
			aria: `cards, ${kaartenLabel(cardsDue)}`
		},
		{
			href: '/reviews',
			label: 'writing',
			subline: takenOpenLabel(takenOpen),
			mood: 'sit',
			identity: 'peach',
			jit: 'jit-3',
			aria: `writing, ${takenOpenLabel(takenOpen)}`
		},
		{
			href: '/boss',
			label: 'boss',
			subline: 'optional — fun, not a key',
			mood: 'pixel',
			identity: 'boss',
			jit: 'jit-7',
			aria: 'boss, optional — fun, not a key'
		}
	]);
</script>

<div class="grid">
	{#each cards as card (card.href)}
		<a
			class="card r-card offset-card edge-hair card-{card.identity}"
			href={resolve(card.href)}
			aria-label={card.aria}
		>
			<span class="label">{card.label}</span>
			<span class="subline">{card.subline}</span>
			<div class="sticker wobble {card.jit}">
				<Character who="kuromi" mood={card.mood} size={36} animated={false} />
			</div>
		</a>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.card {
		position: relative;
		overflow: visible;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		min-height: 118px;
		padding: 14px 12px 12px;
		text-decoration: none;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.card:active {
		transform: scale(var(--press-scale));
		filter: brightness(0.96);
	}

	.label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-base);
		letter-spacing: -0.02em;
		line-height: 1.25;
		max-width: 70%;
	}

	.subline {
		font-size: var(--text-small);
		line-height: 1.3;
		margin-top: 2px;
		max-width: 70%;
		opacity: 0.92;
	}

	.card-boss .subline {
		color: var(--color-orchid-soft);
		opacity: 1;
	}

	.sticker {
		position: absolute;
		right: 6px;
		bottom: 6px;
		line-height: 0;
	}

	.card-rose {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
	}

	.card-lavender {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.card-peach {
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	.card-boss {
		background: var(--color-realm-bg);
		color: var(--color-orchid);
		box-shadow:
			var(--shadow-offset-card),
			inset 0 0 22px color-mix(in srgb, var(--color-orchid) 34%, transparent);
	}
</style>
