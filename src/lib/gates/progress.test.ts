import { describe, it, expect } from 'vitest';
import { getWordsForGate, type GateId } from './gates';
import { GATE_COPY } from './home';
import {
	COVERAGE_RATIO,
	INTRO_RATIO,
	commitDailyQuiz,
	evaluateMastery,
	type MasteryInput,
	type QuizLogEntry,
	type WeekLogEntry
} from './mastery';
import { homeGateCards } from './home';
import {
	barPercent,
	clauseRatios,
	combinedRatio,
	copyHasNoJargon,
	EMPTY_MASTERY_INPUT,
	evaluateGateProgress,
	homeMissingLine,
	hubChecks,
	kuromiMasterySnapshot,
	masteryInputFromState,
	progressKind
} from './progress';

function reviewsFor(
	gate: GateId,
	opts: { introRatio: number; coveredOfIntroduced: number; interval?: number }
): MasteryInput['cardReviews'] {
	const pool = getWordsForGate(gate);
	const introCount = Math.ceil(pool.length * opts.introRatio);
	const coveredCount = Math.ceil(introCount * opts.coveredOfIntroduced);
	const reviews: MasteryInput['cardReviews'] = {};
	for (let i = 0; i < introCount; i++) {
		reviews[pool[i].id] = { interval: i < coveredCount ? (opts.interval ?? 21) : 1 };
	}
	return reviews;
}

function quizzes(gate: GateId, scores: number[]): QuizLogEntry[] {
	return scores.map((correct, i) => ({
		gate,
		date: `2026-08-${String(20 + i).padStart(2, '0')}`,
		correct,
		total: 5
	}));
}

function week(gate: GateId, correct: number, total = 36): WeekLogEntry {
	return { gate, week: '2026-W34', correct, total };
}

describe('clauseRatios from fixture state', () => {
	it('empty state is all zeros; combined is 0', () => {
		const ratios = clauseRatios(1, EMPTY_MASTERY_INPUT);
		expect(ratios).toEqual({ A: 0, B: 0, C: 0, D: 0 });
		expect(combinedRatio(ratios)).toBe(0);
	});

	it('A reaches 1 at the 40% intro threshold, not raw pool share', () => {
		const input: MasteryInput = {
			cardReviews: reviewsFor(1, { introRatio: INTRO_RATIO, coveredOfIntroduced: 0 }),
			quizLog: [],
			weekLog: []
		};
		const clauses = evaluateMastery(1, input);
		expect(clauses.A).toBe(true);
		const ratios = clauseRatios(1, input);
		expect(ratios.A).toBe(1);
		expect(ratios.B).toBe(0);
		expect(combinedRatio(ratios)).toBeCloseTo(0.25);
	});

	it('A is partial below 40% of the gate pool', () => {
		const input: MasteryInput = {
			cardReviews: reviewsFor(1, { introRatio: 0.2, coveredOfIntroduced: 1 }),
			quizLog: [],
			weekLog: []
		};
		const ratios = clauseRatios(1, input);
		expect(ratios.A).toBeGreaterThan(0);
		expect(ratios.A).toBeLessThan(1);
		expect(evaluateMastery(1, input).A).toBe(false);
	});

	it('B is of introduced cards toward 70% sticking, 0 when none introduced', () => {
		expect(clauseRatios(1, EMPTY_MASTERY_INPUT).B).toBe(0);
		const half: MasteryInput = {
			cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.35 }),
			quizLog: [],
			weekLog: []
		};
		expect(clauseRatios(1, half).B).toBeGreaterThan(0);
		expect(clauseRatios(1, half).B).toBeLessThan(1);
		const pass: MasteryInput = {
			cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: COVERAGE_RATIO }),
			quizLog: [],
			weekLog: []
		};
		expect(clauseRatios(1, pass).B).toBe(1);
		expect(evaluateMastery(1, pass).B).toBe(true);
	});

	it('C is finished-dailies / 3; other-gate quizzes do not count', () => {
		expect(clauseRatios(1, { cardReviews: {}, quizLog: quizzes(1, [4]), weekLog: [] }).C).toBeCloseTo(
			1 / 3
		);
		expect(
			clauseRatios(1, { cardReviews: {}, quizLog: quizzes(1, [4, 5]), weekLog: [] }).C
		).toBeCloseTo(2 / 3);
		expect(clauseRatios(1, { cardReviews: {}, quizLog: quizzes(1, [4, 5, 4]), weekLog: [] }).C).toBe(
			1
		);
		expect(clauseRatios(1, { cardReviews: {}, quizLog: quizzes(2, [5, 5, 5]), weekLog: [] }).C).toBe(
			0
		);
	});

	it('D is best week / 70%, 0 when missing', () => {
		expect(clauseRatios(1, { cardReviews: {}, quizLog: [], weekLog: [] }).D).toBe(0);
		const partial = clauseRatios(1, {
			cardReviews: {},
			quizLog: [],
			weekLog: [week(1, 18, 36)]
		});
		expect(partial.D).toBeCloseTo(0.5 / 0.7);
		expect(partial.D).toBeLessThan(1);
		expect(clauseRatios(1, { cardReviews: {}, quizLog: [], weekLog: [week(1, 28, 36)] }).D).toBe(1);
	});

	it('combined is the average so one finished clause still moves the bar; unlock stays AND', () => {
		const almost: MasteryInput = {
			cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.7 }),
			quizLog: quizzes(1, [4, 5, 4]),
			weekLog: []
		};
		const ratios = clauseRatios(1, almost);
		expect(ratios.A).toBe(1);
		expect(ratios.B).toBe(1);
		expect(ratios.C).toBe(1);
		expect(ratios.D).toBe(0);
		expect(combinedRatio(ratios)).toBeCloseTo(0.75);
		expect(barPercent('open', ratios)).toBe(75);
		expect(evaluateMastery(1, almost).mastered).toBe(false);

		const full: MasteryInput = {
			...almost,
			weekLog: [week(1, 28, 36)]
		};
		expect(combinedRatio(clauseRatios(1, full))).toBe(1);
		expect(evaluateMastery(1, full).mastered).toBe(true);
	});

	it('one good G1 daily is C = 1/3 and overall fill > 0', () => {
		const input: MasteryInput = {
			cardReviews: {},
			quizLog: quizzes(1, [4]),
			weekLog: []
		};
		const ratios = clauseRatios(1, input);
		expect(ratios.C).toBeCloseTo(1 / 3);
		expect(combinedRatio(ratios)).toBeGreaterThan(0);
		expect(barPercent('open', ratios)).toBeGreaterThan(0);
		const checks = hubChecks(evaluateGateProgress(1, 1, [], input));
		expect(checks[2].status).toBe('1 of 3 good dailies');
	});

	it('a finished daily below 4/5 still moves C and the overall bar', () => {
		const input: MasteryInput = {
			cardReviews: {},
			quizLog: [{ gate: 1, date: '2026-08-29', correct: 3, total: 5 }],
			weekLog: []
		};
		expect(clauseRatios(1, input).C).toBeCloseTo(1 / 3);
		expect(combinedRatio(clauseRatios(1, input))).toBeGreaterThan(0);
		expect(barPercent('open', clauseRatios(1, input))).toBeGreaterThan(0);
		const checks = hubChecks(evaluateGateProgress(1, 1, [], input));
		expect(checks[2].status).toBe('1 of 3 dailies — next at 4/5');
		expect(evaluateMastery(1, input).C).toBe(false);
	});
});

describe('progress kind and bars', () => {
	it('locked later gates stay at 0; earlier/mastered are full', () => {
		expect(progressKind(3, 1, [])).toBe('locked');
		expect(barPercent('locked', { A: 1, B: 1, C: 1, D: 1 })).toBe(0);
		expect(evaluateGateProgress(3, 1, [], EMPTY_MASTERY_INPUT)).toMatchObject({
			kind: 'locked',
			percent: 0,
			line: 'Locked'
		});

		expect(progressKind(1, 2, [1])).toBe('done');
		expect(evaluateGateProgress(1, 2, [1], EMPTY_MASTERY_INPUT)).toMatchObject({
			kind: 'done',
			percent: 100,
			line: 'Done'
		});
		expect(progressKind(1, 2, [])).toBe('done');
	});

	it('current open gate uses the average ratio so started cards move the bar', () => {
		const open = evaluateGateProgress(1, 1, [], {
			cardReviews: reviewsFor(1, { introRatio: 0.2, coveredOfIntroduced: 0 }),
			quizLog: [],
			weekLog: []
		});
		expect(open.kind).toBe('open');
		expect(open.percent).toBeGreaterThan(0);
		expect(open.percent).toBe(Math.round(open.combined * 100));
		expect(open.ratios.A).toBeGreaterThan(0);
	});
});

describe('home and hub copy', () => {
	it('fresh open line is warm and names the next step', () => {
		const line = homeMissingLine({
			A: false,
			B: false,
			C: false,
			D: false,
			introduced: 0,
			goodQuizzes: 0
		});
		expect(line).toBe("You're on your way. Start a few cards from this room.");
		expect(copyHasNoJargon(line)).toBe(true);
		expect(
			homeMissingLine({
				A: false,
				B: false,
				C: false,
				D: false,
				introduced: 0,
				goodQuizzes: 0,
				loggedQuizzes: 1
			})
		).toBe('Daily quiz is in. Start a few cards from this room.');
	});

	it('example: words landing, 1 quiz left, then a week set', () => {
		const line = homeMissingLine({
			A: true,
			B: true,
			C: false,
			D: false,
			introduced: 70,
			goodQuizzes: 2
		});
		expect(line).toBe('Words are landing. 1 more good daily quiz, then a week set.');
		expect(copyHasNoJargon(line)).toBe(true);
	});

	it('never dumps SRS / Iron / LP jargon', () => {
		const lines = [
			homeMissingLine({
				A: true,
				B: false,
				C: false,
				D: false,
				introduced: 70,
				goodQuizzes: 0
			}),
			homeMissingLine({
				A: true,
				B: true,
				C: true,
				D: false,
				introduced: 70,
				goodQuizzes: 3
			})
		];
		for (const line of lines) {
			expect(copyHasNoJargon(line)).toBe(true);
			expect(line).not.toMatch(/interval/i);
			expect(line).not.toMatch(/Iron|LP|21/);
		}
	});

	it('hub checks are four calm labels, not a spreadsheet', () => {
		const progress = evaluateGateProgress(1, 1, [], {
			cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.7 }),
			quizLog: quizzes(1, [4, 5]),
			weekLog: []
		});
		const checks = hubChecks(progress);
		expect(checks.map((c) => c.key)).toEqual(['cards', 'sticking', 'quizzes', 'week']);
		expect(checks.map((c) => c.label)).toEqual([
			'cards started',
			'words sticking',
			'daily quizzes',
			'week set'
		]);
		expect(checks[0].done).toBe(true);
		expect(checks[1].done).toBe(true);
		expect(checks[2].status).toBe('2 of 3 good dailies');
		expect(checks[3].status).toBe('still ahead');
		expect(checks[3].ratio).toBe(0);
		for (const check of checks) {
			expect(copyHasNoJargon(`${check.label} ${check.status}`)).toBe(true);
		}
	});
});

describe('session fold into mastery input', () => {
	it('commitDailyQuiz (same writer /quiz calls) at 2/5 moves home Gate 1 off 0%', () => {
		const quiz = {
			date: '2026-08-30',
			completed: true,
			results: { a: true, b: true, c: false, d: false, e: false },
			questionIds: ['a', 'b', 'c', 'd', 'e']
		};
		const { gates, entry } = commitDailyQuiz(
			{ current: 1, mastered: [], quizLog: [], weekLog: [] },
			1,
			quiz,
			{}
		);
		expect(entry).toMatchObject({ gate: 1, correct: 2, total: 5, date: '2026-08-30' });
		const cards = homeGateCards(1, {
			cardReviews: {},
			quizLog: gates.quizLog,
			weekLog: gates.weekLog
		});
		expect(cards[0].progress.percent).toBeGreaterThan(0);
		expect(cards[0].progress.ratios.C).toBeCloseTo(1 / 3);
		const checks = hubChecks(cards[0].progress);
		expect(checks[2].status).not.toBe('not yet');
		expect(checks[2].ratio).toBeGreaterThan(0);
		expect(evaluateMastery(1, { cardReviews: {}, quizLog: gates.quizLog, weekLog: [] }).C).toBe(
			false
		);
	});

	it('the same writer on Gate 2–4 moves that gate’s bar', () => {
		const quiz = {
			date: '2026-08-30',
			completed: true,
			results: { a: true, b: false, c: false, d: false, e: false },
			questionIds: ['a', 'b', 'c', 'd', 'e']
		};
		for (const n of [2, 3, 4] as const) {
			const { gates, entry } = commitDailyQuiz(
				{ current: n, mastered: [], quizLog: [], weekLog: [] },
				n,
				quiz,
				{}
			);
			expect(entry?.gate).toBe(n);
			const cards = homeGateCards(n, {
				cardReviews: {},
				quizLog: gates.quizLog,
				weekLog: []
			});
			const card = cards.find((c) => c.n === n);
			expect(card?.progress.percent).toBeGreaterThan(0);
		}
	});

	it('folds a completed G1 daily 4/5 into quizLog so C is 1/3', () => {
		const input = masteryInputFromState({
			cardReviews: {},
			gates: { current: 1, mastered: [], quizLog: [], weekLog: [] },
			dailyQuiz: {
				date: '2026-08-30',
				completed: true,
				results: { a: true, b: true, c: true, d: true, e: false },
				questionIds: ['a', 'b', 'c', 'd', 'e']
			}
		});
		expect(input.quizLog).toHaveLength(1);
		expect(input.quizLog[0]).toMatchObject({ gate: 1, correct: 4, total: 5 });
		expect(clauseRatios(1, input).C).toBeCloseTo(1 / 3);
		expect(combinedRatio(clauseRatios(1, input))).toBeGreaterThan(0);
	});

	it('a completed week set moves D', () => {
		const input = masteryInputFromState({
			cardReviews: {},
			gates: { current: 1, mastered: [], quizLog: [], weekLog: [] },
			dailyHomework: {
				date: '2026-W35',
				completed: true,
				results: Object.fromEntries(
					Array.from({ length: 36 }, (_, i) => [i, i < 28])
				) as Record<number, boolean>,
				questions: Array.from({ length: 36 }, () => ({}))
			}
		});
		expect(input.weekLog).toHaveLength(1);
		expect(input.weekLog[0]).toMatchObject({ gate: 1, correct: 28, total: 36 });
		expect(clauseRatios(1, input).D).toBe(1);
	});
});

describe('Kuromi mastery snapshot', () => {
	it('names missing pieces in human terms and the next-room when line', () => {
		const snap = kuromiMasterySnapshot(
			1,
			[],
			{
				cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.7 }),
				quizLog: quizzes(1, [4]),
				weekLog: []
			},
			GATE_COPY[2].when
		);
		expect(snap.gate).toBe(1);
		expect(snap.percent).toBeGreaterThan(0);
		expect(snap.nextUnlock).toBe(GATE_COPY[2].when);
		expect(snap.pieces.map((p) => p.key)).toEqual(['A', 'B', 'C', 'D']);
		expect(snap.pieces.find((p) => p.key === 'C')?.human).toBe('2 more dailies at 4/5');
		expect(snap.pieces.find((p) => p.key === 'D')?.human).toBe('one week set still to go');
		for (const piece of snap.pieces) {
			expect(piece.human).not.toMatch(/interval/i);
			expect(piece.human).not.toMatch(/Iron|LP/);
		}
	});
});
