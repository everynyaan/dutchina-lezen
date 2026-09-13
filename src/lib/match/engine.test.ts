import { describe, it, expect } from 'vitest';
import {
	pickTargetWord,
	pickDistractors,
	buildQuestion,
	updateStreak,
	highlightWord,
	shouldResetDaily,
	isDailyTargetMet,
	DAILY_TARGET
} from '$lib/match/engine';
import type { WordEntry } from '$lib/data/wordPool';

function makeWord(id: string, rank: number, dutch = 'test', english = 'test_en'): WordEntry {
	return {
		id,
		dutch,
		english,
		pos: 'n',
		rank,
		category: 'misc',
		sentence_nl: `Dit is ${dutch}.`,
		sentence_en: `This is ${english}.`
	};
}

const POOL: WordEntry[] = [
	// Rank 0: 5 words
	makeWord('w001', 0, 'huis', 'house'),
	makeWord('w002', 0, 'auto', 'car'),
	makeWord('w003', 0, 'boom', 'tree'),
	makeWord('w004', 0, 'kat', 'cat'),
	makeWord('w005', 0, 'hond', 'dog'),
	// Rank 1: 5 words
	makeWord('w006', 1, 'stad', 'city'),
	makeWord('w007', 1, 'land', 'country'),
	makeWord('w008', 1, 'rivier', 'river'),
	makeWord('w009', 1, 'berg', 'mountain'),
	makeWord('w010', 1, 'zee', 'sea')
];

describe('pickTargetWord', () => {
	it('returns a word from the pool', () => {
		const word = pickTargetWord(POOL, 1, new Set());
		expect(word).not.toBeNull();
		expect(POOL.some((w) => w.id === word!.id)).toBe(true);
	});

	it('avoids recently shown words', () => {
		const recent = new Set(['w006', 'w007', 'w008', 'w009']);
		// With 4 of 5 rank-1 words blocked, should pick w010 or a rank-0 word
		const word = pickTargetWord(POOL, 1, recent);
		expect(word).not.toBeNull();
		expect(recent.has(word!.id)).toBe(false);
	});

	it('falls back to full pool when all are recent', () => {
		const allIds = new Set(POOL.map((w) => w.id));
		const word = pickTargetWord(POOL, 1, allIds);
		// Should still return something (falls back)
		expect(word).not.toBeNull();
	});

	it('returns null when pool has no words for current rank and no lower ranks', () => {
		const word = pickTargetWord([], 0, new Set());
		expect(word).toBeNull();
	});
});

describe('pickDistractors', () => {
	it('returns 3 distractors from the same rank', () => {
		const target = POOL[5]; // rank 1
		const distractors = pickDistractors(POOL, target);
		expect(distractors.length).toBe(3);
		// None should be the target
		expect(distractors.every((d) => d.id !== target.id)).toBe(true);
	});

	it('never includes the target word', () => {
		for (const target of POOL) {
			const distractors = pickDistractors(POOL, target);
			expect(distractors.every((d) => d.id !== target.id)).toBe(true);
		}
	});
});

// ============================================================
// POS-AWARE DISTRACTOR SELECTION
// Verifies that pickDistractors prefers same-POS words over
// same-rank cross-POS words, preventing the failure mode where
// a target verb is drawn against noun distractors (which makes
// the English options trivially distinguishable).
// ============================================================
describe('pickDistractors POS preference', () => {
	function w(id: string, rank: number, pos: string, dutch = id, english = id + '_en'): WordEntry {
		return {
			id,
			dutch,
			english,
			pos,
			rank,
			category: 'misc',
			sentence_nl: `Dit is ${dutch}.`,
			sentence_en: `This is ${english}.`
		};
	}

	const MIXED_POOL: WordEntry[] = [
		// Rank 0 verbs (>= DISTRACTOR_COUNT so the same-POS tier suffices)
		w('v1', 0, 'v', 'lopen', 'walk'),
		w('v2', 0, 'v', 'eten', 'eat'),
		w('v3', 0, 'v', 'drinken', 'drink'),
		w('v4', 0, 'v', 'slapen', 'sleep'),
		w('v5', 0, 'v', 'lezen', 'read'),
		// Rank 0 nouns — distractor candidates that the OLD logic
		// would happily pick because they're at the same rank.
		w('n1', 0, 'n', 'huis', 'house'),
		w('n2', 0, 'n', 'auto', 'car'),
		w('n3', 0, 'n', 'boom', 'tree'),
		w('n4', 0, 'n', 'kat', 'cat')
	];

	it('returns only same-POS distractors when the same-POS pool is rich enough', () => {
		const target = MIXED_POOL[0]; // verb 'lopen'
		const distractors = pickDistractors(MIXED_POOL, target);
		expect(distractors.length).toBe(3);
		expect(distractors.every((d) => d.pos === target.pos)).toBe(true);
	});

	it('falls back to adjacent-rank same-POS before crossing POS boundaries', () => {
		// Only 2 rank-0 verbs available — fewer than DISTRACTOR_COUNT.
		// Add 3 rank-1 verbs so the adjacent-rank+same-POS tier (T2)
		// can finish the job without dropping into the cross-POS tier.
		const thinPool: WordEntry[] = [
			w('v1', 0, 'v', 'lopen', 'walk'),
			w('v2', 0, 'v', 'eten', 'eat'),
			w('v6', 1, 'v', 'rennen', 'run'),
			w('v7', 1, 'v', 'schrijven', 'write'),
			w('v8', 1, 'v', 'kijken', 'watch'),
			w('n1', 0, 'n', 'huis', 'house'),
			w('n2', 0, 'n', 'auto', 'car'),
			w('n3', 0, 'n', 'boom', 'tree'),
			w('n4', 0, 'n', 'kat', 'cat')
		];
		const target = thinPool[0]; // verb 'lopen' at rank 0
		const distractors = pickDistractors(thinPool, target);
		expect(distractors.length).toBe(3);
		// All distractors should be verbs even though plenty of nouns
		// were available at the same rank.
		expect(distractors.every((d) => d.pos === 'v')).toBe(true);
	});

	it('crosses POS only when same-POS pool is exhausted at all adjacent ranks', () => {
		// Single verb in the entire pool, no other verbs anywhere.
		const verbStarvedPool: WordEntry[] = [
			w('v1', 0, 'v', 'lopen', 'walk'),
			w('n1', 0, 'n', 'huis', 'house'),
			w('n2', 0, 'n', 'auto', 'car'),
			w('n3', 0, 'n', 'boom', 'tree'),
			w('n4', 0, 'n', 'kat', 'cat')
		];
		const target = verbStarvedPool[0];
		const distractors = pickDistractors(verbStarvedPool, target);
		expect(distractors.length).toBe(3);
		// All distractors are nouns — same-POS tier was empty, T2 was
		// empty (no rank-1 verbs), so we land on T3 (same rank, any POS).
		expect(distractors.every((d) => d.pos === 'n')).toBe(true);
	});

	it('never duplicates a candidate when fallback tiers overlap', () => {
		const target = MIXED_POOL[0];
		const distractors = pickDistractors(MIXED_POOL, target);
		const ids = distractors.map((d) => d.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('buildQuestion', () => {
	it('builds a question with 4 options', () => {
		const q = buildQuestion(POOL, 1, new Set());
		expect(q).not.toBeNull();
		expect(q!.options.length).toBe(4);
	});

	it('has exactly one correct option', () => {
		const q = buildQuestion(POOL, 0, new Set());
		expect(q).not.toBeNull();
		const correctCount = q!.options.filter((o) => o.isCorrect).length;
		expect(correctCount).toBe(1);
	});

	it('correct option matches the target word', () => {
		const q = buildQuestion(POOL, 0, new Set());
		expect(q).not.toBeNull();
		const correct = q!.options.find((o) => o.isCorrect);
		expect(correct!.text).toBe(q!.target.english);
	});
});

describe('updateStreak', () => {
	it('increments on correct', () => {
		expect(updateStreak(0, true)).toBe(1);
		expect(updateStreak(3, true)).toBe(4);
	});

	it('caps at 5', () => {
		expect(updateStreak(5, true)).toBe(5);
	});

	it('resets to 0 on wrong', () => {
		expect(updateStreak(4, false)).toBe(0);
		expect(updateStreak(0, false)).toBe(0);
	});
});

describe('highlightWord', () => {
	it('splits sentence around the target word', () => {
		const result = highlightWord('Het huis is groot.', 'huis');
		expect(result).not.toBeNull();
		expect(result!.before).toBe('Het ');
		expect(result!.word).toBe('huis');
		expect(result!.after).toBe(' is groot.');
	});

	it('handles word at start of sentence', () => {
		const result = highlightWord('Huis staat daar.', 'Huis');
		expect(result).not.toBeNull();
		expect(result!.before).toBe('');
		expect(result!.word).toBe('Huis');
	});

	it('handles case-insensitive match', () => {
		const result = highlightWord('Het Huis is groot.', 'huis');
		expect(result).not.toBeNull();
		expect(result!.word).toBe('Huis');
	});

	it('returns null when word not found', () => {
		const result = highlightWord('Dit is een test.', 'xyz');
		expect(result).toBeNull();
	});
});

describe('daily tracking', () => {
	it('shouldResetDaily returns true for null date', () => {
		expect(shouldResetDaily(null)).toBe(true);
	});

	it('shouldResetDaily returns true for yesterday', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const dateStr = yesterday.toISOString().slice(0, 10);
		expect(shouldResetDaily(dateStr)).toBe(true);
	});

	it('isDailyTargetMet is true at DAILY_TARGET', () => {
		expect(isDailyTargetMet(DAILY_TARGET)).toBe(true);
		expect(isDailyTargetMet(DAILY_TARGET - 1)).toBe(false);
		expect(isDailyTargetMet(DAILY_TARGET + 5)).toBe(true);
	});
});
