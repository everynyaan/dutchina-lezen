// ============================================================
// KUROMI — chat background function
//
// POST /.netlify/functions/kuromi-chat-background?profile=domi|admin
//
// Netlify treats the "-background" filename suffix as a background
// function (15 min budget, HTTP 202 before handler finishes).
// Do NOT export config.path — a custom path can defeat detection.
//
// On post-auth failures, write an error record to Blobs so
// chat_status can surface it. Auth failures return immediately
// with no store write (unauthenticated callers must not write).
// ============================================================

import { getStore } from '@netlify/blobs';
import {
	callXaiChat,
	checkAuth,
	chatBlobKey,
	isValidJobId,
	jsonError,
	XAI_BACKGROUND_TIMEOUT_MS,
	type ErrorCode
} from './lib/shared.mts';
import type { KuromiChatJobRecord } from '../../src/lib/kuromi/types';

type Store = ReturnType<typeof getStore>;

async function writeRecord(store: Store, key: string, record: KuromiChatJobRecord): Promise<void> {
	await store.set(key, JSON.stringify(record));
}

async function writeError(
	store: Store,
	key: string,
	code: ErrorCode | string,
	error: string
): Promise<void> {
	await writeRecord(store, key, {
		status: 'error',
		createdAt: Date.now(),
		code,
		error
	});
}

export default async function handler(req: Request): Promise<Response> {
	// ============================================================
	// Parse body early so we can write Blobs errors when possible
	// ============================================================
	let body: unknown = null;
	try {
		body = await req.json();
	} catch {
		// leave null — auth may still fail first
	}

	const jobIdRaw =
		body !== null && typeof body === 'object' && !Array.isArray(body)
			? (body as { jobId?: unknown }).jobId
			: undefined;

	// ============================================================
	// AUTH
	// ============================================================
	const auth = checkAuth(req);
	if (!auth.ok) return auth.response;
	const { profile } = auth;

	// ============================================================
	// jobId (security-critical before blob key interpolation)
	// ============================================================
	if (!isValidJobId(jobIdRaw)) {
		return jsonError(400, 'bad_request', 'jobId must be 8–64 chars of A–Z a–z 0–9 hyphen');
	}
	const jobId = jobIdRaw;

	const store = getStore({ name: 'kuromi-chats', consistency: 'strong' });
	const key = chatBlobKey(profile, jobId);

	if (body === null || typeof body !== 'object' || Array.isArray(body)) {
		await writeError(store, key, 'bad_request', 'Invalid JSON body');
		return jsonError(400, 'bad_request', 'Invalid JSON body');
	}

	const messages = (body as { messages?: unknown }).messages;
	const context = (body as { context?: unknown }).context ?? {};
	const pendingToolCalls = (body as { pendingToolCalls?: unknown }).pendingToolCalls;
	const toolResults = (body as { toolResults?: unknown }).toolResults;

	// ============================================================
	// PENDING record (poller has something immediately)
	// ============================================================
	try {
		await writeRecord(store, key, {
			status: 'pending',
			createdAt: Date.now()
		});
	} catch {
		console.error('[kuromi-chat] failed to write pending record');
		return jsonError(502, 'upstream', 'Failed to write job record');
	}

	// ============================================================
	// GENERATE (no retry — chat has no semantic validation step)
	// ============================================================
	const result = await callXaiChat(
		messages,
		context,
		pendingToolCalls,
		toolResults,
		XAI_BACKGROUND_TIMEOUT_MS
	);

	if (!result.ok) {
		await writeError(store, key, result.code, result.error);
		return jsonError(result.status, result.code, result.error);
	}

	const ready: KuromiChatJobRecord = {
		status: 'ready',
		createdAt: Date.now(),
		reply: result.reply,
		toolCalls: result.toolCalls
	};
	try {
		await writeRecord(store, key, ready);
	} catch {
		console.error('[kuromi-chat] failed to write ready record');
		return jsonError(502, 'upstream', 'Failed to write chat reply');
	}
	return new Response(null, { status: 202 });
}
