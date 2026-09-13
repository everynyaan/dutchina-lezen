import { describe, it, expect } from 'vitest';
import type { WordEntry } from '$lib/data/wordPool';
import type { ConversationQuestion } from '$lib/conversation/types';
import type { LezenQuestion } from '$lib/lezen/types';
import {
	selectQuestionIds,
	buildQuestions,
	type QuizSourceData,
	type QuizConversationSource,
	type QuizLezenSource
} from './generator';

function word(id: string, overrides: Partial<WordEntry> = {}): WordEntry {
	return {
		id,
		dutch: `nl-${id}`,
		english: `en-${id}`,
		pos: 'noun',
		rank: 1,
		category: 'misc',
		sentence_nl: `Zin met ${id}.`,
		sentence_en: `Sentence with ${id}.`,
		...overrides
	};
}

function makeConv(id: string): QuizConversationSource {
	const question: ConversationQuestion = {
		id,
		text: `Vraag ${id}?`,
		options: ['A', 'B', 'C', 'D'],
		correctIndex: 1
	};
	return {
		question,
		chapterId: `ch-${id}`,
		chapterText: `Title ${id}\n\nParagraph one about ${id}.\n\nParagraph two.`
	};
}

function makeLezen(id: string): QuizLezenSource {
	const question: LezenQuestion = {
		id,
		vraag: 1,
		question: `What about ${id}?`,
		options: { A: 'opt A', B: 'opt B', C: 'opt C' },
		answer: 'B'
	};
	return {
		question,
		passageName: `Passage ${id}`,
		passageText: `Heading ${id}\n\nBody paragraph for ${id}.\n\nMore text.`
	};
}

function makeData(overrides: Partial<QuizSourceData> = {}): QuizSourceData {
	const words = [
		word('w1', { pos: 'noun', rank: 1 }),
		word('w2', { pos: 'verb', rank: 1 }),
		word('w3', { pos: 'noun', rank: 1 }),
		word('w4', { pos: 'adj', rank: 1 }),
		word('w5', { pos: 'noun', rank: 2 }),
		word('w6', { pos: 'verb', rank: 2 }),
		word('w7', { pos: 'noun', rank: 0 }),
		word('w8', { pos: 'verb', rank: 0 })
	];
	return {
		rustyWords: [words[0], words[1], words[2]],
		candidateWords: words,
		allWords: words,
		conversationPool: [makeConv('cq1'), makeConv('cq2')],
		lezenPool: [makeLezen('lq1'), makeLezen('lq2')],
		...overrides
	};
}

describe('selectQuestionIds', () => {
	it('is deterministic for the same (data, seed)', () => {
		const data = makeData();
		const seed = 'profile|2026-08-15';
		const a = selectQuestionIds(data, seed);
		const b = selectQuestionIds(data, seed);
		expect(a).toEqual(b);
	});

	it('yields a different selection for a different date in the seed', () => {
		const data = makeData();
		// Expand pools so sampling has room to differ across seeds.
		const bigData = makeData({
			rustyWords: [],
			candidateWords: Array.from({ length: 20 }, (_, i) =>
				word(`cw${i}`, { pos: i % 2 === 0 ? 'noun' : 'verb', rank: i % 3 })
			),
			allWords: Array.from({ length: 20 }, (_, i) =>
				word(`cw${i}`, { pos: i % 2 === 0 ? 'noun' : 'verb', rank: i % 3 })
			),
			conversationPool: Array.from({ length: 8 }, (_, i) => makeConv(`cq${i}`)),
			lezenPool: Array.from({ length: 8 }, (_, i) => makeLezen(`lq${i}`))
		});
		const a = selectQuestionIds(bigData, 'profile|2026-08-15');
		const b = selectQuestionIds(bigData, 'profile|2026-08-16');
		// With large pools, different seeds almost always differ; still use bigData.
		// Fall back to asserting at least one of the random slots can differ when pools are large.
		expect(a).not.toEqual(b);
		// Keep the original data path sanity-checked too.
		void data;
	});

	it('tops up short rusty supply from candidateWords with distinct wordIds', () => {
		const words = [word('only-rusty'), word('c1'), word('c2'), word('c3'), word('c4')];
		const data = makeData({
			rustyWords: [words[0]],
			candidateWords: words.slice(1),
			allWords: words
		});
		const ids = selectQuestionIds(data, 'p|2026-01-01');
		const wordIds = ids
			.filter((id) => id.startsWith('match:') || id.startsWith('recall:'))
			.map((id) => id.split(':')[1]);
		expect(wordIds).toHaveLength(3);
		expect(new Set(wordIds).size).toBe(3);
		expect(wordIds).toContain('only-rusty');
	});

	it('tops up empty conversation/lezen pools with extra match/recall', () => {
		const data = makeData({
			conversationPool: [],
			lezenPool: []
		});
		const ids = selectQuestionIds(data, 'p|2026-01-01');
		expect(ids).toHaveLength(5);
		expect(ids[0].startsWith('match:')).toBe(true);
		expect(ids[1].startsWith('match:')).toBe(true);
		expect(ids[2].startsWith('recall:')).toBe(true);
		expect(ids.every((id) => id.startsWith('match:') || id.startsWith('recall:'))).toBe(true);
		const questions = buildQuestions(ids, data, 'p|2026-01-01');
		expect(questions).toHaveLength(5);
	});

	it('starved later-gate allWords do not leak into in-gate match distractors', () => {
		const inGate = [
			word('g1a', { english: 'yes', rank: 0 }),
			word('g1b', { english: 'no', rank: 0 }),
			word('g1c', { english: 'you', rank: 0 }),
			word('g1d', { english: 'water', rank: 0 }),
			word('g1e', { english: 'book', rank: 0 })
		];
		const later = word('late-exam', { english: 'legislation', rank: 7, category: 'misc' });
		const data = makeData({
			rustyWords: [],
			candidateWords: inGate,
			allWords: [...inGate, later],
			conversationPool: [],
			lezenPool: []
		});
		const ids = selectQuestionIds(data, 'starve|pool');
		expect(ids.every((id) => id.startsWith('match:') || id.startsWith('recall:'))).toBe(true);
		const built = buildQuestions(ids, data, 'starve|pool');
		const inGateEnglish = new Set(inGate.map((w) => w.english));
		for (const entry of built) {
			if (entry.question.type === 'match') {
				for (const opt of entry.question.options) {
					expect(inGateEnglish.has(opt), `leaked distractor ${opt}`).toBe(true);
				}
				expect(entry.question.options).not.toContain('legislation');
			}
		}
	});

	it('returns composition match, match, recall, conv, lezen when pools are full', () => {
		const data = makeData();
		const ids = selectQuestionIds(data, 'p|2026-01-01');
		expect(ids).toHaveLength(5);
		expect(ids[0].startsWith('match:')).toBe(true);
		expect(ids[1].startsWith('match:')).toBe(true);
		expect(ids[2].startsWith('recall:')).toBe(true);
		expect(ids[3].startsWith('conv:')).toBe(true);
		expect(ids[4].startsWith('lezen:')).toBe(true);
	});
});

describe('selectQuestionIds focusCategories bias', () => {
	const seed = 'p|2026-03-01';

	it('biases rustyWords so in-focus categories are preferred over earlier out-of-focus words', () => {
		const words = [
			word('out1', { category: 'misc' }),
			word('out2', { category: 'misc' }),
			word('out3', { category: 'misc' }),
			word('focus1', { category: 'food-drink' }),
			word('focus2', { category: 'food-drink' }),
			word('focus3', { category: 'food-drink' })
		];
		const data = makeData({
			rustyWords: words,
			candidateWords: words,
			allWords: words
		});

		const unfocused = selectQuestionIds(data, seed);
		expect(unfocused.slice(0, 3)).toEqual(['match:out1', 'match:out2', 'recall:out3']);

		const focused = selectQuestionIds(data, seed, ['food-drink']);
		expect(focused.slice(0, 3)).toEqual(['match:focus1', 'match:focus2', 'recall:focus3']);
	});

	it('starvation guard: unknown focus category yields the same id count as no focus', () => {
		const data = makeData();
		const without = selectQuestionIds(data, seed);
		const withNonsense = selectQuestionIds(data, seed, ['definitely-not-a-real-category']);
		expect(without).toHaveLength(5);
		expect(withNonsense).toHaveLength(5);
		expect(withNonsense).toHaveLength(without.length);
	});

	it('empty focusCategories array behaves identically to omitting the argument', () => {
		const data = makeData();
		const without = selectQuestionIds(data, seed);
		const withEmpty = selectQuestionIds(data, seed, []);
		expect(withEmpty).toEqual(without);
	});

	it('a focus category with fewer than WORD_SLOTS words still fills all 3 word slots', () => {
		const words = [
			word('solo-focus', { category: 'food-drink' }),
			word('other1', { category: 'misc' }),
			word('other2', { category: 'misc' }),
			word('other3', { category: 'misc' })
		];
		const data = makeData({
			rustyWords: words,
			candidateWords: words,
			allWords: words
		});
		const ids = selectQuestionIds(data, seed, ['food-drink']);
		const wordIds = ids.filter((id) => id.startsWith('match:') || id.startsWith('recall:'));
		expect(wordIds).toHaveLength(3);
		expect(wordIds[0].startsWith('match:')).toBe(true);
		expect(wordIds[1].startsWith('match:')).toBe(true);
		expect(wordIds[2].startsWith('recall:')).toBe(true);
		expect(wordIds[0]).toBe('match:solo-focus');
	});

	it('is deterministic for the same (data, seed, focusCategories)', () => {
		const data = makeData();
		const focus = ['food-drink', 'home'];
		const a = selectQuestionIds(data, seed, focus);
		const b = selectQuestionIds(data, seed, focus);
		expect(a).toEqual(b);
	});
});

describe('selectQuestionIds focusCategories bias — candidate top-up path', () => {
	const seed = 'p|2026-04-01';

	it('biases the candidate top-up toward in-focus words (must FAIL pre-fix: sample() shuffles across the focus boundary)', () => {
		const inFocus = [
			word('cand-focus-1', { category: 'food-drink' }),
			word('cand-focus-2', { category: 'food-drink' }),
			word('cand-focus-3', { category: 'food-drink' })
		];
		const outOfFocus = [
			word('cand-out-1', { category: 'misc' }),
			word('cand-out-2', { category: 'misc' }),
			word('cand-out-3', { category: 'misc' }),
			word('cand-out-4', { category: 'misc' }),
			word('cand-out-5', { category: 'misc' })
		];
		// In-focus words placed LAST in the pool, so a plain shuffle-without-partition
		// has no reason to prefer them; only a real bias would pull them to the front.
		const candidateWords = [...outOfFocus, ...inFocus];
		const data = makeData({
			// Empty rustyWords forces every one of the 3 word slots through the
			// candidate top-up path — this is the path the defect lives in.
			rustyWords: [],
			candidateWords,
			allWords: candidateWords
		});

		const ids = selectQuestionIds(data, seed, ['food-drink']);
		const wordIds = ids
			.filter((id) => id.startsWith('match:') || id.startsWith('recall:'))
			.map((id) => id.split(':')[1]);

		expect(wordIds).toHaveLength(3);
		// In-focus supply (3) exactly meets demand (3 word slots), so a correct
		// bias must exhaust the in-focus group before drawing any out-of-focus word.
		for (const id of wordIds) {
			expect(inFocus.some((w) => w.id === id)).toBe(true);
		}
	});

	it('starvation guard on the top-up path: zero matching candidates still fills all 3 slots', () => {
		const outOfFocus = [
			word('c1', { category: 'misc' }),
			word('c2', { category: 'misc' }),
			word('c3', { category: 'misc' }),
			word('c4', { category: 'misc' })
		];
		const data = makeData({
			rustyWords: [],
			candidateWords: outOfFocus,
			allWords: outOfFocus
		});
		// No word anywhere in the pool belongs to 'food-drink'.
		const ids = selectQuestionIds(data, seed, ['food-drink']);
		const wordIds = ids.filter((id) => id.startsWith('match:') || id.startsWith('recall:'));
		expect(wordIds).toHaveLength(3);
	});

	it('is deterministic on the top-up path for the same (data, seed, focusCategories)', () => {
		const inFocus = [
			word('d-focus-1', { category: 'food-drink' }),
			word('d-focus-2', { category: 'food-drink' })
		];
		const outOfFocus = [
			word('d-out-1', { category: 'misc' }),
			word('d-out-2', { category: 'misc' }),
			word('d-out-3', { category: 'misc' })
		];
		const candidateWords = [...outOfFocus, ...inFocus];
		const data = makeData({
			rustyWords: [],
			candidateWords,
			allWords: candidateWords
		});
		const a = selectQuestionIds(data, seed, ['food-drink']);
		const b = selectQuestionIds(data, seed, ['food-drink']);
		expect(a).toEqual(b);
	});

	it('regression guard: unfocused top-up output is unchanged by the fix', () => {
		const words = [
			word('u1', { category: 'misc' }),
			word('u2', { category: 'food-drink' }),
			word('u3', { category: 'misc' }),
			word('u4', { category: 'food-drink' }),
			word('u5', { category: 'misc' })
		];
		const data = makeData({
			rustyWords: [],
			candidateWords: words,
			allWords: words
		});
		const noFocus = selectQuestionIds(data, seed);
		const emptyFocus = selectQuestionIds(data, seed, []);
		expect(emptyFocus).toEqual(noFocus);
		expect(
			noFocus.filter((id) => id.startsWith('match:') || id.startsWith('recall:'))
		).toHaveLength(3);
	});
});

describe('buildQuestions', () => {
	it('is stable for the same ids and seed', () => {
		const data = makeData();
		const seed = 'profile|2026-08-15';
		const ids = selectQuestionIds(data, seed);
		const a = buildQuestions(ids, data, seed);
		const b = buildQuestions(ids, data, seed);
		expect(a).toEqual(b);
		// Match questions carry option order + correctIndex
		const matchQs = a.filter((entry) => entry.question.type === 'match');
		expect(matchQs.length).toBe(2);
		for (const entry of matchQs) {
			if (entry.question.type === 'match') {
				expect(entry.question.options).toHaveLength(4);
				expect(entry.question.correctIndex).toBeGreaterThanOrEqual(0);
				expect(entry.question.correctIndex).toBeLessThan(4);
			}
		}
	});

	it('survives pool drift: empty rustyWords still rebuilds the same questions', () => {
		const data = makeData();
		const seed = 'profile|2026-08-15';
		const ids = selectQuestionIds(data, seed);
		const first = buildQuestions(ids, data, seed);
		const drifted: QuizSourceData = {
			...data,
			rustyWords: []
		};
		const second = buildQuestions(ids, drifted, seed);
		expect(second).toEqual(first);
	});

	it('buildQuestions keeps id and question pairs aligned when an id is unresolvable', () => {
		const data = makeData();
		const seed = 'profile|2026-08-15';
		const ids = ['match:w1', 'match:does-not-exist', 'recall:w2', 'conv:cq1', 'lezen:lq1'];
		const built = buildQuestions(ids, data, seed);

		// Unresolvable id is skipped entirely (not a null/undefined entry).
		expect(built.length).toBeLessThan(ids.length);
		expect(built.map((e) => e.id)).toEqual(['match:w1', 'recall:w2', 'conv:cq1', 'lezen:lq1']);

		// id/question pairs stay aligned; skips do not shift later keys.
		for (const entry of built) {
			if (entry.question.type === 'match' || entry.question.type === 'quiz-recall') {
				const wordIdSuffix = entry.id.slice(entry.id.indexOf(':') + 1);
				expect(wordIdSuffix).toBe(entry.question.wordId);
			}
		}
	});
});
