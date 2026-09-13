// ============================================================
// KUROMI DRILL CLIENT
// Start a background drill job, then poll for the result.
// Auth and key lookup mirror client.ts (getSyncKey + x-sync-key).
// Never throws for normal failure — always returns a result union.
// ============================================================

import type { ProfileId } from '$lib/profiles/profiles';
import { getSyncKey } from '$lib/profiles/profiles';
import type { KuromiDrillSet } from './drill';
import type { KuromiContextPacket, KuromiErrorCode, KuromiErrorResponse } from './types';

const KUROMI_ENDPOINT = '/.netlify/functions/kuromi';
const DRILL_BACKGROUND_ENDPOINT = '/.netlify/functions/kuromi-drill-background';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120000;

const ERROR_CODES: ReadonlySet<string> = new Set([
	'unauthorized',
	'bad_request',
	'upstream',
	'invalid_shape',
	'not_configured'
]);

export type KuromiDrillStartResult =
	| { ok: true; jobId: string }
	| { ok: false; code: KuromiErrorCode | 'network' };

export type KuromiDrillPollResult =
	| { ok: true; set: KuromiDrillSet }
	| { ok: false; code: KuromiErrorCode | 'network' | 'timeout' };

function isErrorCode(code: unknown): code is KuromiErrorCode {
	return typeof code === 'string' && ERROR_CODES.has(code);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Kick off a background drill generation job. The background function
 * returns 202 with an empty body almost immediately — that means the
 * job was accepted, not that it finished. Use pollKuromiDrill next.
 */
export async function startKuromiDrill(
	profile: ProfileId,
	topic: string,
	count: number,
	difficulty: string,
	context: KuromiContextPacket
): Promise<KuromiDrillStartResult> {
	const syncKey = getSyncKey(profile);
	if (!syncKey) {
		return { ok: false, code: 'not_configured' };
	}

	const jobId = crypto.randomUUID();

	try {
		const res = await fetch(`${DRILL_BACKGROUND_ENDPOINT}?profile=${profile}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-sync-key': syncKey
			},
			body: JSON.stringify({ jobId, topic, count, difficulty, context })
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

		return { ok: true, jobId };
	} catch {
		return { ok: false, code: 'network' };
	}
}

/**
 * Poll drill_status every 2s until ready/error, or give up after 120s.
 * A bare { status: "pending" } (including the 202-before-write race)
 * is never treated as failure — keep waiting.
 */
export async function pollKuromiDrill(
	profile: ProfileId,
	jobId: string
): Promise<KuromiDrillPollResult> {
	const syncKey = getSyncKey(profile);
	if (!syncKey) {
		return { ok: false, code: 'not_configured' };
	}

	const startedAt = Date.now();

	while (true) {
		if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
			return { ok: false, code: 'timeout' };
		}

		try {
			const res = await fetch(`${KUROMI_ENDPOINT}?profile=${profile}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-sync-key': syncKey
				},
				body: JSON.stringify({ mode: 'drill_status', jobId })
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
				set?: KuromiDrillSet;
				code?: string;
				error?: string;
			};

			if (data && data.status === 'ready' && data.set) {
				return { ok: true, set: data.set };
			}

			if (data && data.status === 'error') {
				const code = isErrorCode(data.code) ? data.code : 'upstream';
				return { ok: false, code };
			}

			// status "pending" (with or without other fields) — keep polling
		} catch {
			return { ok: false, code: 'network' };
		}

		await delay(POLL_INTERVAL_MS);
	}
}
