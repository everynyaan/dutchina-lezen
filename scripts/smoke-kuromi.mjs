#!/usr/bin/env node
/**
 * Permanent production smoke check for the Kuromi chat path.
 *
 * The FIRST assertion is a plain HTTP GET of `/`. A Netlify deploy can report
 * success -- files uploaded, functions registered -- while the origin serves
 * nothing at all, so "deploy succeeded" is not "site serves". If that GET does
 * not return 200 the script stops there; no later result would mean anything.
 *
 * Manual release gate: run after every Netlify deploy.
 *   DUTCHINA_SYNC_KEY=<key> DUTCHINA_SITE_URL=https://... node scripts/smoke-kuromi.mjs
 *   DUTCHINA_SYNC_KEY=<key> node scripts/smoke-kuromi.mjs --url https://...
 *
 * IMPORTANT (verified from source — do not re-derive):
 * The "chat" mode handler in netlify/functions/kuromi.mts and callXaiChat in
 * netlify/functions/lib/shared.mts never touch @netlify/blobs or any other
 * persistent store for chat requests. They only call the xAI API and return
 * { reply, toolCalls }. The actual config/LP/streak mutation described by a
 * toolCall is applied by a client-side executor in the browser, not by this
 * server function. This smoke script only POSTs to the function and echoes
 * fabricated toolResults back in leg 2, so it cannot mutate any real
 * production state no matter what tool names appear in the responses it
 * triggers.
 *
 * Security:
 * - Auth secret is read ONLY from process.env.DUTCHINA_SYNC_KEY.
 * - Never accept the key as a CLI arg, never prompt, never write it to disk,
 *   never hard-code a real default, never print it (full or partial).
 */

const FETCH_TIMEOUT_MS = 60_000;
// The root fetch exists to catch a site that hangs rather than answers, so it
// gets a short budget of its own. 60s of silence is the bug, not a slow reply.
//
// DUTCHINA_ROOT_TIMEOUT_MS exists so the test suite can exercise the hang path
// in milliseconds instead of waiting 15s. It is not part of the operator-facing
// interface and carries no secret; anything non-positive falls back to default.
const ROOT_TIMEOUT_MS = (() => {
	const raw = Number(process.env.DUTCHINA_ROOT_TIMEOUT_MS);
	return Number.isFinite(raw) && raw > 0 ? raw : 15_000;
})();
const WRONG_KEY = 'smoke-test-invalid-key';
const PROFILE = 'domi';
const SMOKE_USER_MESSAGE = 'Smoke test: say hello in one short sentence.';
const STEWARD_USER_MESSAGE = 'Please turn off the missions feature for me right now.';
const LEG2_DETAIL = 'smoke test: simulated apply, no real state changed';

/** @type {boolean} */
let hardFailed = false;

/**
 * @param {string} label
 * @param {string} detail
 */
function pass(label, detail) {
	console.log(`[PASS] ${label}: ${detail}`);
}

/**
 * @param {string} label
 * @param {string} detail
 */
function fail(label, detail) {
	hardFailed = true;
	console.log(`[FAIL] ${label}: ${detail}`);
}

/**
 * @param {string} label
 * @param {string} detail
 */
function info(label, detail) {
	console.log(`[INFO] ${label}: ${detail}`);
}

/**
 * @param {string} label
 * @param {string} detail
 */
function skip(label, detail) {
	console.log(`[SKIP] ${label}: ${detail}`);
}

/**
 * @param {string} label
 * @param {string} detail
 */
function networkError(label, detail) {
	hardFailed = true;
	console.log(`[NETWORK ERROR] ${label}: ${detail}`);
}

/**
 * Parse CLI for --url <value>. Other flags are ignored.
 * @param {string[]} argv
 * @returns {{ urlFromCli: string | null }}
 */
function parseArgs(argv) {
	let urlFromCli = null;
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === '--url') {
			const next = argv[i + 1];
			if (typeof next === 'string' && next.length > 0 && !next.startsWith('--')) {
				urlFromCli = next;
				i++;
			}
		}
	}
	return { urlFromCli };
}

/**
 * Host-only display string for the base URL (never logs secrets).
 * @param {string} baseUrl
 */
function hostOnly(baseUrl) {
	try {
		return new URL(baseUrl).host;
	} catch {
		return '(invalid URL)';
	}
}

/**
 * Strip trailing slash from base URL.
 * @param {string} baseUrl
 */
function normalizeBaseUrl(baseUrl) {
	return baseUrl.replace(/\/+$/, '');
}

/**
 * Build the kuromi endpoint URL.
 * @param {string} baseUrl
 */
function endpointUrl(baseUrl) {
	return `${normalizeBaseUrl(baseUrl)}/.netlify/functions/kuromi?profile=${PROFILE}`;
}

/**
 * Minimal valid chat body (leg 1).
 * @param {string} content
 * @param {Record<string, unknown>} [extra]
 */
function chatBody(content, extra = {}) {
	return {
		mode: 'chat',
		messages: [{ role: 'user', content }],
		context: {},
		...extra
	};
}

/**
 * POST with timeout. Never logs the real sync key.
 * On debug-style header dumps (if ever added), x-sync-key must be "[REDACTED]".
 *
 * @param {string} url
 * @param {string} syncKey
 * @param {unknown} body
 * @returns {Promise<
 *   | { ok: true; status: number; json: unknown; text: string }
 *   | { ok: false; kind: 'timeout' | 'network'; message: string }
 * >}
 */
async function postKuromi(url, syncKey, body) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-sync-key': syncKey
			},
			body: JSON.stringify(body),
			signal: controller.signal
		});

		const text = await res.text();
		let json = null;
		try {
			json = JSON.parse(text);
		} catch {
			json = null;
		}

		return { ok: true, status: res.status, json, text };
	} catch (err) {
		const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
		const message =
			err && typeof err === 'object' && 'message' in err
				? String(/** @type {{ message: unknown }} */ (err).message)
				: String(err);

		if (name === 'AbortError' || /aborted|timeout/i.test(message)) {
			return {
				ok: false,
				kind: 'timeout',
				message: `timed out after ${FETCH_TIMEOUT_MS / 1000}s`
			};
		}

		return { ok: false, kind: 'network', message };
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Plain unauthenticated GET of the site root.
 *
 * This is deliberately the dumbest possible request: no key, no JSON, no
 * function path. It answers the one question a green Netlify deploy does NOT
 * answer -- does the origin actually serve HTML to an anonymous client.
 *
 * @param {string} baseUrl
 * @returns {Promise<
 *   | { ok: true; status: number; contentType: string; bytes: number }
 *   | { ok: false; kind: 'timeout' | 'network'; message: string }
 * >}
 */
async function getRoot(baseUrl) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ROOT_TIMEOUT_MS);

	try {
		const res = await fetch(`${normalizeBaseUrl(baseUrl)}/`, {
			method: 'GET',
			redirect: 'follow',
			signal: controller.signal
		});
		const text = await res.text();
		return {
			ok: true,
			status: res.status,
			contentType: res.headers.get('content-type') ?? '(none)',
			bytes: text.length
		};
	} catch (err) {
		const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
		const message =
			err && typeof err === 'object' && 'message' in err
				? String(/** @type {{ message: unknown }} */ (err).message)
				: String(err);

		if (name === 'AbortError' || /aborted|timeout/i.test(message)) {
			return { ok: false, kind: 'timeout', message: `timed out after ${ROOT_TIMEOUT_MS / 1000}s` };
		}
		return { ok: false, kind: 'network', message };
	} finally {
		clearTimeout(timer);
	}
}

/**
 * @param {unknown} json
 * @returns {json is { reply: string }}
 */
function hasNonEmptyReply(json) {
	return (
		json !== null &&
		typeof json === 'object' &&
		!Array.isArray(json) &&
		typeof (/** @type {{ reply?: unknown }} */ (json).reply) === 'string' &&
		/** @type {{ reply: string }} */ (json).reply.trim().length > 0
	);
}

/**
 * @param {unknown} json
 * @returns {{ id: string; name: string; arguments: string }[]}
 */
function extractToolCalls(json) {
	if (json === null || typeof json !== 'object' || Array.isArray(json)) return [];
	const raw = /** @type {{ toolCalls?: unknown }} */ (json).toolCalls;
	if (!Array.isArray(raw) || raw.length === 0) return [];

	/** @type {{ id: string; name: string; arguments: string }[]} */
	const out = [];
	for (const entry of raw) {
		if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue;
		const id = /** @type {{ id?: unknown }} */ (entry).id;
		const name = /** @type {{ name?: unknown }} */ (entry).name;
		const args = /** @type {{ arguments?: unknown }} */ (entry).arguments;
		if (typeof id === 'string' && typeof name === 'string' && typeof args === 'string') {
			out.push({ id, name, arguments: args });
		}
	}
	return out;
}

async function main() {
	const syncKey = process.env.DUTCHINA_SYNC_KEY;
	if (typeof syncKey !== 'string' || syncKey.length === 0) {
		console.error(
			'DUTCHINA_SYNC_KEY is unset or empty. Set the DUTCHINA_SYNC_KEY environment variable to the production sync key and re-run. Exiting without making any network requests.'
		);
		process.exit(1);
	}

	const { urlFromCli } = parseArgs(process.argv.slice(2));
	const urlFromEnv = process.env.DUTCHINA_SITE_URL;
	/** @type {string | null} */
	let baseUrl = null;
	/** @type {string} */
	let urlSource = '';

	if (urlFromCli) {
		baseUrl = urlFromCli;
		urlSource = '--url CLI argument';
	} else if (typeof urlFromEnv === 'string' && urlFromEnv.length > 0) {
		baseUrl = urlFromEnv;
		urlSource = 'DUTCHINA_SITE_URL env';
	}

	if (!baseUrl) {
		console.error(
			'No site base URL provided. Set DUTCHINA_SITE_URL or pass --url <https://your-site>. Exiting without making any network requests.'
		);
		process.exit(1);
	}

	const url = endpointUrl(baseUrl);
	console.log(`Target host: ${hostOnly(baseUrl)} (from ${urlSource}), profile=${PROFILE}`);

	// ------------------------------------------------------------------
	// 0. Site serves -- THE FIRST ASSERTION, and a hard gate on the rest.
	//
	// "Deploy succeeded" is not "site serves". A deploy can report success,
	// publish every file and register every function, and still leave an
	// origin that never answers -- in which case every assertion below is
	// measuring nothing. Prove the front door opens before testing the
	// furniture. On failure we stop here rather than emit a cascade of
	// function failures that all restate the same outage.
	// ------------------------------------------------------------------
	const step0 = await getRoot(baseUrl);
	if (!step0.ok) {
		if (step0.kind === 'timeout') {
			fail('site serves', `GET / ${step0.message} -- the origin hung instead of answering`);
		} else {
			networkError('site serves', `GET / failed: ${step0.message}`);
		}
		console.log(
			'\nSite root did not serve. Everything downstream would be noise, so the remaining checks were not run.'
		);
		process.exit(1);
	}
	if (step0.status !== 200) {
		fail('site serves', `GET / expected HTTP 200, got ${step0.status}`);
		console.log(
			'\nSite root did not serve. Everything downstream would be noise, so the remaining checks were not run.'
		);
		process.exit(1);
	}
	pass('site serves', `GET / HTTP 200, ${step0.contentType}, ${step0.bytes} bytes`);

	const happyBody = chatBody(SMOKE_USER_MESSAGE);

	// ------------------------------------------------------------------
	// 1. Reachability + auth (happy path) — hard assertion
	// ------------------------------------------------------------------
	const step1 = await postKuromi(url, syncKey, happyBody);
	/** @type {unknown} */
	let step1Json = null;

	if (!step1.ok) {
		if (step1.kind === 'timeout') {
			fail('reachability', step1.message);
		} else {
			networkError('reachability', step1.message);
		}
	} else if (step1.status !== 200) {
		fail('reachability', `expected HTTP 200, got ${step1.status}`);
	} else {
		pass('reachability', 'HTTP 200');
		step1Json = step1.json;
	}

	// ------------------------------------------------------------------
	// 2. Auth enforcement — hard assertion
	// Intentionally never touches the real DUTCHINA_SYNC_KEY value.
	// Uses a fixed hardcoded invalid literal that is never a valid key.
	// ------------------------------------------------------------------
	const step2 = await postKuromi(url, WRONG_KEY, happyBody);
	if (!step2.ok) {
		if (step2.kind === 'timeout') {
			fail('auth enforcement', step2.message);
		} else {
			networkError('auth enforcement', step2.message);
		}
	} else {
		const code =
			step2.json !== null &&
			typeof step2.json === 'object' &&
			!Array.isArray(step2.json) &&
			typeof (/** @type {{ code?: unknown }} */ (step2.json).code) === 'string'
				? /** @type {{ code: string }} */ (step2.json).code
				: null;

		if (step2.status !== 401) {
			fail('auth enforcement', `expected 401, got ${step2.status}`);
		} else if (code !== 'unauthorized') {
			fail(
				'auth enforcement',
				`expected body.code === "unauthorized", got ${code === null ? '(missing/unparseable)' : JSON.stringify(code)}`
			);
		} else {
			pass('auth enforcement', 'HTTP 401 with code "unauthorized"');
		}
	}

	// ------------------------------------------------------------------
	// 3. Response shape (from step 1) — hard assertion
	// ------------------------------------------------------------------
	if (!step1.ok || step1.status !== 200) {
		fail('response shape', 'skipped because step 1 did not return HTTP 200');
	} else if (step1Json === null) {
		fail('response shape', 'response body was not valid JSON');
	} else if (!hasNonEmptyReply(step1Json)) {
		fail('response shape', 'missing or empty non-string "reply" field');
	} else {
		pass('response shape', `reply is non-empty string (${step1Json.reply.trim().length} chars)`);
	}

	// ------------------------------------------------------------------
	// 4. Steward tools declared — diagnostic only, never affects exit code
	// ------------------------------------------------------------------
	const stewardBody = chatBody(STEWARD_USER_MESSAGE);
	const step4 = await postKuromi(url, syncKey, stewardBody);

	/** @type {{ id: string; name: string; arguments: string }[]} */
	let toolCalls = [];
	/** @type {boolean} */
	let step4OkForLeg2 = false;

	if (!step4.ok) {
		if (step4.kind === 'timeout') {
			info('steward tools', `request ${step4.message} — skipping leg-2`);
		} else {
			info('steward tools', `network failure (${step4.message}) — skipping leg-2`);
		}
	} else if (step4.status !== 200) {
		info('steward tools', `HTTP ${step4.status} (non-200) — skipping leg-2`);
	} else {
		toolCalls = extractToolCalls(step4.json);
		if (toolCalls.length === 0) {
			info('steward tools', 'HTTP 200, toolCalls absent or empty');
		} else {
			const names = [...new Set(toolCalls.map((t) => t.name))];
			info(
				'steward tools',
				`HTTP 200, toolCalls present: ${names.join(', ')} (${toolCalls.length} call(s))`
			);
			step4OkForLeg2 = true;
		}
		console.log(
			'[INFO] This is diagnostic only. An LLM is non-deterministic, so the absence of toolCalls on this run does NOT prove the tools are undeclared, and their presence does not by itself prove full correctness either. Read the reply text for operator judgement.'
		);
	}

	// ------------------------------------------------------------------
	// 5. Leg-2 round-trip — hard assertion ONLY when step 4 produced tools
	// ------------------------------------------------------------------
	if (!step4.ok || step4.status !== 200) {
		skip('leg-2 round-trip', 'step 4 did not succeed; not run');
	} else if (!step4OkForLeg2 || toolCalls.length === 0) {
		skip('leg-2 round-trip', 'no toolCalls from step 4 to echo back');
	} else {
		const pendingToolCalls = toolCalls.map((tc) => ({
			id: tc.id,
			name: tc.name,
			arguments: tc.arguments
		}));
		const toolResults = toolCalls.map((tc) => ({
			id: tc.id,
			outcome: 'applied',
			detail: LEG2_DETAIL
		}));

		const leg2Body = chatBody(STEWARD_USER_MESSAGE, {
			pendingToolCalls,
			toolResults
		});

		const step5 = await postKuromi(url, syncKey, leg2Body);
		if (!step5.ok) {
			if (step5.kind === 'timeout') {
				fail('leg-2 round-trip', step5.message);
			} else {
				networkError('leg-2 round-trip', step5.message);
			}
		} else if (step5.status !== 200) {
			fail('leg-2 round-trip', `expected HTTP 200, got ${step5.status}`);
		} else if (step5.json === null) {
			fail('leg-2 round-trip', 'response body was not valid JSON');
		} else if (!hasNonEmptyReply(step5.json)) {
			fail('leg-2 round-trip', 'missing or empty non-string "reply" field');
		} else {
			pass(
				'leg-2 round-trip',
				`HTTP 200 with non-empty reply (${step5.json.reply.trim().length} chars)`
			);
		}
	}

	const overall = hardFailed ? 'FAIL' : 'PASS';
	console.log(`Overall: ${overall}`);
	process.exit(hardFailed ? 1 : 0);
}

main().catch((err) => {
	const message =
		err && typeof err === 'object' && 'message' in err
			? String(/** @type {{ message: unknown }} */ (err).message)
			: String(err);
	console.error(`[UNEXPECTED ERROR] ${message}`);
	process.exit(1);
});
