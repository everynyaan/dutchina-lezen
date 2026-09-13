import { describe, it, expect } from 'vitest';
import { generateDailySession, generateReplacementQuestion } from './generator';
import { GATE1_WORD_ID_SET } from '$lib/gates/gate1Allowlist';

describe('generateDailySession gate mix', () => {
	it('Gate 1 is only match/recall from the allowlist', () => {
		const session = generateDailySession(0, undefined, 1);
		expect(session.length).toBeGreaterThan(20);
		for (const q of session) {
			expect(q.type === 'match' || q.type === 'recall').toBe(true);
			if (q.type === 'match' || q.type === 'recall') {
				expect(GATE1_WORD_ID_SET.has(q.wordId)).toBe(true);
			}
		}
	});

	it('Gate 2 has no exam items', () => {
		const session = generateDailySession(2, undefined, 2);
		expect(session.some((q) => q.type === 'lezen' || q.type === 'luisteren')).toBe(false);
	});

	it('omitted gate fail-safes to Gate 1 (no NT2)', () => {
		const session = generateDailySession(6);
		expect(session.some((q) => q.type === 'lezen' || q.type === 'luisteren')).toBe(false);
	});

	it('Gate 4 may include NT2 exam items', () => {
		const session = generateDailySession(6, undefined, 4);
		expect(session.some((q) => q.type === 'lezen')).toBe(true);
		expect(session.some((q) => q.type === 'luisteren')).toBe(true);
	});

	it('starved conversation/lezen replacement on G1 stays allowlist match/recall', () => {
		const exclude = new Set<string>();
		const conv = generateReplacementQuestion('conversation', 0, 1, exclude);
		const lezen = generateReplacementQuestion('lezen', 0, 1, exclude);
		expect(conv).toBeTruthy();
		expect(lezen).toBeTruthy();
		for (const q of [conv, lezen]) {
			expect(q && (q.type === 'match' || q.type === 'recall')).toBe(true);
			if (q && (q.type === 'match' || q.type === 'recall')) {
				expect(GATE1_WORD_ID_SET.has(q.wordId)).toBe(true);
			}
		}
	});

	it('starved exam/story quotas on G1 stay in-gate match/recall', () => {
		const session = generateDailySession(
			0,
			{ match: 2, recall: 2, conversation: 8, lezen: 8, luisteren: 8 },
			1
		);
		expect(session.length).toBeGreaterThan(0);
		expect(session.every((q) => q.type === 'match' || q.type === 'recall')).toBe(true);
		for (const q of session) {
			if (q.type === 'match' || q.type === 'recall') {
				expect(GATE1_WORD_ID_SET.has(q.wordId)).toBe(true);
			}
		}
	});
});
