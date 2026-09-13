// ============================================================
// DUTCHINA BOSS FIGHT ENGINE
// Pure functions. No Svelte dependency. No state reads/writes.
//
// Responsibilities:
// - Create a fight for a given boss rank
// - Generate question rounds from WORD_POOL at runtime
// - Generate transformation/error_identification from handcrafted pool
// - Check answers (MC selection or typed production)
// - Apply answers (damage boss or lose strike)
// ============================================================

import type { WordEntry } from '$lib/data/wordPool';
import type { BossQuestion, BossQuestionType, BossRoundChoice, BossFightState } from './types';
import { BOSS_HP, DAMAGE, MAX_STRIKES, getQuestionTypes } from './constants';
import { getHandcraftedQuestions } from './bossContent';

// ============================================================
// FIGHT CREATION
// ============================================================

export function createFight(bossRank: number): BossFightState {
	const hp = BOSS_HP[bossRank] ?? 50;
	return {
		bossRank,
		bossMaxHp: hp,
		bossHp: hp,
		playerStrikes: MAX_STRIKES,
		maxStrikes: MAX_STRIKES,
		round: 1,
		usedWordIds: new Set<string>(),
		status: 'fighting'
	};
}

// ============================================================
// ROUND GENERATION
// ============================================================

/**
 * Generate a round with two question options of different types.
 * Domi picks one to answer. Questions draw from the boss's rank pool.
 */
export function generateRound(fight: BossFightState, pool: WordEntry[]): BossRoundChoice | null {
	const rankPool = pool.filter((w) => w.rank === fight.bossRank);
	if (rankPool.length < 4) return null; // need at least 4 for distractors

	// Pick two different question types, rotating through available types for this rank
	const types = pickTwoTypes(fight.round, fight.bossRank);

	const optionA = generateQuestion(types[0], fight.bossRank, rankPool, pool, fight.usedWordIds);
	const optionB = generateQuestion(types[1], fight.bossRank, rankPool, pool, fight.usedWordIds);

	if (!optionA || !optionB) return null;

	return { optionA, optionB };
}

/**
 * Pick two different question types for a round.
 * Rotates through types available for this rank.
 */
function pickTwoTypes(round: number, rank: number): [BossQuestionType, BossQuestionType] {
	const types = getQuestionTypes(rank);
	const len = types.length;
	const i = (round - 1) % len;
	const j = round % len;

	// If same index (shouldn't happen with 3+ types), offset
	if (i === j) {
		return [types[i], types[(i + 1) % len]];
	}
	return [types[i], types[j]];
}

// ============================================================
// QUESTION GENERATION
// ============================================================

function generateQuestion(
	type: BossQuestionType,
	rank: number,
	rankPool: WordEntry[],
	fullPool: WordEntry[],
	usedIds: Set<string>
): BossQuestion | null {
	// Handcrafted types: pull from static content pool
	if (type === 'transformation' || type === 'error_identification') {
		return generateHandcrafted(type, rank, usedIds);
	}

	// WORD_POOL types: pick a target word not yet used in this fight
	const available = rankPool.filter((w) => !usedIds.has(w.id));
	if (available.length === 0) return null;

	const target = available[Math.floor(Math.random() * available.length)];

	switch (type) {
		case 'multiple_choice':
			return generateMultipleChoice(target, rankPool, fullPool);
		case 'sentence_completion':
			return generateSentenceCompletion(target, rankPool, fullPool);
		case 'production':
			return generateProduction(target);
	}
}

/**
 * Generate a transformation or error_identification question from the handcrafted pool.
 */
function generateHandcrafted(
	type: 'transformation' | 'error_identification',
	rank: number,
	usedIds: Set<string>
): BossQuestion | null {
	const pool = getHandcraftedQuestions(rank, type);
	const available = pool.filter((q) => !usedIds.has(q.id));
	if (available.length === 0) return null;

	const picked = available[Math.floor(Math.random() * available.length)];

	return {
		type,
		prompt: picked.prompt,
		correctAnswer: picked.options[picked.correctIndex],
		options: picked.options,
		correctIndex: picked.correctIndex,
		damage: DAMAGE[type],
		wordId: picked.id
	};
}

/**
 * Multiple choice: show a Dutch word, pick the correct English translation.
 */
function generateMultipleChoice(
	target: WordEntry,
	rankPool: WordEntry[],
	fullPool: WordEntry[]
): BossQuestion {
	const distractors = pickDistractorTranslations(target, rankPool, fullPool, 3);
	const options = shuffle([target.english, ...distractors]);
	const correctIndex = options.indexOf(target.english);

	return {
		type: 'multiple_choice',
		prompt: target.dutch,
		correctAnswer: target.english,
		options,
		correctIndex,
		damage: DAMAGE.multiple_choice,
		wordId: target.id
	};
}

/**
 * Sentence completion: show Dutch sentence with target word blanked, pick the word.
 */
function generateSentenceCompletion(
	target: WordEntry,
	rankPool: WordEntry[],
	fullPool: WordEntry[]
): BossQuestion {
	// Blank out the target word in the sentence
	const blanked = blankOutWord(target.sentence_nl, target.dutch);

	// Get distractor Dutch words (prefer same POS if possible)
	const distractorWords = pickDistractorDutchWords(target, rankPool, fullPool, 3);
	const options = shuffle([target.dutch, ...distractorWords]);
	const correctIndex = options.indexOf(target.dutch);

	return {
		type: 'sentence_completion',
		prompt: blanked,
		correctAnswer: target.dutch,
		options,
		correctIndex,
		damage: DAMAGE.sentence_completion,
		wordId: target.id
	};
}

/**
 * Production: show English meaning, Domi types the Dutch word.
 */
function generateProduction(target: WordEntry): BossQuestion {
	return {
		type: 'production',
		prompt: target.english,
		correctAnswer: target.dutch,
		damage: DAMAGE.production,
		wordId: target.id
	};
}

// ============================================================
// ANSWER CHECKING
// ============================================================

/**
 * Check if an answer is correct.
 * For MC/sentence_completion: compare selected option string.
 * For production: case-insensitive, trimmed. Strict, no fuzzy.
 */
export function checkAnswer(question: BossQuestion, answer: string): boolean {
	if (question.type === 'production') {
		return normalize(answer) === normalize(question.correctAnswer);
	}
	// MC and sentence_completion: exact option match
	return answer === question.correctAnswer;
}

function normalize(s: string): string {
	return s
		.trim()
		.toLowerCase()
		.replace(/^[.,:;!?'"]+|[.,:;!?'"]+$/g, '');
}

// ============================================================
// APPLY ANSWER
// ============================================================

/**
 * Apply an answer result to the fight state.
 * Returns a new state (immutable pattern).
 */
export function applyAnswer(
	fight: BossFightState,
	correct: boolean,
	damage: number,
	wordId: string
): BossFightState {
	const newUsed = new Set(fight.usedWordIds);
	newUsed.add(wordId);

	if (correct) {
		const newHp = Math.max(0, fight.bossHp - damage);
		const won = newHp === 0;
		return {
			...fight,
			bossHp: newHp,
			round: fight.round + 1,
			usedWordIds: newUsed,
			status: won ? 'won' : 'fighting'
		};
	} else {
		const newStrikes = fight.playerStrikes - 1;
		const lost = newStrikes === 0;
		return {
			...fight,
			playerStrikes: newStrikes,
			round: fight.round + 1,
			usedWordIds: newUsed,
			status: lost ? 'lost' : 'fighting'
		};
	}
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Blank out the target word in a Dutch sentence.
 * Case-insensitive match. Falls back to appending blank if not found.
 */
export function blankOutWord(sentence: string, word: string): string {
	// Try word boundary match first
	const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
	if (regex.test(sentence)) {
		return sentence.replace(regex, '______');
	}
	// Fallback: case-insensitive indexOf
	const idx = sentence.toLowerCase().indexOf(word.toLowerCase());
	if (idx !== -1) {
		return sentence.slice(0, idx) + '______' + sentence.slice(idx + word.length);
	}
	// If word not found in sentence (data issue), append blank
	return sentence + ' [______]';
}

/**
 * Pick N distractor English translations from the pool.
 * Same rank preferred, then adjacent, then any.
 */
function pickDistractorTranslations(
	target: WordEntry,
	rankPool: WordEntry[],
	fullPool: WordEntry[],
	count: number
): string[] {
	const used = new Set([target.english.toLowerCase()]);
	const result: string[] = [];

	// Same rank first
	const sameRank = shuffle(rankPool.filter((w) => w.id !== target.id));
	for (const w of sameRank) {
		if (result.length >= count) break;
		if (!used.has(w.english.toLowerCase())) {
			result.push(w.english);
			used.add(w.english.toLowerCase());
		}
	}

	// Adjacent ranks if needed
	if (result.length < count) {
		const adjacent = shuffle(
			fullPool.filter((w) => w.id !== target.id && Math.abs(w.rank - target.rank) <= 1)
		);
		for (const w of adjacent) {
			if (result.length >= count) break;
			if (!used.has(w.english.toLowerCase())) {
				result.push(w.english);
				used.add(w.english.toLowerCase());
			}
		}
	}

	// Any rank as last resort
	if (result.length < count) {
		const any = shuffle(fullPool.filter((w) => w.id !== target.id));
		for (const w of any) {
			if (result.length >= count) break;
			if (!used.has(w.english.toLowerCase())) {
				result.push(w.english);
				used.add(w.english.toLowerCase());
			}
		}
	}

	return result;
}

/**
 * Pick N distractor Dutch words from the pool.
 * Prefers same POS for sentence_completion (grammatically plausible distractors).
 */
function pickDistractorDutchWords(
	target: WordEntry,
	rankPool: WordEntry[],
	fullPool: WordEntry[],
	count: number
): string[] {
	const used = new Set([target.dutch.toLowerCase()]);
	const result: string[] = [];

	// Same rank, same POS first
	const samePOS = shuffle(rankPool.filter((w) => w.id !== target.id && w.pos === target.pos));
	for (const w of samePOS) {
		if (result.length >= count) break;
		if (!used.has(w.dutch.toLowerCase())) {
			result.push(w.dutch);
			used.add(w.dutch.toLowerCase());
		}
	}

	// Same rank, any POS
	if (result.length < count) {
		const sameRank = shuffle(rankPool.filter((w) => w.id !== target.id));
		for (const w of sameRank) {
			if (result.length >= count) break;
			if (!used.has(w.dutch.toLowerCase())) {
				result.push(w.dutch);
				used.add(w.dutch.toLowerCase());
			}
		}
	}

	// Adjacent ranks
	if (result.length < count) {
		const adjacent = shuffle(
			fullPool.filter((w) => w.id !== target.id && Math.abs(w.rank - target.rank) <= 1)
		);
		for (const w of adjacent) {
			if (result.length >= count) break;
			if (!used.has(w.dutch.toLowerCase())) {
				result.push(w.dutch);
				used.add(w.dutch.toLowerCase());
			}
		}
	}

	return result;
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shuffle<T>(arr: T[]): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}
