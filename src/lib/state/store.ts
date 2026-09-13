import { createDefaultState } from './defaults';
import { migrate } from './migrations';
import type { State } from './schema';
import type { ProfileId } from '$lib/profiles/profiles';

// ============================================================
// STATE STORE
// The single source of truth for all game state.
// Persisted to localStorage under a profile-namespaced key.
// Auto-saved via the $effect in +layout.svelte.
// ============================================================

const STORAGE_PREFIX = 'dutchina_state_';

function storageKey(profile: ProfileId): string {
	return `${STORAGE_PREFIX}${profile}`;
}

// ============================================================
// Load state from localStorage for a specific profile.
// Runs migrations if schemaVersion is below current.
// Falls back to defaults if no saved state or parse fails.
// NEVER throws to the caller. Errors are swallowed with a
// console.warn and a fresh default state is returned instead.
// ============================================================
export function loadState(profile: ProfileId = 'domi'): State {
	// Guard against SSR. During server-side rendering localStorage does not exist.
	if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
		return createDefaultState();
	}

	const key = storageKey(profile);
	const raw = localStorage.getItem(key);

	// Migration path: if profile-namespaced key doesn't exist,
	// check for the old unnamespaced key and adopt it for domi.
	if (!raw && profile === 'domi') {
		const legacyRaw = localStorage.getItem('dutchina_state');
		if (legacyRaw) {
			try {
				const parsed: unknown = JSON.parse(legacyRaw);
				const migrated = migrate(parsed);
				// Save under the new key and remove the old one
				localStorage.setItem(key, JSON.stringify(migrated));
				localStorage.removeItem('dutchina_state');
				return migrated;
			} catch (err) {
				console.warn('[dutchina] Failed to migrate legacy state. Starting fresh.', err);
			}
		}
	}

	if (!raw) {
		return createDefaultState();
	}

	try {
		const parsed: unknown = JSON.parse(raw);
		return migrate(parsed);
	} catch (err) {
		console.warn(
			`[dutchina] Failed to load or migrate state for profile "${profile}". Resetting to defaults.`,
			err
		);
		return createDefaultState();
	}
}

// ============================================================
// Save state to localStorage for a specific profile.
// Call this whenever state changes. The layout uses a debounced
// $effect to call this automatically.
//
// IMPORTANT: This function must NEVER mutate the state object.
// It receives a Svelte 5 reactive proxy. Mutating it here would
// re-trigger the $effect that called this, creating an infinite
// loop. Just serialize and write. Nothing else.
// ============================================================
export function saveState(state: State, profile: ProfileId = 'domi'): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(storageKey(profile), JSON.stringify(state));
	} catch (err) {
		console.warn(`[dutchina] Failed to save state for profile "${profile}".`, err);
	}
}

// ============================================================
// Load state from a raw JSON string (used by sync to apply
// server-side state). Runs migrations if needed.
// ============================================================
export function loadStateFromJSON(json: string): State | null {
	try {
		const parsed: unknown = JSON.parse(json);
		return migrate(parsed);
	} catch (err) {
		console.warn('[dutchina] Failed to parse state from server.', err);
		return null;
	}
}

// ============================================================
// DEBOUNCE HELPER
// Used by the layout's $effect to avoid writing to localStorage
// on every keystroke or rapid state change.
// ============================================================
export function debounce<T extends (...args: Parameters<T>) => void>(
	fn: T,
	ms: number
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), ms);
	};
}
