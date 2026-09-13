import { describe, it, expect } from 'vitest';
import type {
	StateV19,
	StateV20,
	StateV22,
	CurrentState,
	SyncedCardReview,
	AdjustmentEntry,
	GlowRule,
	ProgressionDisplay
} from '$lib/state/schema';
import { DEFAULT_GLOW_ORDER } from '$lib/state/schema';
import { createDefaultState } from '$lib/state/defaults';
import { EMPTY_READING_FORK } from '$lib/reading/types';
import {
	SUBSYSTEMS,
	partition,
	assemble,
	mergeSubsystem,
	isAdjustmentEntry,
	type Subsystem
} from './subsystems';

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) + random state generator — local to this file
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function randInt(rng: () => number, min: number, max: number): number {
	return min + Math.floor(rng() * (max - min + 1));
}

function randBool(rng: () => number): boolean {
	return rng() < 0.5;
}

function randNullableDate(rng: () => number): string | null {
	if (rng() < 0.2) return null;
	const y = randInt(rng, 2020, 2026);
	const m = String(randInt(rng, 1, 12)).padStart(2, '0');
	const d = String(randInt(rng, 1, 28)).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function randIsoTs(rng: () => number): string {
	const d = randNullableDate(rng) ?? '2024-01-01';
	const h = String(randInt(rng, 0, 23)).padStart(2, '0');
	const mi = String(randInt(rng, 0, 59)).padStart(2, '0');
	const s = String(randInt(rng, 0, 59)).padStart(2, '0');
	return `${d}T${h}:${mi}:${s}.000Z`;
}

function randString(rng: () => number, prefix: string): string {
	return `${prefix}_${randInt(rng, 0, 9999)}`;
}

function randomState(rng: () => number): CurrentState {
	const nCards = randInt(rng, 0, 4);
	const cardReviews: Record<string, SyncedCardReview> = {};
	for (let i = 0; i < nCards; i++) {
		const id = `w${i}_${randInt(rng, 0, 50)}`;
		cardReviews[id] = {
			wordId: id,
			interval: randInt(rng, 0, 100),
			easeFactor: 1.3 + rng() * 2,
			repetitions: randInt(rng, 0, 20),
			nextReviewDate: randNullableDate(rng) ?? '2024-06-01',
			lastReviewDate: randNullableDate(rng) ?? '2024-05-01',
			firstSeenDate: randNullableDate(rng) ?? '2024-01-01'
		};
	}

	const nAch = randInt(rng, 0, 4);
	const achievements: StateV20['achievements'] = {};
	for (let i = 0; i < nAch; i++) {
		achievements[`ach_${i}`] = {
			unlockedAt: rng() < 0.3 ? null : randIsoTs(rng)
		};
	}

	const nMissions = randInt(rng, 0, 3);
	const daily: StateV20['missions']['daily'] = [];
	for (let i = 0; i < nMissions; i++) {
		daily.push({
			id: `mission_${i}`,
			progress: randInt(rng, 0, 10),
			completed: randBool(rng)
		});
	}

	const nChapters = randInt(rng, 0, 4);
	const readChapters: string[] = [];
	for (let i = 0; i < nChapters; i++) {
		readChapters.push(randString(rng, 'ch'));
	}

	const nQr = randInt(rng, 0, 3);
	const questionResults: StateV20['conversation']['questionResults'] = {};
	for (let i = 0; i < nQr; i++) {
		questionResults[`cq_${i}`] = {
			correct: randBool(rng),
			attemptedAt: randNullableDate(rng) ?? '2024-03-01'
		};
	}

	const nSub = randInt(rng, 0, 3);
	const submissions: StateV20['reviews']['submissions'] = {};
	for (let i = 0; i < nSub; i++) {
		const taskId = `task_${i}`;
		const verdicts = ['pass', 'close', 'fail', null] as const;
		submissions[taskId] = {
			taskId,
			answer: randString(rng, 'ans'),
			submittedAt: randIsoTs(rng),
			verdict: verdicts[randInt(rng, 0, 3)],
			comment: randString(rng, 'cmt'),
			reviewedAt: rng() < 0.4 ? null : randIsoTs(rng)
		};
	}

	const nL = randInt(rng, 0, 2);
	const luisterenQr: StateV20['luisteren']['questionResults'] = {};
	for (let i = 0; i < nL; i++) {
		luisterenQr[`lq_${i}`] = {
			correct: randBool(rng),
			attemptedAt: randNullableDate(rng) ?? '2024-02-01'
		};
	}

	const nLe = randInt(rng, 0, 2);
	const lezenQr: StateV20['lezen']['questionResults'] = {};
	for (let i = 0; i < nLe; i++) {
		lezenQr[`lz_${i}`] = {
			correct: randBool(rng),
			attemptedAt: randNullableDate(rng) ?? '2024-02-15'
		};
	}

	const hwResults: Record<number, boolean> = {};
	const nHwR = randInt(rng, 0, 3);
	for (let i = 0; i < nHwR; i++) {
		hwResults[i] = randBool(rng);
	}

	const quizResults: Record<string, boolean> = {};
	const qIds: string[] = [];
	const nQ = randInt(rng, 0, 3);
	for (let i = 0; i < nQ; i++) {
		const qid = `qid_${i}`;
		qIds.push(qid);
		quizResults[qid] = randBool(rng);
	}

	const displays: ProgressionDisplay[] = ['score', 'collection', 'hidden'];
	const streakModes = ['strict', 'gentle', 'off'] as const;
	const missionModes = ['on', 'off'] as const;
	const tools = [
		'update_config',
		'award_lp',
		'forgive_streak',
		'create_page',
		'update_page',
		'archive_page'
	] as const;
	const outcomes = ['applied', 'capped', 'rejected'] as const;
	const sources = ['kuromi', 'engine'] as const;

	const nFocus = randInt(rng, 0, 3);
	const focusCategories: string[] = [];
	for (let i = 0; i < nFocus; i++) {
		focusCategories.push(randString(rng, 'cat'));
	}

	// Either default glow order or a shuffled copy.
	let glowOrder: GlowRule[] = [...DEFAULT_GLOW_ORDER];
	if (rng() < 0.5) {
		glowOrder = [...DEFAULT_GLOW_ORDER];
		for (let i = glowOrder.length - 1; i > 0; i--) {
			const j = randInt(rng, 0, i);
			const tmp = glowOrder[i];
			glowOrder[i] = glowOrder[j];
			glowOrder[j] = tmp;
		}
	}

	const nAdj = randInt(rng, 0, 3);
	const adjustments: AdjustmentEntry[] = [];
	for (let i = 0; i < nAdj; i++) {
		adjustments.push({
			id: `adj_${i}_${randInt(rng, 0, 999)}`,
			timestamp: randIsoTs(rng),
			tool: tools[randInt(rng, 0, tools.length - 1)],
			outcome: outcomes[randInt(rng, 0, 2)],
			detail: randString(rng, 'detail'),
			reason: randString(rng, 'reason'),
			payload: rng() < 0.5 ? { n: randInt(rng, 0, 10) } : null,
			undone: randBool(rng),
			source: sources[randInt(rng, 0, 1)]
		});
	}

	const nAwards = randInt(rng, 0, 3);
	const awards: StateV20['steward']['awards'] = [];
	for (let i = 0; i < nAwards; i++) {
		awards.push({
			id: `award_${i}_${randInt(rng, 0, 999)}`,
			at: randIsoTs(rng),
			amount: randInt(rng, 1, 72)
		});
	}

	const nPages = randInt(rng, 0, 2);
	const pages: StateV20['pages'] = [];
	for (let i = 0; i < nPages; i++) {
		pages.push({
			id: `page_${i}_${randInt(rng, 0, 999)}`,
			title: randString(rng, 'title'),
			quip: randString(rng, 'quip'),
			labels: rng() < 0.5 ? [] : [randString(rng, 'lbl')],
			blocks: [{ type: 'note', body: randString(rng, 'body') }],
			createdAt: randIsoTs(rng),
			updatedAt: randIsoTs(rng),
			archived: randBool(rng)
		});
	}

	const nConvs = randInt(rng, 0, 2);
	const conversations: StateV20['conversations'] = [];
	for (let i = 0; i < nConvs; i++) {
		conversations.push({
			id: `conv_${i}_${randInt(rng, 0, 999)}`,
			title: randString(rng, 'conv'),
			createdAt: randIsoTs(rng),
			updatedAt: randIsoTs(rng),
			turns: [
				{ role: 'user', content: randString(rng, 'u') },
				{ role: 'assistant', content: randString(rng, 'a') }
			]
		});
	}

	const state: CurrentState = {
		schemaVersion: 23,
		rank: randInt(rng, 0, 7),
		tier: randInt(rng, 1, 4),
		lp: randInt(rng, 0, 99),
		totalLp: randInt(rng, 0, 5000),
		practiceDays: randInt(rng, 0, 100),
		lastSessionDate: randNullableDate(rng),
		lastDailyBonusDate: randNullableDate(rng),
		lpEarnedToday: randInt(rng, 0, 200),
		lastLpDate: randNullableDate(rng),
		lastModified: rng() < 0.2 ? null : randIsoTs(rng),
		tts: {
			googleApiKey: rng() < 0.4 ? null : randString(rng, 'key')
		},
		audio: {
			sfxMuted: randBool(rng)
		},
		match: {
			completedToday: randInt(rng, 0, 20),
			lastMatchDate: randNullableDate(rng),
			bestStreak: randInt(rng, 0, 50)
		},
		cards: {
			reviewedToday: randInt(rng, 0, 40),
			lastReviewDate: randNullableDate(rng),
			newCardsPerDay: randInt(rng, 1, 50),
			totalReviewed: randInt(rng, 0, 2000)
		},
		boss: {
			attempts: randInt(rng, 0, 30),
			wins: randInt(rng, 0, 20),
			losses: randInt(rng, 0, 20),
			rankDefeated: randInt(rng, -1, 7)
		},
		achievements,
		missions: {
			daily,
			lastMissionDate: randNullableDate(rng)
		},
		conversation: {
			readChapters,
			questionResults,
			currentStory: rng() < 0.3 ? null : randString(rng, 'story'),
			currentChapter: randInt(rng, 0, 20)
		},
		reviews: { submissions },
		luisteren: { questionResults: luisterenQr },
		lezen: { questionResults: lezenQr },
		cardReviews,
		dailyHomework: {
			date: randNullableDate(rng),
			questions: rng() < 0.5 ? [] : [{ id: randString(rng, 'q'), kind: 'mc' }],
			currentIndex: randInt(rng, 0, 10),
			results: hwResults,
			completed: randBool(rng),
			lpEarned: randInt(rng, 0, 50),
			swaps: { date: randNullableDate(rng), used: randInt(rng, 0, 3), swappedOutIds: [] }
		},
		dailyQuiz: {
			date: randNullableDate(rng),
			questionIds: qIds,
			results: quizResults,
			completed: randBool(rng),
			lpEarned: randInt(rng, 0, 25),
			swaps: { date: randNullableDate(rng), used: randInt(rng, 0, 3), swappedOutIds: [] }
		},
		dailyRead: {
			date: randNullableDate(rng),
			done: randBool(rng)
		},
		appConfig: {
			progression: { display: displays[randInt(rng, 0, 2)] },
			streaks: streakModes[randInt(rng, 0, 2)],
			missions: missionModes[randInt(rng, 0, 1)],
			quiz: { focusCategories },
			dailyPath: { order: glowOrder }
		},
		adjustments,
		steward: {
			awards,
			lastForgivenWeek: rng() < 0.4 ? null : `2026-W${String(randInt(rng, 1, 52)).padStart(2, '0')}`
		},
		pages,
		conversations,
		gates: {
			current: ([1, 2, 3, 4] as const)[randInt(rng, 0, 3)],
			mastered: rng() < 0.5 ? [] : [1],
			quizLog: [],
			weekLog: []
		},
		readingFork: structuredClone(EMPTY_READING_FORK)
	};
	return state;
}

const NOW = '2026-08-16T12:00:00.000Z';

// ---------------------------------------------------------------------------
// 1. Round-trip property
// ---------------------------------------------------------------------------

describe('assemble(partition(s)) round-trip', () => {
	it('deep-equals original for >= 200 seeded random states', () => {
		const rng = mulberry32(0xdec0ded);
		for (let i = 0; i < 200; i++) {
			const s = randomState(rng);
			const rebuilt = assemble(partition(s));
			expect(rebuilt).toEqual(s);
		}
	});

	it('round-trips the default state', () => {
		const s = createDefaultState();
		expect(assemble(partition(s))).toEqual(s);
	});
});

// ---------------------------------------------------------------------------
// 2. Field-coverage
// ---------------------------------------------------------------------------

describe('field partition coverage', () => {
	const srsLeaves = ['cardReviews'];
	const progressLeaves = [
		'schemaVersion',
		'rank',
		'tier',
		'lp',
		'totalLp',
		'practiceDays',
		'lastSessionDate',
		'lastDailyBonusDate',
		'lpEarnedToday',
		'lastLpDate',
		'lastModified',
		'match',
		'boss',
		'achievements',
		'missions',
		'conversation',
		'reviews',
		'luisteren',
		'lezen',
		'cards.reviewedToday',
		'cards.lastReviewDate',
		'cards.totalReviewed',
		'steward',
		'gates'
	];
	const dailyLeaves = ['dailyHomework', 'dailyQuiz', 'dailyRead', 'readingFork'];
	const configLeaves = ['tts', 'audio', 'cards.newCardsPerDay', 'appConfig'];
	const adjustmentsLeaves = ['adjustments'];
	const pagesLeaves = ['pages', 'conversations'];

	const bySubsystem: Record<Subsystem, string[]> = {
		srs: srsLeaves,
		progress: progressLeaves,
		daily: dailyLeaves,
		config: configLeaves,
		adjustments: adjustmentsLeaves,
		pages: pagesLeaves
	};

	it('union of leaf paths equals the expected CurrentState leaves', () => {
		const topKeys = Object.keys(createDefaultState()).filter((k) => k !== 'cards');
		const expected = new Set([
			...topKeys,
			'cards.reviewedToday',
			'cards.lastReviewDate',
			'cards.totalReviewed',
			'cards.newCardsPerDay'
		]);
		expect(expected.size).toBe(36);

		const actual = new Set<string>();
		for (const leaves of Object.values(bySubsystem)) {
			for (const leaf of leaves) actual.add(leaf);
		}
		expect(actual).toEqual(expected);
	});

	it('no leaf is claimed by two subsystems', () => {
		const lists = Object.values(bySubsystem);
		for (let i = 0; i < lists.length; i++) {
			for (let j = i + 1; j < lists.length; j++) {
				const a = new Set(lists[i]);
				const intersection = lists[j].filter((x) => a.has(x));
				expect(intersection).toEqual([]);
			}
		}
	});

	it('progress has 24 leaves, srs 1, daily 4, config 4, adjustments 1, pages 2', () => {
		expect(progressLeaves).toHaveLength(24);
		expect(srsLeaves).toHaveLength(1);
		expect(dailyLeaves).toHaveLength(4);
		expect(configLeaves).toHaveLength(4);
		expect(adjustmentsLeaves).toHaveLength(1);
		expect(pagesLeaves).toHaveLength(2);
	});
});

// ---------------------------------------------------------------------------
// 3. LP-neutral regression (dirty config local wins despite remote totalLp)
// ---------------------------------------------------------------------------

describe('LP-neutral config merge', () => {
	it('dirty local sfxMuted survives even when remote has higher totalLp', () => {
		const baseline = createDefaultState();
		const localFull: CurrentState = {
			...baseline,
			totalLp: 100,
			audio: { sfxMuted: true },
			tts: { googleApiKey: 'local-key' },
			cards: { ...baseline.cards, newCardsPerDay: 15 }
		};
		const remoteFull: CurrentState = {
			...baseline,
			totalLp: 9999,
			audio: { sfxMuted: false },
			tts: { googleApiKey: null },
			cards: { ...baseline.cards, newCardsPerDay: 30 }
		};

		const localParts = partition(localFull);
		const remoteParts = partition(remoteFull);

		// Unsynced local settings toggle: must pass localDirty so config keeps local.
		// Without localDirty this would silently take remote and the assertions below fail.
		const cfg = mergeSubsystem('config', localParts.config, remoteParts.config, NOW, {
			localDirty: true
		});
		const cfgVal = cfg.value as {
			audio: { sfxMuted: boolean };
			tts: { googleApiKey: string | null };
			cards: { newCardsPerDay: number };
		};
		expect(cfgVal.audio.sfxMuted).toBe(true);
		expect(cfgVal.tts.googleApiKey).toBe('local-key');
		expect(cfgVal.cards.newCardsPerDay).toBe(15);
		expect(cfg.notes.length).toBe(1);
		expect(cfg.notes[0].field).toBe('config');
		expect(cfg.notes[0].resolved).toEqual(localParts.config);
		expect(cfg.notes[0].remote).toEqual(remoteParts.config);

		const prog = mergeSubsystem('progress', localParts.progress, remoteParts.progress, NOW);
		const progVal = prog.value as { totalLp: number };
		expect(progVal.totalLp).toBe(9999);
	});
});

// ---------------------------------------------------------------------------
// 3b. Config localDirty winner selection
// ---------------------------------------------------------------------------

describe('config merge localDirty', () => {
	const localCfg = {
		tts: { googleApiKey: 'local-key' },
		audio: { sfxMuted: true },
		cards: { newCardsPerDay: 15 }
	};
	const remoteCfg = {
		tts: { googleApiKey: 'remote-key' },
		audio: { sfxMuted: false },
		cards: { newCardsPerDay: 30 }
	};

	it('clean local (opts omitted / localDirty false) takes remote and notes dropped local', () => {
		const omitted = mergeSubsystem('config', localCfg, remoteCfg, NOW);
		const explicit = mergeSubsystem('config', localCfg, remoteCfg, NOW, { localDirty: false });

		for (const result of [omitted, explicit]) {
			expect(result.value).toEqual(remoteCfg);
			expect(result.notes).toHaveLength(1);
			expect(result.notes[0].field).toBe('config');
			expect(result.notes[0].local).toEqual(localCfg);
			expect(result.notes[0].remote).toEqual(remoteCfg);
			expect(result.notes[0].resolved).toEqual(remoteCfg);
		}
	});

	it('dirty local takes local and notes dropped remote', () => {
		const result = mergeSubsystem('config', localCfg, remoteCfg, NOW, { localDirty: true });
		expect(result.value).toEqual(localCfg);
		expect(result.notes).toHaveLength(1);
		expect(result.notes[0].field).toBe('config');
		expect(result.notes[0].local).toEqual(localCfg);
		expect(result.notes[0].remote).toEqual(remoteCfg);
		expect(result.notes[0].resolved).toEqual(localCfg);
	});

	it('opts omitted behaves identically to { localDirty: false }', () => {
		const a = mergeSubsystem('config', localCfg, remoteCfg, NOW);
		const b = mergeSubsystem('config', localCfg, remoteCfg, NOW, { localDirty: false });
		expect(a).toEqual(b);
	});
});

// ---------------------------------------------------------------------------
// 4. Boss-loss-shaped tuple: higher totalLp owns rank/tier/lp wholesale
// ---------------------------------------------------------------------------

describe('boss-loss tuple (no promotion from stale higher rank)', () => {
	it('local (totalLp 500, rank 2) beats remote (totalLp 300, rank 3)', () => {
		const base = createDefaultState();
		const localProg = partition({
			...base,
			totalLp: 500,
			rank: 2,
			tier: 1,
			lp: 10
		}).progress;
		const remoteProg = partition({
			...base,
			totalLp: 300,
			rank: 3,
			tier: 2,
			lp: 50
		}).progress;

		const { value, notes } = mergeSubsystem('progress', localProg, remoteProg, NOW);
		const v = value as { totalLp: number; rank: number; tier: number; lp: number };
		expect(v.totalLp).toBe(500);
		expect(v.rank).toBe(2);
		expect(v.tier).toBe(1);
		expect(v.lp).toBe(10);
		const tupleNote = notes.find((n) => n.field === 'rank+tier+lp');
		expect(tupleNote).toBeDefined();
		expect(tupleNote?.resolved).toEqual([2, 1, 10]);
	});
});

// ---------------------------------------------------------------------------
// 5. Commutativity
// ---------------------------------------------------------------------------

describe('merge commutativity', () => {
	it('srs is commutative', () => {
		const a = {
			cardReviews: {
				w1: {
					wordId: 'w1',
					interval: 1,
					easeFactor: 2.5,
					repetitions: 1,
					nextReviewDate: '2026-05-02',
					lastReviewDate: '2026-05-01',
					firstSeenDate: '2026-04-01'
				}
			}
		};
		const b = {
			cardReviews: {
				w1: {
					wordId: 'w1',
					interval: 5,
					easeFactor: 2.6,
					repetitions: 3,
					nextReviewDate: '2026-05-10',
					lastReviewDate: '2026-05-03',
					firstSeenDate: '2026-04-01'
				},
				w2: {
					wordId: 'w2',
					interval: 2,
					easeFactor: 2.4,
					repetitions: 1,
					nextReviewDate: '2026-05-05',
					lastReviewDate: '2026-05-04',
					firstSeenDate: '2026-04-10'
				}
			}
		};
		const ab = mergeSubsystem('srs', a, b, NOW).value;
		const ba = mergeSubsystem('srs', b, a, NOW).value;
		expect(ab).toEqual(ba);
	});

	it('daily is commutative for same-date and date-rollover pairs', () => {
		const a = {
			dailyHomework: {
				date: '2026-08-15',
				questions: [{ id: 'q1' }],
				currentIndex: 2,
				results: { 0: true, 1: false },
				completed: false,
				lpEarned: 5
			},
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['a', 'b'],
				results: { a: true },
				completed: false,
				lpEarned: 2
			},
			dailyRead: { date: '2026-08-15', done: true }
		};
		const b = {
			dailyHomework: {
				date: '2026-08-15',
				questions: [{ id: 'q1' }],
				currentIndex: 5,
				results: { 1: true, 2: true },
				completed: true,
				lpEarned: 10
			},
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['a', 'b'],
				results: { b: false },
				completed: true,
				lpEarned: 8
			},
			dailyRead: { date: '2026-08-15', done: false }
		};
		// questions/questionIds keep-local is asymmetric when they differ — use equal questions
		expect(mergeSubsystem('daily', a, b, NOW).value).toEqual(
			mergeSubsystem('daily', b, a, NOW).value
		);

		// date rollover: later date wins wholesale — commutative
		const older = {
			dailyHomework: {
				date: '2026-08-14',
				questions: [],
				currentIndex: 0,
				results: {},
				completed: true,
				lpEarned: 99
			},
			dailyQuiz: {
				date: '2026-08-14',
				questionIds: [],
				results: {},
				completed: true,
				lpEarned: 5
			},
			dailyRead: { date: '2026-08-14', done: true }
		};
		const newer = {
			dailyHomework: {
				date: '2026-08-16',
				questions: [{ x: 1 }],
				currentIndex: 1,
				results: { 0: false },
				completed: false,
				lpEarned: 1
			},
			dailyQuiz: {
				date: '2026-08-16',
				questionIds: ['z'],
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyRead: { date: '2026-08-16', done: false }
		};
		expect(mergeSubsystem('daily', older, newer, NOW).value).toEqual(
			mergeSubsystem('daily', newer, older, NOW).value
		);
	});

	it('same-date daily swap merge keeps local ids and max(used)', () => {
		const a = {
			dailyHomework: {
				date: '2026-W35',
				questions: [{ id: 'q1' }],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: { date: '2026-08-29', used: 1, swappedOutIds: ['match:local'] }
			},
			dailyQuiz: {
				date: '2026-08-29',
				questionIds: ['a'],
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: { date: '2026-08-29', used: 2, swappedOutIds: ['recall:local'] }
			},
			dailyRead: { date: '2026-08-29', done: false }
		};
		const b = {
			dailyHomework: {
				date: '2026-W35',
				questions: [{ id: 'q1' }],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: { date: '2026-08-29', used: 3, swappedOutIds: ['match:remote'] }
			},
			dailyQuiz: {
				date: '2026-08-29',
				questionIds: ['a'],
				results: {},
				completed: false,
				lpEarned: 0,
				swaps: { date: '2026-08-29', used: 0, swappedOutIds: ['recall:remote'] }
			},
			dailyRead: { date: '2026-08-29', done: false }
		};
		const merged = mergeSubsystem('daily', a, b, NOW).value as {
			dailyHomework: { swaps: { used: number; swappedOutIds: string[] } };
			dailyQuiz: { swaps: { used: number; swappedOutIds: string[] } };
		};
		expect(merged.dailyHomework.swaps.used).toBe(3);
		expect(merged.dailyHomework.swaps.swappedOutIds).toEqual(['match:local']);
		expect(merged.dailyQuiz.swaps.used).toBe(2);
		expect(merged.dailyQuiz.swaps.swappedOutIds).toEqual(['recall:local']);
	});

	it('adjustments is commutative (same set, order by timestamp)', () => {
		const a = [
			{ id: '1', timestamp: '2026-01-01T00:00:00Z', body: 'a' },
			{ id: '2', timestamp: '2026-01-03T00:00:00Z', body: 'b' }
		];
		const b = [
			{ id: '2', timestamp: '2026-01-03T00:00:00Z', body: 'b' },
			{ id: '3', timestamp: '2026-01-02T00:00:00Z', body: 'c' }
		];
		expect(mergeSubsystem('adjustments', a, b, NOW).value).toEqual(
			mergeSubsystem('adjustments', b, a, NOW).value
		);
	});

	it('progress counter fields are commutative', () => {
		const base = createDefaultState();
		const a = partition({
			...base,
			totalLp: 100,
			practiceDays: 5,
			boss: { attempts: 3, wins: 1, losses: 2, rankDefeated: 0 },
			cards: { ...base.cards, totalReviewed: 40 },
			match: { ...base.match, bestStreak: 7 },
			rank: 1,
			tier: 2,
			lp: 30
		}).progress;
		const b = partition({
			...base,
			totalLp: 250,
			practiceDays: 2,
			boss: { attempts: 10, wins: 4, losses: 6, rankDefeated: 2 },
			cards: { ...base.cards, totalReviewed: 12 },
			match: { ...base.match, bestStreak: 3 },
			rank: 2,
			tier: 1,
			lp: 10
		}).progress;

		const ab = mergeSubsystem('progress', a, b, NOW).value as Record<string, unknown>;
		const ba = mergeSubsystem('progress', b, a, NOW).value as Record<string, unknown>;

		expect(ab.totalLp).toBe(ba.totalLp);
		expect(ab.practiceDays).toBe(ba.practiceDays);
		expect(ab.boss).toEqual(ba.boss);
		expect((ab.cards as { totalReviewed: number }).totalReviewed).toBe(
			(ba.cards as { totalReviewed: number }).totalReviewed
		);
		expect((ab.match as { bestStreak: number }).bestStreak).toBe(
			(ba.match as { bestStreak: number }).bestStreak
		);
		// whole progress value for counters-only diffs with tuple owned by higher totalLp
		expect(ab.totalLp).toBe(250);
		expect(ab.practiceDays).toBe(5);
		expect(ab.boss).toEqual({ attempts: 10, wins: 4, losses: 6, rankDefeated: 2 });
		expect((ab.cards as { totalReviewed: number }).totalReviewed).toBe(40);
		expect((ab.match as { bestStreak: number }).bestStreak).toBe(7);
		expect(ab.rank).toBe(2);
		expect(ab.tier).toBe(1);
		expect(ab.lp).toBe(10);
		expect(ba.rank).toBe(2);
		expect(ba.tier).toBe(1);
		expect(ba.lp).toBe(10);
	});

	it('gates merge is one-way: higher current and union mastered win', () => {
		const base = createDefaultState();
		const a = partition({
			...base,
			gates: {
				current: 2,
				mastered: [1],
				quizLog: [{ gate: 1, date: '2026-08-29', correct: 5, total: 5 }],
				weekLog: []
			}
		}).progress;
		const b = partition({
			...base,
			gates: { current: 1, mastered: [], quizLog: [], weekLog: [] }
		}).progress;
		const merged = mergeSubsystem('progress', a, b, NOW).value as {
			gates: { current: number; mastered: number[]; quizLog: unknown[] };
		};
		expect(merged.gates.current).toBe(2);
		expect(merged.gates.mastered).toEqual([1]);
		expect(merged.gates.quizLog).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
// 6. Focused unit tests
// ---------------------------------------------------------------------------

describe('srs per-card later lastReviewDate', () => {
	it('keeps the entry with the later lastReviewDate', () => {
		const local = {
			cardReviews: {
				w1: {
					wordId: 'w1',
					interval: 1,
					easeFactor: 2.5,
					repetitions: 1,
					nextReviewDate: '2026-05-02',
					lastReviewDate: '2026-05-01',
					firstSeenDate: '2026-01-01'
				}
			}
		};
		const remote = {
			cardReviews: {
				w1: {
					wordId: 'w1',
					interval: 10,
					easeFactor: 2.8,
					repetitions: 5,
					nextReviewDate: '2026-06-01',
					lastReviewDate: '2026-05-10',
					firstSeenDate: '2026-01-01'
				}
			}
		};
		const { value, notes } = mergeSubsystem('srs', local, remote, NOW);
		const v = value as { cardReviews: Record<string, SyncedCardReview> };
		expect(v.cardReviews.w1.interval).toBe(10);
		expect(v.cardReviews.w1.lastReviewDate).toBe('2026-05-10');
		expect(notes).toEqual([]);
	});
});

describe('missions.daily union + OR + max', () => {
	it('unions by id, max progress, OR completed', () => {
		const base = createDefaultState();
		const local = partition({
			...base,
			missions: {
				daily: [
					{ id: 'm1', progress: 2, completed: false },
					{ id: 'm2', progress: 1, completed: true }
				],
				lastMissionDate: '2026-08-10'
			}
		}).progress;
		const remote = partition({
			...base,
			missions: {
				daily: [
					{ id: 'm1', progress: 5, completed: true },
					{ id: 'm3', progress: 0, completed: false }
				],
				lastMissionDate: '2026-08-12'
			}
		}).progress;

		const { value, notes } = mergeSubsystem('progress', local, remote, NOW);
		const missions =
			(value as StateV19).missions ?? (value as { missions: StateV19['missions'] }).missions;
		const byId = Object.fromEntries(
			missions.daily.map((m: StateV19['missions']['daily'][number]) => [m.id, m])
		);
		expect(byId.m1).toEqual({ id: 'm1', progress: 5, completed: true });
		expect(byId.m2).toEqual({ id: 'm2', progress: 1, completed: true });
		expect(byId.m3).toEqual({ id: 'm3', progress: 0, completed: false });
		expect(missions.lastMissionDate).toBe('2026-08-12');
		expect(notes.some((n) => n.field === 'missions.daily.m1')).toBe(true);
	});
});

describe('achievements unlock-beats-lock', () => {
	it('non-null unlockedAt beats null; earlier wins on both non-null', () => {
		const base = createDefaultState();
		const local = partition({
			...base,
			achievements: {
				a: { unlockedAt: '2026-01-01T00:00:00Z' },
				b: { unlockedAt: null },
				c: { unlockedAt: '2026-03-01T00:00:00Z' }
			}
		}).progress;
		const remote = partition({
			...base,
			achievements: {
				a: { unlockedAt: null },
				b: { unlockedAt: '2026-02-01T00:00:00Z' },
				c: { unlockedAt: '2026-02-01T00:00:00Z' }
			}
		}).progress;

		const { value, notes } = mergeSubsystem('progress', local, remote, NOW);
		const ach = (value as { achievements: StateV19['achievements'] }).achievements;
		expect(ach.a.unlockedAt).toBe('2026-01-01T00:00:00Z');
		expect(ach.b.unlockedAt).toBe('2026-02-01T00:00:00Z');
		expect(ach.c.unlockedAt).toBe('2026-02-01T00:00:00Z');
		expect(notes.some((n) => n.field === 'achievements.c')).toBe(true);
		expect(notes.some((n) => n.field === 'achievements.a')).toBe(false);
	});
});

describe('daily date-rollover', () => {
	it('picks the whole sub-object with the later date', () => {
		const older = {
			dailyHomework: {
				date: '2026-08-01',
				questions: [{ old: true }],
				currentIndex: 9,
				results: { 0: true },
				completed: true,
				lpEarned: 50
			},
			dailyQuiz: {
				date: '2026-08-01',
				questionIds: ['old'],
				results: { old: true },
				completed: true,
				lpEarned: 10
			},
			dailyRead: { date: '2026-08-01', done: true }
		};
		const newer = {
			dailyHomework: {
				date: '2026-08-15',
				questions: [{ new: true }],
				currentIndex: 0,
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['new'],
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyRead: { date: '2026-08-15', done: false }
		};
		const { value, notes } = mergeSubsystem('daily', older, newer, NOW);
		const v = value as {
			dailyHomework: { date: string | null; lpEarned: number };
			dailyQuiz: { date: string | null };
			dailyRead: { date: string | null; done: boolean };
		};
		expect(v.dailyHomework.date).toBe('2026-08-15');
		expect(v.dailyHomework.lpEarned).toBe(0);
		expect(v.dailyQuiz.date).toBe('2026-08-15');
		expect(v.dailyRead.date).toBe('2026-08-15');
		expect(v.dailyRead.done).toBe(false);
		expect(notes.map((n) => n.field).sort()).toEqual(['dailyHomework', 'dailyQuiz', 'dailyRead']);
	});
});

describe('assemble({})', () => {
	it('returns exactly createDefaultState()', () => {
		expect(assemble({})).toEqual(createDefaultState());
	});
});

describe('partition basics', () => {
	it('exports all six subsystem names', () => {
		expect([...SUBSYSTEMS]).toEqual(['srs', 'progress', 'daily', 'config', 'adjustments', 'pages']);
	});

	it('adjustments mirrors state.adjustments', () => {
		const base = createDefaultState();
		const entry: AdjustmentEntry = {
			id: 'adj_1',
			timestamp: '2026-08-16T10:00:00.000Z',
			tool: 'award_lp',
			outcome: 'applied',
			detail: 'gave 10 LP',
			reason: 'hard work',
			payload: { amount: 10 },
			undone: false
		};
		const s: CurrentState = { ...base, adjustments: [entry] };
		const p = partition(s);
		expect(p.adjustments).toEqual([entry]);
	});

	it('pages defaults to empty pages and conversations', () => {
		const p = partition(createDefaultState());
		expect(p.pages).toEqual({ pages: [], conversations: [] });
	});

	it('splits cards across progress and config', () => {
		const s = createDefaultState();
		s.cards.reviewedToday = 7;
		s.cards.totalReviewed = 100;
		s.cards.newCardsPerDay = 12;
		const p = partition(s);
		const progCards = (p.progress as { cards: Record<string, unknown> }).cards;
		const cfgCards = (p.config as { cards: Record<string, unknown> }).cards;
		expect(progCards).toEqual({
			reviewedToday: 7,
			lastReviewDate: null,
			totalReviewed: 100
		});
		expect(cfgCards).toEqual({ newCardsPerDay: 12 });
		expect('newCardsPerDay' in progCards).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Steward merge: independent of D57 rank/tier/lp atomic tuple
// ---------------------------------------------------------------------------

describe('steward merge independent of totalLp tuple (D57)', () => {
	it('unions awards even when the lower-totalLp side holds an exclusive award', () => {
		const base = createDefaultState();
		// L: lower totalLp, exclusive steward award
		const localFull: CurrentState = {
			...base,
			totalLp: 100,
			rank: 1,
			tier: 1,
			lp: 10,
			steward: {
				awards: [
					{ id: 'award_L_only', at: '2026-08-15T10:00:00.000Z', amount: 10 },
					{ id: 'award_shared', at: '2026-08-14T10:00:00.000Z', amount: 5 }
				],
				lastForgivenWeek: '2026-W32'
			}
		};
		// R: greater totalLp — would win the rank/tier/lp tuple under D57
		const remoteFull: CurrentState = {
			...base,
			totalLp: 500,
			rank: 2,
			tier: 3,
			lp: 40,
			steward: {
				awards: [
					{ id: 'award_R_only', at: '2026-08-15T11:00:00.000Z', amount: 20 },
					{ id: 'award_shared', at: '2026-08-14T10:00:00.000Z', amount: 5 }
				],
				lastForgivenWeek: '2026-W33'
			}
		};

		const L = partition(localFull).progress;
		const R = partition(remoteFull).progress;
		const { value } = mergeSubsystem('progress', L, R, NOW);
		const v = value as {
			totalLp: number;
			rank: number;
			tier: number;
			lp: number;
			steward: StateV19['steward'];
		};

		// D57: rank/tier/lp atomic tuple from greater-totalLp side (R)
		expect(v.totalLp).toBe(500);
		expect(v.rank).toBe(2);
		expect(v.tier).toBe(3);
		expect(v.lp).toBe(40);

		// Steward awards UNION — L's exclusive award survives despite losing the tuple
		const ids = v.steward.awards.map((a: StateV19['steward']['awards'][number]) => a.id).sort();
		expect(ids).toEqual(['award_L_only', 'award_R_only', 'award_shared'].sort());
		// later ISO week key wins for lastForgivenWeek
		expect(v.steward.lastForgivenWeek).toBe('2026-W33');
	});

	it('prunes awards older than 7 days before now, keeps recent ones', () => {
		const base = createDefaultState();
		const localFull: CurrentState = {
			...base,
			totalLp: 50,
			steward: {
				awards: [
					// > 7 days before NOW ('2026-08-16T12:00:00.000Z')
					{ id: 'old_award', at: '2026-08-01T12:00:00.000Z', amount: 15 },
					// within 7 days
					{ id: 'recent_award', at: '2026-08-14T12:00:00.000Z', amount: 10 }
				],
				lastForgivenWeek: null
			}
		};
		const remoteFull: CurrentState = {
			...base,
			totalLp: 200,
			steward: {
				awards: [
					// just inside the window (exactly ~6 days)
					{ id: 'mid_award', at: '2026-08-10T12:00:00.000Z', amount: 8 }
				],
				lastForgivenWeek: null
			}
		};

		const L = partition(localFull).progress;
		const R = partition(remoteFull).progress;
		const { value } = mergeSubsystem('progress', L, R, NOW);
		const v = value as { steward: StateV19['steward'] };
		const ids = v.steward.awards.map((a: StateV19['steward']['awards'][number]) => a.id).sort();
		expect(ids).toContain('recent_award');
		expect(ids).toContain('mid_award');
		expect(ids).not.toContain('old_award');
	});
});

describe('isStewardAward via assemble (amount sanitize)', () => {
	it('drops NaN / Infinity / negative / zero amounts; keeps finite positive', () => {
		const parts = partition(createDefaultState());
		const progress = {
			...(parts.progress as Record<string, unknown>),
			steward: {
				awards: [
					{ id: 'bad_nan', at: '2026-08-15T10:00:00.000Z', amount: NaN },
					{ id: 'bad_inf', at: '2026-08-15T10:00:00.000Z', amount: Infinity },
					{ id: 'bad_neg', at: '2026-08-15T10:00:00.000Z', amount: -5 },
					{ id: 'bad_zero', at: '2026-08-15T10:00:00.000Z', amount: 0 },
					{ id: 'good', at: '2026-08-15T10:00:00.000Z', amount: 10 },
					{ id: 'good2', at: '2026-08-14T10:00:00.000Z', amount: 3 }
				],
				lastForgivenWeek: null
			}
		};
		const rebuilt = assemble({ ...parts, progress });
		const ids = rebuilt.steward.awards.map((a) => a.id).sort();
		expect(ids).toEqual(['good', 'good2'].sort());
		expect(rebuilt.steward.awards.every((a) => Number.isFinite(a.amount) && a.amount > 0)).toBe(
			true
		);
	});
});

describe('mergeAdjustments undone OR on id collision', () => {
	it('undone true on either side survives the merge', () => {
		const local: AdjustmentEntry[] = [
			{
				id: 'adj_same',
				timestamp: '2026-08-16T09:00:00.000Z',
				tool: 'award_lp',
				outcome: 'applied',
				detail: 'local',
				reason: 'local reason',
				payload: { amount: 10 },
				undone: true
			}
		];
		const remote: AdjustmentEntry[] = [
			{
				id: 'adj_same',
				timestamp: '2026-08-16T09:00:00.000Z',
				tool: 'award_lp',
				outcome: 'applied',
				detail: 'remote',
				reason: 'remote reason',
				payload: { amount: 10 },
				undone: false
			}
		];

		const ab = mergeSubsystem('adjustments', local, remote, NOW).value as AdjustmentEntry[];
		const ba = mergeSubsystem('adjustments', remote, local, NOW).value as AdjustmentEntry[];

		expect(ab).toHaveLength(1);
		expect(ab[0].undone).toBe(true);
		// other fields come from the local side of each call
		expect(ab[0].detail).toBe('local');
		expect(ba).toHaveLength(1);
		expect(ba[0].undone).toBe(true);
		expect(ba[0].detail).toBe('remote');
	});
});

// ---------------------------------------------------------------------------
// appConfig / adjustments defensive read (assemble validation)
// ---------------------------------------------------------------------------

describe('readAppConfig via assemble (defensive validation)', () => {
	const defaults = createDefaultState().appConfig;

	function assembleWithAppConfig(appConfig: unknown): CurrentState {
		const parts = partition(createDefaultState());
		const config = { ...(parts.config as Record<string, unknown>), appConfig };
		return assemble({ ...parts, config });
	}

	it('garbage progression.display falls back while sibling fields survive', () => {
		const rebuilt = assembleWithAppConfig({
			progression: { display: 'nope' },
			streaks: 'gentle',
			missions: 'off',
			quiz: { focusCategories: ['verbs'] },
			dailyPath: { order: ['quiz', 'tekst'] }
		});
		expect(rebuilt.appConfig.progression.display).toBe(defaults.progression.display);
		expect(rebuilt.appConfig.streaks).toBe('gentle');
		expect(rebuilt.appConfig.missions).toBe('off');
		expect(rebuilt.appConfig.quiz.focusCategories).toEqual(['verbs']);
		expect(rebuilt.appConfig.dailyPath.order).toEqual(['quiz', 'tekst']);
	});

	it('garbage streaks falls back while sibling fields survive', () => {
		const rebuilt = assembleWithAppConfig({
			progression: { display: 'hidden' },
			streaks: 'aggressive',
			missions: 'off',
			quiz: { focusCategories: ['nouns'] },
			dailyPath: { order: ['weekset'] }
		});
		expect(rebuilt.appConfig.streaks).toBe(defaults.streaks);
		expect(rebuilt.appConfig.progression.display).toBe('hidden');
		expect(rebuilt.appConfig.missions).toBe('off');
		expect(rebuilt.appConfig.quiz.focusCategories).toEqual(['nouns']);
		expect(rebuilt.appConfig.dailyPath.order).toEqual(['weekset']);
	});

	it('garbage missions falls back while sibling fields survive', () => {
		const rebuilt = assembleWithAppConfig({
			progression: { display: 'collection' },
			streaks: 'off',
			missions: 'maybe',
			quiz: { focusCategories: ['adj'] },
			dailyPath: { order: ['tekst', 'quiz'] }
		});
		expect(rebuilt.appConfig.missions).toBe(defaults.missions);
		expect(rebuilt.appConfig.progression.display).toBe('collection');
		expect(rebuilt.appConfig.streaks).toBe('off');
		expect(rebuilt.appConfig.quiz.focusCategories).toEqual(['adj']);
		expect(rebuilt.appConfig.dailyPath.order).toEqual(['tekst', 'quiz']);
	});

	it('dailyPath.order keeps known rules in relative order and drops unknown', () => {
		const rebuilt = assembleWithAppConfig({
			progression: { display: 'score' },
			streaks: 'strict',
			missions: 'on',
			quiz: { focusCategories: [] },
			dailyPath: { order: ['quiz', 'not-a-rule', 'tekst', 'bogus', 'weekset', 'quiz'] }
		});
		// unknown dropped; first 'quiz' kept, duplicate 'quiz' dropped
		expect(rebuilt.appConfig.dailyPath.order).toEqual(['quiz', 'tekst', 'weekset']);
	});

	it('dailyPath.order: [] is preserved and is not replaced by DEFAULT_GLOW_ORDER', () => {
		const rebuilt = assembleWithAppConfig({
			progression: { display: 'score' },
			streaks: 'strict',
			missions: 'on',
			quiz: { focusCategories: [] },
			dailyPath: { order: [] }
		});
		expect(rebuilt.appConfig.dailyPath.order).toEqual([]);
		expect(rebuilt.appConfig.dailyPath.order).not.toEqual([...DEFAULT_GLOW_ORDER]);
	});

	it('quiz.focusCategories keeps only string members from a mixed-type array', () => {
		const rebuilt = assembleWithAppConfig({
			progression: { display: 'score' },
			streaks: 'strict',
			missions: 'on',
			quiz: {
				focusCategories: ['verbs', 42, { x: 1 }, null, 'nouns', true, 'adj']
			},
			dailyPath: { order: [...DEFAULT_GLOW_ORDER] }
		});
		expect(rebuilt.appConfig.quiz.focusCategories).toEqual(['verbs', 'nouns', 'adj']);
	});
});

describe('assemble filters malformed adjustments', () => {
	it('drops bad tool, bad outcome, non-boolean undone; keeps the valid entry', () => {
		const valid: AdjustmentEntry = {
			id: 'adj_ok',
			timestamp: '2026-08-16T10:00:00.000Z',
			tool: 'award_lp',
			outcome: 'applied',
			detail: 'ok',
			reason: 'valid',
			payload: { amount: 5 },
			undone: false
		};
		const adjustments = [
			{
				id: 'adj_bad_tool',
				timestamp: '2026-08-16T10:01:00.000Z',
				tool: 'hack_the_planet',
				outcome: 'applied',
				detail: 'x',
				reason: 'y',
				payload: null,
				undone: false
			},
			{
				id: 'adj_bad_outcome',
				timestamp: '2026-08-16T10:02:00.000Z',
				tool: 'award_lp',
				outcome: 'maybe',
				detail: 'x',
				reason: 'y',
				payload: null,
				undone: false
			},
			{
				id: 'adj_bad_undone',
				timestamp: '2026-08-16T10:03:00.000Z',
				tool: 'award_lp',
				outcome: 'applied',
				detail: 'x',
				reason: 'y',
				payload: null,
				undone: 'yes'
			},
			valid
		];

		const parts = partition(createDefaultState());
		const rebuilt = assemble({ ...parts, adjustments });
		expect(rebuilt.adjustments).toEqual([{ ...valid, source: 'kuromi' }]);
	});
});

// ---------------------------------------------------------------------------
// Phase 6: pages subsystem + adjustment entry-gate widen
// ---------------------------------------------------------------------------

describe('mergePages legacy tolerance + LWW + opacity', () => {
	const older = '2026-08-01T10:00:00.000Z';
	const newer = '2026-08-10T10:00:00.000Z';

	it('bare [] on either side normalizes; the other side’s data survives', () => {
		const remote = {
			pages: [
				{
					id: 'p1',
					updatedAt: newer,
					title: 'Remote page',
					blocks: [{ type: 'note', body: 'hi' }]
				}
			],
			conversations: [{ id: 'c1', updatedAt: newer, title: 'Chat', turns: [] }]
		};
		const fromLegacyLocal = mergeSubsystem('pages', [], remote, NOW);
		expect(fromLegacyLocal.value).toEqual(remote);

		const local = {
			pages: [{ id: 'p2', updatedAt: older, title: 'Local page', blocks: [] }],
			conversations: []
		};
		const fromLegacyRemote = mergeSubsystem('pages', local, [], NOW);
		expect(fromLegacyRemote.value).toEqual(local);
	});

	it('opacity: unknown block type survives merge intact', () => {
		const local = {
			pages: [
				{
					id: 'p1',
					updatedAt: newer,
					title: 'Future',
					blocks: [{ type: 'hologram-deck', payload: { sparkles: 9 } }]
				}
			],
			conversations: []
		};
		const remote = { pages: [], conversations: [] };
		const { value } = mergeSubsystem('pages', local, remote, NOW);
		const pages = (value as { pages: unknown[] }).pages;
		expect(pages).toHaveLength(1);
		expect(pages[0]).toEqual(local.pages[0]);
	});

	it('LWW: later updatedAt wins; equal updatedAt → local wins', () => {
		const local = {
			pages: [{ id: 'p1', updatedAt: newer, title: 'local-new' }],
			conversations: [{ id: 'c1', updatedAt: older, title: 'local-old' }]
		};
		const remote = {
			pages: [{ id: 'p1', updatedAt: older, title: 'remote-old' }],
			conversations: [{ id: 'c1', updatedAt: newer, title: 'remote-new' }]
		};
		const { value } = mergeSubsystem('pages', local, remote, NOW);
		const slice = value as {
			pages: { id: string; title: string }[];
			conversations: { id: string; title: string }[];
		};
		expect(slice.pages.find((p) => p.id === 'p1')?.title).toBe('local-new');
		expect(slice.conversations.find((c) => c.id === 'c1')?.title).toBe('remote-new');

		const tiedLocal = {
			pages: [{ id: 'p2', updatedAt: older, title: 'local-tied' }],
			conversations: []
		};
		const tiedRemote = {
			pages: [{ id: 'p2', updatedAt: older, title: 'remote-tied' }],
			conversations: []
		};
		const tied = mergeSubsystem('pages', tiedLocal, tiedRemote, NOW);
		const tiedPages = (tied.value as { pages: { title: string }[] }).pages;
		expect(tiedPages[0].title).toBe('local-tied');
	});

	it('union: ids present on only one side survive from both sides', () => {
		const local = {
			pages: [{ id: 'only-local', updatedAt: older, title: 'L' }],
			conversations: [{ id: 'c-local', updatedAt: older, title: 'CL' }]
		};
		const remote = {
			pages: [{ id: 'only-remote', updatedAt: older, title: 'R' }],
			conversations: [{ id: 'c-remote', updatedAt: older, title: 'CR' }]
		};
		const { value } = mergeSubsystem('pages', local, remote, NOW);
		const slice = value as {
			pages: { id: string }[];
			conversations: { id: string }[];
		};
		expect(slice.pages.map((p) => p.id).sort()).toEqual(['only-local', 'only-remote']);
		expect(slice.conversations.map((c) => c.id).sort()).toEqual(['c-local', 'c-remote']);
	});
});

describe('isAdjustmentEntry entry gate (Phase 6)', () => {
	it('adjustment with no source survives and comes out as kuromi', () => {
		const entry = {
			id: 'adj_nosrc',
			timestamp: '2026-08-16T10:00:00.000Z',
			tool: 'award_lp',
			outcome: 'applied',
			detail: 'ok',
			reason: 'r',
			payload: null,
			undone: false
		};
		const parts = partition(createDefaultState());
		const rebuilt = assemble({ ...parts, adjustments: [entry] });
		expect(rebuilt.adjustments).toHaveLength(1);
		expect(rebuilt.adjustments[0].source).toBe('kuromi');
	});

	it('isAdjustmentEntry is pure: does not mutate a source-less entry', () => {
		const entry = {
			id: 'adj_pure',
			timestamp: '2026-08-16T10:00:00.000Z',
			tool: 'award_lp',
			outcome: 'applied',
			detail: 'ok',
			reason: 'r',
			payload: null,
			undone: false
		};
		expect(isAdjustmentEntry(entry)).toBe(true);
		expect(Object.prototype.hasOwnProperty.call(entry, 'source')).toBe(false);

		const { value } = mergeSubsystem('adjustments', [entry], [], NOW);
		const merged = value as AdjustmentEntry[];
		expect(merged).toHaveLength(1);
		expect(merged[0].source).toBe('kuromi');
		// Guard purity still holds after merge (normalization copies, does not mutate input).
		expect(Object.prototype.hasOwnProperty.call(entry, 'source')).toBe(false);
	});

	it('adjustment with tool create_page survives the merge', () => {
		const entry = {
			id: 'adj_page',
			timestamp: '2026-08-16T10:00:00.000Z',
			tool: 'create_page',
			outcome: 'applied',
			detail: 'made a page',
			reason: 'lesson',
			payload: { title: 'X' },
			undone: false,
			source: 'kuromi'
		};
		const { value } = mergeSubsystem('adjustments', [entry], [], NOW);
		expect(value).toEqual([entry]);
	});

	it('partition/assemble round-trip with pages and conversations populated', () => {
		const base = createDefaultState();
		const s: CurrentState = {
			...base,
			pages: [
				{
					id: 'page_1',
					title: 'Lesson',
					quip: 'hi',
					labels: ['grammar'],
					blocks: [{ type: 'note', body: 'body' }],
					createdAt: '2026-08-16T09:00:00.000Z',
					updatedAt: '2026-08-16T10:00:00.000Z',
					archived: false
				}
			],
			conversations: [
				{
					id: 'conv_1',
					title: 'Chat',
					createdAt: '2026-08-16T09:00:00.000Z',
					updatedAt: '2026-08-16T10:00:00.000Z',
					turns: [
						{ role: 'user', content: 'hallo' },
						{ role: 'assistant', content: 'hoi' }
					]
				}
			]
		};
		expect(assemble(partition(s))).toEqual(s);
	});
});
