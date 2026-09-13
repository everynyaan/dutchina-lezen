// ============================================================
// KUROMI CHAT CLIENT
// Start a background chat job, then poll for the result.
// Auth is the x-sync-key header carrying getSyncKey()'s runtime-entered value.
// Never throws for normal failure — always returns a result union.
// ============================================================

import type { ProfileId } from '$lib/profiles/profiles';
import { getSyncKey } from '$lib/profiles/profiles';
import type {
	KuromiChatRequest,
	KuromiContextPacket,
	KuromiErrorCode,
	KuromiErrorResponse,
	KuromiToolCall,
	KuromiTurn,
	StewardToolResult
} from './types';

const KUROMI_ENDPOINT = '/.netlify/functions/kuromi';
const CHAT_BACKGROUND_ENDPOINT = '/.netlify/functions/kuromi-chat-background';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120000;

// Per-request AbortController backstop for each start/poll fetch.
// Overall chat wait is the 120s poll budget; this only covers a hung
// individual request that never answers.
export const KUROMI_CLIENT_TIMEOUT_MS = 12_000;

const ERROR_CODES: ReadonlySet<string> = new Set([
	'unauthorized',
	'bad_request',
	'upstream',
	'invalid_shape',
	'not_configured',
	'timeout'
]);

export type KuromiClientResult =
	| { ok: true; reply: string; toolCalls?: KuromiToolCall[] }
	| { ok: false; code: KuromiErrorCode | 'network' };

type ChatJobPayload = {
	mode: 'chat';
	messages: KuromiTurn[];
	context: KuromiContextPacket;
	pendingToolCalls?: KuromiToolCall[];
	toolResults?: StewardToolResult[];
};

function isErrorCode(code: unknown): code is KuromiErrorCode {
	return typeof code === 'string' && ERROR_CODES.has(code);
}

/** Defensively keep only well-shaped tool call entries from a response body. */
function filterToolCalls(raw: unknown): KuromiToolCall[] | undefined {
	if (!Array.isArray(raw)) return undefined;
	const out: KuromiToolCall[] = [];
	for (const entry of raw) {
		if (
			entry !== null &&
			typeof entry === 'object' &&
			typeof (entry as { id?: unknown }).id === 'string' &&
			typeof (entry as { name?: unknown }).name === 'string' &&
			typeof (entry as { arguments?: unknown }).arguments === 'string'
		) {
			out.push({
				id: (entry as KuromiToolCall).id,
				name: (entry as KuromiToolCall).name,
				arguments: (entry as KuromiToolCall).arguments
			});
		}
	}
	return out.length > 0 ? out : undefined;
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function timedFetch(url: string, init: RequestInit): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), KUROMI_CLIENT_TIMEOUT_MS);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Kick off a background chat job. A 202 means accepted, not finished.
 */
async function startKuromiChatJob(
	profile: ProfileId,
	syncKey: string,
	jobId: string,
	payload: ChatJobPayload
): Promise<KuromiClientResult | { ok: true }> {
	try {
		const res = await timedFetch(`${CHAT_BACKGROUND_ENDPOINT}?profile=${profile}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-sync-key': syncKey
			},
			body: JSON.stringify({ jobId, ...payload })
		});

		if (!res.ok) {
			try {
				const body = (await res.json()) as KuromiErrorResponse;
				if (body && isErrorCode(body.code)) {
					return { ok: false, code: body.code };
				}
			} catch {
				/* non-JSON error body */
			}
			return { ok: false, code: 'upstream' };
		}

		return { ok: true };
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			return { ok: false, code: 'timeout' };
		}
		return { ok: false, code: 'network' };
	}
}

/**
 * Poll chat_status every 2s until ready/error, or give up after 120s.
 * A bare { status: "pending" } (including the 202-before-write race)
 * is never treated as failure — keep waiting.
 */
async function pollKuromiChatJob(
	profile: ProfileId,
	syncKey: string,
	jobId: string
): Promise<KuromiClientResult> {
	const startedAt = Date.now();

	while (true) {
		if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
			return { ok: false, code: 'timeout' };
		}

		try {
			const res = await timedFetch(`${KUROMI_ENDPOINT}?profile=${profile}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-sync-key': syncKey
				},
				body: JSON.stringify({ mode: 'chat_status', jobId })
			});

			if (!res.ok) {
				try {
					const body = (await res.json()) as KuromiErrorResponse;
					if (body && isErrorCode(body.code)) {
						return { ok: false, code: body.code };
					}
				} catch {
					/* non-JSON error body */
				}
				return { ok: false, code: 'upstream' };
			}

			const data = (await res.json()) as {
				status?: string;
				reply?: unknown;
				toolCalls?: unknown;
				code?: string;
			};

			if (data && data.status === 'ready') {
				if (typeof data.reply !== 'string') {
					return { ok: false, code: 'invalid_shape' };
				}
				const toolCalls = filterToolCalls(data.toolCalls);
				if (toolCalls) {
					return { ok: true, reply: data.reply, toolCalls };
				}
				return { ok: true, reply: data.reply };
			}

			if (data && data.status === 'error') {
				const code = isErrorCode(data.code) ? data.code : 'upstream';
				return { ok: false, code };
			}

			// status "pending" (with or without other fields) — keep polling
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return { ok: false, code: 'timeout' };
			}
			return { ok: false, code: 'network' };
		}

		await delay(POLL_INTERVAL_MS);
	}
}

async function runKuromiChatJob(
	profile: ProfileId,
	payload: ChatJobPayload
): Promise<KuromiClientResult> {
	const syncKey = getSyncKey(profile);
	if (!syncKey) {
		return { ok: false, code: 'not_configured' };
	}

	const jobId = crypto.randomUUID();
	const started = await startKuromiChatJob(profile, syncKey, jobId, payload);
	if (!started.ok) return started;
	return pollKuromiChatJob(profile, syncKey, jobId);
}

/**
 * Send one chat turn request. Starts a background job then polls.
 * Network failures map to code 'network'. Missing sync key skips the fetch.
 */
export async function sendKuromiChat(
	profile: ProfileId,
	request: KuromiChatRequest
): Promise<KuromiClientResult> {
	return runKuromiChatJob(profile, request);
}

/**
 * Leg-2: send tool results for pending calls and get Kuromi's narration.
 * Starts a background job then polls. Never throws. Do not include dropped/fabricated
 * calls in pendingToolCalls — the server 400s on unknown tool names.
 */
export async function sendKuromiToolResults(
	profile: ProfileId,
	body: {
		messages: KuromiTurn[];
		context: KuromiContextPacket;
		pendingToolCalls: KuromiToolCall[];
		toolResults: StewardToolResult[];
	}
): Promise<KuromiClientResult> {
	return runKuromiChatJob(profile, { mode: 'chat', ...body });
}
