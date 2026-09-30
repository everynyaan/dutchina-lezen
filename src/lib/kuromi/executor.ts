// ============================================================
// KUROMI STEWARD EXECUTOR — the client-side security boundary
//
// Absolute principle: Kuromi proposes, the engine disposes.
// Tool calls arriving from the Netlify function are unfiltered
// model text. This module is the ONLY authority that decides
// what actually mutates client state.
// ============================================================

import { WORD_CATEGORIES } from '$lib/data/wordPool';
import type { LpEvent, LpResult } from '$lib/lp/lp';
import type {
	AdjustmentEntry,
	AppConfig,
	CurrentState,
	GlowRule,
	KuromiPage,
	MissionsMode,
	ProgressionDisplay,
	StewardAward,
	StreakMode
} from '$lib/state/schema';
import { GLOW_RULES } from '$lib/state/schema';
import { getISOWeekKey } from '$lib/time/week';
import {
	MAX_ACTIVE_PAGES,
	MAX_BLOCKS_PER_PAGE,
	MAX_LABEL_CHARS,
	MAX_LABELS_PER_PAGE,
	MAX_QUESTIONS_PER_DRILL,
	PAGE_QUIP_MAX,
	PAGE_TITLE_MAX,
	countActivePages,
	normalizeLabel,
	normalizeLabels,
	validateBlocks
} from './pageSchema';
import { COACH_TOOL_NAMES, executeCoachCall } from './coachTools';
import type { KuromiToolCall, StewardOutcome, StewardToolResult } from './types';

// ---- Caps (derived from homework session economics) --------------------
/** One weekly homework session: ~36 questions × 2 LP. */
export const MAX_AWARD_LP = 72;
/** Two homework sessions' worth of Kuromi awards per trailing 7-day window. */
export const MAX_WEEKLY_AWARD_LP = 144;
/** Trailing window length for the weekly award cap (7 days in ms). */
export const AWARD_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const STEWARD_TOOL_NAMES = ['update_config', 'award_lp', 'forgive_streak'] as const;
export const PAGE_TOOL_NAMES = ['create_page', 'update_page', 'archive_page'] as const;
export type StewardToolName =
	| (typeof STEWARD_TOOL_NAMES)[number]
	| (typeof PAGE_TOOL_NAMES)[number];

export const CONFIG_KEYS = [
	'progression.display',
	'streaks',
	'missions',
	'quiz.focusCategories',
	'dailyPath.order'
] as const;
export type ConfigKey = (typeof CONFIG_KEYS)[number];

/** Top-level appConfig keys, derived from CONFIG_KEYS so a new config key
	cannot be validated by the executor yet silently dropped by the host. */
export const CONFIG_TOP_LEVEL_KEYS = [
	...new Set(CONFIG_KEYS.map((k) => k.split('.')[0]))
] as readonly (keyof AppConfig)[];

const STEWARD_TOOL_SET: ReadonlySet<string> = new Set([...STEWARD_TOOL_NAMES, ...PAGE_TOOL_NAMES]);
const CONFIG_KEY_SET: ReadonlySet<string> = new Set(CONFIG_KEYS);
const PROGRESSION_DISPLAYS: ReadonlySet<string> = new Set(['score', 'collection', 'hidden']);
const STREAK_MODES: ReadonlySet<string> = new Set(['strict', 'gentle', 'off']);
const MISSIONS_MODES: ReadonlySet<string> = new Set(['on', 'off']);
const GLOW_RULE_SET: ReadonlySet<string> = new Set(GLOW_RULES);
const WORD_CATEGORY_IDS: ReadonlySet<string> = new Set(WORD_CATEGORIES.map((c) => c.id));

const DETAIL_MAX = 400;

/**
 * Host surface injected by the app (and by unit tests).
 * Keeps the boundary free of Svelte stores / localStorage.
 */
export interface StewardHost {
	getState(): CurrentState;
	applyLpEvent(event: LpEvent): LpResult;
	patchConfig(patch: Partial<AppConfig>): void;
	setStreak(practiceDays: number, lastSessionDate: string | null): void;
	appendAdjustment(entry: AdjustmentEntry): void;
	recordAward(award: StewardAward): void;
	markForgivenWeek(week: string): void;
	nowISO(): string;
	todayISO(): string;
	newId(): string;
	lpEventCounter(): number;
	/**
	 * Restore rank/tier/lp/totalLp as one atomic snapshot.
	 * Rank and tier are path-dependent on the LP event stream and must never
	 * be recomputed from totalLp alone — blind tuple restore is the only
	 * correct undo for a kuromi_award.
	 */
	restoreLpSnapshot(snapshot: { rank: number; tier: number; lp: number; totalLp: number }): void;
	/**
	 * Flip AdjustmentEntry.undone for the given id. Kept as a host method so
	 * the executor never reaches into the adjustments array by reference
	 * (the host owns persistence / reactivity).
	 */
	markAdjustmentUndone(id: string): void;
	/** Insert or replace a page by id. The executor computes the whole next page object. */
	upsertPage(page: KuromiPage): void;
	/** Remove a page entirely. ONLY used to undo a create -- never by a tool. */
	removePage(id: string): void;
}

export interface UndoHandle {
	adjustmentId: string;
	label: string;
	run(): boolean;
}

// ---- Pure decision helpers --------------------------------------------

/**
 * How much of the weekly Kuromi award allowance remains.
 *
 * IMPORTANT: every branch here errs toward LESS allowance. A cap that fails
 * open under a corrupted/adversarial input is not a cap. Synced ledger
 * entries arrive from the server / other devices without re-passing through
 * recordAward validation, so amount and `at` are sanitized here independently
 * of the sync-boundary reader.
 *
 * Fail-safe: unparseable award timestamps COUNT toward the sum so the
 * cap errs restrictive, never permissive.
 */
export function remainingWeeklyAllowance(awards: StewardAward[], nowISO: string): number {
	const nowMs = Date.parse(nowISO);
	let sum = 0;
	for (const award of awards) {
		const atMs = Date.parse(award.at);
		// Fail-safe: an award whose `at` fails to parse (NaN) COUNTS toward
		// the weekly total so the cap errs restrictive, never permissive.
		// Same when nowISO itself is unparseable — count everything.
		const countsTowardWindow =
			Number.isNaN(atMs) || Number.isNaN(nowMs) || atMs >= nowMs - AWARD_WINDOW_MS;
		// Asymmetry is deliberate: only the lower bound is enforced. A future
		// timestamp must never buy allowance (skewed clocks / multi-device
		// sync can write far-ahead `at` values), so every future-dated award
		// counts regardless of how far ahead it is — only the past is trimmed.
		if (!countsTowardWindow) continue;

		// Amount sanitize (fail-restrictive; layers on top of the `at` fail-safe):
		// non-finite → treat as consuming the FULL weekly cap; negative →
		// contribute 0 (never subtract from the running sum / inflate remaining).
		const amount = award.amount;
		if (!Number.isFinite(amount)) {
			sum += MAX_WEEKLY_AWARD_LP;
		} else if (amount >= 0) {
			sum += amount;
		}
	}
	const remaining = MAX_WEEKLY_AWARD_LP - sum;
	if (!Number.isFinite(remaining)) return 0;
	return Math.max(0, remaining);
}

/**
 * Decide the outcome and effective amount for an award_lp intent.
 * Does not coerce strings — amount must already be a finite number.
 */
export function planAward(
	requested: unknown,
	awards: StewardAward[],
	nowISO: string
): { outcome: StewardOutcome; effective: number; detail: string } {
	if (typeof requested !== 'number' || !Number.isFinite(requested)) {
		return {
			outcome: 'rejected',
			effective: 0,
			detail: clampDetail('Rejected: the award amount was unreadable.')
		};
	}
	const floored = Math.floor(requested);
	if (floored <= 0) {
		return {
			outcome: 'rejected',
			effective: 0,
			detail: clampDetail(
				'Rejected: Kuromi can never deduct LP (amount must be a positive integer).'
			)
		};
	}
	const remaining = remainingWeeklyAllowance(awards, nowISO);
	const effective = Math.min(floored, MAX_AWARD_LP, remaining);
	// Defense in depth: never surface 'applied'/'capped' with a non-finite
	// effective, even if an upstream sanitize regresses.
	if (!Number.isFinite(effective)) {
		return {
			outcome: 'rejected',
			effective: 0,
			detail: clampDetail('Rejected: the award amount could not be verified.')
		};
	}
	if (effective <= 0) {
		return {
			outcome: 'rejected',
			effective: 0,
			detail: clampDetail('Rejected: the weekly award allowance is exhausted.')
		};
	}
	if (effective < floored) {
		return {
			outcome: 'capped',
			effective,
			detail: clampDetail(`You asked for ${floored} LP; I capped it to ${effective}.`)
		};
	}
	return {
		outcome: 'applied',
		effective,
		detail: clampDetail('A little extra credit, quietly.')
	};
}

/**
 * RULE 3: every proposed tool call was dropped. The model's leg-1 text is
 * not a verified outcome — grok-4.5 often claims success for a no-op
 * (`show_stickers`, `remove_missions`, …). Always use the nothing-changed
 * fallback instead of echoing that claim.
 */
export function chooseReplyWhenPendingEmpty(_leg1Reply: string, fallback: string): string {
	return fallback;
}

/**
 * Lift an AppConfig-shaped nested patch (what session context shows the
 * model) into the dotted keys validateConfigPatch already understands.
 * Explicit dotted keys win over a sibling nested object. `null` means
 * leave unchanged (same contract as update_page).
 *
 * Never writes `__proto__` / `constructor` / `prototype` into the output
 * via nested expansion — only the three known object keys are lifted.
 */
export function flattenConfigPatch(raw: unknown): unknown {
	if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return raw;
	const obj = raw as Record<string, unknown>;
	const out: Record<string, unknown> = Object.create(null);

	if (Object.prototype.hasOwnProperty.call(obj, 'progression')) {
		const nested = obj.progression;
		if (isPlainObject(nested) && Object.prototype.hasOwnProperty.call(nested, 'display')) {
			const display = nested.display;
			if (display !== null && display !== undefined) {
				out['progression.display'] = display;
			}
		} else if (nested !== null && nested !== undefined && !isPlainObject(nested)) {
			out.progression = nested;
		}
	}
	if (Object.prototype.hasOwnProperty.call(obj, 'quiz')) {
		const nested = obj.quiz;
		if (isPlainObject(nested) && Object.prototype.hasOwnProperty.call(nested, 'focusCategories')) {
			const cats = nested.focusCategories;
			if (cats !== null && cats !== undefined) {
				out['quiz.focusCategories'] = cats;
			}
		} else if (nested !== null && nested !== undefined && !isPlainObject(nested)) {
			out.quiz = nested;
		}
	}
	if (Object.prototype.hasOwnProperty.call(obj, 'dailyPath')) {
		const nested = obj.dailyPath;
		if (isPlainObject(nested) && Object.prototype.hasOwnProperty.call(nested, 'order')) {
			const order = nested.order;
			if (order !== null && order !== undefined) {
				out['dailyPath.order'] = order;
			}
		} else if (nested !== null && nested !== undefined && !isPlainObject(nested)) {
			out.dailyPath = nested;
		}
	}

	for (const key of Object.keys(obj)) {
		if (key === 'progression' || key === 'quiz' || key === 'dailyPath') continue;
		const value = obj[key];
		if (value === null) continue;
		out[key] = value;
	}

	return out;
}

/**
 * Validate a flat dotted-key config patch from hostile model JSON.
 * Nested AppConfig-shaped objects are flattened first so a model that
 * copies session context still applies. Iterates only CONFIG_KEYS via
 * hasOwnProperty; builds accepted with a null prototype so
 * prototype-polluting keys cannot leak in.
 */
export function validateConfigPatch(raw: unknown): {
	accepted: Record<string, unknown>;
	dropped: string[];
} {
	const accepted: Record<string, unknown> = Object.create(null);
	const dropped: string[] = [];

	const flattened = flattenConfigPatch(raw);
	if (flattened === null || typeof flattened !== 'object' || Array.isArray(flattened)) {
		return { accepted, dropped };
	}

	const obj = flattened as Record<string, unknown>;

	for (const key of CONFIG_KEYS) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
		const value = obj[key];

		if (key === 'progression.display') {
			if (typeof value === 'string' && PROGRESSION_DISPLAYS.has(value)) {
				accepted[key] = value;
			} else {
				dropped.push(key);
			}
			continue;
		}
		if (key === 'streaks') {
			if (typeof value === 'string' && STREAK_MODES.has(value)) {
				accepted[key] = value;
			} else {
				dropped.push(key);
			}
			continue;
		}
		if (key === 'missions') {
			if (typeof value === 'string' && MISSIONS_MODES.has(value)) {
				accepted[key] = value;
			} else {
				dropped.push(key);
			}
			continue;
		}
		if (key === 'quiz.focusCategories') {
			if (!Array.isArray(value)) {
				dropped.push(key);
				continue;
			}
			const kept: string[] = [];
			for (const member of value) {
				if (typeof member === 'string' && WORD_CATEGORY_IDS.has(member)) {
					kept.push(member);
				}
			}
			accepted[key] = kept;
			continue;
		}
		if (key === 'dailyPath.order') {
			if (!Array.isArray(value)) {
				dropped.push(key);
				continue;
			}
			const kept: GlowRule[] = [];
			const seen = new Set<string>();
			for (const member of value) {
				if (typeof member === 'string' && GLOW_RULE_SET.has(member) && !seen.has(member)) {
					seen.add(member);
					kept.push(member as GlowRule);
				}
			}
			accepted[key] = kept;
		}
	}

	// Report unrecognized own keys so the orchestrator can name them in
	// capped/rejected detail. Never read their values into `accepted`.
	for (const key of Object.keys(obj)) {
		if (!CONFIG_KEY_SET.has(key)) {
			dropped.push(key);
		}
	}

	return { accepted, dropped };
}

// ---- Impure orchestrator ----------------------------------------------

export function executeIntents(
	calls: KuromiToolCall[],
	host: StewardHost
): {
	results: StewardToolResult[];
	undos: UndoHandle[];
	dropped: KuromiToolCall[];
	/** Leg-2-ready: exactly the calls that produced a `results` entry, 1:1 by id. */
	pendingToolCalls: KuromiToolCall[];
} {
	const results: StewardToolResult[] = [];
	const undos: UndoHandle[] = [];
	const dropped: KuromiToolCall[] = [];
	const pendingToolCalls: KuromiToolCall[] = [];

	// Snapshot the award ledger ONCE for this batch. Same-batch award_lp calls
	// share the weekly cap via this local array — no assumption that
	// host.recordAward has synchronously mutated getState().steward.awards.
	const batchAwards: StewardAward[] = [...host.getState().steward.awards];

	const seenIds = new Set<string>();

	for (const call of calls) {
		if (seenIds.has(call.id)) {
			// Duplicate call.id within this batch. Leg-2 requires pendingToolCalls
			// and toolResults to match 1:1 by id — duplicate results would 400
			// the announcement even though state mutations already landed.
			console.warn(`[kuromi steward] dropping duplicate tool call id collision id=${call.id}`);
			dropped.push(call);
			continue;
		}
		seenIds.add(call.id);

		if ((COACH_TOOL_NAMES as readonly string[]).includes(call.name)) {
			let coachParsed: unknown;
			try {
				coachParsed = JSON.parse(call.arguments);
			} catch {
				results.push({
					id: call.id,
					outcome: 'rejected',
					detail: 'Rejected: the instruction was unreadable.'
				});
				pendingToolCalls.push(call);
				continue;
			}
			results.push(executeCoachCall(call, coachParsed));
			pendingToolCalls.push(call);
			continue;
		}

		if (!STEWARD_TOOL_SET.has(call.name)) {
			// Fabricated / out-of-whitelist tool name. Segregate into `dropped`
			// so a caller building leg-2 `pendingToolCalls` includes ONLY calls
			// that have an entry in `results` — never anything from `dropped`.
			// Echoing a fabricated name back to the server would 400 the request.
			console.warn(
				`[kuromi steward] dropping fabricated tool call name=${call.name} id=${call.id}`
			);
			dropped.push(call);
			continue;
		}

		const toolName = call.name as StewardToolName;
		let parsed: unknown;
		try {
			parsed = JSON.parse(call.arguments);
		} catch {
			const detail = clampDetail('Rejected: the instruction was unreadable (malformed JSON).');
			appendRejectedUnreadable(host, toolName, detail);
			results.push({ id: call.id, outcome: 'rejected', detail });
			pendingToolCalls.push(call);
			continue;
		}

		if (toolName === 'award_lp') {
			const handled = executeAwardLp(call, parsed, host, batchAwards);
			results.push(handled.result);
			pendingToolCalls.push(call);
			if (handled.undo) undos.push(handled.undo);
			continue;
		}
		if (toolName === 'update_config') {
			const handled = executeUpdateConfig(call, parsed, host);
			results.push(handled.result);
			pendingToolCalls.push(call);
			if (handled.undo) undos.push(handled.undo);
			continue;
		}
		if (toolName === 'create_page') {
			const handled = executeCreatePage(call, parsed, host);
			results.push(handled.result);
			pendingToolCalls.push(call);
			if (handled.undo) undos.push(handled.undo);
			continue;
		}
		if (toolName === 'update_page') {
			const handled = executeUpdatePage(call, parsed, host);
			results.push(handled.result);
			pendingToolCalls.push(call);
			if (handled.undo) undos.push(handled.undo);
			continue;
		}
		if (toolName === 'archive_page') {
			const handled = executeArchivePage(call, parsed, host);
			results.push(handled.result);
			pendingToolCalls.push(call);
			if (handled.undo) undos.push(handled.undo);
			continue;
		}
		// forgive_streak
		const handled = executeForgiveStreak(call, parsed, host);
		results.push(handled.result);
		pendingToolCalls.push(call);
		if (handled.undo) undos.push(handled.undo);
	}

	return { results, undos, dropped, pendingToolCalls };
}

// ---- Per-tool handlers ------------------------------------------------

function executeAwardLp(
	call: KuromiToolCall,
	parsed: unknown,
	host: StewardHost,
	batchAwards: StewardAward[]
): { result: StewardToolResult; undo?: UndoHandle } {
	const reason = readReason(parsed);
	const amountArg =
		isPlainObject(parsed) && Object.prototype.hasOwnProperty.call(parsed, 'amount')
			? (parsed as { amount: unknown }).amount
			: undefined;

	const plan = planAward(amountArg, batchAwards, host.nowISO());
	const detail = clampDetail(plan.detail);

	if (plan.outcome === 'rejected') {
		const adjustmentId = host.newId();
		host.appendAdjustment({
			id: adjustmentId,
			timestamp: host.nowISO(),
			tool: 'award_lp',
			outcome: 'rejected',
			detail,
			reason,
			payload: { amount: plan.effective },
			undone: false
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	// Snapshot LP fields BEFORE the award mutates them.
	const stateBefore = host.getState();
	const lpSnapshot = {
		rank: stateBefore.rank,
		tier: stateBefore.tier,
		lp: stateBefore.lp,
		totalLp: stateBefore.totalLp
	};

	host.applyLpEvent({ type: 'kuromi_award', amount: plan.effective });
	// Counter is read AFTER the award event so undo fails only when a
	// *later* LP event bumps it — not because of this award itself.
	const counterAtAward = host.lpEventCounter();
	const recorded: StewardAward = {
		id: host.newId(),
		at: host.nowISO(),
		amount: plan.effective
	};
	host.recordAward(recorded);
	// Local batch ledger for same-batch cap stacking (in addition to host persistence).
	batchAwards.push(recorded);

	const adjustmentId = host.newId();
	host.appendAdjustment({
		id: adjustmentId,
		timestamp: host.nowISO(),
		tool: 'award_lp',
		outcome: plan.outcome,
		detail,
		reason,
		payload: { amount: plan.effective },
		undone: false
	});

	const undo: UndoHandle = {
		adjustmentId,
		label: "Undo Kuromi's extra credit",
		run(): boolean {
			if (host.lpEventCounter() !== counterAtAward) {
				return false;
			}
			// Restore the LP tuple. Do NOT remove the steward.awards ledger
			// entry: otherwise undo becomes a farming loop (award → undo →
			// award again, resetting the weekly cap each cycle). Undoing
			// reverses the EFFECT but never the ALLOWANCE. Deliberate.
			host.restoreLpSnapshot(lpSnapshot);
			host.markAdjustmentUndone(adjustmentId);
			return true;
		}
	};

	return {
		result: { id: call.id, outcome: plan.outcome, detail },
		undo
	};
}

function executeUpdateConfig(
	call: KuromiToolCall,
	parsed: unknown,
	host: StewardHost
): { result: StewardToolResult; undo?: UndoHandle } {
	const reason = readReason(parsed);
	const rawPatch =
		isPlainObject(parsed) && Object.prototype.hasOwnProperty.call(parsed, 'patch')
			? (parsed as { patch: unknown }).patch
			: undefined;

	const { accepted, dropped: droppedKeys } = validateConfigPatch(rawPatch);
	const acceptedKeys = Object.keys(accepted);

	if (acceptedKeys.length === 0) {
		const detail = clampDetail(
			droppedKeys.length > 0
				? `Rejected: nothing usable was in the patch (dropped: ${droppedKeys.join(', ')}).`
				: 'Rejected: nothing usable was in the patch.'
		);
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'update_config',
			outcome: 'rejected',
			detail,
			reason,
			// Spread into a genuine plain object — `accepted` is null-prototype
			// (correct for validation) but synced/persisted JSON must not be.
			payload: { ...accepted },
			undone: false
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const outcome: StewardOutcome = droppedKeys.length > 0 ? 'capped' : 'applied';
	const detail = clampDetail(
		outcome === 'capped'
			? `Applied partial config update; dropped keys: ${droppedKeys.join(', ')}.`
			: `Applied config update (${acceptedKeys.join(', ')}).`
	);

	// Snapshot prior values of ONLY the accepted dotted keys before patching.
	const configBefore = host.getState().appConfig;
	const priorFlat: Record<string, unknown> = Object.create(null);
	for (const key of acceptedKeys) {
		priorFlat[key] = readDottedConfig(configBefore, key as ConfigKey);
	}

	host.patchConfig(expandAcceptedPatch(accepted));

	// Capture post-image of ONLY the accepted keys (what we just wrote).
	const configAfter = host.getState().appConfig;
	const postFlat: Record<string, unknown> = Object.create(null);
	for (const key of acceptedKeys) {
		postFlat[key] = readDottedConfig(configAfter, key as ConfigKey);
	}

	const adjustmentId = host.newId();
	host.appendAdjustment({
		id: adjustmentId,
		timestamp: host.nowISO(),
		tool: 'update_config',
		outcome,
		detail,
		reason,
		// Spread into a genuine plain object — `accepted` is null-prototype
		// (correct for validation) but synced/persisted JSON must not be.
		payload: { ...accepted },
		undone: false
	});

	const undo: UndoHandle = {
		adjustmentId,
		label: 'Undo config change',
		run(): boolean {
			const live = host.getState().appConfig;
			for (const key of acceptedKeys) {
				const liveVal = readDottedConfig(live, key as ConfigKey);
				if (!configValuesMatch(liveVal, postFlat[key], key as ConfigKey)) {
					return false;
				}
			}
			host.patchConfig(expandAcceptedPatch(priorFlat));
			host.markAdjustmentUndone(adjustmentId);
			return true;
		}
	};

	return { result: { id: call.id, outcome, detail }, undo };
}

function executeForgiveStreak(
	call: KuromiToolCall,
	parsed: unknown,
	host: StewardHost
): { result: StewardToolResult; undo?: UndoHandle } {
	const reason = readReason(parsed);
	const state = host.getState();

	if (state.appConfig.streaks === 'off') {
		const detail = clampDetail('Rejected: streaks are off, so there is nothing to forgive.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'forgive_streak',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const thisWeek = getISOWeekKey(host.todayISO());
	if (state.steward.lastForgivenWeek === thisWeek) {
		const detail = clampDetail('Rejected: streak forgiveness was already used this week.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'forgive_streak',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const priorPracticeDays = state.practiceDays;
	const priorLastSessionDate = state.lastSessionDate;

	host.setStreak(state.practiceDays + 1, host.todayISO());
	host.markForgivenWeek(thisWeek);

	// Capture post-image by reading back from the host after the mutation.
	const after = host.getState();
	const postSnapshot = {
		practiceDays: after.practiceDays,
		lastSessionDate: after.lastSessionDate
	};

	const detail = clampDetail('Forgave one week of practice streak.');
	const adjustmentId = host.newId();
	host.appendAdjustment({
		id: adjustmentId,
		timestamp: host.nowISO(),
		tool: 'forgive_streak',
		outcome: 'applied',
		detail,
		reason,
		payload: {},
		undone: false
	});

	const undo: UndoHandle = {
		adjustmentId,
		label: 'Undo streak forgiveness',
		run(): boolean {
			const live = host.getState();
			if (
				live.practiceDays !== postSnapshot.practiceDays ||
				live.lastSessionDate !== postSnapshot.lastSessionDate
			) {
				return false;
			}
			// Restore streak numbers only. Do NOT clear steward.lastForgivenWeek:
			// otherwise undo becomes a farming loop that resets the once-per-week
			// allowance. Same deliberate rule as award undo.
			host.setStreak(priorPracticeDays, priorLastSessionDate);
			host.markAdjustmentUndone(adjustmentId);
			return true;
		}
	};

	return { result: { id: call.id, outcome: 'applied', detail }, undo };
}

function executeCreatePage(
	call: KuromiToolCall,
	parsed: unknown,
	host: StewardHost
): { result: StewardToolResult; undo?: UndoHandle } {
	const reason = readReason(parsed);

	if (!isPlainObject(parsed)) {
		const detail = clampDetail('Rejected: the instruction was unreadable.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'create_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const raw = parsed;

	if (countActivePages(host.getState().pages) >= MAX_ACTIVE_PAGES) {
		const detail = clampDetail(
			'Rejected: the shelf is full (60 active pages). Archive something first.'
		);
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'create_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	// Title is required by the create_page contract. Trim is check-only —
	// a usable title is persisted with its original spacing via clampString.
	if (typeof raw.title !== 'string' || raw.title.trim().length === 0) {
		const detail = clampDetail('Rejected: the page needs a title.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'create_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const blocksResult = validateBlocks(raw.blocks);
	if (!blocksResult.ok) {
		const detail = clampDetail(`Rejected: ${blocksResult.error}`);
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'create_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const labels = normalizeLabels(Array.isArray(raw.labels) ? raw.labels : []);
	const title = clampString(raw.title, PAGE_TITLE_MAX);
	const quip = typeof raw.quip === 'string' ? clampString(raw.quip, PAGE_QUIP_MAX) : '';

	const titleCapped = raw.title.length > PAGE_TITLE_MAX;
	const quipCapped = typeof raw.quip === 'string' && raw.quip.length > PAGE_QUIP_MAX;
	const { blocksCapped, questionsCapped } = detectBlocksCaps(raw.blocks);
	const labelsCapped = countDistinctValidLabels(raw.labels) > MAX_LABELS_PER_PAGE;
	const outcome: StewardOutcome =
		titleCapped || quipCapped || blocksCapped || questionsCapped || labelsCapped
			? 'capped'
			: 'applied';
	const detail = clampDetail(
		outcome === 'capped'
			? buildPageCapDetail('Created', {
					titleCapped,
					quipCapped,
					blocksCapped,
					questionsCapped,
					labelsCapped
				})
			: 'Created page.'
	);

	const id = host.newId();
	const createdAt = host.nowISO();
	const updatedAt = createdAt;
	const page: KuromiPage = {
		id,
		title,
		quip,
		labels,
		blocks: blocksResult.blocks,
		createdAt,
		updatedAt,
		archived: false
	};
	host.upsertPage(page);

	const adjustmentId = host.newId();
	host.appendAdjustment({
		id: adjustmentId,
		timestamp: host.nowISO(),
		tool: 'create_page',
		outcome,
		detail,
		reason,
		payload: { pageId: id },
		undone: false,
		source: 'kuromi'
	});

	const undo: UndoHandle = {
		adjustmentId,
		label: 'Undo create page',
		run(): boolean {
			const live = host.getState().pages.find((p) => p.id === id);
			if (!live || live.updatedAt !== updatedAt) {
				return false;
			}
			host.removePage(id);
			host.markAdjustmentUndone(adjustmentId);
			return true;
		}
	};

	return { result: { id: call.id, outcome, detail }, undo };
}

function executeUpdatePage(
	call: KuromiToolCall,
	parsed: unknown,
	host: StewardHost
): { result: StewardToolResult; undo?: UndoHandle } {
	const reason = readReason(parsed);

	if (!isPlainObject(parsed)) {
		const detail = clampDetail('Rejected: the instruction was unreadable.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'update_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const raw = parsed;
	if (typeof raw.id !== 'string') {
		const detail = clampDetail('Rejected: a page id is required.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'update_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const targetId = raw.id;
	const previous = host.getState().pages.find((p) => p.id === targetId);
	if (!previous) {
		const detail = clampDetail('Rejected: no such page.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'update_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: { pageId: targetId },
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	if (previous.archived === true) {
		const detail = clampDetail(
			"Rejected: that page is archived. Restoring it is Domi's call, not this tool."
		);
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'update_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: { pageId: targetId },
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	// Under strict tool schemas these keys are always present; explicit null
	// means "leave unchanged" (same as the pre-strict omit contract).
	const hasTitle = raw.title !== undefined && raw.title !== null;
	const hasLabels = raw.labels !== undefined && raw.labels !== null;
	const hasBlocks = raw.blocks !== undefined && raw.blocks !== null;

	let nextTitle = previous.title;
	let nextLabels = previous.labels;
	let nextBlocks = previous.blocks;
	let titleCapped = false;
	let labelsCapped = false;
	let blocksCapped = false;
	let questionsCapped = false;

	if (hasBlocks) {
		const blocksResult = validateBlocks(raw.blocks);
		if (!blocksResult.ok) {
			const detail = clampDetail(`Rejected: ${blocksResult.error}`);
			host.appendAdjustment({
				id: host.newId(),
				timestamp: host.nowISO(),
				tool: 'update_page',
				outcome: 'rejected',
				detail,
				reason,
				payload: { pageId: targetId },
				undone: false,
				source: 'kuromi'
			});
			return { result: { id: call.id, outcome: 'rejected', detail } };
		}
		nextBlocks = blocksResult.blocks;
		const caps = detectBlocksCaps(raw.blocks);
		blocksCapped = caps.blocksCapped;
		questionsCapped = caps.questionsCapped;
	}

	if (hasTitle) {
		// Present-but-unusable title rejects the whole update (atomic — nothing
		// else applies). Omitted title still means "leave alone".
		if (typeof raw.title !== 'string' || raw.title.trim().length === 0) {
			const detail = clampDetail('Rejected: the page needs a title.');
			host.appendAdjustment({
				id: host.newId(),
				timestamp: host.nowISO(),
				tool: 'update_page',
				outcome: 'rejected',
				detail,
				reason,
				payload: { pageId: targetId },
				undone: false,
				source: 'kuromi'
			});
			return { result: { id: call.id, outcome: 'rejected', detail } };
		}
		nextTitle = clampString(raw.title, PAGE_TITLE_MAX);
		titleCapped = raw.title.length > PAGE_TITLE_MAX;
	}

	if (hasLabels) {
		nextLabels = normalizeLabels(raw.labels);
		labelsCapped = countDistinctValidLabels(raw.labels) > MAX_LABELS_PER_PAGE;
	}

	const updatedAt = host.nowISO();
	const nextPage: KuromiPage = {
		id: previous.id,
		title: nextTitle,
		quip: previous.quip,
		labels: nextLabels,
		blocks: nextBlocks,
		createdAt: previous.createdAt,
		updatedAt,
		archived: previous.archived
	};

	const outcome: StewardOutcome =
		titleCapped || labelsCapped || blocksCapped || questionsCapped ? 'capped' : 'applied';
	const detail = clampDetail(
		outcome === 'capped'
			? buildPageCapDetail('Updated', {
					titleCapped,
					quipCapped: false,
					blocksCapped,
					questionsCapped,
					labelsCapped
				})
			: 'Updated page.'
	);

	const previousSnapshot = clonePage(previous);
	host.upsertPage(nextPage);

	const adjustmentId = host.newId();
	host.appendAdjustment({
		id: adjustmentId,
		timestamp: host.nowISO(),
		tool: 'update_page',
		outcome,
		detail,
		reason,
		payload: { pageId: previous.id },
		undone: false,
		source: 'kuromi'
	});

	const undo: UndoHandle = {
		adjustmentId,
		label: 'Undo update page',
		run(): boolean {
			const live = host.getState().pages.find((p) => p.id === previous.id);
			if (!live || live.updatedAt !== updatedAt) {
				return false;
			}
			host.upsertPage(previousSnapshot);
			host.markAdjustmentUndone(adjustmentId);
			return true;
		}
	};

	return { result: { id: call.id, outcome, detail }, undo };
}

function executeArchivePage(
	call: KuromiToolCall,
	parsed: unknown,
	host: StewardHost
): { result: StewardToolResult; undo?: UndoHandle } {
	const reason = readReason(parsed);

	if (!isPlainObject(parsed) || typeof parsed.id !== 'string') {
		const detail = clampDetail(
			!isPlainObject(parsed)
				? 'Rejected: the instruction was unreadable.'
				: 'Rejected: a page id is required.'
		);
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'archive_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: {},
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const targetId = parsed.id;
	const previous = host.getState().pages.find((p) => p.id === targetId);
	if (!previous) {
		const detail = clampDetail('Rejected: no such page.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'archive_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: { pageId: targetId },
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	if (previous.archived === true) {
		const detail = clampDetail('Rejected: already archived, nothing to do.');
		host.appendAdjustment({
			id: host.newId(),
			timestamp: host.nowISO(),
			tool: 'archive_page',
			outcome: 'rejected',
			detail,
			reason,
			payload: { pageId: targetId },
			undone: false,
			source: 'kuromi'
		});
		return { result: { id: call.id, outcome: 'rejected', detail } };
	}

	const updatedAt = host.nowISO();
	const nextPage: KuromiPage = {
		...previous,
		archived: true,
		updatedAt
	};
	host.upsertPage(nextPage);

	const detail = clampDetail('Archived page.');
	const adjustmentId = host.newId();
	host.appendAdjustment({
		id: adjustmentId,
		timestamp: host.nowISO(),
		tool: 'archive_page',
		outcome: 'applied',
		detail,
		reason,
		payload: { pageId: targetId },
		undone: false,
		source: 'kuromi'
	});

	const undo: UndoHandle = {
		adjustmentId,
		label: 'Undo archive page',
		run(): boolean {
			const live = host.getState().pages.find((p) => p.id === targetId);
			if (!live || live.updatedAt !== updatedAt) {
				return false;
			}
			host.upsertPage({
				...live,
				archived: false,
				updatedAt: host.nowISO()
			});
			host.markAdjustmentUndone(adjustmentId);
			return true;
		}
	};

	return { result: { id: call.id, outcome: 'applied', detail }, undo };
}

// ---- Helpers ----------------------------------------------------------

function clampDetail(s: string): string {
	return s.length <= DETAIL_MAX ? s : s.slice(0, DETAIL_MAX);
}

function clampString(s: string, max: number): string {
	return s.length <= max ? s : s.slice(0, max);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readReason(parsed: unknown): string {
	if (!isPlainObject(parsed)) return '';
	const reason = parsed.reason;
	// Clamp like detail — long hallucinated reasons must not bloat the
	// adjustments log / sync payload.
	return typeof reason === 'string' ? clampDetail(reason) : '';
}

function appendRejectedUnreadable(
	host: StewardHost,
	tool: StewardToolName,
	detail: string
): string {
	const id = host.newId();
	const entry: AdjustmentEntry = {
		id,
		timestamp: host.nowISO(),
		tool,
		outcome: 'rejected',
		detail,
		reason: '',
		payload: {},
		undone: false
	};
	// Page-tool adjustments always set source explicitly.
	if ((PAGE_TOOL_NAMES as readonly string[]).includes(tool)) {
		entry.source = 'kuromi';
	}
	host.appendAdjustment(entry);
	return id;
}

function countDistinctValidLabels(raw: unknown): number {
	if (!Array.isArray(raw)) return 0;
	const seen = new Set<string>();
	for (const item of raw) {
		if (typeof item !== 'string') continue;
		const normalized = normalizeLabel(item);
		if (normalized.length === 0) continue;
		seen.add(clampString(normalized, MAX_LABEL_CHARS));
	}
	return seen.size;
}

function detectBlocksCaps(rawBlocks: unknown): {
	blocksCapped: boolean;
	questionsCapped: boolean;
} {
	const list = Array.isArray(rawBlocks) ? rawBlocks : [];
	const blocksCapped = list.length > MAX_BLOCKS_PER_PAGE;
	// Mirror validateBlocks: only the first MAX_BLOCKS_PER_PAGE items are
	// persisted, so only those can contribute a questionsCapped claim.
	const persistedSlice = list.slice(0, MAX_BLOCKS_PER_PAGE);
	let questionsCapped = false;
	for (const block of persistedSlice) {
		if (
			isPlainObject(block) &&
			block.type === 'drill' &&
			Array.isArray(block.questions) &&
			block.questions.length > MAX_QUESTIONS_PER_DRILL
		) {
			questionsCapped = true;
			break;
		}
	}
	return { blocksCapped, questionsCapped };
}

function buildPageCapDetail(
	verb: 'Created' | 'Updated',
	flags: {
		titleCapped: boolean;
		quipCapped: boolean;
		blocksCapped: boolean;
		questionsCapped: boolean;
		labelsCapped: boolean;
	}
): string {
	const bits: string[] = [];
	if (flags.blocksCapped) bits.push(`blocks capped at ${MAX_BLOCKS_PER_PAGE}`);
	if (flags.questionsCapped) {
		bits.push(`one drill's questions capped at ${MAX_QUESTIONS_PER_DRILL}`);
	}
	if (flags.labelsCapped) bits.push(`labels capped at ${MAX_LABELS_PER_PAGE}`);
	if (flags.titleCapped) bits.push(`title trimmed to ${PAGE_TITLE_MAX} chars`);
	if (flags.quipCapped) bits.push(`quip trimmed to ${PAGE_QUIP_MAX} chars`);
	return `${verb}, but trimmed: ${bits.join('; ')}.`;
}

function clonePage(page: KuromiPage): KuromiPage {
	return JSON.parse(JSON.stringify(page)) as KuromiPage;
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function configValuesMatch(live: unknown, post: unknown, key: ConfigKey): boolean {
	if (key === 'quiz.focusCategories' || key === 'dailyPath.order') {
		if (!Array.isArray(live) || !Array.isArray(post)) return false;
		return arraysEqual(live, post);
	}
	return live === post;
}

function readDottedConfig(config: AppConfig, key: ConfigKey): unknown {
	switch (key) {
		case 'progression.display':
			return config.progression.display;
		case 'streaks':
			return config.streaks;
		case 'missions':
			return config.missions;
		case 'quiz.focusCategories':
			return [...config.quiz.focusCategories];
		case 'dailyPath.order':
			return [...config.dailyPath.order];
	}
}

function expandAcceptedPatch(accepted: Record<string, unknown>): Partial<AppConfig> {
	const out: Partial<AppConfig> = {};
	if (Object.prototype.hasOwnProperty.call(accepted, 'progression.display')) {
		out.progression = {
			display: accepted['progression.display'] as ProgressionDisplay
		};
	}
	if (Object.prototype.hasOwnProperty.call(accepted, 'streaks')) {
		out.streaks = accepted.streaks as StreakMode;
	}
	if (Object.prototype.hasOwnProperty.call(accepted, 'missions')) {
		out.missions = accepted.missions as MissionsMode;
	}
	if (Object.prototype.hasOwnProperty.call(accepted, 'quiz.focusCategories')) {
		out.quiz = {
			focusCategories: accepted['quiz.focusCategories'] as string[]
		};
	}
	if (Object.prototype.hasOwnProperty.call(accepted, 'dailyPath.order')) {
		out.dailyPath = {
			order: accepted['dailyPath.order'] as GlowRule[]
		};
	}
	return out;
}
