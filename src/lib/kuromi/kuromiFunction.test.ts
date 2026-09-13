// ============================================================
// KUROMI — handler tests (fetch mocked, no real network)
// ============================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStore } from '@netlify/blobs';
import handler from '../../../netlify/functions/kuromi.mts';
import { KUROMI_CHAT_SYSTEM_PROMPT } from '../../../netlify/functions/lib/persona.mts';
import {
	MAX_CLIENT_CONTENT_CHARS,
	ABSOLUTE_MAX_OUTBOUND_CHARS,
	KUROMI_TOOLS
} from '../../../netlify/functions/lib/shared.mts';

vi.mock('@netlify/blobs', () => ({
	getStore: vi.fn()
}));

const SYNC_KEY = 'test-sync-key-for-kuromi';
const XAI_KEY = 'test-xai-key-not-real';

function makeUrl(profile = 'domi'): string {
	return `https://example.com/.netlify/functions/kuromi?profile=${profile}`;
}

function makeRequest(
	opts: {
		method?: string;
		profile?: string;
		headers?: Record<string, string>;
		body?: unknown;
	} = {}
): Request {
	const method = opts.method ?? 'POST';
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...opts.headers
	};
	const init: RequestInit = { method, headers };
	if (method !== 'GET' && method !== 'HEAD' && opts.body !== undefined) {
		init.body = JSON.stringify(opts.body);
	}
	return new Request(makeUrl(opts.profile ?? 'domi'), init);
}

describe('kuromi handler', () => {
	beforeEach(() => {
		vi.stubEnv('SYNC_KEY', SYNC_KEY);
		vi.stubEnv('XAI_API_KEY', XAI_KEY);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('returns 405 for non-POST methods', async () => {
		const res = await handler(
			makeRequest({
				method: 'GET',
				headers: { 'x-sync-key': SYNC_KEY }
			})
		);
		expect(res.status).toBe(405);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
	});

	it('returns 401 when x-sync-key header is missing', async () => {
		const res = await handler(
			makeRequest({
				body: { mode: 'chat', messages: [], context: {} }
			})
		);
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.code).toBe('unauthorized');
	});

	it('returns 401 when x-sync-key is wrong', async () => {
		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': 'wrong-key' },
				body: { mode: 'chat', messages: [], context: {} }
			})
		);
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.code).toBe('unauthorized');
	});

	it('returns 400 for invalid profile query param', async () => {
		const res = await handler(
			makeRequest({
				profile: 'not-a-profile',
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'chat', messages: [], context: {} }
			})
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
	});

	it('returns 400 for malformed jobId on drill_status', async () => {
		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'drill_status', jobId: 'bad!' }
			})
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error.toLowerCase()).toContain('jobid');
	});

	it('returns 400 for jobId that is too short', async () => {
		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'drill_status', jobId: 'short' }
			})
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
	});

	it('returns 400 for malformed jobId on chat_status', async () => {
		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'chat_status', jobId: 'bad!' }
			})
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error.toLowerCase()).toContain('jobid');
	});

	it('chat_status returns 200 pending when blob record is absent', async () => {
		const get = vi.fn().mockResolvedValue(null);
		vi.mocked(getStore).mockReturnValue({
			get
		} as unknown as ReturnType<typeof getStore>);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'chat_status', jobId: 'abc123xyz789' }
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: 'pending' });
		expect(getStore).toHaveBeenCalledWith({ name: 'kuromi-chats', consistency: 'strong' });
	});

	it('chat_status returns a ready record then one-shot deletes', async () => {
		const createdAt = Date.now();
		const del = vi.fn().mockResolvedValue(undefined);
		vi.mocked(getStore).mockReturnValue({
			get: vi.fn().mockResolvedValue(
				JSON.stringify({
					status: 'ready',
					createdAt,
					reply: 'Fine. Hello.',
					toolCalls: [{ id: 'c1', name: 'award_lp', arguments: '{}' }]
				})
			),
			delete: del
		} as unknown as ReturnType<typeof getStore>);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'chat_status', jobId: 'ready-job-id-01' }
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({
			status: 'ready',
			createdAt,
			reply: 'Fine. Hello.',
			toolCalls: [{ id: 'c1', name: 'award_lp', arguments: '{}' }]
		});
		expect(del).toHaveBeenCalledTimes(1);
		expect(del).toHaveBeenCalledWith('chat-domi-ready-job-id-01');
	});

	it('chat_status returns 502 for corrupt JSON', async () => {
		vi.mocked(getStore).mockReturnValue({
			get: vi.fn().mockResolvedValue('{not-json')
		} as unknown as ReturnType<typeof getStore>);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'chat_status', jobId: 'corrupt-job-01' }
			})
		);

		expect(res.status).toBe(502);
		const body = await res.json();
		expect(body.code).toBe('upstream');
	});

	it('chat_status stale record is deleted and returned as error', async () => {
		const createdAt = Date.now() - 601_000;
		const del = vi.fn().mockResolvedValue(undefined);
		vi.mocked(getStore).mockReturnValue({
			get: vi.fn().mockResolvedValue(
				JSON.stringify({
					status: 'pending',
					createdAt
				})
			),
			delete: del
		} as unknown as ReturnType<typeof getStore>);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'chat_status', jobId: 'stale-job-id-01' }
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('error');
		expect(body.code).toBe('upstream');
		expect(body.createdAt).toBe(createdAt);
		expect(typeof body.error).toBe('string');
		expect(del).toHaveBeenCalledTimes(1);
	});

	it('happy-path chat returns 200 with reply text', async () => {
		const replyText = 'Hey. One short hello, begrudgingly.';
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: replyText } }]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'Say hello in one short sentence.' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ reply: replyText });
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toContain('api.x.ai');
		const headers = init.headers as Record<string, string>;
		expect(headers.Authorization).toBe(`Bearer ${XAI_KEY}`);
		const sent = JSON.parse(init.body as string);
		expect(sent.model).toBe('grok-4.5');
		// 'high' is restored now that chat runs on the background-function
		// pattern; the remaining synchronous mode "chat" still uses the 8s
		// default abort unless the caller passes timeoutMs.
		expect(sent.reasoning_effort).toBe('high');
		expect(sent.messages[0].role).toBe('system');
		expect(sent.messages.at(-1).content).toContain('Say hello');
	});

	it('returns upstream error when xAI responds ok:false', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: 'nope' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(502);
		const body = await res.json();
		expect(body.code).toBe('upstream');
		expect(typeof body.error).toBe('string');
		// Never echo secrets
		expect(JSON.stringify(body)).not.toContain(XAI_KEY);
		expect(JSON.stringify(body)).not.toContain(SYNC_KEY);
	});

	it('returns 400 for malformed chat messages', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'system', content: 'nope' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('drill_status returns 200 pending when blob record is absent', async () => {
		vi.mocked(getStore).mockReturnValue({
			get: vi.fn().mockResolvedValue(null)
		} as unknown as ReturnType<typeof getStore>);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'drill_status', jobId: 'abc123xyz789' }
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: 'pending' });
	});

	// ============================================================
	// Phase 5 — steward tool-calling (leg 1 + leg 2)
	// ============================================================

	it('leg 1 declares all six tools and tool_choice auto', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: 'Fine. Whatever.' } }]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		const sent = JSON.parse(init.body as string);
		expect(sent.tool_choice).toBe('auto');
		expect(Array.isArray(sent.tools)).toBe(true);
		const names = (sent.tools as Array<{ function: { name: string } }>).map((t) => t.function.name);
		expect(names).toEqual([
			'update_config',
			'award_lp',
			'forgive_streak',
			'create_page',
			'update_page',
			'archive_page'
		]);
		expect(names).not.toContain('set_gate');
		expect(names).not.toContain('unlock_gate');
		expect(names).not.toContain('swap_question');
		expect(names).not.toContain('show_stickers');
	});

	it('persona is filled in on four-gate homework and skip-as-UI', () => {
		expect(KUROMI_CHAT_SYSTEM_PROMPT).toMatch(/four rooms/);
		expect(KUROMI_CHAT_SYSTEM_PROMPT).toMatch(/no skip tool/);
		expect(KUROMI_CHAT_SYSTEM_PROMPT).toMatch(/Gate 1 is first words/);
		expect(KUROMI_CHAT_SYSTEM_PROMPT).toMatch(/A boss win does not/);
		expect(KUROMI_CHAT_SYSTEM_PROMPT).toMatch(/Never put B1 or exam Dutch/);
		expect(KUROMI_CHAT_SYSTEM_PROMPT).toMatch(/Never say those fantasy rank names/);
		const createPage = KUROMI_TOOLS.find((t) => t.function.name === 'create_page');
		expect(createPage?.function.description).toMatch(/currentGate/);
		expect(createPage?.function.description).toMatch(/Gate 1 pages are first words/);
		const award = KUROMI_TOOLS.find((t) => t.function.name === 'award_lp');
		expect(award?.function.description).toMatch(/never a way to open a gate/);
	});

	it('leg 1 with content null and valid tool_calls returns empty reply + toolCalls', async () => {
		const rawArgs = '{"amount":10,"reason":"for trying"}';
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: null,
								tool_calls: [
									{
										id: 'call_1',
										type: 'function',
										function: { name: 'award_lp', arguments: rawArgs }
									}
								]
							}
						}
					]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'give me LP' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.reply).toBe('');
		expect(body.toolCalls).toEqual([{ id: 'call_1', name: 'award_lp', arguments: rawArgs }]);
	});

	it('leg 1 with neither content nor tool_calls yields 502', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: null } }]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(502);
		const body = await res.json();
		expect(body.code).toBe('upstream');
	});

	it('malformed tool_calls are skipped; all-malformed omits toolCalls key', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: 'whatever',
								tool_calls: [
									{ id: 123, function: { name: 'award_lp', arguments: '{}' } },
									{ id: 'x', function: { name: 99, arguments: '{}' } },
									{ id: 'y', function: { name: 'award_lp', arguments: null } },
									{ type: 'function' }
								]
							}
						}
					]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.reply).toBe('whatever');
		expect(Object.prototype.hasOwnProperty.call(body, 'toolCalls')).toBe(false);
	});

	it('tool call arguments are passed through as raw unparsed string', async () => {
		const quirkyArgs = '{\n  "amount" :  5 ,\n  "reason" : "spacy"\n}';
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: 'Fine.',
								tool_calls: [
									{
										id: 'call_raw',
										type: 'function',
										function: { name: 'award_lp', arguments: quirkyArgs }
									}
								]
							}
						}
					]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'lp please' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.toolCalls[0].arguments).toBe(quirkyArgs);
	});

	it('leg 2 sends tools + tool_choice none and never surfaces tool_calls', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: 'There. I fixed your streak. You owe me.',
								tool_calls: [
									{
										id: 'should_not_surface',
										type: 'function',
										function: {
											name: 'award_lp',
											arguments: '{"amount":1,"reason":"nope"}'
										}
									}
								]
							}
						}
					]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'forgive my streak?' }],
					context: {},
					pendingToolCalls: [
						{
							id: 'call_fs',
							name: 'forgive_streak',
							arguments: '{"reason":"fine"}'
						}
					],
					toolResults: [{ id: 'call_fs', outcome: 'applied', detail: 'streak restored one week' }]
				}
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.reply).toContain('fixed your streak');
		expect(Object.prototype.hasOwnProperty.call(body, 'toolCalls')).toBe(false);

		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		const sent = JSON.parse(init.body as string);
		expect(sent.tool_choice).toBe('none');
		expect(sent.reasoning_effort).toBe('low');
		expect(Array.isArray(sent.tools)).toBe(true);
		const names = (sent.tools as Array<{ function: { name: string } }>).map((t) => t.function.name);
		expect(names).toEqual([
			'update_config',
			'award_lp',
			'forgive_streak',
			'create_page',
			'update_page',
			'archive_page'
		]);
	});

	it('partial leg-2 with pendingToolCalls but no toolResults returns 400', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [
						{ id: 'call_1', name: 'award_lp', arguments: '{"amount":1,"reason":"x"}' }
					]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error).toBe('toolResults is required when pendingToolCalls is present');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('partial leg-2 with toolResults but no pendingToolCalls returns 400', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					toolResults: [{ id: 'call_1', outcome: 'applied', detail: 'ok' }]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error).toBe('pendingToolCalls is required when toolResults is present');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	// Regression: neither-present (ordinary leg 1) and both-present (leg 2) paths
	// are already covered above by "leg 1 declares all six tools…" and
	// "leg 2 sends tools + tool_choice none…".

	it('leg 2 rejects id mismatch between pending and results', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [{ id: 'a', name: 'award_lp', arguments: '{"amount":1,"reason":"x"}' }],
					toolResults: [{ id: 'b', outcome: 'applied', detail: 'ok' }]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('leg 2 rejects duplicate id in pendingToolCalls', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [
						{ id: 'dup', name: 'award_lp', arguments: '{"amount":1,"reason":"x"}' },
						{ id: 'dup', name: 'award_lp', arguments: '{"amount":2,"reason":"y"}' }
					],
					toolResults: [{ id: 'dup', outcome: 'applied', detail: 'ok' }]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('leg 2 rejects orphan result id with no matching pending call', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [
						{ id: 'only', name: 'award_lp', arguments: '{"amount":1,"reason":"x"}' }
					],
					toolResults: [
						{ id: 'only', outcome: 'applied', detail: 'ok' },
						{ id: 'orphan', outcome: 'applied', detail: 'extra' }
					]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('leg 2 rejects unknown tool name in pendingToolCalls', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [{ id: 'c1', name: 'delete_everything', arguments: '{}' }],
					toolResults: [{ id: 'c1', outcome: 'applied', detail: 'nope' }]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('leg 2 rejects invalid toolResults outcome', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [
						{ id: 'c1', name: 'award_lp', arguments: '{"amount":1,"reason":"x"}' }
					],
					toolResults: [{ id: 'c1', outcome: 'maybe', detail: 'weird' }]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('leg 2 rejects toolResults detail longer than 400 characters', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'hi' }],
					context: {},
					pendingToolCalls: [
						{ id: 'c1', name: 'award_lp', arguments: '{"amount":1,"reason":"x"}' }
					],
					toolResults: [{ id: 'c1', outcome: 'applied', detail: 'x'.repeat(401) }]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('persona plus context floor leaves the full client allowance under the absolute cap', () => {
		const representativeContext = {
			route: '/lezen',
			screen: 'a lezen reading exam',
			currentGate: 1,
			lockWhen: [
				{ gate: 2, when: 'Opens when Gate 1 words stick and the quizzes here are solid.' }
			],
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
			rustyWords: ['de', 'het', 'een', 'maar', 'want'],
			recentActivity: ['practice', 'daily quiz', 'daily read'],
			config: {
				'progression.display': 'score',
				streaks: 'strict',
				missions: 'on',
				'quiz.focusCategories': [],
				'dailyPath.order': ['weekset-urgent', 'quiz', 'tekst', 'weekset']
			},
			streak: { weeks: 4, mode: 'strict' },
			lastQuiz: { completed: true, score: { correct: 8, total: 10 } },
			recentAdjustments: [
				{
					tool: 'award_lp',
					outcome: 'applied',
					detail: 'nice work today',
					timestamp: '2026-08-19T10:00:00.000Z',
					undone: false
				}
			],
			activityShape: [
				{ label: 'practice', daysAgo: 0 },
				{ label: 'daily quiz', daysAgo: 0 },
				{ label: 'daily read', daysAgo: 1 },
				{ label: 'flashcards', daysAgo: 3 },
				{ label: 'match game', daysAgo: null }
			]
		};
		const contextMessage = 'Session context: ' + JSON.stringify(representativeContext);
		const floor = KUROMI_CHAT_SYSTEM_PROMPT.length + contextMessage.length;
		const headroom = ABSOLUTE_MAX_OUTBOUND_CHARS - floor;
		expect(
			headroom >= MAX_CLIENT_CONTENT_CHARS,
			'Persona plus context floor is ' +
				floor +
				' chars, leaving only ' +
				headroom +
				' chars of headroom under ABSOLUTE_MAX_OUTBOUND_CHARS (' +
				ABSOLUTE_MAX_OUTBOUND_CHARS +
				'). That is less than MAX_CLIENT_CONTENT_CHARS (' +
				MAX_CLIENT_CONTENT_CHARS +
				'), the full client chat allowance -- growing ' +
				'KUROMI_CHAT_SYSTEM_PROMPT further will squeeze the client chat budget again. ' +
				'See netlify/functions/lib/shared.mts.'
		).toBe(true);
	});

	it('character budget counts tool payloads; over budget does not call fetch', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		// Plain message content is tiny, but tool args + result detail push client
		// content over MAX_CLIENT_CONTENT_CHARS (system messages are excluded from that cap).
		const hugeArgs = JSON.stringify({
			amount: 1,
			reason: 'pad-'.repeat(3500)
		});
		expect(hugeArgs.length).toBeGreaterThan(10000);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'tiny' }],
					context: {},
					pendingToolCalls: [{ id: 'big', name: 'award_lp', arguments: hugeArgs }],
					toolResults: [
						{
							id: 'big',
							outcome: 'applied',
							detail: 'y'.repeat(400)
						}
					]
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error).toBe('messages exceed maximum content length');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('leg-1 full client allowance (~4000 chars) is accepted', async () => {
		const replyText = 'Got it. Long message received.';
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: replyText } }]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'x'.repeat(4000) }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('leg-1 oversized client content still rejected', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'x'.repeat(13000) }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error).toBe('messages exceed maximum content length');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('absolute outbound backstop rejects oversized context with distinct error', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'tiny' }],
					context: { blob: 'y'.repeat(20000) }
				}
			})
		);

		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.code).toBe('bad_request');
		expect(body.error).toBe('request exceeds maximum total content length');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('plain leg-1 chat with no tool calls omits toolCalls key', async () => {
		const replyText = 'Just talk. No levers.';
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					choices: [{ message: { content: replyText } }]
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: {
					mode: 'chat',
					messages: [{ role: 'user', content: 'just chat' }],
					context: {}
				}
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ reply: replyText });
		expect(Object.prototype.hasOwnProperty.call(body, 'toolCalls')).toBe(false);
	});

	it('drill_status pending still works after tool-calling changes', async () => {
		vi.mocked(getStore).mockReturnValue({
			get: vi.fn().mockResolvedValue(null)
		} as unknown as ReturnType<typeof getStore>);

		const res = await handler(
			makeRequest({
				headers: { 'x-sync-key': SYNC_KEY },
				body: { mode: 'drill_status', jobId: 'regression-job-01' }
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: 'pending' });
	});
});

// ============================================================
// KUROMI_TOOLS — schema shape guards
//
// These guard the shape the model is TOLD, not what the validator
// accepts (that's src/lib/kuromi/pageSchema.ts, out of scope here).
// ============================================================

describe('KUROMI_TOOLS schema shape', () => {
	// OpenAI-compatible function-calling schemas support anyOf, not oneOf.
	// An unsupported keyword can be silently ignored by the provider,
	// leaving the subschema effectively unconstrained. This must fail
	// against pre-change code (oneOf appeared at two sites).
	it('contains no oneOf anywhere in KUROMI_TOOLS', () => {
		const serialized = JSON.stringify(KUROMI_TOOLS);
		expect(serialized).not.toContain('oneOf');
	});

	type JsonSchema = {
		type?: string | string[];
		properties?: Record<string, JsonSchema>;
		required?: string[];
		enum?: Array<string | null>;
		additionalProperties?: boolean;
		items?: JsonSchema | { anyOf?: JsonSchema[] };
		anyOf?: JsonSchema[];
	};

	type ToolFunction = {
		name: string;
		strict?: boolean;
		parameters: JsonSchema;
	};

	function findTool(name: string): ToolFunction {
		const tool = (KUROMI_TOOLS as unknown as Array<{ function: ToolFunction }>).find(
			(t) => t.function.name === name
		);
		if (!tool) throw new Error(`tool not found: ${name}`);
		return tool.function;
	}

	function blockBranches(toolName: 'create_page' | 'update_page'): JsonSchema[] {
		const params = findTool(toolName).parameters;
		const blocksSchema = params.properties?.blocks as
			| { items?: { anyOf?: JsonSchema[] } }
			| undefined;
		const branches = blocksSchema?.items?.anyOf;
		if (!branches) throw new Error(`${toolName}.blocks.items.anyOf missing`);
		return branches;
	}

	function isObjectSchema(node: JsonSchema): boolean {
		if (node.type === 'object') return true;
		if (Array.isArray(node.type) && node.type.includes('object')) return true;
		return node.properties !== undefined;
	}

	function isNullableType(type: string | string[] | undefined): boolean {
		return Array.isArray(type) && type.includes('null');
	}

	function isNonNullableType(type: string | string[] | undefined): boolean {
		if (type === undefined) return false;
		if (typeof type === 'string') return type !== 'null';
		return !type.includes('null');
	}

	/** Recursively walk object schemas reachable from a tool's parameters. */
	function walkObjectSchemas(
		node: JsonSchema,
		path: string,
		visit: (node: JsonSchema, path: string) => void
	): void {
		if (isObjectSchema(node)) {
			visit(node, path);
			if (node.properties) {
				for (const [key, child] of Object.entries(node.properties)) {
					walkObjectSchemas(child, `${path}.properties.${key}`, visit);
				}
			}
		}
		if (node.items) {
			if ('anyOf' in node.items && Array.isArray(node.items.anyOf)) {
				node.items.anyOf.forEach((branch, i) => {
					walkObjectSchemas(branch, `${path}.items.anyOf[${i}]`, visit);
				});
			} else {
				walkObjectSchemas(node.items as JsonSchema, `${path}.items`, visit);
			}
		}
		if (Array.isArray(node.anyOf)) {
			node.anyOf.forEach((branch, i) => {
				walkObjectSchemas(branch, `${path}.anyOf[${i}]`, visit);
			});
		}
	}

	// Semantically mandatory subset (validator always requires these as
	// non-null). Under strict mode branch.required also includes nullable
	// product-optional fields — those are asserted separately.
	const SEMANTIC_REQUIRED: Record<string, string[]> = {
		'grammar-card': ['type', 'title', 'formula', 'example'],
		'vocab-set': ['type'],
		drill: ['type', 'title', 'intro_quip', 'questions'],
		read: ['type', 'nl', 'en'],
		note: ['type', 'body']
	};

	// The five types validateBlock (pageSchema.ts) dispatches on.
	const VALIDATOR_BLOCK_TYPES = ['grammar-card', 'vocab-set', 'drill', 'read', 'note'];

	for (const toolName of ['create_page', 'update_page'] as const) {
		it(`${toolName}: declares strict:true`, () => {
			expect(findTool(toolName).strict).toBe(true);
		});

		it(`${toolName}: every object level has additionalProperties:false and every properties key is in required`, () => {
			const params = findTool(toolName).parameters;
			const visited: string[] = [];
			walkObjectSchemas(params, `${toolName}.parameters`, (node, path) => {
				visited.push(path);
				expect(node.additionalProperties, `${path} additionalProperties`).toBe(false);
				const propKeys = Object.keys(node.properties ?? {}).sort();
				const required = [...(node.required ?? [])].sort();
				expect(required, `${path} required covers all properties`).toEqual(propKeys);
			});
			expect(visited.length).toBeGreaterThan(0);
		});

		it(`${toolName}: every block branch still declares its required fields after the anyOf conversion`, () => {
			const branches = blockBranches(toolName);
			expect(branches.length).toBe(5);
			for (const branch of branches) {
				const typeEnum = branch.properties?.type?.enum;
				expect(typeEnum).toBeDefined();
				expect(typeEnum).toHaveLength(1);
				const blockType = (typeEnum as Array<string | null>)[0] as string;
				const semantic = SEMANTIC_REQUIRED[blockType];
				expect(semantic, `no semantic required[] for block type ${blockType}`).toBeDefined();

				const propKeys = Object.keys(branch.properties ?? {}).sort();
				const required = [...(branch.required ?? [])].sort();

				// (ii) strict: required equals the full property-key set
				expect(required).toEqual(propKeys);

				// (i) semantic subset is present and each is NON-nullable
				for (const field of semantic) {
					expect(required, `${blockType} required includes semantic ${field}`).toContain(field);
					const fieldSchema = branch.properties?.[field];
					expect(fieldSchema, `${blockType}.${field} schema`).toBeDefined();
					expect(
						isNonNullableType(fieldSchema!.type),
						`${blockType}.${field} must be non-nullable (type-array nullability representation)`
					).toBe(true);
				}

				// (iii) every properties key NOT in the semantic subset is nullable
				// via type: [... , 'null'] (type-array representation, not anyOf-null).
				const semanticSet = new Set(semantic);
				for (const key of propKeys) {
					if (semanticSet.has(key)) continue;
					const fieldSchema = branch.properties![key];
					expect(
						isNullableType(fieldSchema.type),
						`${blockType}.${key} must be nullable via type array including null`
					).toBe(true);
				}
			}
		});

		it(`${toolName}: block type enums exactly match the five types validateBlock dispatches on`, () => {
			const branches = blockBranches(toolName);
			const toolTypes = branches
				.map((branch) => branch.properties?.type?.enum?.[0])
				.filter((t): t is string => typeof t === 'string')
				.sort();
			expect(toolTypes).toEqual([...VALIDATOR_BLOCK_TYPES].sort());
		});
	}

	it('programmatic strict walk: create_page + update_page have no oneOf and satisfy strict invariants', () => {
		const serialized = JSON.stringify(KUROMI_TOOLS);
		expect(serialized).not.toContain('oneOf');

		for (const toolName of ['create_page', 'update_page'] as const) {
			const fn = findTool(toolName);
			expect(fn.strict).toBe(true);
			const failures: string[] = [];
			walkObjectSchemas(fn.parameters, `${toolName}.parameters`, (node, path) => {
				if (node.additionalProperties !== false) {
					failures.push(`${path}: missing additionalProperties:false`);
				}
				const propKeys = Object.keys(node.properties ?? {}).sort();
				const required = [...(node.required ?? [])].sort();
				if (JSON.stringify(required) !== JSON.stringify(propKeys)) {
					failures.push(
						`${path}: required [${required.join(',')}] !== properties [${propKeys.join(',')}]`
					);
				}
			});
			expect(failures, `${toolName} strict walk failures`).toEqual([]);
		}
	});

	// The 'omit a field' contract died with strict:true -- every key is now
	// mandatory, so 'omit' is structurally impossible. If it creeps back into
	// a description, the model will be told to do something it cannot do.
	it('no update_page or create_page description contains the word "omit"', () => {
		for (const toolName of ['create_page', 'update_page'] as const) {
			const fn = findTool(toolName);
			const serialized = JSON.stringify(fn).toLowerCase();
			expect(serialized, `${toolName} description(s) contain "omit"`).not.toContain('omit');
		}
	});

	// update_page's null-to-preserve contract must be stated on each of these
	// three fields' own descriptions -- a model reading only the field
	// description (not the top-level tool description) must still get it
	// right, especially for blocks, where getting it wrong destroys content.
	it('update_page: title, labels, and blocks descriptions each mention null', () => {
		const params = findTool('update_page').parameters;
		for (const field of ['title', 'labels', 'blocks'] as const) {
			const fieldSchema = params.properties?.[field];
			expect(fieldSchema, `update_page.${field} schema`).toBeDefined();
			const description = (fieldSchema as { description?: string }).description ?? '';
			expect(description.toLowerCase(), `update_page.${field} description mentions null`).toContain(
				'null'
			);
		}
	});

	it('update_config patch uses nested AppConfig shape (matches session context)', () => {
		const params = findTool('update_config').parameters;
		const patch = params.properties?.patch;
		expect(patch?.properties?.progression).toBeDefined();
		expect(patch?.properties?.missions).toBeDefined();
		expect(patch?.properties?.['progression.display']).toBeUndefined();
		expect(patch?.properties?.['quiz.focusCategories']).toBeUndefined();
		expect(patch?.properties?.['dailyPath.order']).toBeUndefined();
		expect(patch?.properties?.quiz?.properties?.focusCategories).toBeDefined();
		expect(patch?.properties?.dailyPath?.properties?.order).toBeDefined();
	});

	it('update_config description maps sticker book, missions hide, and refuses deleting achievements', () => {
		const blob = JSON.stringify(findTool('update_config')).toLowerCase();
		expect(blob).toContain('sticker book');
		expect(blob).toContain('show stickers');
		expect(blob).toMatch(/hide.*missions|missions.*hide/);
		expect(blob).toContain('cannot delete achievements');
		expect(blob).toContain('[sticker:]');
	});
});

describe('KUROMI_CHAT_SYSTEM_PROMPT — settings vs shelf', () => {
	it('maps sticker book and missions to the settings tool and forbids deleting achievements', () => {
		const p = KUROMI_CHAT_SYSTEM_PROMPT.toLowerCase();
		expect(p).toContain('sticker book');
		expect(p).toContain('remove missions');
		expect(p).toContain('cannot delete achievements');
		expect(p).toContain('those tags are decorations');
		expect(KUROMI_CHAT_SYSTEM_PROMPT).not.toContain('update_config');
	});
});
