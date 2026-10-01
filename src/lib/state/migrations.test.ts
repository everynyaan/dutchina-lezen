import { describe, it, expect } from 'vitest';
import { createDefaultState } from '$lib/state/defaults';
import { migrate, reservedPapersFor } from '$lib/state/migrations';
import { dayIndex } from '$lib/reading/bank';
import { CURRENT_SCHEMA_VERSION, DEFAULT_GLOW_ORDER, EMPTY_SWAPS } from '$lib/state/schema';
import type {
	CurrentState,
	StateV1,
	StateV2,
	StateV3,
	StateV4,
	StateV5,
	StateV6,
	StateV7,
	StateV8,
	StateV9,
	StateV10
} from '$lib/state/schema';

describe('State defaults', () => {
	it('creates a state object with current schemaVersion', () => {
		const state = createDefaultState();
		expect(state.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
	});

	it('has safe default values for all fields', () => {
		const state = createDefaultState();
		expect(state.rank).toBe(0);
		expect(state.tier).toBe(1);
		expect(state.lp).toBe(0);
		expect(state.totalLp).toBe(0);
		expect(state.practiceDays).toBe(0);
		expect(state.lastSessionDate).toBeNull();
		expect(state.lastDailyBonusDate).toBeNull();
		expect(state.tts.googleApiKey).toBeNull();
		expect(state.audio.sfxMuted).toBe(false);
		expect(state.match.completedToday).toBe(0);
		expect(state.match.lastMatchDate).toBeNull();
		expect(state.cards.reviewedToday).toBe(0);
		expect(state.cards.lastReviewDate).toBeNull();
		expect(state.cards.newCardsPerDay).toBe(30);
		expect(state.boss.attempts).toBe(0);
		expect(state.boss.wins).toBe(0);
		expect(state.boss.losses).toBe(0);
		expect(state.boss.rankDefeated).toBe(-1);
		expect(state.match.bestStreak).toBe(0);
		expect(state.cards.totalReviewed).toBe(0);
		expect(state.achievements).toEqual({});
		expect(state.missions.daily).toEqual([]);
		expect(state.missions.lastMissionDate).toBeNull();
		expect(state).not.toHaveProperty('grammar');
		expect(state.conversation.readChapters).toEqual([]);
		expect(state.conversation.questionResults).toEqual({});
		expect(state.conversation.currentStory).toBeNull();
		expect(state.conversation.currentChapter).toBe(0);
		expect(state.reviews.submissions).toEqual({});
		expect(state.lastModified).toBeNull();
	});
});

describe('migrate()', () => {
	it('is a no-op when state is already at CURRENT_SCHEMA_VERSION', () => {
		const state = createDefaultState();
		const migrated = migrate(state);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated).toEqual(state);
	});

	it('throws when state schemaVersion is above CURRENT_SCHEMA_VERSION', () => {
		const futureState = { ...createDefaultState(), schemaVersion: CURRENT_SCHEMA_VERSION + 1 };
		expect(() => migrate(futureState)).toThrow();
	});

	it('handles missing schemaVersion (legacy state with no version) by treating it as v0', () => {
		const legacyState = { rank: 0, lp: 0 }; // no schemaVersion
		expect(() => migrate(legacyState)).toThrow(/No migration found from v0 to v1/);
	});

	it('migrates v1 all the way to current version, preserving data', () => {
		const v1State: StateV1 = {
			schemaVersion: 1,
			rank: 3,
			tier: 2,
			lp: 47,
			totalLp: 1247,
			practiceDays: 15,
			lastSessionDate: '2026-04-25',
			tts: { googleApiKey: 'test-key-abc' }
		};

		const migrated = migrate(v1State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated.rank).toBe(3);
		expect(migrated.tier).toBe(2);
		expect(migrated.lp).toBe(47);
		expect(migrated.totalLp).toBe(1247);
		expect(migrated.practiceDays).toBe(3); // v17 day->week: ceil(15 / 7)
		expect(migrated.lastSessionDate).toBe('2026-04-25');

		if ('tts' in migrated) expect(migrated.tts.googleApiKey).toBe('test-key-abc');
		if ('lastDailyBonusDate' in migrated) expect(migrated.lastDailyBonusDate).toBeNull();
		if ('audio' in migrated) expect(migrated.audio.sfxMuted).toBe(false);
		if ('match' in migrated) {
			expect(migrated.match.completedToday).toBe(0);
			expect(migrated.match.lastMatchDate).toBeNull();
		}
	});

	it('migrates v2 to v3: adds match tracking fields', () => {
		const v2State: StateV2 = {
			schemaVersion: 2,
			rank: 5,
			tier: 3,
			lp: 80,
			totalLp: 2300,
			practiceDays: 30,
			lastSessionDate: '2026-04-29',
			lastDailyBonusDate: '2026-04-29',
			tts: { googleApiKey: 'key-xyz' },
			audio: { sfxMuted: true }
		};

		const migrated = migrate(v2State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v2 fields preserved
		expect(migrated.rank).toBe(5);
		expect(migrated.tier).toBe(3);
		expect(migrated.lp).toBe(80);
		expect(migrated.totalLp).toBe(2300);

		if ('audio' in migrated) expect(migrated.audio.sfxMuted).toBe(true);
		if ('lastDailyBonusDate' in migrated) expect(migrated.lastDailyBonusDate).toBe('2026-04-29');

		// New v3 fields
		if ('match' in migrated) {
			expect(migrated.match.completedToday).toBe(0);
			expect(migrated.match.lastMatchDate).toBeNull();
		}
	});

	it('migrates v3 to v4: adds cards tracking fields', () => {
		const v3State: StateV3 = {
			schemaVersion: 3,
			rank: 2,
			tier: 4,
			lp: 90,
			totalLp: 1100,
			practiceDays: 20,
			lastSessionDate: '2026-04-30',
			lastDailyBonusDate: '2026-04-30',
			tts: { googleApiKey: null },
			audio: { sfxMuted: false },
			match: { completedToday: 12, lastMatchDate: '2026-04-30' }
		};

		const migrated = migrate(v3State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v3 fields preserved
		expect(migrated.rank).toBe(2);
		expect(migrated.tier).toBe(4);
		if ('match' in migrated) expect(migrated.match.completedToday).toBe(12);

		// New v4 fields
		if ('cards' in migrated) {
			expect(migrated.cards.reviewedToday).toBe(0);
			expect(migrated.cards.lastReviewDate).toBeNull();
			expect(migrated.cards.newCardsPerDay).toBe(30);
		}
	});

	it('migrates v4 to v5: adds boss tracking fields', () => {
		const v4State: StateV4 = {
			schemaVersion: 4,
			rank: 4,
			tier: 3,
			lp: 65,
			totalLp: 1800,
			practiceDays: 25,
			lastSessionDate: '2026-04-30',
			lastDailyBonusDate: '2026-04-30',
			tts: { googleApiKey: 'my-key' },
			audio: { sfxMuted: true },
			match: { completedToday: 8, lastMatchDate: '2026-04-30' },
			cards: { reviewedToday: 5, lastReviewDate: '2026-04-30', newCardsPerDay: 10 }
		};

		const migrated = migrate(v4State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v4 fields preserved
		expect(migrated.rank).toBe(4);
		expect(migrated.tier).toBe(3);
		expect(migrated.lp).toBe(65);
		expect(migrated.totalLp).toBe(1800);
		if ('tts' in migrated) expect(migrated.tts.googleApiKey).toBe('my-key');
		if ('audio' in migrated) expect(migrated.audio.sfxMuted).toBe(true);
		if ('match' in migrated) expect(migrated.match.completedToday).toBe(8);
		if ('cards' in migrated) expect(migrated.cards.reviewedToday).toBe(5);

		// New v5 fields
		if ('boss' in migrated) {
			expect(migrated.boss.attempts).toBe(0);
			expect(migrated.boss.wins).toBe(0);
			expect(migrated.boss.losses).toBe(0);
			expect(migrated.boss.rankDefeated).toBe(-1);
		}
	});

	it('migrates v5 to v6: adds achievements, missions, bestStreak, totalReviewed', () => {
		const v5State: StateV5 = {
			schemaVersion: 5,
			rank: 3,
			tier: 2,
			lp: 50,
			totalLp: 1500,
			practiceDays: 12,
			lastSessionDate: '2026-04-30',
			lastDailyBonusDate: '2026-04-30',
			tts: { googleApiKey: 'key-123' },
			audio: { sfxMuted: false },
			match: { completedToday: 10, lastMatchDate: '2026-04-30' },
			cards: { reviewedToday: 7, lastReviewDate: '2026-04-30', newCardsPerDay: 15 },
			boss: { attempts: 5, wins: 3, losses: 2, rankDefeated: 2 }
		};

		const migrated = migrate(v5State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v5 fields preserved
		expect(migrated.rank).toBe(3);
		expect(migrated.tier).toBe(2);
		expect(migrated.lp).toBe(50);
		expect(migrated.totalLp).toBe(1500);
		if ('tts' in migrated) expect(migrated.tts.googleApiKey).toBe('key-123');
		if ('boss' in migrated) {
			expect(migrated.boss.attempts).toBe(5);
			expect(migrated.boss.wins).toBe(3);
			expect(migrated.boss.rankDefeated).toBe(2);
		}
		if ('match' in migrated) {
			expect(migrated.match.completedToday).toBe(10);
			expect(migrated.match.lastMatchDate).toBe('2026-04-30');
		}
		if ('cards' in migrated) {
			expect(migrated.cards.reviewedToday).toBe(7);
			expect(migrated.cards.newCardsPerDay).toBe(30);
		}

		// New v6 fields
		if ('match' in migrated && 'bestStreak' in migrated.match) {
			expect(migrated.match.bestStreak).toBe(0);
		}
		if ('cards' in migrated && 'totalReviewed' in migrated.cards) {
			expect(migrated.cards.totalReviewed).toBe(0);
		}
		if ('achievements' in migrated) {
			expect(migrated.achievements).toEqual({});
		}
		if ('missions' in migrated) {
			expect(migrated.missions.daily).toEqual([]);
			expect(migrated.missions.lastMissionDate).toBeNull();
		}
	});

	it('migrates v6 to current: preserves v6 data, grammar stripped by v17', () => {
		const v6State: StateV6 = {
			schemaVersion: 6,
			rank: 5,
			tier: 3,
			lp: 72,
			totalLp: 2100,
			practiceDays: 18,
			lastSessionDate: '2026-04-30',
			lastDailyBonusDate: '2026-04-30',
			tts: { googleApiKey: 'key-456' },
			audio: { sfxMuted: false },
			match: { completedToday: 14, lastMatchDate: '2026-04-30', bestStreak: 7 },
			cards: {
				reviewedToday: 9,
				lastReviewDate: '2026-04-30',
				newCardsPerDay: 12,
				totalReviewed: 150
			},
			boss: { attempts: 8, wins: 5, losses: 3, rankDefeated: 4 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-15T10:00:00Z' } },
			missions: {
				daily: [{ id: 'match_15', progress: 14, completed: false }],
				lastMissionDate: '2026-04-30'
			}
		};

		const migrated = migrate(v6State) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v6 fields preserved
		expect(migrated.rank).toBe(5);
		expect(migrated.tier).toBe(3);
		expect(migrated.lp).toBe(72);
		expect(migrated.totalLp).toBe(2100);
		if ('tts' in migrated) expect(migrated.tts.googleApiKey).toBe('key-456');
		if ('match' in migrated) {
			expect(migrated.match.completedToday).toBe(14);
			expect(migrated.match.bestStreak).toBe(7);
		}
		if ('cards' in migrated) {
			expect(migrated.cards.totalReviewed).toBe(150);
			expect(migrated.cards.newCardsPerDay).toBe(30);
		}
		if ('boss' in migrated) {
			expect(migrated.boss.attempts).toBe(8);
			expect(migrated.boss.rankDefeated).toBe(4);
		}
		if ('achievements' in migrated) {
			expect(migrated.achievements['ach_first_match']).toEqual({
				unlockedAt: '2026-04-15T10:00:00Z'
			});
		}
		if ('missions' in migrated) {
			expect(migrated.missions.daily).toHaveLength(1);
			expect(migrated.missions.lastMissionDate).toBe('2026-04-30');
		}

		// Grammar was added at v7 but is stripped again at v17 — the
		// terminal (current) state must not carry it.
		expect(migrated).not.toHaveProperty('grammar');
	});

	it('migrates v7 to v8: adds conversation tracking fields', () => {
		const v7State: StateV7 = {
			schemaVersion: 7,
			rank: 4,
			tier: 2,
			lp: 55,
			totalLp: 1800,
			practiceDays: 22,
			lastSessionDate: '2026-04-30',
			lastDailyBonusDate: '2026-04-30',
			tts: { googleApiKey: 'key-789' },
			audio: { sfxMuted: true },
			match: { completedToday: 10, lastMatchDate: '2026-04-30', bestStreak: 5 },
			cards: {
				reviewedToday: 6,
				lastReviewDate: '2026-04-30',
				newCardsPerDay: 10,
				totalReviewed: 120
			},
			boss: { attempts: 6, wins: 4, losses: 2, rankDefeated: 3 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-15T10:00:00Z' } },
			missions: { daily: [], lastMissionDate: '2026-04-30' },
			grammar: {
				completedLessons: ['gl_0_articles'],
				exerciseResults: { g_0_articles_1: { correct: true, attemptedAt: '2026-04-30T12:00:00Z' } },
				currentLesson: null,
				currentExerciseIndex: 0
			}
		};

		const migrated = migrate(v7State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v7 fields preserved
		expect(migrated.rank).toBe(4);
		expect(migrated.tier).toBe(2);
		// Grammar is stripped by v17 — not present at the current version.
		expect(migrated).not.toHaveProperty('grammar');

		// New v8 fields
		if ('conversation' in migrated) {
			expect(migrated.conversation.readChapters).toEqual([]);
			expect(migrated.conversation.questionResults).toEqual({});
			expect(migrated.conversation.currentStory).toBeNull();
			expect(migrated.conversation.currentChapter).toBe(0);
		}
	});

	it('migrates v8 to v9: adds reviews.submissions', () => {
		const v8State: StateV8 = {
			schemaVersion: 8,
			rank: 5,
			tier: 3,
			lp: 72,
			totalLp: 2400,
			practiceDays: 30,
			lastSessionDate: '2026-04-30',
			lastDailyBonusDate: '2026-04-30',
			tts: { googleApiKey: 'key-999' },
			audio: { sfxMuted: false },
			match: { completedToday: 8, lastMatchDate: '2026-04-30', bestStreak: 7 },
			cards: {
				reviewedToday: 12,
				lastReviewDate: '2026-04-30',
				newCardsPerDay: 15,
				totalReviewed: 200
			},
			boss: { attempts: 8, wins: 5, losses: 3, rankDefeated: 4 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-15T10:00:00Z' } },
			missions: { daily: [], lastMissionDate: '2026-04-30' },
			grammar: {
				completedLessons: ['gl_0_articles', 'gl_1_plurals'],
				exerciseResults: { g_0_articles_1: { correct: true, attemptedAt: '2026-04-30T12:00:00Z' } },
				currentLesson: null,
				currentExerciseIndex: 0
			},
			conversation: {
				readChapters: ['c_0_ch0'],
				questionResults: { c_0_ch0_q0: { correct: true, attemptedAt: '2026-04-30T12:00:00Z' } },
				currentStory: null,
				currentChapter: 0
			}
		};

		const migrated = migrate(v8State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v8 fields preserved
		expect(migrated.rank).toBe(5);
		expect(migrated.tier).toBe(3);
		expect(migrated.lp).toBe(72);
		expect(migrated.totalLp).toBe(2400);
		if ('conversation' in migrated) {
			expect(migrated.conversation.readChapters).toEqual(['c_0_ch0']);
		}

		// New v9 fields
		if ('reviews' in migrated) {
			expect(migrated.reviews.submissions).toEqual({});
		}
	});

	it('migrates v9 to v10: adds lpEarnedToday and lastLpDate', () => {
		const v9State: StateV9 = {
			schemaVersion: 9,
			rank: 6,
			tier: 2,
			lp: 55,
			totalLp: 2600,
			practiceDays: 35,
			lastSessionDate: '2026-05-01',
			lastDailyBonusDate: '2026-05-01',
			tts: { googleApiKey: 'key-abc' },
			audio: { sfxMuted: false },
			match: { completedToday: 10, lastMatchDate: '2026-05-01', bestStreak: 9 },
			cards: {
				reviewedToday: 20,
				lastReviewDate: '2026-05-01',
				newCardsPerDay: 15,
				totalReviewed: 300
			},
			boss: { attempts: 10, wins: 6, losses: 4, rankDefeated: 5 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-15T10:00:00Z' } },
			missions: { daily: [], lastMissionDate: '2026-05-01' },
			grammar: {
				completedLessons: ['gl_0_articles'],
				exerciseResults: {},
				currentLesson: null,
				currentExerciseIndex: 0
			},
			conversation: {
				readChapters: ['c_0_ch0', 'c_0_ch1'],
				questionResults: {},
				currentStory: null,
				currentChapter: 0
			},
			reviews: {
				submissions: {
					rev_123: {
						taskId: 'sch_2025_1',
						answer: 'test',
						submittedAt: '2026-05-01T10:00:00Z',
						verdict: 'pass',
						comment: 'good',
						reviewedAt: '2026-05-01T10:05:00Z'
					}
				}
			}
		};

		const migrated = migrate(v9State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v9 fields preserved
		expect(migrated.rank).toBe(6);
		expect(migrated.tier).toBe(2);
		expect(migrated.lp).toBe(55);
		expect(migrated.totalLp).toBe(2600);
		expect(migrated.practiceDays).toBe(5); // v17 day->week: ceil(35 / 7)
		if ('reviews' in migrated) {
			expect(Object.keys(migrated.reviews.submissions)).toHaveLength(1);
		}

		// New v10 fields
		if ('lpEarnedToday' in migrated) {
			expect(migrated.lpEarnedToday).toBe(0);
		}
		if ('lastLpDate' in migrated) {
			expect(migrated.lastLpDate).toBeNull();
		}
	});

	it('migrates v10 to v11: adds lastModified', () => {
		const v10State: StateV10 = {
			schemaVersion: 10,
			rank: 7,
			tier: 1,
			lp: 20,
			totalLp: 2800,
			practiceDays: 40,
			lastSessionDate: '2026-05-02',
			lastDailyBonusDate: '2026-05-02',
			lpEarnedToday: 35,
			lastLpDate: '2026-05-02',
			tts: { googleApiKey: 'key-v10' },
			audio: { sfxMuted: false },
			match: { completedToday: 12, lastMatchDate: '2026-05-02', bestStreak: 11 },
			cards: {
				reviewedToday: 15,
				lastReviewDate: '2026-05-02',
				newCardsPerDay: 20,
				totalReviewed: 400
			},
			boss: { attempts: 12, wins: 7, losses: 5, rankDefeated: 6 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-15T10:00:00Z' } },
			missions: { daily: [], lastMissionDate: '2026-05-02' },
			grammar: {
				completedLessons: ['gl_0_articles', 'gl_1_plurals'],
				exerciseResults: {},
				currentLesson: null,
				currentExerciseIndex: 0
			},
			conversation: {
				readChapters: ['c_0_ch0', 'c_0_ch1', 'c_0_ch2'],
				questionResults: {},
				currentStory: null,
				currentChapter: 0
			},
			reviews: {
				submissions: {
					rev_456: {
						taskId: 'sch_2025_2',
						answer: 'mijn antwoord',
						submittedAt: '2026-05-02T09:00:00Z',
						verdict: 'close',
						comment: 'bijna',
						reviewedAt: '2026-05-02T09:10:00Z'
					}
				}
			}
		};

		const migrated = migrate(v10State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// All v10 fields preserved
		expect(migrated.rank).toBe(7);
		expect(migrated.tier).toBe(1);
		expect(migrated.lp).toBe(20);
		expect(migrated.totalLp).toBe(2800);
		expect(migrated.practiceDays).toBe(6); // v17 day->week: ceil(40 / 7)
		if ('lpEarnedToday' in migrated) expect(migrated.lpEarnedToday).toBe(35);
		if ('lastLpDate' in migrated) expect(migrated.lastLpDate).toBe('2026-05-02');
		if ('reviews' in migrated) {
			expect(Object.keys(migrated.reviews.submissions)).toHaveLength(1);
		}

		// New v11 field
		if ('lastModified' in migrated) {
			expect(migrated.lastModified).toBeNull();
		}
	});

	it('migrates v15 to v16: adds dailyHomework, preserves every prior field including card review sync', () => {
		// A v15 state with meaningful values in every field — the most
		// load-bearing migration test in this stream. If any prior
		// field is dropped or mutated, the assertions below catch it.
		const v15State = {
			schemaVersion: 15 as const,
			rank: 4,
			tier: 2,
			lp: 60,
			totalLp: 1500,
			practiceDays: 22,
			lastSessionDate: '2026-06-05',
			lastDailyBonusDate: '2026-06-05',
			lpEarnedToday: 18,
			lastLpDate: '2026-06-05',
			lastModified: '2026-06-05T14:30:00Z',
			tts: { googleApiKey: 'my-api-key' },
			audio: { sfxMuted: true },
			match: { completedToday: 14, lastMatchDate: '2026-06-05', bestStreak: 8 },
			cards: {
				reviewedToday: 9,
				lastReviewDate: '2026-06-05',
				newCardsPerDay: 30,
				totalReviewed: 612
			},
			boss: { attempts: 5, wins: 3, losses: 2, rankDefeated: 3 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' } },
			missions: {
				daily: [{ id: 'match_15', progress: 5, completed: false }],
				lastMissionDate: '2026-06-05'
			},
			grammar: {
				completedLessons: ['gl_0_articles', 'gl_2_present_tense'],
				exerciseResults: { g_0_articles_1: { correct: true, attemptedAt: '2026-05-12T10:00:00Z' } },
				currentLesson: null,
				currentExerciseIndex: 0
			},
			conversation: {
				readChapters: ['cc_0_1', 'cc_0_2'],
				questionResults: { cq_0_1_1: { correct: true, attemptedAt: '2026-05-20T10:00:00Z' } },
				currentStory: null,
				currentChapter: 0
			},
			reviews: { submissions: {} },
			luisteren: {
				questionResults: { '2025-6': { correct: true, attemptedAt: '2026-05-25T10:00:00Z' } }
			},
			lezen: {
				questionResults: { lezen_2025_1_3: { correct: false, attemptedAt: '2026-05-26T10:00:00Z' } }
			},
			cardReviews: {
				word_001: {
					wordId: 'word_001',
					interval: 7,
					easeFactor: 2.5,
					repetitions: 3,
					nextReviewDate: '2026-06-12',
					lastReviewDate: '2026-06-05',
					firstSeenDate: '2026-05-15'
				}
			}
		};

		const migrated = migrate(v15State) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// Every prior field must come through untouched — except
		// practiceDays, which the v16->v17 step converts from a day
		// streak to a week streak: ceil(22 / 7) = 4.
		expect(migrated.rank).toBe(4);
		expect(migrated.tier).toBe(2);
		expect(migrated.lp).toBe(60);
		expect(migrated.totalLp).toBe(1500);
		expect(migrated.practiceDays).toBe(4);
		expect(migrated.lastSessionDate).toBe('2026-06-05');
		expect(migrated.lastDailyBonusDate).toBe('2026-06-05');
		expect(migrated.lpEarnedToday).toBe(18);
		expect(migrated.lastLpDate).toBe('2026-06-05');
		expect(migrated.lastModified).toBe('2026-06-05T14:30:00Z');

		if ('tts' in migrated) expect(migrated.tts.googleApiKey).toBe('my-api-key');
		if ('audio' in migrated) expect(migrated.audio.sfxMuted).toBe(true);
		if ('match' in migrated) {
			expect(migrated.match.completedToday).toBe(14);
			expect(migrated.match.bestStreak).toBe(8);
		}
		if ('cards' in migrated) {
			expect(migrated.cards.reviewedToday).toBe(9);
			expect(migrated.cards.newCardsPerDay).toBe(30);
			expect(migrated.cards.totalReviewed).toBe(612);
		}
		if ('boss' in migrated) {
			expect(migrated.boss.attempts).toBe(5);
			expect(migrated.boss.wins).toBe(3);
			expect(migrated.boss.rankDefeated).toBe(3);
		}
		if ('achievements' in migrated) {
			expect(migrated.achievements['ach_first_match'].unlockedAt).toBe('2026-04-10T09:00:00Z');
		}
		if ('missions' in migrated) {
			expect(migrated.missions.daily).toHaveLength(1);
			expect(migrated.missions.daily[0].id).toBe('match_15');
		}
		// Grammar is stripped by v17 — the current state must not carry it.
		expect(migrated).not.toHaveProperty('grammar');
		if ('conversation' in migrated) {
			expect(migrated.conversation.readChapters).toEqual(['cc_0_1', 'cc_0_2']);
		}
		if ('luisteren' in migrated) {
			expect(migrated.luisteren.questionResults['2025-6'].correct).toBe(true);
		}
		if ('lezen' in migrated) {
			expect(migrated.lezen.questionResults['lezen_2025_1_3'].correct).toBe(false);
		}
		// CRITICAL: card review SRS data must survive — losing this
		// would wipe Domi's per-card learning progress on the next sync.
		if ('cardReviews' in migrated) {
			expect(migrated.cardReviews['word_001']).toBeDefined();
			expect(migrated.cardReviews['word_001'].interval).toBe(7);
			expect(migrated.cardReviews['word_001'].repetitions).toBe(3);
			expect(migrated.cardReviews['word_001'].easeFactor).toBe(2.5);
		}

		// New v16 field: dailyHomework populated with the empty default.
		if ('dailyHomework' in migrated) {
			expect(migrated.dailyHomework.date).toBeNull();
			expect(migrated.dailyHomework.questions).toEqual([]);
			expect(migrated.dailyHomework.currentIndex).toBe(0);
			expect(migrated.dailyHomework.results).toEqual({});
			expect(migrated.dailyHomework.completed).toBe(false);
			expect(migrated.dailyHomework.lpEarned).toBe(0);
		}
	});

	// ============================================================
	// v16 -> v17: grammar removal + daily->weekly streak conversion
	// ============================================================

	// Minimal v16 fixture builder; only the streak inputs vary per case.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function makeV16(practiceDays: number, lastSessionDate: string | null): any {
		return {
			schemaVersion: 16 as const,
			rank: 4,
			tier: 2,
			lp: 60,
			totalLp: 1500,
			practiceDays,
			lastSessionDate,
			lastDailyBonusDate: '2026-06-05',
			lpEarnedToday: 18,
			lastLpDate: '2026-06-05',
			lastModified: '2026-06-05T14:30:00Z',
			tts: { googleApiKey: 'my-api-key' },
			audio: { sfxMuted: true },
			match: { completedToday: 14, lastMatchDate: '2026-06-05', bestStreak: 8 },
			cards: {
				reviewedToday: 9,
				lastReviewDate: '2026-06-05',
				newCardsPerDay: 30,
				totalReviewed: 612
			},
			boss: { attempts: 5, wins: 3, losses: 2, rankDefeated: 3 },
			achievements: { ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' } },
			missions: {
				daily: [{ id: 'match_15', progress: 5, completed: false }],
				lastMissionDate: '2026-06-05'
			},
			grammar: {
				completedLessons: ['gl_0_articles', 'gl_2_present_tense'],
				exerciseResults: { g_0_articles_1: { correct: true, attemptedAt: '2026-05-12T10:00:00Z' } },
				currentLesson: null,
				currentExerciseIndex: 0
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
			cardReviews: {
				word_001: {
					wordId: 'word_001',
					interval: 7,
					easeFactor: 2.5,
					repetitions: 3,
					nextReviewDate: '2026-06-12',
					lastReviewDate: '2026-06-05',
					firstSeenDate: '2026-05-15'
				}
			},
			dailyHomework: {
				date: null,
				questions: [],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0
			}
		};
	}

	it('migrates v16 to v17: strips grammar, banks LP, preserves progress + card SRS', () => {
		const migrated = migrate(makeV16(14, '2026-06-05'));

		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(CURRENT_SCHEMA_VERSION).toBe(26);

		// Grammar fully removed — no orphan left in persisted state.
		expect(migrated).not.toHaveProperty('grammar');

		// Banked currency + rank untouched (never de-rank, never lose LP).
		expect(migrated.rank).toBe(4);
		expect(migrated.tier).toBe(2);
		expect(migrated.lp).toBe(60);
		expect(migrated.totalLp).toBe(1500);

		// Non-grammar progress preserved.
		if ('boss' in migrated) expect(migrated.boss.rankDefeated).toBe(3);
		if ('achievements' in migrated)
			expect(migrated.achievements['ach_first_match'].unlockedAt).toBe('2026-04-10T09:00:00Z');
		if ('conversation' in migrated) expect(migrated.conversation.readChapters).toEqual(['cc_0_1']);
		// CRITICAL: card review SRS data must survive the field strip.
		if ('cardReviews' in migrated) {
			expect(migrated.cardReviews['word_001'].interval).toBe(7);
			expect(migrated.cardReviews['word_001'].repetitions).toBe(3);
		}
		// dailyHomework carried forward unchanged.
		if ('dailyHomework' in migrated) expect(migrated.dailyHomework.date).toBeNull();
	});

	it('v16 to v17 converts the day-streak to a week-streak, rounding in her favor (>= 1 for any prior activity)', () => {
		// ceil(days / 7), floored at 1 whenever there was prior activity.
		expect(migrate(makeV16(14, '2026-06-05')).practiceDays).toBe(2); // exactly 2 weeks
		expect(migrate(makeV16(3, '2026-06-05')).practiceDays).toBe(1); // partial week -> 1
		expect(migrate(makeV16(7, '2026-06-05')).practiceDays).toBe(1); // 1 full week
		expect(migrate(makeV16(8, '2026-06-05')).practiceDays).toBe(2); // rounds up
		expect(migrate(makeV16(30, '2026-06-05')).practiceDays).toBe(5); // ceil(30/7)
		// Edge: a lingering lastSessionDate but a zeroed counter still floors at 1.
		expect(migrate(makeV16(0, '2026-06-05')).practiceDays).toBe(1);
		// Truly no activity stays at 0 (no phantom streak).
		expect(migrate(makeV16(0, null)).practiceDays).toBe(0);
	});

	// ============================================================
	// v17 -> v18: Daily quiz + Daily Read (Phase 3)
	// ADDITIVE ONLY — every prior field must survive byte-identical.
	// ============================================================

	function makeV17() {
		return {
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
				readChapters: ['cc_0_1', 'cc_0_2'],
				questionResults: { cq_0_1_1: { correct: true, attemptedAt: '2026-07-01T10:00:00Z' } },
				currentStory: 'story_0',
				currentChapter: 1
			},
			reviews: { submissions: {} },
			luisteren: {
				questionResults: { '2025-6': { correct: true, attemptedAt: '2026-07-15T10:00:00Z' } }
			},
			lezen: {
				questionResults: { lezen_2025_1_3: { correct: false, attemptedAt: '2026-07-16T10:00:00Z' } }
			},
			cardReviews: {
				word_001: {
					wordId: 'word_001',
					interval: 7,
					easeFactor: 2.5,
					repetitions: 3,
					nextReviewDate: '2026-08-17',
					lastReviewDate: '2026-08-10',
					firstSeenDate: '2026-05-15'
				},
				word_002: {
					wordId: 'word_002',
					interval: 1,
					easeFactor: 2.3,
					repetitions: 1,
					nextReviewDate: '2026-08-11',
					lastReviewDate: '2026-08-10',
					firstSeenDate: '2026-08-01'
				}
			},
			dailyHomework: {
				date: '2026-08-10',
				questions: [{ id: 'q_a' }, { id: 'q_b' }],
				currentIndex: 1,
				results: { 0: true },
				completed: false,
				lpEarned: 4
			}
		};
	}

	it('migrates v17 to current: adds dailyQuiz + dailyRead defaults, preserves every prior field', () => {
		const v17State = makeV17();
		const migrated = migrate(v17State);

		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// Every prior progress field must come through byte-identical.
		expect(migrated.rank).toBe(3);
		expect(migrated.tier).toBe(2);
		expect(migrated.lp).toBe(47);
		expect(migrated.totalLp).toBe(1284);
		expect(migrated.practiceDays).toBe(9);

		if ('cardReviews' in migrated) {
			expect(migrated.cardReviews['word_001']).toEqual(v17State.cardReviews.word_001);
			expect(migrated.cardReviews['word_002']).toEqual(v17State.cardReviews.word_002);
		}
		if ('conversation' in migrated) {
			expect(migrated.conversation.readChapters).toEqual(['cc_0_1', 'cc_0_2']);
		}
		if ('achievements' in migrated) {
			expect(migrated.achievements).toEqual({
				ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' }
			});
		}
		if ('dailyHomework' in migrated) {
			expect(migrated.dailyHomework).toEqual({ ...v17State.dailyHomework, swaps: EMPTY_SWAPS });
		}

		// New v18 keys arrive at the documented empty defaults.
		if ('dailyQuiz' in migrated) {
			expect(migrated.dailyQuiz).toEqual({
				date: null,
				questionIds: [],
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: EMPTY_SWAPS
			});
		}
		if ('dailyRead' in migrated) {
			expect(migrated.dailyRead).toEqual({
				date: null,
				done: false
			});
		}
	});

	it('migrates v1 all the way to current with dailyQuiz + dailyRead defaults present', () => {
		const v1State: StateV1 = {
			schemaVersion: 1,
			rank: 3,
			tier: 2,
			lp: 47,
			totalLp: 1247,
			practiceDays: 15,
			lastSessionDate: '2026-04-25',
			tts: { googleApiKey: 'test-key-abc' }
		};

		const migrated = migrate(v1State);
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		if ('dailyQuiz' in migrated) {
			expect(migrated.dailyQuiz).toEqual({
				date: null,
				questionIds: [],
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: EMPTY_SWAPS
			});
		}
		if ('dailyRead' in migrated) {
			expect(migrated.dailyRead).toEqual({
				date: null,
				done: false
			});
		}
	});

	it('v17 to current is non-destructive: every v17 key survives on the migrated result', () => {
		const v17State = makeV17();
		const priorKeys = Object.keys(v17State);
		const migrated = migrate(v17State);
		const migratedKeys = Object.keys(migrated);

		for (const key of priorKeys) {
			expect(migratedKeys).toContain(key);
		}
	});

	// ============================================================
	// v18 -> v19: Kuromi the Steward (Phase 5)
	// ADDITIVE ONLY — every prior field must survive byte-identical.
	// ============================================================

	function makeV18() {
		return {
			schemaVersion: 18 as const,
			rank: 4,
			tier: 3,
			lp: 62,
			totalLp: 2140,
			practiceDays: 11,
			lastSessionDate: '2026-08-15',
			lastDailyBonusDate: '2026-08-15',
			lpEarnedToday: 28,
			lastLpDate: '2026-08-15',
			lastModified: '2026-08-15T18:30:00Z',
			tts: { googleApiKey: 'v18-key' },
			audio: { sfxMuted: true },
			match: { completedToday: 14, lastMatchDate: '2026-08-15', bestStreak: 9 },
			cards: {
				reviewedToday: 12,
				lastReviewDate: '2026-08-15',
				newCardsPerDay: 30,
				totalReviewed: 610
			},
			boss: { attempts: 9, wins: 5, losses: 4, rankDefeated: 3 },
			achievements: {
				ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' },
				ach_streak_7: { unlockedAt: '2026-06-01T12:00:00Z' }
			},
			missions: {
				daily: [
					{ id: 'match_15', progress: 7, completed: false },
					{ id: 'cards_20', progress: 20, completed: true }
				],
				lastMissionDate: '2026-08-15'
			},
			conversation: {
				readChapters: ['cc_0_1', 'cc_0_2', 'cc_1_1'],
				questionResults: {
					cq_0_1_1: { correct: true, attemptedAt: '2026-07-01T10:00:00Z' },
					cq_1_1_2: { correct: false, attemptedAt: '2026-08-01T11:00:00Z' }
				},
				currentStory: 'story_1',
				currentChapter: 2
			},
			reviews: {
				submissions: {
					task_01: {
						taskId: 'task_01',
						answer: 'Ik ga naar school',
						submittedAt: '2026-08-01T09:00:00Z',
						verdict: 'pass' as const,
						comment: 'goed',
						reviewedAt: '2026-08-02T10:00:00Z'
					}
				}
			},
			luisteren: {
				questionResults: {
					'2025-6': { correct: true, attemptedAt: '2026-07-15T10:00:00Z' }
				}
			},
			lezen: {
				questionResults: {
					lezen_2025_1_3: { correct: false, attemptedAt: '2026-07-16T10:00:00Z' }
				}
			},
			cardReviews: {
				word_001: {
					wordId: 'word_001',
					interval: 14,
					easeFactor: 2.6,
					repetitions: 5,
					nextReviewDate: '2026-08-29',
					lastReviewDate: '2026-08-15',
					firstSeenDate: '2026-05-15'
				},
				word_002: {
					wordId: 'word_002',
					interval: 3,
					easeFactor: 2.4,
					repetitions: 2,
					nextReviewDate: '2026-08-18',
					lastReviewDate: '2026-08-15',
					firstSeenDate: '2026-08-01'
				}
			},
			dailyHomework: {
				date: '2026-08-15',
				questions: [{ id: 'q_a' }, { id: 'q_b' }, { id: 'q_c' }],
				currentIndex: 2,
				results: { 0: true, 1: false },
				completed: false,
				lpEarned: 8
			},
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['qz1', 'qz2', 'qz3', 'qz4', 'qz5'],
				results: { qz1: true, qz2: true },
				completed: false,
				lpEarned: 4
			},
			dailyRead: {
				date: '2026-08-15',
				done: true
			}
		};
	}

	it('migrates v18 to v19: adds steward fields at defaults, every prior field byte-identical', () => {
		const v18State = makeV18();
		const migrated = migrate(v18State) as CurrentState;

		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

		// Every pre-existing field must survive with equal values.
		expect(migrated.rank).toEqual(v18State.rank);
		expect(migrated.tier).toEqual(v18State.tier);
		expect(migrated.lp).toEqual(v18State.lp);
		expect(migrated.totalLp).toEqual(v18State.totalLp);
		expect(migrated.practiceDays).toEqual(v18State.practiceDays);
		expect(migrated.lastSessionDate).toEqual(v18State.lastSessionDate);
		expect(migrated.lastDailyBonusDate).toEqual(v18State.lastDailyBonusDate);
		expect(migrated.lpEarnedToday).toEqual(v18State.lpEarnedToday);
		expect(migrated.lastLpDate).toEqual(v18State.lastLpDate);
		expect(migrated.lastModified).toEqual(v18State.lastModified);
		expect(migrated.tts).toEqual(v18State.tts);
		expect(migrated.audio).toEqual(v18State.audio);
		expect(migrated.match).toEqual(v18State.match);
		expect(migrated.cards).toEqual(v18State.cards);
		expect(migrated.boss).toEqual(v18State.boss);
		expect(migrated.achievements).toEqual(v18State.achievements);
		expect(migrated.missions).toEqual(v18State.missions);
		expect(migrated.conversation).toEqual(v18State.conversation);
		expect(migrated.reviews).toEqual(v18State.reviews);
		expect(migrated.luisteren).toEqual(v18State.luisteren);
		expect(migrated.lezen).toEqual(v18State.lezen);
		expect(migrated.cardReviews).toEqual(v18State.cardReviews);
		expect(migrated.dailyHomework).toEqual({ ...v18State.dailyHomework, swaps: EMPTY_SWAPS });
		expect(migrated.dailyQuiz).toEqual({ ...v18State.dailyQuiz, swaps: EMPTY_SWAPS });
		expect(migrated.dailyRead).toEqual(v18State.dailyRead);

		// New v19 keys at documented defaults.
		expect(migrated.appConfig).toEqual({
			progression: { display: 'score' },
			streaks: 'strict',
			missions: 'on',
			quiz: { focusCategories: [] },
			dailyPath: { order: [...DEFAULT_GLOW_ORDER] }
		});
		expect(migrated.appConfig.dailyPath.order).toEqual(DEFAULT_GLOW_ORDER);
		expect(migrated.adjustments).toEqual([]);
		expect(migrated.steward).toEqual({ awards: [], lastForgivenWeek: null });
	});

	it('migrate from v16 lands on current schema (chain runs through v19–v21)', () => {
		const migrated = migrate(makeV16(14, '2026-06-05')) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated.appConfig.dailyPath.order).toEqual(DEFAULT_GLOW_ORDER);
		expect(migrated.adjustments).toEqual([]);
		expect(migrated.steward).toEqual({ awards: [], lastForgivenWeek: null });
		expect(migrated.pages).toEqual([]);
		expect(migrated.conversations).toEqual([]);
	});

	it('v18 to v19 is non-destructive: every v18 key survives with equal values', () => {
		const v18State = makeV18();
		const priorKeys = Object.keys(v18State);
		const migrated = migrate(v18State);
		const migratedKeys = Object.keys(migrated);

		for (const key of priorKeys) {
			expect(migratedKeys).toContain(key);
			// schemaVersion intentionally bumps 18 -> 19; every other prior field is byte-identical.
			if (key === 'schemaVersion') continue;
			if (key === 'dailyHomework' || key === 'dailyQuiz') {
				const prior = (v18State as unknown as Record<string, unknown>)[key];
				expect((migrated as unknown as Record<string, unknown>)[key]).toEqual({
					...(prior as object),
					swaps: EMPTY_SWAPS
				});
				continue;
			}
			expect((migrated as unknown as Record<string, unknown>)[key]).toEqual(
				(v18State as unknown as Record<string, unknown>)[key]
			);
		}
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
	});

	// ============================================================
	// v19 -> v20: Kuromi pages + conversations (Phase 6)
	// ADDITIVE ONLY — every prior field must survive byte-identical.
	// Existing adjustments gain source: 'kuromi' explicitly.
	// ============================================================

	function makeV19() {
		return {
			schemaVersion: 19 as const,
			rank: 5,
			tier: 2,
			lp: 40,
			totalLp: 2500,
			practiceDays: 12,
			lastSessionDate: '2026-08-18',
			lastDailyBonusDate: '2026-08-18',
			lpEarnedToday: 15,
			lastLpDate: '2026-08-18',
			lastModified: '2026-08-18T12:00:00Z',
			tts: { googleApiKey: 'v19-key' },
			audio: { sfxMuted: false },
			match: { completedToday: 3, lastMatchDate: '2026-08-18', bestStreak: 11 },
			cards: {
				reviewedToday: 8,
				lastReviewDate: '2026-08-18',
				newCardsPerDay: 30,
				totalReviewed: 700
			},
			boss: { attempts: 10, wins: 6, losses: 4, rankDefeated: 4 },
			achievements: {
				ach_first_match: { unlockedAt: '2026-04-10T09:00:00Z' }
			},
			missions: {
				daily: [{ id: 'match_15', progress: 3, completed: false }],
				lastMissionDate: '2026-08-18'
			},
			conversation: {
				readChapters: ['cc_0_1'],
				questionResults: {
					cq_0_1_1: { correct: true, attemptedAt: '2026-07-01T10:00:00Z' }
				},
				currentStory: 'story_0',
				currentChapter: 1
			},
			reviews: { submissions: {} },
			luisteren: { questionResults: {} },
			lezen: { questionResults: {} },
			cardReviews: {
				word_001: {
					wordId: 'word_001',
					interval: 7,
					easeFactor: 2.5,
					repetitions: 3,
					nextReviewDate: '2026-08-25',
					lastReviewDate: '2026-08-18',
					firstSeenDate: '2026-05-15'
				}
			},
			dailyHomework: {
				date: '2026-08-18',
				questions: [{ id: 'q_a' }],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyQuiz: {
				date: '2026-08-18',
				questionIds: ['qz1'],
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyRead: { date: '2026-08-18', done: false },
			appConfig: {
				progression: { display: 'score' as const },
				streaks: 'strict' as const,
				missions: 'on' as const,
				quiz: { focusCategories: ['food'] },
				dailyPath: { order: [...DEFAULT_GLOW_ORDER] }
			},
			adjustments: [
				{
					id: 'adj_pre',
					timestamp: '2026-08-17T10:00:00.000Z',
					tool: 'award_lp' as const,
					outcome: 'applied' as const,
					detail: 'gave 5 LP',
					reason: 'nice',
					payload: { amount: 5 },
					undone: false
				},
				{
					id: 'adj_pre2',
					timestamp: '2026-08-17T11:00:00.000Z',
					tool: 'update_config' as const,
					outcome: 'capped' as const,
					detail: 'capped',
					reason: 'limit',
					payload: { streaks: 'gentle' },
					undone: true
				}
			],
			steward: {
				awards: [{ id: 'aw1', at: '2026-08-17T09:00:00.000Z', amount: 10 }],
				lastForgivenWeek: '2026-W33'
			}
		};
	}

	it('migrates v19 to v20: pages/conversations empty, adjustments gain source kuromi, priors identical', () => {
		const v19State = makeV19();
		const migrated = migrate(v19State) as CurrentState;

		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(CURRENT_SCHEMA_VERSION).toBe(26);

		expect(migrated.rank).toEqual(v19State.rank);
		expect(migrated.tier).toEqual(v19State.tier);
		expect(migrated.lp).toEqual(v19State.lp);
		expect(migrated.totalLp).toEqual(v19State.totalLp);
		expect(migrated.practiceDays).toEqual(v19State.practiceDays);
		expect(migrated.lastSessionDate).toEqual(v19State.lastSessionDate);
		expect(migrated.lastDailyBonusDate).toEqual(v19State.lastDailyBonusDate);
		expect(migrated.lpEarnedToday).toEqual(v19State.lpEarnedToday);
		expect(migrated.lastLpDate).toEqual(v19State.lastLpDate);
		expect(migrated.lastModified).toEqual(v19State.lastModified);
		expect(migrated.tts).toEqual(v19State.tts);
		expect(migrated.audio).toEqual(v19State.audio);
		expect(migrated.match).toEqual(v19State.match);
		expect(migrated.cards).toEqual(v19State.cards);
		expect(migrated.boss).toEqual(v19State.boss);
		expect(migrated.achievements).toEqual(v19State.achievements);
		expect(migrated.missions).toEqual(v19State.missions);
		expect(migrated.conversation).toEqual(v19State.conversation);
		expect(migrated.reviews).toEqual(v19State.reviews);
		expect(migrated.luisteren).toEqual(v19State.luisteren);
		expect(migrated.lezen).toEqual(v19State.lezen);
		expect(migrated.cardReviews).toEqual(v19State.cardReviews);
		expect(migrated.dailyHomework).toEqual({ ...v19State.dailyHomework, swaps: EMPTY_SWAPS });
		expect(migrated.dailyQuiz).toEqual({ ...v19State.dailyQuiz, swaps: EMPTY_SWAPS });
		expect(migrated.dailyRead).toEqual(v19State.dailyRead);
		expect(migrated.appConfig).toEqual(v19State.appConfig);
		expect(migrated.steward).toEqual(v19State.steward);

		expect(migrated.pages).toEqual([]);
		expect(migrated.conversations).toEqual([]);

		expect(migrated.adjustments).toHaveLength(2);
		expect(migrated.adjustments[0]).toEqual({
			...v19State.adjustments[0],
			source: 'kuromi'
		});
		expect(migrated.adjustments[1]).toEqual({
			...v19State.adjustments[1],
			source: 'kuromi'
		});
		// Explicit backfill even though the type makes source optional.
		expect(migrated.adjustments[0].source).toBe('kuromi');
		expect(migrated.adjustments[1].source).toBe('kuromi');
	});

	it('v1 to current chain still lands with pages and conversations', () => {
		const v1State: StateV1 = {
			schemaVersion: 1,
			rank: 1,
			tier: 1,
			lp: 10,
			totalLp: 100,
			practiceDays: 7,
			lastSessionDate: '2026-01-01',
			tts: { googleApiKey: null }
		};
		const migrated = migrate(v1State) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated.pages).toEqual([]);
		expect(migrated.conversations).toEqual([]);
		expect(migrated.lp).toBe(10);
		expect(migrated.totalLp).toBe(100);
		expect(migrated.gates.current).toBe(1);
	});

	it('createDefaultState returns current schema with empty pages, conversations, and Gate 1', () => {
		const state = createDefaultState();
		expect(state.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(state.pages).toEqual([]);
		expect(state.conversations).toEqual([]);
		expect(state.gates).toEqual({ current: 1, mastered: [], quizLog: [], weekLog: [] });
	});

	it('migrates v20 to v21: Iron/empty SRS lands Gate 1, LP tuple untouched', () => {
		const v20 = {
			...createDefaultState(),
			schemaVersion: 20 as const,
			rank: 0,
			tier: 1,
			lp: 40,
			totalLp: 40,
			cardReviews: {}
		};
		delete (v20 as { gates?: unknown }).gates;
		const migrated = migrate(v20) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated.rank).toBe(0);
		expect(migrated.tier).toBe(1);
		expect(migrated.lp).toBe(40);
		expect(migrated.totalLp).toBe(40);
		expect(migrated.gates.current).toBe(1);
		expect(migrated.gates.mastered).toEqual([]);
	});

	it('migrates v21 to v22: swap ledgers empty, gates and LP untouched', () => {
		const v21 = {
			...createDefaultState(),
			schemaVersion: 21 as const,
			rank: 0,
			lp: 12,
			totalLp: 40,
			gates: { current: 1 as const, mastered: [], quizLog: [], weekLog: [] }
		};
		delete (v21.dailyQuiz as { swaps?: unknown }).swaps;
		delete (v21.dailyHomework as { swaps?: unknown }).swaps;
		const migrated = migrate(v21) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated.dailyQuiz.swaps).toEqual({ date: null, used: 0, swappedOutIds: [] });
		expect(migrated.dailyHomework.swaps).toEqual({ date: null, used: 0, swappedOutIds: [] });
		expect(migrated.lp).toBe(12);
		expect(migrated.gates.current).toBe(1);
		expect(migrated.readingFork.misses).toEqual([]);
		expect(migrated.readingFork.satMocks).toEqual([]);
	});

	it('migrates v22 to v23: readingFork empty, LP untouched', () => {
		const v22 = {
			...createDefaultState(),
			schemaVersion: 22 as const,
			lp: 9,
			totalLp: 40
		};
		delete (v22 as { readingFork?: unknown }).readingFork;
		const migrated = migrate(v22) as CurrentState;
		expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
		expect(migrated.readingFork.eval.completed).toBe(false);
		expect(migrated.readingFork.misses).toEqual([]);
		expect(migrated.readingFork.satMocks).toEqual([]);
		expect(migrated.lp).toBe(9);
	});

	it('migrates v23 through v25: streak stays, stickers stay gone, year 0 becomes a mock', () => {
		const v23 = {
			...createDefaultState(),
			schemaVersion: 23 as const,
			lp: 9,
			readingFork: {
				eval: {
					date: '2026-09-01',
					passageSlug: 'ruud-rij-instructeur',
					year: 2025,
					gistOptions: ['a'],
					gistAnswer: 'a',
					gistPicked: 'b',
					questionIds: ['lezen-2025-1'],
					results: { 'lezen-2025-1': false },
					completed: true
				},
				showUpStreak: 4,
				lastEvalDate: '2026-09-01',
				trapCards: [{ id: 'trap:verwijzing' }],
				trapStickers: ['verwijzing'],
				lastMockAt: '2026-08-01',
				lastMockScore: { correct: 20, total: 35, passed: false }
			}
		};
		const migrated = migrate(v23) as CurrentState;
		const paperYear = [2025, 2024, 2023][dayIndex('2026-08-01', 3, 9)];
		expect(migrated.schemaVersion).toBe(26);
		expect(migrated.readingFork.showUpStreak).toBe(4);
		expect(migrated.readingFork.lastEvalDate).toBe('2026-09-01');
		expect(migrated.readingFork.misses).toEqual([]);
		expect(migrated.readingFork.satMocks).toEqual([]);
		expect(migrated.readingFork.eval).toEqual({
			date: null,
			passageSlug: null,
			mapDone: false,
			itemIds: [],
			answers: {},
			completed: false
		});
		expect(migrated.readingFork.lastMockScore).toEqual({
			correct: 20,
			total: 35,
			passed: false,
			year: 0
		});
		expect(migrated.readingFork).not.toHaveProperty('trapCards');
		expect(migrated.readingFork).not.toHaveProperty('trapStickers');
		expect(migrated.readingFork.mocks).toEqual([
			{
				id: 'migrated-2026-08-01',
				paperYear,
				finishedAt: '2026-08-01',
				expired: false,
				correct: 20,
				total: 35,
				passLine: paperYear === 2023 ? 23 : 24,
				byQtype: {},
				textMs: [],
				answers: {},
				flagged: {}
			}
		]);
		expect(migrated.readingFork.mockInProgress).toBeNull();
		expect(migrated.readingFork.attempts).toEqual([]);
		expect(migrated.readingFork.traps).toEqual([]);
		expect(migrated.readingFork.settings).toEqual({
			examDate: '2026-11-12',
			reservedPapers: [2023],
			lookupsPerText: 5
		});
		expect(migrated.lp).toBe(9);
	});

	it('migrates a realistic v24 fork: official attempts, real mock year, 2023 stays reserved', () => {
		const v24 = {
			...createDefaultState(),
			schemaVersion: 24 as const,
			lezen: {
				questionResults: {
					'missing-item': { correct: true, attemptedAt: '2026-09-01T10:00:00.000Z' },
					'lezen-2024-1': { correct: true, attemptedAt: '2026-09-02T10:00:00.000Z' },
					'lezen-2025-1': { correct: false, attemptedAt: '2026-09-03T10:00:00.000Z' }
				}
			},
			readingFork: {
				eval: {
					date: '2026-09-04',
					passageSlug: 'bakkerij',
					results: { 'lezen-2024-1': true },
					completed: true
				},
				showUpStreak: 2,
				lastEvalDate: '2026-09-04',
				misses: [{ questionId: 'lezen-2024-2', picked: 'A', seen: false }],
				satMocks: [2024],
				lastMockAt: '2026-09-05',
				lastMockScore: { correct: 25, total: 35, passed: true, year: 2024 }
			}
		};
		const migrated = migrate(v24) as CurrentState;
		expect(migrated.schemaVersion).toBe(26);
		expect(migrated.readingFork.showUpStreak).toBe(2);
		expect(migrated.readingFork.lastEvalDate).toBe('2026-09-04');
		expect(migrated.readingFork.misses).toEqual([
			{ questionId: 'lezen-2024-2', picked: 'A', seen: false }
		]);
		expect(migrated.readingFork.satMocks).toEqual([]);
		expect(migrated.readingFork.eval.date).toBeNull();
		expect(migrated.readingFork.eval.answers).toEqual({});
		expect(migrated.readingFork.attempts.map((attempt) => attempt.itemId)).toEqual([
			'missing-item',
			'lezen-2024-1',
			'lezen-2025-1'
		]);
		expect(migrated.readingFork.attempts[1]).toMatchObject({
			itemId: 'lezen-2024-1',
			origin: 'official',
			passageSlug: 'bakkerij',
			source: 'texts',
			picked: '',
			correct: true,
			locateP: null,
			locateHit: null,
			ms: 0
		});
		expect(migrated.readingFork.attempts[0].passageSlug).toBe('');
		expect(migrated.readingFork.attempts[2]).toMatchObject({
			itemId: 'lezen-2025-1',
			origin: 'official',
			passageSlug: 'ruud-rij-instructeur',
			source: 'texts',
			picked: '',
			correct: false
		});
		expect(migrated.readingFork.mocks).toEqual([]);
		expect(migrated.readingFork.lastMockScore).toBeNull();
		expect(migrated.readingFork.lastMockAt).toBeNull();
		expect(migrated.readingFork.settings.reservedPapers).toEqual([2023, 2024]);
		expect(migrated.readingFork.settings.examDate).toBe('2026-11-12');
	});

	it('reserves the newest unsat paper only after 2023 has a real mock', () => {
		expect(reservedPapersFor([], 0)).toEqual([2023]);
		expect(reservedPapersFor([2024], 2024)).toEqual([2023]);
		expect(reservedPapersFor([2023], 2023)).toEqual([2025]);
		expect(reservedPapersFor([2023, 2025], 2023)).toEqual([2024]);
		expect(reservedPapersFor([2023, 2025, 2024], 2024)).toEqual([]);
	});

	it('caps seeded attempts at 5000 and drops the oldest', () => {
		const questionResults: Record<string, { correct: boolean; attemptedAt: string }> = {};
		for (let i = 0; i < 5001; i++) {
			questionResults[`extra-${i}`] = {
				correct: i % 2 === 0,
				attemptedAt: String(i).padStart(5, '0')
			};
		}
		const v24 = {
			...createDefaultState(),
			schemaVersion: 24 as const,
			lezen: { questionResults },
			readingFork: {
				eval: { date: null, passageSlug: null, results: {}, completed: false },
				showUpStreak: 0,
				lastEvalDate: null,
				misses: [],
				satMocks: [],
				lastMockAt: null,
				lastMockScore: null
			}
		};
		const migrated = migrate(v24) as CurrentState;
		expect(migrated.readingFork.attempts).toHaveLength(5000);
		expect(migrated.readingFork.attempts[0].itemId).toBe('extra-1');
		expect(migrated.readingFork.attempts[4999].itemId).toBe('extra-5000');
		expect(migrated.readingFork.attempts.every((attempt) => attempt.picked === '')).toBe(true);
		expect(migrated.readingFork.settings.reservedPapers).toEqual([2023]);
	});

	it('clears stored 2023 and 2024 mock results once, and keeps a sitting taken after that', () => {
		const base = createDefaultState();
		const v25 = {
			...base,
			schemaVersion: 25 as const,
			readingFork: {
				...base.readingFork,
				satMocks: [2023, 2025],
				lastMockAt: '2026-09-01',
				lastMockScore: { correct: 30, total: 35, passed: true, year: 2025 },
				settings: { ...base.readingFork.settings, reservedPapers: [] },
				mocks: [
					{
						id: 'm23',
						paperYear: 2023,
						finishedAt: '2026-08-01',
						expired: false,
						correct: 23,
						total: 35,
						passLine: 23,
						byQtype: {},
						textMs: [],
						answers: { 'lezen-2023-1': 'A' },
						flagged: {}
					},
					{
						id: 'm25',
						paperYear: 2025,
						finishedAt: '2026-09-01',
						expired: false,
						correct: 30,
						total: 35,
						passLine: 24,
						byQtype: {},
						textMs: [],
						answers: {},
						flagged: {}
					}
				],
				attempts: [
					{
						itemId: 'lezen-2023-1',
						origin: 'official' as const,
						passageSlug: 'vijf-fabels',
						source: 'mock' as const,
						at: '2026-08-01',
						picked: 'A',
						correct: false,
						locateP: null,
						locateHit: null,
						ms: 1
					},
					{
						itemId: 'lezen-2023-2',
						origin: 'official' as const,
						passageSlug: 'vijf-fabels',
						source: 'texts' as const,
						at: '2026-08-02',
						picked: 'B',
						correct: true,
						locateP: null,
						locateHit: null,
						ms: 1
					},
					{
						itemId: 'lezen-2025-1',
						origin: 'official' as const,
						passageSlug: 'ruud-rij-instructeur',
						source: 'mock' as const,
						at: '2026-09-01',
						picked: 'C',
						correct: true,
						locateP: null,
						locateHit: null,
						ms: 1
					}
				]
			}
		};
		const migrated = migrate(v25) as CurrentState;
		expect(migrated.schemaVersion).toBe(26);
		expect(migrated.readingFork.mocks.map((mock) => mock.paperYear)).toEqual([2025]);
		expect(migrated.readingFork.satMocks).toEqual([2025]);
		expect(migrated.readingFork.lastMockScore).toEqual({
			correct: 30,
			total: 35,
			passed: true,
			year: 2025
		});
		expect(migrated.readingFork.settings.reservedPapers).toEqual([2023]);
		expect(migrated.readingFork.attempts.map((attempt) => attempt.itemId)).toEqual([
			'lezen-2023-2',
			'lezen-2025-1'
		]);

		const again = createDefaultState();
		again.readingFork = {
			...again.readingFork,
			satMocks: [2023],
			settings: { ...again.readingFork.settings, reservedPapers: [] },
			mocks: [
				{
					id: 'after',
					paperYear: 2023,
					finishedAt: '2026-10-02',
					expired: false,
					correct: 24,
					total: 35,
					passLine: 23,
					byQtype: {},
					textMs: [],
					answers: {},
					flagged: {}
				}
			]
		};
		const kept = migrate(again) as CurrentState;
		expect(kept.readingFork.mocks).toHaveLength(1);
		expect(kept.readingFork.settings.reservedPapers).toEqual([]);
	});
});
