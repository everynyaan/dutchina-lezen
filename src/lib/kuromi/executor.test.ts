import { describe, it, expect, vi, afterEach } from 'vitest';
import { createDefaultState } from '$lib/state/defaults';
import type {
	AdjustmentEntry,
	AppConfig,
	CurrentState,
	KuromiPage,
	StewardAward
} from '$lib/state/schema';
import { GLOW_RULES } from '$lib/state/schema';
import type { LpEvent, LpResult } from '$lib/lp/lp';
import {
	AWARD_WINDOW_MS,
	CONFIG_KEYS,
	CONFIG_TOP_LEVEL_KEYS,
	executeIntents,
	MAX_AWARD_LP,
	MAX_WEEKLY_AWARD_LP,
	planAward,
	remainingWeeklyAllowance,
	chooseReplyWhenPendingEmpty,
	flattenConfigPatch,
	validateConfigPatch,
	type StewardHost,
	type UndoHandle
} from './executor';
import { MAX_ACTIVE_PAGES, PAGE_QUIP_MAX, PAGE_TITLE_MAX } from './pageSchema';
import type { KuromiToolCall } from './types';

// Collect every detail string produced so we can assert the 400-char cap once.
const allDetails: string[] = [];

afterEach(() => {
	vi.restoreAllMocks();
});

interface FakeBundle {
	host: StewardHost;
	state: CurrentState;
	/** Mutable counter exposed so tests can simulate unrelated LP events. */
	bumpLpCounter: () => void;
}

function makeFakeHost(
	overrides: {
		state?: Partial<CurrentState>;
		nowISO?: string;
		todayISO?: string;
	} = {}
): FakeBundle {
	const state: CurrentState = {
		...createDefaultState(),
		...overrides.state,
		appConfig: {
			...createDefaultState().appConfig,
			...(overrides.state?.appConfig ?? {})
		},
		steward: {
			awards: [...(overrides.state?.steward?.awards ?? [])],
			lastForgivenWeek: overrides.state?.steward?.lastForgivenWeek ?? null
		},
		adjustments: [...(overrides.state?.adjustments ?? [])],
		pages: [...(overrides.state?.pages ?? [])]
	};

	let idSeq = 0;
	let lpCounter = 0;
	const nowISO = overrides.nowISO ?? '2026-07-15T12:00:00.000Z';
	const todayISO = overrides.todayISO ?? '2026-07-15';

	const host: StewardHost = {
		getState: () => state,
		applyLpEvent(event: LpEvent): LpResult {
			lpCounter += 1;
			if (event.type === 'kuromi_award') {
				state.lp += event.amount;
				state.totalLp += event.amount;
			}
			return {
				rank: state.rank,
				tier: state.tier,
				lp: state.lp,
				totalLp: state.totalLp,
				delta: event.type === 'kuromi_award' ? event.amount : 0,
				tierChanged: false,
				rankChanged: false,
				gateBlocked: false,
				sfxEvents: []
			};
		},
		patchConfig(patch: Partial<AppConfig>): void {
			if (patch.progression) {
				state.appConfig.progression = {
					...state.appConfig.progression,
					...patch.progression
				};
			}
			if (patch.streaks !== undefined) state.appConfig.streaks = patch.streaks;
			if (patch.missions !== undefined) state.appConfig.missions = patch.missions;
			if (patch.quiz) {
				state.appConfig.quiz = {
					...state.appConfig.quiz,
					...patch.quiz
				};
			}
			if (patch.dailyPath) {
				state.appConfig.dailyPath = {
					...state.appConfig.dailyPath,
					...patch.dailyPath
				};
			}
		},
		setStreak(practiceDays: number, lastSessionDate: string | null): void {
			state.practiceDays = practiceDays;
			state.lastSessionDate = lastSessionDate;
		},
		appendAdjustment(entry: AdjustmentEntry): void {
			allDetails.push(entry.detail);
			state.adjustments.push(entry);
		},
		recordAward(award: StewardAward): void {
			state.steward.awards.push(award);
		},
		markForgivenWeek(week: string): void {
			state.steward.lastForgivenWeek = week;
		},
		nowISO: () => nowISO,
		todayISO: () => todayISO,
		newId: () => `id-${++idSeq}`,
		lpEventCounter: () => lpCounter,
		restoreLpSnapshot(snapshot): void {
			state.rank = snapshot.rank;
			state.tier = snapshot.tier;
			state.lp = snapshot.lp;
			state.totalLp = snapshot.totalLp;
		},
		markAdjustmentUndone(id: string): void {
			const entry = state.adjustments.find((a) => a.id === id);
			if (entry) entry.undone = true;
		},
		upsertPage(page: KuromiPage): void {
			const idx = state.pages.findIndex((p) => p.id === page.id);
			if (idx >= 0) {
				state.pages[idx] = page;
			} else {
				state.pages.push(page);
			}
		},
		removePage(id: string): void {
			state.pages = state.pages.filter((p) => p.id !== id);
		}
	};

	return {
		host,
		state,
		bumpLpCounter: () => {
			lpCounter += 1;
		}
	};
}

function call(id: string, name: string, args: unknown): KuromiToolCall {
	return {
		id,
		name,
		arguments: typeof args === 'string' ? args : JSON.stringify(args)
	};
}

function trackResultDetails(results: { detail: string }[]): void {
	for (const r of results) allDetails.push(r.detail);
}

function noteBlock(body = 'hello'): { type: 'note'; body: string } {
	return { type: 'note', body };
}

function makeSeedPage(id: string, overrides: Partial<KuromiPage> = {}): KuromiPage {
	return {
		id,
		title: `Page ${id}`,
		quip: '',
		labels: [],
		blocks: [{ type: 'note', body: 'seed' }],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		archived: false,
		...overrides
	};
}

function validCreateArgs(extra: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		title: 'New page',
		quip: 'a quip',
		labels: ['grammar'],
		blocks: [noteBlock('body')],
		reason: 'make a page',
		...extra
	};
}

function mcqQuestion(n: number): {
	type: 'mcq';
	prompt: string;
	options: string[];
	answer: string;
	explanation_quip: string;
} {
	return {
		type: 'mcq',
		prompt: `Q${n}?`,
		options: ['a', 'b'],
		answer: 'a',
		explanation_quip: ''
	};
}

describe('remainingWeeklyAllowance', () => {
	const now = '2026-07-15T12:00:00.000Z';
	const nowMs = Date.parse(now);

	it('ignores awards older than the 7-day window and counts unparseable at', () => {
		const oldAt = new Date(nowMs - AWARD_WINDOW_MS - 1000).toISOString();
		const recentAt = new Date(nowMs - 1000).toISOString();
		const awards: StewardAward[] = [
			{ id: 'a1', at: oldAt, amount: 50 },
			{ id: 'a2', at: recentAt, amount: 40 },
			{ id: 'a3', at: 'not-a-date', amount: 30 }
		];
		// 40 + 30 counted → remaining 144 - 70 = 74
		expect(remainingWeeklyAllowance(awards, now)).toBe(MAX_WEEKLY_AWARD_LP - 70);
	});

	it('counts future-dated awards (+30d and +1h) so they cannot buy allowance', () => {
		const plus30d = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
		const plus1h = new Date(nowMs + 60 * 60 * 1000).toISOString();
		expect(remainingWeeklyAllowance([{ id: 'f30', at: plus30d, amount: 50 }], now)).toBe(
			MAX_WEEKLY_AWARD_LP - 50
		);
		expect(remainingWeeklyAllowance([{ id: 'f1h', at: plus1h, amount: 20 }], now)).toBe(
			MAX_WEEKLY_AWARD_LP - 20
		);
	});

	it('does not count awards dated 8 days before now', () => {
		const eightDaysAgo = new Date(nowMs - 8 * 24 * 60 * 60 * 1000).toISOString();
		expect(remainingWeeklyAllowance([{ id: 'old8', at: eightDaysAgo, amount: 80 }], now)).toBe(
			MAX_WEEKLY_AWARD_LP
		);
	});

	it('counts an award dated exactly at the window lower bound', () => {
		const exactBound = new Date(nowMs - AWARD_WINDOW_MS).toISOString();
		expect(remainingWeeklyAllowance([{ id: 'bound', at: exactBound, amount: 25 }], now)).toBe(
			MAX_WEEKLY_AWARD_LP - 25
		);
	});
});

describe('planAward', () => {
	const now = '2026-07-15T12:00:00.000Z';

	it('rejects non-number amounts without coercing strings', () => {
		expect(planAward('10', [], now).outcome).toBe('rejected');
		expect(planAward(undefined, [], now).outcome).toBe('rejected');
		expect(planAward(null, [], now).outcome).toBe('rejected');
		expect(planAward(NaN, [], now).outcome).toBe('rejected');
	});

	it('rejects zero and negative amounts', () => {
		expect(planAward(0, [], now).detail).toMatch(/never deduct/i);
		expect(planAward(-5, [], now).outcome).toBe('rejected');
	});

	it('floors fractional amounts', () => {
		const p = planAward(3.9, [], now);
		expect(p.outcome).toBe('applied');
		expect(p.effective).toBe(3);
	});

	it('caps to MAX_AWARD_LP', () => {
		const p = planAward(500, [], now);
		expect(p.outcome).toBe('capped');
		expect(p.effective).toBe(MAX_AWARD_LP);
		expect(p.detail).toContain('500');
		expect(p.detail).toContain(String(MAX_AWARD_LP));
	});
});

describe('validateConfigPatch', () => {
	it('returns empty accepted/dropped for non-objects', () => {
		expect(validateConfigPatch(null)).toEqual({ accepted: {}, dropped: [] });
		expect(validateConfigPatch([])).toEqual({ accepted: {}, dropped: [] });
		expect(validateConfigPatch('x')).toEqual({ accepted: {}, dropped: [] });
	});

	it('rejects out-of-union enum values into dropped', () => {
		const { accepted, dropped } = validateConfigPatch({
			'progression.display': 'neon',
			streaks: 'chaotic',
			missions: 'maybe'
		});
		expect(Object.keys(accepted)).toHaveLength(0);
		expect(dropped).toEqual(expect.arrayContaining(['progression.display', 'streaks', 'missions']));
	});

	it('accepts empty dailyPath.order and dedupes valid rules', () => {
		const empty = validateConfigPatch({ 'dailyPath.order': [] });
		expect(empty.accepted['dailyPath.order']).toEqual([]);
		expect(empty.dropped).not.toContain('dailyPath.order');

		const mixed = validateConfigPatch({
			'dailyPath.order': ['quiz', 'nope', 'quiz', 'tekst']
		});
		expect(mixed.accepted['dailyPath.order']).toEqual(['quiz', 'tekst']);
	});

	it('filters quiz.focusCategories members; empty array is legal', () => {
		const empty = validateConfigPatch({ 'quiz.focusCategories': [] });
		expect(empty.accepted['quiz.focusCategories']).toEqual([]);

		const filtered = validateConfigPatch({
			'quiz.focusCategories': ['food-drink', 'not-a-category', 12]
		});
		expect(filtered.accepted['quiz.focusCategories']).toEqual(['food-drink']);
		expect(filtered.dropped).not.toContain('quiz.focusCategories');
	});

	it('does not pollute Object.prototype via __proto__/constructor/prototype', () => {
		const raw = JSON.parse(
			JSON.stringify({
				'progression.display': 'hidden',
				constructor: { polluted: true },
				prototype: { polluted: true }
			})
		);
		// Own __proto__ key via defineProperty (object-literal __proto__ is special).
		Object.defineProperty(raw, '__proto__', {
			value: { polluted: true },
			enumerable: true,
			configurable: true,
			writable: true
		});

		validateConfigPatch(raw);
		expect(({} as { polluted?: unknown }).polluted).toBeUndefined();
		expect(Object.prototype.hasOwnProperty.call({}, 'polluted')).toBe(false);
	});

	it('flattens nested AppConfig-shaped patches (session-context copy)', () => {
		const { accepted, dropped } = validateConfigPatch({
			progression: { display: 'collection' },
			missions: 'off',
			quiz: { focusCategories: ['food-drink'] },
			dailyPath: { order: ['quiz'] }
		});
		expect(accepted['progression.display']).toBe('collection');
		expect(accepted.missions).toBe('off');
		expect(accepted['quiz.focusCategories']).toEqual(['food-drink']);
		expect(accepted['dailyPath.order']).toEqual(['quiz']);
		expect(dropped).not.toEqual(expect.arrayContaining(['progression', 'quiz', 'dailyPath']));
	});

	it('dotted keys win over a sibling nested object', () => {
		const { accepted } = validateConfigPatch({
			progression: { display: 'collection' },
			'progression.display': 'hidden'
		});
		expect(accepted['progression.display']).toBe('hidden');
	});

	it('null nested / dotted values mean leave unchanged, not dropped-as-invalid', () => {
		const { accepted, dropped } = validateConfigPatch({
			progression: { display: null },
			missions: null,
			streaks: 'gentle'
		});
		expect(accepted.streaks).toBe('gentle');
		expect(Object.prototype.hasOwnProperty.call(accepted, 'progression.display')).toBe(false);
		expect(Object.prototype.hasOwnProperty.call(accepted, 'missions')).toBe(false);
		expect(dropped).not.toContain('missions');
		expect(dropped).not.toContain('progression.display');
	});
});

describe('flattenConfigPatch', () => {
	it('returns non-objects unchanged', () => {
		expect(flattenConfigPatch(null)).toBeNull();
		expect(flattenConfigPatch('x')).toBe('x');
		expect(flattenConfigPatch([1])).toEqual([1]);
	});
});

describe('chooseReplyWhenPendingEmpty', () => {
	it("never surfaces the model's success claim when every tool was dropped", () => {
		const fallback =
			"Whatever that was supposed to be, I'm pretending it never happened. [mood: hmph]";
		expect(
			chooseReplyWhenPendingEmpty(
				'Done, missions are off and the stickers are up! [mood: hehe]',
				fallback
			)
		).toBe(fallback);
		expect(chooseReplyWhenPendingEmpty('', fallback)).toBe(fallback);
	});
});

describe('CONFIG_TOP_LEVEL_KEYS', () => {
	it('covers every distinct top-level segment of CONFIG_KEYS', () => {
		const expected = new Set(CONFIG_KEYS.map((k) => k.split('.')[0]));
		expect(new Set(CONFIG_TOP_LEVEL_KEYS)).toEqual(expected);
	});
});

describe('executeIntents — adversarial boundary', () => {
	it('1. fabricated tool name is dropped with no adjustment and no result', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const { host, state } = makeFakeHost();
		const fabricated = call('c1', 'grant_admin', { power: true });
		const { results, dropped } = executeIntents([fabricated], host);
		trackResultDetails(results);

		expect(results).toEqual([]);
		expect(dropped).toEqual([fabricated]);
		expect(state.adjustments).toHaveLength(0);
		expect(warn).toHaveBeenCalled();
	});

	it('1b. duplicate call.id in one batch: first executes, second dropped, one result id', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const { host, state } = makeFakeHost({ state: { lp: 0, totalLp: 0 } });
		const first = call('same-id', 'award_lp', { amount: 10, reason: 'first' });
		const second = call('same-id', 'award_lp', { amount: 20, reason: 'second' });
		const { results, dropped } = executeIntents([first, second], host);
		trackResultDetails(results);

		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('same-id');
		expect(results[0].outcome).toBe('applied');
		expect(dropped).toEqual([second]);
		expect(state.lp).toBe(10);
		expect(state.steward.awards).toHaveLength(1);
		expect(state.steward.awards[0].amount).toBe(10);
		expect(warn).toHaveBeenCalled();
		expect(results.filter((r) => r.id === 'same-id')).toHaveLength(1);
	});

	it('2. mixed fabricated + valid award: valid executes, fabricated only in dropped', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const { host, state } = makeFakeHost({
			state: { lp: 10, totalLp: 10 }
		});
		const bad = call('bad', 'grant_admin', {});
		const good = call('good', 'award_lp', { amount: 5, reason: 'good job' });
		const { results, dropped } = executeIntents([bad, good], host);
		trackResultDetails(results);

		expect(dropped).toEqual([bad]);
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('good');
		expect(results[0].outcome).toBe('applied');
		expect(state.lp).toBe(15);
		expect(state.adjustments).toHaveLength(1);
		expect(state.adjustments[0].tool).toBe('award_lp');
	});

	it('3. malformed JSON arguments → rejected + one adjustment', () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents([call('m1', 'award_lp', '{not json')], host);
		trackResultDetails(results);

		expect(results).toHaveLength(1);
		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/unreadable/i);
		expect(state.adjustments).toHaveLength(1);
		expect(state.steward.awards).toHaveLength(0);
	});

	it('4. arguments null / [] / {} for award_lp all reject without crashing', () => {
		for (const raw of ['null', '[]', '{}'] as const) {
			const { host, state } = makeFakeHost();
			const { results } = executeIntents([call('x', 'award_lp', raw)], host);
			trackResultDetails(results);
			expect(results[0].outcome).toBe('rejected');
			expect(state.steward.awards).toHaveLength(0);
			expect(state.adjustments).toHaveLength(1);
		}
	});

	it('5. award amount edges: negative, zero, floor, hard cap', () => {
		const cases: Array<{ amount: number; outcome: string; effectiveLpDelta?: number }> = [
			{ amount: -5, outcome: 'rejected' },
			{ amount: 0, outcome: 'rejected' },
			{ amount: 3.9, outcome: 'applied', effectiveLpDelta: 3 },
			{ amount: 500, outcome: 'capped', effectiveLpDelta: MAX_AWARD_LP }
		];
		for (const c of cases) {
			const { host, state } = makeFakeHost({ state: { lp: 0, totalLp: 0 } });
			const { results } = executeIntents(
				[call('a', 'award_lp', { amount: c.amount, reason: 't' })],
				host
			);
			trackResultDetails(results);
			expect(results[0].outcome).toBe(c.outcome);
			if (c.outcome === 'rejected') {
				expect(results[0].detail).toMatch(/never deduct|unreadable|exhausted/i);
				expect(state.lp).toBe(0);
			} else {
				expect(state.lp).toBe(c.effectiveLpDelta);
			}
		}
	});

	it('6. weekly cap: 100 used → 72 request capped to 44; 144 used → rejected', () => {
		const now = '2026-07-15T12:00:00.000Z';
		const recent = '2026-07-14T12:00:00.000Z';

		const capped = makeFakeHost({
			nowISO: now,
			state: {
				steward: {
					awards: [{ id: 'w1', at: recent, amount: 100 }],
					lastForgivenWeek: null
				},
				lp: 0,
				totalLp: 0
			}
		});
		const r1 = executeIntents([call('c', 'award_lp', { amount: 72, reason: 'cap' })], capped.host);
		trackResultDetails(r1.results);
		expect(r1.results[0].outcome).toBe('capped');
		expect(capped.state.lp).toBe(44);

		const exhausted = makeFakeHost({
			nowISO: now,
			state: {
				steward: {
					awards: [{ id: 'w2', at: recent, amount: 144 }],
					lastForgivenWeek: null
				},
				lp: 0,
				totalLp: 0
			}
		});
		const r2 = executeIntents(
			[call('c', 'award_lp', { amount: 10, reason: 'cap' })],
			exhausted.host
		);
		trackResultDetails(r2.results);
		expect(r2.results[0].outcome).toBe('rejected');
		expect(r2.results[0].detail).toMatch(/exhausted/i);
		expect(exhausted.state.lp).toBe(0);
		expect(exhausted.state.steward.awards).toHaveLength(1);
	});

	it('7. old awards do not count; unparseable at does count', () => {
		const now = '2026-07-15T12:00:00.000Z';
		const nowMs = Date.parse(now);
		const oldAt = new Date(nowMs - AWARD_WINDOW_MS - 60_000).toISOString();
		const awards: StewardAward[] = [
			{ id: 'old', at: oldAt, amount: 100 },
			{ id: 'bad', at: '???', amount: 40 }
		];
		expect(remainingWeeklyAllowance(awards, now)).toBe(MAX_WEEKLY_AWARD_LP - 40);

		const { host, state } = makeFakeHost({
			nowISO: now,
			state: { steward: { awards, lastForgivenWeek: null }, lp: 0, totalLp: 0 }
		});
		const { results } = executeIntents([call('a', 'award_lp', { amount: 72, reason: 'r' })], host);
		trackResultDetails(results);
		// remaining = 144-40 = 104, request 72 → applied 72
		expect(results[0].outcome).toBe('applied');
		expect(state.lp).toBe(72);
	});

	it('8. update_config: only unknown key rejected; unknown+valid capped naming drop', () => {
		const onlyUnknown = makeFakeHost();
		const r1 = executeIntents(
			[
				call('u1', 'update_config', {
					patch: { 'evil.setting': true },
					reason: 'nope'
				})
			],
			onlyUnknown.host
		);
		trackResultDetails(r1.results);
		expect(r1.results[0].outcome).toBe('rejected');
		expect(r1.results[0].detail).toMatch(/evil\.setting/);

		const mixed = makeFakeHost();
		const r2 = executeIntents(
			[
				call('u2', 'update_config', {
					patch: {
						'evil.setting': true,
						'progression.display': 'hidden'
					},
					reason: 'partial'
				})
			],
			mixed.host
		);
		trackResultDetails(r2.results);
		expect(r2.results[0].outcome).toBe('capped');
		expect(r2.results[0].detail).toMatch(/evil\.setting/);
		expect(mixed.state.appConfig.progression.display).toBe('hidden');
	});

	it('8b. persisted update_config payload is a genuine plain object (applied + rejected)', () => {
		const applied = makeFakeHost();
		const rApplied = executeIntents(
			[
				call('p1', 'update_config', {
					patch: { 'progression.display': 'hidden' },
					reason: 'plain'
				})
			],
			applied.host
		);
		trackResultDetails(rApplied.results);
		expect(rApplied.results[0].outcome).toBe('applied');
		expect(applied.state.adjustments).toHaveLength(1);
		expect(Object.getPrototypeOf(applied.state.adjustments[0].payload)).toBe(Object.prototype);

		const rejected = makeFakeHost();
		const rRejected = executeIntents(
			[
				call('p2', 'update_config', {
					patch: { 'evil.setting': true },
					reason: 'plain reject'
				})
			],
			rejected.host
		);
		trackResultDetails(rRejected.results);
		expect(rRejected.results[0].outcome).toBe('rejected');
		expect(rejected.state.adjustments).toHaveLength(1);
		expect(Object.getPrototypeOf(rejected.state.adjustments[0].payload)).toBe(Object.prototype);
	});

	it('9. enum fields reject out-of-union values into dropped', () => {
		const { host, state } = makeFakeHost();
		const before = { ...state.appConfig };
		const { results } = executeIntents(
			[
				call('e', 'update_config', {
					patch: {
						'progression.display': 'neon',
						streaks: 'wild',
						missions: 'sometimes'
					},
					reason: 'bad enums'
				})
			],
			host
		);
		trackResultDetails(results);
		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/progression\.display/);
		expect(results[0].detail).toMatch(/streaks/);
		expect(results[0].detail).toMatch(/missions/);
		expect(state.appConfig.progression.display).toBe(before.progression.display);
		expect(state.appConfig.streaks).toBe(before.streaks);
		expect(state.appConfig.missions).toBe(before.missions);
	});

	it('10. dailyPath.order: empty accepted as []; unknown member filtered; deduped', () => {
		const emptyCase = makeFakeHost();
		const rEmpty = executeIntents(
			[
				call('d1', 'update_config', {
					patch: { 'dailyPath.order': [] },
					reason: 'clear glow'
				})
			],
			emptyCase.host
		);
		trackResultDetails(rEmpty.results);
		expect(rEmpty.results[0].outcome).toBe('applied');
		expect(emptyCase.state.appConfig.dailyPath.order).toEqual([]);

		const filterCase = makeFakeHost();
		const rFilter = executeIntents(
			[
				call('d2', 'update_config', {
					patch: {
						'dailyPath.order': ['quiz', 'bogus-rule', 'quiz', 'tekst']
					},
					reason: 'filter'
				})
			],
			filterCase.host
		);
		trackResultDetails(rFilter.results);
		expect(rFilter.results[0].outcome).toBe('applied');
		expect(filterCase.state.appConfig.dailyPath.order).toEqual(['quiz', 'tekst']);
	});

	it('11. quiz.focusCategories filters nonexistent; [] accepted', () => {
		const empty = makeFakeHost();
		const r1 = executeIntents(
			[
				call('q1', 'update_config', {
					patch: { 'quiz.focusCategories': [] },
					reason: 'clear'
				})
			],
			empty.host
		);
		trackResultDetails(r1.results);
		expect(r1.results[0].outcome).toBe('applied');
		expect(empty.state.appConfig.quiz.focusCategories).toEqual([]);

		const filtered = makeFakeHost();
		const r2 = executeIntents(
			[
				call('q2', 'update_config', {
					patch: {
						'quiz.focusCategories': ['people-family', 'totally-fake']
					},
					reason: 'bias'
				})
			],
			filtered.host
		);
		trackResultDetails(r2.results);
		expect(r2.results[0].outcome).toBe('applied');
		expect(filtered.state.appConfig.quiz.focusCategories).toEqual(['people-family']);
	});

	it('12. prototype-polluting patch keys pollute nothing via validate/execute', () => {
		const rawPatch = JSON.parse(
			'{"progression.display":"hidden","constructor":{"polluted":1},"prototype":{"polluted":1}}'
		);
		Object.defineProperty(rawPatch, '__proto__', {
			value: { polluted: true },
			enumerable: true,
			configurable: true,
			writable: true
		});

		validateConfigPatch(rawPatch);
		expect(({} as { polluted?: unknown }).polluted).toBeUndefined();

		const { host } = makeFakeHost();
		const { results } = executeIntents(
			[
				call('p', 'update_config', {
					patch: rawPatch,
					reason: 'pollute attempt'
				})
			],
			host
		);
		trackResultDetails(results);
		expect(({} as { polluted?: unknown }).polluted).toBeUndefined();
		expect(results[0].outcome).toBe('capped');
		expect(host.getState().appConfig.progression.display).toBe('hidden');
	});

	it('13. forgive_streak: off rejects; second same week rejects; first applies +1', () => {
		const off = makeFakeHost({
			state: { appConfig: { ...createDefaultState().appConfig, streaks: 'off' } }
		});
		const rOff = executeIntents([call('f0', 'forgive_streak', { reason: 'pls' })], off.host);
		trackResultDetails(rOff.results);
		expect(rOff.results[0].outcome).toBe('rejected');
		expect(rOff.results[0].detail).toMatch(/streaks are off/i);

		const first = makeFakeHost({
			todayISO: '2026-07-15',
			state: { practiceDays: 3, lastSessionDate: '2026-07-01' }
		});
		const r1 = executeIntents([call('f1', 'forgive_streak', { reason: 'missed' })], first.host);
		trackResultDetails(r1.results);
		expect(r1.results[0].outcome).toBe('applied');
		expect(first.state.practiceDays).toBe(4);
		expect(first.state.lastSessionDate).toBe('2026-07-15');
		expect(first.state.steward.lastForgivenWeek).toBeTruthy();

		const second = makeFakeHost({
			todayISO: '2026-07-15',
			state: {
				practiceDays: 4,
				steward: {
					awards: [],
					lastForgivenWeek: first.state.steward.lastForgivenWeek
				}
			}
		});
		const r2 = executeIntents([call('f2', 'forgive_streak', { reason: 'again' })], second.host);
		trackResultDetails(r2.results);
		expect(r2.results[0].outcome).toBe('rejected');
		expect(r2.results[0].detail).toMatch(/already used this week/i);
		expect(second.state.practiceDays).toBe(4);
	});

	it('14. award undo restores LP tuple; counter drift blocks; allowance unchanged', () => {
		const { host, state, bumpLpCounter } = makeFakeHost({
			state: { rank: 2, tier: 1, lp: 20, totalLp: 120 }
		});
		const { results, undos } = executeIntents(
			[call('a', 'award_lp', { amount: 10, reason: 'treat' })],
			host
		);
		trackResultDetails(results);
		expect(results[0].outcome).toBe('applied');
		expect(state.lp).toBe(30);
		expect(state.totalLp).toBe(130);
		expect(undos).toHaveLength(1);

		const allowanceAfterAward = remainingWeeklyAllowance(state.steward.awards, host.nowISO());

		// Drift: another LP event landed → undo must refuse and mutate nothing.
		const drifted: UndoHandle = undos[0];
		bumpLpCounter();
		const lpBeforeFail = state.lp;
		expect(drifted.run()).toBe(false);
		expect(state.lp).toBe(lpBeforeFail);
		expect(state.adjustments.find((a) => a.id === drifted.adjustmentId)?.undone).toBe(false);

		// Fresh award + successful undo.
		const fresh = makeFakeHost({
			state: { rank: 2, tier: 1, lp: 20, totalLp: 120 }
		});
		const again = executeIntents(
			[call('a2', 'award_lp', { amount: 10, reason: 'treat' })],
			fresh.host
		);
		trackResultDetails(again.results);
		const undo = again.undos[0];
		const allowanceRightAfter = remainingWeeklyAllowance(
			fresh.state.steward.awards,
			fresh.host.nowISO()
		);
		expect(undo.run()).toBe(true);
		expect(fresh.state.rank).toBe(2);
		expect(fresh.state.tier).toBe(1);
		expect(fresh.state.lp).toBe(20);
		expect(fresh.state.totalLp).toBe(120);
		expect(fresh.state.adjustments.find((a) => a.id === undo.adjustmentId)?.undone).toBe(true);
		// Farming-loop guard: ledger entry still present and counted.
		expect(fresh.state.steward.awards.length).toBeGreaterThan(0);
		expect(remainingWeeklyAllowance(fresh.state.steward.awards, fresh.host.nowISO())).toBe(
			allowanceRightAfter
		);
		expect(allowanceAfterAward).toBeLessThan(MAX_WEEKLY_AWARD_LP);
	});

	it('15. config undo restores only accepted keys', () => {
		const { host, state } = makeFakeHost({
			state: {
				appConfig: {
					progression: { display: 'score' },
					streaks: 'strict',
					missions: 'on',
					quiz: { focusCategories: ['home'] },
					dailyPath: { order: [...GLOW_RULES] }
				}
			}
		});
		const { undos, results } = executeIntents(
			[
				call('cfg', 'update_config', {
					patch: {
						'progression.display': 'hidden',
						missions: 'off'
					},
					reason: 'focus mode'
				})
			],
			host
		);
		trackResultDetails(results);
		expect(state.appConfig.progression.display).toBe('hidden');
		expect(state.appConfig.missions).toBe('off');
		expect(state.appConfig.streaks).toBe('strict');
		expect(state.appConfig.quiz.focusCategories).toEqual(['home']);

		expect(undos[0].run()).toBe(true);
		expect(state.appConfig.progression.display).toBe('score');
		expect(state.appConfig.missions).toBe('on');
		expect(state.appConfig.streaks).toBe('strict');
		expect(state.appConfig.quiz.focusCategories).toEqual(['home']);
		expect(state.appConfig.dailyPath.order).toEqual([...GLOW_RULES]);
	});

	it('16. every detail ≤ 400 chars, including a maximal 5-key patch', () => {
		const longReason = 'x'.repeat(2000);
		const { host } = makeFakeHost();
		const { results } = executeIntents(
			[
				call('big', 'update_config', {
					patch: {
						'progression.display': 'collection',
						streaks: 'gentle',
						missions: 'off',
						'quiz.focusCategories': ['food-drink', 'home', 'misc'],
						'dailyPath.order': [...GLOW_RULES]
					},
					reason: longReason
				})
			],
			host
		);
		trackResultDetails(results);
		expect(results[0].outcome).toBe('applied');
		expect(results[0].detail.length).toBeLessThanOrEqual(400);

		// Global backstop across the whole file's collected details.
		for (const d of allDetails) {
			expect(d.length).toBeLessThanOrEqual(400);
		}
		// Sanity: CONFIG_KEYS still the five we patch.
		expect(CONFIG_KEYS).toHaveLength(5);
	});

	it('17. same-batch award_lp calls stack against the shared weekly cap', () => {
		const now = '2026-07-15T12:00:00.000Z';
		const recent = '2026-07-14T12:00:00.000Z';
		// 72 already used → remaining 72. Two requests of 72 in ONE batch:
		// first consumes the remaining 72; second must see that and reject.
		const { host, state } = makeFakeHost({
			nowISO: now,
			state: {
				lp: 0,
				totalLp: 0,
				steward: {
					awards: [{ id: 'seed', at: recent, amount: 72 }],
					lastForgivenWeek: null
				}
			}
		});
		const first = call('b1', 'award_lp', { amount: 72, reason: 'batch-1' });
		const second = call('b2', 'award_lp', { amount: 72, reason: 'batch-2' });
		const { results } = executeIntents([first, second], host);
		trackResultDetails(results);

		expect(results).toHaveLength(2);
		expect(results[0].outcome).toBe('applied');
		expect(results[1].outcome).toBe('rejected');
		expect(results[1].detail).toMatch(/exhausted/i);
		expect(state.lp).toBe(72);
		expect(state.steward.awards).toHaveLength(2);
		expect(state.steward.awards[1].amount).toBe(72);
	});

	it('18. ledger amount NaN → next award_lp is rejected, never claims LP given', () => {
		const now = '2026-07-15T12:00:00.000Z';
		const recent = '2026-07-14T12:00:00.000Z';
		const { host, state } = makeFakeHost({
			nowISO: now,
			state: {
				lp: 0,
				totalLp: 0,
				steward: {
					awards: [{ id: 'poison', at: recent, amount: Number.NaN }],
					lastForgivenWeek: null
				}
			}
		});
		const { results } = executeIntents(
			[call('n1', 'award_lp', { amount: 72, reason: 'after-nan' })],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].outcome).not.toBe('applied');
		expect(results[0].detail).not.toMatch(/^Awarded /);
		expect(state.lp).toBe(0);
		expect(state.steward.awards).toHaveLength(1);
		const adj = state.adjustments[0];
		expect(adj.outcome).toBe('rejected');
		expect(adj.detail).not.toMatch(/^Awarded /);
	});

	it('19. large negative ledger amount does not inflate weekly allowance', () => {
		const now = '2026-07-15T12:00:00.000Z';
		const recent = '2026-07-14T12:00:00.000Z';
		const poisoned = makeFakeHost({
			nowISO: now,
			state: {
				lp: 0,
				totalLp: 0,
				steward: {
					awards: [{ id: 'neg', at: recent, amount: -1_000_000 }],
					lastForgivenWeek: null
				}
			}
		});
		const clean = makeFakeHost({
			nowISO: now,
			state: { lp: 0, totalLp: 0, steward: { awards: [], lastForgivenWeek: null } }
		});

		const rPoison = executeIntents(
			[call('p', 'award_lp', { amount: 72, reason: 'neg-ledger' })],
			poisoned.host
		);
		const rClean = executeIntents(
			[call('c', 'award_lp', { amount: 72, reason: 'clean-ledger' })],
			clean.host
		);
		trackResultDetails(rPoison.results);
		trackResultDetails(rClean.results);

		expect(rPoison.results[0].outcome).toBe(rClean.results[0].outcome);
		expect(rPoison.results[0].outcome).toBe('applied');
		expect(poisoned.state.lp).toBe(clean.state.lp);
		expect(poisoned.state.lp).toBe(72);
		expect(remainingWeeklyAllowance(poisoned.state.steward.awards, now)).toBe(
			remainingWeeklyAllowance(clean.state.steward.awards, now)
		);
	});

	it('20. reason longer than 400 chars is clamped in AdjustmentEntry.reason', () => {
		const longReason = 'r'.repeat(500);
		const { host, state } = makeFakeHost({ state: { lp: 0, totalLp: 0 } });
		const { results } = executeIntents(
			[call('long', 'award_lp', { amount: 5, reason: longReason })],
			host
		);
		trackResultDetails(results);
		expect(results[0].outcome).toBe('applied');
		expect(state.adjustments).toHaveLength(1);
		expect(state.adjustments[0].reason.length).toBe(400);
		expect(state.adjustments[0].reason).toBe(longReason.slice(0, 400));
	});

	it('21. pendingToolCalls is 1:1 with results and excludes dropped', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const { host } = makeFakeHost({ state: { lp: 0, totalLp: 0 } });
		const fabricated = call('fab', 'grant_admin', { power: true });
		const first = call('dup', 'award_lp', { amount: 10, reason: 'first' });
		const dup = call('dup', 'award_lp', { amount: 20, reason: 'collision' });
		const good = call('ok', 'award_lp', { amount: 5, reason: 'ok' });
		const { results, dropped, pendingToolCalls } = executeIntents(
			[fabricated, first, dup, good],
			host
		);
		trackResultDetails(results);

		expect(dropped).toEqual([fabricated, dup]);
		expect(results).toHaveLength(2);
		expect(pendingToolCalls).toHaveLength(2);
		expect(pendingToolCalls.map((c) => c.id)).toEqual(results.map((r) => r.id));
		expect(pendingToolCalls[0]).toBe(first);
		expect(pendingToolCalls[1]).toBe(good);
		for (const d of dropped) {
			expect(pendingToolCalls).not.toContain(d);
		}
	});

	// ---- Page tools (create / update / archive) -------------------------------

	it('22. create_page ignores attacker-supplied id/createdAt/updatedAt (the pin)', () => {
		const { host, state } = makeFakeHost();
		const attackerId = 'attacker-page-id';
		const attackerCreated = '3000-01-01T00:00:00.000Z';
		const attackerUpdated = '3000-12-31T23:59:59.000Z';
		const { results } = executeIntents(
			[
				call(
					'c',
					'create_page',
					validCreateArgs({
						id: attackerId,
						createdAt: attackerCreated,
						updatedAt: attackerUpdated
					})
				)
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages).toHaveLength(1);
		const page = state.pages[0];
		expect(page.id).not.toBe(attackerId);
		expect(page.id).toBe('id-1');
		expect(page.createdAt).not.toBe(attackerCreated);
		expect(page.updatedAt).not.toBe(attackerUpdated);
		expect(page.createdAt).toBe(host.nowISO());
		expect(page.updatedAt).toBe(host.nowISO());
		expect(page.archived).toBe(false);
		expect(state.adjustments[0].source).toBe('kuromi');
		expect(state.adjustments[0].payload).toEqual({ pageId: page.id });
	});

	it('23. update_page ignores forged createdAt/updatedAt; preserves stored createdAt', () => {
		const seed = makeSeedPage('p1', {
			title: 'Old',
			createdAt: '2025-06-01T00:00:00.000Z',
			updatedAt: '2025-06-02T00:00:00.000Z'
		});
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const forgedCreated = '3000-01-01T00:00:00.000Z';
		const forgedUpdated = '3000-12-31T23:59:59.000Z';
		const { results } = executeIntents(
			[
				call('u', 'update_page', {
					id: 'p1',
					title: 'New title',
					createdAt: forgedCreated,
					updatedAt: forgedUpdated,
					reason: 'rename'
				})
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages[0].title).toBe('New title');
		expect(state.pages[0].createdAt).toBe('2025-06-01T00:00:00.000Z');
		expect(state.pages[0].createdAt).not.toBe(forgedCreated);
		expect(state.pages[0].updatedAt).toBe(host.nowISO());
		expect(state.pages[0].updatedAt).not.toBe(forgedUpdated);
		expect(state.pages[0].id).toBe('p1');
	});

	it('24. create_page rejects when 60 active pages already exist', () => {
		const pages = Array.from({ length: MAX_ACTIVE_PAGES }, (_, i) => makeSeedPage(`active-${i}`));
		const { host, state } = makeFakeHost({ state: { pages } });
		const { results } = executeIntents([call('c', 'create_page', validCreateArgs())], host);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/shelf is full|60 active/i);
		expect(state.pages).toHaveLength(MAX_ACTIVE_PAGES);
	});

	it('25. create_page succeeds when 60 archived pages exist (archived do not count)', () => {
		const pages = Array.from({ length: MAX_ACTIVE_PAGES }, (_, i) =>
			makeSeedPage(`arch-${i}`, { archived: true })
		);
		const { host, state } = makeFakeHost({ state: { pages } });
		const { results } = executeIntents([call('c', 'create_page', validCreateArgs())], host);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages).toHaveLength(MAX_ACTIVE_PAGES + 1);
		expect(state.pages[MAX_ACTIVE_PAGES].archived).toBe(false);
	});

	it('26. missing archived / string "true" both count toward the active cap (fail closed)', () => {
		const weird: KuromiPage[] = [];
		for (let i = 0; i < 59; i++) {
			if (i % 2 === 0) {
				const p = makeSeedPage(`m-${i}`);
				delete (p as { archived?: boolean }).archived;
				weird.push(p);
			} else {
				weird.push(
					makeSeedPage(`s-${i}`, {
						archived: 'true' as unknown as boolean
					})
				);
			}
		}
		weird.push(makeSeedPage('clean-active'));
		expect(weird).toHaveLength(60);

		const { host, state } = makeFakeHost({ state: { pages: weird } });
		const { results } = executeIntents([call('c', 'create_page', validCreateArgs())], host);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(state.pages).toHaveLength(60);
	});

	it('27. create_page with 21 note blocks → capped at 20', () => {
		const blocks = Array.from({ length: 21 }, (_, i) => noteBlock(`n${i}`));
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ blocks }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('capped');
		expect(results[0].detail).toMatch(/blocks capped at 20/i);
		expect(state.pages[0].blocks).toHaveLength(20);
	});

	it('28. create_page with drill of 11 questions → capped at 10', () => {
		const questions = Array.from({ length: 11 }, (_, i) => mcqQuestion(i));
		const blocks = [
			{
				type: 'drill',
				title: 'Drill',
				intro_quip: 'go',
				questions
			}
		];
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ blocks }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('capped');
		expect(results[0].detail).toMatch(/questions capped at 10/i);
		const drill = state.pages[0].blocks[0];
		expect(drill.type).toBe('drill');
		if (drill.type === 'drill') {
			expect(drill.questions).toHaveLength(10);
		}
	});

	it('29. create_page with 7 distinct labels → capped at 6', () => {
		const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ labels }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('capped');
		expect(results[0].detail).toMatch(/labels capped at 6/i);
		expect(state.pages[0].labels).toHaveLength(6);
	});

	it('30. create_page with unknown block type → rejected, nothing persisted', () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[
				call(
					'c',
					'create_page',
					validCreateArgs({
						blocks: [noteBlock('ok'), { type: 'video', url: 'x' }]
					})
				)
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toContain('video');
		expect(state.pages).toHaveLength(0);
	});

	it('31. create_page under every cap → applied, content persists unclamped', () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[
				call(
					'c',
					'create_page',
					validCreateArgs({
						title: 'Short',
						quip: 'q',
						labels: ['grammar', 'vocab'],
						blocks: [noteBlock('only')]
					})
				)
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages[0].title).toBe('Short');
		expect(state.pages[0].quip).toBe('q');
		expect(state.pages[0].labels).toEqual(['grammar', 'vocab']);
		expect(state.pages[0].blocks).toHaveLength(1);
	});

	it('32. update_page with only title present leaves blocks byte-for-byte unchanged', () => {
		const seed = makeSeedPage('p1', {
			title: 'Old',
			blocks: [
				{ type: 'note', body: 'keep-me' },
				{ type: 'note', body: 'also-keep' }
			]
		});
		const blocksBefore = JSON.stringify(seed.blocks);
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { results } = executeIntents(
			[call('u', 'update_page', { id: 'p1', title: 'Renamed', reason: 'r' })],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages[0].title).toBe('Renamed');
		expect(JSON.stringify(state.pages[0].blocks)).toBe(blocksBefore);
	});

	it('33. update_page with explicit blocks: [] is rejected (not a silent clear)', () => {
		const seed = makeSeedPage('p1', {
			blocks: [{ type: 'note', body: 'keep' }]
		});
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { results } = executeIntents(
			[call('u', 'update_page', { id: 'p1', blocks: [], reason: 'clear?' })],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/non-empty/i);
		expect(state.pages[0].blocks).toHaveLength(1);
		expect(state.pages[0].blocks[0]).toEqual({ type: 'note', body: 'keep' });
	});

	it('34. update_page on archived page is rejected; page unchanged', () => {
		const seed = makeSeedPage('p1', {
			archived: true,
			title: 'Archived title'
		});
		const before = JSON.stringify(seed);
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { results } = executeIntents(
			[call('u', 'update_page', { id: 'p1', title: 'Nope', reason: 'r' })],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/archived/i);
		expect(state.pages[0].archived).toBe(true);
		expect(JSON.stringify(state.pages[0])).toBe(before);
	});

	it('35. archive_page on already-archived page is rejected', () => {
		const seed = makeSeedPage('p1', { archived: true });
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { results } = executeIntents(
			[call('a', 'archive_page', { id: 'p1', reason: 'again' })],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/already archived/i);
		expect(state.pages[0].archived).toBe(true);
	});

	it('36. update_page and archive_page reject unknown ids', () => {
		const { host: h1, state: s1 } = makeFakeHost();
		const r1 = executeIntents(
			[call('u', 'update_page', { id: 'missing', title: 'x', reason: 'r' })],
			h1
		);
		trackResultDetails(r1.results);
		expect(r1.results[0].outcome).toBe('rejected');
		expect(r1.results[0].detail).toMatch(/no such page/i);
		expect(s1.pages).toHaveLength(0);

		const { host: h2, state: s2 } = makeFakeHost();
		const r2 = executeIntents([call('a', 'archive_page', { id: 'missing', reason: 'r' })], h2);
		trackResultDetails(r2.results);
		expect(r2.results[0].outcome).toBe('rejected');
		expect(r2.results[0].detail).toMatch(/no such page/i);
		expect(s2.pages).toHaveLength(0);
	});

	it('37. fabricated name in same batch as create_page: dropped + create succeeds', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const { host, state } = makeFakeHost();
		const bad = call('bad', 'delete_universe', {});
		const good = call('good', 'create_page', validCreateArgs());
		const { results, dropped, pendingToolCalls } = executeIntents([bad, good], host);
		trackResultDetails(results);

		expect(dropped).toEqual([bad]);
		expect(warn).toHaveBeenCalled();
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('good');
		expect(results[0].outcome).toBe('applied');
		expect(pendingToolCalls).toEqual([good]);
		expect(state.pages).toHaveLength(1);
		expect(state.adjustments).toHaveLength(1);
		expect(state.adjustments[0].tool).toBe('create_page');
	});

	it('38. duplicate call.id with create_page first: first executes, second dropped', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const { host, state } = makeFakeHost();
		const first = call('same', 'create_page', validCreateArgs({ title: 'First' }));
		const second = call('same', 'create_page', validCreateArgs({ title: 'Second' }));
		const { results, dropped } = executeIntents([first, second], host);
		trackResultDetails(results);

		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('same');
		expect(results[0].outcome).toBe('applied');
		expect(dropped).toEqual([second]);
		expect(state.pages).toHaveLength(1);
		expect(state.pages[0].title).toBe('First');
		expect(warn).toHaveBeenCalled();
	});

	it('39. create_page undo removes the page and marks adjustment undone', () => {
		const { host, state } = makeFakeHost();
		const { results, undos } = executeIntents([call('c', 'create_page', validCreateArgs())], host);
		trackResultDetails(results);

		expect(state.pages).toHaveLength(1);
		const pageId = state.pages[0].id;
		expect(undos).toHaveLength(1);
		expect(undos[0].run()).toBe(true);
		expect(state.pages.find((p) => p.id === pageId)).toBeUndefined();
		expect(state.adjustments.find((a) => a.id === undos[0].adjustmentId)?.undone).toBe(true);
	});

	it('40. create_page undo refuses when updatedAt has moved', () => {
		const { host, state } = makeFakeHost();
		const { undos } = executeIntents([call('c', 'create_page', validCreateArgs())], host);
		const page = state.pages[0];
		host.upsertPage({ ...page, updatedAt: '2026-07-15T13:00:00.000Z' });
		expect(undos[0].run()).toBe(false);
		expect(state.pages).toHaveLength(1);
		expect(state.pages[0].updatedAt).toBe('2026-07-15T13:00:00.000Z');
		expect(state.adjustments.find((a) => a.id === undos[0].adjustmentId)?.undone).toBe(false);
	});

	it('41. create_page undo refuses when page is already gone', () => {
		const { host, state } = makeFakeHost();
		const { undos } = executeIntents([call('c', 'create_page', validCreateArgs())], host);
		const pageId = state.pages[0].id;
		host.removePage(pageId);
		expect(undos[0].run()).toBe(false);
		expect(state.pages).toHaveLength(0);
		expect(state.adjustments.find((a) => a.id === undos[0].adjustmentId)?.undone).toBe(false);
	});

	it('42. update_page undo restores snapshot; refuses on updatedAt drift', () => {
		const seed = makeSeedPage('p1', {
			title: 'Before',
			labels: ['grammar'],
			blocks: [{ type: 'note', body: 'old' }],
			updatedAt: '2026-01-01T00:00:00.000Z'
		});
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { undos, results } = executeIntents(
			[
				call('u', 'update_page', {
					id: 'p1',
					title: 'After',
					labels: ['vocab'],
					blocks: [noteBlock('new')],
					reason: 'edit'
				})
			],
			host
		);
		trackResultDetails(results);

		expect(state.pages[0].title).toBe('After');
		expect(undos).toHaveLength(1);

		// Successful undo first (fresh host path).
		const ok = makeFakeHost({
			state: {
				pages: [
					makeSeedPage('p1', {
						title: 'Before',
						labels: ['grammar'],
						blocks: [{ type: 'note', body: 'old' }],
						updatedAt: '2026-01-01T00:00:00.000Z'
					})
				]
			}
		});
		const okRun = executeIntents(
			[
				call('u2', 'update_page', {
					id: 'p1',
					title: 'After',
					reason: 'edit'
				})
			],
			ok.host
		);
		trackResultDetails(okRun.results);
		expect(okRun.undos[0].run()).toBe(true);
		expect(ok.state.pages[0].title).toBe('Before');
		expect(ok.state.pages[0].updatedAt).toBe('2026-01-01T00:00:00.000Z');
		expect(ok.state.adjustments.find((a) => a.id === okRun.undos[0].adjustmentId)?.undone).toBe(
			true
		);

		// Drift refuse on the first host.
		host.upsertPage({ ...state.pages[0], updatedAt: '2026-07-15T13:00:00.000Z' });
		expect(undos[0].run()).toBe(false);
		expect(state.pages[0].title).toBe('After');
		expect(state.pages[0].updatedAt).toBe('2026-07-15T13:00:00.000Z');
		expect(state.adjustments.find((a) => a.id === undos[0].adjustmentId)?.undone).toBe(false);
	});

	it('43. archive_page undo restores archived:false; refuses on updatedAt drift', () => {
		const seed = makeSeedPage('p1', { archived: false });
		const ok = makeFakeHost({ state: { pages: [seed] } });
		const okRun = executeIntents(
			[call('a', 'archive_page', { id: 'p1', reason: 'done' })],
			ok.host
		);
		trackResultDetails(okRun.results);
		expect(ok.state.pages[0].archived).toBe(true);
		expect(okRun.undos[0].run()).toBe(true);
		expect(ok.state.pages[0].archived).toBe(false);
		expect(ok.state.adjustments.find((a) => a.id === okRun.undos[0].adjustmentId)?.undone).toBe(
			true
		);

		const drift = makeFakeHost({
			state: { pages: [makeSeedPage('p1', { archived: false })] }
		});
		const driftRun = executeIntents(
			[call('a2', 'archive_page', { id: 'p1', reason: 'done' })],
			drift.host
		);
		trackResultDetails(driftRun.results);
		drift.host.upsertPage({
			...drift.state.pages[0],
			updatedAt: '2026-07-15T13:00:00.000Z'
		});
		expect(driftRun.undos[0].run()).toBe(false);
		expect(drift.state.pages[0].archived).toBe(true);
		expect(drift.state.pages[0].updatedAt).toBe('2026-07-15T13:00:00.000Z');
		expect(
			drift.state.adjustments.find((a) => a.id === driftRun.undos[0].adjustmentId)?.undone
		).toBe(false);
	});

	it('44. update_config undo refuses when same key changed again (CAS)', () => {
		const { host, state } = makeFakeHost({
			state: {
				appConfig: {
					...createDefaultState().appConfig,
					progression: { display: 'score' }
				}
			}
		});
		const first = executeIntents(
			[
				call('cfg1', 'update_config', {
					patch: { 'progression.display': 'hidden' },
					reason: 'first'
				})
			],
			host
		);
		trackResultDetails(first.results);
		expect(state.appConfig.progression.display).toBe('hidden');

		const second = executeIntents(
			[
				call('cfg2', 'update_config', {
					patch: { 'progression.display': 'collection' },
					reason: 'second'
				})
			],
			host
		);
		trackResultDetails(second.results);
		expect(state.appConfig.progression.display).toBe('collection');

		expect(first.undos[0].run()).toBe(false);
		expect(state.appConfig.progression.display).toBe('collection');
		expect(state.adjustments.find((a) => a.id === first.undos[0].adjustmentId)?.undone).toBe(false);

		// Non-conflicting undo of the second call still works.
		expect(second.undos[0].run()).toBe(true);
		expect(state.appConfig.progression.display).toBe('hidden');
		expect(state.adjustments.find((a) => a.id === second.undos[0].adjustmentId)?.undone).toBe(true);
	});

	it('45. forgive_streak undo refuses when practiceDays/lastSessionDate drifted', () => {
		const { host, state } = makeFakeHost({
			todayISO: '2026-07-15',
			state: { practiceDays: 3, lastSessionDate: '2026-07-01' }
		});
		const { undos, results } = executeIntents(
			[call('f', 'forgive_streak', { reason: 'missed' })],
			host
		);
		trackResultDetails(results);
		expect(state.practiceDays).toBe(4);
		expect(state.lastSessionDate).toBe('2026-07-15');

		// Simulate a practice session in the toast window.
		host.setStreak(5, '2026-07-15');
		expect(undos[0].run()).toBe(false);
		expect(state.practiceDays).toBe(5);
		expect(state.lastSessionDate).toBe('2026-07-15');
		expect(state.adjustments.find((a) => a.id === undos[0].adjustmentId)?.undone).toBe(false);
		// Allowance not cleared.
		expect(state.steward.lastForgivenWeek).toBeTruthy();
	});

	it('46. create_page clamps overlong title/quip and reports capped', () => {
		const { host, state } = makeFakeHost();
		const longTitle = 'T'.repeat(PAGE_TITLE_MAX + 10);
		const longQuip = 'Q'.repeat(PAGE_QUIP_MAX + 10);
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ title: longTitle, quip: longQuip }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('capped');
		expect(results[0].detail).toMatch(/title trimmed/i);
		expect(results[0].detail).toMatch(/quip trimmed/i);
		expect(state.pages[0].title).toHaveLength(PAGE_TITLE_MAX);
		expect(state.pages[0].quip).toHaveLength(PAGE_QUIP_MAX);
	});

	// Case 28 already covers in-window drill questionsCapped (drill at index 0
	// with 11 questions → detail mentions questions, persists 10). Case 47 is
	// the out-of-window false-positive: an oversized drill past the block cap
	// must not claim questions were capped.

	it('47. create_page: oversized drill past block-20 cap must not claim questions capped', () => {
		const blocks = [
			...Array.from({ length: 20 }, (_, i) => noteBlock(`n${i}`)),
			{
				type: 'drill',
				title: 'Dropped drill',
				intro_quip: 'go',
				questions: Array.from({ length: 11 }, (_, i) => mcqQuestion(i))
			}
		];
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ blocks }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('capped');
		expect(results[0].detail).toMatch(/blocks capped at 20/i);
		expect(results[0].detail).not.toMatch(/question/i);
		expect(state.pages[0].blocks).toHaveLength(20);
		expect(state.pages[0].blocks.every((b) => b.type !== 'drill')).toBe(true);
	});

	it('48. create_page with title absent entirely → rejected, nothing persisted', () => {
		const args = validCreateArgs();
		delete args.title;
		const { host, state } = makeFakeHost();
		const { results } = executeIntents([call('c', 'create_page', args)], host);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/title/i);
		expect(state.pages).toHaveLength(0);
	});

	it("49. create_page with title: '' → rejected, nothing persisted", () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ title: '' }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/title/i);
		expect(state.pages).toHaveLength(0);
	});

	it('50. create_page with whitespace-only title → rejected, nothing persisted', () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ title: '   ' }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/title/i);
		expect(state.pages).toHaveLength(0);
	});

	it('51. create_page with non-string title → rejected, nothing persisted', () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ title: 123 }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/title/i);
		expect(state.pages).toHaveLength(0);
	});

	it('52. create_page with padded title persists original spacing (trim is check-only)', () => {
		const { host, state } = makeFakeHost();
		const { results } = executeIntents(
			[call('c', 'create_page', validCreateArgs({ title: '  Verbs  ' }))],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages[0].title).toBe('  Verbs  ');
	});

	// Case 32 covers update_page with title present (blocks omitted stay put).
	// Case 53 confirms the inverse: title omitted leaves the stored title alone.

	it('53. update_page with title omitted leaves stored title untouched', () => {
		const seed = makeSeedPage('p1', {
			title: 'Keep me',
			labels: ['grammar'],
			blocks: [{ type: 'note', body: 'seed' }]
		});
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { results } = executeIntents(
			[call('u', 'update_page', { id: 'p1', labels: ['vocab'], reason: 'r' })],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.pages[0].title).toBe('Keep me');
		expect(state.pages[0].labels).toEqual(['vocab']);
	});

	it('54. update_page with blank title rejects atomically (other fields do not apply)', () => {
		const seed = makeSeedPage('p1', {
			title: 'Keep me',
			labels: ['grammar'],
			blocks: [{ type: 'note', body: 'seed' }]
		});
		const { host, state } = makeFakeHost({ state: { pages: [seed] } });
		const { results } = executeIntents(
			[
				call('u', 'update_page', {
					id: 'p1',
					title: '',
					labels: ['vocab'],
					reason: 'blank title'
				})
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/title/i);
		expect(state.pages[0].title).toBe('Keep me');
		expect(state.pages[0].labels).toEqual(['grammar']);
	});
});

describe('executeIntents — sticker / mission / achievement settings', () => {
	it('nested progression.display collection (show stickers) applies and mutates state', () => {
		const { host, state } = makeFakeHost({
			state: { appConfig: { ...createDefaultState().appConfig, progression: { display: 'score' } } }
		});
		expect(state.appConfig.progression.display).toBe('score');

		const { results, dropped } = executeIntents(
			[
				call('s1', 'update_config', {
					patch: { progression: { display: 'collection' } },
					reason: 'she asked to see her stickers'
				})
			],
			host
		);
		trackResultDetails(results);

		expect(dropped).toEqual([]);
		expect(results).toHaveLength(1);
		expect(results[0].outcome).toBe('applied');
		expect(state.appConfig.progression.display).toBe('collection');
		expect(state.adjustments).toHaveLength(1);
		expect(state.adjustments[0].tool).toBe('update_config');
		expect(state.adjustments[0].outcome).toBe('applied');
	});

	it('nested missions off (remove missions) applies and hides missions', () => {
		const { host, state } = makeFakeHost();
		expect(state.appConfig.missions).toBe('on');

		const { results } = executeIntents(
			[
				call('m1', 'update_config', {
					patch: { missions: 'off' },
					reason: 'she hates missions'
				})
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.appConfig.missions).toBe('off');
	});

	it('invented show_stickers / remove_missions / remove_achievements are dropped, not success', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const earned = { ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' } };
		const { host, state } = makeFakeHost({
			state: {
				achievements: earned,
				appConfig: {
					...createDefaultState().appConfig,
					missions: 'on',
					progression: { display: 'score' }
				}
			}
		});
		const before = JSON.stringify({
			missions: state.appConfig.missions,
			display: state.appConfig.progression.display,
			achievements: state.achievements,
			currentGate: state.gates.current
		});

		const invented = [
			call('i1', 'show_stickers', { who: 'kuromi' }),
			call('i2', 'remove_missions', {}),
			call('i3', 'remove_achievements', { all: true }),
			call('i4', 'swap_question', { index: 0 }),
			call('i5', 'set_gate', { current: 4 }),
			call('i6', 'unlock_gate', { gate: 2 })
		];
		const { results, dropped, pendingToolCalls } = executeIntents(invented, host);
		trackResultDetails(results);

		expect(results).toEqual([]);
		expect(pendingToolCalls).toEqual([]);
		expect(dropped).toEqual(invented);
		expect(state.adjustments).toHaveLength(0);
		expect(
			JSON.stringify({
				missions: state.appConfig.missions,
				display: state.appConfig.progression.display,
				achievements: state.achievements,
				currentGate: state.gates.current
			})
		).toBe(before);
		expect(state.gates.current).toBe(1);
		expect(chooseReplyWhenPendingEmpty('Done, all gone! [mood: hehe]', 'fallback')).toBe(
			'fallback'
		);
	});

	it('hiding numbers via collection/hidden does not delete earned achievements', () => {
		const earned = { ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' } };
		const { host, state } = makeFakeHost({
			state: { achievements: earned }
		});
		const { results } = executeIntents(
			[
				call('h1', 'update_config', {
					patch: { progression: { display: 'hidden' } },
					reason: 'hide the numbers, not the medals'
				})
			],
			host
		);
		trackResultDetails(results);

		expect(results[0].outcome).toBe('applied');
		expect(state.appConfig.progression.display).toBe('hidden');
		expect(state.achievements).toEqual(earned);
	});

	it('update_config cannot write currentGate / gates', () => {
		const { host, state } = makeFakeHost();
		expect(state.gates.current).toBe(1);
		const { results } = executeIntents(
			[
				call('g1', 'update_config', {
					patch: { currentGate: 4, 'gates.current': 4, gate: 3 },
					reason: 'unlock her please'
				})
			],
			host
		);
		trackResultDetails(results);
		expect(results[0].outcome).toBe('rejected');
		expect(results[0].detail).toMatch(/currentGate|gates\.current|gate/);
		expect(state.gates.current).toBe(1);
		expect(state.gates.mastered).toEqual([]);
	});
});
