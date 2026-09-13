import { describe, it, expect } from 'vitest';
import type { CardReviewEntry } from '$lib/db/db';
import type { WordEntry } from '$lib/data/wordPool';
import {
	daysBetween,
	isRusty,
	getRustyWords,
	MASTERED_INTERVAL_DAYS,
	NOT_SOON_DAYS,
	UNTOUCHED_DAYS
} from '$lib/fresh/fresh';

const TODAY = '2026-04-30';

function makeReview(overrides: Partial<CardReviewEntry> & { wordId: string }): CardReviewEntry {
	return {
		interval: MASTERED_INTERVAL_DAYS,
		easeFactor: 2.5,
		repetitions: 5,
		nextReviewDate: '2026-05-01',
		lastReviewDate: '2026-04-01',
		firstSeenDate: '2025-01-01',
		...overrides
	};
}

function makeWord(id: string): WordEntry {
	return {
		id,
		dutch: `nl-${id}`,
		english: `en-${id}`,
		pos: 'noun',
		rank: 1,
		category: 'misc',
		sentence_nl: 'Zin.',
		sentence_en: 'Sentence.'
	};
}

describe('daysBetween', () => {
	it('returns 0 for same day', () => {
		expect(daysBetween('2026-04-30', '2026-04-30')).toBe(0);
	});

	it('crosses a month boundary', () => {
		expect(daysBetween('2026-04-30', '2026-05-01')).toBe(1);
		expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
		expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
	});

	it('crosses a year boundary', () => {
		expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
		expect(daysBetween('2025-12-01', '2026-01-01')).toBe(31);
	});

	it('is negative when toIso precedes fromIso', () => {
		expect(daysBetween('2026-05-01', '2026-04-30')).toBe(-1);
		expect(daysBetween('2026-01-01', '2025-12-31')).toBe(-1);
	});
});

describe('isRusty boundaries', () => {
	it('interval 20 is never rusty regardless of other fields', () => {
		const review = makeReview({
			wordId: 'w1',
			interval: MASTERED_INTERVAL_DAYS - 1, // 20
			nextReviewDate: '2026-12-31', // far out
			lastReviewDate: '2020-01-01' // very neglected
		});
		expect(isRusty(review, TODAY)).toBe(false);
	});

	it('interval 21 can be rusty when other clauses match', () => {
		const notSoon = makeReview({
			wordId: 'w1',
			interval: MASTERED_INTERVAL_DAYS, // 21
			nextReviewDate: '2026-05-15', // 15 days out
			lastReviewDate: '2026-04-20' // recent
		});
		expect(isRusty(notSoon, TODAY)).toBe(true);

		const neglected = makeReview({
			wordId: 'w2',
			interval: MASTERED_INTERVAL_DAYS,
			nextReviewDate: '2026-05-01', // soon
			lastReviewDate: '2026-03-31' // 30 days ago
		});
		expect(isRusty(neglected, TODAY)).toBe(true);
	});

	it('nextReviewDate exactly 14 days out is not rusty via that clause', () => {
		// daysBetween(today, next) === 14, need > NOT_SOON_DAYS
		const review = makeReview({
			wordId: 'w1',
			interval: MASTERED_INTERVAL_DAYS,
			nextReviewDate: '2026-05-14', // exactly 14 days out
			lastReviewDate: '2026-04-20' // only 10 days ago, not neglected
		});
		expect(daysBetween(TODAY, review.nextReviewDate)).toBe(NOT_SOON_DAYS);
		expect(isRusty(review, TODAY)).toBe(false);
	});

	it('nextReviewDate 15 days out is rusty via that clause', () => {
		const review = makeReview({
			wordId: 'w1',
			interval: MASTERED_INTERVAL_DAYS,
			nextReviewDate: '2026-05-15', // 15 days out
			lastReviewDate: '2026-04-20'
		});
		expect(daysBetween(TODAY, review.nextReviewDate)).toBe(NOT_SOON_DAYS + 1);
		expect(isRusty(review, TODAY)).toBe(true);
	});

	it('lastReviewDate exactly 29 days before today is not rusty via that clause', () => {
		// daysBetween(last, today) === 29, need >= UNTOUCHED_DAYS
		const review = makeReview({
			wordId: 'w1',
			interval: MASTERED_INTERVAL_DAYS,
			nextReviewDate: '2026-05-01', // soon, not the not-soon clause
			lastReviewDate: '2026-04-01' // 29 days before 2026-04-30
		});
		expect(daysBetween(review.lastReviewDate, TODAY)).toBe(UNTOUCHED_DAYS - 1);
		expect(isRusty(review, TODAY)).toBe(false);
	});

	it('lastReviewDate exactly 30 days before today is rusty via that clause', () => {
		const review = makeReview({
			wordId: 'w1',
			interval: MASTERED_INTERVAL_DAYS,
			nextReviewDate: '2026-05-01',
			lastReviewDate: '2026-03-31' // 30 days before 2026-04-30
		});
		expect(daysBetween(review.lastReviewDate, TODAY)).toBe(UNTOUCHED_DAYS);
		expect(isRusty(review, TODAY)).toBe(true);
	});

	it('interval less than 21 is never rusty no matter how neglected', () => {
		const review = makeReview({
			wordId: 'w1',
			interval: 5,
			nextReviewDate: '2030-01-01',
			lastReviewDate: '2023-08-01' // ~1000 days ago
		});
		expect(daysBetween(review.lastReviewDate, TODAY)).toBeGreaterThan(900);
		expect(isRusty(review, TODAY)).toBe(false);
	});
});

describe('getRustyWords', () => {
	const pool = [makeWord('w01'), makeWord('w02'), makeWord('w03'), makeWord('w04')];

	it('respects limit', () => {
		const reviews = [
			makeReview({
				wordId: 'w01',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-01'
			}),
			makeReview({
				wordId: 'w02',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-10'
			}),
			makeReview({
				wordId: 'w03',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-20'
			})
		];
		const result = getRustyWords(reviews, pool, TODAY, 2);
		expect(result).toHaveLength(2);
	});

	it('returns fewer than limit when supply is short', () => {
		const reviews = [
			makeReview({
				wordId: 'w01',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-01'
			})
		];
		const result = getRustyWords(reviews, pool, TODAY, 10);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('w01');
	});

	it('returns empty array for empty reviews input', () => {
		expect(getRustyWords([], pool, TODAY, 5)).toEqual([]);
	});

	it('skips reviews whose wordId is not in the pool', () => {
		const reviews = [
			makeReview({
				wordId: 'missing',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-01'
			}),
			makeReview({
				wordId: 'w01',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-15'
			})
		];
		const result = getRustyWords(reviews, pool, TODAY, 10);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('w01');
	});

	it('orders by days-since-lastReview DESC then wordId ASC', () => {
		const reviews = [
			makeReview({
				wordId: 'w03',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-20' // least neglected among these
			}),
			makeReview({
				wordId: 'w02',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-01' // most neglected, same as w01
			}),
			makeReview({
				wordId: 'w01',
				interval: 21,
				nextReviewDate: '2026-06-01',
				lastReviewDate: '2026-03-01' // same neglect as w02; wordId ASC → w01 first
			})
		];
		const result = getRustyWords(reviews, pool, TODAY, 10);
		expect(result.map((w) => w.id)).toEqual(['w01', 'w02', 'w03']);
	});

	it('is deterministic regardless of input array order', () => {
		const a = makeReview({
			wordId: 'w01',
			interval: 21,
			nextReviewDate: '2026-06-01',
			lastReviewDate: '2026-03-01'
		});
		const b = makeReview({
			wordId: 'w02',
			interval: 21,
			nextReviewDate: '2026-06-01',
			lastReviewDate: '2026-03-10'
		});
		const c = makeReview({
			wordId: 'w03',
			interval: 21,
			nextReviewDate: '2026-06-01',
			lastReviewDate: '2026-03-20'
		});
		const d = makeReview({
			wordId: 'w04',
			interval: 21,
			nextReviewDate: '2026-06-01',
			lastReviewDate: '2026-03-05'
		});

		const first = getRustyWords([a, b, c, d], pool, TODAY, 10);
		const second = getRustyWords([d, c, b, a], pool, TODAY, 10);
		const third = getRustyWords([c, a, d, b], pool, TODAY, 10);

		expect(first.map((w) => w.id)).toEqual(second.map((w) => w.id));
		expect(first.map((w) => w.id)).toEqual(third.map((w) => w.id));
		expect(first).toEqual(second);
		expect(first).toEqual(third);
	});
});
