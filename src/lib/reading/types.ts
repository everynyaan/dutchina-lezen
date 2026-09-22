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
