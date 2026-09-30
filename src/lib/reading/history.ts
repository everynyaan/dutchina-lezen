import { getAnnotation } from './annotations';
import { daysBetween } from './bank';
import type { QType, ReadingAttempt, ReadingForkState } from './types';

type ForkAttempts = Pick<ReadingForkState, 'attempts'>;

function byTime(a: ReadingAttempt, b: ReadingAttempt): number {
	return a.at.localeCompare(b.at) || a.itemId.localeCompare(b.itemId);
}

/** Latest attempt time for this passage, or null when she has not opened it. */
export function lastSeenPassage(fork: ForkAttempts, slug: string): string | null {
	let latest: string | null = null;
	for (const attempt of fork.attempts) {
		if (attempt.passageSlug !== slug || !attempt.at) continue;
		if (latest === null || attempt.at > latest) latest = attempt.at;
	}
	return latest;
}

/**
 * True when this item has an attempt whose date is within `days` of `now`.
 * `now` defaults to today so callers can stay pure in tests.
 */
export function itemAttemptedWithin(
	fork: ForkAttempts,
	itemId: string,
	days: number,
	now = new Date().toISOString().slice(0, 10)
): boolean {
	const today = now.slice(0, 10);
	for (const attempt of fork.attempts) {
		if (attempt.itemId !== itemId || !attempt.at) continue;
		const gap = daysBetween(attempt.at.slice(0, 10), today);
		if (gap >= 0 && gap <= days) return true;
	}
	return false;
}

/** Last N attempts of each question type. `last` defaults to 30. Items with no tag are skipped. */
export function accuracyByQtype(
	fork: ForkAttempts,
	opts: { origin?: ReadingAttempt['origin']; last?: number } = {}
): Partial<Record<QType, { c: number; t: number }>> {
	const last = opts.last ?? 30;
	const grouped = new Map<QType, ReadingAttempt[]>();
	const ordered = [...fork.attempts].sort(byTime);
	for (const attempt of ordered) {
		if (opts.origin && attempt.origin !== opts.origin) continue;
		const qtype = getAnnotation(attempt.itemId)?.qtype;
		if (!qtype) continue;
		const list = grouped.get(qtype) ?? [];
		list.push(attempt);
		grouped.set(qtype, list);
	}
	const out: Partial<Record<QType, { c: number; t: number }>> = {};
	for (const [qtype, list] of grouped) {
		const slice = list.slice(-last);
		out[qtype] = { c: slice.filter((attempt) => attempt.correct).length, t: slice.length };
	}
	return out;
}

/** Share of the last N located attempts that hit. Null when none of them located. */
export function locateRate(fork: ForkAttempts, last: number): number | null {
	const located = [...fork.attempts]
		.filter((attempt) => attempt.locateHit !== null)
		.sort(byTime)
		.slice(-last);
	if (located.length === 0) return null;
	return located.filter((attempt) => attempt.locateHit === true).length / located.length;
}
