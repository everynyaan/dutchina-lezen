import type { LezenAnswer, LezenExam, LezenPassage, LezenQuestion } from './types';

/**
 * Slot for the 2021 and 2022 Lezen I openbare examens.
 * Drop `2021.json` or `2022.json` in `./supplied/` once Eyad supplies the paper.
 * A file loads only when its own official key matches every item answer.
 * Nothing in this folder is invented. While it is empty, both years stay missing.
 */

export const SUPPLIED_PAPER_YEARS = [2021, 2022] as const;

const ANSWERS = new Set<LezenAnswer>(['A', 'B', 'C', 'D']);

export interface SuppliedReject {
	file: string;
	reason: string;
}

export interface SuppliedPaperReport {
	exams: LezenExam[];
	missingYears: number[];
	rejected: SuppliedReject[];
}

const suppliedModules: Record<string, unknown> = import.meta.glob('./supplied/*.json', {
	eager: true
});

function unwrap(mod: unknown): unknown {
	if (mod && typeof mod === 'object' && 'default' in mod) {
		return (mod as { default: unknown }).default;
	}
	return mod;
}

function hasEmDash(value: unknown): boolean {
	if (typeof value === 'string') return value.includes('\u2014');
	if (Array.isArray(value)) return value.some(hasEmDash);
	if (value && typeof value === 'object') {
		return Object.values(value as Record<string, unknown>).some(hasEmDash);
	}
	return false;
}

function isAnswer(value: unknown): value is LezenAnswer {
	return value === 'A' || value === 'B' || value === 'C' || value === 'D';
}

function readQuestion(
	raw: unknown,
	index: number
): { question: LezenQuestion } | { reason: string } {
	if (!raw || typeof raw !== 'object') return { reason: `item ${index} is not an object` };
	const row = raw as Record<string, unknown>;
	if (typeof row.id !== 'string' || row.id.trim() === '')
		return { reason: `item ${index} has no id` };
	if (typeof row.vraag !== 'number' || !Number.isInteger(row.vraag)) {
		return { reason: `item ${index} has no vraag` };
	}
	if (typeof row.question !== 'string' || row.question.trim() === '') {
		return { reason: `item ${index} has no stem` };
	}
	if (!row.options || typeof row.options !== 'object' || Array.isArray(row.options)) {
		return { reason: `item ${index} has no options` };
	}
	const source = row.options as Record<string, unknown>;
	const letters = Object.keys(source).sort();
	if (letters.length < 2) return { reason: `item ${index} needs at least two options` };
	const options: Record<string, string> = {};
	for (const letter of letters) {
		if (!isAnswer(letter)) return { reason: `item ${index} has an option letter outside A to D` };
		const text = source[letter];
		if (typeof text !== 'string' || text.trim() === '') {
			return { reason: `item ${index} option ${letter} is empty` };
		}
		options[letter] = text;
	}
	if (!isAnswer(row.answer)) return { reason: `item ${index} has no answer letter` };
	if (!(row.answer in options)) return { reason: `item ${index} answer is not one of its options` };
	return {
		question: {
			id: row.id,
			vraag: row.vraag,
			question: row.question,
			options,
			answer: row.answer
		}
	};
}

function readPassage(raw: unknown, index: number): { passage: LezenPassage } | { reason: string } {
	if (!raw || typeof raw !== 'object') return { reason: `passage ${index} is not an object` };
	const row = raw as Record<string, unknown>;
	for (const field of ['name', 'slug', 'intro', 'text'] as const) {
		if (typeof row[field] !== 'string' || row[field].trim() === '') {
			return { reason: `passage ${index} has no ${field}` };
		}
	}
	if (!Array.isArray(row.questions) || row.questions.length === 0) {
		return { reason: `passage ${index} has no questions` };
	}
	const questions: LezenQuestion[] = [];
	for (let i = 0; i < row.questions.length; i++) {
		const read = readQuestion(row.questions[i], i + 1);
		if ('reason' in read) return read;
		questions.push(read.question);
	}
	return {
		passage: {
			name: row.name as string,
			slug: row.slug as string,
			intro: row.intro as string,
			text: row.text as string,
			questions
		}
	};
}

/** Check one supplied file. The key stays off the exam object. */
export function assessSuppliedPaper(raw: unknown): { exam: LezenExam } | { reason: string } {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw))
		return { reason: 'file is not an object' };
	if (hasEmDash(raw)) return { reason: 'file contains an em dash' };
	const row = raw as Record<string, unknown>;
	if (row.year !== 2021 && row.year !== 2022) return { reason: 'year is not 2021 or 2022' };
	if (!Array.isArray(row.passages) || row.passages.length === 0) {
		return { reason: 'passages are missing' };
	}
	const passages: LezenPassage[] = [];
	for (let i = 0; i < row.passages.length; i++) {
		const read = readPassage(row.passages[i], i + 1);
		if ('reason' in read) return read;
		passages.push(read.passage);
	}
	const questions = passages.flatMap((passage) => passage.questions);
	const ids = new Set<string>();
	for (const question of questions) {
		if (ids.has(question.id)) return { reason: `id ${question.id} is repeated` };
		ids.add(question.id);
	}
	if (typeof row.totalQuestions !== 'number' || row.totalQuestions !== questions.length) {
		return { reason: 'totalQuestions does not match the items' };
	}
	if (
		typeof row.passingScore !== 'number' ||
		!Number.isInteger(row.passingScore) ||
		row.passingScore < 1 ||
		row.passingScore > questions.length
	) {
		return { reason: 'passingScore is missing' };
	}
	if (!Array.isArray(row.key)) return { reason: 'official key is missing' };
	if (row.key.length !== questions.length) {
		return { reason: 'official key length does not match the items' };
	}
	if (!row.key.every((letter) => ANSWERS.has(letter as LezenAnswer))) {
		return { reason: 'official key has a letter outside A to D' };
	}
	for (let i = 0; i < questions.length; i++) {
		if (row.key[i] !== questions[i].answer) {
			return { reason: `official key does not match item ${questions[i].vraag}` };
		}
	}
	return {
		exam: {
			year: row.year,
			totalQuestions: questions.length,
			passingScore: row.passingScore,
			passages
		}
	};
}

export function loadSuppliedPapers(
	modules: Record<string, unknown> = suppliedModules
): SuppliedPaperReport {
	const rejected: SuppliedReject[] = [];
	const exams: LezenExam[] = [];
	const seen = new Set<number>();
	for (const file of Object.keys(modules).sort()) {
		const result = assessSuppliedPaper(unwrap(modules[file]));
		if ('reason' in result) {
			rejected.push({ file, reason: result.reason });
			continue;
		}
		if (seen.has(result.exam.year)) {
			rejected.push({ file, reason: `year ${result.exam.year} is already loaded` });
			continue;
		}
		seen.add(result.exam.year);
		exams.push(result.exam);
	}
	exams.sort((a, b) => b.year - a.year);
	return {
		exams,
		missingYears: SUPPLIED_PAPER_YEARS.filter((year) => !seen.has(year)),
		rejected
	};
}

/** Append a checked supplied paper after the papers already in the bank. */
export function examsWithSupplied(
	loaded: readonly LezenExam[],
	supplied: readonly LezenExam[] = loadSuppliedPapers().exams
): LezenExam[] {
	const years = new Set(loaded.map((exam) => exam.year));
	const extra = supplied
		.filter((exam) => !years.has(exam.year))
		.slice()
		.sort((a, b) => b.year - a.year);
	return [...loaded, ...extra];
}

/**
 * Spec budget once both papers are real: baseline stays the reserved paper,
 * second mock is 2022, final mock is 2021.
 * Returns null while either file is missing, and nothing here writes reservedPapers.
 */
export function mockPaperBudget(presentYears: readonly number[]): {
	baseline: 'reserved';
	second: 2022;
	final: 2021;
} | null {
	const present = new Set(presentYears);
	if (!present.has(2021) || !present.has(2022)) return null;
	return { baseline: 'reserved', second: 2022, final: 2021 };
}
