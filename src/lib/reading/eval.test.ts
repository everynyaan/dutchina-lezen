import { describe, expect, it } from 'vitest';
import { classifyTrap } from './traps';
import { buildDailyEval, cardFromMiss } from './eval';
import { pickMockExam, passedMock, PASS_SCORE } from './mock';

describe('classifyTrap', () => {
	it('tags hoofdonderwerp from doel questions', () => {
		expect(classifyTrap('Wat is het doel van deze tekst?')).toBe('hoofdonderwerp');
	});
	it('tags bron-doel from source questions', () => {
		expect(classifyTrap('Wat voor organisatie is Jeurissen?')).toBe('bron-doel');
	});
	it('falls back to bijna-goed', () => {
		expect(classifyTrap('Wat vindt Ruud van medische onderzoeken in de bouwsector?')).toBe(
			'bijna-goed'
		);
	});
});

describe('buildDailyEval', () => {
	it('is stable for a given date', () => {
		const a = buildDailyEval('2026-09-13');
		const b = buildDailyEval('2026-09-13');
		expect(a.passageSlug).toBe(b.passageSlug);
		expect(a.questionIds).toEqual(b.questionIds);
		expect(a.gistOptions).toHaveLength(3);
		expect(a.gistOptions).toContain(a.gistAnswer);
		expect(a.questionIds.length).toBeGreaterThanOrEqual(1);
	});

	it('changes passage across days', () => {
		const a = buildDailyEval('2026-09-13');
		const b = buildDailyEval('2026-09-20');
		expect(a.passageSlug === b.passageSlug && a.questionIds[0] === b.questionIds[0]).toBe(false);
	});
});

describe('cardFromMiss', () => {
	it('builds a trap card from a real lezen id, not a translation prompt', () => {
		const evalState = buildDailyEval('2026-09-13');
		const card = cardFromMiss({
			questionId: evalState.questionIds[0],
			picked: 'A',
			today: '2026-09-13'
		});
		expect(card).not.toBeNull();
		expect(card!.question.length).toBeGreaterThan(8);
		expect(card!.snippet.length).toBeGreaterThan(20);
		expect(card!.question.toLowerCase()).not.toContain('english');
	});
});

describe('mock', () => {
	it('uses a real paper and pass line 22', () => {
		const exam = pickMockExam('2026-09-13');
		expect(exam.passages.length).toBe(6);
		expect(exam.passages.reduce((n, p) => n + p.questions.length, 0)).toBeGreaterThanOrEqual(30);
		expect(passedMock(21)).toBe(false);
		expect(passedMock(PASS_SCORE)).toBe(true);
	});
});
