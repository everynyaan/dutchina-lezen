import { describe, it, expect, vi } from 'vitest';
import { createDefaultState } from '$lib/state/defaults';
import type { AdjustmentEntry, AppConfig, CurrentState, KuromiPage } from '$lib/state/schema';
import type { WordEntry } from '$lib/data/wordPool';

vi.mock('$lib/fresh/freshSource', () => ({
	loadRustyWords: vi.fn(
		async (): Promise<WordEntry[]> => [
			{
				id: 'w1',
				dutch: 'huis',
				english: 'house',
				pos: 'noun',
				rank: 1,
				category: 'misc',
				sentence_nl: 'Het huis.',
				sentence_en: 'The house.'
			},
			{
				id: 'w2',
				dutch: 'kat',
				english: 'cat',
				pos: 'noun',
				rank: 1,
				category: 'misc',
				sentence_nl: 'De kat.',
				sentence_en: 'The cat.'
			}
		]
	)
}));

import { buildKuromiContext, screenLabelForPath } from './context';
import { loadRustyWords } from '$lib/fresh/freshSource';

function makeState(overrides: Partial<CurrentState> = {}): CurrentState {
	return { ...createDefaultState(), ...overrides };
}

function makeAdjustment(
	overrides: Partial<AdjustmentEntry> & Pick<AdjustmentEntry, 'id' | 'detail'>
): AdjustmentEntry {
	return {
		timestamp: '2026-08-15T12:00:00.000Z',
		tool: 'award_lp',
		outcome: 'applied',
		reason: 'test',
		payload: { secret: 'must-not-leak' },
		undone: false,
		...overrides
	};
}

function makePage(overrides: Partial<KuromiPage> & Pick<KuromiPage, 'id'>): KuromiPage {
	return {
		title: 'Untitled',
		quip: '',
		labels: [],
		blocks: [{ type: 'note', body: 'hi' }],
		createdAt: '2026-08-01T00:00:00.000Z',
		updatedAt: '2026-08-01T00:00:00.000Z',
		archived: false,
		...overrides
	};
}

describe('screenLabelForPath', () => {
	it('maps / exactly to home', () => {
		expect(screenLabelForPath('/')).toBe('home');
	});

	it('does not treat /anything as the four gates', () => {
		expect(screenLabelForPath('/anything')).toBe('somewhere in the app');
		expect(screenLabelForPath('/home')).toBe('somewhere in the app');
	});

	it('maps live routes and leaves retired rooms unlabeled', () => {
		expect(screenLabelForPath('/lezen')).toBe('a full text');
		expect(screenLabelForPath('/eval')).toBe("today's full training text");
		expect(screenLabelForPath('/playbook')).toBe('the playbook');
		expect(screenLabelForPath('/grammar')).toBe('the pattern handbook');
		expect(screenLabelForPath('/mock')).toBe('a 110-minute mock');
		expect(screenLabelForPath('/mock/booklet')).toBe('a 110-minute mock');
		expect(screenLabelForPath('/kuromi/shelf')).toBe("Kuromi's shelf");
		expect(screenLabelForPath('/kuromi')).toBe('Kuromi');
		expect(screenLabelForPath('/match')).toBe('somewhere in the app');
		expect(screenLabelForPath('/quiz')).toBe('somewhere in the app');
		expect(screenLabelForPath('/boss')).toBe('somewhere in the app');
		expect(screenLabelForPath('/gate')).toBe('somewhere in the app');
		expect(screenLabelForPath('/gate/extra')).toBe('somewhere in the app');
	});

	it('maps nested paths under a live prefix', () => {
		expect(screenLabelForPath('/cards/session')).toBe('trap drills');
	});

	it('does not label retired story routes', () => {
		expect(screenLabelForPath('/stories/foo/1')).toBe('somewhere in the app');
		expect(screenLabelForPath('/stories/hello-world/3')).toBe('somewhere in the app');
		expect(screenLabelForPath('/stories/foo')).toBe('somewhere in the app');
		expect(screenLabelForPath('/stories')).toBe('somewhere in the app');
	});

	it('falls back for unknown paths', () => {
		expect(screenLabelForPath('/settings')).toBe('somewhere in the app');
		expect(screenLabelForPath('/conversation')).toBe('somewhere in the app');
	});
});

describe('buildKuromiContext', () => {
	it('assembles route, screen, current gate, rusty dutch words, and activity', async () => {
		const state = makeState({
			rank: 1,
			practiceDays: 3,
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: [],
				results: {},
				completed: true,
				lpEarned: 5
			},
			dailyRead: { date: '2026-08-15', done: true }
		});

		const packet = await buildKuromiContext('/lezen', state, '2026-08-15');

		expect(packet.route).toBe('/lezen');
		expect(packet.screen).toBe('a full text');
		expect(packet).not.toHaveProperty('rank');
		expect(packet).not.toHaveProperty('rankName');
		expect(packet.currentGate).toBe(1);
		expect(packet.lockWhen.map((l) => l.gate)).toEqual([2, 3, 4]);
		expect(packet.lockWhen[0].when).toContain('Gate 1 words stick');
		expect(packet.mastery.gate).toBe(1);
		expect(packet.mastery.percent).toBe(0);
		expect(packet.mastery.nextUnlock).toContain('Gate 1 words stick');
		expect(packet.mastery.pieces.map((p) => p.key)).toEqual(['A', 'B', 'C', 'D']);
		expect(packet.mastery.pieces.every((p) => p.done === false)).toBe(true);
		expect(packet.mastery.pieces.find((p) => p.key === 'C')?.human).toMatch(/dail/i);
		expect(packet.rustyWords).toEqual(['huis', 'kat']);
		expect(packet.readingFork.passLine).toBe(24);
		expect(packet.readingFork.target).toBe(25);
		expect(packet.readingFork.examDate).toBe('2026-11-12');
		expect(packet.readingFork.daysLeft).toBeGreaterThan(0);
		expect(packet.currentItem).toBeUndefined();
		expect(packet.recentActivity).toEqual([
			'3-week streak',
			"finished today's quiz",
			"did today's reading"
		]);
		expect(loadRustyWords).toHaveBeenCalledWith('2026-08-15', 5, expect.any(Array));
	});

	it('includes a mastery snapshot with human pieces, never set_gate', async () => {
		const state = makeState({
			gates: {
				current: 1,
				mastered: [],
				quizLog: [{ gate: 1, date: '2026-08-14', correct: 4, total: 5 }],
				weekLog: []
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.mastery.gate).toBe(1);
		expect(packet.mastery.pieces.find((p) => p.key === 'C')?.human).toBe('2 more dailies at 4/5');
		expect(packet.mastery.nextUnlock).toBe(packet.lockWhen[0]?.when);
		expect(JSON.stringify(packet.mastery)).not.toMatch(/set_gate|unlock_gate|Iron|interval/i);
	});

	it('omits activity strings that do not apply', async () => {
		const state = makeState({ practiceDays: 0 });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.screen).toBe('home');
		expect(packet.recentActivity).toEqual([]);
	});

	it('reports no streak on a fresh profile that only opened the app', async () => {
		const state = makeState({ practiceDays: 1, totalLp: 0 });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentActivity).toEqual([]);
	});

	it('reports no streak after only claiming the weekly show-up bonus', async () => {
		const state = makeState({ practiceDays: 1, totalLp: 5 });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentActivity).toEqual([]);
	});

	it('reports a real streak once she has practiced', async () => {
		const state = makeState({
			practiceDays: 5,
			totalLp: 120,
			cardReviews: {
				'card-1': {
					wordId: 'card-1',
					interval: 1,
					easeFactor: 2.5,
					repetitions: 1,
					nextReviewDate: '2026-08-16',
					lastReviewDate: '2026-08-15',
					firstSeenDate: '2026-08-15'
				}
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentActivity).toContain('5-week streak');
	});

	it('reports a streak from conversation practice alone, not just quiz/read', async () => {
		const base = makeState({ practiceDays: 2, totalLp: 0 });
		const state = makeState({
			practiceDays: 2,
			totalLp: 0,
			conversation: {
				...base.conversation,
				readChapters: ['ch1'],
				questionResults: {}
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentActivity).toContain('2-week streak');
	});

	it('round-trips config verbatim from state.appConfig', async () => {
		const appConfig: AppConfig = {
			progression: { display: 'collection' },
			streaks: 'gentle',
			missions: 'off',
			quiz: { focusCategories: ['food', 'travel'] },
			dailyPath: { order: ['quiz', 'tekst', 'weekset', 'weekset-urgent'] }
		};
		const state = makeState({ appConfig });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.config).toEqual(appConfig);
		expect(packet.config).toBe(state.appConfig);
	});

	it('maps streak.weeks to practiceDays and streak.mode to appConfig.streaks', async () => {
		const state = makeState({
			practiceDays: 7,
			appConfig: {
				...createDefaultState().appConfig,
				streaks: 'off'
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.streak).toEqual({ weeks: 7, mode: 'off' });
	});

	it('returns recentAdjustments: [] when adjustments is empty', async () => {
		const state = makeState({ adjustments: [] });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentAdjustments).toEqual([]);
	});

	it('caps recentAdjustments at 5, newest-first, without payload', async () => {
		// Storage is oldest-first (push). Entries a0..a6 → newest is a6.
		const adjustments: AdjustmentEntry[] = Array.from({ length: 7 }, (_, i) =>
			makeAdjustment({
				id: `a${i}`,
				detail: `detail-${i}`,
				timestamp: `2026-08-0${i + 1}T12:00:00.000Z`,
				tool: i % 2 === 0 ? 'award_lp' : 'update_config',
				outcome: 'applied',
				payload: { index: i, secret: true }
			})
		);
		const state = makeState({ adjustments });
		const packet = await buildKuromiContext('/', state, '2026-08-15');

		expect(packet.recentAdjustments).toHaveLength(5);
		expect(packet.recentAdjustments.map((e) => e.detail)).toEqual([
			'detail-6',
			'detail-5',
			'detail-4',
			'detail-3',
			'detail-2'
		]);

		for (const entry of packet.recentAdjustments) {
			expect(entry).not.toHaveProperty('payload');
			expect(entry).not.toHaveProperty('id');
			expect(entry).not.toHaveProperty('reason');
			expect(entry).toEqual({
				tool: entry.tool,
				outcome: entry.outcome,
				detail: entry.detail,
				timestamp: entry.timestamp,
				undone: entry.undone
			});
		}
	});

	it('clamps recentAdjustments detail to 200 characters', async () => {
		const long = 'x'.repeat(350);
		const state = makeState({
			adjustments: [makeAdjustment({ id: 'long', detail: long })]
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentAdjustments[0].detail).toHaveLength(200);
		expect(packet.recentAdjustments[0].detail).toBe('x'.repeat(200));
	});

	it('reports lastQuiz.score null when quiz is incomplete', async () => {
		const state = makeState({
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['q1', 'q2', 'q3'],
				results: { q1: true },
				completed: false,
				lpEarned: 0
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.lastQuiz).toEqual({ completed: false, score: null });
	});

	it('reports lastQuiz.score when quiz is completed with questions', async () => {
		const state = makeState({
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['q1', 'q2', 'q3', 'q4'],
				results: { q1: true, q2: false, q3: true, q4: true },
				completed: true,
				lpEarned: 8
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.lastQuiz).toEqual({
			completed: true,
			score: { correct: 3, total: 4 }
		});
	});

	it('reports lastQuiz.score null when completed but questionIds empty', async () => {
		const state = makeState({
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: [],
				results: {},
				completed: true,
				lpEarned: 0
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.lastQuiz).toEqual({ completed: true, score: null });
	});

	it('fresh profile: no recentActivity streak AND practice activityShape is null', async () => {
		const state = makeState({
			practiceDays: 1,
			totalLp: 0,
			lastSessionDate: '2026-08-15'
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.recentActivity).toEqual([]);
		const practice = packet.activityShape.find((s) => s.label === 'practice');
		expect(practice).toEqual({ label: 'practice', daysAgo: null });
	});

	it('activityShape reports daysAgo 0 for a completed daily quiz dated today', async () => {
		const state = makeState({
			dailyQuiz: {
				date: '2026-08-15',
				questionIds: ['q1'],
				results: { q1: true },
				completed: true,
				lpEarned: 2
			}
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		const quiz = packet.activityShape.find((s) => s.label === 'daily quiz');
		expect(quiz).toEqual({ label: 'daily quiz', daysAgo: 0 });
	});

	it('activityShape nulls signals older than 14 days or without evidence flags', async () => {
		const state = makeState({
			cards: {
				...createDefaultState().cards,
				lastReviewDate: '2026-07-01'
			},
			match: {
				...createDefaultState().match,
				lastMatchDate: '2026-08-10'
			},
			dailyQuiz: {
				date: '2026-08-14',
				questionIds: ['q1'],
				results: {},
				completed: false,
				lpEarned: 0
			},
			dailyRead: { date: '2026-08-14', done: false }
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.activityShape).toEqual([
			{ label: 'practice', daysAgo: null },
			{ label: 'daily quiz', daysAgo: null },
			{ label: 'daily read', daysAgo: null },
			{ label: 'flashcards', daysAgo: null },
			{ label: 'match game', daysAgo: 5 }
		]);
	});
});

describe('shelf summary', () => {
	it('is present and empty when there are no pages', async () => {
		const state = makeState({ pages: [] });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.shelf).toEqual({ pages: [], archivedCount: 0 });
	});

	it('summarizes a single active page: id, title, labels, blockCount only', async () => {
		const state = makeState({
			pages: [
				makePage({
					id: 'p1',
					title: 'De/Het',
					labels: ['grammar', 'articles'],
					blocks: [
						{ type: 'note', body: 'a' },
						{ type: 'note', body: 'b' }
					] as KuromiPage['blocks']
				})
			]
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.shelf).toEqual({
			pages: [{ id: 'p1', title: 'De/Het', labels: ['grammar', 'articles'], blockCount: 2 }],
			archivedCount: 0
		});
	});

	it('caps active pages at 15, newest-updated first', async () => {
		const pages = Array.from({ length: 20 }, (_, i) =>
			makePage({
				id: `p${i}`,
				title: `Page ${i}`,
				updatedAt: `2026-08-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`
			})
		);
		const state = makeState({ pages });
		const packet = await buildKuromiContext('/', state, '2026-08-25');
		expect(packet.shelf.pages).toHaveLength(15);
		expect(packet.shelf.pages.map((p) => p.id)).toEqual([
			'p19',
			'p18',
			'p17',
			'p16',
			'p15',
			'p14',
			'p13',
			'p12',
			'p11',
			'p10',
			'p9',
			'p8',
			'p7',
			'p6',
			'p5'
		]);
	});

	it('excludes archived pages from the list but counts them', async () => {
		const pages = [
			makePage({ id: 'active1', archived: false }),
			makePage({ id: 'archived1', archived: true }),
			makePage({ id: 'archived2', archived: true })
		];
		const state = makeState({ pages });
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		expect(packet.shelf.pages.map((p) => p.id)).toEqual(['active1']);
		expect(packet.shelf.archivedCount).toBe(2);
	});

	it('clamps title to 60 chars and labels to 3 entries of 24 chars each', async () => {
		const longTitle = 'x'.repeat(120);
		const manyLongLabels = Array.from({ length: 10 }, (_, i) => `label-${i}-`.repeat(5));
		const state = makeState({
			pages: [makePage({ id: 'p1', title: longTitle, labels: manyLongLabels })]
		});
		const packet = await buildKuromiContext('/', state, '2026-08-15');
		const summary = packet.shelf.pages[0];
		expect(summary.title).toHaveLength(60);
		expect(summary.title).toBe('x'.repeat(60));
		expect(summary.labels).toHaveLength(3);
		for (const label of summary.labels) {
			expect(label.length).toBeLessThanOrEqual(24);
		}
	});
});
