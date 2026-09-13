<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';
	import type { HomeGateCard } from '$lib/gates/home';
	import MasteryBar from './MasteryBar.svelte';

	interface Props {
		cards: HomeGateCard[];
	}

	let { cards }: Props = $props();

	function ariaFor(card: HomeGateCard): string {
		if (!card.open) return `Gate ${card.n} ${card.title}, locked. ${card.when}`;
		if (card.progress.kind === 'done') return `Gate ${card.n} ${card.title}, done`;
		return `Gate ${card.n} ${card.title}, ${card.progress.line}`;
	}
</script>

<ol class="gates" aria-label="Gates">
	{#each cards as card (card.n)}
		<li>
			{#if card.href}
				<a
					class="card r-card offset-card edge-hair card-{card.identity}"
					class:is-current={card.current}
					href={resolve('/gate') + `?n=${card.n}`}
					aria-label={ariaFor(card)}
				>
					<span class="num">Gate {card.n}</span>
					<span class="title">{card.title}</span>
					<MasteryBar
						percent={card.progress.percent}
						label={`Gate ${card.n} progress`}
						kind={card.progress.kind}
						showPercent
					/>
					{#if card.progress.kind !== 'done'}
						<span class="when">{card.progress.line}</span>
					{/if}
				</a>
			{:else}
				<div
					class="card r-card offset-card edge-hair card-{card.identity} is-locked"
					aria-label={ariaFor(card)}
				>
					<span class="lock" aria-hidden="true">
						<Icon name="lock" size={16} color="var(--color-muted-ink)" />
					</span>
					<span class="num">Gate {card.n}</span>
					<span class="title">{card.title}</span>
					<MasteryBar
						percent={0}
						label={`Gate ${card.n} locked`}
						kind="locked"
					/>
					<span class="when">{card.when}</span>
				</div>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.gates {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.card {
		position: relative;
		overflow: visible;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		min-height: 118px;
		padding: 16px 18px 16px;
		text-decoration: none;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	a.card:active {
		transform: scale(var(--press-scale));
		filter: brightness(0.96);
	}

	.num {
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.72;
	}

	.title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-title);
		letter-spacing: -0.02em;
		line-height: 1.15;
	}

	.when {
		font-size: var(--text-small);
		line-height: 1.35;
		margin-top: 4px;
		max-width: 36rem;
		opacity: 0.92;
	}

	.lock {
		position: absolute;
		top: 14px;
		right: 14px;
		line-height: 0;
	}

	.is-locked {
		filter: saturate(0.45);
		opacity: 0.82;
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

	.card-teal {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}
</style>
