<script lang="ts">
	import { resolve } from '$app/paths';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import type { GlowTarget } from '$lib/home/dailyPath';

	interface Props {
		mood: string;
		line: string;
		quizDone: boolean;
		quizAnswered: number;
		readDone: boolean;
		glowTarget: GlowTarget;
		desktop: boolean;
	}

	let { mood, line, quizDone, quizAnswered, readDone, glowTarget, desktop }: Props = $props();

	const quizState = $derived(quizDone ? 'af' : quizAnswered > 0 ? `${quizAnswered}/5` : 'open');
	const readState = $derived(readDone ? 'af' : 'open');
</script>

<section class="hero r-card edge-ink offset-card" aria-label="today">
	<div class="sparkle">
		<Doodle name="spark-sparkle-26" size={32} color="var(--color-rose-deep)" tilt={-6} />
	</div>

	{#if glowTarget !== 'klaar'}
		<div
			class="glow-arrow"
			class:arrow-quiz={glowTarget === 'quiz'}
			class:arrow-tekst={glowTarget === 'tekst'}
			class:arrow-weekset={glowTarget === 'weekset'}
			class:arrow-desktop={desktop}
		>
			<Doodle
				name="arrow-down-33"
				size={26}
				color="var(--color-rose-deep)"
				tilt={glowTarget === 'quiz' ? -35 : glowTarget === 'tekst' ? 35 : desktop ? 90 : 0}
			/>
		</div>
	{/if}

	<div class="hero-row">
		<Character who="kuromi" {mood} size={88} />
		<div class="bubble-k pop-in speech">
			<p class="line">{line}</p>
		</div>
	</div>

	<div class="chips">
		<a
			class="chip chip-quiz r-chip offset-pill"
			class:glow-quiz={glowTarget === 'quiz'}
			href={resolve('/quiz')}
			aria-label="Daily Quiz{quizDone ? ', done' : ''}"
		>
			<span class="chip-icon">
				<Icon name="list-check" size={16} color="var(--color-teal-deep)" />
			</span>
			<span class="chip-copy">
				<span class="chip-label">quiz</span>
				<span class="chip-state">{quizState}</span>
			</span>
		</a>

		<div class="tekst-wrap">
			<a
				class="chip chip-tekst r-chip offset-pill"
				class:glow-tekst={glowTarget === 'tekst'}
				href={resolve('/read')}
				aria-label="Daily Text{readDone ? ', done' : ''}"
			>
				<span class="chip-copy">
					<span class="chip-label">text</span>
					<span class="chip-state">{readState}</span>
				</span>
			</a>
			<div class="coffee jit-5">
				<Character who="kuromi" mood="coffee" size={40} />
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: visible;
		background: var(--color-s1);
		padding: 16px 16px 18px;
	}

	.sparkle {
		position: absolute;
		top: -8px;
		right: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.hero-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.speech {
		flex: 1;
		min-width: 0;
		padding: 10px 12px 11px;
	}

	.line {
		margin: 0;
		font-size: var(--text-base);
		line-height: 1.45;
		color: var(--color-text);
	}

	.chips {
		display: flex;
		align-items: stretch;
		gap: 10px;
		margin-top: 16px;
	}

	.chip {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
		min-height: 52px;
		padding: 8px 12px;
		text-decoration: none;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.chip:active {
		transform: scale(var(--press-scale));
		filter: brightness(0.96);
	}

	.chip-quiz {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.chip-tekst {
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	.chip-icon {
		display: flex;
		flex-shrink: 0;
	}

	.chip-copy {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.chip-label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-base);
		letter-spacing: -0.02em;
		line-height: 1.15;
	}

	.chip-state {
		font-size: var(--text-small);
		line-height: 1.2;
		color: inherit;
	}

	.tekst-wrap {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
	}

	.tekst-wrap .chip {
		flex: 1;
	}

	.coffee {
		position: absolute;
		right: -12px;
		top: -18px;
		pointer-events: none;
		line-height: 0;
		z-index: 1;
	}

	.glow-arrow {
		position: absolute;
		pointer-events: none;
		line-height: 0;
		z-index: 2;
	}

	.glow-arrow.arrow-quiz {
		left: 14px;
		bottom: 46px;
	}

	.glow-arrow.arrow-tekst {
		right: 14px;
		bottom: 46px;
	}

	.glow-arrow.arrow-weekset {
		left: 50%;
		bottom: -20px;
		translate: -50% 0;
	}

	.glow-arrow.arrow-weekset.arrow-desktop {
		left: auto;
		right: -20px;
		bottom: 40%;
		translate: 0 0;
	}

	.chip.glow-quiz,
	.chip.glow-tekst {
		outline: 3px solid transparent;
		outline-offset: 3px;
		border-radius: inherit;
	}

	.chip.glow-quiz {
		animation: glow-pulse-teal 1.2s ease-in-out infinite;
	}

	.chip.glow-tekst {
		animation: glow-pulse-peach 1.2s ease-in-out infinite;
	}

	@keyframes glow-pulse-teal {
		0%,
		100% {
			outline-color: color-mix(in srgb, var(--color-teal-deep) 20%, transparent);
		}
		50% {
			outline-color: var(--color-teal-deep);
		}
	}

	@keyframes glow-pulse-peach {
		0%,
		100% {
			outline-color: color-mix(in srgb, var(--color-peach-deep) 20%, transparent);
		}
		50% {
			outline-color: var(--color-peach-deep);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.chip.glow-quiz {
			animation: none;
			outline-color: var(--color-teal-deep);
		}
		.chip.glow-tekst {
			animation: none;
			outline-color: var(--color-peach-deep);
		}
	}
</style>
