import { describe, it, expect } from 'vitest';
import { loadStateFromJSON } from '$lib/state/store';
import { CURRENT_SCHEMA_VERSION, EMPTY_SWAPS } from '$lib/state/schema';
import type { StateV18 } from '$lib/state/schema';

describe('loadStateFromJSON()', () => {
	it('round-trips a v18 state with non-default dailyQuiz and dailyRead', () => {
		const v18State: StateV18 = {
			schemaVersion: 18,
			rank: 3,
			tier: 2,
			lp: 47,
			totalLp: 1284,
			practiceDays: 9,
			lastSessionDate: '2026-08-15',
			lastDailyBonusDate: '2026-08-15',
			lpEarnedToday: 12,
			lastLpDate: '2026-08-15',
			lastModified: '2026-08-15T10:00:00Z',
			tts: { googleApiKey: null },
			audio: { sfxMuted: false },
			match: { completedToday: 2, lastMatchDate: '2026-08-15', bestStreak: 4 },
			cards: {
				reviewedToday: 5,
				lastReviewDate: '2026-08-15',
				newCardsPerDay: 30,
				totalReviewed: 100
			},
			boss: { attempts: 1, wins: 0, losses: 1, rankDefeated: -1 },
			achievements: {},
			missions: { daily: [], lastMissionDate: null },
			conversation: {
				readChapters: [],
				questionResults: {},
				currentStory: null,
				currentChapter: 0
			},
			reviews: { submissions: {} },
			luisteren: { questionResults: {} },
			lezen: { questionResults: {} },
			cardReviews: {},
			dailyHomework: {
				date: null,
				questions: [],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
				results: { q1: true, q2: false, q3: true },
				completed: false,
				lpEarned: 6
			},
			dailyRead: {
				date: '2026-08-15',
				done: true
			}
		};

		const result = loadStateFromJSON(JSON.stringify(v18State));
		expect(result).not.toBeNull();
		if (result && 'dailyQuiz' in result && 'dailyRead' in result) {
			expect(result.dailyQuiz).toEqual({ ...v18State.dailyQuiz, swaps: EMPTY_SWAPS });
			expect(result.dailyRead).toEqual(v18State.dailyRead);
		}
	});

	it('round-trips a v17 blob, migrates to v18 with defaults, LP untouched', () => {
		const v17State = {
			schemaVersion: 17 as const,
			rank: 3,
			tier: 2,
			lp: 47,
			totalLp: 1284,
			practiceDays: 9,
			lastSessionDate: '2026-08-10',
			lastDailyBonusDate: '2026-08-10',
			lpEarnedToday: 22,
			lastLpDate: '2026-08-10',
			lastModified: '2026-08-10T16:00:00Z',
			tts: { googleApiKey: 'v17-key' },
			audio: { sfxMuted: true },
			match: { completedToday: 11, lastMatchDate: '2026-08-10', bestStreak: 6 },
			cards: {
				reviewedToday: 8,
				lastReviewDate: '2026-08-10',
				newCardsPerDay: 30,
				totalReviewed: 440
			},
			boss: { attempts: 7, wins: 4, losses: 3, rankDefeated: 2 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' } },
			missions: {
				daily: [{ id: 'match_15', progress: 3, completed: false }],
				lastMissionDate: '2026-08-10'
			},
			conversation: {
				readChapters: ['cc_0_1'],
				questionResults: {},
				currentStory: null,
				currentChapter: 0
			},
			reviews: { submissions: {} },
			luisteren: { questionResults: {} },
			lezen: { questionResults: {} },
			cardReviews: {},
			dailyHomework: {
				date: '2026-08-10',
				questions: [{ id: 'q_a' }],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0
			}
		};

		const result = loadStateFromJSON(JSON.stringify(v17State));
		expect(result).not.toBeNull();
		expect(result!.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(result!.lp).toBe(47);
		expect(result!.rank).toBe(3);
		expect(result!.totalLp).toBe(1284);

		if (result && 'dailyQuiz' in result) {
			expect(result.dailyQuiz).toEqual({
				date: null,
				questionIds: [],
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: EMPTY_SWAPS
			});
		}
		if (result && 'dailyRead' in result) {
			expect(result.dailyRead).toEqual({
				date: null,
				done: false
			});
		}
	});

	it('returns null on malformed JSON', () => {
		const result = loadStateFromJSON('{not valid json garbage');
		expect(result).toBeNull();
	});
});
