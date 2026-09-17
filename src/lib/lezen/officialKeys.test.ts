import { describe, expect, it } from 'vitest';
import { LEZEN_2023, LEZEN_2024, LEZEN_2025, LEZEN_EXAMS } from './LEZEN_CONTENT';
import type { LezenExam } from './types';

/** Antwoordsleutel from CvTE Openbaar examen Lezen I beoordelingsmodel (digitaal). */
export const OFFICIAL_LEZEN_I_KEYS: Record<number, Array<'A' | 'B' | 'C' | 'D'>> = {
	2023: 'B B A D B A C B B B C B C C B B B C B D B C A B B C D B B C B A C C B'.split(
		' '
	) as Array<'A' | 'B' | 'C' | 'D'>,
	2024: 'B B B A C B A C D A A B B B A B A B B A C B C A C B A D A A A B C A C'.split(
		' '
	) as Array<'A' | 'B' | 'C' | 'D'>,
	2025: 'C A C A C A C A C C A A A C A C A B B B B C B C C B B B C A C B C A B'.split(
		' '
	) as Array<'A' | 'B' | 'C' | 'D'>
};

function answers(exam: LezenExam): string[] {
	return exam.passages.flatMap((p) => p.questions).map((q) => q.answer);
}

function mismatches(exam: LezenExam): number[] {
	const official = OFFICIAL_LEZEN_I_KEYS[exam.year];
	return answers(exam)
		.map((ans, i) => (ans === official[i] ? -1 : i + 1))
		.filter((n) => n > 0);
}

describe('official Lezen I beoordelingsmodel keys', () => {
	it('keeps one exam per year 2023–2025 with 35 items', () => {
		expect(LEZEN_EXAMS.map((e) => e.year)).toEqual([2025, 2024, 2023]);
		for (const exam of LEZEN_EXAMS) {
			expect(exam.totalQuestions).toBe(35);
			expect(answers(exam)).toHaveLength(35);
			expect(OFFICIAL_LEZEN_I_KEYS[exam.year]).toHaveLength(35);
		}
	});

	it('uses the openbaar-examen cesuur from those PDFs (not live 22/36)', () => {
		expect(LEZEN_2023.passingScore).toBe(23);
		expect(LEZEN_2024.passingScore).toBe(24);
		expect(LEZEN_2025.passingScore).toBe(24);
	});

	it('is almost aligned for 2025; 2023/2024 keys still diverge until A–D stems are restored', () => {
		expect(mismatches(LEZEN_2025)).toEqual([29, 30]);
		expect(mismatches(LEZEN_2024)).toHaveLength(21);
		expect(mismatches(LEZEN_2023)).toHaveLength(24);
		expect(OFFICIAL_LEZEN_I_KEYS[2023].filter((k) => k === 'D')).toEqual(['D', 'D', 'D']);
		expect(OFFICIAL_LEZEN_I_KEYS[2024].filter((k) => k === 'D')).toEqual(['D', 'D']);
	});
});
