import { describe, expect, it } from 'vitest';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import { EVIDENCE_BY_ID, evidenceOf } from './evidence';
import { enqueueMiss, trainingPassages } from './eval';
import { LIVE_PASS, passedSitting, pickMockExam, practiceYears, yearStudied } from './mock';
import { MOVE_BY_ID, moveOf, MOVES } from './moves';
import { looksLikeWordCopy } from './wordCopy';

const questionIds = LEZEN_EXAMS.flatMap((exam) =>
	exam.passages.flatMap((passage) => passage.questions.map((question) => question.id))
);

describe('moves and evidence', () => {
	it('covers every exam question once, and nothing else', () => {
		expect(Object.keys(MOVE_BY_ID).sort()).toEqual([...questionIds].sort());
		expect(Object.keys(EVIDENCE_BY_ID).sort()).toEqual([...questionIds].sort());
		for (const exam of LEZEN_EXAMS) {
			for (const passage of exam.passages) {
				for (const question of passage.questions) {
					expect(MOVES).toContain(moveOf(question.id));
					const needle = evidenceOf(question.id);
					expect(needle.length).toBeGreaterThanOrEqual(40);
					expect(passage.text.split(needle).length - 1).toBe(1);
					for (const option of Object.values(question.options)) {
						expect(needle).not.toBe(option);
					}
				}
			}
		}
	});
});

describe('trainingPassages', () => {
	it('is 2024 and 2025, and hides 2023', () => {
		const years = new Set(trainingPassages().map((passage) => passage.year));
		expect(years).toEqual(new Set([2024, 2025]));
		for (const passage of trainingPassages()) {
			for (const question of passage.questions) {
				expect(question.id.startsWith('lezen-2023-')).toBe(false);
			}
		}
	});
});

describe('pickMockExam', () => {
	it('seals 2023 once for a prediction, and never hides 2024', () => {
		expect(pickMockExam([])?.year).toBe(2023);
		expect(pickMockExam([2024])?.year).toBe(2023);
		expect(pickMockExam([2023])).toBeNull();
		expect(pickMockExam([], true)).toBeNull();
		expect(practiceYears([], false)).toEqual([2025, 2024]);
		expect(practiceYears([2023], false)).toEqual([2025, 2024, 2023]);
		expect(passedSitting(21)).toBe(false);
		expect(passedSitting(LIVE_PASS)).toBe(true);
		expect(yearStudied(2024, { 'lezen-2024-3': { correct: true } })).toBe(true);
		expect(yearStudied(2023, {})).toBe(false);
		expect(yearStudied(2025, {}, { 'lezen-2025-1': true })).toBe(true);
	});
});

describe('misses', () => {
	it('stores that question id, not a coalesced trap type', () => {
		const misses = enqueueMiss([], 'lezen-2025-2', 'B');
		expect(misses).toEqual([{ questionId: 'lezen-2025-2', picked: 'B', seen: false }]);
		expect(misses[0]).not.toHaveProperty('trap');
		expect(enqueueMiss(misses, 'lezen-2025-2', 'A')).toHaveLength(1);
	});
});

describe('looksLikeWordCopy', () => {
	it('is true when a long word repeats and false for stopwords only', () => {
		expect(
			looksLikeWordCopy(
				'het timmerman blijft thuis',
				'Ruud Kaag is timmerman en werkt bij zijn huidige werkgever.'
			)
		).toBe(true);
		expect(
			looksLikeWordCopy('omdat hij dat niet wil', 'omdat hij dat niet wil doen in de bouw')
		).toBe(false);
	});
});
