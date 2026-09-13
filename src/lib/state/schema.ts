// ============================================================
// DUTCHINA STATE SCHEMA
// Every shape the state object has ever had lives here.
// When adding a new version: add StateVN type, update the
// State union, bump CURRENT_SCHEMA_VERSION, write a migration.
// ============================================================

export interface StateV1 {
	schemaVersion: 1;
	rank: number; // 0 to 7
	tier: number; // 1 to 4
	lp: number; // current LP within the tier (0 to 99)
	totalLp: number; // lifetime total LP earned
	practiceDays: number; // real consecutive-day streak
	lastSessionDate: string | null; // ISO date string (YYYY-MM-DD), used to compute practiceDays
	tts: {
		googleApiKey: string | null;
	};
}

export interface StateV2 {
	schemaVersion: 2;
	rank: number; // 0 to 7
	tier: number; // 1 to 4
	lp: number; // current LP within the tier (0 to 99)
	totalLp: number; // lifetime total LP earned (positive deltas only, never decremented)
	practiceDays: number; // real consecutive-day streak
	lastSessionDate: string | null; // ISO date string (YYYY-MM-DD), used to compute practiceDays
	lastDailyBonusDate: string | null; // ISO date string (YYYY-MM-DD), prevents double daily bonus
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
}

export interface StateV3 {
	schemaVersion: 3;
	rank: number; // 0 to 7
	tier: number; // 1 to 4
	lp: number; // current LP within the tier (0 to 99)
	totalLp: number; // lifetime total LP earned (positive deltas only, never decremented)
	practiceDays: number; // real consecutive-day streak
	lastSessionDate: string | null; // ISO date string (YYYY-MM-DD), used to compute practiceDays
	lastDailyBonusDate: string | null; // ISO date string (YYYY-MM-DD), prevents double daily bonus
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number; // matches completed today, resets on new day
		lastMatchDate: string | null; // ISO date string (YYYY-MM-DD), used to detect day rollover
	};
}

export interface StateV4 {
	schemaVersion: 4;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
	};
	cards: {
		reviewedToday: number; // cards reviewed today, resets on new day
		lastReviewDate: string | null; // ISO date string (YYYY-MM-DD)
		newCardsPerDay: number; // how many new cards introduced per day (default 10)
	};
}

export interface StateV5 {
	schemaVersion: 5;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
	};
	boss: {
		attempts: number; // total fights attempted
		wins: number; // total fights won
		losses: number; // total fights lost
		rankDefeated: number; // highest rank boss defeated. -1 = none beaten yet.
	};
}

export interface MissionState {
	id: string;
	progress: number;
	completed: boolean;
}

export interface StateV6 {
	schemaVersion: 6;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number; // highest streak ever hit in Match
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number; // lifetime total cards reviewed
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
}

export interface GrammarExerciseResult {
	correct: boolean;
	attemptedAt: string; // ISO date
}

export interface StateV7 {
	schemaVersion: 7;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[]; // lesson IDs fully completed
		exerciseResults: Record<string, GrammarExerciseResult>; // keyed by exercise ID
		currentLesson: string | null; // lesson ID in progress
		currentExerciseIndex: number; // index within that lesson's exerciseIds
	};
}

export interface ConversationQuestionResult {
	correct: boolean;
	attemptedAt: string; // ISO date
}

export interface StateV8 {
	schemaVersion: 8;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[]; // chapter IDs where quiz was completed
		questionResults: Record<string, ConversationQuestionResult>; // keyed by question ID
		currentStory: string | null; // story ID in progress
		currentChapter: number; // chapter index within the story
	};
}

export interface ReviewSubmission {
	taskId: string;
	answer: string;
	submittedAt: string; // ISO date
	verdict: 'pass' | 'close' | 'fail' | null; // null = pending review
	comment: string;
	reviewedAt: string | null; // ISO date
}

export interface StateV9 {
	schemaVersion: 9;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: {
		submissions: Record<string, ReviewSubmission>;
	};
}

export interface StateV10 {
	schemaVersion: 10;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	lpEarnedToday: number; // LP earned today, resets on new day
	lastLpDate: string | null; // ISO date string (YYYY-MM-DD) for lpEarnedToday reset
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: {
		submissions: Record<string, ReviewSubmission>;
	};
}

export interface StateV11 {
	schemaVersion: 11;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number;
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	lpEarnedToday: number;
	lastLpDate: string | null;
	lastModified: string | null; // ISO timestamp, set on every save. Used by sync to resolve local vs server conflicts.
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: {
		submissions: Record<string, ReviewSubmission>;
	};
}

export interface StateV12 {
	schemaVersion: 12;
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
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: {
		submissions: Record<string, ReviewSubmission>;
	};
}

export interface LuisterenQuestionResult {
	correct: boolean;
	attemptedAt: string; // ISO date
}

export interface StateV13 {
	schemaVersion: 13;
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
	tts: {
		googleApiKey: string | null;
	};
	audio: {
		sfxMuted: boolean;
	};
	match: {
		completedToday: number;
		lastMatchDate: string | null;
		bestStreak: number;
	};
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: {
		attempts: number;
		wins: number;
		losses: number;
		rankDefeated: number;
	};
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: {
		daily: MissionState[];
		lastMissionDate: string | null;
	};
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: {
		submissions: Record<string, ReviewSubmission>;
	};
	luisteren: {
		questionResults: Record<string, LuisterenQuestionResult>; // keyed by question ID (e.g. "2025-6")
	};
}

export interface LezenQuestionResult {
	correct: boolean;
	attemptedAt: string;
}

export interface StateV14 {
	schemaVersion: 14;
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
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
}

// SRS review data for a single card, mirrored from IndexedDB for sync.
// Matches the shape of CardReviewEntry in db.ts.
export interface SyncedCardReview {
	wordId: string;
	interval: number;
	easeFactor: number;
	repetitions: number;
	nextReviewDate: string; // YYYY-MM-DD
	lastReviewDate: string; // YYYY-MM-DD
	firstSeenDate: string; // YYYY-MM-DD
}

export interface StateV15 {
	schemaVersion: 15;
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
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
}

// ============================================================
// V16: Daily Homework
// Mixed daily practice session: ~35 questions drawn across
// modules. Persisted so partially-completed sessions survive a
// page reload mid-session. Reset on date rollover.
//
// `questions` is a serialized snapshot of DailyQuestion[] — we
// keep it as `unknown[]` here to avoid a circular import between
// state and the daily module. Callers cast through
// $lib/daily/types' DailyQuestion when reading.
// ============================================================
export interface SwapLedger {
	/** Calendar YYYY-MM-DD. Week-set date is an ISO week; swaps still use this. */
	date: string | null;
	used: number;
	swappedOutIds: string[];
}

export const EMPTY_SWAPS: SwapLedger = { date: null, used: 0, swappedOutIds: [] };

export interface DailyHomeworkState {
	/** YYYY-MM-DD when the session was generated. null = nothing generated yet. */
	date: string | null;
	/** Serialized DailyQuestion[]. Empty if no session is active. */
	questions: unknown[];
	/** Cursor into `questions`. 0 at the start of a fresh session. */
	currentIndex: number;
	/** Map of question index -> correctness. Filled as the user answers. */
	results: Record<number, boolean>;
	/** True once every question has been answered. */
	completed: boolean;
	/** Total LP earned across this session (denormalized for the summary screen). */
	lpEarned: number;
	/** Calendar-day skip/swap ledger. Independent of the ISO week key in `date`. */
	swaps?: SwapLedger;
}

export interface StateV16 {
	schemaVersion: 16;
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
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	grammar: {
		completedLessons: string[];
		exerciseResults: Record<string, GrammarExerciseResult>;
		currentLesson: string | null;
		currentExerciseIndex: number;
	};
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
}

// ============================================================
// V17: Grammar removal + daily→weekly cadence (Phase 1 overhaul)
// The standalone grammar module is gone (grammar instruction moved
// to a separate external tool; boss fights remain where grammar is
// tested). The `grammar` progress field is dropped. Cadence fields
// keep their names and types but their compared values are now ISO
// week keys, and `practiceDays` now counts consecutive WEEKS.
// ============================================================
export interface StateV17 {
	schemaVersion: 17;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number; // now: consecutive ISO weeks with >= 1 session
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	lpEarnedToday: number;
	lastLpDate: string | null;
	lastModified: string | null;
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
}

// ============================================================
// V18: Daily quiz + Daily Read
// Two optional daily surfaces, both date-scoped and both reset
// by comparing date against todays YYYY-MM-DD. Neither
// affects streaks or missions.
// ============================================================
export interface DailyQuizState {
	/** YYYY-MM-DD the quiz was generated for. null = never generated. */
	date: string | null;
	/** The 5 stable question ids, in order. Empty if none generated. */
	questionIds: string[];
	/** questionId -> correctness. Filled as she answers. */
	results: Record<string, boolean>;
	/** True once every question has been answered. Guards the 5/5 bonus against re-award on reload. */
	completed: boolean;
	/** Total LP earned in this quiz (denormalized for the summary screen). */
	lpEarned: number;
	/** Calendar-day skip/swap ledger. */
	swaps?: SwapLedger;
}

export interface DailyReadState {
	/** YYYY-MM-DD of the read most recently marked done. null = never. */
	date: string | null;
	/** True once the read for date was marked done. */
	done: boolean;
}

export interface StateV18 {
	schemaVersion: 18;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number; // now: consecutive ISO weeks with >= 1 session
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	lpEarnedToday: number;
	lastLpDate: string | null;
	lastModified: string | null;
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
	dailyQuiz: DailyQuizState;
	dailyRead: DailyReadState;
}

// ============================================================
// V19: Kuromi the Steward (Phase 5)
// Bounded stewardship: appConfig (what update_config may write),
// adjustments (audit log of tool outcomes), and steward ledger
// (weekly LP-award cap + streak-forgive tracking). Lives outside
// appConfig on purpose so Kuromi cannot raise her own ceiling.
// ============================================================

export type ProgressionDisplay = 'score' | 'collection' | 'hidden';
export type StreakMode = 'strict' | 'gentle' | 'off';
export type MissionsMode = 'on' | 'off';
export type GlowRule = 'weekset-urgent' | 'quiz' | 'tekst' | 'weekset';

export const GLOW_RULES: readonly GlowRule[] = [
	'weekset-urgent',
	'quiz',
	'tekst',
	'weekset'
] as const;
export const DEFAULT_GLOW_ORDER: readonly GlowRule[] = [
	'weekset-urgent',
	'quiz',
	'tekst',
	'weekset'
] as const;

export interface AppConfig {
	progression: { display: ProgressionDisplay };
	streaks: StreakMode;
	missions: MissionsMode;
	// BIASES quiz question selection toward these categories. Must NEVER
	// FILTER the quiz pool: a category with too few available words must
	// fall back to the full pool, or a bad patch from Kuromi starves the
	// daily quiz. (Biasing logic itself is implemented by a later unit --
	// this type only carries the constraint.) Deliberately string[], not
	// the WordCategory union: this schema module must not import a content
	// module, and unknown/invalid values here must be harmless -- they are
	// validated and dropped at the executor boundary.
	quiz: { focusCategories: string[] };
	dailyPath: { order: GlowRule[] };
}

export const ADJUSTMENT_TOOL_NAMES = [
	'update_config',
	'award_lp',
	'forgive_streak',
	'create_page',
	'update_page',
	'archive_page'
] as const;
export type AdjustmentToolName = (typeof ADJUSTMENT_TOOL_NAMES)[number];

export interface AdjustmentEntry {
	id: string;
	timestamp: string;
	tool: AdjustmentToolName;
	outcome: 'applied' | 'capped' | 'rejected';
	detail: string;
	reason: string;
	payload: unknown;
	undone: boolean;
	/**
	 * Absent means 'kuromi' — optional so that (a) existing producers keep
	 * compiling and (b) an entry synced from a pre-v20 device is coerced
	 * rather than filtered out. Only the engine-authored gentle-mode streak
	 * repair sets 'engine'; consumers test source === 'engine', which is
	 * total over both shapes.
	 */
	source?: 'kuromi' | 'engine';
}

export interface PageBead {
	text: string;
	variant?: 'default' | 'verb' | 'subject' | 'ghost';
}
export interface PageExample {
	nl: string;
	en: string;
}
export interface PageTrap {
	title: string;
	body: string;
	variant?: 'tip' | 'trap';
}
export interface PageDrillQuestion {
	type: 'mcq' | 'recall';
	prompt: string;
	options: string[];
	answer: string;
	explanation_quip: string;
}

export interface PageBlockGrammarCard {
	type: 'grammar-card';
	title: string;
	formula: PageBead[];
	formulaTone?: 'rose' | 'lavender' | 'teal' | 'peach';
	example: PageExample;
	trap?: PageTrap;
}
export interface PageBlockVocabSet {
	type: 'vocab-set';
	title?: string;
	wordIds: string[];
	custom: PageExample[];
}
export interface PageBlockDrill {
	type: 'drill';
	title: string;
	intro_quip: string;
	questions: PageDrillQuestion[];
}
export interface PageBlockRead {
	type: 'read';
	title?: string;
	nl: string;
	en: string;
}
export interface PageBlockNote {
	type: 'note';
	body: string;
}

export type PageBlock =
	| PageBlockGrammarCard
	| PageBlockVocabSet
	| PageBlockDrill
	| PageBlockRead
	| PageBlockNote;

export interface KuromiPage {
	id: string;
	title: string;
	quip: string;
	labels: string[];
	blocks: PageBlock[];
	createdAt: string;
	updatedAt: string;
	archived: boolean;
}

export interface KuromiConversationTurn {
	role: 'user' | 'assistant';
	content: string;
}

export interface KuromiConversation {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	turns: KuromiConversationTurn[];
}

export interface StewardAward {
	id: string;
	at: string;
	amount: number;
}

// Lives OUTSIDE appConfig on purpose: appConfig is exactly what the Kuromi
// update_config tool is allowed to write, so if the weekly award cap ledger
// lived inside appConfig, she could raise her own ceiling by editing it.
// Also: an UNDONE award still consumes cap. Undo removes the LP but does not
// free the weekly allowance, and the union merge rule deliberately resurrects
// undone entries rather than dropping them from the cap count. That is the
// fail-safe direction for a cap: when in doubt, be MORE restrictive, never less.
export interface StewardLedger {
	awards: StewardAward[];
	lastForgivenWeek: string | null;
}

export interface StateV19 {
	schemaVersion: 19;
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	practiceDays: number; // now: consecutive ISO weeks with >= 1 session
	lastSessionDate: string | null;
	lastDailyBonusDate: string | null;
	lpEarnedToday: number;
	lastLpDate: string | null;
	lastModified: string | null;
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
	dailyQuiz: DailyQuizState;
	dailyRead: DailyReadState;
	appConfig: AppConfig;
	adjustments: AdjustmentEntry[];
	steward: StewardLedger;
}

export interface StateV20 {
	schemaVersion: 20;
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
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
	dailyQuiz: DailyQuizState;
	dailyRead: DailyReadState;
	appConfig: AppConfig;
	adjustments: AdjustmentEntry[];
	steward: StewardLedger;
	pages: KuromiPage[];
	conversations: KuromiConversation[];
}

export type GateId = 1 | 2 | 3 | 4;

export interface GatesState {
	current: GateId;
	mastered: number[];
	quizLog: { gate: number; date: string; correct: number; total: number }[];
	weekLog: { gate: number; week: string; correct: number; total: number }[];
}

export interface StateV21 {
	schemaVersion: 21;
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
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
	dailyQuiz: DailyQuizState;
	dailyRead: DailyReadState;
	appConfig: AppConfig;
	adjustments: AdjustmentEntry[];
	steward: StewardLedger;
	pages: KuromiPage[];
	conversations: KuromiConversation[];
	gates: GatesState;
}

export interface StateV22 {
	schemaVersion: 22;
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
	tts: { googleApiKey: string | null };
	audio: { sfxMuted: boolean };
	match: { completedToday: number; lastMatchDate: string | null; bestStreak: number };
	cards: {
		reviewedToday: number;
		lastReviewDate: string | null;
		newCardsPerDay: number;
		totalReviewed: number;
	};
	boss: { attempts: number; wins: number; losses: number; rankDefeated: number };
	achievements: Record<string, { unlockedAt: string | null }>;
	missions: { daily: MissionState[]; lastMissionDate: string | null };
	conversation: {
		readChapters: string[];
		questionResults: Record<string, ConversationQuestionResult>;
		currentStory: string | null;
		currentChapter: number;
	};
	reviews: { submissions: Record<string, ReviewSubmission> };
	luisteren: { questionResults: Record<string, LuisterenQuestionResult> };
	lezen: { questionResults: Record<string, LezenQuestionResult> };
	cardReviews: Record<string, SyncedCardReview>;
	dailyHomework: DailyHomeworkState;
	dailyQuiz: DailyQuizState;
	dailyRead: DailyReadState;
	appConfig: AppConfig;
	adjustments: AdjustmentEntry[];
	steward: StewardLedger;
	pages: KuromiPage[];
	conversations: KuromiConversation[];
	gates: GatesState;
}

// State is a union of all versions. Add new versions here as they ship.
export type State =
	| StateV1
	| StateV2
	| StateV3
	| StateV4
	| StateV5
	| StateV6
	| StateV7
	| StateV8
	| StateV9
	| StateV10
	| StateV11
	| StateV12
	| StateV13
	| StateV14
	| StateV15
	| StateV16
	| StateV17
	| StateV18
	| StateV19
	| StateV20
	| StateV21
	| StateV22;

// The latest version is the one the app runs on.
export type CurrentState = StateV22;

export const CURRENT_SCHEMA_VERSION = 22;
