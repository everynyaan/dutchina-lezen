// ============================================================
// SMOKE CHECK — the "site serves" gate
//
// These tests spawn the real script against a local origin rather
// than importing it: scripts/smoke-kuromi.mjs runs main() at the
// top level, and its contract with the operator IS its stdout and
// its exit code. Asserting on those is asserting on the real thing.
//
// The gate exists because a Netlify deploy reported success — 329
// files, 2 functions — while the origin answered nothing at all.
// The script's first request used to be an authenticated function
// POST, so a total outage was reported as a Kuromi chat failure.
// Every case below is a shape that outage could take.
// ============================================================

import { describe, it, expect, afterEach } from 'vitest';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./smoke-kuromi.mjs', import.meta.url));

// Never a real key. The gate must never send it, and a test below asserts so.
const DUMMY_KEY = 'test-only-not-a-real-key';

const FN_PATH = '/.netlify/functions/kuromi';

/** @type {import('node:http').Server[]} */
let live = [];

afterEach(async () => {
	const servers = live;
	live = [];
	await Promise.all(
		servers.map(
			(s) =>
				new Promise((resolve) => {
					// Sockets held open by the hang case would keep vitest alive.
					s.closeAllConnections();
					s.close(() => resolve(undefined));
				})
		)
	);
});

/**
 * Start a local origin. The handler decides everything; every request is
 * recorded so a test can assert on what was NOT requested.
 * @param {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void} handler
 */
async function startOrigin(handler) {
	/** @type {{ method: string; url: string; headers: Record<string, unknown> }[]} */
	const requests = [];
	const server = createServer((req, res) => {
		requests.push({ method: req.method ?? '', url: req.url ?? '', headers: req.headers });
		handler(req, res);
	});
	live.push(server);
	await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
	const addr = server.address();
	const port = typeof addr === 'object' && addr !== null ? addr.port : 0;
	return { port, baseUrl: `http://127.0.0.1:${port}`, requests, server };
}

/**
 * @param {string} baseUrl
 * @param {Record<string, string>} [extraEnv]
 * @returns {Promise<{ code: number; stdout: string; stderr: string }>}
 */
function runScript(baseUrl, extraEnv = {}) {
	return new Promise((resolve) => {
		const env = { ...process.env, DUTCHINA_SYNC_KEY: DUMMY_KEY, ...extraEnv };
		// The operator's real environment must not leak into the run.
		delete env.DUTCHINA_SITE_URL;

		const child = spawn(process.execPath, [SCRIPT, '--url', baseUrl], {
			env,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		let stdout = '';
		let stderr = '';
		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');
		child.stdout.on('data', (d) => (stdout += d));
		child.stderr.on('data', (d) => (stderr += d));
		child.on('close', (code) => resolve({ code: code ?? 0, stdout, stderr }));
	});
}

/** Serve HTML at /, and a fast dud for anything else (the function endpoint). */
function servingOrigin(body = '<!doctype html><html><body>ok</body></html>') {
	return (
		/** @type {import('node:http').IncomingMessage} */ req,
		/** @type {import('node:http').ServerResponse} */ res
	) => {
		if (req.url === '/') {
			res.writeHead(200, { 'content-type': 'text/html; charset=UTF-8' });
			res.end(body);
			return;
		}
		res.writeHead(500, { 'content-type': 'application/json' });
		res.end('{}');
	};
}

/** @param {{ url: string }[]} requests */
const reachedFunction = (requests) => requests.some((r) => r.url.startsWith(FN_PATH));

describe('smoke check — the "site serves" gate', () => {
	it('passes on a serving origin and opens the gate to the rest of the run', async () => {
		const { baseUrl, requests } = await startOrigin(servingOrigin());

		const { stdout } = await runScript(baseUrl);

		expect(stdout).toContain('[PASS] site serves');
		expect(stdout).toMatch(/GET \/ HTTP 200, text\/html; charset=UTF-8, \d+ bytes/);
		expect(reachedFunction(requests)).toBe(true);
	});

	it('probes the root anonymously — the key is never sent to it', async () => {
		const { baseUrl, requests } = await startOrigin(servingOrigin());

		await runScript(baseUrl);

		const root = requests.find((r) => r.url === '/');
		expect(root).toBeDefined();
		expect(root?.method).toBe('GET');
		expect(root?.headers['x-sync-key']).toBeUndefined();
		// Belt and braces: the key must appear nowhere in the root request.
		expect(JSON.stringify(root?.headers)).not.toContain(DUMMY_KEY);
	});

	it.each([503, 500, 404, 403])(
		'fails closed on HTTP %i and runs nothing downstream',
		async (status) => {
			const { baseUrl, requests } = await startOrigin((req, res) => {
				if (req.url === '/') {
					res.writeHead(status, { 'content-type': 'text/html' });
					res.end('nope');
					return;
				}
				res.writeHead(500);
				res.end('{}');
			});

			const { code, stdout } = await runScript(baseUrl);

			expect(stdout).toContain('[FAIL] site serves');
			expect(stdout).toContain(`got ${status}`);
			expect(stdout).toContain('remaining checks were not run');
			expect(code).toBe(1);
			// The whole point of the gate: no cascade of function failures.
			expect(reachedFunction(requests)).toBe(false);
		}
	);

	it('fails on an origin that hangs instead of answering — the outage signature', async () => {
		// Accept the connection, then never respond. This is what the live site
		// did: the request did not error, it simply never came back.
		const { baseUrl, requests } = await startOrigin((req, res) => {
			if (req.url === '/') return; // deliberately no res.end()
			res.writeHead(500);
			res.end('{}');
		});

		const { code, stdout } = await runScript(baseUrl, { DUTCHINA_ROOT_TIMEOUT_MS: '400' });

		expect(stdout).toContain('[FAIL] site serves');
		expect(stdout).toContain('the origin hung instead of answering');
		expect(stdout).toContain('timed out after 0.4s');
		expect(stdout).toContain('remaining checks were not run');
		expect(code).toBe(1);
		expect(reachedFunction(requests)).toBe(false);
	}, 15_000);

	it('fails on an origin that refuses the connection', async () => {
		const { baseUrl, server } = await startOrigin(servingOrigin());
		live = live.filter((s) => s !== server);
		await new Promise((resolve) => server.close(() => resolve(undefined)));

		const { code, stdout } = await runScript(baseUrl);

		expect(stdout).toContain('site serves');
		expect(stdout).toContain('GET / failed');
		expect(stdout).toContain('remaining checks were not run');
		expect(code).toBe(1);
	});

	it('follows a redirect and passes when it lands on 200', async () => {
		const { baseUrl, requests } = await startOrigin((req, res) => {
			if (req.url === '/') {
				res.writeHead(301, { location: '/landing' });
				res.end();
				return;
			}
			if (req.url === '/landing') {
				res.writeHead(200, { 'content-type': 'text/html; charset=UTF-8' });
				res.end('<!doctype html><html></html>');
				return;
			}
			res.writeHead(500, { 'content-type': 'application/json' });
			res.end('{}');
		});

		const { stdout } = await runScript(baseUrl);

		expect(stdout).toContain('[PASS] site serves');
		expect(requests.some((r) => r.url === '/landing')).toBe(true);
	});
});
