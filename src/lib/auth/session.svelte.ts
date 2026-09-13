// ============================================================
// AUTH SESSION (headless)
// Svelte 5 runes module: reactive auth state + magic-link helpers.
// Signing in is an affordance, never a gate. Sync is inactive until
// the user is signed in and this device is bound to profile+uid.
// ============================================================

import type { ProfileId } from '$lib/profiles/profiles';
import { getActiveProfile } from '$lib/profiles/profiles';
import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';

export type AuthState = 'unknown' | 'signed-out' | 'signed-in';

const SYNCED_PROFILE_KEY = 'dutchina_synced_profile';
const SYNCED_UID_KEY = 'dutchina_synced_uid';

let _state = $state<AuthState>('unknown');
let _email = $state<string | null>(null);
let _userId = $state<string | null>(null);
/** Bumped when binding localStorage keys change so canSync/blockedReason stay reactive. */
let _bindingEpoch = $state(0);

let _subscribed = false;

function readStoredProfile(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(SYNCED_PROFILE_KEY);
}

function readStoredUid(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(SYNCED_UID_KEY);
}

function applySession(session: { user?: { id: string; email?: string | null } } | null): void {
	if (session?.user) {
		_state = 'signed-in';
		_email = session.user.email ?? null;
		_userId = session.user.id;
	} else {
		_state = 'signed-out';
		_email = null;
		_userId = null;
	}
}

/**
 * blockedReason / canSync truth table (profile-mismatch wins over account-mismatch
 * when both differ). No binding at all while signed-in is account-mismatch.
 */
function computeBlockedReason(): null | 'signed-out' | 'profile-mismatch' | 'account-mismatch' {
	// Depend on binding epoch so bindSync/clearSyncBinding re-run this.
	void _bindingEpoch;

	if (_state !== 'signed-in') {
		return 'signed-out';
	}

	const storedProfile = readStoredProfile();
	const storedUid = readStoredUid();
	const active = getActiveProfile();

	// Neither key stored → account-mismatch (not a fifth state).
	if (storedProfile === null && storedUid === null) {
		return 'account-mismatch';
	}

	if (storedProfile !== active) {
		return 'profile-mismatch';
	}

	if (!storedUid || storedUid !== _userId) {
		return 'account-mismatch';
	}

	return null;
}

export const auth: {
	readonly state: AuthState;
	readonly email: string | null;
	readonly userId: string | null;
	readonly canSync: boolean;
	readonly blockedReason: null | 'signed-out' | 'profile-mismatch' | 'account-mismatch';
} = {
	get state() {
		return _state;
	},
	get email() {
		return _email;
	},
	get userId() {
		return _userId;
	},
	get canSync() {
		return computeBlockedReason() === null;
	},
	get blockedReason() {
		return computeBlockedReason();
	}
};

/**
 * Resolve current session and subscribe to auth changes.
 * SSR / unconfigured: no-op, state becomes 'signed-out' deterministically.
 */
export async function initAuth(): Promise<void> {
	if (typeof window === 'undefined' || !isSupabaseConfigured()) {
		_state = 'signed-out';
		_email = null;
		_userId = null;
		return;
	}

	const supabase = getSupabase();
	if (!supabase) {
		_state = 'signed-out';
		_email = null;
		_userId = null;
		return;
	}

	const { data } = await supabase.auth.getSession();
	applySession(data.session);

	if (!_subscribed) {
		_subscribed = true;
		supabase.auth.onAuthStateChange((_event, session) => {
			applySession(session);
		});
	}
}

/**
 * Send a magic-link OTP email. Redirect is bare origin + '/' so it stays on
 * the Supabase project's Redirect URL allow-list (detectSessionInUrl handles exchange).
 */
export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
	if (!isSupabaseConfigured()) {
		return { ok: false, error: 'Supabase is not configured' };
	}

	const supabase = getSupabase();
	if (!supabase) {
		return { ok: false, error: 'Supabase is not configured' };
	}

	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: window.location.origin + '/',
			shouldCreateUser: true
		}
	});

	if (error) {
		return { ok: false, error: error.message };
	}
	return { ok: true };
}

/** Sign out if a client exists; always clear local auth state. Never throws on SSR/no-config. */
export async function signOut(): Promise<void> {
	const supabase = getSupabase();
	if (supabase) {
		await supabase.auth.signOut();
	}
	_state = 'signed-out';
	_email = null;
	_userId = null;
}

/** Bind this device's sync to the given profile + signed-in uid (both required). */
export function bindSync(profile: ProfileId, userId: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(SYNCED_PROFILE_KEY, profile);
	localStorage.setItem(SYNCED_UID_KEY, userId);
	_bindingEpoch += 1;
}

/** Clear the device binding (explicit re-bind flow in settings, later lane). */
export function clearSyncBinding(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(SYNCED_PROFILE_KEY);
	localStorage.removeItem(SYNCED_UID_KEY);
	_bindingEpoch += 1;
}
