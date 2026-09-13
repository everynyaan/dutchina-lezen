import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** Minimal in-memory localStorage for Node vitest (no jsdom in this project). */
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

const getSupabase = vi.fn();
const isSupabaseConfigured = vi.fn();
const getActiveProfile = vi.fn((): 'domi' | 'admin' => 'domi');

vi.mock('$lib/supabase/client', () => ({
	getSupabase: () => getSupabase(),
	isSupabaseConfigured: () => isSupabaseConfigured()
}));

vi.mock('$lib/profiles/profiles', () => ({
	getActiveProfile: () => getActiveProfile()
}));

import { auth, initAuth, signOut, bindSync, clearSyncBinding } from './session.svelte';

function mockClient(session: { user: { id: string; email?: string } } | null) {
	return {
		auth: {
			getSession: vi.fn(async () => ({ data: { session }, error: null })),
			onAuthStateChange: vi.fn(() => ({
				data: { subscription: { unsubscribe: vi.fn() } }
			})),
			signOut: vi.fn(async () => ({ error: null })),
			signInWithOtp: vi.fn(async () => ({ data: {}, error: null }))
		}
	};
}

describe('auth session canSync / blockedReason', () => {
	beforeEach(async () => {
		const storage = new MemoryStorage();
		Object.defineProperty(globalThis, 'localStorage', {
			value: storage,
			configurable: true,
			writable: true
		});
		// session.svelte.ts guards on typeof window === 'undefined'
		Object.defineProperty(globalThis, 'window', {
			value: globalThis,
			configurable: true,
			writable: true
		});

		getActiveProfile.mockReturnValue('domi');
		isSupabaseConfigured.mockReturnValue(true);
		getSupabase.mockReset();
		clearSyncBinding();
		await signOut();
	});

	afterEach(() => {
		// @ts-expect-error cleanup test globals
		delete globalThis.window;
		// @ts-expect-error cleanup test globals
		delete globalThis.localStorage;
		vi.clearAllMocks();
	});

	it('a. signed-out (never bound) → canSync=false, blockedReason=signed-out', async () => {
		getSupabase.mockReturnValue(mockClient(null));

		await initAuth();

		expect(auth.state).toBe('signed-out');
		expect(auth.canSync).toBe(false);
		expect(auth.blockedReason).toBe('signed-out');
	});

	it('b. signed-in, bound profile+uid both match → canSync=true, blockedReason=null', async () => {
		const userId = 'user-aaa-111';
		getSupabase.mockReturnValue(mockClient({ user: { id: userId, email: 'domi@example.com' } }));
		getActiveProfile.mockReturnValue('domi');

		await initAuth();
		bindSync('domi', userId);

		expect(auth.state).toBe('signed-in');
		expect(auth.userId).toBe(userId);
		expect(auth.canSync).toBe(true);
		expect(auth.blockedReason).toBe(null);
	});

	it('c. signed-in, bound profile does NOT match (uid matches) → profile-mismatch', async () => {
		const userId = 'user-bbb-222';
		getSupabase.mockReturnValue(mockClient({ user: { id: userId, email: 'admin@example.com' } }));
		getActiveProfile.mockReturnValue('domi');

		await initAuth();
		// Bound to admin while active profile is domi
		bindSync('admin', userId);

		expect(auth.state).toBe('signed-in');
		expect(auth.canSync).toBe(false);
		expect(auth.blockedReason).toBe('profile-mismatch');
	});

	it('d. signed-in, bound profile matches but uid does NOT → account-mismatch', async () => {
		const userId = 'user-ccc-333';
		getSupabase.mockReturnValue(mockClient({ user: { id: userId, email: 'domi@example.com' } }));
		getActiveProfile.mockReturnValue('domi');

		await initAuth();
		bindSync('domi', 'other-user-id');

		expect(auth.state).toBe('signed-in');
		expect(auth.canSync).toBe(false);
		expect(auth.blockedReason).toBe('account-mismatch');
	});
});
