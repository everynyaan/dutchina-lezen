// ============================================================
// DUTCHINA BOSS FIGHT CONSTANTS
// HP curve, damage values, boss names.
// ============================================================

import type { BossQuestionType } from './types';

export const BOSS_HP: Record<number, number> = {
	0: 50,
	1: 70,
	2: 90,
	3: 110,
	4: 120,
	5: 135,
	6: 145,
	7: 160
};

export const DAMAGE: Record<BossQuestionType, number> = {
	production: 25,
	sentence_completion: 15,
	multiple_choice: 10,
	transformation: 20,
	error_identification: 10
};

export const MAX_STRIKES = 3;

// Per-question timer in seconds. null = no timer (untimed).
// Ranks 0-2 are untimed to let Domi think while learning.
// Timer starts when a question type is chosen, not during the choice phase.
// Expiry = automatic wrong answer (lose a strike).
export const BOSS_TIMER: Record<number, number | null> = {
	0: null,
	1: null,
	2: null,
	3: 30,
	4: 25,
	5: 20,
	6: 18,
	7: 15
};

// Boss names per rank.
export const BOSS_NAMES: Record<number, string> = {
	0: 'Cat Gogh',
	1: 'Dutchina Cattatina',
	2: 'Hell Kitty',
	3: 'Huggie Bear',
	4: 'Lalo Salamanca',
	5: 'John Wheelchair',
	6: 'Papier Raccoon',
	7: 'Kitten De Oranje'
};

// Human-readable labels for question types shown on choice cards.
export const TYPE_LABELS: Record<BossQuestionType, { name: string; desc: string }> = {
	production: { name: 'PRODUCTION', desc: 'Type the Dutch word' },
	sentence_completion: { name: 'FILL THE GAP', desc: 'Pick the missing word' },
	multiple_choice: { name: 'TRANSLATE', desc: 'Pick the correct translation' },
	transformation: { name: 'TRANSFORM', desc: 'Pick the correct rewrite' },
	error_identification: { name: 'SPOT THE ERROR', desc: 'Find the grammar mistake' }
};

// Base types available at all ranks.
const BASE_TYPES: BossQuestionType[] = ['production', 'sentence_completion', 'multiple_choice'];

// Extended types available at rank 2+.
const EXTENDED_TYPES: BossQuestionType[] = [
	'production',
	'sentence_completion',
	'multiple_choice',
	'transformation',
	'error_identification'
];

/**
 * Get the available question types for a given rank.
 * Ranks 0-1: 3 base types (vocab only).
 * Ranks 2+: 5 types including grammar-based questions.
 */
export function getQuestionTypes(rank: number): BossQuestionType[] {
	return rank >= 2 ? EXTENDED_TYPES : BASE_TYPES;
}

// Kept for backwards compat with tests, but prefer getQuestionTypes(rank).
export const ALL_QUESTION_TYPES: BossQuestionType[] = EXTENDED_TYPES;
