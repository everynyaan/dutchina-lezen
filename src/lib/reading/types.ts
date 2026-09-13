export const TRAP_TYPES = [
	'verwijzing',
	'hoofdonderwerp',
	'bijna-goed',
	'conclusie',
	'bron-doel'
] as const;

export type TrapType = (typeof TRAP_TYPES)[number];

export const TRAP_LABEL: Record<TrapType, string> = {
	verwijzing: 'Who is “hij”?',
	hoofdonderwerp: 'What’s this about?',
	'bijna-goed': 'Almost-right trap',
	conclusie: 'What follows?',
	'bron-doel': 'Where / why this text?'
};

export interface TrapCard {
	id: string;
	trap: TrapType;
	questionId: string;
	passageSlug: string;
	passageName: string;
	question: string;
	correct: string;
	picked: string;
	correctText: string;
	snippet: string;
	createdAt: string;
	dueDate: string;
	reps: number;
}

export interface ReadingEvalState {
	date: string | null;
	passageSlug: string | null;
	year: number | null;
	gistOptions: string[];
	gistAnswer: string;
	gistPicked: string | null;
	questionIds: string[];
	results: Record<string, boolean>;
	completed: boolean;
}

export interface ReadingForkState {
	eval: ReadingEvalState;
	showUpStreak: number;
	lastEvalDate: string | null;
	trapCards: TrapCard[];
	trapStickers: TrapType[];
	lastMockAt: string | null;
	lastMockScore: { correct: number; total: number; passed: boolean } | null;
}

export const EMPTY_READING_EVAL: ReadingEvalState = {
	date: null,
	passageSlug: null,
	year: null,
	gistOptions: [],
	gistAnswer: '',
	gistPicked: null,
	questionIds: [],
	results: {},
	completed: false
};

export const EMPTY_READING_FORK: ReadingForkState = {
	eval: { ...EMPTY_READING_EVAL },
	showUpStreak: 0,
	lastEvalDate: null,
	trapCards: [],
	trapStickers: [],
	lastMockAt: null,
	lastMockScore: null
};
