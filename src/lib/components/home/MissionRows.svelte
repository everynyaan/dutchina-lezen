<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { MISSION_MAP } from '$lib/missions/MISSIONS';
	import Icon from '$lib/icons/Icon.svelte';

	const ctx = getGameContext();

	const MAX_ROWS = 3;

	let missionsMode = $derived(ctx.state.appConfig.missions);

	// Unknown mission ids (no MISSION_MAP entry) are skipped silently rather
	// than rendering a blank/fallback row.
	let known = $derived(ctx.state.missions.daily.filter((m) => MISSION_MAP[m.id]));
	let visible = $derived(known.slice(0, MAX_ROWS));
	let extra = $derived(Math.max(0, known.length - MAX_ROWS));
</script>

{#if missionsMode !== 'off'}
	<div class="missions">
		<div class="missions-head">
			<Icon
				name="bullseye"
				size={16}
				color="var(--color-rose-deep)"
				secondaryColor="var(--color-rose)"
				secondaryOpacity={0.4}
			/>
			<h3 class="missions-title jit-3">missions</h3>
		</div>

		{#if visible.length === 0}
			<p class="missions-empty">no missions this week</p>
		{:else}
			<div class="rows">
				{#each visible as mission (mission.id)}
					{@const def = MISSION_MAP[mission.id]}
					{@const pct = Math.min((mission.progress / def.target) * 100, 100)}
					<div class="row">
						<div class="row-top">
							<span class="row-desc">{def.description}</span>
							{#if mission.completed}
								<Icon name="check" size={14} color="var(--color-teal-deep)" title="done" />
							{:else}
								<span class="row-count">{mission.progress}/{def.target}</span>
							{/if}
						</div>
						<div class="row-bar">
							<div class="row-bar-fill" class:done={mission.completed} style="width: {pct}%"></div>
						</div>
					</div>
				{/each}
			</div>
			{#if extra > 0}
				<p class="missions-more">+{extra} more</p>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.missions {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.missions-head {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.missions-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-base);
		color: var(--color-ink);
		text-transform: lowercase;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.missions-empty,
	.missions-more {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.row {
		padding: 8px 0;
	}

	.row + .row {
		border-top: 1px solid var(--color-line);
	}

	.row-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 6px;
	}

	.row-desc {
		font-size: var(--text-small);
		color: var(--color-text);
		line-height: 1.35;
	}

	.row-count {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		flex-shrink: 0;
	}

	.row-bar {
		height: 4px;
		border-radius: 999px;
		/* Phase 4.5 R1: doubled from 20% so the thin track reads on white sheet/rail */
		background: color-mix(in srgb, var(--color-rose) 40%, transparent);
		overflow: hidden;
	}

	.row-bar-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--color-rose-deep);
		transition: width 0.4s ease;
	}

	.row-bar-fill.done {
		background: var(--color-teal-deep);
	}
</style>
