// ============================================================
// DUTCHINA MATCH ENGINE
// Pure functions for the Match module.
//
// Responsibilities:
// - Select a target word (75% current rank, 25% lower ranks)
// - Generate 3 same-rank distractors
// - Build a question object with sentence, target, and 4 options
// - Track streak (pips lit)
// - Determine daily completion state
//
// This module does NOT read or write state. It does NOT fire SFX
// or LP events. The UI component does that.
// ============================================================

import type { WordEntry } from '$lib/data/wordPool';

export const DAILY_TARGET = 20;
const DISTRACTOR_COUNT = 3;
const CURRENT_RANK_WEIGHT = 0.75; // 75% chance of picking from current rank

// ============================================================
// QUESTION TYPE
// ============================================================

export interface MatchQuestion {
	/** The target word entry */
	target: WordEntry;
	/** 4 shuffled options (1 correct + 3 distractors). Each is an English translation. */
	options: MatchOption[];
	/** The Dutch sentence with the target word present */
	sentenceNl: string;
}

export interface MatchOption {
	text: string;
	wordId: string;
	isCorrect: boolean;
}

// ============================================================
// WORD SELECTION
// ============================================================

/**
 * Pick a target word from the pool based on rank weighting.
 * 75% chance of current rank, 25% chance of a lower rank.
 * Avoids repeating recently shown words (via recentIds set).
 */
export function pickTargetWord(
	pool: WordEntry[],
	currentRank: number,
	recentIds: Set<string>,
	options?: { fromEntirePool?: boolean }
): WordEntry | null {
	if (pool.length === 0) return null;

	const currentRankWords = pool.filter((w) => w.rank === currentRank);
	const lowerRankWords = pool.filter((w) => w.rank < currentRank);

	// Decide which pool to draw from
	let candidates: WordEntry[];
	if (options?.fromEntirePool || currentRankWords.length === 0) {
		candidates = pool;
	} else if (lowerRankWords.length === 0 || Math.random() < CURRENT_RANK_WEIGHT) {
		candidates = currentRankWords;
	} else {
		candidates = lowerRankWords;
	}

	// Filter out recent words
	let filtered = candidates.filter((w) => !recentIds.has(w.id));

	// If all candidates are recent, reset and use full pool
	if (filtered.length === 0) {
		filtered = candidates;
	}

	return filtered[Math.floor(Math.random() * filtered.length)];
}

// ============================================================
// DISTRACTOR SELECTION
// ============================================================

/**
 * Pick distractor words for a Match question.
 *
 * Priority cascade — each tier only kicks in if the prior tier
 * couldn't fill DISTRACTOR_COUNT:
 *   1. same rank + same POS  (most plausible — same difficulty AND
 *      same part of speech, so the English translations are
 *      grammatically symmetric)
 *   2. same POS, adjacent ranks  (still plausible — POS match
 *      keeps options symmetric even if difficulty drifts ±1)
 *   3. same rank, any POS  (drops POS symmetry when same-POS pool
 *      is exhausted)
 *   4. any word  (last resort)
 *
 * The POS filter prevents the original failure mode where a target
 * verb could draw noun distractors, making the English-translation
 * options trivially distinguishable.
 *
 * Never includes the target word itself.
 * Returns exactly DISTRACTOR_COUNT words, or fewer if the entire
 * pool is too small.
 */
export function pickDistractors(pool: WordEntry[], target: WordEntry): WordEntry[] {
	// Tier 1: same rank AND same POS
	let candidates = pool.filter(
		(w) => w.rank === target.rank && w.pos === target.pos && w.id !== target.id
	);

	// Tier 2: same POS, adjacent ranks (excludes same rank to avoid duplicates)
	if (candidates.length < DISTRACTOR_COUNT) {
		const sameposAdjacent = pool.filter(
			(w) =>
				w.id !== target.id &&
				w.pos === target.pos &&
				w.rank !== target.rank &&
				Math.abs(w.rank - target.rank) <= 1
		);
		candidates = [...candidates, ...sameposAdjacent];
	}

	// Tier 3: same rank, any POS (drops POS symmetry)
	if (candidates.length < DISTRACTOR_COUNT) {
		const sameRankAnyPos = pool.filter(
			(w) => w.rank === target.rank && w.pos !== target.pos && w.id !== target.id
		);
		candidates = [...candidates, ...sameRankAnyPos];
	}

	// Tier 4: any word
	if (candidates.length < DISTRACTOR_COUNT) {
		const anyOther = pool.filter((w) => w.id !== target.id);
		candidates = [...candidates, ...anyOther];
	}

	// Dedupe (later tiers may overlap with earlier ones once we cross
	// the threshold from too-thin to plenty), then shuffle and slice.
	const seen = new Set<string>();
	const unique: WordEntry[] = [];
	for (const w of candidates) {
		if (seen.has(w.id)) continue;
		seen.add(w.id);
		unique.push(w);
	}
	return shuffle(unique).slice(0, DISTRACTOR_COUNT);
}

// ============================================================
// QUESTION BUILDING
// ============================================================

/**
 * Build a complete match question.
 */
export function buildQuestion(
	pool: WordEntry[],
	currentRank: number,
	recentIds: Set<string>,
	pickOpts?: { fromEntirePool?: boolean }
): MatchQuestion | null {
	const target = pickTargetWord(pool, currentRank, recentIds, pickOpts);
	if (!target) return null;

	const distractors = pickDistractors(pool, target);

	const options: MatchOption[] = [
		{ text: target.english, wordId: target.id, isCorrect: true },
		...distractors.map((d) => ({
			text: d.english,
			wordId: d.id,
			isCorrect: false
		}))
	];

	return {
		target,
		options: shuffle(options),
		sentenceNl: target.sentence_nl
	};
}

// ============================================================
// STREAK
// ============================================================

/**
 * Calculate streak pips lit (0 to 5).
 * Each consecutive correct answer lights one pip.
 * A wrong answer resets to 0.
 */
export function updateStreak(currentStreak: number, correct: boolean): number {
	if (correct) {
		return Math.min(currentStreak + 1, 5);
	}
	return 0;
}

// ============================================================
// DAILY STATE
// ============================================================

/**
 * Get today's date as YYYY-MM-DD in the user's local timezone.
 */
export function getTodayDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Check if the daily count should reset (new day since last match).
 */
export function shouldResetDaily(lastMatchDate: string | null): boolean {
	if (!lastMatchDate) return true;
	return lastMatchDate !== getTodayDate();
}

/**
 * Whether the daily target has been met.
 */
export function isDailyTargetMet(completedToday: number): boolean {
	return completedToday >= DAILY_TARGET;
}

// ============================================================
// HIGHLIGHT HELPER
// ============================================================

/**
 * Find the target word in the Dutch sentence and return
 * the sentence split into parts for highlighting.
 * Returns { before, word, after } or null if not found.
 */
export function highlightWord(
	sentence: string,
	dutchWord: string
): { before: string; word: string; after: string } | null {
	// Case-insensitive search for the word as a whole word
	const regex = new RegExp(`\\b(${escapeRegex(dutchWord)})\\b`, 'i');
	const match = regex.exec(sentence);
	if (!match || match.index === undefined) {
		// Try without word boundary (some Dutch words have special chars)
		const idx = sentence.toLowerCase().indexOf(dutchWord.toLowerCase());
		if (idx === -1) return null;
		return {
			before: sentence.slice(0, idx),
			word: sentence.slice(idx, idx + dutchWord.length),
			after: sentence.slice(idx + dutchWord.length)
		};
	}
	return {
		before: sentence.slice(0, match.index),
		word: match[0],
		after: sentence.slice(match.index + match[0].length)
	};
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================
// SHUFFLE (Fisher-Yates)
// ============================================================

function shuffle<T>(arr: T[]): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}
