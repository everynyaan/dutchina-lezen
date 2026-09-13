// ============================================================
// DUTCHINA SRS ENGINE
// SM-2 variant for spaced repetition scheduling.
// Pure functions. No side effects, no DB access.
//
// The caller (cardStore.ts) reads from Dexie, calls these
// functions, and writes back to Dexie.
// ============================================================

export type CardRating = 'again' | 'hard' | 'good' | 'easy';

export interface CardSchedule {
	interval: number; // days until next review
	easeFactor: number; // SM-2 ease factor
	repetitions: number; // consecutive correct reviews
	nextReviewDate: string; // ISO date YYYY-MM-DD
}

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

// ============================================================
// CORE SCHEDULING
// ============================================================

/**
 * Calculate the next schedule for a card given a rating.
 *
 * SM-2 variant:
 * - Again: reset to interval 1, reset repetitions, decrease ease
 * - Hard: interval * 1.2, slight ease decrease
 * - Good: standard SM-2 progression
 * - Easy: interval * ease * 1.3, slight ease increase
 */
export function schedule(
	current: { interval: number; easeFactor: number; repetitions: number },
	rating: CardRating,
	today: string
): CardSchedule {
	let interval: number;
	let easeFactor = current.easeFactor;
	let repetitions = current.repetitions;

	switch (rating) {
		case 'again':
			interval = 1;
			repetitions = 0;
			easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
			break;

		case 'hard':
			if (repetitions === 0) {
				interval = 1;
			} else if (repetitions === 1) {
				interval = 4;
			} else {
				interval = Math.ceil(current.interval * 1.2);
			}
			repetitions += 1;
			easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
			break;

		case 'good':
			if (repetitions === 0) {
				interval = 1;
			} else if (repetitions === 1) {
				interval = 6;
			} else {
				interval = Math.ceil(current.interval * easeFactor);
			}
			repetitions += 1;
			break;

		case 'easy':
			if (repetitions === 0) {
				interval = 4;
			} else if (repetitions === 1) {
				interval = 8;
			} else {
				interval = Math.ceil(current.interval * easeFactor * 1.3);
			}
			repetitions += 1;
			easeFactor = Math.min(3.0, easeFactor + 0.15);
			break;
	}

	const nextReviewDate = addDays(today, interval);

	return {
		interval,
		easeFactor,
		repetitions,
		nextReviewDate
	};
}

/**
 * Create a fresh schedule for a never-seen card.
 */
export function createNewCardSchedule(): {
	interval: number;
	easeFactor: number;
	repetitions: number;
} {
	return {
		interval: 0,
		easeFactor: DEFAULT_EASE,
		repetitions: 0
	};
}

// ============================================================
// DATE HELPERS
// ============================================================

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getTodayDate(): string {
	const now = new Date();
	return formatDate(now);
}

/**
 * Add N days to a YYYY-MM-DD date string and return the result.
 */
export function addDays(dateStr: string, days: number): string {
	const date = new Date(dateStr + 'T12:00:00'); // noon to avoid DST issues
	date.setDate(date.getDate() + days);
	return formatDate(date);
}

/**
 * Check if a date string is today or in the past (i.e., card is due).
 */
export function isDue(nextReviewDate: string, today: string): boolean {
	return nextReviewDate <= today;
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
