import { describe, expect, it } from 'vitest';
import { EMPTY_READING_FORK, type ReadingAttempt, type ReadingForkState } from './types';
import {
	PLAN_LINE,
	daysToExam,
	examCountdown,
	lastMockLine,
	lastMockView,
	locateLine,
	locateWindow,
	openTraps,
	practiceSetLine,
	qtypeLine,
	qtypeReadiness,
	unseenSetLine
} from './readiness';

function attempt(
	partial: Partial<ReadingAttempt> & Pick<ReadingAttempt, 'itemId' | 'at'>
): ReadingAttempt {
	return {
		origin: 'official',
		passageSlug: 'bakkerij',
		source: 'texts',
		picked: 'A',
		correct: true,
		locateP: null,
		locateHit: null,
		ms: 0,
		...partial
	};
}

function fork(partial: Partial<ReadingForkState> = {}): ReadingForkState {
	return {
		...EMPTY_READING_FORK,
		...partial,
		settings: { ...EMPTY_READING_FORK.settings, ...partial.settings }
	};
}

describe('readiness home', () => {
	it('counts days to 2026-11-12', () => {
		expect(daysToExam('2026-11-12', '2026-09-30')).toBe(43);
		expect(examCountdown('2026-11-12', '2026-09-30')).toBe('43 days to the exam.');
		expect(examCountdown('2026-11-12', '2026-11-11')).toBe('1 day to the exam.');
		expect(examCountdown('2026-11-12', '2026-11-12')).toBe('Exam day.');
		expect(examCountdown('2026-11-12', '2026-11-13')).toBe('The exam date has passed.');
		expect(examCountdown('soon', '2026-09-30')).toBe('Exam date is not set.');
	});

	it('says there is no mock until a sitting exists', () => {
		expect(lastMockView(fork())).toBeNull();
		expect(lastMockLine(null)).toBe('No mock yet.');
	});

	it('scores the latest mock on that paper pass line', () => {
		const view = lastMockView(
			fork({
				lastMockScore: { correct: 20, total: 35, passed: false, year: 2024 },
				mocks: [
					{
						id: 'older',
						paperYear: 2024,
						finishedAt: '2026-10-01',
						expired: false,
						correct: 20,
						total: 35,
						passLine: 24,
						byQtype: {},
						textMs: [],
						answers: {},
						flagged: {}
					},
					{
						id: 'newer',
						paperYear: 2023,
						finishedAt: '2026-10-20',
						expired: false,
						correct: 23,
						total: 35,
						passLine: 23,
						byQtype: {},
						textMs: [],
						answers: {},
						flagged: {}
					}
				]
			})
		);
		expect(view).toMatchObject({ year: 2023, passLine: 23, target: 24, passed: true });
		expect(lastMockLine(view)).toBe(
			'2023: 23 of 35. Pass line 23. Target 24. This sitting passes.'
		);
	});

	it('uses the booklet pass line when only lastMockScore is stored', () => {
		const view = lastMockView(
			fork({ lastMockScore: { correct: 22, total: 35, passed: false, year: 2023 } })
		);
		expect(lastMockLine(view)).toBe(
			'2023: 22 of 35. Pass line 23. Target 24. Under the pass line.'
		);
	});

	it('sorts question types weakest first and splits official from practice', () => {
		const attempts: ReadingAttempt[] = [];
		for (let i = 0; i < 6; i++) {
			attempts.push(
				attempt({
					itemId: 'lezen-2024-1',
					at: `2026-08-${String(i + 1).padStart(2, '0')}`,
					origin: 'official',
					correct: i === 5
				})
			);
			attempts.push(
				attempt({
					itemId: 'lezen-2024-1',
					at: `2026-08-${String(i + 10).padStart(2, '0')}`,
					origin: 'practice',
					correct: true
				})
			);
		}
		attempts.push(
			attempt({
				itemId: 'lezen-2023-1',
				at: '2026-09-01',
				origin: 'official',
				correct: true
			})
		);
		const rows = qtypeReadiness(fork({ attempts }));
		expect(rows[0].qtype).toBe('detail');
		expect(rows[0].split).toBe(true);
		expect(qtypeLine(rows[0])).toBe('Find the fact. Official 1 of 6. Practice 6 of 6.');
		const purpose = rows.find((row) => row.qtype === 'doel-tekst');
		expect(purpose?.split).toBe(false);
		expect(qtypeLine(purpose!)).toBe('Purpose of the text: 1 of 1.');
		expect(rows.at(-1)?.attempts).toBe(0);
		expect(rows.findIndex((row) => row.qtype === 'detail')).toBeLessThan(
			rows.findIndex((row) => row.qtype === 'doel-tekst')
		);
	});

	it('rates the last 50 located questions and lists open traps', () => {
		const attempts = [
			attempt({ itemId: 'lezen-2024-1', at: '2026-09-01', locateHit: true }),
			attempt({ itemId: 'lezen-2024-2', at: '2026-09-02', locateHit: false }),
			attempt({ itemId: 'lezen-2024-3', at: '2026-09-03', locateHit: null })
		];
		expect(locateLine(locateWindow(fork({ attempts }), 50))).toBe(
			'Found the right paragraph: 1 of 2.'
		);
		expect(locateLine(null)).toBe('Found the right paragraph: no located questions yet.');
		const traps = openTraps(
			fork({
				traps: [
					{
						trap: 'echo',
						lastItemId: 'lezen-2024-1',
						seenItemIds: ['lezen-2024-1'],
						dueDate: '2026-09-30',
						streak: 0,
						misses: 2,
						createdAt: '2026-09-01',
						tamedAt: null
					},
					{
						trap: 'te-breed',
						lastItemId: 'lezen-2024-2',
						seenItemIds: ['lezen-2024-2'],
						dueDate: '2026-10-07',
						streak: 3,
						misses: 1,
						createdAt: '2026-09-01',
						tamedAt: '2026-09-20'
					}
				]
			})
		);
		expect(traps).toEqual(['echo']);
	});

	it('keeps a practice set out of the official last mock', () => {
		const view = lastMockView(
			fork({
				mocks: [
					{
						id: 'official',
						paperYear: 2024,
						finishedAt: '2026-10-01',
						expired: false,
						correct: 24,
						total: 35,
						passLine: 24,
						byQtype: {},
						textMs: [],
						answers: {},
						flagged: {}
					},
					{
						id: 'set-newer',
						paperYear: 0,
						setId: 'set2',
						finishedAt: '2026-10-20',
						expired: false,
						correct: 22,
						total: 35,
						passLine: 25,
						byQtype: {},
						textMs: [],
						answers: {},
						flagged: {}
					}
				]
			})
		);
		expect(view?.year).toBe(2024);
		expect(practiceSetLine(fork({ mocks: view ? [] : [] }))).toBe('No practice set yet.');
		expect(
			practiceSetLine(
				fork({
					mocks: [
						{
							id: 'set-newer',
							paperYear: 0,
							setId: 'set2',
							finishedAt: '2026-10-20',
							expired: false,
							correct: 22,
							total: 35,
							passLine: 25,
							byQtype: {},
							textMs: [],
							answers: {},
							flagged: {}
						}
					]
				})
			)
		).toBe('Practice set 2: 22 of 35 on 2026-10-20. Practice set, unofficial.');
		expect(unseenSetLine(fork())).toBe('Unseen texts: no first attempts yet.');
		expect(
			unseenSetLine(
				fork({
					attempts: [
						attempt({
							itemId: 'set2-1',
							at: '2026-10-20',
							origin: 'fresh',
							correct: false,
							passageSlug: 'set2-meryem-werktijden'
						}),
						attempt({
							itemId: 'set2-1',
							at: '2026-10-21',
							origin: 'fresh',
							correct: true,
							passageSlug: 'set2-meryem-werktijden'
						})
					]
				})
			)
		).toBe('Unseen texts: 0 of 1.');
	});

	it('keeps the plan on the published dates', () => {
		expect(PLAN_LINE).toContain('2026-10-12');
		expect(PLAN_LINE).toContain('Practice set 2');
		expect(PLAN_LINE).toContain('2026-10-19');
		expect(PLAN_LINE).toContain('2026-10-26');
		expect(PLAN_LINE).toContain('2026-11-02');
		expect(PLAN_LINE).toContain('2026-11-05');
		expect(PLAN_LINE).toContain('2026-11-09');
		expect(PLAN_LINE).not.toContain('\u2014');
		expect(PLAN_LINE).not.toContain('\u2013');
	});
});
