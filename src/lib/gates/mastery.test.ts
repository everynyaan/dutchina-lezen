import { describe, it, expect } from 'vitest';
import { applyEvent } from '$lib/lp/lp';
import { STEWARD_TOOL_NAMES, PAGE_TOOL_NAMES } from '$lib/kuromi/executor';
import { getWordsForGate, type GateId } from './gates';
import { clauseRatios, combinedRatio } from './progress';
import {
	evaluateMastery,
	foldMissingSessionLogs,
	maybeAdvanceGates,
	quizEntryFromSession,
	recordQuizCompletion,
	recordWeekCompletion,
	unlockToastMessage,
	type MasteryInput,
	type QuizLogEntry,
	type WeekLogEntry
} from './mastery';
import type { GatesState } from '$lib/state/schema';

function emptyGates(current: GateId = 1): GatesState {
	return { current, mastered: [], quizLog: [], weekLog: [] };
}

function reviewsFor(
	gate: GateId,
	opts: { introRatio: number; coveredOfIntroduced: number; interval?: number }
): MasteryInput['cardReviews'] {
	const pool = getWordsForGate(gate);
	const introCount = Math.ceil(pool.length * opts.introRatio);
	const coveredCount = Math.ceil(introCount * opts.coveredOfIntroduced);
	const reviews: MasteryInput['cardReviews'] = {};
	for (let i = 0; i < introCount; i++) {
		const id = pool[i].id;
		reviews[id] = { interval: i < coveredCount ? (opts.interval ?? 21) : 1 };
	}
	return reviews;
}

function threeGoodQuizzes(gate: GateId): QuizLogEntry[] {
	return [1, 2, 3].map((n) => ({
		gate,
		date: `2026-08-2${n}`,
		correct: 4,
		total: 5
	}));
}

function goodWeek(gate: GateId): WeekLogEntry {
	return { gate, week: '2026-W34', correct: 28, total: 36 };
}

function fullEvidence(gate: GateId): MasteryInput {
	return {
		cardReviews: reviewsFor(gate, { introRatio: 0.4, coveredOfIntroduced: 0.7 }),
		quizLog: threeGoodQuizzes(gate),
		weekLog: [goodWeek(gate)]
	};
}

describe('evaluateMastery predicates', () => {
	it('A is false below 40% of the gate allowlist (not rank 0–1)', () => {
		const gate = 1;
		const pool = getWordsForGate(1);
		expect(pool.length).toBeGreaterThan(0);
		const justUnder = reviewsFor(gate, { introRatio: 0.39, coveredOfIntroduced: 1 });
		const clauses = evaluateMastery(1, {
			cardReviews: justUnder,
			quizLog: [],
			weekLog: []
		});
		expect(clauses.A).toBe(false);
		expect(clauses.introduced / clauses.poolSize).toBeLessThan(0.4);
	});

	it('A is true at ≥40% of this gate’s word pool', () => {
		const clauses = evaluateMastery(1, {
			cardReviews: reviewsFor(1, { introRatio: 0.4, coveredOfIntroduced: 0 }),
			quizLog: [],
			weekLog: []
		});
		expect(clauses.A).toBe(true);
		expect(clauses.B).toBe(false);
	});

	it('B is of introduced gate words at interval ≥ 21, not the whole pool', () => {
		const fail = evaluateMastery(1, {
			cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.69 }),
			quizLog: [],
			weekLog: []
		});
		expect(fail.B).toBe(false);
		const pass = evaluateMastery(1, {
			cardReviews: reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.7 }),
			quizLog: [],
			weekLog: []
		});
		expect(pass.B).toBe(true);
	});

	it('C needs the last 3 quizzes generated under this gate at ≥4/5', () => {
		const two = evaluateMastery(1, {
			cardReviews: {},
			quizLog: threeGoodQuizzes(1).slice(0, 2),
			weekLog: []
		});
		expect(two.C).toBe(false);
		const weak = evaluateMastery(1, {
			cardReviews: {},
			quizLog: [
				...threeGoodQuizzes(1).slice(0, 2),
				{ gate: 1, date: '2026-08-24', correct: 3, total: 5 }
			],
			weekLog: []
		});
		expect(weak.C).toBe(false);
		const otherGate = evaluateMastery(1, {
			cardReviews: {},
			quizLog: threeGoodQuizzes(2),
			weekLog: []
		});
		expect(otherGate.C).toBe(false);
		const pass = evaluateMastery(1, {
			cardReviews: {},
			quizLog: threeGoodQuizzes(1),
			weekLog: []
		});
		expect(pass.C).toBe(true);
	});

	it('D needs one completed week set under this gate at ≥70%', () => {
		const fail = evaluateMastery(1, {
			cardReviews: {},
			quizLog: [],
			weekLog: [{ gate: 1, week: '2026-W34', correct: 25, total: 36 }]
		});
		expect(fail.D).toBe(false);
		const pass = evaluateMastery(1, {
			cardReviews: {},
			quizLog: [],
			weekLog: [goodWeek(1)]
		});
		expect(pass.D).toBe(true);
	});

	it('mastered only when A ∧ B ∧ C ∧ D', () => {
		const full = fullEvidence(1);
		expect(evaluateMastery(1, full).mastered).toBe(true);
		expect(evaluateMastery(1, { ...full, weekLog: [] }).mastered).toBe(false);
		expect(evaluateMastery(1, { ...full, quizLog: [] }).mastered).toBe(false);
		expect(
			evaluateMastery(1, {
				...full,
				cardReviews: reviewsFor(1, { introRatio: 0.4, coveredOfIntroduced: 0 })
			}).mastered
		).toBe(false);
	});
});

describe('maybeAdvanceGates', () => {
	it('advances 1→2 and writes mastered when the predicate is true', () => {
		const evidence = fullEvidence(1);
		const gates = {
			...emptyGates(1),
			quizLog: evidence.quizLog,
			weekLog: evidence.weekLog
		};
		const next = maybeAdvanceGates(gates, evidence.cardReviews);
		expect(next.gates.current).toBe(2);
		expect(next.gates.mastered).toEqual([1]);
		expect(next.unlocked).toBe(2);
		expect(unlockToastMessage(2)).toContain('Everyday Dutch');
	});

	it('is one-way: never decreases current', () => {
		const next = maybeAdvanceGates(
			{ current: 3, mastered: [1, 2], quizLog: [], weekLog: [] },
			{}
		);
		expect(next.gates.current).toBe(3);
		expect(next.unlocked).toBeNull();
	});

	it('does not advance from empty SRS even if rank is high', () => {
		const next = maybeAdvanceGates(emptyGates(1), {});
		expect(next.gates.current).toBe(1);
		expect(next.unlocked).toBeNull();
	});

	it('boss win / LP overflow do not write currentGate', () => {
		const gates = emptyGates(1);
		const afterBoss = applyEvent(
			{ rank: 0, tier: 4, lp: 90, totalLp: 390, bossCleared: true },
			{ type: 'boss_win', tier: 4 }
		);
		expect(afterBoss.rank).toBeGreaterThanOrEqual(0);
		const next = maybeAdvanceGates(gates, {});
		expect(next.gates.current).toBe(1);
		expect(next.gates.mastered).toEqual([]);

		const overflow = applyEvent(
			{ rank: 2, tier: 4, lp: 95, totalLp: 1000, bossCleared: true },
			{ type: 'mission_complete' }
		);
		expect(overflow.rankChanged).toBe(true);
		expect(maybeAdvanceGates(gates, {}).gates.current).toBe(1);
	});

	it('a card-review flip of B can unlock when A, C, D already hold', () => {
		const weakB = reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.5 });
		const gates = {
			...emptyGates(1),
			quizLog: threeGoodQuizzes(1),
			weekLog: [goodWeek(1)]
		};
		expect(maybeAdvanceGates(gates, weakB).unlocked).toBeNull();
		const strongB = reviewsFor(1, { introRatio: 0.5, coveredOfIntroduced: 0.7 });
		expect(maybeAdvanceGates(gates, strongB).gates.current).toBe(2);
	});
});

describe('logs', () => {
	it('upserts quiz by gate+date and week by gate+week', () => {
		let gates = emptyGates(1);
		gates = recordQuizCompletion(gates, { gate: 1, date: '2026-08-29', correct: 3, total: 5 });
		gates = recordQuizCompletion(gates, { gate: 1, date: '2026-08-29', correct: 5, total: 5 });
		expect(gates.quizLog).toHaveLength(1);
		expect(gates.quizLog[0].correct).toBe(5);
		gates = recordWeekCompletion(gates, { gate: 1, week: '2026-W35', correct: 20, total: 36 });
		gates = recordWeekCompletion(gates, { gate: 1, week: '2026-W35', correct: 30, total: 36 });
		expect(gates.weekLog).toHaveLength(1);
		expect(gates.weekLog[0].correct).toBe(30);
	});

	it('G1 daily 4/5 writes one quizLog row, C is 1/3, fill > 0, boss/LP still do not unlock', () => {
		let gates = emptyGates(1);
		gates = recordQuizCompletion(gates, { gate: 1, date: '2026-08-30', correct: 4, total: 5 });
		expect(gates.quizLog).toHaveLength(1);
		const input = { cardReviews: {}, quizLog: gates.quizLog, weekLog: gates.weekLog };
		expect(clauseRatios(1, input).C).toBeCloseTo(1 / 3);
		expect(combinedRatio(clauseRatios(1, input))).toBeGreaterThan(0);
		expect(maybeAdvanceGates(gates, {}).unlocked).toBeNull();
		expect(maybeAdvanceGates(gates, {}).gates.current).toBe(1);
	});

	it('G2 current logs gate: 2', () => {
		const entry = quizEntryFromSession(2, {
			date: '2026-08-30',
			completed: true,
			results: { a: true, b: true, c: true, d: true, e: false },
			questionIds: ['a', 'b', 'c', 'd', 'e']
		});
		expect(entry).toMatchObject({ gate: 2, correct: 4, total: 5 });
		let gates = emptyGates(2);
		gates = recordQuizCompletion(gates, entry!);
		expect(gates.quizLog[0].gate).toBe(2);
		expect(clauseRatios(2, { cardReviews: {}, quizLog: gates.quizLog, weekLog: [] }).C).toBeCloseTo(
			1 / 3
		);
	});

	it('Practice Again / same-date fold does not double-log or overwrite a good daily', () => {
		let gates = emptyGates(1);
		gates = recordQuizCompletion(gates, { gate: 1, date: '2026-08-30', correct: 4, total: 5 });
		const folded = foldMissingSessionLogs(gates, {
			date: '2026-08-30',
			completed: true,
			results: { a: false, b: false, c: false, d: false, e: false },
			questionIds: ['a', 'b', 'c', 'd', 'e']
		});
		expect(folded.quizLog).toHaveLength(1);
		expect(folded.quizLog[0].correct).toBe(4);
	});

	it('completing a week set moves D', () => {
		let gates = emptyGates(1);
		gates = recordWeekCompletion(gates, { gate: 1, week: '2026-W35', correct: 28, total: 36 });
		expect(clauseRatios(1, { cardReviews: {}, quizLog: [], weekLog: gates.weekLog }).D).toBe(1);
		expect(combinedRatio(clauseRatios(1, { cardReviews: {}, quizLog: [], weekLog: gates.weekLog }))).toBeGreaterThan(
			0
		);
	});
});

describe('tools cannot write currentGate', () => {
	it('exposes no set_gate / unlock_gate', () => {
		const tools = [...STEWARD_TOOL_NAMES, ...PAGE_TOOL_NAMES];
		expect(tools).not.toContain('set_gate');
		expect(tools).not.toContain('unlock_gate');
	});
});
