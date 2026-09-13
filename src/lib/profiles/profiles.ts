// ============================================================
// DUTCHINA PROFILES
// Two profiles: domi (default) and admin (Eyad's testing).
// Active profile is stored in its own localStorage key,
// separate from game state. Each profile has its own state.
// ============================================================

export type ProfileId = 'domi' | 'admin';

export interface ProfileDef {
	id: ProfileId;
	name: string;
	avatar: string;
	color: string;
}

export const PROFILES: Record<ProfileId, ProfileDef> = {
	domi: {
		id: 'domi',
		name: 'Domi',
		avatar: '/avatars/domi.png',
		color: 'var(--color-green)'
	},
	admin: {
		id: 'admin',
		name: 'Admin',
		avatar: '/avatars/admin.png',
		color: 'var(--color-orange)'
	}
};

const ACTIVE_PROFILE_KEY = 'dutchina_active_profile';
const SYNC_KEY_STORAGE = 'dutchina_sync_key';

export function getActiveProfile(): ProfileId {
	if (typeof window === 'undefined') return 'domi';
	const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
	if (stored === 'admin') return 'admin';
	return 'domi';
}

export function setActiveProfile(id: ProfileId): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function getSyncKey(profile?: ProfileId): string | null {
	// Both profiles share the same localStorage sync key.
	// Signature keeps `profile` for existing call sites; lookup is shared.
	void profile;
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(SYNC_KEY_STORAGE) || null;
}

export function setSyncKey(key: string | null): void {
	// Sets the shared sync key used by both profiles.
	if (typeof window === 'undefined') return;
	if (key) {
		localStorage.setItem(SYNC_KEY_STORAGE, key);
	} else {
		localStorage.removeItem(SYNC_KEY_STORAGE);
	}
}
