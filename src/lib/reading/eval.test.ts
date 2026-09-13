import { describe, expect, it } from 'vitest';
import { classifyTrap } from './traps';
import {
	buildDailyEval,
	cardFromMiss,
	cardFromGistMiss,
	coalesceTrapCards,
	resolveTrapDrill,
	upsertCard
} from './eval';
import { itemsForTrap, pickDrill } from './drills';
import { addDays } from './bank';
import { pickMockExam, passedMock, PASS_SCORE } from './mock';
import { EMPTY_READING_FORK } from './types';

describe('classifyTrap', () => {
	it('tags hoofdonderwerp from doel questions', () => {
		expect(classifyTrap('Wat is het doel van deze tekst?')).toBe('hoofdonderwerp');
	});
	it('tags bron-doel from source questions', () => {
		expect(classifyTrap('Wat voor organisatie is Jeurissen?')).toBe('bron-doel');
	});
	it('tags verwijzing from bedoeld-met stems', () => {
		expect(classifyTrap("Wat wordt bedoeld met 'gewenning' in deze tekst?")).toBe('verwijzing');
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

	it('caps at two real questions on one passage', () => {
		const a = buildDailyEval('2026-09-13');
		expect(a.questionIds.length).toBeLessThanOrEqual(2);
		expect(new Set(a.questionIds).size).toBe(a.questionIds.length);
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
		expect(card!.seenDrillIds).toContain(evalState.questionIds[0]);
	});

	it('mints hoofdonderwerp from a gist miss without inventing an exam item', () => {
		const evalState = buildDailyEval('2026-09-13');
		const card = cardFromGistMiss({
			passageSlug: evalState.passageSlug!,
			picked: 'wrong intro',
			today: '2026-09-13'
		});
		expect(card?.trap).toBe('hoofdonderwerp');
		expect(card?.questionId.startsWith('gist:')).toBe(true);
	});
});

describe('trap deck', () => {
	it('coalesces two misses of the same trap into one sticker', () => {
		const evalState = buildDailyEval('2026-09-13');
		const a = cardFromMiss({
			questionId: evalState.questionIds[0],
			picked: 'A',
			today: '2026-09-13'
		})!;
		const b = { ...a, questionId: 'lezen-2024-1', id: 'other' };
		const deck = upsertCard([a], b);
		expect(deck.filter((c) => c.trap === a.trap)).toHaveLength(1);
	});

	it('schedules a hit out and keeps a miss due today', () => {
		const evalState = buildDailyEval('2026-09-13');
		const card = cardFromMiss({
			questionId: evalState.questionIds[0],
			picked: 'A',
			today: '2026-09-13'
		})!;
		const hit = resolveTrapDrill([card], card.trap, true, '2026-09-13', 'lezen-2025-6');
		expect(hit[0].dueDate).toBe(addDays('2026-09-13', 1));
		const miss = resolveTrapDrill([card], card.trap, false, '2026-09-13', 'lezen-2025-6');
		expect(miss[0].dueDate).toBe('2026-09-13');
		expect(miss[0].seenDrillIds).toContain('lezen-2025-6');
	});
});

describe('pickDrill', () => {
	it('picks a new same-trap snippet, not the missed id, when the bank has one', () => {
		const pool = itemsForTrap('hoofdonderwerp');
		expect(pool.length).toBeGreaterThan(1);
		const miss = pool[0];
		const drill = pickDrill({
			trap: 'hoofdonderwerp',
			avoidIds: [miss.question.id],
			seed: '2026-09-13:test'
		});
		expect(drill.questionId).not.toBe(miss.question.id);
		expect(drill.trap).toBe('hoofdonderwerp');
		expect(drill.stemTrap).toBe('hoofdonderwerp');
		expect(drill.sameAsMiss).toBe(false);
		expect(drill.question.toLowerCase()).not.toContain('english');
		expect(drill.snippet.length).toBeGreaterThan(20);
	});

	it('does not invent options — every drill is a real bank item', () => {
		const types = ['verwijzing', 'hoofdonderwerp', 'bijna-goed', 'conclusie', 'bron-doel'] as const;
		for (const trap of types) {
			const drill = pickDrill({ trap, avoidIds: ['missing-id'], seed: `seed:${trap}` });
			expect(Object.keys(drill.options).length).toBeGreaterThanOrEqual(2);
			expect(drill.options[drill.answer]).toBeTruthy();
		}
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

describe('empty fork', () => {
	it('starts with no cards', () => {
		expect(EMPTY_READING_FORK.trapCards).toEqual([]);
		expect(coalesceTrapCards([])).toEqual([]);
	});
});
