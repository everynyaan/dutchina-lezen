import { exportCardReviews } from '$lib/db/db';
import { WORD_POOL } from '$lib/data/wordPool';
import { getRustyWords } from '$lib/fresh/fresh';
import type { WordEntry } from '$lib/data/wordPool';

/**
 * Load the rustiest words from the live SRS mirror in IndexedDB.
 * All rusty logic lives in fresh.ts; this is only the storage adapter.
 */
export async function loadRustyWords(
	today: string,
	limit: number,
	pool: WordEntry[] = WORD_POOL
): Promise<WordEntry[]> {
	let reviews;
	try {
		reviews = await exportCardReviews();
	} catch {
		return [];
	}
	return getRustyWords(Object.values(reviews), pool, today, limit);
}
