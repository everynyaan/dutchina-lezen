// ============================================================
// KUROMI — drill background function
//
// POST /.netlify/functions/kuromi-drill-background?profile=domi|admin
//
// Netlify treats the "-background" filename suffix as a background
// function (15 min budget, HTTP 202 before handler finishes).
// Do NOT export config.path — a custom path can defeat detection.
//
// On post-auth failures, write an error record to Blobs so
// drill_status can surface it. Auth failures return immediately
// with no store write (unauthenticated callers must not write).
// ============================================================

import { getStore } from '@netlify/blobs';
import {
	callXaiDrill,
	checkAuth,
	clampDrillCount,
	drillBlobKey,
	isValidJobId,
	jsonError,
	type ErrorCode
} from './lib/shared.mts';
import { validateDrill } from '../../src/lib/kuromi/validateDrill';
import type { KuromiDrillJobRecord } from '../../src/lib/kuromi/drill';

type Store = ReturnType<typeof getStore>;

async function writeRecord(store: Store, key: string, record: KuromiDrillJobRecord): Promise<void> {
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

	const store = getStore({ name: 'kuromi-drills', consistency: 'strong' });
	const key = drillBlobKey(profile, jobId);

	if (body === null || typeof body !== 'object' || Array.isArray(body)) {
		await writeError(store, key, 'bad_request', 'Invalid JSON body');
		return jsonError(400, 'bad_request', 'Invalid JSON body');
	}

	const { topic, count, difficulty } = body as {
		topic?: unknown;
		count?: unknown;
		difficulty?: unknown;
	};

	// ============================================================
	// PENDING record (poller has something immediately)
	// ============================================================
	try {
		await writeRecord(store, key, {
			status: 'pending',
			createdAt: Date.now()
		});
	} catch {
		console.error('[kuromi-drill] failed to write pending record');
		return jsonError(502, 'upstream', 'Failed to write job record');
	}

	// Clamp once so prompt + validation agree
	const clampedCount = clampDrillCount(count);

	// ============================================================
	// GENERATE (one retry on semantic validation failure only)
	// ============================================================
	const shapeError = 'Even I could not make that make sense. Try again.';

	for (let attempt = 0; attempt < 2; attempt++) {
		const gen = await callXaiDrill(topic, clampedCount, difficulty);

		if (!gen.ok) {
			// Transport / request failures: do not retry (spec retries only on shape)
			await writeError(store, key, gen.code, gen.error);
			return jsonError(gen.status, gen.code, gen.error);
		}

		const validated = validateDrill(gen.raw, gen.count);
		if (validated.ok) {
			const ready: KuromiDrillJobRecord = {
				status: 'ready',
				createdAt: Date.now(),
				set: validated.set
			};
			try {
				await writeRecord(store, key, ready);
			} catch {
				console.error('[kuromi-drill] failed to write ready record');
				return jsonError(502, 'upstream', 'Failed to write drill set');
			}
			return new Response(null, { status: 202 });
		}

		console.error(
			`[kuromi-drill] validation failed attempt ${attempt + 1}:`,
			validated.reasons.slice(0, 5).join('; ')
		);

		// Retry exactly once on semantic validation failure
		if (attempt === 0) continue;

		await writeError(store, key, 'invalid_shape', shapeError);
		return jsonError(502, 'invalid_shape', shapeError);
	}

	await writeError(store, key, 'invalid_shape', shapeError);
	return jsonError(502, 'invalid_shape', shapeError);
}
