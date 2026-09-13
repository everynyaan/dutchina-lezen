// ============================================================
// SHARED (xAI transport) -- timeout + reasoning-effort tests
// fetch is always stubbed here; no real network call.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	callXaiChat,
	callXaiDrill,
	chatBlobKey,
	XAI_BACKGROUND_TIMEOUT_MS,
	XAI_TIMEOUT_MS
} from './shared.mts';

const XAI_KEY = 'test-xai-key-not-real';

/** A fetch stub that never settles on its own -- only rejects with AbortError when its signal aborts. */
function hangingFetchStub(captured?: { body?: unknown }): typeof fetch {
	return vi.fn((_url: string, init?: RequestInit) => {
		if (captured && typeof init?.body === 'string') {
			captured.body = JSON.parse(init.body);
		}
		return new Promise((_resolve, reject) => {
			init?.signal?.addEventListener('abort', () => {
				reject(new DOMException('The operation was aborted.', 'AbortError'));
			});
		});
	}) as unknown as typeof fetch;
}

describe('callXaiChat leg-1 timeout', () => {
	beforeEach(() => {
		vi.stubEnv('XAI_API_KEY', XAI_KEY);
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('maps an aborted upstream call to a distinct "timeout" FailResult, not "upstream"', async () => {
		vi.stubGlobal('fetch', hangingFetchStub());
		const promise = callXaiChat([], {});
		await vi.advanceTimersByTimeAsync(XAI_TIMEOUT_MS + 10);
		const result = await promise;
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.code).toBe('timeout');
			expect(result.status).toBe(504);
		}
	});

	it('aborts on our own terms well below the ~10s Netlify synchronous limit', () => {
		expect(XAI_TIMEOUT_MS).toBeLessThan(10_000);
	});

	it('a real (non-abort) fetch failure still maps to "upstream"', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('getaddrinfo ENOTFOUND')))
		);
		const result = await callXaiChat([], {});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.code).toBe('upstream');
		}
	});

	it('sends reasoning_effort "high" on leg-1 (restored with the background-function path)', async () => {
		const captured: { body?: unknown } = {};
		vi.stubGlobal('fetch', hangingFetchStub(captured));
		const promise = callXaiChat([], {});
		// Give the fetch call a tick to fire and populate `captured` before aborting.
		await vi.advanceTimersByTimeAsync(0);
		expect((captured.body as { reasoning_effort?: string } | undefined)?.reasoning_effort).toBe(
			'high'
		);
		await vi.advanceTimersByTimeAsync(XAI_TIMEOUT_MS + 10);
		await promise;
	});

	it('honors an explicit timeoutMs rather than aborting at the 8s default', async () => {
		vi.stubGlobal('fetch', hangingFetchStub());
		const promise = callXaiChat([], {}, undefined, undefined, XAI_BACKGROUND_TIMEOUT_MS);
		await vi.advanceTimersByTimeAsync(XAI_TIMEOUT_MS + 10);
		const state = await Promise.race([
			promise.then(() => 'settled' as const),
			Promise.resolve('pending' as const)
		]);
		expect(state).toBe('pending');
		await vi.advanceTimersByTimeAsync(XAI_BACKGROUND_TIMEOUT_MS);
		const result = await promise;
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.code).toBe('timeout');
		}
	});

	it('chatBlobKey follows drillBlobKey style', () => {
		expect(chatBlobKey('domi', 'abc12345')).toBe('chat-domi-abc12345');
		expect(chatBlobKey('admin', 'job-id-here')).toBe('chat-admin-job-id-here');
	});
});

describe('callXaiDrill (background path) is unaffected by the chat timeout', () => {
	beforeEach(() => {
		vi.stubEnv('XAI_API_KEY', XAI_KEY);
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('still sends reasoning_effort "high" and does not abort at the chat XAI_TIMEOUT_MS mark', async () => {
		const captured: { body?: unknown } = {};
		vi.stubGlobal('fetch', hangingFetchStub(captured));
		const promise = callXaiDrill('de/het', 5, 'medium');
		await vi.advanceTimersByTimeAsync(0);
		expect((captured.body as { reasoning_effort?: string } | undefined)?.reasoning_effort).toBe(
			'high'
		);
		// Past the CHAT timeout, the background call must still be pending --
		// proof the two paths do not share one bound.
		await vi.advanceTimersByTimeAsync(XAI_TIMEOUT_MS + 10);
		const state = await Promise.race([
			promise.then(() => 'settled' as const),
			Promise.resolve('pending' as const)
		]);
		expect(state).toBe('pending');
	});
});
