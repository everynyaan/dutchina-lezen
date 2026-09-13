<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getRank } from '$lib/data/ranks';
	import { Wrench, Shield, Award, Trophy, Crown, Gem, Diamond, Sparkles } from 'lucide-svelte';

	const iconMap: Record<string, typeof Wrench> = {
		Wrench,
		Shield,
		Award,
		Trophy,
		Crown,
		Gem,
		Diamond,
		Sparkles
	};

	const ctx = getGameContext();

	let floaterDelta = $state(0);
	let showFloater = $state(false);
	let floaterKey = $state(0);

	// React to LP events via the context counter
	let lastSeenCounter = -1;
	$effect(() => {
		const counter = ctx.lpEventCounter;
		if (lastSeenCounter === -1) {
			// First run (component init). Record current counter, don't animate.
			lastSeenCounter = counter;
			return;
		}
		if (counter > lastSeenCounter) {
			const delta = ctx.lastLpDelta;
			if (delta > 0) {
				floaterDelta = delta;
				floaterKey++;
				showFloater = true;
				setTimeout(() => {
					showFloater = false;
				}, 800);
			}
		}
		lastSeenCounter = counter;
	});

	let rankDef = $derived(getRank(ctx.state.rank));
	let IconComponent = $derived(iconMap[rankDef.icon] || Wrench);
	let barWidth = $derived(Math.min(ctx.state.lp, 99));
</script>

<div class="rank-strip">
	<div
		class="strip-icon-box"
		style="border-color: var(--rank-strip-accent, var({rankDef.colorVar}))"
	>
		<IconComponent
			size={18}
			color="var(--rank-strip-accent, var({rankDef.colorVar}))"
			strokeWidth={2}
		/>
	</div>

	<div class="strip-label">
		{rankDef.name}
		<span class="strip-tier">· Tier {ctx.state.tier}</span>
	</div>

	<div class="strip-lp-section">
		<div class="strip-lp-label">{ctx.state.lp} / 100</div>
		<div class="strip-lp-track">
			<div
				class="strip-lp-fill"
				style="width: {barWidth}%; background: var(--rank-strip-accent, var({rankDef.colorVar}))"
			></div>
		</div>
		{#if showFloater}
			{#key floaterKey}
				<div class="strip-floater">
					+{floaterDelta} LP
				</div>
			{/key}
		{/if}
	</div>
</div>

<style>
	.rank-strip {
		display: flex;
		align-items: center;
		gap: 10px;
		background: #ffffff;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		box-shadow: var(--sticker-shadow);
		padding: 8px 16px;
		margin-bottom: 16px;
	}

	.strip-icon-box {
		width: 36px;
		height: 36px;
		border: 1.5px solid;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--color-rose) 30%, white);
	}

	.strip-label {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.04em;
		white-space: nowrap;
		color: var(--color-ink);
	}

	.strip-tier {
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-muted-ink);
	}

	.strip-lp-section {
		position: relative;
		width: 120px;
		flex-shrink: 0;
		margin-left: auto;
	}

	.strip-lp-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-muted-ink);
		letter-spacing: 0.06em;
		text-align: right;
		margin-bottom: 3px;
	}

	.strip-lp-track {
		width: 100%;
		height: 3px;
		background: color-mix(in srgb, var(--color-lavender) 24%, white);
		border-radius: 2px;
		overflow: hidden;
	}

	.strip-lp-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.strip-floater {
		position: absolute;
		top: -16px;
		right: 0;
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.04em;
		animation: strip-float-up 0.8s ease forwards;
		pointer-events: none;
		color: var(--color-ink);
	}

	@keyframes strip-float-up {
		0% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-14px);
		}
	}

	/* ---- Boss realm override (V3_DESIGN two-family rule: neutrals + orchid only) ----
	   RankStrip has no realm prop; it self-detects by ancestor, matching whichever
	   route wraps it in .boss-page. Daylight rendering on the other 7 consumers is
	   untouched -- these rules only ever match inside the Boss realm. */
	:global(.boss-page) .rank-strip {
		--rank-strip-accent: var(--color-orchid);
		background: color-mix(in srgb, var(--color-realm-panel) 78%, transparent);
		border-color: var(--color-realm-line);
	}

	:global(.boss-page) .strip-icon-box {
		background: var(--color-realm-bg);
		border-color: var(--color-orchid);
	}

	:global(.boss-page) .strip-label {
		color: #ffffff;
	}

	:global(.boss-page) .strip-tier {
		color: var(--color-orchid-soft);
	}

	:global(.boss-page) .strip-lp-label {
		color: var(--color-orchid-soft);
	}

	:global(.boss-page) .strip-lp-track {
		background: var(--color-realm-line);
	}

	:global(.boss-page) .strip-floater {
		color: var(--color-orchid);
	}
</style>
