import { describe, it, expect } from 'vitest';
import { schedule, createNewCardSchedule, addDays, isDue, getTodayDate } from '$lib/cards/srs';

describe('SRS schedule', () => {
	const today = '2026-04-30';

	describe('new card (repetitions=0)', () => {
		const fresh = createNewCardSchedule();

		it('again: interval 1, reps stay 0, ease decreases', () => {
			const result = schedule(fresh, 'again', today);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(0);
			expect(result.easeFactor).toBe(2.3);
			expect(result.nextReviewDate).toBe('2026-05-01');
		});

		it('hard: interval 1, reps go to 1, ease decreases', () => {
			const result = schedule(fresh, 'hard', today);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
			expect(result.easeFactor).toBe(2.35);
		});

		it('good: interval 1, reps go to 1, ease unchanged', () => {
			const result = schedule(fresh, 'good', today);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
			expect(result.easeFactor).toBe(2.5);
		});

		it('easy: interval 4, reps go to 1, ease increases', () => {
			const result = schedule(fresh, 'easy', today);
			expect(result.interval).toBe(4);
			expect(result.repetitions).toBe(1);
			expect(result.easeFactor).toBe(2.65);
			expect(result.nextReviewDate).toBe('2026-05-04');
		});
	});

	describe('second review (repetitions=1)', () => {
		const afterFirst = { interval: 1, easeFactor: 2.5, repetitions: 1 };

		it('good: interval 6', () => {
			const result = schedule(afterFirst, 'good', today);
			expect(result.interval).toBe(6);
			expect(result.repetitions).toBe(2);
		});

		it('hard: interval 4', () => {
			const result = schedule(afterFirst, 'hard', today);
			expect(result.interval).toBe(4);
			expect(result.repetitions).toBe(2);
		});

		it('easy: interval 8', () => {
			const result = schedule(afterFirst, 'easy', today);
			expect(result.interval).toBe(8);
			expect(result.repetitions).toBe(2);
		});

		it('again: resets to interval 1, reps 0', () => {
			const result = schedule(afterFirst, 'again', today);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(0);
		});
	});

	describe('mature card (repetitions >= 2)', () => {
		const mature = { interval: 10, easeFactor: 2.5, repetitions: 3 };

		it('good: interval = ceil(10 * 2.5) = 25', () => {
			const result = schedule(mature, 'good', today);
			expect(result.interval).toBe(25);
		});

		it('hard: interval = ceil(10 * 1.2) = 12', () => {
			const result = schedule(mature, 'hard', today);
			expect(result.interval).toBe(12);
		});

		it('easy: interval = ceil(10 * 2.5 * 1.3) = 33', () => {
			const result = schedule(mature, 'easy', today);
			expect(result.interval).toBe(33);
		});

		it('again: resets to 1', () => {
			const result = schedule(mature, 'again', today);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(0);
		});
	});

	describe('ease factor bounds', () => {
		it('ease never drops below 1.3', () => {
			const state = { interval: 1, easeFactor: 1.4, repetitions: 0 };
			const result = schedule(state, 'again', today);
			expect(result.easeFactor).toBe(1.3);

			// Hit again from 1.3
			const result2 = schedule({ interval: 1, easeFactor: 1.3, repetitions: 0 }, 'again', today);
			expect(result2.easeFactor).toBe(1.3);
		});

		it('ease never exceeds 3.0', () => {
			const state = { interval: 10, easeFactor: 2.95, repetitions: 3 };
			const result = schedule(state, 'easy', today);
			expect(result.easeFactor).toBe(3.0);
		});
	});
});

describe('date helpers', () => {
	it('addDays adds correctly', () => {
		expect(addDays('2026-04-30', 1)).toBe('2026-05-01');
		expect(addDays('2026-04-30', 6)).toBe('2026-05-06');
		expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
	});

	it('isDue returns true for today and past dates', () => {
		const today = '2026-04-30';
		expect(isDue('2026-04-30', today)).toBe(true);
		expect(isDue('2026-04-29', today)).toBe(true);
		expect(isDue('2026-05-01', today)).toBe(false);
	});

	it('getTodayDate returns a valid date string', () => {
		const today = getTodayDate();
		expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
