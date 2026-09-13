import type { CardReviewEntry } from '$lib/db/db';
import type { WordEntry } from '$lib/data/wordPool';

export const MASTERED_INTERVAL_DAYS = 21; // A card is "learned" at this interval. Matches the /vocab route mastery line.
export const NOT_SOON_DAYS = 14; // Scheduled further out than this counts as "not coming back soon".
export const UNTOUCHED_DAYS = 30; // Untouched at least this long counts as neglected.

/**
 * Whole days from fromIso to toIso, both 'YYYY-MM-DD'.
 * Negative if toIso is earlier. UTC-based calendar-day diff only.
 */
export function daysBetween(fromIso: string, toIso: string): number {
	const [fy, fm, fd] = fromIso.split('-').map(Number);
	const [ty, tm, td] = toIso.split('-').map(Number);
	const fromMs = Date.UTC(fy, fm - 1, fd);
	const toMs = Date.UTC(ty, tm - 1, td);
	return (toMs - fromMs) / (1000 * 60 * 60 * 24);
}

/**
 * True if this card has gone rusty as of today ('YYYY-MM-DD').
 * Learned (interval >= 21) AND either not scheduled back soon OR neglected.
 */
export function isRusty(review: CardReviewEntry, today: string): boolean {
	if (review.interval < MASTERED_INTERVAL_DAYS) return false;
	return (
		daysBetween(today, review.nextReviewDate) > NOT_SOON_DAYS ||
		daysBetween(review.lastReviewDate, today) >= UNTOUCHED_DAYS
	);
}

/**
 * The rustiest words first, capped at limit. Deterministic for a given input.
 * Reviews whose wordId is absent from pool are skipped.
 * Order: days-since-lastReviewDate DESC, then wordId ASC.
 */
export function getRustyWords(
	reviews: CardReviewEntry[],
	pool: WordEntry[],
	today: string,
	limit: number
): WordEntry[] {
	const poolById = new Map<string, WordEntry>();
	for (const word of pool) {
		poolById.set(word.id, word);
	}

	const rusty: CardReviewEntry[] = [];
	for (const review of reviews) {
		if (!poolById.has(review.wordId)) continue;
		if (isRusty(review, today)) {
			rusty.push(review);
		}
	}

	rusty.sort((a, b) => {
		const daysA = daysBetween(a.lastReviewDate, today);
		const daysB = daysBetween(b.lastReviewDate, today);
		if (daysB !== daysA) return daysB - daysA;
		if (a.wordId < b.wordId) return -1;
		if (a.wordId > b.wordId) return 1;
		return 0;
	});

	const result: WordEntry[] = [];
	const capped = limit < rusty.length ? limit : rusty.length;
	for (let i = 0; i < capped; i++) {
		result.push(poolById.get(rusty[i].wordId)!);
	}
	return result;
}
