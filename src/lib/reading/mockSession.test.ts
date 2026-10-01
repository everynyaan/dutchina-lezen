import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EMPTY_READING_FORK, type ReadingForkState } from './types';
import { passLineFor, targetFor } from './mock';
import {
	MOCK_MS,
	SEEN_PAPER_WARNING,
	chooseMockPaper,
	examForYear,
	flagSplit,
	formatRemaining,
	handInMock,
	releasePaper,
	remainingMs,
	startMockSession,
	textScores,
	unansweredCount
} from './mockSession';

function fork(partial: Partial<ReadingForkState> = {}): ReadingForkState {
	return {
		...EMPTY_READING_FORK,
		...partial,
		settings: { ...EMPTY_READING_FORK.settings, ...partial.settings }
	};
}

describe('mock paper choice', () => {
	it('sits the reserved unseen paper', () => {
		const choice = chooseMockPaper(fork());
		expect(choice).toEqual({ year: 2023, sealed: true, seen: false, studied: false });
	});

	it('does not open a reserved paper she has already studied', () => {
		const choice = chooseMockPaper(fork(), [2023]);
		expect(choice).toEqual({ year: 2024, sealed: false, seen: false, studied: false });
	});

	it('picks the least recently mocked paper and warns when she has seen it', () => {
		const choice = chooseMockPaper(
			fork({
				settings: { ...EMPTY_READING_FORK.settings, reservedPapers: [] },
				satMocks: [2023, 2024, 2025],
				mocks: [
					{
						id: 'a',
						paperYear: 2025,
						finishedAt: '2026-09-01',
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
						id: 'b',
						paperYear: 2024,
						finishedAt: '2026-08-01',
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
						id: 'c',
						paperYear: 2023,
						finishedAt: '2026-07-01',
						expired: false,
						correct: 20,
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
		expect(choice.year).toBe(2023);
		expect(choice.seen).toBe(true);
		expect(SEEN_PAPER_WARNING).toBe(
			'You have seen this paper. Expect a higher score than on the day.'
		);
	});
});

describe('mock clock and hand-in', () => {
	it('keeps one 110 minute clock from endsAt', () => {
		const session = startMockSession(2023, false, 1_000);
		expect(session.endsAt - session.startedAt).toBe(MOCK_MS);
		expect(MOCK_MS).toBe(110 * 60 * 1000);
		expect(remainingMs(session, 1_000 + 5_000)).toBe(MOCK_MS - 5_000);
		expect(remainingMs(session, session.endsAt)).toBe(0);
		expect(remainingMs(session, session.endsAt + 10)).toBe(0);
		expect(formatRemaining(MOCK_MS)).toBe('1:50:00');
		expect(session.textMs).toHaveLength(6);
	});

	it('scores 2023 at 23, drops it from reserved papers, and does not reserve 2025', () => {
		const exam = examForYear(2023);
		if (!exam) throw new Error('missing 2023');
		expect(passLineFor(exam)).toBe(23);
		expect(targetFor(exam)).toBe(24);
		expect(exam.passages).toHaveLength(6);
		expect(exam.totalQuestions).toBe(35);
		const session = startMockSession(2023, true, 5_000);
		const answers: Record<string, string> = {};
		for (const passage of exam.passages) {
			for (const question of passage.questions) answers[question.id] = question.answer;
		}
		answers['lezen-2023-1'] = 'A';
		session.answers = answers;
		session.flagged = { 'lezen-2023-1': true, 'lezen-2023-2': true };
		const next = handInMock(fork(), session, 5_000 + 60_000, '2026-09-30', false);
		const result = next.mocks[0];
		expect(result.total).toBe(35);
		expect(result.passLine).toBe(23);
		expect(result.correct).toBe(34);
		expect(next.lastMockScore).toEqual({ correct: 34, total: 35, passed: true, year: 2023 });
		expect(next.settings.reservedPapers).toEqual([]);
		expect(next.settings.reservedPapers).not.toContain(2025);
		expect(next.satMocks).toEqual([2023]);
		expect(next.mockInProgress).toBeNull();
		expect(
			next.attempts.some((row) => row.source === 'mock' && row.itemId === 'lezen-2023-1')
		).toBe(true);
		expect(next.attempts).toHaveLength(35);
		expect(releasePaper([2023], 2023)).toEqual([]);
		const flags = flagSplit(exam, result);
		expect(flags.wrong).toBe(1);
		expect(flags.right).toBe(1);
		expect(textScores(exam, result.answers).reduce((sum, row) => sum + row.total, 0)).toBe(35);
		expect(unansweredCount(exam, {})).toBe(35);
	});
});

describe('mock and book placement', () => {
	const mockPage = readFileSync(
		fileURLToPath(new URL('../../routes/mock/+page.svelte', import.meta.url)),
		'utf8'
	);
	const texts = readFileSync(
		fileURLToPath(new URL('../../routes/lezen/+page.svelte', import.meta.url)),
		'utf8'
	);
	const home = readFileSync(
		fileURLToPath(new URL('../../routes/+page.svelte', import.meta.url)),
		'utf8'
	);
	const booklet = readFileSync(
		fileURLToPath(new URL('../../routes/mock/booklet/+page.svelte', import.meta.url)),
		'utf8'
	);

	it('keeps the sitting free of feedback, shuffling, and a per-text clock', () => {
		expect(mockPage).toContain('setKuromiVisible(false)');
		expect(mockPage).toContain('SEEN_PAPER_WARNING');
		expect(mockPage).toContain('NOT_A_PREDICTION');
		expect(mockPage).toContain('Van Dale NT2');
		expect(mockPage).toContain('Hand in');
		expect(mockPage).toContain('ReadingLoop');
		expect(mockPage).not.toContain('shuffle');
		expect(mockPage).not.toContain('MissReview');
		expect(mockPage).not.toContain('TimeBox');
		expect(mockPage).not.toContain('MINUTES_PER_TEXT');
		expect(mockPage).not.toContain('reservedPapersFor');
		expect(mockPage).not.toContain('SpeakerButton');
		expect(mockPage).not.toContain('\u2014');
		expect(mockPage).not.toContain('\u2013');
		expect(booklet).toContain('A4');
		expect(booklet).not.toContain('\u2014');
	});

	it('hides Book on the texts list and on Home', () => {
		const list = texts.split("stage === 'list'")[1]?.split('{:else')[0] ?? '';
		expect(list).not.toContain('PracticeBook');
		expect(texts).toContain('PracticeBook');
		expect(home).not.toContain('PracticeBook');
	});
});
