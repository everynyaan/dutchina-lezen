<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getRank } from '$lib/data/ranks';
	import { Wrench, Shield, Award, Trophy, Crown, Gem, Diamond, Sparkles } from 'lucide-svelte';
	import Card from '$lib/components/ui/Card.svelte';

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

	// Floater animation state
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

	// B1 progress: totalLp out of 3200
	const B1_TOTAL_LP = 3200;
	let b1Progress = $derived(Math.min((ctx.state.totalLp / B1_TOTAL_LP) * 100, 100));
	let b1Percent = $derived(Math.round(b1Progress));
</script>

<Card variant="soft-rose">
	<div class="rank-card">
		<div class="rank-icon-box" style="border-color: var({rankDef.colorVar})">
			<IconComponent size={28} color="var({rankDef.colorVar})" strokeWidth={2} />
		</div>

		<div class="rank-info">
			<div class="rank-name">
				{rankDef.name}
			</div>
			<div class="rank-tier">Tier {ctx.state.tier}</div>
		</div>

		<div class="lp-section">
			<div class="lp-label">{ctx.state.lp} / 100</div>
			<div class="lp-bar-track">
				<div
					class="lp-bar-fill shimmer"
					style="width: {barWidth}%; background: var({rankDef.colorVar})"
				></div>
			</div>
			{#if showFloater}
				{#key floaterKey}
					<div class="lp-floater">
						+{floaterDelta} LP
					</div>
				{/key}
			{/if}
		</div>
	</div>

	<div class="b1-progress">
		<div class="b1-header">
			<span class="b1-label">B1 Progress</span>
			<span class="b1-percent">{b1Percent}%</span>
		</div>
		<div class="b1-bar-track">
			<div class="b1-bar-fill shimmer" style="width: {b1Progress}%"></div>
		</div>
	</div>
</Card>

<style>
	.rank-card {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.rank-icon-box {
		width: 48px;
		height: 48px;
		border: 2px solid;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: var(--color-s2);
	}

	.rank-info {
		flex: 1;
		min-width: 0;
	}

	.rank-name {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		letter-spacing: 0.06em;
		line-height: 1.1;
		color: var(--color-kuromi);
	}

	.rank-tier {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-top: 2px;
	}

	.lp-section {
		position: relative;
		width: 120px;
		flex-shrink: 0;
	}

	.lp-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-muted-ink);
		letter-spacing: 0.06em;
		text-align: right;
		margin-bottom: 4px;
	}

	.lp-bar-track {
		width: 100%;
		height: 14px;
		background: var(--color-s3);
		border: 2px solid var(--color-kuromi);
		border-radius: 999px;
		overflow: hidden;
	}

	.lp-bar-fill {
		height: 100%;
		border-radius: 5px;
		/* Slight overshoot easing gives the bar a "spring" feel when LP lands. */
		transition: width 0.6s cubic-bezier(0.34, 1.4, 0.64, 1);
	}

	.lp-floater {
		position: absolute;
		top: -18px;
		right: 0;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		animation: float-up 0.8s ease forwards;
		pointer-events: none;
		color: var(--color-kuromi);
	}

	@keyframes float-up {
		0% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-16px);
		}
	}

	/* B1 Overall Progress */
	.b1-progress {
		margin-top: 10px;
	}

	.b1-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.b1-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-kuromi-mid);
	}

	.b1-percent {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		color: var(--color-muted-ink);
		letter-spacing: 0.04em;
	}

	.b1-bar-track {
		width: 100%;
		height: 12px;
		background: var(--color-s3);
		border: 2px solid var(--color-kuromi);
		border-radius: 999px;
		overflow: hidden;
	}

	.b1-bar-fill {
		height: 100%;
		border-radius: 4px;
		background: linear-gradient(90deg, var(--color-lavender-deep), var(--color-teal-deep));
		transition: width 0.8s cubic-bezier(0.34, 1.4, 0.64, 1);
	}
</style>
