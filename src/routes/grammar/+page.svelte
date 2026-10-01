<script lang="ts">
	import { resolve } from '$app/paths';
	import { GRAMMAR_CONTENT } from '$lib/grammar/GRAMMAR_CONTENT';
	import { GATE1_DRILLS } from '$lib/grammar/drills';
	import type { GrammarChapter } from '$lib/grammar/types';
	import GrammarCardView from '$lib/components/grammar/GrammarCardView.svelte';
	import GrammarDrills from '$lib/components/grammar/GrammarDrills.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';

	const chapters = GRAMMAR_CONTENT;
	const totalCards = chapters.reduce((sum, ch) => sum + ch.cards.length, 0);
	const showDrills = GATE1_DRILLS.length > 0;

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
	let openId = $state<string>(chapters[0]?.id ?? '');

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
			<h1 class="grammar-title">Patterns</h1>
			<span class="title-squiggle">
				<Doodle name="shape-swirl-loops-4" size={96} color="var(--color-rose-deep)" tilt={-2} />
			</span>
		</div>
		<div class="badge-row">
			<span class="chip">{chapters.length} chapters</span>
			<span class="chip">{totalCards} cards</span>
			{#if showDrills}
				<span class="chip">warm-up</span>
			{/if}
		</div>
		<span class="header-sparkle">
			<Doodle name="spark-sparkle-26" size={26} color="var(--color-rose-deep)" tilt={8} />
		</span>
	</header>

	<nav class="picks" aria-label="Chapters">
		{#each chapters as chapter (chapter.id)}
			<button
				type="button"
				class="pick"
				class:on={isOpen(chapter.id)}
				aria-pressed={isOpen(chapter.id)}
				aria-label={chapter.title}
				onclick={() => toggleChapter(chapter.id)}
			>
				{chapter.n}
			</button>
		{/each}
	</nav>

	{#each chapters as chapter (chapter.id)}
		{#if isOpen(chapter.id)}
			<article class="chapter-unit" style={famStyle(chapter.tone)}>
				<h2 class="chapter-heading">{chapter.title}</h2>
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
			</article>
		{/if}
	{/each}

	{#if showDrills}
		<GrammarDrills />
	{/if}
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

	.badge-row,
	.picks {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.chip {
		display: inline-flex;
		padding: 3px 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-peach) 50%, white);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.2;
	}

	.pick {
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-rose) 50%, white);
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-ink);
		cursor: pointer;
	}

	.pick.on {
		background: var(--color-rose);
		box-shadow: var(--shadow-offset-pill);
	}

	.header-sparkle {
		position: absolute;
		top: -4px;
		right: 4px;
		pointer-events: none;
		line-height: 0;
	}

	.chapter-unit {
		position: relative;
		border: 3px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--shadow-offset-card);
		background: #fff;
		padding: 14px;
	}

	.chapter-heading {
		margin: 0 0 10px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		color: var(--fam-ink);
		line-height: 1.3;
	}

	.chapter-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.chapter-unit :global(.formula-bar),
	.chapter-unit :global(.bead),
	.chapter-unit :global(.bubble-k),
	.chapter-unit :global(.callout) {
		border: none !important;
		box-shadow: none !important;
	}

	.chapter-body :global(.grammar-card:first-child .callout) {
		border: 2px dashed var(--color-rose-deep) !important;
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
