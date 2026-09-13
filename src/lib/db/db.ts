import Dexie, { type Table } from 'dexie';
import type { ProfileId } from '$lib/profiles/profiles';

// ============================================================
// DUTCHINA INDEXED DB
// Wraps IndexedDB via Dexie.
// Used for: audio cache (TTS Blobs), card review state (SRS).
// NOT used for game state (that lives in localStorage).
//
// NAMESPACED PER PROFILE: each profile gets its own IndexedDB
// (dutchina_domi, dutchina_admin) so card reviews and audio
// cache are fully isolated. No cross-profile data leaks.
//
// NEVER clear this database in the service worker update flow.
// User audio cache and card review history live here.
// ============================================================

export interface AudioCacheEntry {
	hash: string; // primary key: SHA-256 hex of (text + voice settings)
	blob: Blob; // the TTS audio Blob
	lastAccessed: number; // Date.now() timestamp, used for eviction
}

export interface CardReviewEntry {
	wordId: string; // primary key: matches WordEntry.id (e.g. "w0201")
	interval: number; // days until next review
	easeFactor: number; // SM-2 ease factor (starts at 2.5, minimum 1.3)
	repetitions: number; // consecutive correct reviews
	nextReviewDate: string; // ISO date string (YYYY-MM-DD)
	lastReviewDate: string; // ISO date string (YYYY-MM-DD)
	firstSeenDate: string; // ISO date string (YYYY-MM-DD), set once on first review
}

class DutchinaDB extends Dexie {
	audioCache!: Table<AudioCacheEntry, string>;
	cardReviews!: Table<CardReviewEntry, string>;

	constructor(profile: ProfileId) {
		super(`dutchina_${profile}`);

		this.version(1).stores({
			// &hash = primary key (unique), lastAccessed = indexed for eviction queries
			audioCache: '&hash, lastAccessed'
		});

		this.version(2).stores({
			audioCache: '&hash, lastAccessed',
			// &wordId = primary key (unique), nextReviewDate = indexed for due queries
			cardReviews: '&wordId, nextReviewDate'
		});
	}
}

// ============================================================
// PROFILE-SCOPED DB INSTANCE
// Call initDb(profile) once on app startup (in +layout.svelte).
// All helpers use getDb() which throws if init hasn't run.
// ============================================================

let _db: DutchinaDB | null = null;

/**
 * Initialize the Dexie DB for a specific profile.
 * Must be called before any db operations (audio cache, cards).
 * Safe to call multiple times with the same profile (no-op).
 */
export function initDb(profile: ProfileId): void {
	if (_db && _db.name === `dutchina_${profile}`) return;
	_db = new DutchinaDB(profile);
}

/**
 * Get the active Dexie DB instance.
 * Throws if initDb hasn't been called yet.
 */
export function getDb(): DutchinaDB {
	if (!_db) {
		throw new Error(
			'[dutchina] DB not initialized. Call initDb(profile) in +layout.svelte before using audio or card features.'
		);
	}
	return _db;
}

// ============================================================
// AUDIO CACHE HELPERS
// ============================================================

/**
 * Get a cached audio Blob by hash.
 * Also updates lastAccessed so recently used entries are
 * evicted last.
 * Returns undefined if not in cache.
 */
export async function getAudio(hash: string): Promise<Blob | undefined> {
	const db = getDb();
	const entry = await db.audioCache.get(hash);
	if (!entry) return undefined;
	// Touch lastAccessed in the background, don't await it.
	touchAudio(hash).catch(() => {});
	return entry.blob;
}

/**
 * Store an audio Blob in the cache.
 * Overwrites any existing entry for the same hash.
 */
export async function putAudio(hash: string, blob: Blob): Promise<void> {
	const db = getDb();
	await db.audioCache.put({
		hash,
		blob,
		lastAccessed: Date.now()
	});
}

/**
 * Update the lastAccessed timestamp for a cache entry.
 * Used by getAudio to keep the eviction order accurate.
 */
export async function touchAudio(hash: string): Promise<void> {
	const db = getDb();
	await db.audioCache.update(hash, { lastAccessed: Date.now() });
}

/**
 * Evict oldest-accessed entries until the total size of all
 * cached Blobs is under targetSizeMB.
 *
 * This does NOT run automatically. Call it manually when you
 * want to trim the cache (e.g. after a TTS fetch, or on app load).
 *
 * Note: Blob.size is in bytes. 1 MB = 1_048_576 bytes.
 */
export async function evictOldest(targetSizeMB: number): Promise<void> {
	const db = getDb();
	const targetBytes = targetSizeMB * 1_048_576;

	// Load all entries sorted by lastAccessed ascending (oldest first).
	const entries = await db.audioCache.orderBy('lastAccessed').toArray();

	let totalBytes = entries.reduce((sum, e) => sum + e.blob.size, 0);

	for (const entry of entries) {
		if (totalBytes <= targetBytes) break;
		await db.audioCache.delete(entry.hash);
		totalBytes -= entry.blob.size;
	}
}

// ============================================================
// CARD REVIEW SYNC HELPERS
// ============================================================

/**
 * Seed Dexie cardReviews from synced state.
 * Per-card merge: for each wordId, keeps whichever entry has the
 * later lastReviewDate. This means neither side's reviews are lost
 * when syncing across devices.
 *
 * Called after sync pull merge resolution in the layout.
 */
export async function seedCardReviews(reviews: Record<string, CardReviewEntry>): Promise<number> {
	const db = getDb();
	const incoming = Object.values(reviews);
	if (incoming.length === 0) return 0;

	// Bulk read existing Dexie reviews
	const existing = await db.cardReviews.toArray();
	const existingMap = new Map(existing.map((e) => [e.wordId, e]));

	// Determine which incoming entries are newer
	const toWrite: CardReviewEntry[] = [];
	for (const entry of incoming) {
		const local = existingMap.get(entry.wordId);
		if (!local || entry.lastReviewDate > local.lastReviewDate) {
			// Callers may pass Svelte $state-proxied entries (e.g. gameState.cardReviews
			// from +layout.svelte). IndexedDB cannot structured-clone a Proxy, so we
			// always copy into a fresh plain object before handing it to Dexie.
			toWrite.push({
				wordId: entry.wordId,
				interval: entry.interval,
				easeFactor: entry.easeFactor,
				repetitions: entry.repetitions,
				nextReviewDate: entry.nextReviewDate,
				lastReviewDate: entry.lastReviewDate,
				firstSeenDate: entry.firstSeenDate
			});
		}
	}

	if (toWrite.length > 0) {
		await db.cardReviews.bulkPut(toWrite);
	}

	return toWrite.length;
}

/**
 * Export all Dexie card reviews as a plain Record.
 * Used for one-time backfill on first v15 load (existing Dexie
 * reviews need to be copied into state.cardReviews so they sync).
 */
export async function exportCardReviews(): Promise<Record<string, CardReviewEntry>> {
	const db = getDb();
	const all = await db.cardReviews.toArray();
	const result: Record<string, CardReviewEntry> = {};
	for (const entry of all) {
		result[entry.wordId] = entry;
	}
	return result;
}
