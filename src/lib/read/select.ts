import type { DailyRead } from './types';
import { seededRng } from '$lib/quiz/rng';

/** The read for a given date. Deterministic for a given (profile, date). */
export function selectRead(pool: DailyRead[], profile: string, date: string): DailyRead | null {
	if (pool.length === 0) return null;
	const rng = seededRng(`${profile}|${date}`);
	const index = Math.min(Math.floor(rng() * pool.length), pool.length - 1);
	return pool[index];
}
