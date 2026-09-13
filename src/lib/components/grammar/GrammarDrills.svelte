<script lang="ts">
	import type { G1DrillPattern, GrammarDrill } from '$lib/grammar/drills';
	import { GATE1_DRILLS } from '$lib/grammar/drills';

	const FILTERS: { id: G1DrillPattern | 'all'; label: string }[] = [
		{ id: 'all', label: 'all' },
		{ id: 'de_het', label: 'de / het' },
		{ id: 'v2_subject_first', label: 'word order' },
		{ id: 'present_ik_jij_hij', label: 'ik / jij / hij' }
	];

	let filter = $state<G1DrillPattern | 'all'>('all');
	let index = $state(0);
	let picked = $state<string | null>(null);

	let pool = $derived(
		filter === 'all' ? GATE1_DRILLS : GATE1_DRILLS.filter((d) => d.pattern === filter)
	);
	let drill = $derived<GrammarDrill | undefined>(pool[index] ?? pool[0]);
	let correct = $derived(picked != null && picked === drill?.answer);

	$effect(() => {
		void filter;
		index = 0;
		picked = null;
	});

	function choose(option: string) {
		if (picked) return;
		picked = option;
	}

	function next() {
		if (!pool.length) return;
		index = (index + 1) % pool.length;
		picked = null;
	}
</script>

{#if drill}
	<section class="drills" id="drills" aria-label="Pattern warm-up drills">
		<header class="head">
			<h2 class="title">Warm-up drills</h2>
			<p class="sub">de/het, verb second, ik/jij/hij — the moves that show up in texts.</p>
		</header>

		<div class="filters" role="tablist" aria-label="Drill pattern">
			{#each FILTERS as chip (chip.id)}
				<button
					type="button"
					class="chip"
					class:active={filter === chip.id}
					role="tab"
					aria-selected={filter === chip.id}
					onclick={() => (filter = chip.id)}
				>
					{chip.label}
				</button>
			{/each}
		</div>

		<p class="progress">{index + 1} / {pool.length}</p>

		<div class="card r-card edge-hair">
			<p class="prompt">{drill.prompt}</p>
			<p class="cue">{drill.cue}</p>
			<div class="options">
				{#each drill.options as option (option)}
					<button
						type="button"
						class="opt r-chip"
						class:picked={picked === option}
						class:right={picked != null && option === drill.answer}
						class:wrong={picked === option && option !== drill.answer}
						disabled={picked != null}
						onclick={() => choose(option)}
					>
						{option}
					</button>
				{/each}
			</div>
			{#if picked}
				<p class="explain" class:ok={correct}>{drill.explain}</p>
				<button type="button" class="next" onclick={next}>Next</button>
			{/if}
		</div>
	</section>
{/if}

<style>
	.drills {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-ink);
	}

	.sub,
	.progress,
	.prompt,
	.explain {
		margin: 0;
		font-size: var(--text-small);
		line-height: 1.4;
		color: var(--color-muted-ink);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chip,
	.next {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1.5px solid var(--color-ink);
		background: color-mix(in srgb, white 70%, transparent);
		color: var(--color-ink);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.chip.active {
		background: var(--color-ink);
		color: var(--color-cream);
	}

	.card {
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: color-mix(in srgb, var(--color-lavender) 22%, white);
	}

	.cue {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.3;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.opt {
		padding: 10px 12px;
		text-align: left;
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		cursor: pointer;
		background: color-mix(in srgb, white 75%, transparent);
		-webkit-tap-highlight-color: transparent;
	}

	.opt:disabled {
		cursor: default;
	}

	.opt.right {
		background: color-mix(in srgb, var(--color-teal) 40%, white);
		color: var(--color-teal-deep);
	}

	.opt.wrong {
		background: color-mix(in srgb, var(--color-rose) 40%, white);
		color: var(--color-rose-ink);
	}

	.explain.ok {
		color: var(--color-teal-deep);
	}

	.next {
		align-self: flex-start;
	}
</style>
