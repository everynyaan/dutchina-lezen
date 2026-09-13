import { describe, it, expect } from 'vitest';
import { mulberry32, seededRng, shuffle, sample } from './rng';

describe('mulberry32', () => {
	it('reproduces a deterministic sequence for a fixed numeric seed', () => {
		const a = mulberry32(12345);
		const b = mulberry32(12345);
		const seqA = [a(), a(), a(), a(), a()];
		const seqB = [b(), b(), b(), b(), b()];
		expect(seqA).toEqual(seqB);
		// Values are floats in [0, 1)
		for (const v of seqA) {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
});

describe('shuffle', () => {
	it('is deterministic for a given seed and does not mutate the input', () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8];
		const original = [...input];

		const out1 = shuffle(input, seededRng('shuffle-seed'));
		const out2 = shuffle(input, seededRng('shuffle-seed'));

		expect(out1).toEqual(out2);
		// Input not mutated
		expect(input).toEqual(original);
		// Same elements, possibly different order
		expect([...out1].sort((a, b) => a - b)).toEqual(original);
	});
});

describe('sample', () => {
	it('returns distinct items with no duplicates', () => {
		const pool = ['a', 'b', 'c', 'd', 'e'];
		const result = sample(pool, 3, seededRng('sample-seed'));
		expect(result).toHaveLength(3);
		expect(new Set(result).size).toBe(3);
		for (const item of result) {
			expect(pool).toContain(item);
		}
	});

	it('degrades gracefully when count exceeds pool size', () => {
		const pool = ['x', 'y', 'z'];
		const result = sample(pool, 10, seededRng('oversize-seed'));
		expect(result).toHaveLength(3);
		expect(new Set(result).size).toBe(3);
		expect(result.every((item) => item !== undefined)).toBe(true);
		expect([...result].sort()).toEqual([...pool].sort());
	});
});
