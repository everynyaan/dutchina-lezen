// ============================================================
// KUROMI — SHARED HELPERS
//
// Auth/profile/JSON helpers + the xAI call. Used by kuromi.mts,
// kuromi-drill-background.mts, and kuromi-chat-background.mts.
// Never ship this to the client.
// ============================================================

import { KUROMI_CHAT_SYSTEM_PROMPT, KUROMI_DRILL_SYSTEM_PROMPT } from './persona.mts';

// ============================================================
// ERROR CODES & JSON RESPONSES
// ============================================================

export type ErrorCode =
	| 'unauthorized'
	| 'bad_request'
	| 'upstream'
	| 'invalid_shape'
	| 'not_configured'
	| 'timeout';

export type ProfileId = 'domi' | 'admin';

const PROFILES = new Set<string>(['domi', 'admin']);

/** jobId: A–Z a–z 0–9 hyphen, length 8–64. Security-critical for blob keys. */
export const JOB_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export function jsonError(status: number, code: ErrorCode, message: string): Response {
	return new Response(JSON.stringify({ error: message, code }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function jsonOk(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

// ============================================================
// AUTH (order matches sync.mts behaviour + XAI_API_KEY gate)
// 1. SYNC_KEY missing -> 500 not_configured
// 2. x-sync-key mismatch -> 401 unauthorized
// 3. profile not domi/admin -> 400 bad_request
// 4. method not POST -> 405 bad_request
// 5. XAI_API_KEY missing -> 500 not_configured
// ============================================================

export type AuthOk = { ok: true; profile: ProfileId };
export type AuthFail = { ok: false; response: Response };
export type AuthResult = AuthOk | AuthFail;

export function checkAuth(req: Request): AuthResult {
	const expectedKey = process.env.SYNC_KEY;
	if (!expectedKey) {
		return {
			ok: false,
			response: jsonError(500, 'not_configured', 'SYNC_KEY not configured on server')
		};
	}

	const providedKey = req.headers.get('x-sync-key');
	if (providedKey !== expectedKey) {
		return {
			ok: false,
			response: jsonError(401, 'unauthorized', 'Unauthorized')
		};
	}

	const url = new URL(req.url);
	const profile = url.searchParams.get('profile');
	if (!profile || !PROFILES.has(profile)) {
		return {
			ok: false,
			response: jsonError(400, 'bad_request', 'Invalid profile')
		};
	}

	if (req.method !== 'POST') {
		return {
			ok: false,
			response: jsonError(405, 'bad_request', 'Method not allowed')
		};
	}

	if (!process.env.XAI_API_KEY) {
		return {
			ok: false,
			response: jsonError(500, 'not_configured', 'XAI_API_KEY not configured on server')
		};
	}

	return { ok: true, profile: profile as ProfileId };
}

export function isValidJobId(jobId: unknown): jobId is string {
	return typeof jobId === 'string' && JOB_ID_RE.test(jobId);
}

export function drillBlobKey(profile: string, jobId: string): string {
	return `drill-${profile}-${jobId}`;
}

export function chatBlobKey(profile: string, jobId: string): string {
	return `chat-${profile}-${jobId}`;
}

// ============================================================
// xAI — shared transport
// ============================================================

const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_MODEL = 'grok-4.5';

// Netlify synchronous functions are capped at roughly 10s of wall clock;
// past that the platform kills the function outright and the client just
// sees a dead connection. Abort our own upstream call comfortably below
// that ceiling so a slow xAI response fails on our own terms -- a real
// 'timeout' FailResult -- instead of being killed mid-flight with nothing.
export const XAI_TIMEOUT_MS = 8_000;
// Background functions (drill + chat) run on Netlify's background-function
// budget (~15 minutes), not the ~10s synchronous limit -- reasoning_effort
// 'high' there is exactly why they can afford to wait longer. Still bounded,
// just not bounded by the synchronous-path number.
export const XAI_BACKGROUND_TIMEOUT_MS = 60_000;
const MAX_CHAT_MESSAGES = 12;
// The ceiling on CLIENT-supplied content per chat request: user/assistant
// message text, plus (leg 2 only) the tool-call arguments strings we are
// echoing back and the toolResults[].detail strings. Deliberately excludes
// our OWN system prompt and context message -- see ABSOLUTE_MAX_OUTBOUND_CHARS
// below for the cap that covers those. Sized for: ~4000 for messages (matches
// capHistory MAX_CONTENT_CHARS in src/lib/kuromi/history.ts, which must stay
// under this number) + ~6000 headroom for a large create_page tool-call
// argument payload + ~2000 for tool-result detail strings, plus slack.
export const MAX_CLIENT_CONTENT_CHARS = 12000;

// A cost backstop on the TOTAL outbound request (system prompt + context +
// client content), so growing the persona prompt can never silently make
// spend unbounded the way the old flat 8000-char budget did. This is checked
// IN ADDITION to MAX_CLIENT_CONTENT_CHARS, not instead of it.
export const ABSOLUTE_MAX_OUTBOUND_CHARS = 24000;

export type FailResult = {
	ok: false;
	status: number;
	code: ErrorCode;
	error: string;
};

export type ChatMessage = { role: string; content: string };

/** Strict JSON-schema response_format for drill generation (verified live). */
export const DRILL_RESPONSE_FORMAT = {
	type: 'json_schema',
	json_schema: {
		name: 'drill_set',
		strict: true,
		schema: {
			type: 'object',
			additionalProperties: false,
			required: ['title', 'intro_quip', 'questions'],
			properties: {
				title: { type: 'string' },
				intro_quip: { type: 'string' },
				questions: {
					type: 'array',
					items: {
						type: 'object',
						additionalProperties: false,
						required: ['type', 'prompt', 'options', 'answer', 'explanation_quip'],
						properties: {
							type: { type: 'string', enum: ['mcq', 'recall'] },
							prompt: { type: 'string' },
							options: { type: 'array', items: { type: 'string' } },
							answer: { type: 'string' },
							explanation_quip: { type: 'string' }
						}
					}
				}
			}
		}
	}
} as const;

function getApiKey(): string | undefined {
	return process.env.XAI_API_KEY;
}

function snippet(text: string, max = 200): string {
	const t = text.replace(/\s+/g, ' ').trim();
	return t.length <= max ? t : t.slice(0, max) + '…';
}

async function postXai(
	body: Record<string, unknown>,
	timeoutMs: number = XAI_TIMEOUT_MS
): Promise<{ ok: true; data: unknown } | FailResult> {
	const apiKey = getApiKey();
	if (!apiKey) {
		return {
			ok: false,
			status: 500,
			code: 'not_configured',
			error: 'XAI_API_KEY not configured on server'
		};
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		let res: Response;
		try {
			res = await fetch(XAI_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body),
				signal: controller.signal
			});
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				console.error('[kuromi] xAI fetch timed out after', timeoutMs, 'ms');
				return {
					ok: false,
					status: 504,
					code: 'timeout',
					error: 'Upstream request timed out'
				};
			}
			const msg = err instanceof Error ? err.message : 'network error';
			console.error('[kuromi] xAI fetch failed:', snippet(msg, 120));
			return {
				ok: false,
				status: 502,
				code: 'upstream',
				error: 'Upstream request failed'
			};
		}

		if (!res.ok) {
			let bodyText: string;
			try {
				bodyText = await res.text();
			} catch {
				bodyText = '';
			}
			console.error(`[kuromi] xAI HTTP ${res.status}:`, snippet(bodyText, 160));
			return {
				ok: false,
				status: 502,
				code: 'upstream',
				error: 'Upstream returned an error'
			};
		}

		let data: unknown;
		try {
			data = await res.json();
		} catch {
			console.error('[kuromi] xAI response was not JSON');
			return {
				ok: false,
				status: 502,
				code: 'upstream',
				error: 'Upstream returned unreadable response'
			};
		}

		return { ok: true, data };
	} finally {
		clearTimeout(timer);
	}
}

function extractContent(data: unknown): string | null {
	if (data === null || typeof data !== 'object') return null;
	const choices = (data as { choices?: unknown }).choices;
	if (!Array.isArray(choices) || choices.length === 0) return null;
	const first = choices[0];
	if (first === null || typeof first !== 'object') return null;
	const message = (first as { message?: unknown }).message;
	if (message === null || typeof message !== 'object') return null;
	const content = (message as { content?: unknown }).content;
	if (typeof content !== 'string') return null;
	return content;
}

// ============================================================
// KUROMI TOOLS (xAI function-calling schema — hints only)
// ============================================================

const KUROMI_TOOL_NAMES = new Set([
	'add_notebook_entry',
	'suggest_drill',
	'save_coach_note',
	'create_page',
	'update_page',
	'archive_page',
	// Not offered in KUROMI_TOOLS. Kept so an in-flight leg 2 from an older
	// client still names a known tool. The model is not given these schemas.
	'update_config',
	'award_lp',
	'forgive_streak'
]);

export const KUROMI_TOOLS = [
	{
		type: 'function',
		function: {
			name: 'add_notebook_entry',
			description:
				'Save a word or sentence Domi is discussing. kind is word or sentence. quote is the text she marked. note is her own line. The notebook is not stored in this build: if the app rejects the call, say so and do not pretend it was kept.',
			strict: true,
			parameters: {
				type: 'object',
				additionalProperties: false,
				required: ['kind', 'quote', 'note'],
				properties: {
					kind: {
						type: 'string',
						description: 'word or sentence.'
					},
					quote: {
						type: 'string',
						description: 'The word or sentence from the passage.'
					},
					note: {
						type: 'string',
						description: 'Her note, or a short gloss she asked you to keep.'
					}
				}
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'suggest_drill',
			description:
				'Open a drill. Send a question type or a trap, and leave the other one as an empty string. This opens /cards?qtype= or /cards?trap=. Do not invent an exam question.',
			strict: true,
			parameters: {
				type: 'object',
				additionalProperties: false,
				required: ['qtype', 'trap'],
				properties: {
					qtype: {
						type: 'string',
						description:
							'A question type id such as detail or doel-tekst, or an empty string when trap is set.'
					},
					trap: {
						type: 'string',
						description: 'A trap id such as echo, or an empty string when qtype is set.'
					}
				}
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'save_coach_note',
			description:
				"Save one line on the readiness screen, labelled Kuromi's note this week. One short line. Do not invent a plan.",
			strict: true,
			parameters: {
				type: 'object',
				additionalProperties: false,
				required: ['text'],
				properties: {
					text: {
						type: 'string',
						description: "The one line shown as Kuromi's note this week."
					}
				}
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'create_page',
			description:
				"Build a note page on Domi's shelf. A page is a title, optional quip and labels, and an ordered stack of blocks (grammar-card, vocab-set, drill, read, note). You write the teaching inside those blocks only. Layout, HTML and markup do not survive. Say what you made.",
			strict: true,
			parameters: {
				type: 'object',
				additionalProperties: false,
				required: ['title', 'quip', 'labels', 'blocks', 'reason'],
				properties: {
					title: {
						type: 'string',
						description: 'Page title — what she will spot on the shelf.'
					},
					quip: {
						type: ['string', 'null'],
						description: 'Optional one-line quip in your voice under the title.'
					},
					labels: {
						type: ['array', 'null'],
						maxItems: 6,
						items: { type: 'string' },
						description:
							'A few findability tags (grammar, vocab, phrases, listening, review, challenge, or a topic you invent). Not a hoard — max 6.'
					},
					blocks: {
						type: 'array',
						minItems: 1,
						maxItems: 20,
						description:
							'Ordered teaching blocks. Non-empty, max 20. Pick the block that fits; do not invent new block types.',
						items: {
							anyOf: [
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'formula', 'formulaTone', 'example', 'trap'],
									properties: {
										type: {
											type: 'string',
											enum: ['grammar-card'],
											description:
												'Reach for this when she needs a pattern spelled out — formula beads, a worked example, maybe a trap.'
										},
										title: {
											type: 'string',
											description: 'Name of the pattern / card.'
										},
										formula: {
											type: 'array',
											minItems: 1,
											description: 'Ordered beads that make up the pattern. Non-empty.',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['text', 'variant'],
												properties: {
													text: {
														type: 'string',
														description:
															'One bead of the formula — a word, particle, or slot she should notice.'
													},
													variant: {
														type: ['string', 'null'],
														enum: ['default', 'verb', 'subject', 'ghost', null],
														description:
															"'verb'/'subject' highlight the juicy bits; 'ghost' is the optional slot; 'default' is plain."
													}
												}
											}
										},
										formulaTone: {
											type: ['string', 'null'],
											enum: ['rose', 'lavender', 'teal', 'peach', null],
											description: 'Optional color mood for the formula bar.'
										},
										example: {
											type: 'object',
											additionalProperties: false,
											required: ['nl', 'en'],
											description: 'One worked nl/en example of the pattern in the wild.',
											properties: {
												nl: { type: 'string', description: 'Dutch side of the pair.' },
												en: { type: 'string', description: 'English side of the pair.' }
											}
										},
										trap: {
											type: ['object', 'null'],
											additionalProperties: false,
											required: ['title', 'body', 'variant'],
											description:
												'Optional tip/trap sticker when the gotcha is worth calling out.',
											properties: {
												title: {
													type: 'string',
													description: 'Short label for the tip/trap sticker.'
												},
												body: {
													type: 'string',
													description: 'The actual gotcha or tip text.'
												},
												variant: {
													type: ['string', 'null'],
													enum: ['tip', 'trap', null],
													description:
														"'trap' for classic gotchas; 'tip' when you're being helpful under protest."
												}
											}
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'wordIds', 'custom'],
									properties: {
										type: {
											type: 'string',
											enum: ['vocab-set'],
											description:
												'A pile of words/phrases to learn. Use when the page is about vocabulary, not a full pattern.'
										},
										title: {
											type: ['string', 'null'],
											description: 'Optional heading for the set.'
										},
										wordIds: {
											type: ['array', 'null'],
											items: { type: 'string' },
											description:
												'IDs of existing content words to pull in. At least one of wordIds or custom must end up non-empty.'
										},
										custom: {
											type: ['array', 'null'],
											description:
												'Fresh nl/en pairs you invent on the spot. At least one of wordIds or custom must end up non-empty.',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['nl', 'en'],
												properties: {
													nl: {
														type: 'string',
														description: 'Dutch side of the pair.'
													},
													en: {
														type: 'string',
														description: 'English side of the pair.'
													}
												}
											}
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'intro_quip', 'questions'],
									properties: {
										type: {
											type: 'string',
											enum: ['drill'],
											description:
												'A replayable quiz block. Use when she should practice, not just read — keep it tight.'
										},
										title: {
											type: 'string',
											description: 'Name of the drill.'
										},
										intro_quip: {
											type: 'string',
											description: 'Your opening jab before the questions — in character, short.'
										},
										questions: {
											type: 'array',
											minItems: 1,
											maxItems: 10,
											description: 'Non-empty, max 10 questions.',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['type', 'prompt', 'options', 'answer', 'explanation_quip'],
												properties: {
													type: {
														type: 'string',
														enum: ['mcq', 'recall'],
														description:
															"'mcq' for pick-one; 'recall' when she should produce the answer herself."
													},
													prompt: {
														type: 'string',
														description: 'The question she sees.'
													},
													options: {
														type: 'array',
														items: { type: 'string' },
														description:
															'Answer choices. For mcq: at least two, and answer must be one of them. For recall: usually empty.'
													},
													answer: {
														type: 'string',
														description: 'The correct answer (must match an option for mcq).'
													},
													explanation_quip: {
														type: ['string', 'null'],
														description:
															'Optional one-liner in your voice after she answers. Skip it if you have nothing snappy.'
													}
												}
											}
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'nl', 'en'],
									properties: {
										type: {
											type: 'string',
											enum: ['read'],
											description:
												'A short bilingual passage. Use for reading practice — a paragraph she can work through, not a novel.'
										},
										title: {
											type: ['string', 'null'],
											description: 'Optional heading for the passage.'
										},
										nl: { type: 'string', description: 'Dutch text.' },
										en: {
											type: 'string',
											description: 'English translation.'
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'body'],
									properties: {
										type: {
											type: 'string',
											enum: ['note'],
											description:
												'A freeform note in your voice. Use for asides, pep talks, or warnings that do not fit a card.'
										},
										body: {
											type: 'string',
											description: 'The note body — plain text, your voice.'
										}
									}
								}
							]
						}
					},
					reason: {
						type: 'string',
						description: 'Why you are building this page for her (favor / deal framing).'
					}
				}
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'update_page',
			description:
				'Edit an existing shelf page by id. Every editable field is always in the call — send JSON null for title, labels, or blocks to leave that field unchanged. A null for blocks leaves her existing stack completely untouched; it does not clear the page. You still cannot set id/createdAt/updatedAt — those stay server-side. Say what you changed afterward.',
			strict: true,
			parameters: {
				type: 'object',
				additionalProperties: false,
				required: ['id', 'title', 'labels', 'blocks', 'reason'],
				properties: {
					id: {
						type: 'string',
						description: 'Id of the page to change.'
					},
					title: {
						type: ['string', 'null'],
						description:
							'New title if you are renaming the page. Send JSON null to leave the title unchanged.'
					},
					labels: {
						type: ['array', 'null'],
						maxItems: 6,
						items: { type: 'string' },
						description: 'Replacement label list (max 6). Send JSON null to leave labels unchanged.'
					},
					blocks: {
						type: ['array', 'null'],
						maxItems: 20,
						description:
							'Replacement block stack (max 20). Send JSON null and the existing block stack stays completely untouched — that is the only way to leave blocks alone. Send an array and it REPLACES the entire stack, all of it, not a merge. Never invent, guess, or reconstruct blocks you were not actually given or that you did not just compose yourself — a replacement array must be real content, not a hallucinated approximation of what might have been there. Getting this wrong wipes her real work. If you are not rewriting the blocks, send null.',
						items: {
							anyOf: [
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'formula', 'formulaTone', 'example', 'trap'],
									properties: {
										type: {
											type: 'string',
											enum: ['grammar-card'],
											description:
												'Reach for this when she needs a pattern spelled out — formula beads, a worked example, maybe a trap.'
										},
										title: {
											type: 'string',
											description: 'Name of the pattern / card.'
										},
										formula: {
											type: 'array',
											minItems: 1,
											description: 'Ordered beads that make up the pattern. Non-empty.',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['text', 'variant'],
												properties: {
													text: {
														type: 'string',
														description:
															'One bead of the formula — a word, particle, or slot she should notice.'
													},
													variant: {
														type: ['string', 'null'],
														enum: ['default', 'verb', 'subject', 'ghost', null],
														description:
															"'verb'/'subject' highlight the juicy bits; 'ghost' is the optional slot; 'default' is plain."
													}
												}
											}
										},
										formulaTone: {
											type: ['string', 'null'],
											enum: ['rose', 'lavender', 'teal', 'peach', null],
											description: 'Optional color mood for the formula bar.'
										},
										example: {
											type: 'object',
											additionalProperties: false,
											required: ['nl', 'en'],
											description: 'One worked nl/en example of the pattern in the wild.',
											properties: {
												nl: { type: 'string', description: 'Dutch side of the pair.' },
												en: { type: 'string', description: 'English side of the pair.' }
											}
										},
										trap: {
											type: ['object', 'null'],
											additionalProperties: false,
											required: ['title', 'body', 'variant'],
											description:
												'Optional tip/trap sticker when the gotcha is worth calling out.',
											properties: {
												title: {
													type: 'string',
													description: 'Short label for the tip/trap sticker.'
												},
												body: {
													type: 'string',
													description: 'The actual gotcha or tip text.'
												},
												variant: {
													type: ['string', 'null'],
													enum: ['tip', 'trap', null],
													description:
														"'trap' for classic gotchas; 'tip' when you're being helpful under protest."
												}
											}
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'wordIds', 'custom'],
									properties: {
										type: {
											type: 'string',
											enum: ['vocab-set'],
											description:
												'A pile of words/phrases to learn. Use when the page is about vocabulary, not a full pattern.'
										},
										title: {
											type: ['string', 'null'],
											description: 'Optional heading for the set.'
										},
										wordIds: {
											type: ['array', 'null'],
											items: { type: 'string' },
											description:
												'IDs of existing content words to pull in. At least one of wordIds or custom must end up non-empty.'
										},
										custom: {
											type: ['array', 'null'],
											description:
												'Fresh nl/en pairs you invent on the spot. At least one of wordIds or custom must end up non-empty.',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['nl', 'en'],
												properties: {
													nl: {
														type: 'string',
														description: 'Dutch side of the pair.'
													},
													en: {
														type: 'string',
														description: 'English side of the pair.'
													}
												}
											}
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'intro_quip', 'questions'],
									properties: {
										type: {
											type: 'string',
											enum: ['drill'],
											description:
												'A replayable quiz block. Use when she should practice, not just read — keep it tight.'
										},
										title: {
											type: 'string',
											description: 'Name of the drill.'
										},
										intro_quip: {
											type: 'string',
											description: 'Your opening jab before the questions — in character, short.'
										},
										questions: {
											type: 'array',
											minItems: 1,
											maxItems: 10,
											description: 'Non-empty, max 10 questions.',
											items: {
												type: 'object',
												additionalProperties: false,
												required: ['type', 'prompt', 'options', 'answer', 'explanation_quip'],
												properties: {
													type: {
														type: 'string',
														enum: ['mcq', 'recall'],
														description:
															"'mcq' for pick-one; 'recall' when she should produce the answer herself."
													},
													prompt: {
														type: 'string',
														description: 'The question she sees.'
													},
													options: {
														type: 'array',
														items: { type: 'string' },
														description:
															'Answer choices. For mcq: at least two, and answer must be one of them. For recall: usually empty.'
													},
													answer: {
														type: 'string',
														description: 'The correct answer (must match an option for mcq).'
													},
													explanation_quip: {
														type: ['string', 'null'],
														description:
															'Optional one-liner in your voice after she answers. Skip it if you have nothing snappy.'
													}
												}
											}
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'title', 'nl', 'en'],
									properties: {
										type: {
											type: 'string',
											enum: ['read'],
											description:
												'A short bilingual passage. Use for reading practice — a paragraph she can work through, not a novel.'
										},
										title: {
											type: ['string', 'null'],
											description: 'Optional heading for the passage.'
										},
										nl: { type: 'string', description: 'Dutch text.' },
										en: {
											type: 'string',
											description: 'English translation.'
										}
									}
								},
								{
									type: 'object',
									additionalProperties: false,
									required: ['type', 'body'],
									properties: {
										type: {
											type: 'string',
											enum: ['note'],
											description:
												'A freeform note in your voice. Use for asides, pep talks, or warnings that do not fit a card.'
										},
										body: {
											type: 'string',
											description: 'The note body — plain text, your voice.'
										}
									}
								}
							]
						}
					},
					reason: {
						type: 'string',
						description: 'Why you are rewriting this page (favor / deal framing).'
					}
				}
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'archive_page',
			description:
				'Archive a shelf page by id. Archiving hides it behind a filter — it does not destroy it, and you cannot destroy anything of hers. There is no unarchive tool; putting a page back is her call, not yours. Say what you archived and why.',
			parameters: {
				type: 'object',
				additionalProperties: false,
				required: ['id', 'reason'],
				properties: {
					id: {
						type: 'string',
						description: 'Id of the page to archive.'
					},
					reason: {
						type: 'string',
						description: 'Why you are shelving this one out of sight (in character).'
					}
				}
			}
		}
	}
] as const;

// ============================================================
// CHAT CALL
// ============================================================

export type KuromiToolCall = { id: string; name: string; arguments: string };

export type ChatOk = { ok: true; reply: string; toolCalls?: KuromiToolCall[] };
export type ChatResult = ChatOk | FailResult;

/** Outbound chat message payload (may include tool_calls / tool_call_id). */
type OutboundMessage = {
	role: string;
	content: string;
	tool_calls?: Array<{
		id: string;
		type: 'function';
		function: { name: string; arguments: string };
	}>;
	tool_call_id?: string;
};

type PendingToolCall = { id: string; name: string; arguments: string };
type ToolResult = { id: string; outcome: 'applied' | 'capped' | 'rejected'; detail: string };

function extractToolCalls(data: unknown): KuromiToolCall[] {
	if (data === null || typeof data !== 'object') return [];
	const choices = (data as { choices?: unknown }).choices;
	if (!Array.isArray(choices) || choices.length === 0) return [];
	const first = choices[0];
	if (first === null || typeof first !== 'object') return [];
	const message = (first as { message?: unknown }).message;
	if (message === null || typeof message !== 'object') return [];
	const raw = (message as { tool_calls?: unknown }).tool_calls;
	if (!Array.isArray(raw)) return [];

	const out: KuromiToolCall[] = [];
	for (const entry of raw) {
		if (entry === null || typeof entry !== 'object') continue;
		const id = (entry as { id?: unknown }).id;
		const fn = (entry as { function?: unknown }).function;
		if (typeof id !== 'string') continue;
		if (fn === null || typeof fn !== 'object') continue;
		const name = (fn as { name?: unknown }).name;
		const args = (fn as { arguments?: unknown }).arguments;
		if (typeof name !== 'string' || typeof args !== 'string') continue;
		out.push({ id, name, arguments: args });
	}
	return out;
}

/** Character budget: content length + tool-call argument strings. */
function outboundCharCount(messages: OutboundMessage[]): number {
	let total = 0;
	for (const m of messages) {
		total += typeof m.content === 'string' ? m.content.length : 0;
		if (Array.isArray(m.tool_calls)) {
			for (const tc of m.tool_calls) {
				const args = tc?.function?.arguments;
				if (typeof args === 'string') total += args.length;
			}
		}
	}
	return total;
}

/**
 * Same budget as outboundCharCount, but excludes our own system messages
 * (persona prompt and context wrapper). This is what MAX_CLIENT_CONTENT_CHARS bounds.
 */
function clientContentCharCount(messages: OutboundMessage[]): number {
	return outboundCharCount(messages.filter((m) => m.role !== 'system'));
}

function validateChatMessages(messages: unknown): { ok: true; capped: ChatMessage[] } | FailResult {
	if (!Array.isArray(messages)) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'messages must be an array'
		};
	}

	const validated: ChatMessage[] = [];
	for (let i = 0; i < messages.length; i++) {
		const m = messages[i];
		if (m === null || typeof m !== 'object' || Array.isArray(m)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `messages[${i}] must be an object with role and content`
			};
		}
		const role = (m as { role?: unknown }).role;
		const content = (m as { content?: unknown }).content;
		if (role !== 'user' && role !== 'assistant') {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `messages[${i}].role must be "user" or "assistant"`
			};
		}
		if (typeof content !== 'string') {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `messages[${i}].content must be a string`
			};
		}
		validated.push({ role, content });
	}

	const capped =
		validated.length > MAX_CHAT_MESSAGES
			? validated.slice(validated.length - MAX_CHAT_MESSAGES)
			: validated;

	return { ok: true, capped };
}

function contextSystemMessage(context: unknown): ChatMessage {
	const contextText =
		context === undefined || context === null
			? 'Session context: (none)'
			: `Session context: ${JSON.stringify(context)}`;
	return { role: 'system', content: contextText };
}

function validateLeg2Payload(
	pendingToolCalls: unknown,
	toolResults: unknown
): { ok: true; pending: PendingToolCall[]; results: ToolResult[] } | FailResult {
	if (!Array.isArray(pendingToolCalls) || pendingToolCalls.length === 0) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'pendingToolCalls must be a non-empty array of tool calls'
		};
	}

	const pending: PendingToolCall[] = [];
	const pendingIds = new Set<string>();
	for (let i = 0; i < pendingToolCalls.length; i++) {
		const entry = pendingToolCalls[i];
		if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `pendingToolCalls[${i}] must be an object with id, name, and arguments`
			};
		}
		const id = (entry as { id?: unknown }).id;
		const name = (entry as { name?: unknown }).name;
		const args = (entry as { arguments?: unknown }).arguments;
		if (typeof id !== 'string' || typeof name !== 'string' || typeof args !== 'string') {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `pendingToolCalls[${i}] must have string id, name, and arguments`
			};
		}
		if (!KUROMI_TOOL_NAMES.has(name)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `pendingToolCalls[${i}].name is not a known tool`
			};
		}
		if (pendingIds.has(id)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: 'pendingToolCalls must not contain duplicate ids'
			};
		}
		pendingIds.add(id);
		pending.push({ id, name, arguments: args });
	}

	if (!Array.isArray(toolResults)) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'toolResults must be an array'
		};
	}

	const results: ToolResult[] = [];
	const resultIds = new Set<string>();
	const validOutcomes = new Set(['applied', 'capped', 'rejected']);
	for (let i = 0; i < toolResults.length; i++) {
		const entry = toolResults[i];
		if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `toolResults[${i}] must be an object with id, outcome, and detail`
			};
		}
		const id = (entry as { id?: unknown }).id;
		const outcome = (entry as { outcome?: unknown }).outcome;
		const detail = (entry as { detail?: unknown }).detail;
		if (typeof id !== 'string') {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `toolResults[${i}].id must be a string`
			};
		}
		if (typeof outcome !== 'string' || !validOutcomes.has(outcome)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `toolResults[${i}].outcome must be applied, capped, or rejected`
			};
		}
		if (typeof detail !== 'string') {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `toolResults[${i}].detail must be a string`
			};
		}
		if (detail.length > 400) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: `toolResults[${i}].detail must be at most 400 characters`
			};
		}
		if (resultIds.has(id)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: 'toolResults must not contain duplicate ids'
			};
		}
		resultIds.add(id);
		results.push({
			id,
			outcome: outcome as ToolResult['outcome'],
			detail
		});
	}

	// 1:1 id match — every pending has exactly one result and vice versa
	if (pendingIds.size !== resultIds.size) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'pendingToolCalls and toolResults must match 1:1 by id'
		};
	}
	for (const id of pendingIds) {
		if (!resultIds.has(id)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: 'pendingToolCalls and toolResults must match 1:1 by id'
			};
		}
	}
	for (const id of resultIds) {
		if (!pendingIds.has(id)) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: 'pendingToolCalls and toolResults must match 1:1 by id'
			};
		}
	}

	return { ok: true, pending, results };
}

/**
 * Call xAI for a chat reply (leg 1) or outcome narration (leg 2).
 * Validates messages shape, caps to last 12 turns, enforces a two-tier budget:
 * MAX_CLIENT_CONTENT_CHARS on client-supplied content, plus
 * ABSOLUTE_MAX_OUTBOUND_CHARS as a total-request cost backstop.
 * Leg 2: when both pendingToolCalls and toolResults are provided, reconstructs
 * the tool conversation and calls with tools + tool_choice:'none'.
 * timeoutMs defaults to the 8s synchronous abort; background callers pass
 * XAI_BACKGROUND_TIMEOUT_MS.
 */
export async function callXaiChat(
	messages: unknown,
	context: unknown,
	pendingToolCalls?: unknown,
	toolResults?: unknown,
	timeoutMs: number = XAI_TIMEOUT_MS
): Promise<ChatResult> {
	// Partial leg-2 payloads must fail loudly — never fall through to leg 1.
	// By the time pendingToolCalls is sent, the client executor has already
	// applied the change; treating a missing toolResults as ordinary chat
	// would let the model re-propose an action that already happened.
	const pendingDefined = pendingToolCalls !== undefined;
	const resultsDefined = toolResults !== undefined;
	if (pendingDefined !== resultsDefined) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: pendingDefined
				? 'toolResults is required when pendingToolCalls is present'
				: 'pendingToolCalls is required when toolResults is present'
		};
	}

	const isLeg2 = pendingDefined && resultsDefined;

	const validated = validateChatMessages(messages);
	if (!validated.ok) return validated;
	const { capped } = validated;

	const baseOutbound: OutboundMessage[] = [
		{ role: 'system', content: KUROMI_CHAT_SYSTEM_PROMPT },
		contextSystemMessage(context),
		...capped
	];

	if (isLeg2) {
		const leg2 = validateLeg2Payload(pendingToolCalls, toolResults);
		if (!leg2.ok) return leg2;

		const assistantToolMsg: OutboundMessage = {
			role: 'assistant',
			content: '',
			tool_calls: leg2.pending.map((tc) => ({
				id: tc.id,
				type: 'function' as const,
				function: { name: tc.name, arguments: tc.arguments }
			}))
		};

		// Match results to pending order by id for stable tool-message sequence
		const resultById = new Map(leg2.results.map((r) => [r.id, r]));
		const toolMessages: OutboundMessage[] = leg2.pending.map((tc) => {
			const r = resultById.get(tc.id)!;
			return {
				role: 'tool',
				tool_call_id: tc.id,
				content: JSON.stringify({ outcome: r.outcome, detail: r.detail })
			};
		});

		const outbound: OutboundMessage[] = [...baseOutbound, assistantToolMsg, ...toolMessages];

		if (clientContentCharCount(outbound) > MAX_CLIENT_CONTENT_CHARS) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: 'messages exceed maximum content length'
			};
		}
		if (outboundCharCount(outbound) > ABSOLUTE_MAX_OUTBOUND_CHARS) {
			return {
				ok: false,
				status: 400,
				code: 'bad_request',
				error: 'request exceeds maximum total content length'
			};
		}

		const result = await postXai(
			{
				model: XAI_MODEL,
				reasoning_effort: 'low',
				messages: outbound,
				tools: KUROMI_TOOLS,
				tool_choice: 'none'
			},
			timeoutMs
		);
		if (!result.ok) return result;

		// Leg 2: require text content; ignore any stray tool_calls
		const content = extractContent(result.data);
		if (content === null) {
			console.error('[kuromi] xAI chat leg-2 response missing choices[0].message.content');
			return {
				ok: false,
				status: 502,
				code: 'upstream',
				error: 'Upstream returned an unexpected shape'
			};
		}

		return { ok: true, reply: content };
	}

	// --- Leg 1 ---
	if (clientContentCharCount(baseOutbound) > MAX_CLIENT_CONTENT_CHARS) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'messages exceed maximum content length'
		};
	}
	if (outboundCharCount(baseOutbound) > ABSOLUTE_MAX_OUTBOUND_CHARS) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'request exceeds maximum total content length'
		};
	}

	// reasoning_effort 'high' is load-bearing for grok-4.5: with 'low' it
	// tends to narrate instead of actually calling tools (create_page and
	// friends). 'high' was reverted to 'low' only because generating large
	// tool-call arguments blew the 8s synchronous abort (XAI_TIMEOUT_MS)
	// under Netlify's ~10s kill. The real fix is the background-function
	// pattern (like drills) -- which this now uses via timeoutMs -- so
	// 'high' is restored. The remaining synchronous mode "chat" still
	// defaults to the 8s abort unless the caller passes a longer timeoutMs.
	const result = await postXai(
		{
			model: XAI_MODEL,
			reasoning_effort: 'high',
			messages: baseOutbound,
			tools: KUROMI_TOOLS,
			tool_choice: 'auto'
		},
		timeoutMs
	);
	if (!result.ok) return result;

	const content = extractContent(result.data);
	const toolCalls = extractToolCalls(result.data);

	if (content === null && toolCalls.length === 0) {
		console.error('[kuromi] xAI chat response missing choices[0].message.content');
		return {
			ok: false,
			status: 502,
			code: 'upstream',
			error: 'Upstream returned an unexpected shape'
		};
	}

	const reply = content ?? '';
	if (toolCalls.length > 0) {
		return { ok: true, reply, toolCalls };
	}
	return { ok: true, reply };
}

// ============================================================
// DRILL CALL
// ============================================================

export type DrillOk = { ok: true; raw: unknown; count: number };
export type DrillResult = DrillOk | FailResult;

export function clampDrillCount(raw: unknown): number {
	const n = typeof raw === 'number' ? raw : Number(raw);
	if (!Number.isFinite(n)) return 1;
	return Math.min(10, Math.max(1, Math.floor(n)));
}

const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

/**
 * Call xAI for a drill set (JSON schema mode).
 * Clamps count to 1–10. Rejects unknown difficulty.
 */
export async function callXaiDrill(
	topic: unknown,
	count: unknown,
	difficulty: unknown
): Promise<DrillResult> {
	if (typeof topic !== 'string' || topic.trim().length === 0) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'topic must be a non-empty string'
		};
	}
	if (typeof difficulty !== 'string' || !DIFFICULTIES.has(difficulty)) {
		return {
			ok: false,
			status: 400,
			code: 'bad_request',
			error: 'difficulty must be easy, medium, or hard'
		};
	}

	const clamped = clampDrillCount(count);
	const userMsg =
		`Topic: ${topic.trim()}. Difficulty: ${difficulty}. ` +
		`Generate exactly ${clamped} questions.`;

	// Background function: 60s budget, not the ~10s synchronous limit, so the
	// 'high' reasoning effort above can run its full course.
	const result = await postXai(
		{
			model: XAI_MODEL,
			reasoning_effort: 'high',
			messages: [
				{ role: 'system', content: KUROMI_DRILL_SYSTEM_PROMPT },
				{ role: 'user', content: userMsg }
			],
			response_format: DRILL_RESPONSE_FORMAT
		},
		XAI_BACKGROUND_TIMEOUT_MS
	);
	if (!result.ok) return result;

	const content = extractContent(result.data);
	if (content === null) {
		console.error('[kuromi] xAI drill response missing choices[0].message.content');
		return {
			ok: false,
			status: 502,
			code: 'upstream',
			error: 'Upstream returned an unexpected shape'
		};
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		console.error('[kuromi] xAI drill content was not valid JSON');
		return {
			ok: false,
			status: 502,
			code: 'upstream',
			error: 'Upstream returned unparseable drill JSON'
		};
	}

	return { ok: true, raw: parsed, count: clamped };
}
