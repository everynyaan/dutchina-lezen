<script lang="ts">
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { selectRead } from '$lib/read/select';
	import { READ_CONTENT } from '$lib/read/READ_CONTENT';
	import { loadRustyWords } from '$lib/fresh/freshSource';
	import { currentGateFromState, getWordsUpToGate } from '$lib/gates/gates';
	import type { WordEntry } from '$lib/data/wordPool';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();
	const read = selectRead(READ_CONTENT, ctx.activeProfile, today);

	let rustyWords = $state<WordEntry[]>([]);
	let isDoneToday = $derived(ctx.state.dailyRead.date === today && ctx.state.dailyRead.done);

	/** Per-line EN gloss open state, keyed by Dutch line text. */
	let openGloss = $state<Record<string, boolean>>({});

	onMount(async () => {
		rustyWords = await loadRustyWords(today, 3, getWordsUpToGate(currentGateFromState(ctx.state)));
	});

	function markDone() {
		ctx.state.dailyRead = { date: today, done: true };
	}

	function humanizeTag(tag: string): string {
		return tag
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	function toggleGloss(nl: string) {
		openGloss = { ...openGloss, [nl]: !openGloss[nl] };
	}

	/** Formula tone → live V3 palette (presentation-only). */
	const FORMULA_TONE: Record<string, { surface: string; ink: string }> = {
		rose: {
			surface: 'color-mix(in srgb, var(--color-rose) 24%, white)',
			ink: 'var(--color-rose-ink)'
		},
		lavender: {
			surface: 'color-mix(in srgb, var(--color-lavender) 24%, white)',
			ink: 'var(--color-lavender-deep)'
		},
		teal: {
			surface: 'color-mix(in srgb, var(--color-teal) 24%, white)',
			ink: 'var(--color-teal-deep)'
		},
		peach: {
			surface: 'color-mix(in srgb, var(--color-peach) 30%, white)',
			ink: 'var(--color-peach-deep)'
		}
	};

	function formulaToneStyle(tone: string): string {
		const t = FORMULA_TONE[tone] ?? FORMULA_TONE.rose;
		return `--formula-surface: ${t.surface}; --formula-ink: ${t.ink}`;
	}
</script>

<div class="read-page">
	<a class="back-link" href={resolve('/')}>
		<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
		<span>Home</span>
	</a>

	{#if !read}
		<div class="unavailable r-card offset-card">
			<p class="unavailable-text">Today's read is unavailable. Check back later.</p>
		</div>
	{:else}
		<article class="hero r-card edge-ink offset-card">
			<div class="hero-header">
				<div class="hero-identity">
					<Character who="kuromi" mood="coffee" size={72} animated={false} alt="" />
					<span class="tag-pill r-pill offset-pill">{humanizeTag(read.tag)}</span>
				</div>
				<div class="hero-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={30} color="var(--color-rose-deep)" tilt={-6} />
				</div>
			</div>

			<div class="title-wrap">
				<h1 class="read-title">{read.title}</h1>
				<span class="title-squiggle" aria-hidden="true">
					<Doodle name="shape-swirl-loops-4" size={80} color="var(--color-rose-deep)" tilt={-3} />
				</span>
			</div>
			<p class="read-title-en">{read.titleEn}</p>

			<div class="lines">
				{#each read.lines as line (line.nl)}
					{@const open = !!openGloss[line.nl]}
					<div class="line">
						<div class="line-nl-row">
							<button
								type="button"
								class="line-toggle"
								aria-expanded={open}
								onclick={() => toggleGloss(line.nl)}
							>
								<span class="line-nl">{line.nl}</span>
								<span class="chevron" class:open aria-hidden="true">
									<Icon name="chevron-down" size={18} color="var(--color-peach-deep)" />
								</span>
							</button>
							<SpeakerButton text={line.nl} />
						</div>
						{#if open}
							<div class="line-en soft-row">{line.en}</div>
						{/if}
					</div>
				{/each}
			</div>

			{#if read.tag === 'grammar-bite' && read.formula}
				<div
					class="formula"
					style={formulaToneStyle(read.formula.tone)}
					role="group"
					aria-label="Grammar formula"
				>
					{#each read.formula.beads as bead (bead.text)}
						<span class="bead r-chip" data-variant={bead.variant}>{bead.text}</span>
					{/each}
				</div>
			{/if}

			{#if read.note}
				<div class="note edge-dashed">{read.note}</div>
			{/if}

			<div class="melody-cameo" aria-hidden="true">
				<Character who="melody" mood="reading" size={40} animated={false} alt="" />
			</div>
		</article>

		{#if rustyWords.length > 0}
			<section class="rusty-footer">
				<div class="rusty-heading">
					<h2 class="rusty-title">rusty picks</h2>
				</div>
				<div class="rusty-list">
					{#each rustyWords as word (word.id)}
						<div class="rusty-pill r-pill offset-pill">
							<span class="rusty-dutch">{word.dutch}</span>
							<span class="rusty-en">{word.english}</span>
							<SpeakerButton text={word.dutch} size={16} />
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<div class="done-row">
			{#if isDoneToday}
				<div class="done-sticker r-pill">Done for today</div>
			{:else}
				<button type="button" class="done-btn r-pill offset-pill" onclick={markDone}>
					Done reading
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.read-page {
		position: relative;
		padding: 0.5rem 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		max-width: 100%;
		overflow-x: hidden;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		align-self: flex-start;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.back-link:hover {
		color: var(--color-peach-deep);
	}

	/* ---- Hero card (peach identity surface) ---- */
	.hero {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 18px 16px 48px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white) 0%,
			color-mix(in srgb, var(--color-peach) 26%, white) 100%
		);
		min-width: 0;
	}

	.hero-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}

	.hero-identity {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
	}

	.hero-sparkle {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.tag-pill {
		display: inline-flex;
		align-items: center;
		padding: 5px 12px;
		background: color-mix(in srgb, var(--color-peach) 50%, white);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-peach-deep);
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.title-wrap {
		position: relative;
		display: inline-block;
		max-width: 100%;
		padding-bottom: 10px;
		margin-bottom: -4px;
	}

	.read-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-peach-deep);
		line-height: 1.25;
		word-wrap: break-word;
		overflow-wrap: break-word;
		margin: 0;
	}

	.title-squiggle {
		position: absolute;
		left: 0;
		bottom: -2px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.title-wrap :global(.doodle) {
		width: 80px !important;
		height: 14px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.read-title-en {
		font-size: var(--text-small);
		color: var(--color-peach-deep);
		margin: -6px 0 0;
		line-height: 1.4;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* ---- Reading lines — tap-to-reveal ---- */
	.lines {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.line {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.line-nl-row {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
	}

	.line-toggle {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		font: inherit;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.line-nl {
		flex: 1;
		min-width: 0;
		font-size: 18.5px;
		line-height: 1.65;
		color: var(--color-ink);
		font-weight: 600;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.chevron {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 4px;
		color: var(--color-peach-deep);
		transform: rotate(0deg);
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	@media (prefers-reduced-motion: no-preference) {
		.chevron {
			transition: transform 0.18s ease;
		}
	}

	.soft-row {
		padding: 8px 12px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--color-peach) 14%, white);
		font-size: var(--text-small);
		line-height: 1.5;
		color: var(--color-muted-ink);
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	@media (prefers-reduced-motion: no-preference) {
		.soft-row {
			animation: gloss-in 0.16s ease-out;
		}
	}

	@keyframes gloss-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ---- Grammar formula (local beads) ---- */
	.formula {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border-radius: 16px;
		background: var(--formula-surface);
		margin-top: 2px;
	}

	.bead {
		display: inline-flex;
		align-items: center;
		padding: 5px 12px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--formula-ink);
		background: color-mix(in srgb, white 55%, var(--formula-surface));
		box-shadow: 0 1px 0 color-mix(in srgb, var(--formula-ink) 22%, transparent);
	}

	.bead[data-variant='verb'],
	.bead[data-variant='subject'] {
		font-weight: 800;
		background: color-mix(in srgb, white 30%, var(--formula-surface));
		box-shadow: 0 2px 0 color-mix(in srgb, var(--formula-ink) 28%, transparent);
	}

	.bead[data-variant='ghost'] {
		border: 1.5px dashed color-mix(in srgb, var(--formula-ink) 55%, transparent);
		background: transparent;
		box-shadow: none;
		opacity: 0.72;
		font-weight: 600;
	}

	/* ---- Optional note tip ---- */
	.note {
		padding: 10px 14px;
		border-radius: 14px;
		background: color-mix(in srgb, var(--color-cream) 70%, var(--color-peach));
		font-size: var(--text-small);
		line-height: 1.5;
		color: var(--color-text);
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* ---- Melody cameo (static, bottom-right of hero) ---- */
	.melody-cameo {
		position: absolute;
		right: 10px;
		bottom: 8px;
		width: 40px;
		height: 40px;
		pointer-events: none;
		opacity: 0.92;
	}

	/* ---- Rusty picks ---- */
	.rusty-footer {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.rusty-heading {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
	}

	.rusty-title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-peach-deep);
		letter-spacing: 0.03em;
		margin: 0;
		text-transform: lowercase;
	}

	.rusty-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.rusty-pill {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		padding: 7px 12px 7px 14px;
		background: color-mix(in srgb, var(--color-rose) 22%, white);
		max-width: 100%;
	}

	.rusty-dutch {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-ink);
	}

	.rusty-en {
		font-size: var(--text-micro);
		color: var(--color-muted-ink);
	}

	/* ---- Done CTA / done state ---- */
	.done-row {
		display: flex;
		justify-content: center;
		padding-top: 2px;
	}

	.done-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 100%;
		padding: 14px 16px;
		border: none;
		background: var(--color-peach);
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.done-btn:hover {
		background: color-mix(in srgb, var(--color-peach) 80%, var(--color-rose));
	}

	.done-btn:active {
		transform: scale(var(--press-scale));
	}

	.done-sticker {
		width: 100%;
		text-align: center;
		padding: 10px 14px;
		background: color-mix(in srgb, var(--color-peach) 22%, white);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-muted-ink);
	}

	/* ---- Unavailable ---- */
	.unavailable {
		text-align: center;
		padding: 28px 20px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 40%, white) 0%,
			color-mix(in srgb, var(--color-peach) 18%, white) 100%
		);
	}

	.unavailable-text {
		margin: 0;
		font-size: var(--text-base);
		color: var(--color-text);
		line-height: 1.5;
	}
</style>
