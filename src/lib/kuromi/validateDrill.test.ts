// ============================================================
// KUROMI — validateDrill unit tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { validateDrill } from './validateDrill';
import type { KuromiDrillSet } from './drill';

function validMcq(overrides: Partial<KuromiDrillSet['questions'][0]> = {}) {
	return {
		type: 'mcq' as const,
		prompt: 'What is the Dutch word for cat?',
		options: ['hond', 'kat', 'vogel', 'vis'],
		answer: 'kat',
		explanation_quip: 'Obviously. It is literally kat.',
		...overrides
	};
}

function validRecall(overrides: Partial<KuromiDrillSet['questions'][0]> = {}) {
	return {
		type: 'recall' as const,
		prompt: 'Translate: the house',
		options: [] as string[],
		answer: 'het huis',
		explanation_quip: 'het, because reasons. Dutch reasons.',
		...overrides
	};
}

function validSet(questions = [validMcq(), validRecall()]): KuromiDrillSet {
	return {
		title: 'Tiny Dutch drill',
		intro_quip: 'Try not to cry about articles.',
		questions
	};
}

describe('validateDrill', () => {
	it('accepts a fully valid mixed mcq + recall set', () => {
		const raw = validSet();
		const result = validateDrill(raw, 2);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.set.title).toBe('Tiny Dutch drill');
			expect(result.set.questions).toHaveLength(2);
			expect(result.set.questions[0].type).toBe('mcq');
			expect(result.set.questions[1].type).toBe('recall');
		}
	});

	it('accepts recall with absent options', () => {
		const q = validRecall();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		delete (q as any).options;
		const raw = validSet([validMcq(), q]);
		const result = validateDrill(raw, 2);
		expect(result.ok).toBe(true);
	});

	it('fails when raw is null', () => {
		const result = validateDrill(null, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.length).toBeGreaterThan(0);
		}
	});

	it('fails when title is empty / whitespace', () => {
		const raw = { ...validSet([validMcq()]), title: '   ' };
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('title'))).toBe(true);
		}
	});

	it('fails when intro_quip is empty', () => {
		const raw = { ...validSet([validMcq()]), intro_quip: '' };
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('intro_quip'))).toBe(true);
		}
	});

	it('fails when questions.length does not match expectedCount', () => {
		const raw = validSet([validMcq(), validRecall()]);
		const result = validateDrill(raw, 5);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('exactly 5'))).toBe(true);
		}
	});

	it('fails mcq whose answer is NOT among its options', () => {
		const raw = validSet([validMcq({ answer: 'olifant' }), validRecall()]);
		const result = validateDrill(raw, 2);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('answer') && r.includes('options'))).toBe(true);
		}
	});

	it('fails recall question carrying a non-empty options array', () => {
		const raw = validSet([validMcq(), validRecall({ options: ['should', 'not', 'be', 'here'] })]);
		const result = validateDrill(raw, 2);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('recall') && r.includes('empty'))).toBe(true);
		}
	});

	it('fails when two questions share the same prompt case-insensitively', () => {
		const raw = validSet([
			validMcq({ prompt: 'What is HET?' }),
			validRecall({ prompt: 'what is het?' })
		]);
		const result = validateDrill(raw, 2);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('duplicates'))).toBe(true);
		}
	});

	it('fails mcq with fewer than 3 options', () => {
		const raw = validSet([validMcq({ options: ['a', 'b'], answer: 'a' })]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('3–5'))).toBe(true);
		}
	});

	it('fails mcq with more than 5 options', () => {
		const raw = validSet([
			validMcq({
				options: ['a', 'b', 'c', 'd', 'e', 'f'],
				answer: 'a'
			})
		]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('3–5'))).toBe(true);
		}
	});

	it('fails mcq with duplicate options after trim', () => {
		const raw = validSet([
			validMcq({
				options: ['kat', '  kat  ', 'hond', 'vis'],
				answer: 'kat'
			})
		]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('mutually distinct'))).toBe(true);
		}
	});

	it('fails mcq with empty option entry', () => {
		const raw = validSet([
			validMcq({
				options: ['kat', '   ', 'hond', 'vis'],
				answer: 'kat'
			})
		]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('options['))).toBe(true);
		}
	});

	it('fails when question type is neither mcq nor recall', () => {
		const raw = validSet([
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			{ ...validMcq(), type: 'essay' as any }
		]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('type'))).toBe(true);
		}
	});

	it('fails when prompt is empty', () => {
		const raw = validSet([validMcq({ prompt: '  ' })]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('prompt'))).toBe(true);
		}
	});

	it('fails when explanation_quip is empty', () => {
		const raw = validSet([validMcq({ explanation_quip: '' })]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('explanation_quip'))).toBe(true);
		}
	});

	it('fails when recall answer is empty', () => {
		const raw = validSet([validRecall({ answer: '   ' })]);
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.some((r) => r.includes('answer'))).toBe(true);
		}
	});

	it('accumulates multiple reasons instead of bailing early', () => {
		const raw = {
			title: '',
			intro_quip: '',
			questions: [
				validMcq({ answer: 'not-in-options', prompt: 'same' }),
				validRecall({ options: ['x'], prompt: 'SAME' })
			]
		};
		const result = validateDrill(raw, 3);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.length).toBeGreaterThanOrEqual(4);
		}
	});

	it('trims fields on a successful validation', () => {
		const raw = {
			title: '  Title  ',
			intro_quip: '  Intro  ',
			questions: [
				validMcq({
					prompt: '  Prompt?  ',
					options: ['  a  ', 'b', 'c'],
					answer: '  a  ',
					explanation_quip: '  Because.  '
				})
			]
		};
		const result = validateDrill(raw, 1);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.set.title).toBe('Title');
			expect(result.set.questions[0].prompt).toBe('Prompt?');
			expect(result.set.questions[0].answer).toBe('a');
			expect(result.set.questions[0].options[0]).toBe('a');
		}
	});
});
