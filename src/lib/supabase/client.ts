// ============================================================
// SUPABASE BROWSER CLIENT
// Lazy singleton. SSR-safe: never touches window at import time.
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

let _client: SupabaseClient | null = null;

/** True iff both public Supabase env vars are non-empty strings. */
export function isSupabaseConfigured(): boolean {
	return (
		typeof PUBLIC_SUPABASE_URL === 'string' &&
		PUBLIC_SUPABASE_URL.length > 0 &&
		typeof PUBLIC_SUPABASE_ANON_KEY === 'string' &&
		PUBLIC_SUPABASE_ANON_KEY.length > 0
	);
}

/**
 * Lazily-created browser Supabase client.
 * Returns null when not in a browser (SSR / prerender) or when env is missing.
 * Repeated calls return the same instance.
 */
export function getSupabase(): SupabaseClient | null {
	if (typeof window === 'undefined') return null;
	if (!isSupabaseConfigured()) return null;

	if (!_client) {
		_client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
				flowType: 'pkce'
			}
		});
	}
	return _client;
}
