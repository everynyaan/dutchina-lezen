<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getGameContext } from '$lib/state/context';
	import { ACHIEVEMENTS } from '$lib/achievements/ACHIEVEMENTS';
	import { currentGateFromState } from '$lib/gates/gates';
	import { GATE_STICKERS, gateStickerEarned } from '$lib/gates/home';
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
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

	let currentGate = $derived(currentGateFromState(ctx.state));
	let masteredGates = $derived(ctx.state.gates.mastered);
	let visibleAchievements = $derived(ACHIEVEMENTS.filter((a) => !a.learnerHidden));
	let unlockedAchievements = $derived(
		visibleAchievements.filter((a) => ctx.state.achievements[a.id]?.unlockedAt)
	);

	const TINT_KEYS = ['rose', 'lavender', 'teal', 'peach'] as const;
	const TINT_TEXT: Record<(typeof TINT_KEYS)[number], string> = {
		rose: 'var(--color-rose-ink)',
		lavender: 'var(--color-lavender-deep)',
		teal: 'var(--color-teal-deep)',
		peach: 'var(--color-peach-deep)'
	};
	const PILL_VARIANTS = ['rose', 'lavender', 'teal', 'peach'] as const;
	const JIT_CLASSES = [
		'jit-1',
		'jit-b',
		'jit-5',
		'jit-c',
		'jit-a',
		'jit-2',
		'jit-6',
		'jit-3',
		'jit-7'
	] as const;

	function tintGradient(key: (typeof TINT_KEYS)[number]): string {
		return `linear-gradient(160deg, color-mix(in srgb, var(--color-${key}) 55%, white), color-mix(in srgb, var(--color-${key}) 26%, white))`;
	}

	let { expanded = false }: { expanded?: boolean } = $props();
	let showAll = $state(untrack(() => expanded));

	$effect(() => {
		if (expanded) showAll = true;
	});

	let previewItems = $derived.by(() => {
		const gates = GATE_STICKERS.filter((g) =>
			gateStickerEarned(g.n, currentGate, masteredGates)
		).map((g) => ({
			key: `gate-${g.n}`,
			icon: g.icon,
			title: g.title
		}));
		const achs = unlockedAchievements.map((a) => ({
			key: `ach-${a.id}`,
			icon: a.icon,
			title: a.title
		}));
		return [...gates, ...achs].slice(-6);
	});
</script>

<div class="collection-section">
	<button class="section-header" aria-expanded={showAll} onclick={() => (showAll = !showAll)}>
		<div class="header-left">
			<Character who="kuromi" mood="hearteyes" size={32} alt="" />
			<h2 class="section-title jit-3">collection</h2>
		</div>
		<span class="chevron" class:open={showAll} aria-hidden="true">
			<Icon name="chevron-down" size={16} color="var(--color-muted-ink)" />
		</span>
	</button>

	{#if showAll}
		<div class="shelves" transition:fade={{ duration: 180 }}>
			<section class="shelf" aria-labelledby="shelf-gates">
				<h3 id="shelf-gates" class="shelf-title jit-1">gates</h3>
				<div class="sticker-grid">
					{#each GATE_STICKERS as gateDef, i (gateDef.n)}
						{@const earned = gateStickerEarned(gateDef.n, currentGate, masteredGates)}
						{@const IconComponent = ICON_MAP[gateDef.icon]}
						{@const tintKey = TINT_KEYS[i % TINT_KEYS.length]}
						{@const jitClass = JIT_CLASSES[i % JIT_CLASSES.length]}
						{@const pillVariant = PILL_VARIANTS[i % PILL_VARIANTS.length]}
						{#if earned}
							<div
								class="sticker earned offset-pill {jitClass}"
								style="background: {tintGradient(tintKey)}"
								aria-label="{gateDef.title} gate"
								in:fade={{ delay: i * 20, duration: 180 }}
							>
								{#if IconComponent}
									<IconComponent size={22} color={TINT_TEXT[tintKey]} aria-hidden="true" />
								{/if}
								<Pill variant={pillVariant} size="md">{gateDef.title}</Pill>
							</div>
						{:else}
							<div class="sticker empty" aria-label="locked gate {gateDef.title}">
								<Icon name="lock" size={18} color="var(--color-muted-line)" />
								<span class="empty-name">{gateDef.title}</span>
							</div>
						{/if}
					{/each}
				</div>
			</section>

			<section class="shelf achievement-shelf" aria-labelledby="shelf-prestaties">
				<h3 id="shelf-prestaties" class="shelf-title jit-5">achievements</h3>
				<div class="sticker-grid">
					{#each visibleAchievements as a, i (a.id)}
						{@const earned = !!ctx.state.achievements[a.id]?.unlockedAt}
						{@const IconComponent = ICON_MAP[a.icon]}
						{@const tintKey = TINT_KEYS[i % TINT_KEYS.length]}
						{@const jitClass = JIT_CLASSES[i % JIT_CLASSES.length]}
						{#if earned}
							<div
								class="sticker earned offset-pill {jitClass}"
								style="background: {tintGradient(tintKey)}"
								title={a.description}
								aria-label={a.title}
								in:fade={{ delay: i * 15, duration: 180 }}
							>
								{#if IconComponent}
									<IconComponent size={22} color={TINT_TEXT[tintKey]} aria-hidden="true" />
								{/if}
								<span class="ach-title" style="color: {TINT_TEXT[tintKey]}">{a.title}</span>
							</div>
						{:else}
							<div class="sticker empty" aria-label="locked: {a.title}">
								<Icon name="lock" size={16} color="var(--color-muted-line)" />
								<span class="empty-name">{a.title}</span>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		</div>
	{:else}
		<div class="collection-preview" transition:fade={{ duration: 150 }}>
			{#each previewItems as item (item.key)}
				{@const IconComponent = ICON_MAP[item.icon]}
				{#if IconComponent}
					<div class="preview-icon offset-pill" title={item.title} aria-label={item.title}>
						<IconComponent size={16} color="var(--color-rose-deep)" aria-hidden="true" />
					</div>
				{/if}
			{/each}
			{#if previewItems.length === 0}
				<span class="preview-empty">no stickers yet. keep playing!</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.collection-section {
		overflow: visible;
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

	.shelves {
		display: flex;
		flex-direction: column;
		gap: 24px;
		overflow: visible;
	}

	.shelf {
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow: visible;
	}

	.shelf-title {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: lowercase;
		color: var(--color-muted-ink);
		margin: 0;
		padding: 2px 2px 6px;
		line-height: 1.45;
		width: fit-content;
		position: relative;
		z-index: 1;
	}

	.sticker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
		gap: 10px;
		padding-block: 16px;
		overflow: visible;
	}

	.sticker {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 72px;
		padding: 10px 8px;
		border-radius: 16px;
		text-align: center;
		min-width: 0;
	}

	.sticker.earned {
		border: none;
	}

	.sticker.empty {
		background: color-mix(in srgb, var(--color-cream) 70%, white);
		border: 2px dashed var(--color-muted-line);
		opacity: 0.85;
	}

	.sticker.empty-circle {
		border-radius: 999px;
		aspect-ratio: 1;
		min-height: 56px;
		padding: 8px;
		justify-self: center;
		width: 56px;
	}

	.empty-name {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		line-height: 1.2;
	}

	.ach-title {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		max-width: 100%;
	}

	.collection-preview {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
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
	}

	.preview-empty {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}
</style>
