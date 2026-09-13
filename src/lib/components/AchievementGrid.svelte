<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { getGameContext } from '$lib/state/context';
	import { ACHIEVEMENTS } from '$lib/achievements/ACHIEVEMENTS';
	import Icon from '$lib/icons/Icon.svelte';
	import {
		Swords,
		Wrench,
		Shield,
		Award,
		Trophy,
		Crown,
		Gem,
		Diamond,
		Sparkles,
		Target,
		Flame,
		CreditCard,
		Library,
		CalendarDays,
		CalendarCheck,
		CalendarHeart,
		Milestone,
		GraduationCap,
		TrendingUp,
		Zap,
		Repeat,
		BookOpen,
		BookMarked,
		BookOpenCheck,
		BookHeart,
		PenLine,
		PenTool,
		BadgeCheck
	} from 'lucide-svelte';

	const ctx = getGameContext();

	// Map icon name strings to lucide components
	const ICON_MAP = {
		Swords,
		Wrench,
		Shield,
		Award,
		Trophy,
		Crown,
		Gem,
		Diamond,
		Sparkles,
		Target,
		Flame,
		CreditCard,
		Library,
		CalendarDays,
		CalendarCheck,
		CalendarHeart,
		Milestone,
		GraduationCap,
		TrendingUp,
		Zap,
		Repeat,
		BookOpen,
		BookMarked,
		BookOpenCheck,
		BookHeart,
		PenLine,
		PenTool,
		BadgeCheck
	} as Record<string, typeof Swords>;

	let visibleAchievements = $derived(ACHIEVEMENTS.filter((a) => !a.learnerHidden));
	let unlockedCount = $derived(
		visibleAchievements.filter((a) => ctx.state.achievements[a.id]?.unlockedAt).length
	);

	let progressionDisplay = $derived(ctx.state.appConfig.progression.display);

	let { expanded = false }: { expanded?: boolean } = $props();
	let showAll = $state(expanded);

	// V3_DESIGN presentation tokens (§2.1 tinted-gradient family, §6.2 jitter).
	// Data access and expand behaviour above are unchanged from the prior version.
	const TINT_KEYS = ['rose', 'lavender', 'teal', 'peach'] as const;
	const TINT_TEXT: Record<(typeof TINT_KEYS)[number], string> = {
		rose: 'var(--color-rose-ink)',
		lavender: 'var(--color-lavender-deep)',
		teal: 'var(--color-teal-deep)',
		peach: 'var(--color-peach-deep)'
	};
	const JIT_CLASSES = ['jit-1', 'jit-b', 'jit-5', 'jit-c'] as const;

	function tintGradient(key: (typeof TINT_KEYS)[number]): string {
		return `linear-gradient(160deg, color-mix(in srgb, var(--color-${key}) 55%, white), color-mix(in srgb, var(--color-${key}) 26%, white))`;
	}
</script>

<div class="achievements-section">
	<button class="section-header" aria-expanded={showAll} onclick={() => (showAll = !showAll)}>
		<div class="header-left">
			<Trophy size={16} color="var(--color-rose-deep)" />
			<h2 class="section-title jit-3">achievements</h2>
		</div>
		<div class="header-right">
			{#if progressionDisplay !== 'hidden'}
				<span class="achievement-counter">{unlockedCount}/{visibleAchievements.length}</span>
			{/if}
			<span class="chevron" class:open={showAll}>
				<Icon name="chevron-down" size={16} color="var(--color-muted-ink)" />
			</span>
		</div>
	</button>

	{#if showAll}
		<div class="achievement-grid" transition:slide={{ duration: 250 }}>
			{#each visibleAchievements as achievement, i (achievement.id)}
				{@const unlockData = ctx.state.achievements[achievement.id]}
				{@const isUnlocked = !!unlockData?.unlockedAt}
				{@const IconComponent = ICON_MAP[achievement.icon]}
				{@const tintKey = TINT_KEYS[i % TINT_KEYS.length]}
				{@const jitClass = JIT_CLASSES[i % JIT_CLASSES.length]}
				<div
					class="achievement-card {isUnlocked ? jitClass : ''}"
					class:unlocked={isUnlocked}
					style={isUnlocked ? `background: ${tintGradient(tintKey)}` : ''}
					in:fade={{ delay: i * 25, duration: 200 }}
				>
					<div class="achievement-icon">
						{#if isUnlocked && IconComponent}
							<IconComponent size={22} color={TINT_TEXT[tintKey]} />
						{:else}
							<Icon name="lock" size={18} color="var(--color-muted-line)" />
						{/if}
					</div>
					<div class="achievement-info">
						<div class="achievement-title">{achievement.title}</div>
						<div class="achievement-desc">{achievement.description}</div>
						{#if isUnlocked && unlockData?.unlockedAt}
							<div class="achievement-date" style={`color: ${TINT_TEXT[tintKey]}`}>
								{new Date(unlockData.unlockedAt).toLocaleDateString()}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="achievement-preview" transition:fade={{ duration: 150 }}>
			{#each ACHIEVEMENTS.filter((a) => ctx.state.achievements[a.id]?.unlockedAt).slice(-5) as achievement (achievement.id)}
				{@const IconComponent = ICON_MAP[achievement.icon]}
				{#if IconComponent}
					<div class="preview-icon" title={achievement.title}>
						<IconComponent size={16} color="var(--color-rose-deep)" />
					</div>
				{/if}
			{/each}
			{#if unlockedCount === 0}
				<span class="preview-empty">no achievements yet. keep playing!</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.achievements-section {
		/* spacing handled by parent flex gap */
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		margin-bottom: 12px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.section-header:active {
		transform: scale(0.98);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.chevron {
		display: flex;
		transition: transform 0.25s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-ink);
		margin: 0;
	}

	.achievement-counter {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-muted-ink);
		letter-spacing: 0.06em;
	}

	/* GRID VIEW */
	.achievement-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.achievement-card {
		background: #ffffff;
		border: 1px solid var(--color-line);
		border-radius: 16px;
		padding: 12px;
		display: flex;
		gap: 10px;
		align-items: flex-start;
		opacity: 0.6;
		transition:
			opacity 0.2s,
			transform 0.15s,
			box-shadow 0.2s;
	}

	.achievement-card.unlocked {
		opacity: 1;
		border-color: transparent;
		box-shadow: var(--shadow-offset-pill);
	}

	.achievement-icon {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-cream) 70%, white);
		border-radius: 10px;
	}

	.achievement-info {
		min-width: 0;
	}

	.achievement-title {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-text);
		text-transform: uppercase;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.achievement-card:not(.unlocked) .achievement-title {
		color: var(--color-muted-ink);
	}

	.achievement-desc {
		font-size: var(--text-micro);
		color: var(--color-muted-ink);
		line-height: 1.3;
	}

	.achievement-date {
		font-size: var(--text-micro);
		margin-top: 4px;
		font-family: var(--font-display);
		letter-spacing: 0.04em;
	}

	/* PREVIEW ROW (collapsed) */
	.achievement-preview {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 28px;
	}

	.preview-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-rose) 30%, white);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
	}

	.preview-empty {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}
</style>
