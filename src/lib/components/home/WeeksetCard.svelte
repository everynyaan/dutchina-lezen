<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';

	interface Props {
		total: number;
		answered: number;
		correct: number;
		completed: boolean;
		lpEarned: number;
		isThisWeek: boolean;
		class?: string;
	}

	let {
		total,
		answered,
		correct,
		completed,
		lpEarned,
		isThisWeek,
		class: className
	}: Props = $props();

	const pct = $derived(total > 0 ? Math.min((answered / total) * 100, 100) : 0);

	const ariaLabel = $derived(
		completed
			? `week set, done, ${correct} correct`
			: isThisWeek
				? `week set, ${answered} of ${total}, ${correct} correct`
				: 'week set, new'
	);
</script>

<a
	class={['weekset-card', 'r-card', 'offset-ink', className].filter(Boolean).join(' ')}
	href={resolve('/daily')}
	aria-label={ariaLabel}
>
	<div class="ws-head">
		<span class="ws-icon">
			<Icon
				name="calendar-check"
				size={20}
				color="var(--color-cream)"
				secondaryColor="var(--color-orchid)"
				secondaryOpacity={0.45}
			/>
		</span>
		<h3 class="ws-title">week set</h3>
	</div>

	{#if completed}
		<div class="ws-earned">
			<span class="ws-earned-value">done</span>
		</div>
	{:else if !isThisWeek}
		<span class="ws-pill r-pill offset-pill">new</span>
	{:else}
		<span class="ws-pill r-pill offset-pill">{answered}/{total}</span>
		<div class="ws-bar">
			<div class="ws-bar-fill" style="width: {pct}%"></div>
		</div>
	{/if}
</a>

<style>
	.weekset-card {
		position: relative;
		display: block;
		padding: 16px 16px 18px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-ink) 80%, white) 0%,
			var(--color-ink) 62%
		);
		text-decoration: none;
		overflow: hidden;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.weekset-card:active {
		transform: scale(var(--press-scale));
		filter: brightness(1.05);
	}

	.ws-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 14px;
	}

	.ws-icon {
		display: flex;
		flex-shrink: 0;
	}

	.ws-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-lead);
		color: var(--color-cream);
		letter-spacing: -0.02em;
		text-transform: lowercase;
		line-height: 1.1;
	}

	.ws-pill {
		display: inline-flex;
		align-items: center;
		padding: 6px 14px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		background: color-mix(in srgb, var(--color-orchid) 22%, transparent);
		color: var(--color-orchid);
	}

	.ws-bar {
		margin-top: 10px;
		height: 5px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-orchid) 18%, transparent);
		overflow: hidden;
	}

	.ws-bar-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--color-orchid);
		transition: width 0.4s ease;
	}

	.ws-earned {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.ws-earned-value {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--color-orchid);
	}

	:global(html[data-glow-target='weekset']) .weekset-card {
		outline: 3px solid transparent;
		outline-offset: 3px;
		animation: glow-pulse-orchid 1.2s ease-in-out infinite;
	}

	@keyframes glow-pulse-orchid {
		0%,
		100% {
			outline-color: color-mix(in srgb, var(--color-orchid) 25%, transparent);
		}
		50% {
			outline-color: var(--color-orchid);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html[data-glow-target='weekset']) .weekset-card {
			animation: none;
			outline-color: var(--color-orchid);
		}
	}
</style>
