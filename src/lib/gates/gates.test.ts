import { describe, it, expect } from 'vitest';
import { WORD_POOL } from '$lib/data/wordPool';
import {
	DROP_FROM_HOMEWORK_IDS,
	GATE1_WORD_ID_SET,
	GATE1_WORD_IDS
} from './gate1Allowlist';
import {
	currentGateFromState,
	examInHomework,
	getStoriesForGate,
	getWordsForGate,
	getWordsUpToGate,
	placementFromState,
	rankToGate
} from './gates';

describe('gate1 allowlist', () => {
	it('is 150–180 unique ids that all exist in WORD_POOL', () => {
		expect(GATE1_WORD_IDS.length).toBeGreaterThanOrEqual(150);
		expect(GATE1_WORD_IDS.length).toBeLessThanOrEqual(180);
		expect(new Set(GATE1_WORD_IDS).size).toBe(GATE1_WORD_IDS.length);
		const poolIds = new Set(WORD_POOL.map((w) => w.id));
		for (const id of GATE1_WORD_IDS) {
			expect(poolIds.has(id), `missing ${id}`).toBe(true);
		}
	});

	it('getWordsForGate(1) is the allowlist, not rank <= 1', () => {
		const g1 = getWordsForGate(1);
		expect(g1.map((w) => w.id).sort()).toEqual([...GATE1_WORD_IDS].sort());
		expect(g1.some((w) => w.rank > 1)).toBe(true);
		const rank01 = WORD_POOL.filter((w) => w.rank <= 1);
		expect(g1.length).toBeLessThan(rank01.length);
		expect(g1.length).not.toEqual(rank01.length);
	});
});

describe('gate helpers', () => {
	it('rankToGate and placement fail-safe low', () => {
		expect(rankToGate(0)).toBe(1);
		expect(rankToGate(1)).toBe(1);
		expect(rankToGate(2)).toBe(2);
		expect(rankToGate(6)).toBe(4);
		expect(placementFromState(0, 0)).toBe(1);
		expect(placementFromState(6, 0)).toBe(1);
		expect(placementFromState(6, 40)).toBe(4);
		expect(currentGateFromState({ gates: { current: 2 }, rank: 0 })).toBe(2);
		expect(currentGateFromState({ rank: 0 })).toBe(1);
	});

	it('examInHomework only at Gate 4', () => {
		expect(examInHomework(1)).toBe(false);
		expect(examInHomework(3)).toBe(false);
		expect(examInHomework(4)).toBe(true);
	});

	it('G1 stories are empty; drop-list never appears up to any gate', () => {
		expect(getStoriesForGate(1)).toEqual([]);
		const up4 = new Set(getWordsUpToGate(4).map((w) => w.id));
		for (const id of DROP_FROM_HOMEWORK_IDS) {
			expect(up4.has(id)).toBe(false);
		}
		expect(GATE1_WORD_ID_SET.has('w0903')).toBe(true);
		expect(getWordsForGate(2).some((w) => w.id === 'w0903')).toBe(false);
	});
});
