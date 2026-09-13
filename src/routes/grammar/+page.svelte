<script lang="ts">
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { currentGateFromState } from '$lib/gates/gates';
	import { grammarChaptersForBrowse, initialBrowseGate } from '$lib/gates/browse';
	import { drillsForGate } from '$lib/grammar/drills';
	import GateBrowseFilter from '$lib/components/GateBrowseFilter.svelte';
	import type { GrammarChapter } from '$lib/grammar/types';
	import GrammarCardView from '$lib/components/grammar/GrammarCardView.svelte';
	import GrammarDrills from '$lib/components/grammar/GrammarDrills.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';

	const ctx = getGameContext();
	let engineGate = $derived(currentGateFromState(ctx.state));
	let browseGate = $state(initialBrowseGate(currentGateFromState(ctx.state)));
	let chapters = $derived(grammarChaptersForBrowse(browseGate));
	let totalCards = $derived(chapters.reduce((sum, ch) => sum + ch.cards.length, 0));
	let showDrills = $derived(drillsForGate(browseGate).length > 0);

	// GRAMMAR_CONTENT (content, not editable this phase) still speaks the old
	// four-name tone palette (pink/lilac/mint/butter). Map each to its §2.1
	// canon family HERE so every chapter derives its border/tint/ink from the
	// exact same formula. This closes the known fainter-lilac/butter-border
	// bug: the old CSS keyed border-color off tone-specific aliases, and only
	// the pink and mint chapters resolved to a real saturated deep cousin —
	// lilac and butter had no such alias and fell back to their pale
	// background tint as a border colour, reading visibly weaker. Deriving
	// all four from the same { tint, deep, ink } shape makes that
	// divergence structurally impossible.
	type Tone = GrammarChapter['tone'];
	const FAMILY: Record<Tone, { tint: string; deep: string; ink: string }> = {
		rose: {
			tint: 'var(--color-rose)',
			deep: 'var(--color-rose-deep)',
			ink: 'var(--color-rose-ink)'
		},
		lavender: {
			tint: 'var(--color-lavender)',
			deep: 'var(--color-lavender-deep)',
			ink: 'var(--color-lavender-deep)'
		},
		teal: {
			tint: 'var(--color-teal)',
			deep: 'var(--color-teal-deep)',
			ink: 'var(--color-teal-deep)'
		},
		peach: {
			tint: 'var(--color-peach)',
			deep: 'var(--color-peach-deep)',
			ink: 'var(--color-peach-deep)'
		}
	};

	function famStyle(tone: Tone): string {
		const f = FAMILY[tone];
		return `--fam-tint:${f.tint};--fam-deep:${f.deep};--fam-ink:${f.ink}`;
	}

	// Single-open accordion (was a multi-open SvelteSet). One expanded chapter
	// at a time keeps exactly one 2px family-bordered unit on screen ever —
	// see the outlined-surface budget note in the PR description.
	let openId = $state<string>('');

	$effect(() => {
		if (!openId || !chapters.some((ch) => ch.id === openId)) {
			openId = chapters[0]?.id ?? '';
		}
	});

	function isOpen(id: string): boolean {
		return openId === id;
	}

	function toggleChapter(id: string) {
		openId = openId === id ? '' : id;
	}
</script>

<div class="grammar-page">
	<header class="grammar-header">
		<a href={resolve('/')} class="back-link">
			<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
			<span>Home</span>
		</a>
		<div class="title-row">
			<h1 class="grammar-title">Grammar</h1>
			<span class="title-squiggle">
				<Doodle name="shape-swirl-loops-4" size={96} color="var(--color-rose-deep)" tilt={-2} />
			</span>
		</div>
		<GateBrowseFilter
			current={engineGate}
			selected={browseGate}
			noun="chapters"
			onSelect={(g) => (browseGate = g)}
		/>
		<p class="grammar-subtitle">
			{chapters.length} chapters &middot; {totalCards} reference cards
			{#if showDrills}
				&middot; {drillsForGate(browseGate).length} first drills
			{/if}
		</p>
		<span class="header-sparkle">
			<Doodle name="spark-sparkle-26" size={26} color="var(--color-rose-deep)" tilt={8} />
		</span>
	</header>

	{#if showDrills}
		<GrammarDrills />
	{/if}

	<div class="chapter-list">
		{#each chapters as chapter (chapter.id)}
			{@const open = isOpen(chapter.id)}
			<div class="chapter-unit" class:open style={famStyle(chapter.tone)}>
				<button
					type="button"
					class="chapter-row r-card"
					class:edge-hair={!open}
					class:open
					aria-expanded={open}
					aria-controls="chapter-body-{chapter.id}"
					onclick={() => toggleChapter(chapter.id)}
				>
					<span class="chapter-num r-pill">{chapter.n}</span>
					<span class="chapter-text">
						<span class="chapter-title">{chapter.title}</span>
						<span class="chapter-blurb">{chapter.blurb}</span>
					</span>
					<span class="chapter-chevron">
						<Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color="var(--fam-ink)" />
					</span>
				</button>

				{#if open}
					<div id="chapter-body-{chapter.id}" class="chapter-body">
						{#each chapter.cards as card, cardi (card.id)}
							<GrammarCardView
								title={card.title}
								formula={card.formula}
								formulaTone={card.formulaTone ?? 'rose'}
								example={card.example}
								trap={card.trap}
								class="grammar-card"
							>
								{#snippet aboveTrap()}
									{#if cardi === 0}
										<span class="callout-arrow">
											<Doodle
												name="arrow-down-33"
												size={20}
												color="var(--color-rose-deep)"
												tilt={-12}
											/>
										</span>
									{/if}
								{/snippet}
							</GrammarCardView>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.grammar-page {
		padding: 1rem 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.grammar-header {
		position: relative;
		margin-bottom: 4px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		text-decoration: none;
		margin-bottom: 10px;
		-webkit-tap-highlight-color: transparent;
	}

	.back-link:hover {
		color: var(--color-rose-deep);
	}

	.title-row {
		position: relative;
		display: inline-block;
		padding-bottom: 8px;
	}

	.grammar-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		text-transform: uppercase;
	}

	.title-squiggle {
		position: absolute;
		left: 0;
		bottom: -4px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.title-row :global(.doodle) {
		width: 120px !important;
		height: 18px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.grammar-subtitle {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin-top: 4px;
	}

	.header-sparkle {
		position: absolute;
		top: -4px;
		right: 4px;
		pointer-events: none;
		line-height: 0;
	}

	.chapter-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chapter-unit {
		position: relative;
	}

	.chapter-unit.open {
		box-shadow: var(--shadow-offset-card);
		border-radius: 22px;
	}

	.chapter-row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 14px;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-sans);
		border: none;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--fam-tint) 55%, white) 0%,
			color-mix(in srgb, var(--fam-tint) 26%, white) 100%
		);
		-webkit-tap-highlight-color: transparent;
		transition: border-color 0.15s;
	}

	.chapter-row.open {
		/* The open chapter is the screen's single hero (V3_DESIGN §1.1):
		   3px --color-ink border + offset shadow (on .chapter-unit.open) +
		   white surface. Closed rows keep their family-derived 2px tinted
		   border below — that is where the per-chapter colour-coding
		   lives, plus the chapter-num badge accent inside this row. */
		border: 3px solid var(--color-ink);
		border-bottom: none;
		border-radius: 22px 22px 0 0;
		background: #fff;
	}

	.chapter-num {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-lead);
		border: 2px solid var(--fam-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--fam-tint) 55%, white) 0%,
			color-mix(in srgb, var(--fam-tint) 26%, white) 100%
		);
		color: var(--fam-ink);
	}

	.chapter-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.chapter-title {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--fam-ink);
		line-height: 1.3;
	}

	.chapter-blurb {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--fam-ink);
		line-height: 1.45;
	}

	.chapter-chevron {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.chapter-body {
		/* Continues the hero panel opened by .chapter-row.open above —
		   same 3px ink border, zero gap (border-top: none here). */
		border: 3px solid var(--color-ink);
		border-top: none;
		border-radius: 0 0 22px 22px;
		background: #fff;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.callout-arrow {
		position: absolute;
		top: -16px;
		left: 10px;
		pointer-events: none;
		line-height: 0;
	}

	@media (min-width: 700px) {
		.chapter-body {
			padding: 18px;
		}
	}
</style>
