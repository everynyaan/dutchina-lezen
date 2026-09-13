/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// ============================================================
// DUTCHINA SERVICE WORKER
//
// CRITICAL CONTRACTS - DO NOT VIOLATE:
//
// 1. This service worker NEVER clears localStorage.
//    Domi's game state (the `S` / dutchina_state key) lives there.
//    Wiping it on update = wiping her progress = project-ending failure.
//
// 2. This service worker NEVER clears IndexedDB.
//    Domi's audio cache and future review history live there.
//    The 'dutchina' Dexie database is off-limits to this worker.
//
// 3. Only the APP SHELL cache (CACHE_NAME below) is ever
//    created, updated, or deleted by this worker.
//
// UPDATE FLOW:
//   - New deploy triggers service worker update.
//   - New worker installs and caches the updated app shell.
//   - Old worker is replaced on next navigation (skipWaiting below).
//   - User data is completely untouched throughout.
// ============================================================

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Cache name is versioned. A new deploy = new version = new cache name.
// The old cache (previous version) is deleted in `activate`,
// but only the old APP SHELL cache, never user data.
const CACHE_NAME = `dutchina-shell-${version}`;

// Everything that needs to be cached for offline use.
const ASSETS = [
	...build, // Vite-built JS/CSS chunks
	...files // Static files from /static (manifest, icons, etc.)
];

// ============================================================
// INSTALL: cache the app shell
// ============================================================
sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(ASSETS);
			// Activate immediately without waiting for old tabs to close.
			await sw.skipWaiting();
		})()
	);
});

// ============================================================
// ACTIVATE: clean up old app shell caches ONLY
// ============================================================
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames
					.filter((name) => {
						// Delete old app shell caches. Leave everything else alone.
						// The 'dutchina-shell-' prefix is this worker's namespace.
						return name.startsWith('dutchina-shell-') && name !== CACHE_NAME;
					})
					.map((name) => caches.delete(name))
			);
			// Take control of all open tabs immediately.
			await sw.clients.claim();
		})()
	);
});

// ============================================================
// FETCH: serve from cache, fall back to network
// ============================================================
sw.addEventListener('fetch', (event) => {
	// Only handle GET requests.
	if (event.request.method !== 'GET') return;

	// Don't intercept requests to external origins (Google Fonts, TTS API, etc.)
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	// Don't intercept Netlify function calls. These are dynamic API
	// requests (sync, etc.) that must always hit the server.
	if (url.pathname.startsWith('/.netlify/')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			const cached = await cache.match(event.request);
			if (cached) return cached;

			// Not in cache. Fetch from network.
			const response = await fetch(event.request);
			// Cache successful responses for app shell assets.
			if (response.ok) {
				cache.put(event.request, response.clone());
			}
			return response;
		})()
	);
});
