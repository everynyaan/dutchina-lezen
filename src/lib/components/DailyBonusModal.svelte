<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';

	interface Props {
		practiceDays: number;
		onclaim: () => void;
	}
	let { practiceDays, onclaim }: Props = $props();

	let claimed = $state(false);

	function handleClaim() {
		claimed = true;
		onclaim();
		setTimeout(() => {}, 600);
	}

	function getGreeting(weeks: number): string {
		if (weeks <= 1) return 'Welcome!';
		if (weeks <= 2) return 'Good to see you!';
		if (weeks <= 4) return 'Keep it up!';
		if (weeks <= 8) return 'On a roll!';
		if (weeks <= 16) return 'Unstoppable!';
		return 'Legend!';
	}
</script>

<div class="bonus-backdrop" role="dialog" aria-modal="true" aria-label="Weekly bonus">
	<div class="bonus-card" class:claimed>
		<div class="bonus-icon">
			<Character who="kuromi" mood="excited" size={28} animated alt="" />
		</div>

		<h2 class="bonus-greeting">{getGreeting(practiceDays)}</h2>

		<div class="streak-pill">
			<Icon name="fire" size={18} color="var(--color-rose-deep)" />
			<span class="streak-number">{practiceDays}</span>
			<span class="streak-label">{practiceDays === 1 ? 'week' : 'weeks'} in a row</span>
		</div>

		{#if !claimed}
			<button type="button" class="claim-btn" onclick={handleClaim}>
				<Icon name="bolt" size={18} color="#ffffff" />
				Claim your week
			</button>
		{:else}
			<div class="claimed-msg">You're in</div>
		{/if}
	</div>
</div>

<style>
	.bonus-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-ink) 55%, transparent);
		z-index: 260;
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

	.bonus-card {
		position: relative;
		width: 100%;
		max-width: 320px;
		padding: 32px 24px 24px;
		text-align: center;
		border: 2px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--shadow-offset-card);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
		transform: rotate(1.5deg);
		animation: scaleIn 0.25s ease;
	}

	.bonus-card.claimed {
		animation: pulseOut 0.5s ease forwards;
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.9) rotate(1.5deg);
			opacity: 0;
		}
		to {
			transform: scale(1) rotate(1.5deg);
			opacity: 1;
		}
	}

	@keyframes pulseOut {
		0% {
			transform: scale(1) rotate(1.5deg);
			opacity: 1;
		}
		30% {
			transform: scale(1.05) rotate(1.5deg);
		}
		100% {
			transform: scale(0.95) rotate(1.5deg);
			opacity: 0;
		}
	}

	.bonus-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
	}

	.bonus-greeting {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-peach-deep);
		margin: 0 0 16px;
	}

	.streak-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		margin-bottom: 24px;
		background: #ffffff;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
	}

	.streak-number {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-rose-deep);
		line-height: 1;
	}

	.streak-label {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-peach-deep);
		letter-spacing: 0.02em;
	}

	.claim-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 14px;
		background: var(--color-rose-deep);
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		color: #ffffff;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: 0.02em;
		cursor: pointer;
		box-shadow: var(--shadow-offset-pill);
		transition: opacity 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.claim-btn:hover {
		opacity: 0.9;
	}

	.claim-btn:active {
		transform: scale(var(--press-scale));
	}

	.claimed-msg {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--color-teal-deep);
		animation: lpPop 0.4s ease;
	}

	@keyframes lpPop {
		0% {
			transform: scale(0.5);
			opacity: 0;
		}
		60% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bonus-backdrop {
			animation: none;
		}
		.bonus-card {
			animation: none;
			transform: rotate(1.5deg);
		}
		.bonus-card.claimed {
			animation: none;
		}
		.claim-btn:active {
			transform: none;
		}
		.claimed-msg {
			animation: none;
		}
	}
</style>
