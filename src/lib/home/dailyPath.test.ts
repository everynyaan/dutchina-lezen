import { describe, it, expect } from 'vitest';
import { resolveGlowTarget, daysRemainingInWeek } from './dailyPath';
import type { DailyPathInput } from './dailyPath';
import { DEFAULT_GLOW_ORDER } from '$lib/state/schema';

function input(overrides: Partial<DailyPathInput> = {}): DailyPathInput {
	return {
		quizDoneToday: true,
		tekstDoneToday: true,
		weeksetUnfinished: false,
		daysRemainingInWeek: 7,
		...overrides
	};
}

describe('resolveGlowTarget', () => {
	it('branch 1: weekset unfinished and <=2 days remain -> weekset', () => {
		expect(resolveGlowTarget(input({ weeksetUnfinished: true, daysRemainingInWeek: 2 }))).toBe(
			'weekset'
		);
		expect(resolveGlowTarget(input({ weeksetUnfinished: true, daysRemainingInWeek: 1 }))).toBe(
			'weekset'
		);
	});

	it('branch 2: quiz not done today -> quiz (when branch 1 does not fire)', () => {
		expect(resolveGlowTarget(input({ quizDoneToday: false, weeksetUnfinished: false }))).toBe(
			'quiz'
		);
	});

	it('branch 3: tekst not done today -> tekst (when branches 1-2 do not fire)', () => {
		expect(
			resolveGlowTarget(
				input({ quizDoneToday: true, tekstDoneToday: false, weeksetUnfinished: false })
			)
		).toBe('tekst');
	});

	it('branch 4: weekset unfinished with >2 days remaining, quiz and tekst both done -> weekset', () => {
		expect(
			resolveGlowTarget(
				input({
					quizDoneToday: true,
					tekstDoneToday: true,
					weeksetUnfinished: true,
					daysRemainingInWeek: 3
				})
			)
		).toBe('weekset');
	});

	it('branch 5: all clear -> klaar', () => {
		expect(
			resolveGlowTarget(
				input({ quizDoneToday: true, tekstDoneToday: true, weeksetUnfinished: false })
			)
		).toBe('klaar');
	});

	it('branch-1 vs branch-4 split: 3 days left defers to quiz/tekst first', () => {
		const result = resolveGlowTarget(
			input({
				quizDoneToday: false,
				tekstDoneToday: false,
				weeksetUnfinished: true,
				daysRemainingInWeek: 3
			})
		);
		expect(result).toBe('quiz');
	});

	it('branch-1 vs branch-4 split: 2 days left jumps the queue ahead of quiz/tekst', () => {
		const result = resolveGlowTarget(
			input({
				quizDoneToday: false,
				tekstDoneToday: false,
				weeksetUnfinished: true,
				daysRemainingInWeek: 2
			})
		);
		expect(result).toBe('weekset');
	});

	it('a finished weekset never yields weekset, regardless of days remaining or quiz/tekst state', () => {
		for (const daysRemainingInWeekVal of [1, 2, 3, 4, 5, 6, 7]) {
			for (const quizDoneToday of [true, false]) {
				for (const tekstDoneToday of [true, false]) {
					const result = resolveGlowTarget(
						input({
							weeksetUnfinished: false,
							daysRemainingInWeek: daysRemainingInWeekVal,
							quizDoneToday,
							tekstDoneToday
						})
					);
					expect(result).not.toBe('weekset');
				}
			}
		}
	});
});

describe('daysRemainingInWeek', () => {
	// 2024-01-01 is a Monday (UTC).
	const MONDAY = new Date(Date.UTC(2024, 0, 1));
	const TUESDAY = new Date(Date.UTC(2024, 0, 2));
	const WEDNESDAY = new Date(Date.UTC(2024, 0, 3));
	const THURSDAY = new Date(Date.UTC(2024, 0, 4));
	const FRIDAY = new Date(Date.UTC(2024, 0, 5));
	const SATURDAY = new Date(Date.UTC(2024, 0, 6));
	const SUNDAY = new Date(Date.UTC(2024, 0, 7));

	it('Monday -> 7', () => expect(daysRemainingInWeek(MONDAY)).toBe(7));
	it('Tuesday -> 6', () => expect(daysRemainingInWeek(TUESDAY)).toBe(6));
	it('Wednesday -> 5', () => expect(daysRemainingInWeek(WEDNESDAY)).toBe(5));
	it('Thursday -> 4', () => expect(daysRemainingInWeek(THURSDAY)).toBe(4));
	it('Friday -> 3', () => expect(daysRemainingInWeek(FRIDAY)).toBe(3));
	it('Saturday -> 2', () => expect(daysRemainingInWeek(SATURDAY)).toBe(2));
	it('Sunday -> 1', () => expect(daysRemainingInWeek(SUNDAY)).toBe(1));
});

describe('resolveGlowTarget with custom order', () => {
	it('reordered order changes which target wins when multiple rules match', () => {
		const both = input({
			quizDoneToday: false,
			tekstDoneToday: false,
			weeksetUnfinished: true,
			daysRemainingInWeek: 1
		});
		// Canon default would pick weekset-urgent -> weekset; quiz-first order picks quiz.
		expect(resolveGlowTarget(both, ['quiz', 'weekset-urgent', 'tekst', 'weekset'])).toBe('quiz');
	});

	it("order omitting 'quiz' never returns quiz even when quiz is the only match", () => {
		const quizOnly = input({
			quizDoneToday: false,
			tekstDoneToday: true,
			weeksetUnfinished: false,
			daysRemainingInWeek: 7
		});
		const result = resolveGlowTarget(quizOnly, ['weekset-urgent', 'tekst', 'weekset']);
		expect(result).not.toBe('quiz');
		expect(result).toBe('klaar');
	});

	it('empty order always returns klaar (never glows)', () => {
		const everyBranchWouldFire = input({
			quizDoneToday: false,
			tekstDoneToday: false,
			weeksetUnfinished: true,
			daysRemainingInWeek: 1
		});
		expect(resolveGlowTarget(everyBranchWouldFire, [])).toBe('klaar');
	});

	it("order of only ['weekset'] ignores quiz/tekst and urgent timing", () => {
		expect(
			resolveGlowTarget(
				input({
					quizDoneToday: false,
					tekstDoneToday: false,
					weeksetUnfinished: true,
					daysRemainingInWeek: 7
				}),
				['weekset']
			)
		).toBe('weekset');
		expect(
			resolveGlowTarget(
				input({
					quizDoneToday: false,
					tekstDoneToday: false,
					weeksetUnfinished: false,
					daysRemainingInWeek: 1
				}),
				['weekset']
			)
		).toBe('klaar');
		const unfinished = resolveGlowTarget(
			input({
				quizDoneToday: false,
				tekstDoneToday: false,
				weeksetUnfinished: true,
				daysRemainingInWeek: 1
			}),
			['weekset']
		);
		expect(unfinished).toBe('weekset');
		expect(unfinished).not.toBe('quiz');
		expect(unfinished).not.toBe('tekst');
	});

	it('default-argument path equals explicit DEFAULT_GLOW_ORDER across the truth table', () => {
		for (const quizDoneToday of [true, false]) {
			for (const tekstDoneToday of [true, false]) {
				for (const weeksetUnfinished of [true, false]) {
					for (const daysRemainingInWeekVal of [1, 2, 3, 7]) {
						const i = input({
							quizDoneToday,
							tekstDoneToday,
							weeksetUnfinished,
							daysRemainingInWeek: daysRemainingInWeekVal
						});
						expect(resolveGlowTarget(i)).toBe(resolveGlowTarget(i, DEFAULT_GLOW_ORDER));
					}
				}
			}
		}
	});
});
