import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import { allPassages } from './bank';
import { pickPassage } from './daily';
import { selectQtypeItems, selectTrapItem } from './drills';
import { handInMock, startSetSession } from './mockSession';
import {
	HORIZON_SLUG,
	SET_TARGET,
	eligibleSetPassages,
	examForSet,
	horizonLocked,
	practiceSets,
	setHistoryLabel
} from './sets';
import { EMPTY_READING_FORK, type ReadingForkState } from './types';

const TODAY = '2026-10-20';

function fork(partial: Partial<ReadingForkState> = {}): ReadingForkState {
	return {
		...EMPTY_READING_FORK,
		...partial,
		settings: { ...EMPTY_READING_FORK.settings, ...partial.settings },
		mocks: partial.mocks ?? [],
		attempts: partial.attempts ?? []
	};
}

describe('practice sets', () => {
	it('loads three unofficial sets and leaves the official bank alone', () => {
		expect(practiceSets().map((set) => set.id)).toEqual(['set1', 'set2', 'set3']);
		expect(practiceSets().every((set) => set.origin === 'video-set')).toBe(true);
		expect(LEZEN_EXAMS.map((exam) => exam.year)).toEqual([2025, 2024, 2023]);
		expect(setHistoryLabel('set2')).toBe('Practice set 2');
		const answers = new Map(
			LEZEN_EXAMS.flatMap((exam) =>
				exam.passages.flatMap((passage) =>
					passage.questions.map((question) => [question.id, question.answer])
				)
			)
		);
		expect(answers.get('lezen-2023-2')).toBe('C');
		expect(answers.get('lezen-2023-20')).toBe('B');
		expect(answers.get('lezen-2023-32')).toBe('C');
		expect(answers.get('lezen-2024-3')).toBe('B');
		expect(answers.get('lezen-2024-10')).toBe('B');
		expect(answers.get('lezen-2024-22')).toBe('B');
		expect(answers.get('lezen-2024-34')).toBe('B');
		expect(answers.get('lezen-2025-31')).toBe('C');
	});

	it('keeps Horizon College out until a 2025 mock exists', () => {
		expect(horizonLocked([])).toBe(true);
		expect(
			examForSet('set1', false)?.passages.some((passage) => passage.slug === HORIZON_SLUG)
		).toBe(false);
		expect(examForSet('set1', false)?.totalQuestions).toBe(28);
		expect(examForSet('set1', true)?.totalQuestions).toBe(35);
		expect(examForSet('set2', false)?.totalQuestions).toBe(35);
		expect(
			horizonLocked([
				{
					paperYear: 2025,
					setId: undefined
				}
			])
		).toBe(false);
	});

	it('hands in a set without opening the sealed paper', () => {
		const session = startSetSession('set2', true, true, 1_000);
		expect(session?.setId).toBe('set2');
		expect(session?.endsAt).toBe(1_000 + 110 * 60 * 1000);
		const finished = handInMock(fork(), session!, 2_000, TODAY, false);
		const result = finished.mocks[0];
		expect(result?.paperYear).toBe(0);
		expect(result?.setId).toBe('set2');
		expect(result?.total).toBe(35);
		expect(result?.passLine).toBe(SET_TARGET);
		expect(finished.settings.reservedPapers).toEqual([2023]);
		expect(finished.satMocks).toEqual([]);
		expect(finished.lastMockScore).toBeNull();
		expect(finished.mockInProgress).toBeNull();
		expect(finished.attempts.every((attempt) => attempt.origin === 'fresh')).toBe(true);
		expect(finished.attempts.some((attempt) => !attempt.correct)).toBe(true);
		expect(eligibleSetPassages(finished).map((passage) => passage.slug)).toEqual(
			practiceSets()
				.find((set) => set.id === 'set2')!
				.passages.map((passage) => passage.slug)
		);
		expect(eligibleSetPassages(fork())).toEqual([]);
		expect(pickPassage(fork(), TODAY)?.slug.startsWith('set')).toBe(false);
		const rested = {
			...finished,
			attempts: [
				...finished.attempts.map((attempt) => ({ ...attempt, at: '2026-10-01' })),
				...allPassages()
					.filter((passage) => passage.year !== 2023)
					.map((passage) => ({
						itemId: passage.questions[0]?.id ?? passage.slug,
						origin: 'official' as const,
						passageSlug: passage.slug,
						source: 'texts' as const,
						at: '2026-10-19',
						picked: 'A',
						correct: true,
						locateP: null,
						locateHit: null,
						ms: 0
					}))
			]
		};
		expect(pickPassage(rested, TODAY)?.slug.startsWith('set2-')).toBe(true);
		expect(selectQtypeItems(fork(), 'toepassing', TODAY).some((id) => id.startsWith('set'))).toBe(
			false
		);
		expect(
			selectQtypeItems(finished, 'toepassing', TODAY).some((id) => id.startsWith('set2-'))
		).toBe(true);
		expect(String(selectTrapItem(fork(), 'echo', TODAY) ?? '').startsWith('set')).toBe(false);
	});

	it('does not unlock Horizon College just because set 1 was taken', () => {
		const session = startSetSession('set1', false, false, 5);
		const finished = handInMock(fork(), session!, 6, TODAY, false);
		expect(finished.mocks[0]?.total).toBe(28);
		expect(eligibleSetPassages(finished).some((passage) => passage.slug === HORIZON_SLUG)).toBe(
			false
		);
		const opened = {
			...finished,
			mocks: [
				...finished.mocks,
				{
					id: 'paper-2025',
					paperYear: 2025,
					finishedAt: '2026-10-21',
					expired: false,
					correct: 25,
					total: 35,
					passLine: 24,
					byQtype: {},
					textMs: [],
					answers: {},
					flagged: {}
				}
			]
		};
		expect(eligibleSetPassages(opened).some((passage) => passage.slug === HORIZON_SLUG)).toBe(true);
	});

	it('has no em dash in the set copy or the set files', () => {
		const files = [
			new URL('./sets.ts', import.meta.url),
			new URL('./sets/PRACTICE_SETS.json', import.meta.url),
			new URL('./sets/annotations.json', import.meta.url),
			new URL('../../../docs/PRACTICE_SETS_CHANGES.md', import.meta.url),
			new URL('../../routes/sets/+page.svelte', import.meta.url)
		];
		for (const file of files) {
			expect(readFileSync(file, 'utf8').includes('\u2014'), String(file)).toBe(false);
		}
	});
});
