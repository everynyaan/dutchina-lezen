export interface Miss {
	questionId: string;
	picked: string;
	seen: boolean;
}

export interface ReadingEvalState {
	date: string | null;
	passageSlug: string | null;
	results: Record<string, boolean>;
	completed: boolean;
}

export interface ReadingForkState {
	eval: ReadingEvalState;
	showUpStreak: number;
	lastEvalDate: string | null;
	misses: Miss[];
	satMocks: number[];
	lastMockAt: string | null;
	lastMockScore: { correct: number; total: number; passed: boolean; year: number } | null;
}

export const EMPTY_READING_EVAL: ReadingEvalState = {
	date: null,
	passageSlug: null,
	results: {},
	completed: false
};

export const EMPTY_READING_FORK: ReadingForkState = {
	eval: { ...EMPTY_READING_EVAL },
	showUpStreak: 0,
	lastEvalDate: null,
	misses: [],
	satMocks: [],
	lastMockAt: null,
	lastMockScore: null
};

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
