import { describe, expect, it } from 'vitest';
import { accuracyByQtype, itemAttemptedWithin, lastSeenPassage, locateRate } from './history';
import { EMPTY_READING_FORK, type ReadingAttempt, type ReadingForkState } from './types';

function attempt(
	partial: Partial<ReadingAttempt> & Pick<ReadingAttempt, 'itemId' | 'at'>
): ReadingAttempt {
	return {
		origin: 'official',
		passageSlug: 'bakkerij',
		source: 'texts',
		picked: 'A',
		correct: true,
		locateP: null,
		locateHit: null,
		ms: 0,
		...partial
	};
}

function fork(attempts: ReadingAttempt[]): ReadingForkState {
	return { ...EMPTY_READING_FORK, attempts };
}

describe('reading history', () => {
	const attempts = [
		attempt({ itemId: 'lezen-2024-1', at: '2026-09-01', passageSlug: 'bakkerij', correct: false }),
		attempt({
			itemId: 'lezen-2024-1',
			at: '2026-09-20',
			passageSlug: 'bakkerij',
			correct: true,
			origin: 'practice'
		}),
		attempt({
			itemId: 'lezen-2025-1',
			at: '2026-09-10',
			passageSlug: 'ruud-rij-instructeur',
			locateP: 2,
			locateHit: true
		}),
		attempt({
			itemId: 'lezen-2025-2',
			at: '2026-09-11',
			passageSlug: 'ruud-rij-instructeur',
			locateP: 1,
			locateHit: false
		}),
		attempt({ itemId: 'not-tagged', at: '2026-09-12', passageSlug: 'bakkerij', locateHit: null })
	];

	it('returns the latest time a passage was seen', () => {
		expect(lastSeenPassage(fork(attempts), 'bakkerij')).toBe('2026-09-20');
		expect(lastSeenPassage(fork(attempts), 'ruud-rij-instructeur')).toBe('2026-09-11');
		expect(lastSeenPassage(fork(attempts), 'missing')).toBeNull();
	});

	it('knows whether an item was attempted inside a window', () => {
		const state = fork(attempts);
		expect(itemAttemptedWithin(state, 'lezen-2024-1', 21, '2026-09-30')).toBe(true);
		expect(itemAttemptedWithin(state, 'lezen-2024-1', 5, '2026-09-30')).toBe(false);
		expect(itemAttemptedWithin(state, 'lezen-2025-2', 0, '2026-09-11')).toBe(true);
		expect(itemAttemptedWithin(state, 'absent', 30, '2026-09-30')).toBe(false);
	});

	it('scores the last N attempts of each question type', () => {
		const many: ReadingAttempt[] = [];
		for (let i = 0; i < 32; i++) {
			many.push(
				attempt({
					itemId: 'lezen-2024-1',
					at: `2026-08-${String(i + 1).padStart(2, '0')}`,
					correct: i >= 30
				})
			);
		}
		const scored = accuracyByQtype(fork(many), { last: 30 });
		expect(scored.detail).toEqual({ c: 2, t: 30 });
		expect(accuracyByQtype(fork(attempts), { origin: 'practice' }).detail).toEqual({ c: 1, t: 1 });
		expect(accuracyByQtype(fork(attempts), { origin: 'fresh' })).toEqual({});
		expect(accuracyByQtype(fork(attempts)).detail?.t).toBe(2);
	});

	it('rates located attempts and ignores ones that never located', () => {
		expect(locateRate(fork(attempts), 50)).toBe(0.5);
		expect(locateRate(fork(attempts), 1)).toBe(0);
		expect(
			locateRate(fork([attempt({ itemId: 'lezen-2024-1', at: '2026-09-01' })]), 10)
		).toBeNull();
	});
});
