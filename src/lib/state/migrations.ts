import {
	CURRENT_SCHEMA_VERSION,
	type State,
	type StateV1,
	type StateV2,
	type StateV3,
	type StateV4,
	type StateV5,
	type StateV6,
	type StateV7,
	type StateV8,
	type StateV9,
	type StateV10,
	type StateV11,
	type StateV12,
	type StateV13,
	type StateV14,
	type StateV15,
	type StateV16,
	type StateV17,
	type StateV18,
	type StateV19,
	type StateV20,
	type StateV21,
	type StateV22,
	type StateV23,
	type StateV24,
	type StateV25,
	DEFAULT_GLOW_ORDER,
	EMPTY_SWAPS
} from './schema';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import { dayIndex, findQuestion } from '$lib/reading/bank';
import {
	ATTEMPT_CAP,
	EMPTY_READING_FORK,
	type MockResult,
	type ReadingAttempt
} from '$lib/reading/types';
import { placementFromState } from '$lib/gates/gates';

const PAPER_CYCLE = [2025, 2024, 2023] as const;

function isPaperYear(year: number): year is 2023 | 2024 | 2025 {
	return year === 2023 || year === 2024 || year === 2025;
}

/** A year of 0 means the old score was not a sat paper. Invent one only for the result row. */
function paperYearForScore(year: number | undefined, lastMockAt: string | null): number {
	if (year !== undefined && isPaperYear(year)) return year;
	return PAPER_CYCLE[dayIndex(lastMockAt ?? '', PAPER_CYCLE.length, 9)];
}

function passLineForYear(year: number): number {
	return LEZEN_EXAMS.find((exam) => exam.year === year)?.passingScore ?? 24;
}

/**
 * 2023 stays reserved until a real sitting names it.
 * A dayIndex year on a year-0 score is not a sitting.
 * Once 2023 is spent, reserve the newest other paper that has no mock.
 */
export function reservedPapersFor(satMocks: readonly number[], scoreYear: number | null): number[] {
	const sat = new Set<number>();
	for (const year of satMocks) {
		if (isPaperYear(year)) sat.add(year);
	}
	if (scoreYear !== null && isPaperYear(scoreYear)) sat.add(scoreYear);
	if (!sat.has(2023)) return [2023];
	if (!sat.has(2025)) return [2025];
	if (!sat.has(2024)) return [2024];
	return [];
}

function seedAttempts(
	results: Record<string, { correct?: boolean; attemptedAt?: string } | boolean> | undefined
): ReadingAttempt[] {
	const attempts: ReadingAttempt[] = [];
	for (const [itemId, raw] of Object.entries(results ?? {})) {
		const correct = typeof raw === 'boolean' ? raw : Boolean(raw?.correct);
		const at = typeof raw === 'boolean' ? '' : (raw?.attemptedAt ?? '');
		attempts.push({
			itemId,
			origin: 'official',
			passageSlug: findQuestion(itemId)?.passage.slug ?? '',
			source: 'texts',
			at,
			picked: '',
			correct,
			locateP: null,
			locateHit: null,
			ms: 0
		});
	}
	attempts.sort((a, b) => a.at.localeCompare(b.at) || a.itemId.localeCompare(b.itemId));
	if (attempts.length > ATTEMPT_CAP) return attempts.slice(attempts.length - ATTEMPT_CAP);
	return attempts;
}

function mockFromScore(
	score: { correct: number; total: number; passed: boolean; year?: number } | null,
	lastMockAt: string | null
): MockResult | null {
	if (!score) return null;
	const paperYear = paperYearForScore(score.year, lastMockAt);
	const finishedAt = lastMockAt ?? '';
	return {
		id: `migrated-${finishedAt || 'mock'}`,
		paperYear,
		finishedAt,
		expired: false,
		correct: score.correct,
		total: score.total,
		passLine: passLineForYear(paperYear),
		byQtype: {},
		textMs: [],
		answers: {},
		flagged: {}
	};
}

// ============================================================
// MIGRATION CONTRACT
//
// - Migrations are NEVER destructive unless explicitly intended.
// - Migrations add fields with safe defaults. Removed fields are
//   cleaned up gracefully (just don't copy them forward).
// - Migrations are written BEFORE the feature that needs them ships.
// - Each migration handles exactly one version bump (vN to vN+1).
// - After writing a migration: bump CURRENT_SCHEMA_VERSION in
//   schema.ts, add the migration function here, add a test in
//   migrations.test.ts.
// - The service worker update flow MUST NOT clear localStorage.
//   The migration harness handles version mismatches on next load.
//
// HOW TO ADD A MIGRATION (example: v3 -> v4):
//
//   1. Add StateV4 type to schema.ts
//   2. Update `State = StateV1 | StateV2 | StateV3 | StateV4` in schema.ts
//   3. Bump CURRENT_SCHEMA_VERSION to 4 in schema.ts
//   4. Write the migration function below and push it to `migrations`
//   5. Add a test in migrations.test.ts covering the new migration
//
// Migration function signature:
//   (prev: StateVN) => StateVN+1
//
// The `any` types here are intentional and load-bearing.
// Each migration receives the raw parsed object from localStorage,
// which may be any shape from any past version.
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Migration = (state: any) => any;

export const migrations: Migration[] = [
	// ---- Index 0: v0 -> v1 ----
	// Not needed. v1 was the initial ship. If a state with no
	// schemaVersion arrives (treated as v0), the harness throws
	// "No migration found from v0 to v1." This is intentional.
	// DO NOT fill this slot.
	undefined as unknown as Migration,

	// ---- Index 1: v1 -> v2 ----
	// Adds: lastDailyBonusDate, audio.sfxMuted
	// Keeps everything from v1 intact.
	(state: StateV1): StateV2 => ({
		...state,
		schemaVersion: 2,
		lastDailyBonusDate: null,
		audio: {
			sfxMuted: false
		}
	}),

	// ---- Index 2: v2 -> v3 ----
	// Adds: match.completedToday, match.lastMatchDate
	// Keeps everything from v2 intact.
	(state: StateV2): StateV3 => ({
		...state,
		schemaVersion: 3,
		match: {
			completedToday: 0,
			lastMatchDate: null
		}
	}),

	// ---- Index 3: v3 -> v4 ----
	// Adds: cards.reviewedToday, cards.lastReviewDate, cards.newCardsPerDay
	// Keeps everything from v3 intact.
	(state: StateV3): StateV4 => ({
		...state,
		schemaVersion: 4,
		cards: {
			reviewedToday: 0,
			lastReviewDate: null,
			newCardsPerDay: 10
		}
	}),

	// ---- Index 4: v4 -> v5 ----
	// Adds: boss.attempts, boss.wins, boss.losses, boss.rankDefeated
	// Keeps everything from v4 intact.
	(state: StateV4): StateV5 => ({
		...state,
		schemaVersion: 5,
		boss: {
			attempts: 0,
			wins: 0,
			losses: 0,
			rankDefeated: -1
		}
	}),

	// ---- Index 5: v5 -> v6 ----
	// Adds: match.bestStreak, cards.totalReviewed, achievements, missions
	// Keeps everything from v5 intact.
	(state: StateV5): StateV6 => ({
		...state,
		schemaVersion: 6,
		match: {
			...state.match,
			bestStreak: 0
		},
		cards: {
			...state.cards,
			totalReviewed: 0
		},
		achievements: {},
		missions: {
			daily: [],
			lastMissionDate: null
		}
	}),

	// ---- Index 6: v6 -> v7 ----
	// Adds: grammar.completedLessons, grammar.exerciseResults,
	//       grammar.currentLesson, grammar.currentExerciseIndex
	// Keeps everything from v6 intact.
	(state: StateV6): StateV7 => ({
		...state,
		schemaVersion: 7,
		grammar: {
			completedLessons: [],
			exerciseResults: {},
			currentLesson: null,
			currentExerciseIndex: 0
		}
	}),

	// ---- Index 7: v7 -> v8 ----
	// Adds: conversation.readChapters, conversation.questionResults,
	//       conversation.currentStory, conversation.currentChapter
	// Keeps everything from v7 intact.
	(state: StateV7): StateV8 => ({
		...state,
		schemaVersion: 8,
		conversation: {
			readChapters: [],
			questionResults: {},
			currentStory: null,
			currentChapter: 0
		}
	}),

	// ---- Index 8: v8 -> v9 ----
	// Adds: reviews.submissions
	// Keeps everything from v8 intact.
	(state: StateV8): StateV9 => ({
		...state,
		schemaVersion: 9,
		reviews: {
			submissions: {}
		}
	}),

	// ---- Index 9: v9 -> v10 ----
	// Adds: lpEarnedToday, lastLpDate
	// Keeps everything from v9 intact.
	(state: StateV9): StateV10 => ({
		...state,
		schemaVersion: 10,
		lpEarnedToday: 0,
		lastLpDate: null
	}),

	// ---- Index 10: v10 -> v11 ----
	// Adds: lastModified (ISO timestamp for sync conflict resolution)
	// Keeps everything from v10 intact.
	(state: StateV10): StateV11 => ({
		...state,
		schemaVersion: 11,
		lastModified: null
	}),

	// v11 -> v12: Bump newCardsPerDay from 10 to 30
	(state: StateV11): StateV12 => ({
		...state,
		schemaVersion: 12,
		cards: {
			...state.cards,
			newCardsPerDay: 30
		}
	}),

	// v12 -> v13: Add luisteren question tracking
	(state: StateV12): StateV13 => ({
		...state,
		schemaVersion: 13,
		luisteren: {
			questionResults: {}
		}
	}),

	// v13 -> v14: Add lezen question tracking
	(state: StateV13): StateV14 => ({
		...state,
		schemaVersion: 14,
		lezen: {
			questionResults: {}
		}
	}),

	// v14 -> v15: Add card review sync (mirrors Dexie SRS data into state for cross-device sync)
	(state: StateV14): StateV15 => ({
		...state,
		schemaVersion: 15,
		cardReviews: {}
	}),

	// v15 -> v16: Add dailyHomework state (mixed daily practice session)
	// ADDITIVE ONLY. Every prior field is preserved. The new field is
	// initialized to an empty, never-generated session — the first
	// time the user opens /daily it will be populated.
	(state: StateV15): StateV16 => ({
		...state,
		schemaVersion: 16,
		dailyHomework: {
			date: null,
			questions: [],
			currentIndex: 0,
			results: {},
			completed: false,
			lpEarned: 0
		}
	}),

	// v16 -> v17: Grammar removal + daily->weekly streak conversion (Phase 1)
	// - Strips the grammar progress field. Grammar instruction moved to a
	//   separate external tool; no orphaned grammar state is left behind.
	// - Converts practiceDays from a consecutive-DAY streak to a
	//   consecutive-WEEK streak, rounding in the user's favor: any prior
	//   activity lands at a weekly streak of at least 1.
	// - LP / rank / tier / totalLp are untouched (no de-rank, no currency
	//   loss). The other cadence fields (bonus / mission / homework dates)
	//   need no value transform — the runtime now compares them by ISO week,
	//   so a stale day-value simply re-offers the bonus and regenerates the
	//   weekly missions/homework on first load, all in her favor.
	(state: StateV16): StateV17 => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { grammar, ...rest } = state;
		const hadActivity = state.practiceDays > 0 || state.lastSessionDate !== null;
		return {
			...rest,
			schemaVersion: 17,
			practiceDays: hadActivity ? Math.max(1, Math.ceil(state.practiceDays / 7)) : 0
		};
	},

	// v17 -> v18: Daily quiz + Daily Read (Phase 3)
	// ADDITIVE ONLY. Every prior field is preserved untouched -- no LP,
	// rank, tier, streak, SRS or cadence value is read or transformed.
	// Both new keys start "never generated", so the first visit to
	// /quiz or /read generates fresh for today.
	(state: StateV17): StateV18 => ({
		...state,
		schemaVersion: 18,
		dailyQuiz: { date: null, questionIds: [], results: {}, completed: false, lpEarned: 0 },
		dailyRead: { date: null, done: false }
	}),

	// v18 -> v19: Kuromi the Steward (Phase 5)
	// ADDITIVE ONLY. Every prior field is preserved untouched -- no LP,
	// rank, tier, streak, SRS or cadence value is read or transformed.
	// New keys reproduce today's app behavior: score display, strict
	// streaks, missions on, no quiz bias, canon glow order.
	(state: StateV18): StateV19 => ({
		...state,
		schemaVersion: 19,
		appConfig: {
			progression: { display: 'score' },
			streaks: 'strict',
			missions: 'on',
			quiz: { focusCategories: [] },
			dailyPath: { order: [...DEFAULT_GLOW_ORDER] }
		},
		adjustments: [],
		steward: { awards: [], lastForgivenWeek: null }
	}),

	// v19 -> v20: Kuromi pages + conversations (Phase 6)
	// ADDITIVE ONLY. Every prior field is preserved untouched -- no LP,
	// rank, tier, streak, SRS or cadence value is read or transformed.
	// Pre-v20 adjustments were all authored by Kuromi's tool loop, so
	// source: 'kuromi' is the truthful explicit backfill.
	(state: StateV19): StateV20 => ({
		...state,
		schemaVersion: 20,
		pages: [],
		conversations: [],
		adjustments: state.adjustments.map((a) => ({ ...a, source: 'kuromi' as const }))
	}),

	// v20 -> v21: gates stub. Fail-safe current = 1 for Iron / empty SRS.
	// Preserves rank / tier / lp / totalLp. Does not run mastery.
	(state: StateV20): StateV21 => ({
		...state,
		schemaVersion: 21,
		gates: {
			current: placementFromState(state.rank, Object.keys(state.cardReviews ?? {}).length),
			mastered: [],
			quizLog: [],
			weekLog: []
		}
	}),

	// v21 -> v22: calendar-day skip/swap ledgers on quiz + week set.
	(state: StateV21): StateV22 => ({
		...state,
		schemaVersion: 22,
		dailyHomework: { ...state.dailyHomework, swaps: EMPTY_SWAPS },
		dailyQuiz: { ...state.dailyQuiz, swaps: EMPTY_SWAPS }
	}),

	// v22 -> v23: reading-fork eval / trap-sticker cards. Additive.
	(state: StateV22): StateV23 => ({
		...state,
		schemaVersion: 23,
		readingFork: {
			eval: {
				date: null,
				passageSlug: null,
				year: null,
				gistOptions: [],
				gistAnswer: '',
				gistPicked: null,
				questionIds: [],
				results: {},
				completed: false
			},
			showUpStreak: 0,
			lastEvalDate: null,
			trapCards: [],
			trapStickers: [],
			lastMockAt: null,
			lastMockScore: null
		}
	}),

	// v23 -> v24: exam-trainer misses. Do not reclassify old stickers.
	// Keep the show-up streak. Old mock scores are not a sat paper (year 0).
	// This step still writes the v24 fork (eval.results). Attempt memory is v25.
	(state: StateV23): StateV24 => {
		const prev = state.readingFork;
		const oldScore = prev?.lastMockScore ?? null;
		return {
			...state,
			schemaVersion: 24,
			readingFork: {
				eval: {
					date: null,
					passageSlug: null,
					results: {},
					completed: false
				},
				showUpStreak: prev?.showUpStreak ?? 0,
				lastEvalDate: prev?.lastEvalDate ?? null,
				misses: [],
				satMocks: [],
				lastMockAt: prev?.lastMockAt ?? null,
				lastMockScore: oldScore
					? {
							correct: oldScore.correct,
							total: oldScore.total,
							passed: oldScore.passed,
							year: 0
						}
					: null
			}
		};
	},

	// v24 -> v25: attempt memory. Reset daily eval. Do not revive trap stickers.
	// A stored year of 2023, 2024, or 2025 is that paper. Year 0 uses the spec cycle.
	// reservedPapers keeps 2023 until a real sitting names it.
	(state: StateV24): StateV25 => {
		const prev = state.readingFork;
		const score = prev?.lastMockScore ?? null;
		const mock = mockFromScore(score, prev?.lastMockAt ?? null);
		const satMocks = prev?.satMocks ?? [];
		const scoreYear = score && isPaperYear(score.year) ? score.year : null;
		return {
			...state,
			schemaVersion: 25,
			readingFork: {
				...structuredClone(EMPTY_READING_FORK),
				showUpStreak: prev?.showUpStreak ?? 0,
				lastEvalDate: prev?.lastEvalDate ?? null,
				misses: prev?.misses ?? [],
				satMocks,
				lastMockAt: prev?.lastMockAt ?? null,
				lastMockScore: score,
				attempts: seedAttempts(state.lezen?.questionResults),
				mocks: mock ? [mock] : [],
				settings: {
					examDate: '2026-11-12',
					lookupsPerText: 5,
					reservedPapers: reservedPapersFor(satMocks, scoreYear)
				}
			}
		};
	}
];

export function migrate(raw: unknown): State {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let current = raw as any;
	const startVersion: number = current?.schemaVersion ?? 0;

	if (startVersion > CURRENT_SCHEMA_VERSION) {
		throw new Error(
			`State schemaVersion ${startVersion} is newer than app's CURRENT_SCHEMA_VERSION ${CURRENT_SCHEMA_VERSION}. ` +
				`This should not happen. Do not downgrade the app while Domi has saved progress.`
		);
	}

	for (let v = startVersion; v < CURRENT_SCHEMA_VERSION; v++) {
		const migration = migrations[v];
		if (!migration) {
			throw new Error(
				`No migration found from v${v} to v${v + 1}. ` +
					`Add a migration function to migrations[] in migrations.ts.`
			);
		}
		current = migration(current);
	}

	return current as State;
}
