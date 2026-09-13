import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import {
	initDb,
	getDb,
	getAudio,
	putAudio,
	seedCardReviews,
	type CardReviewEntry
} from '$lib/db/db';

// fake-indexeddb replaces the global IndexedDB with an in-memory
// implementation for tests. Imported via 'fake-indexeddb/auto'
// which auto-installs itself on the global scope.

describe('audioCache', () => {
	beforeAll(async () => {
		// Initialize the DB for the test profile.
		initDb('domi');
		await getDb().open();
	});

	it('returns undefined for a hash that does not exist', async () => {
		const result = await getAudio('nonexistent-hash');
		expect(result).toBeUndefined();
	});

	it('stores and retrieves a Blob by hash', async () => {
		const hash = 'test-hash-abc123';
		const blob = new Blob(['fake audio data'], { type: 'audio/mpeg' });

		await putAudio(hash, blob);
		const retrieved = await getAudio(hash);

		expect(retrieved).toBeDefined();
		expect(retrieved?.size).toBe(blob.size);
		expect(retrieved?.type).toBe(blob.type);
	});

	it('overwrites an existing entry for the same hash', async () => {
		const hash = 'test-hash-overwrite';
		const blob1 = new Blob(['version 1'], { type: 'audio/mpeg' });
		const blob2 = new Blob(['version 2 longer'], { type: 'audio/mpeg' });

		await putAudio(hash, blob1);
		await putAudio(hash, blob2);

		const retrieved = await getAudio(hash);
		expect(retrieved?.size).toBe(blob2.size);
	});

	it('deletes an entry from the cache', async () => {
		const hash = 'test-hash-delete';
		const blob = new Blob(['to be deleted'], { type: 'audio/mpeg' });

		await putAudio(hash, blob);
		await getDb().audioCache.delete(hash);

		const retrieved = await getAudio(hash);
		expect(retrieved).toBeUndefined();
	});
});

describe('cardReviews', () => {
	beforeAll(async () => {
		initDb('domi');
		await getDb().open();
	});

	it('copies entries to plain objects so IndexedDB can clone them', async () => {
		const entry: CardReviewEntry = {
			wordId: 'w-proxy-copy-test',
			interval: 3,
			easeFactor: 2.5,
			repetitions: 2,
			nextReviewDate: '2026-08-20',
			lastReviewDate: '2026-08-17',
			firstSeenDate: '2026-08-10'
		};
		// Simulate an externally-owned object reference (e.g. from a caller).
		// This does not reproduce the real Svelte-proxy DataCloneError; it only
		// proves seedCardReviews copies rather than reusing the reference.
		const proxiedEntry = new Proxy(entry, {});

		await seedCardReviews({ [entry.wordId]: proxiedEntry });

		const stored = await getDb().cardReviews.get(entry.wordId);
		expect(stored).toBeDefined();
		expect(stored).not.toBe(entry);
		expect(stored).not.toBe(proxiedEntry);
		expect(Object.keys(stored!).sort()).toEqual(
			[
				'wordId',
				'interval',
				'easeFactor',
				'repetitions',
				'nextReviewDate',
				'lastReviewDate',
				'firstSeenDate'
			].sort()
		);
		expect(stored).toEqual(entry);
	});
});
