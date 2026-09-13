<script lang="ts">
	import { resolve } from '$app/paths';
	import { Swords, X } from 'lucide-svelte';
	import { getRank } from '$lib/data/ranks';
	import { BOSS_NAMES } from '$lib/boss/constants';

	interface Props {
		rank: number;
		onclose: () => void;
	}
	let { rank, onclose }: Props = $props();

	const currentRankDef = getRank(rank);
	const nextRankDef = getRank(rank + 1);
	const bossName = BOSS_NAMES[rank] ?? 'The Boss';
</script>

<div class="gate-backdrop" role="dialog" aria-label="Boss available">
	<div class="gate-card" style="--gate-color: var({currentRankDef.colorVar})">
		<button class="gate-close" onclick={onclose} aria-label="Dismiss">
			<X size={18} />
		</button>

		<div class="gate-icon">
			<Swords size={36} color="var({currentRankDef.colorVar})" />
		</div>

		<h2 class="gate-title">Boss Available</h2>

		<p class="gate-text">
			You've maxed out your LP at {currentRankDef.name} rank. Defeat <strong>{bossName}</strong> to
			advance to
			<span class="next-rank">{nextRankDef.name}</span>.
		</p>

		<a href={resolve('/boss')} class="gate-btn" onclick={onclose}>
			<Swords size={18} />
			Fight Boss
		</a>

		<button class="gate-later" onclick={onclose}> Later </button>
	</div>
</div>

<style>
	.gate-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-ink) 80%, transparent);
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.gate-card {
		background: var(--color-s1);
		border: 3px solid var(--gate-color);
		border-radius: 22px;
		padding: 32px 24px 24px;
		width: 100%;
		max-width: 340px;
		text-align: center;
		position: relative;
		box-shadow:
			0 0 40px color-mix(in srgb, var(--color-kuromi) 50%, transparent),
			0 0 15px color-mix(in srgb, var(--gate-color) 20%, transparent);
		animation: scaleIn 0.25s ease;
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.gate-close {
		position: absolute;
		top: 12px;
		right: 12px;
		background: none;
		border: none;
		color: var(--color-muted-ink);
		cursor: pointer;
		padding: 4px;
		display: flex;
		-webkit-tap-highlight-color: transparent;
	}

	.gate-icon {
		margin-bottom: 16px;
	}

	.gate-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--gate-color);
		margin-bottom: 12px;
	}

	.gate-text {
		font-size: var(--text-base);
		line-height: 1.6;
		color: var(--color-muted-ink);
		margin-bottom: 24px;
	}

	.gate-text strong {
		color: var(--gate-color);
		font-weight: 700;
	}

	.next-rank {
		font-weight: 700;
		color: var(--color-kuromi);
	}

	.gate-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 14px;
		background: var(--gate-color);
		border: none;
		border-radius: 999px;
		color: var(--color-bg);
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		transition: opacity 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.gate-btn:hover {
		opacity: 0.9;
	}

	.gate-btn:active {
		transform: scale(0.97);
	}

	.gate-later {
		background: none;
		border: none;
		color: var(--color-muted-ink);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		margin-top: 14px;
		padding: 6px 12px;
		-webkit-tap-highlight-color: transparent;
	}

	.gate-later:hover {
		color: var(--color-text);
	}
</style>
