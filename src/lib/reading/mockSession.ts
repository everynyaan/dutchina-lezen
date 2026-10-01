import { getAnnotation } from './annotations';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import type { LezenExam, LezenQuestion } from '$lib/lezen/types';
import { appendAttempt } from './daily';
import { MOCK_MINUTES, passLineFor } from './mock';
import { examForSet, horizonLocked, originForItem, SET_TARGET } from './sets';
import { recordMiss } from './traps';
import type { MockResult, MockSession, QType, ReadingForkState } from './types';

export const MOCK_MS = MOCK_MINUTES * 60 * 1000;
export const SEEN_PAPER_WARNING =
	'You have seen this paper. Expect a higher score than on the day.';

export interface MockChoice {
	year: number;
	/** Reserved and not yet sat or studied. */
	sealed: boolean;
	/** Show the seen-paper warning. */
	seen: boolean;
	/** She already worked this paper outside a fresh sealed sitting. */
	studied: boolean;
}

type MockFork = Pick<
	ReadingForkState,
	'settings' | 'satMocks' | 'mocks' | 'lastMockAt' | 'lastMockScore'
>;

function lastFinished(fork: MockFork, year: number): string | null {
	let latest: string | null = null;
	for (const mock of fork.mocks) {
		if (mock.paperYear !== year || !mock.finishedAt) continue;
		if (latest === null || mock.finishedAt > latest) latest = mock.finishedAt;
	}
	if (latest === null && fork.satMocks.includes(year)) {
		if (fork.lastMockScore?.year === year && fork.lastMockAt) return fork.lastMockAt;
		return '1970-01-01';
	}
	return latest;
}

function paperWasSeen(fork: MockFork, year: number, studiedYears: readonly number[]): boolean {
	return lastFinished(fork, year) !== null || studiedYears.includes(year);
}

/** Reserved unseen paper, otherwise the least recently mocked paper. */
export function chooseMockPaper(fork: MockFork, studiedYears: readonly number[] = []): MockChoice {
	const reserved = fork.settings?.reservedPapers ?? [2023];
	const skipped = new Set<number>();
	for (const year of reserved) {
		if (!paperWasSeen(fork, year, studiedYears)) {
			return { year, sealed: true, seen: false, studied: false };
		}
		skipped.add(year);
	}
	const years = LEZEN_EXAMS.map((exam) => exam.year).filter((year) => !skipped.has(year));
	const pool = years.length > 0 ? years : LEZEN_EXAMS.map((exam) => exam.year);
	pool.sort((a, b) => {
		const aa = lastFinished(fork, a);
		const bb = lastFinished(fork, b);
		if (aa === null && bb === null) return a - b;
		if (aa === null) return -1;
		if (bb === null) return 1;
		if (aa !== bb) return aa < bb ? -1 : 1;
		return a - b;
	});
	const year = pool[0] ?? 2024;
	return {
		year,
		sealed: false,
		seen: paperWasSeen(fork, year, studiedYears),
		studied: studiedYears.includes(year)
	};
}

export function examForYear(year: number): LezenExam | null {
	return LEZEN_EXAMS.find((exam) => exam.year === year) ?? null;
}

export function startSetSession(
	setId: string,
	booklet: boolean,
	horizonOpen: boolean,
	now = Date.now()
): MockSession | null {
	const exam = examForSet(setId, horizonOpen);
	if (!exam) return null;
	return {
		id: `set-${setId}-${now}`,
		paperYear: 0,
		setId,
		booklet,
		startedAt: now,
		endsAt: now + MOCK_MS,
		answers: {},
		flagged: {},
		textMs: Array.from({ length: exam.passages.length }, () => 0),
		activeText: 0,
		activeSince: now
	};
}

export function startMockSession(
	paperYear: number,
	booklet: boolean,
	now = Date.now()
): MockSession {
	const exam = examForYear(paperYear);
	const texts = exam?.passages.length ?? 6;
	return {
		id: `mock-${paperYear}-${now}`,
		paperYear,
		booklet,
		startedAt: now,
		endsAt: now + MOCK_MS,
		answers: {},
		flagged: {},
		textMs: Array.from({ length: texts }, () => 0),
		activeText: 0,
		activeSince: now
	};
}

export function remainingMs(session: MockSession, now = Date.now()): number {
	return Math.max(0, session.endsAt - now);
}

export function formatRemaining(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const seconds = total % 60;
	const mm = String(minutes).padStart(2, '0');
	const ss = String(seconds).padStart(2, '0');
	return `${hours}:${mm}:${ss}`;
}

export function accrueText(session: MockSession, now: number): MockSession {
	if (session.activeSince === null) return { ...session, activeSince: now };
	const textMs = session.textMs.slice();
	const index = session.activeText;
	while (textMs.length <= index) textMs.push(0);
	textMs[index] = (textMs[index] ?? 0) + Math.max(0, now - session.activeSince);
	return { ...session, textMs, activeSince: now };
}

export function switchText(session: MockSession, index: number, now: number): MockSession {
	const accrued = accrueText(session, now);
	return { ...accrued, activeText: index, activeSince: now };
}

/** Drop the sat year. Do not reserve another paper. */
export function releasePaper(reserved: readonly number[], year: number): number[] {
	return reserved.filter((item) => item !== year);
}

function questionsOf(exam: LezenExam): { passageSlug: string; question: LezenQuestion }[] {
	return exam.passages.flatMap((passage) =>
		passage.questions.map((question) => ({ passageSlug: passage.slug, question }))
	);
}

export function handInMock(
	fork: ReadingForkState,
	session: MockSession,
	now: number,
	today: string,
	expired: boolean
): ReadingForkState {
	if (session.setId) return handInPracticeSet(fork, session, now, today, expired);
	const accrued = accrueText(session, now);
	const exam = examForYear(accrued.paperYear);
	if (!exam || exam.year !== accrued.paperYear) return fork;
	let next: ReadingForkState = { ...fork, attempts: fork.attempts };
	let attempts = fork.attempts;
	const byQtype: Partial<Record<QType, { c: number; t: number }>> = {};
	let correct = 0;
	let total = 0;
	for (const row of questionsOf(exam)) {
		total += 1;
		const picked = accrued.answers[row.question.id] ?? '';
		const hit = picked !== '' && picked === row.question.answer;
		if (hit) correct += 1;
		const qtype = getAnnotation(row.question.id)?.qtype;
		if (qtype) {
			const prev = byQtype[qtype] ?? { c: 0, t: 0 };
			byQtype[qtype] = { c: prev.c + (hit ? 1 : 0), t: prev.t + 1 };
		}
		attempts = appendAttempt(attempts, {
			itemId: row.question.id,
			origin: 'official',
			passageSlug: row.passageSlug,
			source: 'mock',
			at: today,
			picked,
			correct: hit,
			locateP: null,
			locateHit: null,
			ms: 0,
			mockId: accrued.id
		});
		if (picked && !hit) {
			next = recordMiss({ ...next, attempts }, row.question.id, picked, today);
			attempts = next.attempts;
		}
	}
	const result: MockResult = {
		id: accrued.id,
		paperYear: exam.year,
		finishedAt: today,
		expired,
		correct,
		total,
		passLine: passLineFor(exam),
		byQtype,
		textMs: accrued.textMs,
		answers: { ...accrued.answers },
		flagged: { ...accrued.flagged }
	};
	return {
		...next,
		attempts,
		satMocks: next.satMocks.includes(exam.year) ? next.satMocks : [...next.satMocks, exam.year],
		lastMockAt: today,
		lastMockScore: {
			correct,
			total,
			passed: correct >= passLineFor(exam),
			year: exam.year
		},
		mockInProgress: null,
		mocks: [...next.mocks, result],
		settings: {
			...next.settings,
			reservedPapers: releasePaper(next.settings.reservedPapers, exam.year)
		}
	};
}

function handInPracticeSet(
	fork: ReadingForkState,
	session: MockSession,
	now: number,
	today: string,
	expired: boolean
): ReadingForkState {
	const setId = session.setId;
	if (!setId) return fork;
	const accrued = accrueText(session, now);
	const exam = examForSet(setId, !horizonLocked(fork.mocks));
	if (!exam) return fork;
	let next: ReadingForkState = { ...fork, attempts: fork.attempts };
	let attempts = fork.attempts;
	const byQtype: Partial<Record<QType, { c: number; t: number }>> = {};
	let correct = 0;
	let total = 0;
	for (const row of questionsOf(exam)) {
		total += 1;
		const picked = accrued.answers[row.question.id] ?? '';
		const hit = picked !== '' && picked === row.question.answer;
		if (hit) correct += 1;
		const qtype = getAnnotation(row.question.id)?.qtype;
		if (qtype) {
			const prev = byQtype[qtype] ?? { c: 0, t: 0 };
			byQtype[qtype] = { c: prev.c + (hit ? 1 : 0), t: prev.t + 1 };
		}
		attempts = appendAttempt(attempts, {
			itemId: row.question.id,
			origin: originForItem(row.question.id),
			passageSlug: row.passageSlug,
			source: 'mock',
			at: today,
			picked,
			correct: hit,
			locateP: null,
			locateHit: null,
			ms: 0,
			mockId: accrued.id
		});
		if (picked && !hit) {
			next = recordMiss({ ...next, attempts }, row.question.id, picked, today);
			attempts = next.attempts;
		}
	}
	const result: MockResult = {
		id: accrued.id,
		paperYear: 0,
		setId,
		finishedAt: today,
		expired,
		correct,
		total,
		passLine: SET_TARGET,
		byQtype,
		textMs: accrued.textMs,
		answers: { ...accrued.answers },
		flagged: { ...accrued.flagged }
	};
	return {
		...next,
		attempts,
		mockInProgress: null,
		mocks: [...next.mocks, result]
	};
}

export function textScores(
	exam: LezenExam,
	answers: Record<string, string>
): { slug: string; name: string; correct: number; total: number }[] {
	return exam.passages.map((passage) => {
		let correct = 0;
		for (const question of passage.questions) {
			if (answers[question.id] === question.answer) correct += 1;
		}
		return {
			slug: passage.slug,
			name: passage.name,
			correct,
			total: passage.questions.length
		};
	});
}

export function flagSplit(
	exam: LezenExam,
	result: Pick<MockResult, 'answers' | 'flagged'>
): { right: number; wrong: number } {
	let right = 0;
	let wrong = 0;
	for (const passage of exam.passages) {
		for (const question of passage.questions) {
			if (!result.flagged[question.id]) continue;
			if (result.answers[question.id] === question.answer) right += 1;
			else wrong += 1;
		}
	}
	return { right, wrong };
}

export function unansweredCount(exam: LezenExam, answers: Record<string, string>): number {
	let blank = 0;
	for (const passage of exam.passages) {
		for (const question of passage.questions) {
			if (!answers[question.id]) blank += 1;
		}
	}
	return blank;
}
