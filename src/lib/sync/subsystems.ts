// ============================================================
// SUBSYSTEM PARTITION / ASSEMBLE / MERGE
// Pure, network-free projection of CurrentState into
// six independent subsystem slices with fixed per-subsystem merge
// rules. No I/O, no Date.now(), no Svelte runes.
// ============================================================

import type {
	CurrentState,
	StateV19,
	SyncedCardReview,
	MissionState,
	ConversationQuestionResult,
	ReviewSubmission,
	LuisterenQuestionResult,
	LezenQuestionResult,
	DailyHomeworkState,
	DailyQuizState,
	DailyReadState,
	AdjustmentEntry,
	AppConfig,
	StewardLedger,
	StewardAward,
	GlowRule,
	KuromiPage,
	KuromiConversation,
	GatesState,
	GateId,
	SwapLedger
} from '$lib/state/schema';
import {
	ADJUSTMENT_TOOL_NAMES,
	CURRENT_SCHEMA_VERSION,
	EMPTY_SWAPS,
	GLOW_RULES
} from '$lib/state/schema';
import { createDefaultState } from '$lib/state/defaults';
import type { Miss, ReadingForkState } from '$lib/reading/types';
import { EMPTY_READING_FORK } from '$lib/reading/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type Subsystem = 'srs' | 'progress' | 'daily' | 'config' | 'adjustments' | 'pages';

export const SUBSYSTEMS: readonly Subsystem[] = [
	'srs',
	'progress',
	'daily',
	'config',
	'adjustments',
	'pages'
] as const;

export interface AuditNote {
	at: string;
	subsystem: Subsystem;
	field: string;
	local: unknown;
	remote: unknown;
	resolved: unknown;
}

export interface MergeOptions {
	/** True when the local copy holds changes not yet written to the server. */
	localDirty?: boolean;
}

/** Opaque sync entity: merge validates only id + updatedAt. */
type SyncEntity = { id: string; updatedAt: string };

interface PagesSlice {
	pages: KuromiPage[];
	conversations: KuromiConversation[];
}

const ADJUSTMENT_TOOL_NAME_SET: ReadonlySet<string> = new Set(ADJUSTMENT_TOOL_NAMES);

// ---------------------------------------------------------------------------
// Slice shapes (internal)
// ---------------------------------------------------------------------------

interface SrsSlice {
	cardReviews: Record<string, SyncedCardReview>;
}

interface ProgressCards {
	reviewedToday: number;
	lastReviewDate: string | null;
	totalReviewed: number;
}

interface ProgressSlice {
	schemaVersion: number;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	lpEarnedToday: number;
	lastLpDate: string | null;
	lastModified: string | null;
	match: StateV19['match'];
	boss: StateV19['boss'];
	achievements: StateV19['achievements'];
	missions: StateV19['missions'];
	conversation: StateV19['conversation'];
	reviews: StateV19['reviews'];
	luisteren: StateV19['luisteren'];
	lezen: StateV19['lezen'];
	cards: ProgressCards;
	steward: StewardLedger;
	gates: GatesState;
}

interface DailySlice {
	dailyHomework: DailyHomeworkState;
	dailyQuiz: DailyQuizState;
	dailyRead: DailyReadState;
	readingFork: ReadingForkState;
}

interface ConfigSlice {
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	cards: { newCardsPerDay: number };
	appConfig: AppConfig;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function isRecord(x: unknown): x is Record<string, unknown> {
	return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isArray(x: unknown): x is unknown[] {
	return Array.isArray(x);
}

/** null sorts earliest. Plain string compare works for ISO / YYYY-MM-DD. */
function laterDate(a: string | null, b: string | null): string | null {
	if (a === null && b === null) return null;
	if (a === null) return b;
	if (b === null) return a;
	return a >= b ? a : b;
}

function deepEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

function asNumber(x: unknown, fallback: number): number {
	return typeof x === 'number' && Number.isFinite(x) ? x : fallback;
}

/** Same calendar day: keep-local ids, max(used). Different dates: later ledger wins. */
function mergeSwapLedgers(
	local: SwapLedger | undefined,
	remote: SwapLedger | undefined
): SwapLedger {
	const L = local ?? EMPTY_SWAPS;
	const R = remote ?? EMPTY_SWAPS;
	if (L.date !== R.date) {
		const later = laterDate(L.date, R.date);
		return later === L.date
			? { date: L.date, used: asNumber(L.used, 0), swappedOutIds: [...(L.swappedOutIds ?? [])] }
			: { date: R.date, used: asNumber(R.used, 0), swappedOutIds: [...(R.swappedOutIds ?? [])] };
	}
	return {
		date: L.date,
		used: Math.max(asNumber(L.used, 0), asNumber(R.used, 0)),
		swappedOutIds: Array.isArray(L.swappedOutIds) ? [...L.swappedOutIds] : []
	};
}

function asBoolean(x: unknown, fallback: boolean): boolean {
	return typeof x === 'boolean' ? x : fallback;
}

function asNullableString(x: unknown): string | null {
	if (x === null) return null;
	return typeof x === 'string' ? x : null;
}

function note(
	at: string,
	subsystem: Subsystem,
	field: string,
	local: unknown,
	remote: unknown,
	resolved: unknown
): AuditNote {
	return { at, subsystem, field, local, remote, resolved };
}

// ---------------------------------------------------------------------------
// partition
// ---------------------------------------------------------------------------

export function partition(state: CurrentState): Record<Subsystem, unknown> {
	return {
		srs: {
			cardReviews: state.cardReviews
		} satisfies SrsSlice,
		progress: {
			schemaVersion: state.schemaVersion,
			rank: state.rank,
			tier: state.tier,
			lp: state.lp,
			totalLp: state.totalLp,
			practiceDays: state.practiceDays,
			lastSessionDate: state.lastSessionDate,
			lastDailyBonusDate: state.lastDailyBonusDate,
			lpEarnedToday: state.lpEarnedToday,
			lastLpDate: state.lastLpDate,
			lastModified: state.lastModified,
			match: state.match,
			boss: state.boss,
			achievements: state.achievements,
			missions: state.missions,
			conversation: state.conversation,
			reviews: state.reviews,
			luisteren: state.luisteren,
			lezen: state.lezen,
			cards: {
				reviewedToday: state.cards.reviewedToday,
				lastReviewDate: state.cards.lastReviewDate,
				totalReviewed: state.cards.totalReviewed
			},
			steward: state.steward,
			gates: state.gates
		} satisfies ProgressSlice,
		daily: {
			dailyHomework: state.dailyHomework,
			dailyQuiz: state.dailyQuiz,
			dailyRead: state.dailyRead,
			readingFork: state.readingFork
		} satisfies DailySlice,
		config: {
			tts: { googleApiKey: state.tts.googleApiKey },
			audio: { sfxMuted: state.audio.sfxMuted },
			cards: { newCardsPerDay: state.cards.newCardsPerDay },
			appConfig: state.appConfig
		} satisfies ConfigSlice,
		adjustments: state.adjustments,
		pages: {
			pages: state.pages,
			conversations: state.conversations
		} satisfies PagesSlice
	};
}

// ---------------------------------------------------------------------------
// assemble
// ---------------------------------------------------------------------------

const defaultParts: Record<Subsystem, unknown> = partition(createDefaultState());

function pickPart(parts: Partial<Record<Subsystem, unknown>>, key: Subsystem): unknown {
	return key in parts && parts[key] !== undefined ? parts[key] : defaultParts[key];
}

function readProgress(raw: unknown): ProgressSlice {
	const fb = defaultParts.progress as ProgressSlice;
	if (!isRecord(raw)) return structuredCloneProgress(fb);
	const match = isRecord(raw.match) ? raw.match : (fb.match as unknown as Record<string, unknown>);
	const boss = isRecord(raw.boss) ? raw.boss : (fb.boss as unknown as Record<string, unknown>);
	const cards = isRecord(raw.cards) ? raw.cards : {};
	const missions = isRecord(raw.missions) ? raw.missions : {};
	const conversation = isRecord(raw.conversation) ? raw.conversation : {};
	const reviews = isRecord(raw.reviews) ? raw.reviews : {};
	const luisteren = isRecord(raw.luisteren) ? raw.luisteren : {};
	const lezen = isRecord(raw.lezen) ? raw.lezen : {};

	return {
		schemaVersion: asNumber(raw.schemaVersion, fb.schemaVersion),
		rank: asNumber(raw.rank, fb.rank),
		tier: asNumber(raw.tier, fb.tier),
		lp: asNumber(raw.lp, fb.lp),
		totalLp: asNumber(raw.totalLp, fb.totalLp),
		practiceDays: asNumber(raw.practiceDays, fb.practiceDays),
		lastSessionDate: asNullableString(raw.lastSessionDate),
		lastDailyBonusDate: asNullableString(raw.lastDailyBonusDate),
		lpEarnedToday: asNumber(raw.lpEarnedToday, fb.lpEarnedToday),
		lastLpDate: asNullableString(raw.lastLpDate),
		lastModified: asNullableString(raw.lastModified),
		match: {
			completedToday: asNumber(match.completedToday, fb.match.completedToday),
			lastMatchDate: asNullableString(match.lastMatchDate),
			bestStreak: asNumber(match.bestStreak, fb.match.bestStreak)
		},
		boss: {
			attempts: asNumber(boss.attempts, fb.boss.attempts),
			wins: asNumber(boss.wins, fb.boss.wins),
			losses: asNumber(boss.losses, fb.boss.losses),
			rankDefeated: asNumber(boss.rankDefeated, fb.boss.rankDefeated)
		},
		achievements: isRecord(raw.achievements)
			? (raw.achievements as StateV19['achievements'])
			: fb.achievements,
		missions: {
			daily: isArray(missions.daily) ? (missions.daily as MissionState[]) : fb.missions.daily,
			lastMissionDate: asNullableString(missions.lastMissionDate)
		},
		conversation: {
			readChapters: isArray(conversation.readChapters)
				? (conversation.readChapters as string[])
				: fb.conversation.readChapters,
			questionResults: isRecord(conversation.questionResults)
				? (conversation.questionResults as Record<string, ConversationQuestionResult>)
				: fb.conversation.questionResults,
			currentStory: asNullableString(conversation.currentStory),
			currentChapter: asNumber(conversation.currentChapter, fb.conversation.currentChapter)
		},
		reviews: {
			submissions: isRecord(reviews.submissions)
				? (reviews.submissions as Record<string, ReviewSubmission>)
				: fb.reviews.submissions
		},
		luisteren: {
			questionResults: isRecord(luisteren.questionResults)
				? (luisteren.questionResults as Record<string, LuisterenQuestionResult>)
				: fb.luisteren.questionResults
		},
		lezen: {
			questionResults: isRecord(lezen.questionResults)
				? (lezen.questionResults as Record<string, LezenQuestionResult>)
				: fb.lezen.questionResults
		},
		cards: {
			reviewedToday: asNumber(cards.reviewedToday, fb.cards.reviewedToday),
			lastReviewDate: asNullableString(cards.lastReviewDate),
			totalReviewed: asNumber(cards.totalReviewed, fb.cards.totalReviewed)
		},
		steward: readSteward(raw.steward, fb.steward),
		gates: readGates(raw.gates, fb.gates)
	};
}

function isStewardAward(x: unknown): x is StewardAward {
	if (!isRecord(x)) return false;
	return (
		typeof x.id === 'string' &&
		typeof x.at === 'string' &&
		typeof x.amount === 'number' &&
		Number.isFinite(x.amount) &&
		x.amount > 0
	);
}

function isGateId(n: unknown): n is GateId {
	return n === 1 || n === 2 || n === 3 || n === 4;
}

function readGates(raw: unknown, fallback: GatesState): GatesState {
	if (!isRecord(raw)) {
		return {
			current: fallback.current,
			mastered: [...fallback.mastered],
			quizLog: [...fallback.quizLog],
			weekLog: [...fallback.weekLog]
		};
	}
	return {
		current: isGateId(raw.current) ? raw.current : fallback.current,
		mastered: isArray(raw.mastered)
			? raw.mastered.filter((n): n is number => typeof n === 'number')
			: [...fallback.mastered],
		quizLog: isArray(raw.quizLog) ? (raw.quizLog as GatesState['quizLog']) : [...fallback.quizLog],
		weekLog: isArray(raw.weekLog) ? (raw.weekLog as GatesState['weekLog']) : [...fallback.weekLog]
	};
}

function mergeLogByKey<T extends { gate: number }>(
	local: T[],
	remote: T[],
	keyOf: (e: T) => string
): T[] {
	const map = new Map<string, T>();
	for (const entry of remote) map.set(keyOf(entry), entry);
	for (const entry of local) map.set(keyOf(entry), entry);
	return [...map.values()];
}

function mergeGates(local: GatesState, remote: GatesState): GatesState {
	const mastered = [...new Set([...local.mastered, ...remote.mastered])].sort((a, b) => a - b);
	const fromMastered = mastered.length > 0 ? Math.min(4, Math.max(...mastered) + 1) : 1;
	const current = (Math.max(local.current, remote.current, fromMastered) as GateId) || 1;
	return {
		current: current > 4 ? 4 : current,
		mastered,
		quizLog: mergeLogByKey(local.quizLog, remote.quizLog, (e) => `${e.gate}:${e.date}`),
		weekLog: mergeLogByKey(local.weekLog, remote.weekLog, (e) => `${e.gate}:${e.week}`)
	};
}

function readSteward(raw: unknown, fallback: StewardLedger): StewardLedger {
	if (!isRecord(raw) || !isArray(raw.awards)) {
		return { awards: [...fallback.awards], lastForgivenWeek: fallback.lastForgivenWeek };
	}
	return {
		awards: raw.awards.filter(isStewardAward),
		lastForgivenWeek: asNullableString(raw.lastForgivenWeek)
	};
}

function structuredCloneProgress(p: ProgressSlice): ProgressSlice {
	return JSON.parse(JSON.stringify(p)) as ProgressSlice;
}

function readConfig(raw: unknown): ConfigSlice {
	const fb = defaultParts.config as ConfigSlice;
	if (!isRecord(raw))
		return {
			...fb,
			tts: { ...fb.tts },
			audio: { ...fb.audio },
			cards: { ...fb.cards },
			appConfig: readAppConfig(undefined)
		};
	const tts = isRecord(raw.tts) ? raw.tts : {};
	const audio = isRecord(raw.audio) ? raw.audio : {};
	const cards = isRecord(raw.cards) ? raw.cards : {};
	return {
		tts: {
			googleApiKey:
				tts.googleApiKey === null || typeof tts.googleApiKey === 'string'
					? (tts.googleApiKey as string | null)
					: fb.tts.googleApiKey
		},
		audio: { sfxMuted: asBoolean(audio.sfxMuted, fb.audio.sfxMuted) },
		cards: { newCardsPerDay: asNumber(cards.newCardsPerDay, fb.cards.newCardsPerDay) },
		appConfig: readAppConfig(raw.appConfig)
	};
}

function structuredCloneAppConfig(c: AppConfig): AppConfig {
	return JSON.parse(JSON.stringify(c)) as AppConfig;
}

/** Validate appConfig from outside the executor (pull / localStorage / Kuromi). */
function readAppConfig(raw: unknown): AppConfig {
	const fb = (defaultParts.config as ConfigSlice).appConfig;
	if (!isRecord(raw)) return structuredCloneAppConfig(fb);

	const progressionRaw = isRecord(raw.progression) ? raw.progression : {};
	const display =
		progressionRaw.display === 'score' ||
		progressionRaw.display === 'collection' ||
		progressionRaw.display === 'hidden'
			? progressionRaw.display
			: fb.progression.display;

	const streaks =
		raw.streaks === 'strict' || raw.streaks === 'gentle' || raw.streaks === 'off'
			? raw.streaks
			: fb.streaks;

	const missions = raw.missions === 'on' || raw.missions === 'off' ? raw.missions : fb.missions;

	const quizRaw = isRecord(raw.quiz) ? raw.quiz : {};
	let focusCategories: string[];
	if (isArray(quizRaw.focusCategories)) {
		focusCategories = quizRaw.focusCategories.filter((x): x is string => typeof x === 'string');
	} else {
		focusCategories = [...fb.quiz.focusCategories];
	}

	const dailyPathRaw = isRecord(raw.dailyPath) ? raw.dailyPath : {};
	let order: GlowRule[];
	if (isArray(dailyPathRaw.order)) {
		const glowSet = new Set<string>(GLOW_RULES);
		const seen = new Set<string>();
		order = [];
		for (const item of dailyPathRaw.order) {
			if (typeof item === 'string' && glowSet.has(item) && !seen.has(item)) {
				seen.add(item);
				order.push(item as GlowRule);
			}
		}
		// Empty after filtering is legal ("nothing glows") — do not replace with default.
	} else {
		order = [...fb.dailyPath.order];
	}

	return {
		progression: { display },
		streaks,
		missions,
		quiz: { focusCategories },
		dailyPath: { order }
	};
}

function readDaily(raw: unknown): DailySlice {
	const fb = defaultParts.daily as DailySlice;
	if (!isRecord(raw)) {
		return JSON.parse(JSON.stringify(fb)) as DailySlice;
	}
	return {
		dailyHomework: isRecord(raw.dailyHomework)
			? (raw.dailyHomework as unknown as DailyHomeworkState)
			: fb.dailyHomework,
		dailyQuiz: isRecord(raw.dailyQuiz)
			? (raw.dailyQuiz as unknown as DailyQuizState)
			: fb.dailyQuiz,
		dailyRead: isRecord(raw.dailyRead)
			? (raw.dailyRead as unknown as DailyReadState)
			: fb.dailyRead,
		readingFork: isRecord(raw.readingFork)
			? (raw.readingFork as unknown as ReadingForkState)
			: structuredClone(EMPTY_READING_FORK)
	};
}

function readSrs(raw: unknown): SrsSlice {
	const fb = defaultParts.srs as SrsSlice;
	if (!isRecord(raw)) return { cardReviews: { ...fb.cardReviews } };
	if (!isRecord(raw.cardReviews)) return { cardReviews: { ...fb.cardReviews } };
	return { cardReviews: raw.cardReviews as Record<string, SyncedCardReview> };
}

export function assemble(parts: Partial<Record<Subsystem, unknown>>): CurrentState {
	const progress = readProgress(pickPart(parts, 'progress'));
	const config = readConfig(pickPart(parts, 'config'));
	const daily = readDaily(pickPart(parts, 'daily'));
	const srs = readSrs(pickPart(parts, 'srs'));
	const adjustmentsRaw = pickPart(parts, 'adjustments');
	const adjustments = isArray(adjustmentsRaw)
		? adjustmentsRaw.filter(isAdjustmentEntry).map(normalizeAdjustmentEntry)
		: [];
	const pagesSlice = normalizePagesSlice(pickPart(parts, 'pages'));

	const state: CurrentState = {
		schemaVersion: CURRENT_SCHEMA_VERSION,
		rank: progress.rank,
		tier: progress.tier,
		lp: progress.lp,
		totalLp: progress.totalLp,
		practiceDays: progress.practiceDays,
		lastSessionDate: progress.lastSessionDate,
		lastDailyBonusDate: progress.lastDailyBonusDate,
		lpEarnedToday: progress.lpEarnedToday,
		lastLpDate: progress.lastLpDate,
		lastModified: progress.lastModified,
		tts: { googleApiKey: config.tts.googleApiKey },
		audio: { sfxMuted: config.audio.sfxMuted },
		match: {
			completedToday: progress.match.completedToday,
			lastMatchDate: progress.match.lastMatchDate,
			bestStreak: progress.match.bestStreak
		},
		cards: {
			reviewedToday: progress.cards.reviewedToday,
			lastReviewDate: progress.cards.lastReviewDate,
			totalReviewed: progress.cards.totalReviewed,
			newCardsPerDay: config.cards.newCardsPerDay
		},
		boss: {
			attempts: progress.boss.attempts,
			wins: progress.boss.wins,
			losses: progress.boss.losses,
			rankDefeated: progress.boss.rankDefeated
		},
		achievements: progress.achievements,
		missions: {
			daily: progress.missions.daily,
			lastMissionDate: progress.missions.lastMissionDate
		},
		conversation: {
			readChapters: progress.conversation.readChapters,
			questionResults: progress.conversation.questionResults,
			currentStory: progress.conversation.currentStory,
			currentChapter: progress.conversation.currentChapter
		},
		reviews: { submissions: progress.reviews.submissions },
		luisteren: { questionResults: progress.luisteren.questionResults },
		lezen: { questionResults: progress.lezen.questionResults },
		cardReviews: srs.cardReviews,
		dailyHomework: daily.dailyHomework,
		dailyQuiz: daily.dailyQuiz,
		dailyRead: daily.dailyRead,
		readingFork: daily.readingFork,
		appConfig: config.appConfig,
		adjustments,
		steward: progress.steward,
		pages: pagesSlice.pages,
		conversations: pagesSlice.conversations,
		gates: progress.gates
	};
	return state;
}

// ---------------------------------------------------------------------------
// mergeSubsystem
// ---------------------------------------------------------------------------

export function mergeSubsystem(
	subsystem: Subsystem,
	local: unknown,
	remote: unknown,
	now: string,
	opts?: MergeOptions
): { value: unknown; notes: AuditNote[] } {
	switch (subsystem) {
		case 'srs':
			return mergeSrs(local, remote);
		case 'progress':
			return mergeProgress(local, remote, now);
		case 'daily':
			return mergeDaily(local, remote, now);
		case 'config':
			return mergeConfig(local, remote, now, opts);
		case 'adjustments':
			return mergeAdjustments(local, remote);
		case 'pages':
			return mergePages(local, remote);
	}
}

// ---- srs ------------------------------------------------------------------

function isCardReview(x: unknown): x is SyncedCardReview {
	if (!isRecord(x)) return false;
	return (
		typeof x.wordId === 'string' &&
		typeof x.interval === 'number' &&
		typeof x.easeFactor === 'number' &&
		typeof x.repetitions === 'number' &&
		typeof x.nextReviewDate === 'string' &&
		typeof x.lastReviewDate === 'string' &&
		typeof x.firstSeenDate === 'string'
	);
}

function mergeSrs(local: unknown, remote: unknown): { value: unknown; notes: AuditNote[] } {
	const localMap = extractCardReviews(local);
	const remoteMap = extractCardReviews(remote);
	if (localMap === null && remoteMap === null) {
		return { value: { cardReviews: {} }, notes: [] };
	}
	if (localMap === null) return { value: { cardReviews: remoteMap }, notes: [] };
	if (remoteMap === null) return { value: { cardReviews: localMap }, notes: [] };

	const keys = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
	const out: Record<string, SyncedCardReview> = {};
	for (const id of keys) {
		const l = localMap[id];
		const r = remoteMap[id];
		if (l && !r) {
			out[id] = l;
		} else if (r && !l) {
			out[id] = r;
		} else if (l && r) {
			// later lastReviewDate wins (plain string compare)
			out[id] = l.lastReviewDate >= r.lastReviewDate ? l : r;
		}
	}
	return { value: { cardReviews: out }, notes: [] };
}

function extractCardReviews(side: unknown): Record<string, SyncedCardReview> | null {
	if (!isRecord(side)) return null;
	const cr = side.cardReviews;
	if (!isRecord(cr)) return null;
	const out: Record<string, SyncedCardReview> = {};
	for (const [k, v] of Object.entries(cr)) {
		if (isCardReview(v)) out[k] = v;
	}
	return out;
}

// ---- progress -------------------------------------------------------------

function mergeProgress(
	local: unknown,
	remote: unknown,
	now: string
): { value: unknown; notes: AuditNote[] } {
	if (!isRecord(local) && !isRecord(remote)) {
		return { value: structuredCloneProgress(defaultParts.progress as ProgressSlice), notes: [] };
	}
	if (!isRecord(local)) return { value: remote, notes: [] };
	if (!isRecord(remote)) return { value: local, notes: [] };

	const L = readProgress(local);
	const R = readProgress(remote);
	const notes: AuditNote[] = [];
	const sub: Subsystem = 'progress';

	// Monotonic counters
	const totalLp = Math.max(L.totalLp, R.totalLp);
	const practiceDays = Math.max(L.practiceDays, R.practiceDays);
	const schemaVersion = Math.max(L.schemaVersion, R.schemaVersion);

	// rank/tier/lp atomic tuple from greater totalLp side
	const localTuple: [number, number, number] = [L.rank, L.tier, L.lp];
	const remoteTuple: [number, number, number] = [R.rank, R.tier, R.lp];
	let resolvedTuple: [number, number, number];
	if (L.totalLp > R.totalLp) {
		resolvedTuple = localTuple;
	} else if (R.totalLp > L.totalLp) {
		resolvedTuple = remoteTuple;
	} else {
		resolvedTuple = lexMaxTuple(localTuple, remoteTuple);
	}
	if (L.totalLp !== R.totalLp || !deepEqual(localTuple, remoteTuple)) {
		notes.push(note(now, sub, 'rank+tier+lp', localTuple, remoteTuple, resolvedTuple));
	}

	// lpEarnedToday / lastLpDate paired
	let lpEarnedToday: number;
	let lastLpDate: string | null;
	if (L.lastLpDate === R.lastLpDate) {
		lpEarnedToday = Math.max(L.lpEarnedToday, R.lpEarnedToday);
		lastLpDate = L.lastLpDate;
	} else {
		const later = laterDate(L.lastLpDate, R.lastLpDate);
		if (later === L.lastLpDate) {
			lpEarnedToday = L.lpEarnedToday;
			lastLpDate = L.lastLpDate;
		} else {
			lpEarnedToday = R.lpEarnedToday;
			lastLpDate = R.lastLpDate;
		}
		notes.push(
			note(
				now,
				sub,
				'lpEarnedToday+lastLpDate',
				{ lpEarnedToday: L.lpEarnedToday, lastLpDate: L.lastLpDate },
				{ lpEarnedToday: R.lpEarnedToday, lastLpDate: R.lastLpDate },
				{ lpEarnedToday, lastLpDate }
			)
		);
	}

	const lastSessionDate = laterDate(L.lastSessionDate, R.lastSessionDate);
	const lastDailyBonusDate = laterDate(L.lastDailyBonusDate, R.lastDailyBonusDate);
	const lastModified = laterDate(L.lastModified, R.lastModified);

	const match = {
		completedToday: Math.max(L.match.completedToday, R.match.completedToday),
		lastMatchDate: laterDate(L.match.lastMatchDate, R.match.lastMatchDate),
		bestStreak: Math.max(L.match.bestStreak, R.match.bestStreak)
	};

	const cards = {
		reviewedToday: Math.max(L.cards.reviewedToday, R.cards.reviewedToday),
		lastReviewDate: laterDate(L.cards.lastReviewDate, R.cards.lastReviewDate),
		totalReviewed: Math.max(L.cards.totalReviewed, R.cards.totalReviewed)
	};

	const boss = {
		attempts: Math.max(L.boss.attempts, R.boss.attempts),
		wins: Math.max(L.boss.wins, R.boss.wins),
		losses: Math.max(L.boss.losses, R.boss.losses),
		rankDefeated: Math.max(L.boss.rankDefeated, R.boss.rankDefeated)
	};

	const achievements = mergeAchievements(L.achievements, R.achievements, now, notes);
	const missions = mergeMissions(L.missions, R.missions, now, notes);
	const conversation = mergeConversation(L.conversation, R.conversation, now, notes);
	const reviews = mergeReviews(L.reviews, R.reviews, now, notes);
	const luisteren = {
		questionResults: mergeQuestionResults(
			L.luisteren.questionResults,
			R.luisteren.questionResults,
			'luisteren.questionResults',
			now,
			notes
		)
	};
	const lezen = {
		questionResults: mergeQuestionResults(
			L.lezen.questionResults,
			R.lezen.questionResults,
			'lezen.questionResults',
			now,
			notes
		)
	};

	// Steward is independent of the D57 rank/tier/lp atomic tuple: awards must
	// UNION across devices so a lower-totalLp side never loses its cap entries.
	const steward = mergeSteward(L.steward, R.steward, now);
	const gates = mergeGates(L.gates, R.gates);

	const value: ProgressSlice = {
		schemaVersion,
		rank: resolvedTuple[0],
		tier: resolvedTuple[1],
		lp: resolvedTuple[2],
		totalLp,
		practiceDays,
		lastSessionDate,
		lastDailyBonusDate,
		lpEarnedToday,
		lastLpDate,
		lastModified,
		match,
		boss,
		achievements,
		missions,
		conversation,
		reviews,
		luisteren,
		lezen,
		cards,
		steward,
		gates
	};
	return { value, notes };
}

const STEWARD_AWARD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function mergeSteward(local: StewardLedger, remote: StewardLedger, now: string): StewardLedger {
	// Union by id; local wins exact-duplicate ties. More surviving awards =
	// more restrictive cap (fail-safe). Then drop awards older than 7 days.
	const byId = new Map<string, StewardAward>();
	for (const a of remote.awards) byId.set(a.id, a);
	for (const a of local.awards) byId.set(a.id, a);
	const nowMs = Date.parse(now);
	const awards = Array.from(byId.values()).filter((a) => {
		const atMs = Date.parse(a.at);
		// Malformed "at" → NaN; nowMs - NaN is NaN; NaN > TTL is false → KEEP (deliberate: must not prune/loosen the cap).
		return !(nowMs - atMs > STEWARD_AWARD_TTL_MS);
	});
	return {
		awards,
		lastForgivenWeek: laterDate(local.lastForgivenWeek, remote.lastForgivenWeek)
	};
}

function lexMaxTuple(
	a: [number, number, number],
	b: [number, number, number]
): [number, number, number] {
	for (let i = 0; i < 3; i++) {
		if (a[i] > b[i]) return a;
		if (a[i] < b[i]) return b;
	}
	return a;
}

function mergeAchievements(
	local: StateV19['achievements'],
	remote: StateV19['achievements'],
	now: string,
	notes: AuditNote[]
): StateV19['achievements'] {
	const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
	const out: StateV19['achievements'] = {};
	for (const key of keys) {
		const l = local[key];
		const r = remote[key];
		if (l && !r) {
			out[key] = l;
			continue;
		}
		if (r && !l) {
			out[key] = r;
			continue;
		}
		if (!l || !r) continue;
		const lAt = l.unlockedAt;
		const rAt = r.unlockedAt;
		if (lAt !== null && rAt === null) {
			out[key] = l;
		} else if (rAt !== null && lAt === null) {
			out[key] = r;
		} else if (lAt !== null && rAt !== null && lAt !== rAt) {
			// both non-null and differ → earlier unlockedAt
			const earlier = lAt <= rAt ? l : r;
			out[key] = earlier;
			notes.push(note(now, 'progress', `achievements.${key}`, l, r, earlier));
		} else {
			// both equal or both null → keep local
			out[key] = l;
		}
	}
	return out;
}

function mergeMissions(
	local: StateV19['missions'],
	remote: StateV19['missions'],
	now: string,
	notes: AuditNote[]
): StateV19['missions'] {
	const byId = new Map<string, MissionState>();
	for (const m of local.daily) {
		if (m && typeof m.id === 'string') byId.set(m.id, m);
	}
	for (const m of remote.daily) {
		if (!m || typeof m.id !== 'string') continue;
		const existing = byId.get(m.id);
		if (!existing) {
			byId.set(m.id, m);
			continue;
		}
		const merged: MissionState = {
			id: m.id,
			progress: Math.max(existing.progress, m.progress),
			completed: existing.completed || m.completed
		};
		if (!deepEqual(existing, m)) {
			notes.push(note(now, 'progress', `missions.daily.${m.id}`, existing, m, merged));
		}
		byId.set(m.id, merged);
	}
	return {
		daily: Array.from(byId.values()),
		lastMissionDate: laterDate(local.lastMissionDate, remote.lastMissionDate)
	};
}

function mergeConversation(
	local: StateV19['conversation'],
	remote: StateV19['conversation'],
	now: string,
	notes: AuditNote[]
): StateV19['conversation'] {
	const chapterSet = new Set<string>([
		...local.readChapters.filter((c): c is string => typeof c === 'string'),
		...remote.readChapters.filter((c): c is string => typeof c === 'string')
	]);
	const readChapters = Array.from(chapterSet).sort();

	const questionResults = mergeQuestionResults(
		local.questionResults,
		remote.questionResults,
		'conversation.questionResults',
		now,
		notes
	);

	const localPair = { currentStory: local.currentStory, currentChapter: local.currentChapter };
	const remotePair = { currentStory: remote.currentStory, currentChapter: remote.currentChapter };
	let resolvedPair: { currentStory: string | null; currentChapter: number };
	if (local.currentChapter > remote.currentChapter) {
		resolvedPair = localPair;
	} else if (remote.currentChapter > local.currentChapter) {
		resolvedPair = remotePair;
	} else {
		resolvedPair = localPair; // tie → keep local
	}
	if (!deepEqual(localPair, remotePair)) {
		notes.push(
			note(now, 'progress', 'currentStory+currentChapter', localPair, remotePair, resolvedPair)
		);
	}

	return {
		readChapters,
		questionResults,
		currentStory: resolvedPair.currentStory,
		currentChapter: resolvedPair.currentChapter
	};
}

function mergeQuestionResults(
	local: Record<string, { correct: boolean; attemptedAt: string }>,
	remote: Record<string, { correct: boolean; attemptedAt: string }>,
	fieldPrefix: string,
	now: string,
	notes: AuditNote[]
): Record<string, { correct: boolean; attemptedAt: string }> {
	const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
	const out: Record<string, { correct: boolean; attemptedAt: string }> = {};
	for (const key of keys) {
		const l = local[key];
		const r = remote[key];
		if (l && !r) {
			out[key] = l;
			continue;
		}
		if (r && !l) {
			out[key] = r;
			continue;
		}
		if (!l || !r) continue;
		if (l.attemptedAt !== r.attemptedAt) {
			// earlier attemptedAt wins wholesale
			const winner = l.attemptedAt <= r.attemptedAt ? l : r;
			out[key] = winner;
			notes.push(note(now, 'progress', `${fieldPrefix}.${key}`, l, r, winner));
		} else {
			out[key] = l;
		}
	}
	return out;
}

function mergeReviews(
	local: StateV19['reviews'],
	remote: StateV19['reviews'],
	now: string,
	notes: AuditNote[]
): StateV19['reviews'] {
	const lSub = local.submissions;
	const rSub = remote.submissions;
	const keys = new Set([...Object.keys(lSub), ...Object.keys(rSub)]);
	const submissions: Record<string, ReviewSubmission> = {};
	for (const key of keys) {
		const l = lSub[key];
		const r = rSub[key];
		if (l && !r) {
			submissions[key] = l;
			continue;
		}
		if (r && !l) {
			submissions[key] = r;
			continue;
		}
		if (!l || !r) continue;
		if (deepEqual(l, r)) {
			submissions[key] = l;
			continue;
		}
		let winner: ReviewSubmission;
		const lRev = l.reviewedAt;
		const rRev = r.reviewedAt;
		if (lRev !== null && rRev === null) {
			winner = l;
		} else if (rRev !== null && lRev === null) {
			winner = r;
		} else if (lRev !== null && rRev !== null && lRev !== rRev) {
			// both non-null and differ → later reviewedAt
			winner = lRev >= rRev ? l : r;
		} else if (lRev === null && rRev === null) {
			// both null → later submittedAt, tie → local
			if (l.submittedAt > r.submittedAt) winner = l;
			else if (r.submittedAt > l.submittedAt) winner = r;
			else winner = l;
		} else {
			// both reviewedAt non-null and equal (or other) → keep local
			winner = l;
		}
		submissions[key] = winner;
		notes.push(note(now, 'progress', `reviews.submissions.${key}`, l, r, winner));
	}
	return { submissions };
}

// ---- daily ----------------------------------------------------------------

function mergeDaily(
	local: unknown,
	remote: unknown,
	now: string
): { value: unknown; notes: AuditNote[] } {
	if (!isRecord(local) && !isRecord(remote)) {
		return { value: JSON.parse(JSON.stringify(defaultParts.daily)), notes: [] };
	}
	if (!isRecord(local)) return { value: remote, notes: [] };
	if (!isRecord(remote)) return { value: local, notes: [] };

	const notes: AuditNote[] = [];
	const L = readDaily(local);
	const R = readDaily(remote);

	const dailyHomework = mergeDailyHomework(L.dailyHomework, R.dailyHomework, now, notes);
	const dailyQuiz = mergeDailyQuiz(L.dailyQuiz, R.dailyQuiz, now, notes);
	const dailyRead = mergeDailyRead(L.dailyRead, R.dailyRead, now, notes);
	const readingFork = mergeReadingFork(L.readingFork, R.readingFork, now, notes);

	return {
		value: { dailyHomework, dailyQuiz, dailyRead, readingFork } satisfies DailySlice,
		notes
	};
}

function mergeDailyHomework(
	local: DailyHomeworkState,
	remote: DailyHomeworkState,
	now: string,
	notes: AuditNote[]
): DailyHomeworkState {
	if (local.date !== remote.date) {
		const later = laterDate(local.date, remote.date);
		const winner = later === local.date ? local : remote;
		notes.push(note(now, 'daily', 'dailyHomework', local, remote, winner));
		return winner;
	}
	// same date (incl. both null)
	const results = mergeBoolResults(
		asBoolRecord(local.results),
		asBoolRecord(remote.results),
		'dailyHomework.results',
		now,
		notes
	);
	const currentIndex = Math.max(asNumber(local.currentIndex, 0), asNumber(remote.currentIndex, 0));
	const lpEarned = Math.max(asNumber(local.lpEarned, 0), asNumber(remote.lpEarned, 0));
	const completed = Boolean(local.completed) || Boolean(remote.completed);
	let questions = isArray(local.questions) ? local.questions : [];
	if (!deepEqual(local.questions, remote.questions)) {
		questions = isArray(local.questions) ? local.questions : [];
		notes.push(
			note(now, 'daily', 'dailyHomework.questions', local.questions, remote.questions, questions)
		);
	}
	// Convert string-keyed results back; DailyHomeworkState uses Record<number, boolean>
	const numResults: Record<number, boolean> = {};
	for (const [k, v] of Object.entries(results)) {
		const n = Number(k);
		if (Number.isFinite(n)) numResults[n] = v;
		else (numResults as Record<string, boolean>)[k] = v;
	}
	return {
		date: local.date,
		questions,
		currentIndex,
		results: numResults,
		completed,
		lpEarned,
		swaps: mergeSwapLedgers(local.swaps, remote.swaps)
	};
}

function mergeDailyQuiz(
	local: DailyQuizState,
	remote: DailyQuizState,
	now: string,
	notes: AuditNote[]
): DailyQuizState {
	if (local.date !== remote.date) {
		const later = laterDate(local.date, remote.date);
		const winner = later === local.date ? local : remote;
		notes.push(note(now, 'daily', 'dailyQuiz', local, remote, winner));
		return winner;
	}
	const results = mergeBoolResults(
		asBoolRecord(local.results),
		asBoolRecord(remote.results),
		'dailyQuiz.results',
		now,
		notes
	);
	const completed = Boolean(local.completed) || Boolean(remote.completed);
	const lpEarned = Math.max(asNumber(local.lpEarned, 0), asNumber(remote.lpEarned, 0));
	let questionIds = isArray(local.questionIds) ? (local.questionIds as string[]) : [];
	if (!deepEqual(local.questionIds, remote.questionIds)) {
		questionIds = isArray(local.questionIds) ? (local.questionIds as string[]) : [];
		notes.push(
			note(
				now,
				'daily',
				'dailyQuiz.questionIds',
				local.questionIds,
				remote.questionIds,
				questionIds
			)
		);
	}
	return {
		date: local.date,
		questionIds,
		results,
		completed,
		lpEarned,
		swaps: mergeSwapLedgers(local.swaps, remote.swaps)
	};
}

function mergeDailyRead(
	local: DailyReadState,
	remote: DailyReadState,
	now: string,
	notes: AuditNote[]
): DailyReadState {
	if (local.date !== remote.date) {
		const later = laterDate(local.date, remote.date);
		const winner = later === local.date ? local : remote;
		notes.push(note(now, 'daily', 'dailyRead', local, remote, winner));
		return winner;
	}
	return {
		date: local.date,
		done: Boolean(local.done) || Boolean(remote.done)
	};
}

function mergeReadingFork(
	local: ReadingForkState,
	remote: ReadingForkState,
	now: string,
	notes: AuditNote[]
): ReadingForkState {
	const evalState =
		laterDate(local.eval.date, remote.eval.date) === local.eval.date ? local.eval : remote.eval;
	if (local.eval.date !== remote.eval.date) {
		notes.push(note(now, 'daily', 'readingFork.eval', local.eval, remote.eval, evalState));
	}
	const misses = mergeMisses(local.misses ?? [], remote.misses ?? []);
	const satMocks = Array.from(new Set([...(remote.satMocks ?? []), ...(local.satMocks ?? [])]));
	const lastMockAt = laterDate(local.lastMockAt, remote.lastMockAt);
	const lastMockScore =
		lastMockAt === local.lastMockAt ? local.lastMockScore : remote.lastMockScore;
	const lastEvalDate = laterDate(local.lastEvalDate, remote.lastEvalDate);
	const showUpStreak = Math.max(local.showUpStreak, remote.showUpStreak);
	return {
		eval: evalState,
		showUpStreak,
		lastEvalDate,
		misses,
		satMocks,
		lastMockAt,
		lastMockScore,
		attempts: local.attempts ?? [],
		traps: local.traps ?? [],
		mockInProgress: local.mockInProgress ?? null,
		mocks: local.mocks ?? [],
		settings: local.settings ?? structuredClone(EMPTY_READING_FORK.settings)
	};
}

function mergeMisses(local: Miss[], remote: Miss[]): Miss[] {
	const byId = new Map<string, Miss>();
	for (const miss of [...remote, ...local]) {
		const prev = byId.get(miss.questionId);
		if (!prev || (!miss.seen && prev.seen)) byId.set(miss.questionId, miss);
	}
	return [...byId.values()];
}

function asBoolRecord(x: unknown): Record<string, boolean> {
	if (!isRecord(x)) return {};
	const out: Record<string, boolean> = {};
	for (const [k, v] of Object.entries(x)) {
		if (typeof v === 'boolean') out[k] = v;
	}
	return out;
}

function mergeBoolResults(
	local: Record<string, boolean>,
	remote: Record<string, boolean>,
	fieldPrefix: string,
	now: string,
	notes: AuditNote[]
): Record<string, boolean> {
	const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
	const out: Record<string, boolean> = {};
	for (const key of keys) {
		const hasL = Object.prototype.hasOwnProperty.call(local, key);
		const hasR = Object.prototype.hasOwnProperty.call(remote, key);
		if (hasL && hasR) {
			const l = local[key];
			const r = remote[key];
			out[key] = l || r;
			if (l !== r) {
				notes.push(note(now, 'daily', `${fieldPrefix}.${key}`, l, r, out[key]));
			}
		} else if (hasL) {
			out[key] = local[key];
		} else {
			out[key] = remote[key];
		}
	}
	return out;
}

// ---- config ---------------------------------------------------------------

function mergeConfig(
	local: unknown,
	remote: unknown,
	now: string,
	opts?: MergeOptions
): { value: unknown; notes: AuditNote[] } {
	const localCfg = isRecord(local) ? local : null;
	const remoteCfg = isRecord(remote) ? remote : null;

	if (localCfg === null && remoteCfg === null) {
		return { value: JSON.parse(JSON.stringify(defaultParts.config)), notes: [] };
	}

	// Dirty local → local wins wholesale (unsynced local settings change).
	if (opts?.localDirty === true) {
		if (localCfg === null) return { value: remote, notes: [] };
		const notes: AuditNote[] = [];
		if (remoteCfg !== null && !deepEqual(localCfg, remoteCfg)) {
			notes.push(note(now, 'config', 'config', localCfg, remoteCfg, localCfg));
		}
		return { value: localCfg, notes };
	}

	// Clean local (opts omitted or localDirty false) → remote wins wholesale.
	if (remoteCfg === null) return { value: local, notes: [] };
	const notes: AuditNote[] = [];
	if (localCfg !== null && !deepEqual(localCfg, remoteCfg)) {
		notes.push(note(now, 'config', 'config', localCfg, remoteCfg, remoteCfg));
	}
	return { value: remoteCfg, notes };
}

// ---- adjustments ----------------------------------------------------------

/** Pure structural gate. Must not mutate `x` — used as a `.filter()` predicate. */
export function isAdjustmentEntry(x: unknown): x is AdjustmentEntry {
	if (!isRecord(x)) return false;
	if (typeof x.id !== 'string' || typeof x.timestamp !== 'string') return false;
	if (typeof x.tool !== 'string' || !ADJUSTMENT_TOOL_NAME_SET.has(x.tool)) {
		return false;
	}
	if (x.outcome !== 'applied' && x.outcome !== 'capped' && x.outcome !== 'rejected') {
		return false;
	}
	if (typeof x.undone !== 'boolean') return false;
	if (typeof x.detail !== 'string' || typeof x.reason !== 'string') return false;
	// Do not check or coerce `source` here. A v19 device syncs entries with no
	// `source`; rejecting them would delete them on merge. Coercion belongs in
	// normalizeAdjustmentEntry, downstream of this predicate.
	return true;
}

/** Fresh copy with source normalized. Does not mutate the input entry. */
function normalizeAdjustmentEntry(e: AdjustmentEntry): AdjustmentEntry {
	return {
		...e,
		source: e.source === 'engine' ? 'engine' : 'kuromi'
	};
}

function mergeAdjustments(local: unknown, remote: unknown): { value: unknown; notes: AuditNote[] } {
	const localArr = isArray(local)
		? local.filter(isAdjustmentEntry).map(normalizeAdjustmentEntry)
		: [];
	const remoteArr = isArray(remote)
		? remote.filter(isAdjustmentEntry).map(normalizeAdjustmentEntry)
		: [];
	const byId = new Map<string, AdjustmentEntry>();
	// Remote first; on collision take local fields but OR the undone flag so
	// a revert on either device survives (never un-revert via stale copy).
	for (const e of remoteArr) byId.set(e.id, e);
	for (const e of localArr) {
		const existing = byId.get(e.id);
		if (existing) {
			byId.set(e.id, { ...e, undone: e.undone || existing.undone });
		} else {
			byId.set(e.id, e);
		}
	}
	const sorted = Array.from(byId.values()).sort((a, b) => {
		if (a.timestamp < b.timestamp) return -1;
		if (a.timestamp > b.timestamp) return 1;
		return 0;
	});
	// Newest 50 after ascending sort
	const capped = sorted.length > 50 ? sorted.slice(-50) : sorted;
	return { value: capped, notes: [] };
}

// ---- pages ----------------------------------------------------------------

function isOpaqueSyncEntry(x: unknown): x is SyncEntity {
	return (
		isRecord(x) && typeof x.id === 'string' && x.id.length > 0 && typeof x.updatedAt === 'string'
	);
}

/** Legacy production rows hold a bare `[]`. Never throw; never drop the other key. */
function normalizePagesSlice(raw: unknown): PagesSlice {
	if (isArray(raw) || !isRecord(raw)) {
		return { pages: [], conversations: [] };
	}
	return {
		// Only legitimate cast site: validated-unknown → typed entity. isOpaqueSyncEntry checks SyncEntity fields only (intentional — merge content stays opaque).
		pages: isArray(raw.pages) ? (raw.pages.filter(isOpaqueSyncEntry) as KuromiPage[]) : [],
		conversations: isArray(raw.conversations)
			? (raw.conversations.filter(isOpaqueSyncEntry) as KuromiConversation[])
			: []
	};
}

/**
 * Union by id, LWW by updatedAt. Equal or unparseable → local wins.
 * Contents are OPAQUE — do not inspect blocks/turns/types.
 */
function mergeByIdLww<T extends SyncEntity>(local: T[], remote: T[]): T[] {
	const byId = new Map<string, T>();
	for (const e of remote) byId.set(e.id, e);
	for (const e of local) {
		const existing = byId.get(e.id);
		if (!existing) {
			byId.set(e.id, e);
			continue;
		}
		const localT = Date.parse(e.updatedAt);
		const remoteT = Date.parse(existing.updatedAt);
		if (Number.isNaN(localT) || Number.isNaN(remoteT) || localT >= remoteT) {
			byId.set(e.id, e);
		}
	}
	return Array.from(byId.values());
}

function mergePages(local: unknown, remote: unknown): { value: unknown; notes: AuditNote[] } {
	const L = normalizePagesSlice(local);
	const R = normalizePagesSlice(remote);
	return {
		value: {
			pages: mergeByIdLww(L.pages, R.pages),
			conversations: mergeByIdLww(L.conversations, R.conversations)
		} satisfies PagesSlice,
		notes: []
	};
}
