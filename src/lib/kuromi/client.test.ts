// ============================================================
// KUROMI CHAT CLIENT -- start + poll tests (fetch stubbed, no real network)
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDefaultState } from '$lib/state/defaults';
import type { KuromiContextPacket } from './types';

vi.mock('$lib/profiles/profiles', () => ({
	getSyncKey: () => 'test-sync-key'
}));

import { sendKuromiChat, sendKuromiToolResults, KUROMI_CLIENT_TIMEOUT_MS } from './client';

function makeContext(): KuromiContextPacket {
	const defaults = createDefaultState();
	return {
		route: '/',
		screen: 'the home screen',
		currentGate: 1,
		lockWhen: [],
		mastery: {
			gate: 1,
			percent: 0,
			pieces: [
				{ key: 'A', done: false, human: 'more cards to start' },
				{ key: 'B', done: false, human: 'words need more reviews to stick' },
				{ key: 'C', done: false, human: '3 more dailies at 4/5' },
				{ key: 'D', done: false, human: 'one week set still to go' }
			],
			nextUnlock: 'Opens when Gate 1 words stick and the quizzes here are solid.'
		},
		rustyWords: [],
		recentActivity: [],
		config: defaults.appConfig,
		streak: { weeks: 0, mode: defaults.appConfig.streaks },
		lastQuiz: { completed: false, score: null },
		readingFork: {
			showUpStreak: 0,
			evalCompleted: false,
			unseenMisses: 0,
			lastMock: null,
			passLine: 24,
			target: 25,
			liveTotal: 36,
			examDate: '2026-11-12',
			daysLeft: null,
			openTraps: [],
			readiness: [],
			locate: null,
			daily: { completed: false, passageSlug: null, mapDone: false }
		},
		recentAdjustments: [],
		activityShape: [],
		shelf: { pages: [], archivedCount: 0 }
	};
}

function mockResponse(status: number, body?: unknown) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	};
}

/** A fetch stub that never settles on its own -- only rejects with AbortError when its signal aborts. Simulates a real hung upstream call. */
function hangingFetchStub(): typeof fetch {
	return vi.fn((_url: string, init?: RequestInit) => {
		return new Promise((_resolve, reject) => {
			init?.signal?.addEventListener('abort', () => {
				reject(new DOMException('The operation was aborted.', 'AbortError'));
			});
		});
	}) as unknown as typeof fetch;
}

describe('sendKuromiChat', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('maps an aborted upstream call to code "timeout", distinct from "network"', async () => {
		vi.stubGlobal('fetch', hangingFetchStub());
		const promise = sendKuromiChat('domi', {
			mode: 'chat',
			messages: [],
			context: makeContext()
		});
		await vi.advanceTimersByTimeAsync(KUROMI_CLIENT_TIMEOUT_MS + 10);
		const result = await promise;
		expect(result).toEqual({ ok: false, code: 'timeout' });
	});

	it('still maps a real fetch failure (not our own abort) to code "network"', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('getaddrinfo ENOTFOUND')))
		);
		const result = await sendKuromiChat('domi', {
			mode: 'chat',
			messages: [],
			context: makeContext()
		});
		expect(result).toEqual({ ok: false, code: 'network' });
	});

	it('POSTs start to the background function then polls chat_status until ready', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(mockResponse(202))
			.mockResolvedValueOnce(mockResponse(200, { status: 'pending' }))
			.mockResolvedValueOnce(
				mockResponse(200, {
					status: 'ready',
					createdAt: 1,
					reply: 'Fine. Hello.'
				})
			);
		vi.stubGlobal('fetch', fetchMock);

		const request = {
			mode: 'chat' as const,
			messages: [{ role: 'user' as const, content: 'hi' }],
			context: makeContext()
		};
		const promise = sendKuromiChat('domi', request);

		await vi.advanceTimersByTimeAsync(2000);
		const result = await promise;

		expect(result).toEqual({ ok: true, reply: 'Fine. Hello.' });
		expect(fetchMock).toHaveBeenCalledTimes(3);

		const [startUrl, startInit] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(startUrl).toBe('/.netlify/functions/kuromi-chat-background?profile=domi');
		expect(startInit.method).toBe('POST');
		const startHeaders = startInit.headers as Record<string, string>;
		expect(startHeaders['Content-Type']).toBe('application/json');
		expect(startHeaders['x-sync-key']).toBe('test-sync-key');
		const startBody = JSON.parse(startInit.body as string) as {
			jobId: string;
			mode: string;
			messages: unknown;
			context: unknown;
		};
		expect(startBody.jobId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		);
		expect(startBody.mode).toBe('chat');
		expect(startBody.messages).toEqual(request.messages);
		expect(startBody.context).toEqual(request.context);

		const [pollUrl, pollInit] = fetchMock.mock.calls[1] as [string, RequestInit];
		expect(pollUrl).toBe('/.netlify/functions/kuromi?profile=domi');
		const pollBody = JSON.parse(pollInit.body as string) as { mode: string; jobId: string };
		expect(pollBody.mode).toBe('chat_status');
		expect(pollBody.jobId).toBe(startBody.jobId);
	});

	it('returns toolCalls from a ready record after filtering shape', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(mockResponse(202))
			.mockResolvedValueOnce(
				mockResponse(200, {
					status: 'ready',
					createdAt: 1,
					reply: '',
					toolCalls: [
						{ id: 'call_1', name: 'award_lp', arguments: '{"amount":1}' },
						{ id: 99, name: 'bad', arguments: '{}' }
					]
				})
			);
		vi.stubGlobal('fetch', fetchMock);

		const result = await sendKuromiChat('domi', {
			mode: 'chat',
			messages: [],
			context: makeContext()
		});

		expect(result).toEqual({
			ok: true,
			reply: '',
			toolCalls: [{ id: 'call_1', name: 'award_lp', arguments: '{"amount":1}' }]
		});
	});

	it('maps a start non-ok typed error body without polling', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(mockResponse(401, { error: 'Unauthorized', code: 'unauthorized' }));
		vi.stubGlobal('fetch', fetchMock);

		const result = await sendKuromiChat('domi', {
			mode: 'chat',
			messages: [],
			context: makeContext()
		});

		expect(result).toEqual({ ok: false, code: 'unauthorized' });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('maps a job error record code, and unknown codes to upstream', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(mockResponse(202))
			.mockResolvedValueOnce(
				mockResponse(200, {
					status: 'error',
					createdAt: 1,
					code: 'not-a-real-code',
					error: 'nope'
				})
			);
		vi.stubGlobal('fetch', fetchMock);

		const result = await sendKuromiChat('domi', {
			mode: 'chat',
			messages: [],
			context: makeContext()
		});

		expect(result).toEqual({ ok: false, code: 'upstream' });
	});

	it('times out after 120000ms of continuous pending', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(mockResponse(202))
			.mockResolvedValue(mockResponse(200, { status: 'pending' }));
		vi.stubGlobal('fetch', fetchMock);

		const promise = sendKuromiChat('domi', {
			mode: 'chat',
			messages: [],
			context: makeContext()
		});

		await vi.advanceTimersByTimeAsync(120000);
		const result = await promise;

		expect(result).toEqual({ ok: false, code: 'timeout' });
	});
});

describe('sendKuromiToolResults', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('maps an aborted upstream call to code "timeout", distinct from "network"', async () => {
		vi.stubGlobal('fetch', hangingFetchStub());
		const promise = sendKuromiToolResults('domi', {
			messages: [],
			context: makeContext(),
			pendingToolCalls: [],
			toolResults: []
		});
		await vi.advanceTimersByTimeAsync(KUROMI_CLIENT_TIMEOUT_MS + 10);
		const result = await promise;
		expect(result).toEqual({ ok: false, code: 'timeout' });
	});

	it('includes pendingToolCalls and toolResults on the start body', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(mockResponse(202))
			.mockResolvedValueOnce(
				mockResponse(200, {
					status: 'ready',
					createdAt: 1,
					reply: 'There. Done.'
				})
			);
		vi.stubGlobal('fetch', fetchMock);

		const pendingToolCalls = [
			{ id: 'call_fs', name: 'forgive_streak', arguments: '{"reason":"fine"}' }
		];
		const toolResults = [{ id: 'call_fs', outcome: 'applied' as const, detail: 'streak restored' }];

		const result = await sendKuromiToolResults('domi', {
			messages: [],
			context: makeContext(),
			pendingToolCalls,
			toolResults
		});

		expect(result).toEqual({ ok: true, reply: 'There. Done.' });
		const [, startInit] = fetchMock.mock.calls[0] as [string, RequestInit];
		const startBody = JSON.parse(startInit.body as string) as {
			mode: string;
			pendingToolCalls: unknown;
			toolResults: unknown;
		};
		expect(startBody.mode).toBe('chat');
		expect(startBody.pendingToolCalls).toEqual(pendingToolCalls);
		expect(startBody.toolResults).toEqual(toolResults);
	});
});
