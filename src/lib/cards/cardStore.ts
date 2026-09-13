// ============================================================
// DUTCHINA CARD STORE
// Manages card review state in IndexedDB via Dexie.
//
// Responsibilities:
// - Load due cards for today
// - Load new (unseen) cards for today's session
// - Save review results (with firstSeenDate tracking)
// - Build the review queue (due cards first, then new cards)
// - Derive "new cards introduced today" from Dexie, not from
//   component state, so it survives tab switches and reloads.
// ============================================================

import { getDb, type CardReviewEntry } from '$lib/db/db';
import { createNewCardSchedule, getTodayDate, schedule, type CardRating } from './srs';
import type { WordEntry } from '$lib/data/wordPool';

// ============================================================
// LOAD REVIEW QUEUE
// ============================================================

/**
 * Build the review queue for today's session.
 * Returns: due cards (need review) + new cards (never seen), in that order.
 *
 * New card count is derived from Dexie (cards with firstSeenDate === today),
 * NOT passed in as a parameter. This means reloads and tab switches
 * correctly resume where the user left off.
 */
export async function loadReviewQueue(
	pool: WordEntry[],
	newCardsPerDay: number
): Promise<{ due: WordEntry[]; newCards: WordEntry[]; newCardsIntroducedToday: number }> {
	const today = getTodayDate();

	// Get all card review records
	const allReviews = await getDb().cardReviews.toArray();
	const reviewMap = new Map(allReviews.map((r) => [r.wordId, r]));

	// How many new cards were already introduced today?
	// A card was "introduced today" if its firstSeenDate === today.
	const newCardsIntroducedToday = allReviews.filter((r) => r.firstSeenDate === today).length;

	// Due cards: have a review record AND nextReviewDate <= today
	const poolIds = new Set(pool.map((w) => w.id));
	const dueWords: WordEntry[] = [];
	for (const review of allReviews) {
		if (review.nextReviewDate <= today && poolIds.has(review.wordId)) {
			const word = pool.find((w) => w.id === review.wordId);
			if (word) dueWords.push(word);
		}
	}

	// New cards: in the pool but never reviewed
	const unseenWords = pool.filter((w) => !reviewMap.has(w.id));

	// Limit new cards to the daily allowance minus already introduced
	const remainingNewSlots = Math.max(0, newCardsPerDay - newCardsIntroducedToday);
	const newCards = unseenWords.slice(0, remainingNewSlots);

	return { due: dueWords, newCards, newCardsIntroducedToday };
}

// ============================================================
// SAVE REVIEW
// ============================================================

/**
 * Record a review result for a card.
 * Creates a new entry if the card has never been reviewed,
 * or updates the existing entry. Sets firstSeenDate on first review.
 *
 * Returns the entry that was written to Dexie, so callers can
 * mirror it into state.cardReviews for cross-device sync.
 */
export async function saveReview(wordId: string, rating: CardRating): Promise<CardReviewEntry> {
	const today = getTodayDate();

	// Load existing review or create fresh
	const existing = await getDb().cardReviews.get(wordId);

	const current = existing
		? {
				interval: existing.interval,
				easeFactor: existing.easeFactor,
				repetitions: existing.repetitions
			}
		: createNewCardSchedule();

	const result = schedule(current, rating, today);

	const entry: CardReviewEntry = {
		wordId,
		interval: result.interval,
		easeFactor: result.easeFactor,
		repetitions: result.repetitions,
		nextReviewDate: result.nextReviewDate,
		lastReviewDate: today,
		// Preserve firstSeenDate if it exists, otherwise set to today
		firstSeenDate: existing?.firstSeenDate ?? today
	};

	await getDb().cardReviews.put(entry);

	return entry;
}

// ============================================================
// STATS
// ============================================================

/**
 * Get the total number of cards that have been reviewed at least once.
 */
export async function getReviewedCount(): Promise<number> {
	return await getDb().cardReviews.count();
}

/**
 * Get the number of cards due today (across all ranks).
 */
export async function getDueCount(): Promise<number> {
	const today = getTodayDate();
	return await getDb().cardReviews.where('nextReviewDate').belowOrEqual(today).count();
}

/**
 * Get the total number of cards available for today's session.
 * This includes due cards (SRS review) plus remaining new card slots.
 */
export async function getAvailableCardCount(
	pool: WordEntry[],
	newCardsPerDay: number
): Promise<number> {
	const today = getTodayDate();
	const allReviews = await getDb().cardReviews.toArray();
	const reviewMap = new Map(allReviews.map((r) => [r.wordId, r]));

	// Due cards: have a review record AND nextReviewDate <= today
	const poolIds = new Set(pool.map((w) => w.id));
	let dueCount = 0;
	for (const review of allReviews) {
		if (review.nextReviewDate <= today && poolIds.has(review.wordId)) {
			dueCount++;
		}
	}

	// New cards remaining: slots minus already introduced today
	const newToday = allReviews.filter((r) => r.firstSeenDate === today).length;
	const remainingNew = Math.max(0, newCardsPerDay - newToday);
	const unseenCount = pool.filter((w) => !reviewMap.has(w.id)).length;
	const newAvailable = Math.min(remainingNew, unseenCount);

	return dueCount + newAvailable;
}

/**
 * Get the number of cards reviewed today (lastReviewDate === today).
 * Derived from Dexie, survives tab switches and reloads.
 */
export async function getReviewedTodayCount(): Promise<number> {
	const today = getTodayDate();
	const allReviews = await getDb().cardReviews.toArray();
	return allReviews.filter((r) => r.lastReviewDate === today).length;
}
