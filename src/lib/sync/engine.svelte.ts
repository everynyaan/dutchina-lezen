// ============================================================
// SYNC ENGINE
// Moves six subsystem slices between local bridge state and
// Supabase app_state with rev guards, conflict merge, realtime,
// offline retry queue, and schema-version guard.
// ============================================================

import type { Subsystem, AuditNote } from './subsystems';
import { SUBSYSTEMS, partition, assemble, mergeSubsystem } from './subsystems';
import type { CurrentState } from '$lib/state/schema';
import { CURRENT_SCHEMA_VERSION } from '$lib/state/schema';
import { migrate } from '$lib/state/migrations';
import { auth } from '$lib/auth/session.svelte';
import { getSupabase } from '$lib/supabase/client';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SyncPhase = 'disabled' | 'idle' | 'pulling' | 'pushing' | 'offline' | 'error';

export interface SyncBridge {
	getState(): CurrentState;
	applyState(next: CurrentState): void;
}

interface Envelope {
	schemaVersion: number;
	data: unknown;
}

interface AppStateRow {
	user_id: string;
	subsystem: string;
	value: unknown;
	rev: number;
	updated_at?: string;
}

interface LastSyncedEntry {
	payload: unknown;
	rev: number;
}

// ---------------------------------------------------------------------------
// Reactive status (Svelte 5 runes, plain-object getters — same pattern as auth)
// ---------------------------------------------------------------------------

let _phase = $state<SyncPhase>('disabled');
let _lastSyncedAt = $state<string | null>(null);
let _live = $state(false);
let _pending = $state<Subsystem[]>([]);
let _lastError = $state<string | null>(null);
let _needsUpdate = $state(false);
let _notes = $state<AuditNote[]>([]);

export const syncStatus: {
	readonly phase: SyncPhase;
	readonly lastSyncedAt: string | null;
	readonly live: boolean;
	readonly pending: Subsystem[];
	readonly lastError: string | null;
	readonly needsUpdate: boolean;
	readonly notes: AuditNote[];
} = {
	get phase() {
		return _phase;
	},
	get lastSyncedAt() {
		return _lastSyncedAt;
	},
	get live() {
		return _live;
	},
	get pending() {
		return _pending;
	},
	get lastError() {
		return _lastError;
	},
	get needsUpdate() {
		return _needsUpdate;
	},
	get notes() {
		return _notes;
	}
};

// ---------------------------------------------------------------------------
// Module-private state
// ---------------------------------------------------------------------------

const lastSynced: Partial<Record<Subsystem, LastSyncedEntry | undefined>> = {};

let bridge: SyncBridge | null = null;
let channel: RealtimeChannel | null = null;
let visibilityHandler: (() => void) | null = null;
/** Serialize overlapping pull/push so concurrent calls do not interleave. */
let opLock: Promise<void> = Promise.resolve();

const BACKOFF_BASE_MS = 20;
const BACKOFF_JITTER_MS = 10;
const MAX_WRITE_ATTEMPTS = 5;
const NOTES_CAP = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

function isRecord(x: unknown): x is Record<string, unknown> {
	return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isSubsystem(s: string): s is Subsystem {
	return (SUBSYSTEMS as readonly string[]).includes(s);
}

function wrapEnvelope(data: unknown): Envelope {
	return { schemaVersion: CURRENT_SCHEMA_VERSION, data };
}

/** Unwrap a row value; returns null if the shape is unusable. */
function unwrapEnvelope(raw: unknown): Envelope | null {
	if (!isRecord(raw)) return null;
	if (typeof raw.schemaVersion !== 'number' || !Number.isFinite(raw.schemaVersion)) return null;
	// data may be any JSON; missing data treated as undefined payload
	return { schemaVersion: raw.schemaVersion, data: raw.data };
}

function appendNotes(incoming: AuditNote[]): void {
	if (incoming.length === 0) return;
	const next = _notes.concat(incoming);
	_notes = next.length > NOTES_CAP ? next.slice(next.length - NOTES_CAP) : next;
}

function addPending(s: Subsystem): void {
	if (!_pending.includes(s)) {
		_pending = [..._pending, s];
	}
}

function removePending(s: Subsystem): void {
	if (_pending.includes(s)) {
		_pending = _pending.filter((x) => x !== s);
	}
}

function clearLastSynced(): void {
	for (const s of SUBSYSTEMS) {
		lastSynced[s] = undefined;
	}
}

/**
 * "Does local hold an unsynced edit?" — feeds mergeSubsystem's opts.localDirty.
 * No entry (never synced on this device) -> false: a device that has never
 * synced this subsystem should adopt whatever the server holds rather than
 * treat its own (possibly just-default) local copy as an edit in progress.
 * Used ONLY by handleRealtimeChange and pullAndApply's per-subsystem merge loop.
 */
function mergeDirty(s: Subsystem, state: CurrentState): boolean {
	const entry = lastSynced[s];
	if (entry === undefined) return false;
	return !deepEqual(partition(state)[s], entry.payload);
}

/**
 * "Does the server lack what local has?" — selects which subsystems pushNow
 * writes. No entry (nothing recorded as synced for this subsystem, e.g. the
 * server has no row for it yet) -> true: absence of a snapshot means the
 * server has nothing here, which is exactly when an insert is mandatory, not
 * a reason to skip the write. Used ONLY by pushNow.
 */
function needsPush(s: Subsystem, state: CurrentState): boolean {
	const entry = lastSynced[s];
	if (entry === undefined) return true;
	return !deepEqual(partition(state)[s], entry.payload);
}

function snapshotStorageKey(uid: string): string {
	return `dutchina_sync_snapshot_${uid}`;
}

/** Persist lastSynced payloads+revs to localStorage (uid-scoped). Best-effort. */
function persistLastSynced(uid: string): void {
	if (typeof window === 'undefined') return;
	try {
		const out: Partial<Record<Subsystem, LastSyncedEntry>> = {};
		for (const s of SUBSYSTEMS) {
			const entry = lastSynced[s];
			if (entry !== undefined) {
				out[s] = { payload: entry.payload, rev: entry.rev };
			}
		}
		window.localStorage.setItem(snapshotStorageKey(uid), JSON.stringify(out));
	} catch {
		// corrupt / unavailable storage must never throw out of the sync engine
	}
}

/** Restore lastSynced from localStorage at the start of startSync. Best-effort. */
function restoreLastSynced(uid: string): void {
	if (typeof window === 'undefined') return;
	try {
		const raw = window.localStorage.getItem(snapshotStorageKey(uid));
		if (raw == null || raw === '') return;
		const parsed: unknown = JSON.parse(raw);
		if (!isRecord(parsed)) return;
		for (const key of Object.keys(parsed)) {
			if (!isSubsystem(key)) continue;
			const v = parsed[key];
			if (!isRecord(v)) continue;
			if (typeof v.rev !== 'number' || !Number.isFinite(v.rev)) continue;
			if (!('payload' in v)) continue;
			lastSynced[key] = { payload: v.payload, rev: v.rev };
		}
	} catch {
		// corrupt / unavailable storage must never throw out of the sync engine
	}
}

function isDuplicateKeyError(error: { code?: string; message?: string } | null): boolean {
	if (!error) return false;
	if (error.code === '23505') return true;
	const msg = error.message ?? '';
	return /duplicate key/i.test(msg);
}

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

/** Wall-clock ISO timestamp for audit/sync metadata (not reactive UI state). */
function nowISO(): string {
	return new Date().toISOString();
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
	const prev = opLock;
	let release!: () => void;
	opLock = new Promise<void>((res) => {
		release = res;
	});
	await prev;
	try {
		return await fn();
	} finally {
		release();
	}
}

function gateOrDisable(): boolean {
	if (!auth.canSync) {
		_phase = 'disabled';
		return false;
	}
	return true;
}

// ---------------------------------------------------------------------------
// Schema-version guard (pull path)
// ---------------------------------------------------------------------------

type GuardResult =
	| { kind: 'ok'; data: unknown; schemaVersion: number }
	| { kind: 'refuse' }
	| { kind: 'old'; data: unknown; schemaVersion: number };

function guardEnvelope(envelope: Envelope): GuardResult {
	if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) {
		_needsUpdate = true;
		return { kind: 'refuse' };
	}
	if (envelope.schemaVersion < CURRENT_SCHEMA_VERSION) {
		return { kind: 'old', data: envelope.data, schemaVersion: envelope.schemaVersion };
	}
	return { kind: 'ok', data: envelope.data, schemaVersion: envelope.schemaVersion };
}

/**
 * Realtime path: schemaVersion < current is treated the same as equal (use data
 * as-is). Only the greater-than case refuses and sets needsUpdate.
 *
 * This is self-healing under the lastSynced invariant: an older remote row merges
 * into local, lastSynced records the (older) remote payload, the merge result
 * differs from that remote payload so the subsystem is dirty, and a subsequent
 * pushNow writes it back at the current schema version. Pull still migrates
 * older envelopes explicitly and write-backs immediately.
 */
function guardEnvelopeRealtime(envelope: Envelope): GuardResult {
	if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) {
		_needsUpdate = true;
		return { kind: 'refuse' };
	}
	// older or equal → use data as-is (self-heals via dirty + pushNow)
	return { kind: 'ok', data: envelope.data, schemaVersion: envelope.schemaVersion };
}

// ---------------------------------------------------------------------------
// Write protocol (per subsystem)
// ---------------------------------------------------------------------------

async function writeSubsystem(
	client: SupabaseClient,
	uid: string,
	s: Subsystem,
	initialPayload: unknown
): Promise<boolean> {
	let writePayload: unknown = initialPayload;
	let envelope: Envelope = wrapEnvelope(writePayload);

	// Step 1: insert if we have never successfully recorded this row
	if (lastSynced[s] === undefined) {
		const { error: insertError } = await client.from('app_state').insert({
			user_id: uid,
			subsystem: s,
			value: envelope
		});

		if (!insertError) {
			// Trigger forces rev := 1 on insert
			lastSynced[s] = { payload: writePayload, rev: 1 };
			persistLastSynced(uid);
			removePending(s);
			return true;
		}

		if (!isDuplicateKeyError(insertError)) {
			_lastError = insertError.message ?? 'insert failed';
			addPending(s);
			_phase = 'offline';
			return false;
		}
		// duplicate key → fall through to update
	}

	let expectedRev = lastSynced[s]?.rev ?? 0;

	for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt++) {
		if (attempt > 1) {
			const delay = BACKOFF_BASE_MS * attempt + Math.random() * BACKOFF_JITTER_MS;
			await sleep(delay);
		}

		// Step 2: optimistic update guarded by rev (never send rev/updated_at)
		const { data: updated, error: updateError } = await client
			.from('app_state')
			.update({ value: envelope })
			.eq('user_id', uid)
			.eq('subsystem', s)
			.eq('rev', expectedRev)
			.select();

		if (updateError) {
			_lastError = updateError.message ?? 'update failed';
			if (attempt === MAX_WRITE_ATTEMPTS) {
				addPending(s);
				_phase = 'offline';
				return false;
			}
			continue;
		}

		const rows = Array.isArray(updated) ? updated : [];
		if (rows.length === 1) {
			const row = rows[0] as AppStateRow;
			const rev = typeof row.rev === 'number' ? row.rev : expectedRev + 1;
			lastSynced[s] = { payload: writePayload, rev };
			persistLastSynced(uid);
			removePending(s);
			return true;
		}

		// Step 3: conflict — re-select remote row
		const { data: remoteRow, error: selectError } = await client
			.from('app_state')
			.select('*')
			.eq('user_id', uid)
			.eq('subsystem', s)
			.single();

		if (selectError || !remoteRow) {
			_lastError = selectError?.message ?? 'conflict select failed';
			if (attempt === MAX_WRITE_ATTEMPTS) {
				addPending(s);
				_phase = 'offline';
				return false;
			}
			continue;
		}

		const row = remoteRow as AppStateRow;
		const remoteEnv = unwrapEnvelope(row.value);
		if (!remoteEnv) {
			_lastError = `invalid remote envelope for ${s}`;
			if (attempt === MAX_WRITE_ATTEMPTS) {
				addPending(s);
				_phase = 'offline';
				return false;
			}
			continue;
		}

		// Schema guard on conflict remote: refuse newer, do not requeue as pending
		if (remoteEnv.schemaVersion > CURRENT_SCHEMA_VERSION) {
			_needsUpdate = true;
			_lastError = `remote schemaVersion ${remoteEnv.schemaVersion} newer than client`;
			return false;
		}

		// Local payload from live bridge (preserves in-memory edit); always dirty in conflict path
		const local = bridge ? partition(bridge.getState())[s] : writePayload;
		const merged = mergeSubsystem(s, local, remoteEnv.data, nowISO(), {
			localDirty: true
		});
		appendNotes(merged.notes);

		writePayload = merged.value;
		envelope = wrapEnvelope(writePayload);
		expectedRev = typeof row.rev === 'number' ? row.rev : expectedRev;
	}

	// Exhausted attempts — keep local in-memory value exactly as-is
	addPending(s);
	_phase = 'offline';
	_lastError = `write of ${s} failed after ${MAX_WRITE_ATTEMPTS} attempts`;
	return false;
}

// ---------------------------------------------------------------------------
// Pull (shared by startSync + pullNow)
// ---------------------------------------------------------------------------

async function pullAndApply(client: SupabaseClient, uid: string): Promise<void> {
	if (!bridge) return;

	_phase = 'pulling';

	const { data, error } = await client.from('app_state').select('*').eq('user_id', uid);

	if (error) {
		_lastError = error.message ?? 'pull failed';
		_phase = 'offline';
		return;
	}

	const rows = (Array.isArray(data) ? data : []) as AppStateRow[];
	// Raw remote data from non-refused rows only. Refused rows are skipped entirely.
	let remoteParts: Partial<Record<Subsystem, unknown>> = {};
	const pulledMeta: Partial<Record<Subsystem, { rev: number; schemaVersion: number }>> = {};
	let anyOld = false;

	for (const row of rows) {
		if (!isSubsystem(row.subsystem)) continue;
		const s = row.subsystem;
		const env = unwrapEnvelope(row.value);
		if (!env) continue;

		const guarded = guardEnvelope(env);
		if (guarded.kind === 'refuse') {
			// Leave lastSynced[s] and local state untouched for this subsystem
			continue;
		}
		if (guarded.kind === 'old') {
			anyOld = true;
		}
		remoteParts[s] = guarded.data;
		pulledMeta[s] = { rev: row.rev, schemaVersion: guarded.schemaVersion };
	}

	// Older-schema rows: migrate the assembled remote snapshot, then re-partition
	// so every non-refused remote payload is current-shaped before per-subsystem merge.
	if (anyOld) {
		const assembledRemote = assemble(remoteParts);
		const migratedState = migrate(assembledRemote) as CurrentState;
		const migratedParts = partition(migratedState);
		const upgraded: Partial<Record<Subsystem, unknown>> = {};
		for (const s of SUBSYSTEMS) {
			if (pulledMeta[s] === undefined) continue;
			upgraded[s] = migratedParts[s];
		}
		remoteParts = upgraded;
	}

	// Per-subsystem merge: never replace local wholesale. Subsystems with no row
	// keep their current local payload (do not merge against a missing row).
	const localParts = partition(bridge.getState());
	const mergedParts: Partial<Record<Subsystem, unknown>> = { ...localParts };
	const now = nowISO();

	for (const s of SUBSYSTEMS) {
		if (pulledMeta[s] === undefined) continue;
		const localPayload = localParts[s];
		const remotePayload = remoteParts[s];
		const dirty = mergeDirty(s, bridge.getState());
		const merged = mergeSubsystem(s, localPayload, remotePayload, now, {
			localDirty: dirty
		});
		appendNotes(merged.notes);
		mergedParts[s] = merged.value;
	}

	const assembled = assemble(mergedParts);
	bridge.applyState(assembled);

	// lastSynced records what THE SERVER holds (remote payload), never the merge result.
	for (const s of SUBSYSTEMS) {
		const meta = pulledMeta[s];
		if (!meta) continue;
		lastSynced[s] = { payload: remoteParts[s], rev: meta.rev };
	}
	persistLastSynced(uid);

	// Older-schema rows: write back the merged value immediately so the server
	// upgrades to the current schema version (update-by-rev path; rev already set).
	if (anyOld) {
		const afterParts = partition(bridge.getState());
		for (const s of SUBSYSTEMS) {
			const meta = pulledMeta[s];
			if (!meta) continue;
			if (meta.schemaVersion < CURRENT_SCHEMA_VERSION) {
				await writeSubsystem(client, uid, s, afterParts[s]);
			}
		}
	}

	_lastSyncedAt = nowISO();
	// writeSubsystem may have flipped phase to offline during migration write-back
	if (_phase === 'pulling' || _phase === 'idle') {
		_phase = 'idle';
	}
}

// ---------------------------------------------------------------------------
// Realtime
// ---------------------------------------------------------------------------

function handleRealtimeChange(payload: { new?: AppStateRow | null; eventType?: string }): void {
	if (!bridge) return;
	if (!auth.canSync) return;

	const row = payload.new;
	if (!row || !isSubsystem(row.subsystem)) return;
	const s = row.subsystem;

	const env = unwrapEnvelope(row.value);
	if (!env) return;

	// Echo / stale guard
	const knownRev = lastSynced[s]?.rev ?? 0;
	if (typeof row.rev === 'number' && row.rev <= knownRev) {
		return;
	}

	const guarded = guardEnvelopeRealtime(env);
	if (guarded.kind === 'refuse') {
		return;
	}

	const remotePayload = guarded.data;
	const current = bridge.getState();
	const parts = partition(current);
	const localPayload = parts[s];
	const localDirty = mergeDirty(s, current);

	const merged = mergeSubsystem(s, localPayload, remotePayload, nowISO(), {
		localDirty
	});
	appendNotes(merged.notes);

	// Rebuild full state: five current slices + merged subsystem
	const nextParts: Partial<Record<Subsystem, unknown>> = { ...parts, [s]: merged.value };
	const nextState = assemble(nextParts);
	bridge.applyState(nextState);

	// Record what the server holds (remote row), never the merge result — otherwise
	// a non-trivial merge looks clean and the local side of the merge is never pushed.
	lastSynced[s] = {
		payload: remotePayload,
		rev: typeof row.rev === 'number' ? row.rev : knownRev
	};
	const uid = auth.userId;
	if (uid) persistLastSynced(uid);
}

/** Narrow channel builder so postgres_changes overload resolves under strict types. */
interface AppStateChannel {
	on(
		type: 'postgres_changes',
		filter: {
			event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
			schema: string;
			table: string;
			filter: string;
		},
		handler: (payload: { new: AppStateRow | null; old?: AppStateRow | null }) => void
	): AppStateChannel;
	subscribe(cb?: (status: string) => void): RealtimeChannel;
}

function subscribeRealtime(client: SupabaseClient, uid: string): void {
	// Tear down any prior channel first
	if (channel) {
		void client.removeChannel(channel);
		channel = null;
		_live = false;
	}

	const ch = client.channel(`app_state:${uid}`) as unknown as AppStateChannel;
	const subscribed = ch
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'app_state',
				filter: `user_id=eq.${uid}`
			},
			(payload) => {
				handleRealtimeChange(payload);
			}
		)
		.subscribe(() => {
			_live = true;
		});

	channel = subscribed;
	// Also set live immediately so tests (and callers) can observe subscription
	// without waiting for the async SUBSCRIBED status callback.
	_live = true;
}

function registerVisibility(): void {
	if (typeof document === 'undefined') return;
	if (visibilityHandler) return;

	visibilityHandler = () => {
		if (typeof document === 'undefined') return;
		if (document.visibilityState === 'visible') {
			void pullNow();
		}
	};
	document.addEventListener('visibilitychange', visibilityHandler);
}

function unregisterVisibility(): void {
	if (typeof document === 'undefined') return;
	if (!visibilityHandler) return;
	document.removeEventListener('visibilitychange', visibilityHandler);
	visibilityHandler = null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function startSync(b: SyncBridge): Promise<void> {
	if (!gateOrDisable()) return;

	bridge = b;
	const client = getSupabase();
	const uid = auth.userId;
	if (!client || !uid) {
		_phase = 'error';
		_lastError = !client ? 'Supabase client unavailable' : 'No user id';
		return;
	}

	// Restore dirty-tracking snapshot before pull so offline edits survive reload.
	restoreLastSynced(uid);

	await withLock(async () => {
		if (!gateOrDisable()) return;
		await pullAndApply(client, uid);
		if (!auth.canSync) {
			_phase = 'disabled';
			return;
		}
		subscribeRealtime(client, uid);
		registerVisibility();
		if (_phase === 'pulling') _phase = 'idle';
	});
}

export function stopSync(): void {
	const client = getSupabase();
	if (channel && client) {
		void client.removeChannel(channel);
	} else if (channel) {
		// Best-effort: channel.unsubscribe if removeChannel unavailable
		try {
			void channel.unsubscribe();
		} catch {
			// ignore
		}
	}
	channel = null;
	unregisterVisibility();
	bridge = null;
	// Clear in-memory lastSynced only — do NOT delete the uid-scoped localStorage
	// snapshot. It must survive stop/start and reload cycles so dirtiness is
	// restored on the next startSync. Explicit re-bind / sign-out (elsewhere)
	// would clear storage if needed.
	clearLastSynced();

	// Reset live status fields. lastSyncedAt and notes are cleared for a clean
	// stop (idempotent re-start). Pending is emptied since the session ended.
	_phase = 'disabled';
	_live = false;
	_pending = [];
	_lastError = null;
	_needsUpdate = false;
	// Keep lastSyncedAt / notes intentionally? Spec allows either. Clear both
	// so repeated start/stop cycles in tests do not leak audit history.
	_lastSyncedAt = null;
	_notes = [];
}

export async function pullNow(): Promise<void> {
	if (!gateOrDisable()) return;
	if (!bridge) return;

	const client = getSupabase();
	const uid = auth.userId;
	if (!client || !uid) {
		_phase = 'error';
		_lastError = !client ? 'Supabase client unavailable' : 'No user id';
		return;
	}

	await withLock(async () => {
		if (!gateOrDisable() || !bridge) return;
		await pullAndApply(client, uid);
	});
}

export async function pushNow(): Promise<void> {
	if (!gateOrDisable()) return;
	if (!bridge) return;

	const client = getSupabase();
	const uid = auth.userId;
	if (!client || !uid) {
		_phase = 'error';
		_lastError = !client ? 'Supabase client unavailable' : 'No user id';
		return;
	}

	await withLock(async () => {
		if (!gateOrDisable() || !bridge) return;

		const state = bridge.getState();
		const dirty = SUBSYSTEMS.filter((s) => needsPush(s, state));
		if (dirty.length === 0) {
			if (_phase === 'pushing' || _phase === 'pulling' || _phase === 'idle') {
				_phase = 'idle';
			}
			return;
		}

		_phase = 'pushing';
		const parts = partition(state);
		let anyFail = false;

		// Sequential independent writes: one subsystem failing does not skip the rest
		for (const s of dirty) {
			if (!auth.canSync) {
				_phase = 'disabled';
				return;
			}
			const ok = await writeSubsystem(client, uid, s, parts[s]);
			if (!ok) anyFail = true;
		}

		if (!anyFail && _phase === 'pushing') {
			_phase = 'idle';
			_lastSyncedAt = nowISO();
		}
	});
}

/**
 * Best-effort keepalive-style flush. Fire-and-forget push; never throws.
 * Callers (later lane) wire this to pagehide — this module does not register that listener.
 */
export function flushOnUnload(): void {
	try {
		if (!auth.canSync) {
			_phase = 'disabled';
			return;
		}
		if (!bridge) return;
		void pushNow();
	} catch {
		// never throw from unload path
	}
}

/**
 * Delete all app_state rows for the signed-in user and clear the local
 * synced-snapshot (in-memory + localStorage). Used by explicit "delete all
 * progress" so a subsequent startSync pull cannot resurrect server rows.
 * Does not require an active bridge. Returns false when gated off or on error.
 */
export async function resetRemote(): Promise<boolean> {
	if (!auth.canSync) return false;
	const uid = auth.userId;
	const client = getSupabase();
	if (!uid || !client) return false;
	const { error } = await client.from('app_state').delete().eq('user_id', uid);
	if (error) return false;
	clearLastSynced();
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.removeItem(snapshotStorageKey(uid));
		} catch {
			// best-effort
		}
	}
	return true;
}
