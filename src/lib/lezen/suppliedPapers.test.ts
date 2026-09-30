import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { examYearsForBrowse, EXAM_YEARS } from '$lib/gates/browse';
import { packSlugs } from '$lib/reading/practice';
import { chooseMockPaper } from '$lib/reading/mockSession';
import { EMPTY_READING_FORK, EMPTY_READING_SETTINGS } from '$lib/reading/types';
import { LEZEN_EXAMS } from './LEZEN_CONTENT';
import {
	SUPPLIED_PAPER_YEARS,
	assessSuppliedPaper,
	examsWithSupplied,
	loadSuppliedPapers,
	mockPaperBudget
} from './suppliedPapers';

const SUSPECT: Record<string, 'A' | 'B' | 'C' | 'D'> = {
	'lezen-2023-2': 'C',
	'lezen-2023-20': 'B',
	'lezen-2023-32': 'C',
	'lezen-2024-3': 'B',
	'lezen-2024-10': 'B',
	'lezen-2024-22': 'B',
	'lezen-2024-34': 'B',
	'lezen-2025-31': 'C'
};

function sample(year: number) {
	return {
		year,
		totalQuestions: 1,
		passingScore: 1,
		key: ['A'],
		passages: [
			{
				name: 'Slot check',
				slug: 'slot-check',
				intro: 'Not an official paper.',
				text: 'Slot check only.',
				questions: [
					{
						id: `slot-${year}-1`,
						vraag: 1,
						question: 'Slot check?',
						options: { A: 'yes', B: 'no' },
						answer: 'A'
					}
				]
			}
		]
	};
}

describe('supplied 2021 and 2022 papers', () => {
	it('reports both papers missing and leaves the loaded bank alone', () => {
		const report = loadSuppliedPapers();
		expect([...SUPPLIED_PAPER_YEARS]).toEqual([2021, 2022]);
		expect(report.missingYears).toEqual([2021, 2022]);
		expect(report.exams).toEqual([]);
		expect(report.rejected).toEqual([]);
		expect(LEZEN_EXAMS.map((exam) => exam.year)).toEqual([2025, 2024, 2023]);
		expect([...EXAM_YEARS]).toEqual([2025, 2024, 2023]);
		expect(examYearsForBrowse(4)).toEqual([2025, 2024, 2023]);
		expect(LEZEN_EXAMS.find((exam) => exam.year === 2023)?.passingScore).toBe(23);
		expect(LEZEN_EXAMS.find((exam) => exam.year === 2024)?.passingScore).toBe(24);
		expect(LEZEN_EXAMS.find((exam) => exam.year === 2025)?.passingScore).toBe(24);
		const answers = new Map(
			LEZEN_EXAMS.flatMap((exam) =>
				exam.passages.flatMap((passage) =>
					passage.questions.map((question) => [question.id, question.answer])
				)
			)
		);
		for (const [id, letter] of Object.entries(SUSPECT)) {
			expect(answers.get(id)).toBe(letter);
		}
	});

	it('does not reserve a year that has no paper', () => {
		expect(EMPTY_READING_SETTINGS.reservedPapers).toEqual([2023]);
		expect(mockPaperBudget(LEZEN_EXAMS.map((exam) => exam.year))).toBeNull();
		expect(chooseMockPaper(EMPTY_READING_FORK)).toEqual({
			year: 2023,
			sealed: true,
			seen: false,
			studied: false
		});
		const source = readFileSync(new URL('../reading/mockSession.ts', import.meta.url), 'utf8');
		expect(source.includes('mockPaperBudget')).toBe(false);
		expect(source.includes('2021')).toBe(false);
		expect(source.includes('2022')).toBe(false);
	});

	it('does not invent practice packs for the missing papers', () => {
		expect(packSlugs()).toEqual(['buurt-whatsapp']);
	});

	it('accepts a paper only when its own key matches every item', () => {
		expect('exam' in assessSuppliedPaper(sample(2021))).toBe(true);
		const wrong = sample(2021);
		wrong.key = ['B'];
		expect(assessSuppliedPaper(wrong)).toEqual({
			reason: 'official key does not match item 1'
		});
		const noKey = sample(2022);
		delete (noKey as { key?: string[] }).key;
		expect(assessSuppliedPaper(noKey)).toEqual({ reason: 'official key is missing' });
		expect(assessSuppliedPaper({ ...sample(2024), year: 2024 })).toEqual({
			reason: 'year is not 2021 or 2022'
		});
		const dashed = sample(2021);
		dashed.passages[0].text = 'slot\u2014check';
		expect(assessSuppliedPaper(dashed)).toEqual({ reason: 'file contains an em dash' });
	});

	it('keeps a checked paper out of the live bank until the file is in the slot', () => {
		const report = loadSuppliedPapers({
			'supplied/2021.json': { default: sample(2021) },
			'supplied/bad.json': { default: { year: 2022 } }
		});
		expect(report.exams.map((exam) => exam.year)).toEqual([2021]);
		expect(report.missingYears).toEqual([2022]);
		expect(report.rejected).toEqual([
			{ file: 'supplied/bad.json', reason: 'passages are missing' }
		]);
		expect(report.exams[0]?.passages[0]?.questions[0]?.options).toEqual({ A: 'yes', B: 'no' });
		expect(LEZEN_EXAMS.map((exam) => exam.year)).toEqual([2025, 2024, 2023]);
		const assessed = assessSuppliedPaper(sample(2022));
		const merged = examsWithSupplied(LEZEN_EXAMS, 'exam' in assessed ? [assessed.exam] : []);
		expect(merged.map((exam) => exam.year)).toEqual([2025, 2024, 2023, 2022]);
		expect(mockPaperBudget([2021, 2022])).toEqual({
			baseline: 'reserved',
			second: 2022,
			final: 2021
		});
		expect(EMPTY_READING_SETTINGS.reservedPapers).toEqual([2023]);
	});

	it('has no em dash in the loader', () => {
		const source = readFileSync(new URL('./suppliedPapers.ts', import.meta.url), 'utf8');
		expect(source.includes('\u2014')).toBe(false);
	});
});
