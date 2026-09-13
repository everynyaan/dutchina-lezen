import { describe, it, expect } from 'vitest';
import { GATE1_WORD_ID_SET, GATE1_WORD_IDS } from './gate1Allowlist';
import { generateDailySession } from '$lib/daily/generator';
import { selectQuestionIds, type QuizSourceData } from '$lib/quiz/generator';
import { WORD_POOL } from '$lib/data/wordPool';
import { getWordsForGate } from './gates';
import {
	browseCaption,
	examYearsForBrowse,
	GRAMMAR_G1_CARD_IDS,
	grammarChaptersForBrowse,
	homeworkGateIgnoringBrowse,
	schrijvenTasksForBrowse,
	storiesForBrowse,
	vocabUnlockLabel,
	wordsForBrowse,
	wordsInCategoryForBrowse
} from './browse';

function gate1QuizData(): QuizSourceData {
	const allowlist = getWordsForGate(1);
	return {
		rustyWords: [],
		candidateWords: allowlist,
		allWords: WORD_POOL,
		conversationPool: [],
		lezenPool: []
	};
}

describe('browse filter defaults to the current room', () => {
	it('vocab default for current=1 is ⊆ G1 allowlist, not WORD_POOL', () => {
		const words = wordsForBrowse(1);
		expect(words.map((w) => w.id).sort()).toEqual([...GATE1_WORD_IDS].sort());
		expect(words.length).toBeLessThan(WORD_POOL.length);
		for (const w of words) {
			expect(GATE1_WORD_ID_SET.has(w.id)).toBe(true);
		}
	});

	it('selecting gate 4 can show later words', () => {
		const g4 = wordsForBrowse(4);
		expect(g4.length).toBeGreaterThan(0);
		expect(g4.some((w) => !GATE1_WORD_ID_SET.has(w.id))).toBe(true);
		expect(g4.length).not.toBe(WORD_POOL.length);
	});

	it('category lists stay inside the browsed room', () => {
		const food = wordsInCategoryForBrowse('food-drink', 1);
		expect(food.every((w) => GATE1_WORD_ID_SET.has(w.id))).toBe(true);
		const laterFood = wordsInCategoryForBrowse('food-drink', 4);
		expect(laterFood.some((w) => !GATE1_WORD_ID_SET.has(w.id)) || laterFood.length === 0).toBe(
			true
		);
	});

	it('G1 stories are empty; G2+ lookup can show Olly', () => {
		expect(storiesForBrowse(1)).toEqual([]);
		expect(storiesForBrowse(2).length).toBeGreaterThan(0);
	});

	it('G1 grammar is beginner chapters/cards only; G4 lookup is the full handbook', () => {
		const g1 = grammarChaptersForBrowse(1);
		const g4 = grammarChaptersForBrowse(4);
		expect(g1.length).toBeGreaterThan(0);
		expect(g1.length).toBeLessThan(g4.length);
		expect(g1.every((ch) => ['word-order', 'present-tense', 'pronunciation'].includes(ch.id))).toBe(
			true
		);
		const g1Cards = g1.flatMap((ch) => ch.cards);
		expect(g1Cards.length).toBeGreaterThan(0);
		expect(g1Cards.every((card) => GRAMMAR_G1_CARD_IDS.has(card.id))).toBe(true);
		expect(g1Cards.some((card) => card.id === 'g_word_order_inversion')).toBe(false);
		expect(g1Cards.some((card) => card.id === 'g_word_order_subclause')).toBe(false);
		expect(g1Cards.some((card) => card.id === 'g_present_jij_inversion')).toBe(false);
	});

	it('later-gate vocab lookup copy is unlock, current-gate default is not', () => {
		expect(vocabUnlockLabel(1, 1)).toBeNull();
		expect(vocabUnlockLabel(2, 2)).toBeNull();
		expect(vocabUnlockLabel(2, 1)).toBe('Unlocks at Gate 2');
		expect(vocabUnlockLabel(4, 1)).toBe('Unlocks at Gate 4');
	});

	it('schrijven default G1 is practice rank 0, not exam years', () => {
		const g1 = schrijvenTasksForBrowse(1);
		expect(g1.length).toBeGreaterThan(0);
		expect(g1.every((t) => t.year === 0 && t.rank === 0)).toBe(true);
		expect(examYearsForBrowse(1)).toEqual([]);
		const g4 = schrijvenTasksForBrowse(4);
		expect(g4.some((t) => t.year === 2025)).toBe(true);
		expect(examYearsForBrowse(4)).toEqual([2025, 2024, 2023]);
	});

	it('looking-around copy does not claim unlock', () => {
		const ahead = browseCaption(4, 1, 'words');
		expect(ahead.toLowerCase()).toContain('looking around');
		expect(ahead.toLowerCase()).toContain("isn't unlocked");
		expect(ahead).toContain('Homework stays on Gate 1');
		const here = browseCaption(1, 1, 'words');
		expect(here).toContain("This room's words");
	});
});

describe('generators ignore the browse filter', () => {
	it('homeworkGateIgnoringBrowse always returns the engine gate', () => {
		expect(homeworkGateIgnoringBrowse(1, 4)).toBe(1);
		expect(homeworkGateIgnoringBrowse(2, 1)).toBe(2);
	});

	it('G1 quiz + week-set stay allowlist match/recall even if browse is 4', () => {
		const browse = 4;
		const engine = homeworkGateIgnoringBrowse(1, browse);
		const session = generateDailySession(0, undefined, engine);
		expect(session.every((q) => q.type === 'match' || q.type === 'recall')).toBe(true);
		for (const q of session) {
			if (q.type === 'match' || q.type === 'recall') {
				expect(GATE1_WORD_ID_SET.has(q.wordId)).toBe(true);
			}
		}
		const ids = selectQuestionIds(gate1QuizData(), 'domi|2026-08-29|browse');
		expect(ids.every((id) => id.startsWith('match:') || id.startsWith('recall:'))).toBe(true);
		expect(ids.some((id) => id.startsWith('lezen:'))).toBe(false);
	});
});
