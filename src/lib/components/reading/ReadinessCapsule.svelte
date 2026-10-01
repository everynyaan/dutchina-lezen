<script lang="ts">
	import Character from '$lib/components/art/Character.svelte';
	import { getTodayDate } from '$lib/match/engine';
	import { daysToExam, lastMockView, locateWindow } from '$lib/reading/readiness';
	import { getGameContext } from '$lib/state/context';
	import StatBadge from './StatBadge.svelte';

	const ctx = getGameContext();
	const today = getTodayDate();

	let examDate = $derived(ctx?.state.readingFork.settings.examDate ?? '');
	let days = $derived(daysToExam(examDate, today));
	let located = $derived(ctx ? locateWindow(ctx.state.readingFork, 50) : null);
	let last = $derived(ctx ? lastMockView(ctx.state.readingFork) : null);
	let streak = $derived(ctx?.state.practiceDays ?? 0);

	let dateLabel = $derived.by(() => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) return 'Date not set';
		const [year, month, day] = examDate.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	});

	let locatedValue = $derived(
		located && located.total > 0
			? `${Math.round((located.hits / located.total) * 100)}%`
			: 'none yet'
	);
	let mockValue = $derived(last ? `${last.correct} vs ${last.passLine}` : 'none yet');
</script>

<section class="capsule" aria-label="Readiness">
	<div class="featured">
		<p class="kicker">{days === null ? 'Exam' : `${days} days`}</p>
		<p class="date">{dateLabel}</p>
	</div>
	<div class="badges">
		<StatBadge label="streak" value={String(streak)} tint="rose" mark="S" />
		<StatBadge label="found the paragraph" value={locatedValue} tint="teal" mark="P" />
		<StatBadge label="last mock vs line" value={mockValue} tint="lavender" mark="M" />
	</div>
	<div class="week">
		<Character who="kuromi" mood="wink" size={32} alt="" />
		<p>Baseline mock by 12 Oct. Leave the sealed papers shut.</p>
	</div>
</section>

<style>
	.capsule {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.featured {
		background: color-mix(in srgb, var(--color-lavender) 55%, white);
		border: 3px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--shadow-offset-ink);
		padding: 14px 16px;
	}

	.kicker {
		margin: 0;
		font-size: 14px;
		color: var(--color-muted-ink);
	}

	.date {
		margin: 2px 0 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 28px;
		line-height: 1.1;
		color: var(--color-ink);
	}

	.badges {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.week {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}

	.week p {
		margin: 0;
		font-size: 14px;
		line-height: 1.4;
		color: var(--color-ink);
	}
</style>
