import { describe, it, expect } from 'vitest';
import type { WordEntry } from '$lib/data/wordPool';
import { GATE1_WORD_ID_SET } from '$lib/gates/gate1Allowlist';
import { generateDailySession, homeworkQuestionId } from '$lib/daily/generator';
import { getWordsForGate } from '$lib/gates/gates';
import { WORD_POOL } from '$lib/data/wordPool';
import type { QuizSourceData } from './generator';
import {
	SWAP_CAP,
	applyHomeworkSwap,
	applyQuizSwap,
	emptySwaps,
	mergeSwaps,
	pickQuizReplacementId,
	swapsForToday,
	undoHomeworkSwap,
	undoQuizSwap
} from './swap';

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

function makeData(): QuizSourceData {
	const words = [word('w1'), word('w2'), word('w3'), word('w4'), word('w5'), word('w6'), word('w7')];
	return {
		rustyWords: words.slice(0, 3),
		candidateWords: words,
		allWords: words,
		conversationPool: [],
		lezenPool: [
			{
				question: {
					id: 'lq1',
					vraag: 1,
					question: 'Q?',
					options: { A: 'a', B: 'b', C: 'c' },
					answer: 'A'
				},
				passageName: 'P',
				passageText: 'Title\n\nBody.'
			}
		]
	};
}

describe('swap ledger', () => {
	it('resets used on a new calendar day', () => {
		const stale = { date: '2026-08-28', used: 3, swappedOutIds: ['match:w1'] };
		const today = swapsForToday(stale, '2026-08-29');
		expect(today.used).toBe(0);
		expect(today.swappedOutIds).toEqual([]);
		expect(today.date).toBe('2026-08-29');
	});

	it('merge keeps local ids and max(used)', () => {
		const local = { date: '2026-08-29', used: 1, swappedOutIds: ['match:a'] };
		const remote = { date: '2026-08-29', used: 3, swappedOutIds: ['match:b'] };
		const merged = mergeSwaps(local, remote, '2026-08-29');
		expect(merged.used).toBe(3);
		expect(merged.swappedOutIds).toEqual(['match:a']);
	});
});

describe('daily quiz swap', () => {
	const today = '2026-08-29';
	const seed = 'domi|2026-08-29';

	it('splices one unanswered id and does not regenerate the rest', () => {
		const data = makeData();
		const questionIds = ['match:w1', 'match:w2', 'recall:w3', 'match:w4', 'recall:w5'];
		const result = applyQuizSwap({
			questionIds,
			index: 0,
			results: {},
			completed: false,
			swaps: emptySwaps(),
			today,
			gate: 1,
			data,
			seed
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.previousId).toBe('match:w1');
		expect(result.questionIds[0]).not.toBe('match:w1');
		expect(result.questionIds[0].startsWith('match:')).toBe(true);
		expect(result.questionIds.slice(1)).toEqual(questionIds.slice(1));
		expect(result.swaps.used).toBe(1);
		expect(result.swaps.swappedOutIds).toEqual(['match:w1']);
	});

	it('refuses answered, completed, and a fourth swap', () => {
		const data = makeData();
		const base = {
			questionIds: ['match:w1', 'match:w2', 'recall:w3', 'match:w4', 'recall:w5'],
			index: 1,
			today,
			gate: 1 as const,
			data,
			seed
		};
		const answered = applyQuizSwap({
			...base,
			results: { 'match:w2': false },
			completed: false,
			swaps: emptySwaps()
		});
		expect(answered.ok).toBe(false);
		if (!answered.ok) expect(answered.reason).toBe('answered');
		const done = applyQuizSwap({ ...base, results: {}, completed: true, swaps: emptySwaps() });
		expect(done.ok).toBe(false);
		if (!done.ok) expect(done.reason).toBe('completed');
		const capped = applyQuizSwap({
			...base,
			results: {},
			completed: false,
			swaps: { date: today, used: SWAP_CAP, swappedOutIds: ['a', 'b', 'c'] }
		});
		expect(capped.ok).toBe(false);
		if (!capped.ok) expect(capped.reason).toBe('capped');
	});

	it('leftover lezen: in G1 becomes gate-appropriate match/recall', () => {
		const allow = getWordsForGate(1);
		const data: QuizSourceData = {
			rustyWords: [],
			candidateWords: allow,
			allWords: WORD_POOL,
			conversationPool: [],
			lezenPool: []
		};
		const id = pickQuizReplacementId(
			'lezen:lezen-2024-1',
			['match:w0353'],
			[],
			data,
			1,
			'seed|swap|0'
		);
		expect(id).toBeTruthy();
		expect(id!.startsWith('match:') || id!.startsWith('recall:')).toBe(true);
		expect(id!.startsWith('lezen:')).toBe(false);
		expect(GATE1_WORD_ID_SET.has(id!.slice(id!.indexOf(':') + 1))).toBe(true);
	});

	it('undo restores the previous id and refunds one used', () => {
		const data = makeData();
		const questionIds = ['match:w1', 'match:w2', 'recall:w3', 'match:w4', 'recall:w5'];
		const swapped = applyQuizSwap({
			questionIds,
			index: 0,
			results: {},
			completed: false,
			swaps: emptySwaps(),
			today,
			gate: 1,
			data,
			seed
		});
		expect(swapped.ok).toBe(true);
		if (!swapped.ok) return;
		const undone = undoQuizSwap(
			swapped.questionIds,
			0,
			swapped.swaps,
			swapped.previousId,
			today
		);
		expect(undone.questionIds[0]).toBe('match:w1');
		expect(undone.swaps.used).toBe(0);
		expect(undone.swaps.swappedOutIds).toEqual([]);
	});
});

describe('week-set swap', () => {
	it('replaces leftover exam items in G1 with match/recall and splices', () => {
		const session = generateDailySession(0, undefined, 1);
		expect(session.length).toBeGreaterThan(5);
		const fakeExam: (typeof session)[number] = {
			type: 'lezen',
			questionId: 'lezen-stale-1',
			excerpt: 'x',
			fullPassage: 'x',
			passageName: 'p',
			question: 'q',
			options: { A: 'a', B: 'b', C: 'c' },
			answer: 'A'
		};
		const questions = session.slice();
		questions[2] = fakeExam;
		const result = applyHomeworkSwap({
			questions,
			index: 2,
			results: {},
			completed: false,
			swaps: emptySwaps(),
			today: '2026-08-29',
			gate: 1,
			rank: 0
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.questions[2].type === 'match' || result.questions[2].type === 'recall').toBe(
			true
		);
		expect(result.questions[0]).toEqual(questions[0]);
		expect(result.questions[1]).toEqual(questions[1]);
		if (result.questions[2].type === 'match' || result.questions[2].type === 'recall') {
			expect(GATE1_WORD_ID_SET.has(result.questions[2].wordId)).toBe(true);
		}
		const undone = undoHomeworkSwap(
			result.questions,
			2,
			result.swaps,
			result.previous,
			result.previousId,
			'2026-08-29'
		);
		expect(homeworkQuestionId(undone.questions[2])).toBe('lezen:lezen-stale-1');
		expect(undone.swaps.used).toBe(0);
	});

	it('does not reopen a completed week set', () => {
		const session = generateDailySession(0, undefined, 1);
		const result = applyHomeworkSwap({
			questions: session,
			index: 0,
			results: {},
			completed: true,
			swaps: emptySwaps(),
			today: '2026-08-29',
			gate: 1,
			rank: 0
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('completed');
	});
});
