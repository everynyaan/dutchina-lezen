import { EMPTY_READING_FORK } from '$lib/reading/types';
import { DEFAULT_GLOW_ORDER, EMPTY_SWAPS, type StateV23 } from './schema';

// ============================================================
// STATE DEFAULTS
// Returns a fresh StateV22 for a brand-new user.
// Safe values only. No nulls except where the type requires it.
// ============================================================

export function createDefaultState(): StateV23 {
	return {
		schemaVersion: 23,
		rank: 0,
		tier: 1,
		lp: 0,
		totalLp: 0,
		practiceDays: 0,
		lastSessionDate: null,
		lastDailyBonusDate: null,
		lpEarnedToday: 0,
		lastLpDate: null,
		lastModified: null,
		tts: {
			googleApiKey: null
		},
		audio: {
			sfxMuted: false
		},
		match: {
			completedToday: 0,
			lastMatchDate: null,
			bestStreak: 0
		},
		cards: {
			reviewedToday: 0,
			lastReviewDate: null,
			newCardsPerDay: 30,
			totalReviewed: 0
		},
		boss: {
			attempts: 0,
			wins: 0,
			losses: 0,
			rankDefeated: -1
		},
		achievements: {},
		missions: {
			daily: [],
			lastMissionDate: null
		},
		conversation: {
			readChapters: [],
			questionResults: {},
			currentStory: null,
			currentChapter: 0
		},
		reviews: {
			submissions: {}
		},
		luisteren: {
			questionResults: {}
		},
		lezen: {
			questionResults: {}
		},
		cardReviews: {},
		dailyHomework: {
			date: null,
			questions: [],
			currentIndex: 0,
			results: {},
			completed: false,
			lpEarned: 0,
			swaps: { ...EMPTY_SWAPS }
		},
		dailyQuiz: {
			date: null,
			questionIds: [],
			results: {},
			completed: false,
			lpEarned: 0,
			swaps: { ...EMPTY_SWAPS }
		},
		dailyRead: {
			date: null,
			done: false
		},
		// Learner chrome is gates, not LP. Display hidden; engines stay.
		appConfig: {
			progression: { display: 'hidden' },
			streaks: 'strict',
			missions: 'on',
			quiz: { focusCategories: [] },
			dailyPath: { order: [...DEFAULT_GLOW_ORDER] }
		},
		adjustments: [],
		steward: { awards: [], lastForgivenWeek: null },
		pages: [],
		conversations: [],
		gates: { current: 1, mastered: [], quizLog: [], weekLog: [] },
		readingFork: structuredClone(EMPTY_READING_FORK)
	};
}
