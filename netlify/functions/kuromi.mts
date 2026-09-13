// ============================================================
// KUROMI — main function (chat + chat_status + drill_status)
//
// POST /.netlify/functions/kuromi?profile=domi|admin
//
// mode: "chat"         — synchronous xAI reply (kept for back-compat)
// mode: "chat_status"  — poll a background chat job from Blobs
// mode: "drill_status" — poll a background drill job from Blobs
// ============================================================

import { getStore } from '@netlify/blobs';
import {
	checkAuth,
	callXaiChat,
	chatBlobKey,
	drillBlobKey,
	isValidJobId,
	jsonError,
	jsonOk
} from './lib/shared.mts';
import type { KuromiChatJobRecord } from '../../src/lib/kuromi/types';
import type { KuromiDrillJobRecord } from '../../src/lib/kuromi/drill';

const STALE_MS = 600_000; // 10 minutes
const STALE_MESSAGE = 'That took too long — I got bored and wandered off. Try again.';

export default async function handler(req: Request): Promise<Response> {
	// ============================================================
	// AUTH
	// ============================================================
	const auth = checkAuth(req);
	if (!auth.ok) return auth.response;
	const { profile } = auth;

	// ============================================================
	// BODY
	// ============================================================
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return jsonError(400, 'bad_request', 'Invalid JSON body');
	}
	if (body === null || typeof body !== 'object' || Array.isArray(body)) {
		return jsonError(400, 'bad_request', 'Body must be a JSON object');
	}

	const mode = (body as { mode?: unknown }).mode;

	// ============================================================
	// MODE: chat
	// ============================================================
	if (mode === 'chat') {
		const messages = (body as { messages?: unknown }).messages;
		const context = (body as { context?: unknown }).context ?? {};
		const pendingToolCalls = (body as { pendingToolCalls?: unknown }).pendingToolCalls;
		const toolResults = (body as { toolResults?: unknown }).toolResults;
		const result = await callXaiChat(messages, context, pendingToolCalls, toolResults);
		if (!result.ok) {
			return jsonError(result.status, result.code, result.error);
		}
		// 200 with { reply } and optional toolCalls (omitted when undefined)
		return jsonOk({ reply: result.reply, toolCalls: result.toolCalls });
	}

	// ============================================================
	// MODE: chat_status
	// ============================================================
	if (mode === 'chat_status') {
		const jobId = (body as { jobId?: unknown }).jobId;
		if (!isValidJobId(jobId)) {
			return jsonError(400, 'bad_request', 'jobId must be 8–64 chars of A–Z a–z 0–9 hyphen');
		}

		const store = getStore({ name: 'kuromi-chats', consistency: 'strong' });
		const key = chatBlobKey(profile, jobId);

		let raw: string | null;
		try {
			raw = await store.get(key);
		} catch {
			console.error('[kuromi] blob read error');
			return jsonError(502, 'upstream', 'Failed to read job status');
		}

		// Absent record is pending: client may poll before the background function writes the initial record (202-before-write race).
		if (!raw) {
			return jsonOk({ status: 'pending' });
		}

		let record: KuromiChatJobRecord;
		try {
			record = JSON.parse(raw) as KuromiChatJobRecord;
		} catch {
			return jsonError(502, 'upstream', 'Corrupt job record');
		}

		// Stale jobs report as error; delete so the store does not grow unbounded
		if (typeof record.createdAt === 'number' && Date.now() - record.createdAt > STALE_MS) {
			try {
				await store.delete(key);
			} catch {
				console.error('[kuromi] blob delete error after stale read');
			}
			return jsonOk({
				status: 'error',
				createdAt: record.createdAt,
				code: 'upstream',
				error: STALE_MESSAGE
			} satisfies KuromiChatJobRecord);
		}

		// One-shot: delete after a terminal ready or error read
		if (record.status === 'ready' || record.status === 'error') {
			try {
				await store.delete(key);
			} catch {
				console.error('[kuromi] blob delete error after ready read');
			}
		}

		return jsonOk(record);
	}

	// ============================================================
	// MODE: drill_status
	// ============================================================
	if (mode === 'drill_status') {
		const jobId = (body as { jobId?: unknown }).jobId;
		if (!isValidJobId(jobId)) {
			return jsonError(400, 'bad_request', 'jobId must be 8–64 chars of A–Z a–z 0–9 hyphen');
		}

		const store = getStore({ name: 'kuromi-drills', consistency: 'strong' });
		const key = drillBlobKey(profile, jobId);

		let raw: string | null;
		try {
			raw = await store.get(key);
		} catch {
			console.error('[kuromi] blob read error');
			return jsonError(502, 'upstream', 'Failed to read job status');
		}

		// Absent record is pending: client may poll before the background function writes the initial record (202-before-write race).
		if (!raw) {
			return jsonOk({ status: 'pending' });
		}

		let record: KuromiDrillJobRecord;
		try {
			record = JSON.parse(raw) as KuromiDrillJobRecord;
		} catch {
			return jsonError(502, 'upstream', 'Corrupt job record');
		}

		// Stale jobs report as error; delete so the store does not grow unbounded
		if (typeof record.createdAt === 'number' && Date.now() - record.createdAt > STALE_MS) {
			try {
				await store.delete(key);
			} catch {
				console.error('[kuromi] blob delete error after stale read');
			}
			return jsonOk({
				status: 'error',
				createdAt: record.createdAt,
				code: 'upstream',
				error: STALE_MESSAGE
			} satisfies KuromiDrillJobRecord);
		}

		// One-shot: delete after a terminal ready or error read
		if (record.status === 'ready' || record.status === 'error') {
			try {
				await store.delete(key);
			} catch {
				console.error('[kuromi] blob delete error after ready read');
			}
		}

		return jsonOk(record);
	}

	return jsonError(400, 'bad_request', 'mode must be "chat", "chat_status", or "drill_status"');
}
