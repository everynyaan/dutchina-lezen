import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CurrentState } from '$lib/state/schema';
import { CURRENT_SCHEMA_VERSION } from '$lib/state/schema';
import { createDefaultState } from '$lib/state/defaults';
import { partition, assemble, SUBSYSTEMS, type Subsystem, mergeSubsystem } from './subsystems';

// ---------------------------------------------------------------------------
// In-memory localStorage (Node vitest has no jsdom; engine guards on window)
// ---------------------------------------------------------------------------

class MemoryStorage {
	private map = new Map<string, string>();
	getItem(key: string): string | null {
		return this.map.has(key) ? (this.map.get(key) as string) : null;
	}
	setItem(key: string, value: string): void {
		this.map.set(key, String(value));
	}
	removeItem(key: string): void {
		this.map.delete(key);
	}
	clear(): void {
		this.map.clear();
	}
}

// ---------------------------------------------------------------------------
// Hoisted mutable mocks (vi.mock is hoisted above imports of the SUT)
// ---------------------------------------------------------------------------

const mockAuth = vi.hoisted(() => ({
	canSync: true,
	userId: 'user-test-001' as string | null,
	state: 'signed-in' as 'unknown' | 'signed-out' | 'signed-in',
	email: 'test@example.com' as string | null,
	blockedReason: null as null | 'signed-out' | 'profile-mismatch' | 'account-mismatch'
}));

const migrateMock = vi.hoisted(() =>
	vi.fn((raw: unknown) => {
		// Default: pass-through shaped as CurrentState when possible
		return raw as CurrentState;
	})
);

const getSupabase = vi.hoisted(() => vi.fn());

vi.mock('$lib/auth/session.svelte', () => ({
	auth: {
		get state() {
			return mockAuth.state;
		},
		get email() {
			return mockAuth.email;
		},
		get userId() {
			return mockAuth.userId;
		},
		get canSync() {
			return mockAuth.canSync;
		},
		get blockedReason() {
			return mockAuth.blockedReason;
		}
	}
}));

vi.mock('$lib/supabase/client', () => ({
	getSupabase: () => getSupabase(),
	isSupabaseConfigured: () => true
}));

vi.mock('$lib/state/migrations', () => ({
	migrate: (raw: unknown) => migrateMock(raw)
}));

import {
	syncStatus,
	startSync,
	stopSync,
	pullNow,
	pushNow,
	flushOnUnload,
	resetRemote,
	type SyncBridge
} from './engine.svelte';

// ---------------------------------------------------------------------------
// Supabase fake query builder
// ---------------------------------------------------------------------------

type Row = {
	user_id: string;
	subsystem: string;
	value: { schemaVersion: number; data: unknown };
	rev: number;
	updated_at?: string;
};

type Result = { data: unknown; error: { code?: string; message?: string } | null };

type InsertCall = { user_id: string; subsystem: string; value: unknown };
type UpdateCall = {
	value: unknown;
	filters: Record<string, unknown>;
};

function envelope(data: unknown, schemaVersion = CURRENT_SCHEMA_VERSION) {
	return { schemaVersion, data };
}

function makeRow(
	subsystem: Subsystem,
	data: unknown,
	rev: number,
	schemaVersion = CURRENT_SCHEMA_VERSION,
	userId = mockAuth.userId as string
): Row {
	return {
		user_id: userId,
		subsystem,
		value: envelope(data, schemaVersion),
		rev,
		updated_at: new Date().toISOString()
	};
}

/** Build a chainable/thenable that records operations and resolves via handlers. */
function createSupabaseMock(opts: {
	/** Rows returned by the bulk select (pull). */
	pullRows?: Row[];
	/** Per-call handlers for insert (default: success). */
	onInsert?: (row: InsertCall, callIndex: number) => Result;
	/** Per-call handlers for update...select (default: success with rev+1). */
	onUpdate?: (call: UpdateCall, callIndex: number) => Result;
	/** Conflict re-select .single() handler. */
	onSingle?: (filters: Record<string, unknown>, callIndex: number) => Result;
	/** Per-call handler for delete (default: success). */
	onDelete?: (filters: Record<string, unknown>, callIndex: number) => Result;
}) {
	const insertCalls: InsertCall[] = [];
	const updateCalls: UpdateCall[] = [];
	const deleteCalls: Record<string, unknown>[] = [];
	const singleCalls: Record<string, unknown>[] = [];
	const selectBulkCalls: Record<string, unknown>[] = [];
	let realtimeHandler: ((payload: { new?: Row | null }) => void) | null = null;
	const unsubscribe = vi.fn();
	const removeChannel = vi.fn();

	let insertIndex = 0;
	let updateIndex = 0;
	let deleteIndex = 0;
	let singleIndex = 0;

	function from(table: string) {
		void table;
		const filters: Record<string, unknown> = {};
		let mode: 'none' | 'select' | 'insert' | 'update' | 'delete' = 'none';
		let insertPayload: InsertCall | null = null;
		let updatePayload: { value: unknown } | null = null;
		let wantSingle = false;

		const builder = {
			select(cols?: string) {
				void cols;
				if (mode === 'none') mode = 'select';
				// update().select() keeps mode update
				return builder;
			},
			insert(row: InsertCall) {
				mode = 'insert';
				insertPayload = row;
				return builder;
			},
			update(patch: { value: unknown }) {
				mode = 'update';
				updatePayload = patch;
				return builder;
			},
			delete() {
				mode = 'delete';
				return builder;
			},
			eq(col: string, val: unknown) {
				filters[col] = val;
				return builder;
			},
			single() {
				wantSingle = true;
				return builder;
			},
			then(onFulfilled: (v: Result) => unknown, onRejected?: (e: unknown) => unknown) {
				return resolve().then(onFulfilled, onRejected);
			},
			catch(onRejected: (e: unknown) => unknown) {
				return resolve().catch(onRejected);
			},
			finally(onFinally: () => void) {
				return resolve().finally(onFinally);
			}
		};

		function resolve(): Promise<Result> {
			if (mode === 'insert' && insertPayload) {
				const idx = insertIndex++;
				insertCalls.push(insertPayload);
				if (opts.onInsert) return Promise.resolve(opts.onInsert(insertPayload, idx));
				return Promise.resolve({ data: null, error: null });
			}
			if (mode === 'update' && updatePayload) {
				const idx = updateIndex++;
				const call: UpdateCall = { value: updatePayload.value, filters: { ...filters } };
				updateCalls.push(call);
				if (opts.onUpdate) return Promise.resolve(opts.onUpdate(call, idx));
				// default success
				const rev = typeof filters.rev === 'number' ? filters.rev + 1 : 1;
				return Promise.resolve({
					data: [
						{
							user_id: filters.user_id,
							subsystem: filters.subsystem,
							value: updatePayload.value,
							rev
						}
					],
					error: null
				});
			}
			if (mode === 'delete') {
				const idx = deleteIndex++;
				const recorded = { ...filters };
				deleteCalls.push(recorded);
				if (opts.onDelete) return Promise.resolve(opts.onDelete(recorded, idx));
				return Promise.resolve({ data: null, error: null });
			}
			if (mode === 'select' && wantSingle) {
				const idx = singleIndex++;
				singleCalls.push({ ...filters });
				if (opts.onSingle) return Promise.resolve(opts.onSingle(filters, idx));
				return Promise.resolve({ data: null, error: { message: 'not found' } });
			}
			if (mode === 'select') {
				selectBulkCalls.push({ ...filters });
				return Promise.resolve({ data: opts.pullRows ?? [], error: null });
			}
			return Promise.resolve({ data: null, error: null });
		}

		return builder;
	}

	function channel(name: string) {
		void name;
		const ch = {
			on(event: string, filter: unknown, handler: (payload: { new?: Row | null }) => void) {
				void event;
				void filter;
				realtimeHandler = handler;
				return ch;
			},
			subscribe(cb?: (status: string) => void) {
				if (cb) cb('SUBSCRIBED');
				return ch;
			},
			unsubscribe
		};
		return ch;
	}

	const client = {
		from,
		channel,
		removeChannel
	};

	return {
		client,
		insertCalls,
		updateCalls,
		deleteCalls,
		singleCalls,
		selectBulkCalls,
		getRealtimeHandler: () => realtimeHandler,
		unsubscribe,
		removeChannel
	};
}

function makeBridge(
	initial?: CurrentState
): SyncBridge & { state: CurrentState; applyCalls: CurrentState[] } {
	let state = initial ?? createDefaultState();
	const applyCalls: CurrentState[] = [];
	return {
		get state() {
			return state;
		},
		applyCalls,
		getState() {
			return state;
		},
		applyState(next: CurrentState) {
			state = next;
			applyCalls.push(next);
		}
	};
}

function progressSlice(overrides: { totalLp?: number; practiceDays?: number; rank?: number }) {
	const base = partition(createDefaultState()).progress as Record<string, unknown>;
	return {
		...base,
		totalLp: overrides.totalLp ?? base.totalLp,
		practiceDays: overrides.practiceDays ?? base.practiceDays,
		rank: overrides.rank ?? base.rank
	};
}

function allSixRows(rev = 1): Row[] {
	const parts = partition(createDefaultState());
	return SUBSYSTEMS.map((s) => makeRow(s, parts[s], rev));
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

describe('sync engine', () => {
	let memoryStorage: MemoryStorage;

	beforeEach(() => {
		memoryStorage = new MemoryStorage();
		Object.defineProperty(globalThis, 'localStorage', {
			value: memoryStorage,
			configurable: true,
			writable: true
		});
		// engine.svelte.ts guards on typeof window === 'undefined'
		Object.defineProperty(globalThis, 'window', {
			value: globalThis,
			configurable: true,
			writable: true
		});

		mockAuth.canSync = true;
		mockAuth.userId = 'user-test-001';
		mockAuth.state = 'signed-in';
		mockAuth.email = 'test@example.com';
		mockAuth.blockedReason = null;
		migrateMock.mockImplementation((raw: unknown) => raw as CurrentState);
		getSupabase.mockReset();
		stopSync();
	});

	afterEach(() => {
		stopSync();
		// @ts-expect-error cleanup test globals
		delete globalThis.window;
		// @ts-expect-error cleanup test globals
		delete globalThis.localStorage;
		vi.clearAllMocks();
	});

	// -----------------------------------------------------------------------
	// 1. Clean pull
	// -----------------------------------------------------------------------
	it('1. clean pull of six rows assembles and applies; missing row falls back to defaults', async () => {
		const parts = partition(createDefaultState());
		const customProgress = progressSlice({ totalLp: 42, practiceDays: 7, rank: 2 });
		const rows: Row[] = [
			makeRow('srs', parts.srs, 1),
			makeRow('progress', customProgress, 3),
			makeRow('daily', parts.daily, 1),
			makeRow('config', parts.config, 1),
			makeRow('adjustments', parts.adjustments, 1)
			// pages intentionally omitted
		];

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(createDefaultState());
		await startSync(bridge);

		expect(bridge.applyCalls.length).toBeGreaterThanOrEqual(1);
		const applied = bridge.getState();
		expect(applied.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(applied.totalLp).toBe(42);
		expect(applied.practiceDays).toBe(7);
		// pages missing → assemble defaults (empty array, no crash / no undefined nests)
		expect(applied.cardReviews).toEqual({});
		expect(applied.dailyHomework).toBeDefined();
		expect(applied.cards.newCardsPerDay).toBeDefined();
		expect(syncStatus.phase).toBe('idle');
		expect(syncStatus.live).toBe(true);
		expect(syncStatus.needsUpdate).toBe(false);
	});

	// -----------------------------------------------------------------------
	// 2. Push only dirty
	// -----------------------------------------------------------------------
	it('2. push sends ONLY dirty subsystems', async () => {
		const rows = allSixRows(2);
		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(createDefaultState());
		await startSync(bridge);

		// Mutate only config
		const next = { ...bridge.getState() };
		next.audio = { sfxMuted: true };
		next.cards = { ...next.cards, newCardsPerDay: 99 };
		bridge.applyState(next);

		// Reset call logs after pull/start
		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;

		await pushNow();

		const touched = new Set<string>();
		for (const c of mock.insertCalls) touched.add(c.subsystem);
		for (const c of mock.updateCalls) {
			const s = c.filters.subsystem;
			if (typeof s === 'string') touched.add(s);
		}

		expect(touched.has('config')).toBe(true);
		for (const s of SUBSYSTEMS) {
			if (s === 'config') continue;
			expect(touched.has(s)).toBe(false);
		}
		// config should have used update (already pulled) not insert
		expect(mock.updateCalls.some((c) => c.filters.subsystem === 'config')).toBe(true);
		expect(mock.insertCalls.filter((c) => c.subsystem === 'config').length).toBe(0);
	});

	// -----------------------------------------------------------------------
	// 3. Rev conflict → merge → retry success
	// -----------------------------------------------------------------------
	it('3. rev conflict re-selects, merges, retries, and succeeds on second update', async () => {
		// Local after pull: totalLp=100, practiceDays=10
		// We will dirty local to totalLp=100, practiceDays=10 (already) then bump practiceDays?
		// Actually: lastSynced has totalLp=100, practiceDays=5. Local dirty: totalLp=100, practiceDays=10.
		// Remote on conflict: totalLp=50, practiceDays=20.
		// Merge: totalLp=max(100,50)=100, practiceDays=max(10,20)=20 → differs from both pure sides.
		const localProgress = progressSlice({ totalLp: 100, practiceDays: 10 });
		const remoteProgress = progressSlice({ totalLp: 50, practiceDays: 20 });

		const stateWithLocal = assemble({ progress: localProgress });
		const parts = partition(stateWithLocal);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? localProgress : parts[s], 1));

		const mock = createSupabaseMock({
			pullRows: rows,
			onUpdate: (call, idx) => {
				if (call.filters.subsystem !== 'progress') {
					// other subsystems if any — succeed
					return {
						data: [
							{
								user_id: mockAuth.userId,
								subsystem: call.filters.subsystem,
								value: call.value,
								rev: 2
							}
						],
						error: null
					};
				}
				if (idx === 0) {
					// first progress update: conflict (0 rows)
					return { data: [], error: null };
				}
				// second progress update: success
				return {
					data: [
						{
							user_id: mockAuth.userId,
							subsystem: 'progress',
							value: call.value,
							rev: 3
						}
					],
					error: null
				};
			},
			onSingle: () => ({
				data: makeRow('progress', remoteProgress, 2),
				error: null
			})
		});
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(stateWithLocal);
		await startSync(bridge);

		// Make progress dirty: change totalLp so partition differs from lastSynced
		// (pull applied localProgress — lastSynced matches. Bump totalLp slightly...
		// actually we need dirty. Change practiceDays is already 10 in lastSynced.
		// Set totalLp to 100 stays same — change rank to force dirty without breaking merge story.
		// Better: re-set practiceDays already synced. Mutate totalLp to 100 same...
		// After pull, lastSynced.progress.payload equals localProgress.
		// Mutate: practiceDays stays 10, totalLp stays 100 — not dirty.
		// So change lastModified or practiceDays on local after pull:
		const dirty = assemble({
			...partition(bridge.getState()),
			progress: progressSlice({ totalLp: 100, practiceDays: 10, rank: 3 })
		});
		// rank change alone makes dirty; merge with remote totalLp 50 will keep totalLp 100 from local
		// and practiceDays max(10, 20)=20
		bridge.applyState(dirty);

		mock.updateCalls.length = 0;
		mock.singleCalls.length = 0;

		await pushNow();

		const progressUpdates = mock.updateCalls.filter((c) => c.filters.subsystem === 'progress');
		expect(progressUpdates.length).toBe(2);
		expect(mock.singleCalls.length).toBeGreaterThanOrEqual(1);

		// Final written value is a merge: totalLp=100, practiceDays=20
		const written = progressUpdates[1].value as {
			schemaVersion: number;
			data: Record<string, unknown>;
		};
		expect(written.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(written.data.totalLp).toBe(100);
		expect(written.data.practiceDays).toBe(20);
		// Distinguishes from pure local (practiceDays 10) and pure remote (totalLp 50)
		expect(written.data.totalLp).not.toBe(50);
		expect(written.data.practiceDays).not.toBe(10);
	});

	// -----------------------------------------------------------------------
	// 4. Conflict never clears
	// -----------------------------------------------------------------------
	it('4. conflict that never clears: exactly 5 updates, pending, offline, local preserved', async () => {
		const localProgress = progressSlice({ totalLp: 77, practiceDays: 3 });
		const remoteProgress = progressSlice({ totalLp: 1, practiceDays: 99 });
		const state = assemble({ progress: localProgress });
		const parts = partition(state);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? localProgress : parts[s], 1));

		const mock = createSupabaseMock({
			pullRows: rows,
			onUpdate: (call) => {
				if (call.filters.subsystem === 'progress') {
					return { data: [], error: null };
				}
				return {
					data: [
						{
							user_id: mockAuth.userId,
							subsystem: call.filters.subsystem,
							value: call.value,
							rev: 2
						}
					],
					error: null
				};
			},
			onSingle: () => ({
				data: makeRow('progress', remoteProgress, 2),
				error: null
			})
		});
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(state);
		await startSync(bridge);

		// Dirty progress
		const dirtyState = assemble({
			...partition(bridge.getState()),
			progress: progressSlice({ totalLp: 77, practiceDays: 4 })
		});
		bridge.applyState(dirtyState);
		const beforePush = structuredClone(bridge.getState());
		const applyCountBefore = bridge.applyCalls.length;

		mock.updateCalls.length = 0;
		await pushNow();

		const progressUpdates = mock.updateCalls.filter((c) => c.filters.subsystem === 'progress');
		expect(progressUpdates.length).toBe(5);
		expect(syncStatus.pending).toContain('progress');
		expect(syncStatus.phase).toBe('offline');

		// Local in-memory value unchanged (no revert). applyState may have been called
		// only during startSync pull, not to overwrite the dirty local with remote-only.
		const after = bridge.getState();
		expect(after.totalLp).toBe(beforePush.totalLp);
		expect(after.practiceDays).toBe(beforePush.practiceDays);
		// No applyState that wiped the local edit back to remote totalLp=1
		const appliesAfterPush = bridge.applyCalls.slice(applyCountBefore);
		for (const a of appliesAfterPush) {
			expect(a.totalLp).not.toBe(1);
		}
	});

	// -----------------------------------------------------------------------
	// 5. Newer schema refused
	// -----------------------------------------------------------------------
	it('5. remote schemaVersion CURRENT+1 is refused; needsUpdate; no write-back', async () => {
		const parts = partition(createDefaultState());
		const futureProgress = progressSlice({ totalLp: 999, practiceDays: 50 });
		const rows: Row[] = [
			makeRow('srs', parts.srs, 1),
			makeRow('progress', futureProgress, 5, CURRENT_SCHEMA_VERSION + 1),
			makeRow('daily', parts.daily, 1),
			makeRow('config', parts.config, 1),
			makeRow('adjustments', parts.adjustments, 1),
			makeRow('pages', parts.pages, 1)
		];

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(createDefaultState());
		await startSync(bridge);

		expect(syncStatus.needsUpdate).toBe(true);
		// Refused: applied state must NOT carry remote totalLp 999 — defaults used instead
		expect(bridge.getState().totalLp).not.toBe(999);
		expect(bridge.getState().totalLp).toBe(0);

		const progressInserts = mock.insertCalls.filter((c) => c.subsystem === 'progress');
		const progressUpdates = mock.updateCalls.filter((c) => c.filters.subsystem === 'progress');
		expect(progressInserts.length).toBe(0);
		expect(progressUpdates.length).toBe(0);
	});

	// -----------------------------------------------------------------------
	// 6. Older schema → migrate + write-back
	// -----------------------------------------------------------------------
	it('6. older schemaVersion triggers migrate and write-back', async () => {
		const parts = partition(createDefaultState());
		const oldConfig = parts.config;
		const migratedState = createDefaultState();
		migratedState.audio = { sfxMuted: true };
		migratedState.cards = { ...migratedState.cards, newCardsPerDay: 55 };
		migrateMock.mockReturnValue(migratedState);

		const rows: Row[] = [
			makeRow('srs', parts.srs, 1),
			makeRow('progress', parts.progress, 1),
			makeRow('daily', parts.daily, 1),
			makeRow('config', oldConfig, 2, CURRENT_SCHEMA_VERSION - 1),
			makeRow('adjustments', parts.adjustments, 1),
			makeRow('pages', parts.pages, 1)
		];

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(createDefaultState());
		await startSync(bridge);

		expect(migrateMock).toHaveBeenCalled();
		// Applied migrated state
		expect(bridge.getState().audio.sfxMuted).toBe(true);
		expect(bridge.getState().cards.newCardsPerDay).toBe(55);

		// Write-back for the old-schema subsystem (config)
		const configWrites = [
			...mock.insertCalls.filter((c) => c.subsystem === 'config'),
			...mock.updateCalls.filter((c) => c.filters.subsystem === 'config')
		];
		expect(configWrites.length).toBeGreaterThanOrEqual(1);

		const written = configWrites[configWrites.length - 1];
		const value =
			'subsystem' in written && !('filters' in written)
				? (written as InsertCall).value
				: (written as UpdateCall).value;
		const env = value as { schemaVersion: number; data: unknown };
		expect(env.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		const data = env.data as { cards: { newCardsPerDay: number }; audio: { sfxMuted: boolean } };
		expect(data.cards.newCardsPerDay).toBe(55);
		expect(data.audio.sfxMuted).toBe(true);
	});

	// -----------------------------------------------------------------------
	// 7. Realtime merge (most important)
	// -----------------------------------------------------------------------
	it('7. realtime event merges with dirty local; never blind-applies remote', async () => {
		// After pull: progress totalLp=100, practiceDays=10, rev=1
		const pulledProgress = progressSlice({ totalLp: 100, practiceDays: 10 });
		const state = assemble({ progress: pulledProgress });
		const parts = partition(state);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? pulledProgress : parts[s], 1));

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(state);
		await startSync(bridge);
		expect(syncStatus.live).toBe(true);

		// Mutate local progress so it is dirty: practiceDays=15 (still totalLp=100)
		const dirtyLocal = assemble({
			...partition(bridge.getState()),
			progress: progressSlice({ totalLp: 100, practiceDays: 15 })
		});
		bridge.applyState(dirtyLocal);
		const applyCountBefore = bridge.applyCalls.length;

		// Remote event: totalLp=50, practiceDays=20, rev=2 (> local lastSynced rev 1)
		const remoteProgress = progressSlice({ totalLp: 50, practiceDays: 20 });
		const handler = mock.getRealtimeHandler();
		expect(handler).toBeTypeOf('function');
		handler!({
			new: makeRow('progress', remoteProgress, 2)
		});

		// Merge: totalLp=max(100,50)=100, practiceDays=max(15,20)=20
		const applied = bridge.getState();
		expect(applied.totalLp).toBe(100);
		expect(applied.practiceDays).toBe(20);
		// Not pure remote
		expect(applied.totalLp).not.toBe(50);
		// Not pure local
		expect(applied.practiceDays).not.toBe(15);

		const appliesAfter = bridge.applyCalls.slice(applyCountBefore);
		expect(appliesAfter.length).toBeGreaterThanOrEqual(1);
		const last = appliesAfter[appliesAfter.length - 1];
		expect(last.totalLp).toBe(100);
		expect(last.practiceDays).toBe(20);
	});

	// -----------------------------------------------------------------------
	// 8. auth.canSync === false → all no-ops
	// -----------------------------------------------------------------------
	it('8. auth.canSync false: startSync/pullNow/pushNow/flushOnUnload are no-ops', async () => {
		mockAuth.canSync = false;

		const mock = createSupabaseMock({ pullRows: allSixRows() });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(createDefaultState());
		const applySpy = vi.spyOn(bridge, 'applyState');

		await startSync(bridge);
		await pullNow();
		await pushNow();
		flushOnUnload();

		expect(mock.selectBulkCalls.length).toBe(0);
		expect(mock.insertCalls.length).toBe(0);
		expect(mock.updateCalls.length).toBe(0);
		expect(applySpy).not.toHaveBeenCalled();
		expect(syncStatus.phase).toBe('disabled');
		expect(syncStatus.live).toBe(false);
	});

	// -----------------------------------------------------------------------
	// 9. Offline edit survives pull (BUG 1: pull must merge, not replace)
	// Also exercises needsPush: after a pull whose merge result differs from
	// the remote payload recorded in lastSynced, pushNow must select progress
	// via needsPush and write the merged value (not skip the subsystem).
	// -----------------------------------------------------------------------
	it('9. offline edit survives pull and leaves subsystem dirty for push (needsPush after merge)', async () => {
		// Prior successful sync left lastSynced with older server progress (totalLp=10).
		// Local then earned LP offline (totalLp=500) without pushing.
		const olderRemote = progressSlice({ totalLp: 10, practiceDays: 2 });
		const localOffline = progressSlice({ totalLp: 500, practiceDays: 2 });
		const base = createDefaultState();
		const parts = partition(base);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? olderRemote : parts[s], 1));

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		// Start with local already matching the older remote (simulates pre-edit sync state)
		const bridge = makeBridge(assemble({ progress: olderRemote }));
		await startSync(bridge);
		expect(bridge.getState().totalLp).toBe(10);

		// Offline edit: earn LP, no push
		bridge.applyState(
			assemble({
				...partition(bridge.getState()),
				progress: localOffline
			})
		);
		expect(bridge.getState().totalLp).toBe(500);

		// Pull returns the same older remote again
		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pullNow();

		// Local change SURVIVES (merge max, not overwrite)
		expect(bridge.getState().totalLp).toBe(500);

		// needsPush must be true for progress: lastSynced holds remote (totalLp=10)
		// while local/merged is 500 → pushNow must write progress with merged value
		await pushNow();
		const progressWrites = [
			...mock.insertCalls.filter((c) => c.subsystem === 'progress'),
			...mock.updateCalls.filter((c) => c.filters.subsystem === 'progress')
		];
		expect(progressWrites.length).toBeGreaterThanOrEqual(1);
		const lastWrite = progressWrites[progressWrites.length - 1];
		const value =
			'subsystem' in lastWrite && !('filters' in lastWrite)
				? (lastWrite as InsertCall).value
				: (lastWrite as UpdateCall).value;
		const env = value as { schemaVersion: number; data: Record<string, unknown> };
		expect(env.data.totalLp).toBe(500);
	});

	// -----------------------------------------------------------------------
	// 10. Realtime while local dirty keeps subsystem dirty (BUG 2)
	// -----------------------------------------------------------------------
	it('10. realtime merge with dirty local leaves subsystem dirty for push', async () => {
		const pulledProgress = progressSlice({ totalLp: 100, practiceDays: 10 });
		const state = assemble({ progress: pulledProgress });
		const parts = partition(state);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? pulledProgress : parts[s], 1));

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(state);
		await startSync(bridge);

		// Local dirty: practiceDays=15 (totalLp still 100)
		const dirtyLocalProgress = progressSlice({ totalLp: 100, practiceDays: 15 });
		bridge.applyState(
			assemble({
				...partition(bridge.getState()),
				progress: dirtyLocalProgress
			})
		);

		// Remote event: totalLp=50, practiceDays=20, rev=2
		const remoteProgress = progressSlice({ totalLp: 50, practiceDays: 20 });
		const expectedMerge = mergeSubsystem(
			'progress',
			dirtyLocalProgress,
			remoteProgress,
			new Date().toISOString(),
			{ localDirty: true }
		);
		const expectedValue = expectedMerge.value as Record<string, unknown>;

		const handler = mock.getRealtimeHandler();
		expect(handler).toBeTypeOf('function');
		handler!({ new: makeRow('progress', remoteProgress, 2) });

		// Applied state is the merge (not pure remote)
		expect(bridge.getState().totalLp).toBe(expectedValue.totalLp);
		expect(bridge.getState().practiceDays).toBe(expectedValue.practiceDays);
		expect(bridge.getState().totalLp).toBe(100);
		expect(bridge.getState().practiceDays).toBe(20);

		// lastSynced recorded remote, so subsystem is dirty → push writes merged value
		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pushNow();

		const progressUpdates = mock.updateCalls.filter((c) => c.filters.subsystem === 'progress');
		expect(progressUpdates.length).toBeGreaterThanOrEqual(1);
		const written = progressUpdates[progressUpdates.length - 1].value as {
			schemaVersion: number;
			data: Record<string, unknown>;
		};
		// Must equal the merge result, not pure remote (totalLp 50)
		expect(written.data.totalLp).toBe(expectedValue.totalLp);
		expect(written.data.practiceDays).toBe(expectedValue.practiceDays);
		expect(written.data.totalLp).not.toBe(50);
		expect(written.data.totalLp).toBe(100);
		expect(written.data.practiceDays).toBe(20);
	});

	// -----------------------------------------------------------------------
	// 11. Fresh device: no snapshot → config adopts remote; progress merges by max
	// Confirms mergeDirty (no entry → false) is unchanged by the isDirty split:
	// never-synced device adopts remote config; progress still merges by max.
	// -----------------------------------------------------------------------
	it('11. fresh device (no snapshot): remote config adopted, local progress survives merge', async () => {
		// Ensure no persisted snapshot and empty in-memory lastSynced
		memoryStorage.clear();
		stopSync();

		const localProgress = progressSlice({ totalLp: 200, practiceDays: 5 });
		const remoteProgress = progressSlice({ totalLp: 30, practiceDays: 1 });
		const defaultParts = partition(createDefaultState());
		const remoteConfig = {
			...(defaultParts.config as Record<string, unknown>),
			audio: { sfxMuted: true },
			cards: {
				...((defaultParts.config as { cards: Record<string, unknown> }).cards ?? {}),
				newCardsPerDay: 77
			}
		};

		const rows: Row[] = [
			makeRow('srs', defaultParts.srs, 1),
			makeRow('progress', remoteProgress, 1),
			makeRow('daily', defaultParts.daily, 1),
			makeRow('config', remoteConfig, 1),
			makeRow('adjustments', defaultParts.adjustments, 1),
			makeRow('pages', defaultParts.pages, 1)
		];

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		// Local has defaults for config but higher progress (seeded offline earn)
		const localState = assemble({ progress: localProgress });
		// Confirm local config is the default (sfxMuted false, newCardsPerDay default)
		expect(localState.audio.sfxMuted).toBe(false);
		expect(localState.cards.newCardsPerDay).not.toBe(77);

		const bridge = makeBridge(localState);
		await startSync(bridge);

		const applied = bridge.getState();
		// Config: mergeDirty false (never synced) → remote adopted wholesale
		expect(applied.audio.sfxMuted).toBe(true);
		expect(applied.cards.newCardsPerDay).toBe(77);
		// Progress: merges by max regardless of dirty flag → local totalLp survives
		expect(applied.totalLp).toBe(200);
		expect(applied.practiceDays).toBe(5);
	});

	// -----------------------------------------------------------------------
	// 12. Snapshot persistence across stop/start (reload simulation)
	// -----------------------------------------------------------------------
	it('12. persisted snapshot restores dirtiness across stopSync + startSync', async () => {
		const syncedProgress = progressSlice({ totalLp: 40, practiceDays: 3 });
		const base = createDefaultState();
		const parts = partition(base);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? syncedProgress : parts[s], 2));

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		// First session: pull establishes lastSynced and persists snapshot
		const bridge1 = makeBridge(assemble({ progress: syncedProgress }));
		await startSync(bridge1);
		expect(bridge1.getState().totalLp).toBe(40);

		// Snapshot must have been written
		const snapKey = `dutchina_sync_snapshot_${mockAuth.userId}`;
		expect(memoryStorage.getItem(snapKey)).toBeTruthy();

		// stopSync clears in-memory lastSynced but must NOT delete the snapshot
		stopSync();
		expect(memoryStorage.getItem(snapKey)).toBeTruthy();

		// --- Reload simulation A: local still matches snapshot → not re-pushed ---
		const bridgeClean = makeBridge(assemble({ progress: syncedProgress }));
		getSupabase.mockReturnValue(mock.client);
		await startSync(bridgeClean);

		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pushNow();

		const progressWritesClean = [
			...mock.insertCalls.filter((c) => c.subsystem === 'progress'),
			...mock.updateCalls.filter((c) => c.filters.subsystem === 'progress')
		];
		expect(progressWritesClean.length).toBe(0);

		stopSync();

		// --- Reload simulation B: local mutated between sessions → is pushed ---
		const mutatedProgress = progressSlice({ totalLp: 40, practiceDays: 9 });
		const bridgeDirty = makeBridge(assemble({ progress: mutatedProgress }));
		getSupabase.mockReturnValue(mock.client);
		await startSync(bridgeDirty);

		// After pull: merge keeps practiceDays max(9,3)=9; lastSynced is remote (3)
		// → dirty; push must write
		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pushNow();

		const progressWritesDirty = [
			...mock.insertCalls.filter((c) => c.subsystem === 'progress'),
			...mock.updateCalls.filter((c) => c.filters.subsystem === 'progress')
		];
		expect(progressWritesDirty.length).toBeGreaterThanOrEqual(1);
		const lastWrite = progressWritesDirty[progressWritesDirty.length - 1];
		const value =
			'subsystem' in lastWrite && !('filters' in lastWrite)
				? (lastWrite as InsertCall).value
				: (lastWrite as UpdateCall).value;
		const env = value as { schemaVersion: number; data: Record<string, unknown> };
		expect(env.data.practiceDays).toBe(9);
		expect(env.data.totalLp).toBe(40);
	});

	// -----------------------------------------------------------------------
	// 13. Fresh account, empty server — needsPush "no entry → true"
	// Regression guard for the round-2 isDirty default that skipped all inserts
	// when lastSynced was empty after a zero-row pull.
	// -----------------------------------------------------------------------
	it('13. fresh account with empty server pushes every subsystem carrying local data', async () => {
		// Zero rows on the server; no prior snapshot
		memoryStorage.clear();
		stopSync();

		const mock = createSupabaseMock({ pullRows: [] });
		getSupabase.mockReturnValue(mock.client);

		// Real non-default local data for srs / progress / daily / config
		const local = createDefaultState();
		local.cardReviews = {
			'word-1': {
				wordId: 'word-1',
				interval: 1,
				easeFactor: 2.5,
				repetitions: 1,
				nextReviewDate: '2026-08-17',
				lastReviewDate: '2026-08-16',
				firstSeenDate: '2026-08-16'
			}
		};
		local.totalLp = 150;
		local.practiceDays = 4;
		local.dailyHomework = {
			date: '2026-08-16',
			questions: [{ id: 'q1' }],
			currentIndex: 1,
			results: { 0: true },
			completed: false,
			lpEarned: 5
		};
		local.cards = { ...local.cards, newCardsPerDay: 12 };

		const bridge = makeBridge(local);
		await startSync(bridge);

		// Pull applied nothing (no rows); local data must still be present
		expect(bridge.getState().totalLp).toBe(150);
		expect(bridge.getState().cardReviews['word-1']).toBeDefined();
		expect(bridge.getState().cards.newCardsPerDay).toBe(12);
		expect(bridge.getState().dailyHomework.date).toBe('2026-08-16');

		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;

		await pushNow();

		// needsPush: no lastSynced entry → true for every subsystem after a zero-row pull
		expect(mock.insertCalls.length).toBeGreaterThan(0);

		const inserted = new Set(mock.insertCalls.map((c) => c.subsystem));
		// Subsystems that carry real local data must be inserted
		for (const s of ['srs', 'progress', 'daily', 'config'] as const) {
			expect(inserted.has(s)).toBe(true);
		}

		// adjustments and pages are always constant empty arrays from partition()
		// regardless of local state. With needsPush's "no entry → true" they still
		// get inserted (server has no row yet) — correct, just documenting it.
		expect(inserted.has('adjustments')).toBe(true);
		expect(inserted.has('pages')).toBe(true);
		// All six subsystems: insert, not update (never had a row)
		expect(mock.insertCalls.length).toBe(6);
		expect(mock.updateCalls.length).toBe(0);

		// Spot-check payloads carry the real local data
		const srsInsert = mock.insertCalls.find((c) => c.subsystem === 'srs');
		const progressInsert = mock.insertCalls.find((c) => c.subsystem === 'progress');
		const dailyInsert = mock.insertCalls.find((c) => c.subsystem === 'daily');
		const configInsert = mock.insertCalls.find((c) => c.subsystem === 'config');
		expect(srsInsert).toBeDefined();
		expect(progressInsert).toBeDefined();
		expect(dailyInsert).toBeDefined();
		expect(configInsert).toBeDefined();

		const srsData = (srsInsert!.value as { data: { cardReviews: Record<string, unknown> } }).data;
		expect(srsData.cardReviews['word-1']).toBeDefined();

		const progressData = (
			progressInsert!.value as { data: { totalLp: number; practiceDays: number } }
		).data;
		expect(progressData.totalLp).toBe(150);
		expect(progressData.practiceDays).toBe(4);

		const dailyData = (dailyInsert!.value as { data: { dailyHomework: { date: string | null } } })
			.data;
		expect(dailyData.dailyHomework.date).toBe('2026-08-16');

		const configData = (configInsert!.value as { data: { cards: { newCardsPerDay: number } } })
			.data;
		expect(configData.cards.newCardsPerDay).toBe(12);
	});

	// -----------------------------------------------------------------------
	// 14. needsPush after merge — dedicated observation of push selection
	// After pullAndApply records remote in lastSynced while bridge holds a
	// merged value that differs, needsPush must select that subsystem.
	// -----------------------------------------------------------------------
	it('14. needsPush after merge: pushNow writes subsystem whose merge result differs from remote', async () => {
		const olderRemote = progressSlice({ totalLp: 10, practiceDays: 2 });
		const localEdit = progressSlice({ totalLp: 300, practiceDays: 8 });
		const base = createDefaultState();
		const parts = partition(base);
		const rows = SUBSYSTEMS.map((s) => makeRow(s, s === 'progress' ? olderRemote : parts[s], 1));

		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(assemble({ progress: olderRemote }));
		await startSync(bridge);

		// Local edit that will survive merge (max on totalLp / practiceDays)
		bridge.applyState(
			assemble({
				...partition(bridge.getState()),
				progress: localEdit
			})
		);

		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pullNow();

		// Merge kept local highs; lastSynced still holds remote payload
		expect(bridge.getState().totalLp).toBe(300);
		expect(bridge.getState().practiceDays).toBe(8);

		// needsPush(progress) must be true → pushNow issues a write with merged value
		await pushNow();
		const progressWrites = [
			...mock.insertCalls.filter((c) => c.subsystem === 'progress'),
			...mock.updateCalls.filter((c) => c.filters.subsystem === 'progress')
		];
		expect(progressWrites.length).toBeGreaterThanOrEqual(1);
		const lastWrite = progressWrites[progressWrites.length - 1];
		const value =
			'subsystem' in lastWrite && !('filters' in lastWrite)
				? (lastWrite as InsertCall).value
				: (lastWrite as UpdateCall).value;
		const env = value as { schemaVersion: number; data: Record<string, unknown> };
		expect(env.data.totalLp).toBe(300);
		expect(env.data.practiceDays).toBe(8);
		// Not pure remote
		expect(env.data.totalLp).not.toBe(10);
	});

	// -----------------------------------------------------------------------
	// 15. resetRemote: deletes app_state, clears lastSynced + snapshot
	// -----------------------------------------------------------------------
	it('15. resetRemote deletes app_state by user_id, clears snapshot, and re-inserts on next push', async () => {
		const rows = allSixRows(2);
		const mock = createSupabaseMock({ pullRows: rows });
		getSupabase.mockReturnValue(mock.client);

		const bridge = makeBridge(createDefaultState());
		await startSync(bridge);

		const snapKey = `dutchina_sync_snapshot_${mockAuth.userId}`;
		// Pull populated lastSynced and persisted the snapshot
		expect(memoryStorage.getItem(snapKey)).not.toBeNull();

		// Local still matches pulled defaults → no dirty push yet
		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pushNow();
		expect(mock.insertCalls).toHaveLength(0);
		expect(mock.updateCalls).toHaveLength(0);

		const ok = await resetRemote();
		expect(ok).toBe(true);
		expect(mock.deleteCalls).toHaveLength(1);
		expect(mock.deleteCalls[0]).toEqual({ user_id: mockAuth.userId });
		expect(memoryStorage.getItem(snapKey)).toBeNull();

		// lastSynced cleared → needsPush true for every subsystem → inserts all six
		mock.insertCalls.length = 0;
		mock.updateCalls.length = 0;
		await pushNow();
		expect(mock.insertCalls).toHaveLength(6);
		expect(mock.insertCalls.map((c) => c.subsystem).sort()).toEqual([...SUBSYSTEMS].sort());
		expect(mock.updateCalls).toHaveLength(0);
	});

	// -----------------------------------------------------------------------
	// 16. resetRemote gated by canSync
	// -----------------------------------------------------------------------
	it('16. resetRemote returns false and issues no delete when auth.canSync is false', async () => {
		const mock = createSupabaseMock({ pullRows: [] });
		getSupabase.mockReturnValue(mock.client);
		mockAuth.canSync = false;

		const ok = await resetRemote();

		expect(ok).toBe(false);
		expect(mock.deleteCalls).toHaveLength(0);
	});
});
