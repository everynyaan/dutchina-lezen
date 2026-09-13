<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';

	const ctx = getGameContext();

	let matchesToday = $derived(ctx.state.match.completedToday);
	let cardsToday = $derived(ctx.state.cards.reviewedToday);
	let lpToday = $derived(ctx.state.lpEarnedToday);
	let totalLp = $derived(Number.isFinite(ctx.state.totalLp) ? ctx.state.totalLp : 0);

	let storyToday = $derived.by(() => {
		const today = new Date().toISOString().slice(0, 10);
		return Object.values(ctx.state.conversation.questionResults).filter(
			(r) => r.correct && r.attemptedAt.startsWith(today)
		).length;
	});

	let schrijvenToday = $derived.by(() => {
		const today = new Date().toISOString().slice(0, 10);
		return Object.values(ctx.state.reviews.submissions).filter((s) =>
			s.submittedAt.startsWith(today)
		).length;
	});

	type Tint = 'rose' | 'lavender' | 'peach' | 'teal';

	interface Badge {
		key: string;
		icon: IconName;
		value: number;
		label: string;
		tint: Tint;
		jit: string;
	}

	let badges = $derived<Badge[]>([
		{
			key: 'match',
			icon: 'shuffle',
			value: matchesToday,
			label: 'match',
			tint: 'rose',
			jit: 'jit-a'
		},
		{
			key: 'cards',
			icon: 'rectangle-history',
			value: cardsToday,
			label: 'cards',
			tint: 'lavender',
			jit: 'jit-2'
		},
		{
			key: 'story',
			icon: 'book-open-cover',
			value: storyToday,
			label: 'stories',
			tint: 'lavender',
			jit: 'jit-b'
		},
		{
			key: 'schrijven',
			icon: 'pen-line',
			value: schrijvenToday,
			label: 'writing',
			tint: 'peach',
			jit: 'jit-6'
		},
		{ key: 'lp', icon: 'bolt', value: lpToday, label: 'lp', tint: 'teal', jit: 'jit-c' },
		{ key: 'total', icon: 'bolt', value: totalLp, label: 'total lp', tint: 'rose', jit: 'jit-4' }
	]);

	let visibleBadges = $derived(
		badges.filter((b) => {
			if (b.key === 'lp' || b.key === 'total') return false;
			return true;
		})
	);

	// Icon glyph tints stay on the deep cousins (decorative, not body text-on-tint).
	const tintColor: Record<Tint, string> = {
		rose: 'var(--color-rose-deep)',
		lavender: 'var(--color-lavender-deep)',
		peach: 'var(--color-peach-deep)',
		teal: 'var(--color-teal-deep)'
	};
</script>

<div class="badges">
	{#each visibleBadges as b (b.key)}
		<div class="badge badge-{b.tint} r-pill offset-pill {b.jit}">
			<span class="icon-circle">
				<Icon name={b.icon} size={13} color={tintColor[b.tint]} />
			</span>
			<span class="value">{b.key === 'total' ? b.value.toLocaleString('en-US') : b.value}</span>
			<span class="label">{b.label}</span>
		</div>
	{/each}
</div>

<style>
	.badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px 5px 6px;
		border: none;
	}

	.icon-circle {
		width: 20px;
		height: 20px;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: color-mix(in srgb, currentColor 16%, white);
	}

	.value {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		line-height: 1.2;
	}

	.label {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-small);
		line-height: 1.2;
		text-transform: lowercase;
		opacity: 0.9;
	}

	.badge-rose {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
	}

	.badge-lavender {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.badge-peach {
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	.badge-teal {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}
</style>
