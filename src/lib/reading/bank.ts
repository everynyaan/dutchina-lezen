import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import type { LezenPassage, LezenQuestion } from '$lib/lezen/types';

export interface BankPassage extends LezenPassage {
	year: number;
}

export function allPassages(): BankPassage[] {
	return LEZEN_EXAMS.flatMap((exam) => exam.passages.map((p) => ({ ...p, year: exam.year })));
}

export function findPassage(slug: string): BankPassage | undefined {
	return allPassages().find((p) => p.slug === slug);
}

export function findQuestion(id: string): { passage: BankPassage; question: LezenQuestion } | null {
	for (const passage of allPassages()) {
		const question = passage.questions.find((item) => item.id === id);
		if (question) return { passage, question };
	}
	return null;
}

export function examByYear(year: number) {
	return LEZEN_EXAMS.find((e) => e.year === year) ?? LEZEN_EXAMS[0];
}

/** Deterministic 0..n-1 from a YYYY-MM-DD date (and optional salt). */
export function dayIndex(date: string, n: number, salt = 0): number {
	if (n <= 0) return 0;
	let h = salt >>> 0;
	for (let i = 0; i < date.length; i++) {
		h = Math.imul(h ^ date.charCodeAt(i), 16777619) >>> 0;
	}
	return h % n;
}

export function daysBetween(from: string, to: string): number {
	const parse = (s: string) => {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
		if (!m) return null;
		return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	};
	const a = parse(from);
	const b = parse(to);
	if (a === null || b === null) return 999;
	return Math.round((b - a) / 86400000);
}

export function addDays(ymd: string, days: number): string {
	const t = Date.parse(ymd + 'T00:00:00Z') + days * 86400000;
	return new Date(t).toISOString().slice(0, 10);
}
