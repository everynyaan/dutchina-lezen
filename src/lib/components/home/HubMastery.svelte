<script lang="ts">
	import MasteryBar from './MasteryBar.svelte';
	import type { GateProgress, HubCheck } from '$lib/gates/progress';

	interface Props {
		progress: GateProgress;
		checks: HubCheck[];
		gate: number;
		title: string;
	}

	let { progress, checks, gate, title }: Props = $props();

	let aria = $derived(`Gate ${gate} ${title}, on your way`);
</script>

<section class="hub-mastery" aria-label="How this room is going">
	<MasteryBar percent={progress.percent} label={aria} kind={progress.kind} />
	<p class="line">{progress.line}</p>
	<ul class="checks">
		{#each checks as check (check.key)}
			<li class="check" class:is-done={check.done}>
				<div class="check-copy">
					<span class="check-label">{check.label}</span>
					<span class="check-status">{check.status}</span>
				</div>
				<div
					class="check-track"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(check.ratio * 100)}
					aria-label={check.label}
				>
					<div class="check-fill" style="width: {Math.round(check.ratio * 100)}%"></div>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.hub-mastery {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px 16px 16px;
		border-radius: 18px;
		background: color-mix(in srgb, var(--color-rose) 10%, white);
		color: var(--color-ink);
	}

	.line {
		margin: 0;
		font-size: var(--text-small);
		line-height: 1.4;
		color: var(--color-muted-ink);
		max-width: 36rem;
	}

	.checks {
		list-style: none;
		margin: 4px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.check {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.check-copy {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.check-label {
		font-size: var(--text-small);
		color: var(--color-ink);
	}

	.check-status {
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: lowercase;
		color: var(--color-muted-ink);
	}

	.check-track {
		height: 4px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-ink) 10%, transparent);
		overflow: hidden;
	}

	.check-fill {
		height: 100%;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-teal) 70%, var(--color-ink));
	}

	.is-done .check-status {
		color: var(--color-teal-deep);
	}
</style>
