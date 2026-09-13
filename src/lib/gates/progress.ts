/**
 * Viewable mastery progress. Ratios are toward each A∧B∧C∧D threshold.
 * Unlock stays AND of the four clauses. The visible bar is the average
 * so finishing a quiz or week set moves the fill even when another clause is 0.
 * Copy stays plain-language.
 */
import {
	COVERAGE_RATIO,
	INTRO_RATIO,
	QUIZ_MIN_CORRECT,
	QUIZ_STREAK,
	WEEK_RATIO,
	evaluateMastery,
	foldMissingSessionLogs,
	type MasteryInput,
	type SessionHomework,
	type SessionQuiz
} from './mastery';
import { isGateId, type GateId } from './gates';

export const EMPTY_MASTERY_INPUT: MasteryInput = {
	cardReviews: {},
	quizLog: [],
	weekLog: []
};

export type ProgressKind = 'locked' | 'open' | 'done';

export interface ClauseRatios {
	A: number;
	B: number;
	C: number;
	D: number;
}

export interface GateProgress {
	kind: ProgressKind;
	percent: number;
	line: string;
	ratios: ClauseRatios;
	combined: number;
	clauses: {
		A: boolean;
		B: boolean;
		C: boolean;
		D: boolean;
		introduced: number;
		poolSize: number;
		covered: number;
		goodQuizzes: number;
		loggedQuizzes: number;
		weekBest: number;
	};
}

export interface HubCheck {
	key: 'cards' | 'sticking' | 'quizzes' | 'week';
	label: string;
	status: string;
	ratio: number;
	done: boolean;
}

export interface KuromiMasteryPiece {
	key: 'A' | 'B' | 'C' | 'D';
	done: boolean;
	human: string;
}

export interface KuromiMasterySnapshot {
	gate: GateId;
	percent: number;
	pieces: KuromiMasteryPiece[];
	nextUnlock: string | null;
}

export function masteryInputFromState(state: {
	cardReviews?: MasteryInput['cardReviews'];
	gates?: {
		current?: number;
		mastered?: number[];
		quizLog?: MasteryInput['quizLog'];
		weekLog?: MasteryInput['weekLog'];
	};
	dailyQuiz?: SessionQuiz;
	dailyHomework?: SessionHomework;
}): MasteryInput {
	const current = isGateId(state.gates?.current) ? state.gates.current : 1;
	const folded = foldMissingSessionLogs(
		{
			current,
			mastered: state.gates?.mastered ?? [],
			quizLog: state.gates?.quizLog ?? [],
			weekLog: state.gates?.weekLog ?? []
		},
		state.dailyQuiz,
		state.dailyHomework
	);
	return {
		cardReviews: state.cardReviews ?? {},
		quizLog: folded.quizLog,
		weekLog: folded.weekLog
	};
}

export function progressKind(n: GateId, current: GateId, mastered: number[]): ProgressKind {
	if (n > current) return 'locked';
	if (n < current || mastered.includes(n)) return 'done';
	return 'open';
}

export function clauseRatios(gate: GateId, input: MasteryInput): ClauseRatios {
	const clauses = evaluateMastery(gate, input);
	const ratioA =
		clauses.poolSize > 0 ? clamp01(clauses.introduced / (clauses.poolSize * INTRO_RATIO)) : 0;
	const ratioB =
		clauses.introduced > 0 ? clamp01(clauses.covered / (clauses.introduced * COVERAGE_RATIO)) : 0;
	const goodQuizzes = countGoodQuizzes(gate, input.quizLog);
	const loggedQuizzes = countLoggedQuizzes(gate, input.quizLog);
	// Unlock C still needs 4/5 × 3. The visible bar counts any finished
	// daily for this gate so one completed quiz is never 0% overall.
	const ratioC = clamp01(Math.max(goodQuizzes, loggedQuizzes) / QUIZ_STREAK);
	const weekBest = bestWeekRatio(gate, input.weekLog);
	const ratioD = weekBest <= 0 ? 0 : clamp01(weekBest / WEEK_RATIO);
	return { A: ratioA, B: ratioB, C: ratioC, D: ratioD };
}

/** Visible fill — average of the four 0–1 ratios. Unlock still requires all four. */
export function combinedRatio(ratios: ClauseRatios): number {
	return (ratios.A + ratios.B + ratios.C + ratios.D) / 4;
}

export function barPercent(kind: ProgressKind, ratios: ClauseRatios): number {
	if (kind === 'locked') return 0;
	if (kind === 'done') return 100;
	return Math.round(combinedRatio(ratios) * 100);
}

export function evaluateGateProgress(
	n: GateId,
	current: GateId,
	mastered: number[],
	input: MasteryInput
): GateProgress {
	const kind = progressKind(n, current, mastered);
	if (kind === 'locked') {
		return lockedProgress();
	}
	if (kind === 'done') {
		return doneProgress();
	}

	const clauses = evaluateMastery(n, input);
	const ratios = clauseRatios(n, input);
	const goodQuizzes = countGoodQuizzes(n, input.quizLog);
	const loggedQuizzes = countLoggedQuizzes(n, input.quizLog);
	const weekBest = bestWeekRatio(n, input.weekLog);
	const combined = combinedRatio(ratios);
	const detail = {
		A: clauses.A,
		B: clauses.B,
		C: clauses.C,
		D: clauses.D,
		introduced: clauses.introduced,
		poolSize: clauses.poolSize,
		covered: clauses.covered,
		goodQuizzes,
		loggedQuizzes,
		weekBest
	};
	return {
		kind,
		percent: barPercent(kind, ratios),
		line: homeMissingLine(detail),
		ratios,
		combined,
		clauses: detail
	};
}

export function homeMissingLine(detail: {
	A: boolean;
	B: boolean;
	C: boolean;
	D: boolean;
	introduced: number;
	goodQuizzes: number;
	loggedQuizzes?: number;
}): string {
	if (detail.A && detail.B && detail.C && detail.D) return 'Done.';

	if (!detail.A && detail.introduced === 0 && detail.goodQuizzes === 0 && !detail.D) {
		if ((detail.loggedQuizzes ?? 0) > 0) {
			return "Daily quiz is in. Start a few cards from this room.";
		}
		return "You're on your way. Start a few cards from this room.";
	}

	if (detail.A && detail.B && detail.C && !detail.D) {
		return 'Quizzes are solid. One good week set to go.';
	}

	if (detail.A && detail.B && !detail.C) {
		const left = Math.max(0, QUIZ_STREAK - detail.goodQuizzes);
		const quizBit =
			left === 1 ? '1 more good daily quiz' : left === 2 ? '2 more good daily quizzes' : 'three good daily quizzes';
		if (!detail.D) return `Words are landing. ${quizBit}, then a week set.`;
		return `Words are landing. ${quizBit}.`;
	}

	if (detail.A && !detail.B) {
		return 'Cards are started. Keep reviewing so the words stick.';
	}

	if (!detail.A && detail.introduced > 0) {
		return "You're on your way. A few more cards from this room.";
	}

	if (!detail.A) {
		return "You're on your way. Start a few cards from this room.";
	}

	return "You're on your way.";
}

export function hubChecks(progress: GateProgress): HubCheck[] {
	const { ratios, clauses } = progress;
	return [
		{
			key: 'cards',
			label: 'cards started',
			status: clauses.A ? 'done' : clauses.introduced > 0 ? 'coming along' : 'on their way',
			ratio: ratios.A,
			done: clauses.A
		},
		{
			key: 'sticking',
			label: 'words sticking',
			status: clauses.B ? 'done' : ratios.B > 0 ? 'landing' : 'not yet',
			ratio: ratios.B,
			done: clauses.B
		},
		{
			key: 'quizzes',
			label: 'daily quizzes',
			status: clauses.C
				? 'done'
				: clauses.goodQuizzes > 0
					? `${clauses.goodQuizzes} of ${QUIZ_STREAK} good dailies`
					: clauses.loggedQuizzes > 0
						? `${clauses.loggedQuizzes} of ${QUIZ_STREAK} dailies — next at 4/5`
						: 'not yet',
			ratio: ratios.C,
			done: clauses.C
		},
		{
			key: 'week',
			label: 'week set',
			status: clauses.D ? 'done' : ratios.D > 0 ? 'close' : 'still ahead',
			ratio: ratios.D,
			done: clauses.D
		}
	];
}

export function kuromiMasterySnapshot(
	current: GateId,
	mastered: number[],
	input: MasteryInput,
	nextUnlock: string | null
): KuromiMasterySnapshot {
	const progress = evaluateGateProgress(current, current, mastered, input);
	return {
		gate: current,
		percent: progress.percent,
		pieces: kuromiPieces(progress),
		nextUnlock
	};
}

export function copyHasNoJargon(text: string): boolean {
	return !/\b(interval|iron|bronze|lp|srs)\b/i.test(text) && !text.includes('≥ 21') && !text.includes('>= 21');
}

function kuromiPieces(progress: GateProgress): KuromiMasteryPiece[] {
	const { clauses } = progress;
	const needA = Math.ceil(clauses.poolSize * INTRO_RATIO);
	const leftA = Math.max(0, needA - clauses.introduced);
	const leftC = Math.max(0, QUIZ_STREAK - clauses.goodQuizzes);

	return [
		{
			key: 'A',
			done: clauses.A,
			human: clauses.A
				? 'cards are started'
				: leftA > 0
					? `${leftA} more cards to start`
					: 'more cards from this room'
		},
		{
			key: 'B',
			done: clauses.B,
			human: clauses.B ? 'words are sticking' : 'words need more reviews to stick'
		},
		{
			key: 'C',
			done: clauses.C,
			human: clauses.C
				? 'daily quizzes are solid'
				: leftC === 1
					? '1 more daily at 4/5'
					: `${leftC} more dailies at 4/5`
		},
		{
			key: 'D',
			done: clauses.D,
			human: clauses.D ? 'week set is done' : 'one week set still to go'
		}
	];
}

function lockedProgress(): GateProgress {
	const ratios = { A: 0, B: 0, C: 0, D: 0 };
	return {
		kind: 'locked',
		percent: 0,
		line: 'Locked',
		ratios,
		combined: 0,
		clauses: {
			A: false,
			B: false,
			C: false,
			D: false,
			introduced: 0,
			poolSize: 0,
			covered: 0,
			goodQuizzes: 0,
			loggedQuizzes: 0,
			weekBest: 0
		}
	};
}

function doneProgress(): GateProgress {
	const ratios = { A: 1, B: 1, C: 1, D: 1 };
	return {
		kind: 'done',
		percent: 100,
		line: 'Done',
		ratios,
		combined: 1,
		clauses: {
			A: true,
			B: true,
			C: true,
			D: true,
			introduced: 0,
			poolSize: 0,
			covered: 0,
			goodQuizzes: QUIZ_STREAK,
			loggedQuizzes: QUIZ_STREAK,
			weekBest: 1
		}
	};
}

function countLoggedQuizzes(gate: GateId, quizLog: MasteryInput['quizLog']): number {
	return quizLog.filter((e) => e.gate === gate).length;
}

function countGoodQuizzes(
	gate: GateId,
	quizLog: MasteryInput['quizLog']
): number {
	const lastThree = quizLog.filter((e) => e.gate === gate).slice(-QUIZ_STREAK);
	return lastThree.filter(
		(e) => e.total > 0 && e.correct >= QUIZ_MIN_CORRECT && e.total >= 5
	).length;
}

function bestWeekRatio(gate: GateId, weekLog: MasteryInput['weekLog']): number {
	let best = 0;
	for (const entry of weekLog) {
		if (entry.gate !== gate || entry.total <= 0) continue;
		best = Math.max(best, entry.correct / entry.total);
	}
	return best;
}

function clamp01(n: number): number {
	if (!Number.isFinite(n) || n <= 0) return 0;
	if (n >= 1) return 1;
	return n;
}
