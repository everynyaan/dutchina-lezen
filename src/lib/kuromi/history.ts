// ============================================================
// KUROMI CHAT HISTORY
// Model-context window capping (capHistory) plus a one-time migration
// of the legacy per-profile localStorage transcript into a synced
// KuromiConversation. Storage/sync caps live in conversations.ts.
// ============================================================

import type { ProfileId } from '$lib/profiles/profiles';
import type { KuromiConversation } from '$lib/state/schema';
import type { KuromiTurn } from './types';
import { appendToConversation, deriveTitle, newConversation } from './conversations';

const MAX_TURNS = 12;
// Must stay under MAX_CLIENT_CONTENT_CHARS in netlify/functions/lib/shared.mts
// (the server-side ceiling on client-supplied chat content). If you raise this,
// check that constant still has headroom; if you raise that one, this can grow.
const MAX_CONTENT_CHARS = 4000;

function storageKey(profile: ProfileId): string {
	return `dutchina_kuromi_chat_${profile}`;
}

function importedFlagKey(profile: ProfileId): string {
	return `dutchina_kuromi_chat_imported_${profile}`;
}

function isValidTurn(item: unknown): item is KuromiTurn {
	if (item === null || typeof item !== 'object') return false;
	const t = item as Record<string, unknown>;
	return (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string';
}

/** Apply turn-count cap, then content-length drop-oldest rule. Whole turns only. */
export function capHistory(turns: KuromiTurn[]): KuromiTurn[] {
	let result = turns.length > MAX_TURNS ? turns.slice(-MAX_TURNS) : turns.slice();

	while (result.length > 1) {
		const total = result.reduce((sum, t) => sum + t.content.length, 0);
		if (total < MAX_CONTENT_CHARS) break;
		result = result.slice(1);
	}

	return result;
}

export type LegacyChatReadResult =
	| { status: 'already-imported' }
	| { status: 'nothing-to-import' }
	| { status: 'found'; conversation: KuromiConversation };

/**
 * READ-ONLY phase. Never writes the imported flag, never removes the
 * legacy key -- so a crash/reload here loses nothing; a later call just
 * reads the same untouched data again.
 *  - 'already-imported': the flag is already set. Caller must NOT call
 *    commitLegacyChatImport for this result.
 *  - 'nothing-to-import': the legacy key is absent, not valid JSON, not
 *    an array, or has zero valid turns. The raw value (if any) is left
 *    completely untouched here -- a parse error must not delete data.
 *    Caller should call commitLegacyChatImport(profile, false) to settle
 *    the flag so this stops being re-checked every load.
 *  - 'found': a real conversation was built. Caller must merge it into
 *    synced state, confirm it is present, and ONLY THEN call
 *    commitLegacyChatImport(profile, true) to remove the legacy key and
 *    set the flag.
 */
export function readLegacyChat(
	profile: ProfileId,
	nowISO: string,
	newId: string
): LegacyChatReadResult {
	if (typeof window === 'undefined') return { status: 'already-imported' };

	const flagKey = importedFlagKey(profile);
	if (localStorage.getItem(flagKey) !== null) return { status: 'already-imported' };

	const legacyKey = storageKey(profile);
	const raw = localStorage.getItem(legacyKey);
	if (raw === null) return { status: 'nothing-to-import' };

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return { status: 'nothing-to-import' };
	}
	if (!Array.isArray(parsed)) return { status: 'nothing-to-import' };
	const turns = parsed.filter(isValidTurn);
	if (turns.length === 0) return { status: 'nothing-to-import' };

	let conversation = newConversation(nowISO, newId);
	for (const t of turns) {
		conversation = appendToConversation(conversation, t, nowISO);
	}
	const firstUser = turns.find((t) => t.role === 'user');
	conversation = {
		...conversation,
		title: deriveTitle(firstUser?.content ?? '')
	};

	return { status: 'found', conversation };
}

/**
 * COMMIT phase. Call ONLY after a 'found' result's conversation is
 * confirmed present in synced state (or immediately for 'nothing-to-import',
 * with `imported: false`). Sets the flag so this profile is never
 * re-checked; removes the legacy key ONLY when `imported` is true --
 * garbage/corrupt legacy data is left in place forever, never deleted,
 * but is also never re-read once the flag is set. Never call this for an
 * 'already-imported' read result.
 */
export function commitLegacyChatImport(profile: ProfileId, imported: boolean): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(importedFlagKey(profile), '1');
	if (imported) {
		localStorage.removeItem(storageKey(profile));
	}
}
