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

/** How to practice the move — English chrome, never a translation prompt. */
export const TRAP_MOVE: Record<TrapType, string> = {
	verwijzing: 'Find who or what that word points back to. Don’t hunt a new noun.',
	hoofdonderwerp: 'What’s the text doing? First lines and last line, not a side fact.',
	'bijna-goed':
		'Two options look right. The trap copies a word from the text. Answer the question that was asked.',
	conclusie: 'What follows from the whole stretch — not a line you can quote.',
	'bron-doel': 'Where did this appear, and what is it for? Not the topic itself.'
};

export interface TrapCard {
	id: string;
	trap: TrapType;
	/** Exam item that minted or last refreshed this sticker (avoid on drills). */
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
	/** Real exam ids already drilled for this trap. */
	seenDrillIds?: string[];
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
