import { QTYPE_LABEL, TRAP_LABEL } from './annotations';
import { daysBetween } from './bank';
import { accuracyByQtype } from './history';
import { examForYear } from './mockSession';
import { passLineFor } from './mock';
import { QTYPES, type QType, type ReadingForkState, type TrapKind } from './types';

export const PLAN_LINE =
	'Baseline official mock by 2026-10-12. Practice set 2 in exam mode in the week of 2026-10-12. Practice set 3 in the week of 2026-10-19. A second official mock, or practice set 1, in the week of 2026-10-26. Final official mock from 2026-11-02 to 2026-11-05. Light review only from 2026-11-09.';

type ForkSlice = Pick<
	ReadingForkState,
	'attempts' | 'mocks' | 'lastMockScore' | 'traps' | 'settings'
>;

export function daysToExam(examDate: string, today: string): number | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
	const days = daysBetween(today, examDate);
	return days === 999 ? null : days;
}

export function examCountdown(examDate: string, today: string): string {
	const days = daysToExam(examDate, today);
	if (days === null) return 'Exam date is not set.';
	if (days < 0) return 'The exam date has passed.';
	if (days === 0) return 'Exam day.';
	if (days === 1) return '1 day to the exam.';
	return `${days} days to the exam.`;
}

export interface LastMockView {
	year: number;
	correct: number;
	total: number;
	passLine: number;
	target: number;
	passed: boolean;
}

export function lastMockView(
	fork: Pick<ForkSlice, 'mocks' | 'lastMockScore'>
): LastMockView | null {
	const latest = [...fork.mocks].sort(
		(a, b) => b.finishedAt.localeCompare(a.finishedAt) || b.id.localeCompare(a.id)
	)[0];
	if (latest) {
		return {
			year: latest.paperYear,
			correct: latest.correct,
			total: latest.total,
			passLine: latest.passLine,
			target: latest.passLine + 1,
			passed: latest.correct >= latest.passLine
		};
	}
	const score = fork.lastMockScore;
	if (!score) return null;
	const exam = examForYear(score.year);
	const passLine = exam ? passLineFor(exam) : 24;
	return {
		year: score.year,
		correct: score.correct,
		total: score.total,
		passLine,
		target: passLine + 1,
		passed: score.correct >= passLine
	};
}

export function lastMockLine(view: LastMockView | null): string {
	if (!view) return 'No mock yet.';
	const sitting = view.passed ? 'This sitting passes.' : 'Under the pass line.';
	return `${view.year}: ${view.correct} of ${view.total}. Pass line ${view.passLine}. Target ${view.target}. ${sitting}`;
}

export interface QtypeRow {
	qtype: QType;
	label: string;
	correct: number;
	attempts: number;
	official: { c: number; t: number } | null;
	practice: { c: number; t: number } | null;
	split: boolean;
	rate: number | null;
}

/** Last 30 attempts per type. Official and practice split only when each has at least 5. */
export function qtypeReadiness(fork: Pick<ReadingForkState, 'attempts'>): QtypeRow[] {
	const all = accuracyByQtype(fork, { last: 30 });
	const official = accuracyByQtype(fork, { origin: 'official', last: 30 });
	const practice = accuracyByQtype(fork, { origin: 'practice', last: 30 });
	const rows = QTYPES.map((qtype) => {
		const combined = all[qtype] ?? { c: 0, t: 0 };
		const off = official[qtype] ?? { c: 0, t: 0 };
		const prac = practice[qtype] ?? { c: 0, t: 0 };
		const split = off.t >= 5 && prac.t >= 5;
		const rate =
			combined.t === 0
				? null
				: split
					? Math.min(off.c / off.t, prac.c / prac.t)
					: combined.c / combined.t;
		return {
			qtype,
			label: QTYPE_LABEL[qtype],
			correct: combined.c,
			attempts: combined.t,
			official: split ? off : null,
			practice: split ? prac : null,
			split,
			rate
		};
	});
	rows.sort((a, b) => {
		if (a.rate === null && b.rate === null) return a.label.localeCompare(b.label);
		if (a.rate === null) return 1;
		if (b.rate === null) return -1;
		if (a.rate !== b.rate) return a.rate - b.rate;
		return a.label.localeCompare(b.label);
	});
	return rows;
}

export function qtypeLine(row: QtypeRow): string {
	if (row.attempts === 0) return `${row.label}: no attempts yet.`;
	if (row.split && row.official && row.practice) {
		return `${row.label}. Official ${row.official.c} of ${row.official.t}. Practice ${row.practice.c} of ${row.practice.t}.`;
	}
	return `${row.label}: ${row.correct} of ${row.attempts}.`;
}

export function locateWindow(
	fork: Pick<ReadingForkState, 'attempts'>,
	last = 50
): { hits: number; total: number } | null {
	const located = [...fork.attempts]
		.filter((attempt) => attempt.locateHit !== null)
		.sort((a, b) => a.at.localeCompare(b.at) || a.itemId.localeCompare(b.itemId))
		.slice(-last);
	if (located.length === 0) return null;
	return {
		hits: located.filter((attempt) => attempt.locateHit === true).length,
		total: located.length
	};
}

export function locateLine(window: { hits: number; total: number } | null): string {
	if (!window) return 'Found the right paragraph: no located questions yet.';
	return `Found the right paragraph: ${window.hits} of ${window.total}.`;
}

/** Untamed trap cards, most misses first. */
export function openTraps(fork: Pick<ReadingForkState, 'traps'>): TrapKind[] {
	return fork.traps
		.filter((card) => card.tamedAt === null)
		.slice()
		.sort((a, b) => b.misses - a.misses || a.trap.localeCompare(b.trap))
		.map((card) => card.trap);
}

export function trapLine(traps: readonly TrapKind[]): string {
	if (traps.length === 0) return 'No open trap cards.';
	return `${traps.map((trap) => TRAP_LABEL[trap]).join('. ')}.`;
}
