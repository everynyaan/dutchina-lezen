import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startKuromiDrill, pollKuromiDrill } from './drillClient';
import type { KuromiContextPacket } from './types';
import type { KuromiDrillSet } from './drill';

/** Test-only key stored in localStorage (getSyncKey no longer hard-codes a value). */
const SYNC_KEY = 'test-sync-key';

const SAMPLE_CONTEXT: KuromiContextPacket = {
	route: '/kuromi',
	screen: 'the Kuromi hub',
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
	rustyWords: ['huis', 'kat'],
	recentActivity: ['quiz'],
	config: {
		progression: { display: 'score' },
		streaks: 'strict',
		missions: 'on',
		quiz: { focusCategories: [] },
		dailyPath: { order: ['weekset-urgent', 'quiz', 'tekst', 'weekset'] }
	},
	streak: { weeks: 0, mode: 'strict' },
	lastQuiz: { completed: false, score: null },
	recentAdjustments: [],
	activityShape: [
		{ label: 'practice', daysAgo: null },
		{ label: 'daily quiz', daysAgo: null },
		{ label: 'daily read', daysAgo: null },
		{ label: 'flashcards', daysAgo: null },
		{ label: 'match game', daysAgo: null }
	],
	// This test is about the drill client, not the Shelf -- an empty shelf
	// asserts nothing about it while still satisfying the required field.
	shelf: { pages: [], archivedCount: 0 }
};

const SAMPLE_SET: KuromiDrillSet = {
	title: 'Tiny drill',
	intro_quip: 'Fine. Here is a drill.',
	questions: [
		{
			type: 'mcq',
			prompt: 'What is huis?',
			options: ['house', 'cat', 'dog'],
			answer: 'house',
			explanation_quip: 'Obviously.'
		}
	]
};

function mockResponse(status: number, body?: unknown) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	};
}

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

describe('drillClient', () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		const storage = new MemoryStorage();
		storage.setItem('dutchina_sync_key', SYNC_KEY);
		Object.defineProperty(globalThis, 'localStorage', {
			value: storage,
			configurable: true,
			writable: true
		});
		// getSyncKey guards on typeof window === 'undefined'
		Object.defineProperty(globalThis, 'window', {
			value: globalThis,
			configurable: true,
			writable: true
		});

		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
		// @ts-expect-error cleanup test globals
		delete globalThis.window;
		// @ts-expect-error cleanup test globals
		delete globalThis.localStorage;
	});

	describe('startKuromiDrill', () => {
		it('resolves ok with a UUID jobId and posts the expected body/headers on 202', async () => {
			fetchMock.mockResolvedValue(mockResponse(202));

			const result = await startKuromiDrill('domi', 'Food & Drink', 5, 'medium', SAMPLE_CONTEXT);

			expect(result.ok).toBe(true);
			if (!result.ok) return;

			expect(result.jobId).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			);

			expect(fetchMock).toHaveBeenCalledTimes(1);
			const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
			expect(url).toBe('/.netlify/functions/kuromi-drill-background?profile=domi');
			expect(init.method).toBe('POST');

			const headers = init.headers as Record<string, string>;
			expect(headers['Content-Type']).toBe('application/json');
			expect(headers['x-sync-key']).toBe(SYNC_KEY);

			const body = JSON.parse(init.body as string) as {
				jobId: string;
				topic: string;
				count: number;
				difficulty: string;
				context: KuromiContextPacket;
			};
			expect(body.jobId).toBe(result.jobId);
			expect(body.topic).toBe('Food & Drink');
			expect(body.count).toBe(5);
			expect(body.difficulty).toBe('medium');
			expect(body.context).toEqual(SAMPLE_CONTEXT);
		});

		it('resolves network when fetch rejects', async () => {
			fetchMock.mockRejectedValue(new Error('offline'));

			const result = await startKuromiDrill('domi', 'topic', 3, 'easy', SAMPLE_CONTEXT);

			expect(result).toEqual({ ok: false, code: 'network' });
		});
	});

	describe('pollKuromiDrill', () => {
		it('keeps polling on pending then resolves ready with the set', async () => {
			vi.useFakeTimers();

			fetchMock
				.mockResolvedValueOnce(mockResponse(200, { status: 'pending' }))
				.mockResolvedValueOnce(
					mockResponse(200, {
						status: 'ready',
						createdAt: 1,
						set: SAMPLE_SET
					})
				);

			const promise = pollKuromiDrill('domi', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');

			// First poll runs immediately (pending). Advance past the 2s delay for the second.
			await vi.advanceTimersByTimeAsync(2000);
			const result = await promise;

			expect(result).toEqual({ ok: true, set: SAMPLE_SET });
			expect(fetchMock).toHaveBeenCalledTimes(2);

			const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
			expect(url).toBe('/.netlify/functions/kuromi?profile=domi');
			const body = JSON.parse(init.body as string) as { mode: string; jobId: string };
			expect(body.mode).toBe('drill_status');
			expect(body.jobId).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
		});

		it('treats bare { status: "pending" } (202-before-write race) as keep-polling, not failure', async () => {
			vi.useFakeTimers();

			fetchMock
				.mockResolvedValueOnce(mockResponse(200, { status: 'pending' }))
				.mockResolvedValueOnce(
					mockResponse(200, {
						status: 'ready',
						createdAt: 1,
						set: SAMPLE_SET
					})
				);

			let settled = false;
			const promise = pollKuromiDrill('domi', 'job-race-test').then((r) => {
				settled = true;
				return r;
			});

			// Let the first poll (pending only — no set/error/code) finish.
			await Promise.resolve();
			await Promise.resolve();
			expect(settled).toBe(false);

			// Still pending after first response; only the later ready ends it.
			await vi.advanceTimersByTimeAsync(2000);
			const result = await promise;
			expect(settled).toBe(true);
			expect(result).toEqual({ ok: true, set: SAMPLE_SET });
		});

		it('surfaces error code from a job error record', async () => {
			vi.useFakeTimers();

			fetchMock.mockResolvedValue(
				mockResponse(200, {
					status: 'error',
					createdAt: 1,
					code: 'invalid_shape',
					error: 'some message'
				})
			);

			const result = await pollKuromiDrill('domi', 'job-error-test');
			expect(result).toEqual({ ok: false, code: 'invalid_shape' });
		});

		it('times out after 120000ms of continuous pending', async () => {
			vi.useFakeTimers();

			fetchMock.mockResolvedValue(mockResponse(200, { status: 'pending' }));

			const promise = pollKuromiDrill('domi', 'job-timeout-test');

			await vi.advanceTimersByTimeAsync(120000);
			const result = await promise;

			expect(result).toEqual({ ok: false, code: 'timeout' });
		});
	});
});
