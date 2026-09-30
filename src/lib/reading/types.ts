export interface Miss {
	questionId: string;
	picked: string;
	seen: boolean;
}

export const QTYPES = [
	'doel-tekst',
	'doel-onderdeel',
	'bron-publiek',
	'hoofdgedachte',
	'mening-persoon',
	'detail',
	'oorzaak-reden',
	'toepassing',
	'niet-vraag',
	'functie-tekstdeel',
	'betekenis-in-context',
	'conclusie',
	'vergelijking'
] as const;
export type QType = (typeof QTYPES)[number];

export const TRAP_KINDS = [
	'echo',
	'waar-niet-gevraagd',
	'te-breed',
	'te-smal',
	'tegenovergesteld',
	'niet-in-tekst',
	'verkeerde-persoon',
	'verkeerde-voorwaarde',
	'overdreven'
] as const;
export type TrapKind = (typeof TRAP_KINDS)[number];

export type ItemOrigin = 'official' | 'practice' | 'fresh';
export type AttemptSource = 'daily' | 'drill' | 'texts' | 'mock' | 'map' | 'paraphrase' | 'lure';

export interface ReadingAttempt {
	itemId: string;
	origin: ItemOrigin;
	passageSlug: string;
	source: AttemptSource;
	at: string;
	picked: string;
	correct: boolean;
	locateP: number | null;
	locateHit: boolean | null;
	ms: number;
	mockId?: string;
}

export interface TrapCardV2 {
	trap: TrapKind;
	lastItemId: string;
	seenItemIds: string[];
	dueDate: string;
	streak: number;
	misses: number;
	createdAt: string;
	tamedAt: string | null;
}

export interface DailyAnswer {
	picked: string;
	correct: boolean;
	locateP: number | null;
}

/** Daily text. The field on the fork stays `eval`. */
export interface DailyTextState {
	date: string | null;
	passageSlug: string | null;
	mapDone: boolean;
	itemIds: string[];
	answers: Record<string, DailyAnswer>;
	completed: boolean;
}

export interface MockSession {
	id: string;
	paperYear: number;
	booklet: boolean;
	startedAt: number;
	endsAt: number;
	answers: Record<string, string>;
	flagged: Record<string, boolean>;
	textMs: number[];
	activeText: number;
	activeSince: number | null;
}

export interface MockResult {
	id: string;
	paperYear: number;
	setId?: string;
	finishedAt: string;
	expired: boolean;
	correct: number;
	total: number;
	passLine: number;
	byQtype: Partial<Record<QType, { c: number; t: number }>>;
	textMs: number[];
	answers: Record<string, string>;
	flagged: Record<string, boolean>;
}

/** lookupsPerText default 5. The notebook that spends them is Unit 15. */
export interface ReadingSettings {
	examDate: string;
	reservedPapers: number[];
	lookupsPerText: number;
}

export const EXAM_DATE = '2026-11-12';
export const LOOKUPS_PER_TEXT = 5;
export const ATTEMPT_CAP = 5000;

export const EMPTY_DAILY_TEXT: DailyTextState = {
	date: null,
	passageSlug: null,
	mapDone: false,
	itemIds: [],
	answers: {},
	completed: false
};

export const EMPTY_READING_SETTINGS: ReadingSettings = {
	examDate: EXAM_DATE,
	reservedPapers: [2023],
	lookupsPerText: LOOKUPS_PER_TEXT
};

export interface ReadingForkState {
	eval: DailyTextState;
	showUpStreak: number;
	lastEvalDate: string | null;
	misses: Miss[];
	satMocks: number[];
	lastMockAt: string | null;
	lastMockScore: { correct: number; total: number; passed: boolean; year: number } | null;
	attempts: ReadingAttempt[];
	traps: TrapCardV2[];
	mockInProgress: MockSession | null;
	mocks: MockResult[];
	settings: ReadingSettings;
}

export const EMPTY_READING_FORK: ReadingForkState = {
	eval: { ...EMPTY_DAILY_TEXT, answers: {} },
	showUpStreak: 0,
	lastEvalDate: null,
	misses: [],
	satMocks: [],
	lastMockAt: null,
	lastMockScore: null,
	attempts: [],
	traps: [],
	mockInProgress: null,
	mocks: [],
	settings: { ...EMPTY_READING_SETTINGS, reservedPapers: [2023] }
};

/** p is a hint. Resolve the paragraph by the quote. */
export interface Evidence {
	p: number;
	quote: string;
}

export interface ItemAnnotation {
	id: string;
	qtype: QType;
	evidence: Evidence[];
	/** English. */
	move: string;
	/** English. */
	why: string;
	/** Every option letter except the key. */
	distractors: Record<string, { trap: TrapKind; why: string }>;
	/** For Eyad only. Not shown to the learner. */
	keyCheck: string;
}
