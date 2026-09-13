<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import { type WordEntry } from '$lib/data/wordPool';
	import { currentGateFromState, getWordsUpToGate } from '$lib/gates/gates';
	import { loadReviewQueue, saveReview, getReviewedTodayCount } from '$lib/cards/cardStore';
	import { highlightWord } from '$lib/match/engine';
	import { playSfx } from '$lib/sound/sfx';
	import type { CardRating } from '$lib/cards/srs';
	import type { SyncedCardReview } from '$lib/state/schema';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import WordHighlight from '$lib/components/WordHighlight.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();

	// ============================================================
	// SESSION STATE
	// reviewedToday is derived from Dexie on mount, then incremented
	// locally. This survives tab switches because Dexie is the
	// source of truth, not component state.
	// ============================================================
	let queue: WordEntry[] = $state([]);
	let currentIndex = $state(0);
	let revealed = $state(false);
	let loading = $state(true);
	let sessionDone = $state(false);
	let reviewedToday = $state(0);

	// Batch buffer: card reviews accumulate here during the session,
	// then get flushed to state.cardReviews in one shot (triggering
	// a single sync push instead of one per card).
	let pendingReviews: SyncedCardReview[] = [];

	let currentCard = $derived<WordEntry | null>(
		currentIndex < queue.length ? queue[currentIndex] : null
	);

	let highlight = $derived(
		currentCard ? highlightWord(currentCard.sentence_nl, currentCard.dutch) : null
	);

	// ============================================================
	// FLUSH: batch-write all pending reviews to state for sync
	// ============================================================
	function flushReviews() {
		if (pendingReviews.length === 0) return;
		for (const entry of pendingReviews) {
			ctx.state.cardReviews[entry.wordId] = entry;
		}
		console.log('[cards] flushed %d card reviews to state for sync', pendingReviews.length);
		pendingReviews = [];
	}

	// ============================================================
	// INIT
	// ============================================================
	onMount(async () => {
		const pool = getWordsUpToGate(currentGateFromState(ctx.state));

		// Derive today's reviewed count from Dexie (source of truth)
		reviewedToday = await getReviewedTodayCount();

		const result = await loadReviewQueue(pool, ctx.state.cards.newCardsPerDay);
		queue = [...result.due, ...result.newCards];
		loading = false;

		if (queue.length === 0) {
			sessionDone = true;
		} else {
			// Only fire the session-start cue when there's actually work to do.
			playSfx('session_start');
		}
	});

	// Flush on component destroy (Domi navigates away mid-session)
	onDestroy(() => {
		flushReviews();
	});

	// ============================================================
	// CARD INTERACTION
	// ============================================================
	function reveal() {
		revealed = true;
		playSfx('card_flip');
	}

	async function rate(rating: CardRating) {
		if (!currentCard) return;

		const entry = await saveReview(currentCard.id, rating);

		// Buffer for batch flush (Dexie already has it)
		pendingReviews.push({
			wordId: entry.wordId,
			interval: entry.interval,
			easeFactor: entry.easeFactor,
			repetitions: entry.repetitions,
			nextReviewDate: entry.nextReviewDate,
			lastReviewDate: entry.lastReviewDate,
			firstSeenDate: entry.firstSeenDate
		});

		ctx.applyLpEvent({ type: 'card_rated', rating });

		reviewedToday++;

		// Track lifetime total for achievements
		ctx.state.cards.totalReviewed++;

		// Mission: card reviewed
		ctx.updateMissions('cards_reviewed', 1);

		if (rating === 'good' || rating === 'easy') {
			playSfx('correct');
		} else if (rating === 'again') {
			playSfx('wrong');
		}

		revealed = false;
		currentIndex++;

		if (currentIndex >= queue.length) {
			flushReviews();
			sessionDone = true;
			playSfx('session_complete');
		}

		// Update tab badge count
		ctx.refreshCardsDue();
	}

	// Tint driver = base hue for the 55% color-mix background.
	// Ink = darker text token for >=4.5:1 contrast on that tint (rose uses -ink; others use -deep).
	const RATING_COLORS: Record<CardRating, string> = {
		again: 'var(--color-rose)',
		hard: 'var(--color-peach)',
		good: 'var(--color-teal)',
		easy: 'var(--color-lavender)'
	};

	const RATING_INK: Record<CardRating, string> = {
		again: 'var(--color-rose-ink)',
		hard: 'var(--color-peach-deep)',
		good: 'var(--color-teal-deep)',
		easy: 'var(--color-lavender-deep)'
	};

	// Secondary line under each rating: communicates the SRS interval impact.
	// LP is similar across good/easy (both +3) so the meaningful distinction
	// is how soon you'll see this card again. "Soon / Later" makes this concrete.
	const RATING_HINT: Record<CardRating, string> = {
		again: 'now',
		hard: 'shortly',
		good: 'soon',
		easy: 'later'
	};
</script>

<div class="cards-page">
	{#if loading}
		<div class="loading">
			<p>Loading cards...</p>
		</div>
	{:else if sessionDone}
		<div class="done-state">
			<div class="done-card r-card edge-ink offset-card">
				<div class="sparkle">
					<Doodle name="spark-sparkle-26" size={28} color="var(--color-teal-deep)" tilt={5} />
				</div>
				<Character who="kuromi" mood="hehe" size={72} animated={false} />
				<h2 class="done-title">All caught up!</h2>
				<p class="done-sub">
					{reviewedToday} card{reviewedToday !== 1 ? 's' : ''} reviewed today.
				</p>
				<p class="done-hint">New reviews unlock tomorrow.</p>
				<span class="done-arrow" aria-hidden="true">
					<Doodle name="arrow-down-33" size={22} color="var(--color-teal-deep)" tilt={-6} />
				</span>
				<div class="done-actions">
					<a class="done-cta done-cta-primary r-pill offset-pill tappable" href={resolve('/match')}
						>Try Match</a
					>
					<a class="done-cta done-cta-secondary r-pill offset-pill tappable" href={resolve('/')}
						>Home</a
					>
				</div>
			</div>
		</div>
	{:else if currentCard}
		<!-- PROGRESS -->
		<div class="progress-row">
			<Pill variant="lavender" size="sm">{currentIndex + 1}/{queue.length}</Pill>
			<div class="progress-track">
				<div class="progress-fill" style="width: {(currentIndex / queue.length) * 100}%"></div>
			</div>
			<Pill variant="rose" size="sm">{reviewedToday} today</Pill>
			<span class="progress-doodle" aria-hidden="true">
				<Doodle name="shape-swirl-loops-4" size={36} color="var(--color-rose-deep)" tilt={-8} />
			</span>
		</div>

		<!-- CARD -->
		<section class="review-card r-card edge-ink offset-card" aria-label="review card">
			<div class="sparkle">
				<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={-6} />
			</div>

			<div class="card-front">
				<div class="card-pos">
					<Pill variant="kuromi" size="sm">{currentCard.pos}</Pill>
				</div>
				<div class="card-dutch-row">
					<div class="card-dutch">{currentCard.dutch}</div>
					<div class="speaker-group">
						<SpeakerButton text={currentCard.sentence_nl} />
						<SpeakerButton text={currentCard.sentence_nl} slow />
					</div>
				</div>
				<div class="card-sentence">
					{#if highlight}
						{highlight.before}<WordHighlight word={highlight.word} />{highlight.after}
					{:else}
						{currentCard.sentence_nl}
					{/if}
				</div>
			</div>

			{#if revealed}
				<div class="card-back">
					<div class="card-english">{currentCard.english}</div>
					<div class="card-sentence-en">{currentCard.sentence_en}</div>
				</div>
			{/if}
		</section>

		{#if !revealed}
			<button class="show-btn r-pill edge-ink offset-pill tappable" onclick={reveal}>
				Show Answer
			</button>
		{:else}
			<div class="rating-hint">How well did you remember it?</div>
			<div class="rating-row">
				{#each ['again', 'hard', 'good', 'easy'] as const as rating (rating)}
					<button
						class="rate-btn r-pill offset-pill tappable"
						style="--rating-tint: {RATING_COLORS[rating]}; --rating-ink: {RATING_INK[rating]}"
						data-rating={rating}
						onclick={() => rate(rating)}
					>
						<span class="rate-label">{rating}</span>
						<span class="rate-hint">{RATING_HINT[rating]}</span>
					</button>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.cards-page {
		padding: 0.5rem 0;
		min-width: 0;
		overflow-x: clip;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50vh;
		color: var(--color-muted-ink);
		font-family: var(--font-sans);
		font-size: var(--text-base);
	}

	.done-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		padding: 12px 0;
		text-align: center;
	}

	.done-card {
		position: relative;
		padding: 32px 28px;
		max-width: 340px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.done-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-teal-deep);
		letter-spacing: 0.04em;
		margin: 0;
	}

	.done-sub {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-text);
		margin: 0;
	}

	.done-hint {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-teal-deep);
		margin: 8px 0 0;
	}

	.done-arrow {
		display: inline-flex;
		margin-top: 4px;
		line-height: 0;
	}

	.done-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 20px;
	}

	.done-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 22px;
		text-decoration: none;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border: none;
		cursor: pointer;
	}

	.done-cta-primary {
		background: var(--color-rose-deep);
		color: var(--color-cream);
	}

	.done-cta-secondary {
		background: color-mix(in srgb, white 88%, transparent);
		border: 2px solid var(--color-ink);
		color: var(--color-ink);
	}

	.progress-row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		min-width: 0;
	}

	.progress-track {
		flex: 1;
		min-width: 0;
		height: 8px;
		background: color-mix(in srgb, var(--color-lavender) 20%, white);
		border: 1.5px solid var(--color-ink);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-lavender-deep);
		border-radius: 999px;
		transition: width 0.3s ease;
	}

	.progress-doodle {
		position: absolute;
		right: -4px;
		top: -18px;
		pointer-events: none;
		line-height: 0;
		opacity: 0.9;
	}

	.review-card {
		position: relative;
		overflow: visible;
		margin-bottom: 20px;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 24px 20px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.sparkle {
		position: absolute;
		top: -8px;
		right: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.card-front {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.card-dutch {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: 0.02em;
		word-break: break-word;
		min-width: 0;
	}

	.card-dutch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-width: 0;
	}

	.speaker-group {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.card-sentence {
		font-family: var(--font-sans);
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--color-text);
		word-break: break-word;
	}

	.card-back {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 2px dashed var(--color-ink);
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.card-english {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 600;
		color: var(--color-lavender-deep);
		word-break: break-word;
	}

	.card-sentence-en {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-muted-ink);
		font-style: italic;
		word-break: break-word;
	}

	.show-btn {
		width: 100%;
		padding: 16px;
		background: var(--color-rose-deep);
		color: var(--color-cream);
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.rating-hint {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		text-align: center;
		margin-bottom: 8px;
	}

	.rating-row {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 8px;
		min-width: 0;
	}

	.rate-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		padding: 14px 6px;
		min-width: 0;
		background: color-mix(in srgb, var(--rating-tint) 55%, white);
		border: 2.5px solid var(--color-ink);
		cursor: pointer;
		color: var(--rating-ink);
	}

	.rate-label {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: inherit;
	}

	.rate-hint {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 600;
		color: var(--color-muted-ink);
		letter-spacing: 0.06em;
		text-transform: lowercase;
	}
</style>
