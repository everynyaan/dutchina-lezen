/**
 * Gate mastery. A ∧ B ∧ C ∧ D is the only writer of gates.current.
 * Boss wins, LP overflow, and Kuromi do not belong here.
 */
import type { GatesState, SyncedCardReview } from '$lib/state/schema';
import { GATE_COPY } from './home';
import { getStoriesForGate, getWordsForGate, isGateId, type GateId } from './gates';

export const INTRO_RATIO = 0.4;
export const COVERAGE_RATIO = 0.7;
export const MASTERED_INTERVAL = 21;
export const QUIZ_STREAK = 3;
export const QUIZ_MIN_CORRECT = 4;
export const WEEK_RATIO = 0.7;
export const QUIZ_LOG_CAP = 24;
export const WEEK_LOG_CAP = 12;

export interface QuizLogEntry {
	gate: number;
	date: string;
	correct: number;
	total: number;
}

export interface WeekLogEntry {
	gate: number;
	week: string;
	correct: number;
	total: number;
}

export interface MasteryInput {
	cardReviews: Record<string, Pick<SyncedCardReview, 'interval'> | { interval?: number }>;
	quizLog: QuizLogEntry[];
	weekLog: WeekLogEntry[];
}

export interface MasteryClauses {
	A: boolean;
	B: boolean;
	C: boolean;
	D: boolean;
	introduced: number;
	poolSize: number;
	covered: number;
}

export function evaluateMastery(gate: GateId, input: MasteryInput): MasteryClauses & { mastered: boolean } {
	const pool = getWordsForGate(gate);
	const poolIds = new Set(pool.map((w) => w.id));
	const poolSize = pool.length;

	let introduced = 0;
	let covered = 0;
	for (const id of poolIds) {
		const review = input.cardReviews[id];
		if (!review) continue;
		introduced += 1;
		if ((review.interval ?? 0) >= MASTERED_INTERVAL) covered += 1;
	}

	const A = poolSize > 0 && introduced / poolSize >= INTRO_RATIO;
	const B = introduced > 0 && covered / introduced >= COVERAGE_RATIO;

	const gateQuizzes = input.quizLog.filter((e) => e.gate === gate);
	const lastThree = gateQuizzes.slice(-QUIZ_STREAK);
	const C =
		lastThree.length >= QUIZ_STREAK &&
		lastThree.every((e) => e.total > 0 && e.correct >= QUIZ_MIN_CORRECT && e.total >= 5);

	const D = input.weekLog.some(
		(e) => e.gate === gate && e.total > 0 && e.correct / e.total >= WEEK_RATIO
	);

	return { A, B, C, D, introduced, poolSize, covered, mastered: A && B && C && D };
}

export function recordQuizCompletion(gates: GatesState, entry: QuizLogEntry): GatesState {
	const quizLog = upsertQuiz(gates.quizLog, entry).slice(-QUIZ_LOG_CAP);
	return { ...gates, quizLog };
}

/**
 * The writer `/quiz` (and tests) must call. Builds the log row from the
 * live daily session, upserts it, then runs the unlock check.
 */
export function commitDailyQuiz(
	gates: GatesState,
	gate: GateId,
	quiz: SessionQuiz,
	cardReviews: MasteryInput['cardReviews']
): { gates: GatesState; unlocked: GateId | null; entry: QuizLogEntry | null } {
	const entry = quizEntryFromSession(gate, quiz);
	if (!entry) return { gates, unlocked: null, entry: null };
	const logged = recordQuizCompletion(gates, entry);
	const next = maybeAdvanceGates(logged, cardReviews);
	return { gates: next.gates, unlocked: next.unlocked, entry };
}

export function recordWeekCompletion(gates: GatesState, entry: WeekLogEntry): GatesState {
	const weekLog = upsertWeek(gates.weekLog, entry).slice(-WEEK_LOG_CAP);
	return { ...gates, weekLog };
}

export interface SessionQuiz {
	date: string | null;
	completed: boolean;
	results: Record<string, boolean>;
	questionIds?: string[];
}

export interface SessionHomework {
	date: string | null;
	completed: boolean;
	results: Record<number, boolean>;
	questions?: unknown[];
}

/** Build a quizLog row from a finished daily. Null if it is not complete yet. */
export function quizEntryFromSession(gate: GateId, quiz: SessionQuiz): QuizLogEntry | null {
	if (!quiz.completed || !quiz.date) return null;
	const ids = quiz.questionIds ?? [];
	const resultValues = Object.values(quiz.results);
	const total = ids.length > 0 ? ids.length : resultValues.length;
	if (total <= 0) return null;
	const correct = resultValues.filter((v) => v === true).length;
	return { gate, date: quiz.date, correct, total };
}

/** Build a weekLog row from a finished week set. Null if it is not complete yet. */
export function weekEntryFromSession(gate: GateId, homework: SessionHomework): WeekLogEntry | null {
	if (!homework.completed || !homework.date) return null;
	const resultValues = Object.values(homework.results);
	const qlen = Array.isArray(homework.questions) ? homework.questions.length : 0;
	const total = qlen > 0 ? qlen : resultValues.length;
	if (total <= 0) return null;
	const correct = resultValues.filter((v) => v === true).length;
	return { gate, week: homework.date, correct, total };
}

/**
 * Persist a completed daily / week set that never made it into the logs.
 * Same date/week is left untouched so Practice Again cannot overwrite.
 */
export function foldMissingSessionLogs(
	gates: GatesState,
	quiz?: SessionQuiz | null,
	homework?: SessionHomework | null
): GatesState {
	const gate = isGateId(gates.current) ? gates.current : 1;
	let next = gates;
	const q = quiz ? quizEntryFromSession(gate, quiz) : null;
	if (q && !next.quizLog.some((e) => e.gate === q.gate && e.date === q.date)) {
		next = recordQuizCompletion(next, q);
	}
	const w = homework ? weekEntryFromSession(gate, homework) : null;
	if (w && !next.weekLog.some((e) => e.gate === w.gate && e.week === w.week)) {
		next = recordWeekCompletion(next, w);
	}
	return next;
}

/**
 * One-way unlock. Evaluates the current gate; if mastered, writes mastered[]
 * and advances current. May chain 1→2→3→4 if later evidence already exists.
 * Never decreases current. Gate 4 mastered stays at 4.
 */
export function maybeAdvanceGates(
	gates: GatesState,
	cardReviews: MasteryInput['cardReviews']
): { gates: GatesState; unlocked: GateId | null } {
	let current = isGateId(gates.current) ? gates.current : 1;
	const mastered = new Set(gates.mastered.filter((n) => n === 1 || n === 2 || n === 3 || n === 4));
	let unlocked: GateId | null = null;
	const input: MasteryInput = {
		cardReviews,
		quizLog: gates.quizLog,
		weekLog: gates.weekLog
	};

	for (let step = 0; step < 4; step++) {
		if (mastered.has(current)) {
			if (current < 4) current = (current + 1) as GateId;
			else break;
			continue;
		}
		const result = evaluateMastery(current, input);
		if (!result.mastered) break;
		mastered.add(current);
		if (current < 4) {
			current = (current + 1) as GateId;
			if (unlocked == null) unlocked = current;
		} else {
			break;
		}
	}

	const nextMastered = [...mastered].sort((a, b) => a - b);
	const same =
		gates.current === current &&
		gates.mastered.length === nextMastered.length &&
		gates.mastered.every((n, i) => n === nextMastered[i]);
	if (same) return { gates, unlocked: null };

	return {
		gates: { ...gates, current, mastered: nextMastered },
		unlocked
	};
}

export function unlockToastMessage(unlocked: GateId): string {
	return `Gate ${unlocked} is open — ${GATE_COPY[unlocked].title}.`;
}

export function gateForStoryId(storyId: string): GateId | null {
	for (const g of [1, 2, 3, 4] as const) {
		if (getStoriesForGate(g).some((s) => s.id === storyId)) return g;
	}
	return null;
}

function upsertQuiz(log: QuizLogEntry[], entry: QuizLogEntry): QuizLogEntry[] {
	const next = log.filter((e) => !(e.gate === entry.gate && e.date === entry.date));
	next.push(entry);
	return next;
}

function upsertWeek(log: WeekLogEntry[], entry: WeekLogEntry): WeekLogEntry[] {
	const next = log.filter((e) => !(e.gate === entry.gate && e.week === entry.week));
	next.push(entry);
	return next;
}
