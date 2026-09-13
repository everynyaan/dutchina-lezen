<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { getGameContext } from '$lib/state/context';
	import { weekLabel } from './pluralize';

	interface Props {
		streakWeeks: number;
		rankName: string;
	}

	let { streakWeeks, rankName }: Props = $props();

	const ctx = getGameContext();
	let streaksMode = $derived(ctx.state.appConfig.streaks);
</script>

<div class="badges">
	{#if streaksMode !== 'off'}
		<div class="badge badge-rose r-pill offset-pill jit-a">
			<span class="icon-circle">
				<Icon name="fire" size={14} color="var(--color-rose-deep)" />
			</span>
			<span class="value">{weekLabel(streakWeeks)}</span>
		</div>
	{/if}
	<div class="badge badge-lav r-pill offset-pill jit-b">
		<span class="icon-circle">
			<Icon name="crown" size={14} color="var(--color-lavender-deep)" />
		</span>
		<span class="value">{rankName}</span>
	</div>
	<div class="badge badge-teal r-pill offset-pill jit-c">
		<span class="value">B1</span>
	</div>
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

	.badge-teal {
		padding-left: 12px;
		padding-right: 12px;
	}

	.icon-circle {
		width: 22px;
		height: 22px;
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
		letter-spacing: -0.01em;
		line-height: 1.2;
		white-space: nowrap;
	}

	.badge-rose {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
	}

	.badge-lav {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
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
