import { describe, expect, it } from 'vitest';
import { allPassages, dayIndex, findPassage } from './bank';
import {
	buildDailyText,
	daysAgo,
	pickPassage,
	selectParaphrase,
	selectQuestions,
	shouldMap
} from './daily';
import { itemPassageSlug } from './practice';
import { EMPTY_READING_FORK, type ReadingAttempt, type ReadingForkState } from './types';

const DATE = '2026-09-30';

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
		settings: { ...EMPTY_READING_FORK.settings, ...partial.settings },
		attempts: partial.attempts ?? []
	};
}

describe('daily text selection', () => {
	it('is deterministic and keeps 2023 reserved', () => {
		const state = fork();
		expect(buildDailyText(state, DATE)).toEqual(buildDailyText(state, DATE));
		for (let i = 0; i < 40; i++) {
			const date = daysAgo(DATE, -i);
			expect(pickPassage(state, date)?.year).not.toBe(2023);
		}
	});

	it('does not reserve 2025 while 2023 is the sealed paper', () => {
		const years = new Set<number>();
		for (let i = 0; i < 24; i++) years.add(pickPassage(fork(), daysAgo(DATE, -i))?.year ?? 0);
		expect(years.has(2024)).toBe(true);
		expect(years.has(2025)).toBe(true);
		expect(years.has(2023)).toBe(false);
	});

	it('skips a passage seen in the last 7 days and prefers the oldest', () => {
		const pool = allPassages().filter((passage) => passage.year !== 2023);
		const old = pool[0];
		const state = fork({
			attempts: pool.map((passage) =>
				attempt({
					itemId: passage.slug,
					at: passage.slug === old.slug ? daysAgo(DATE, 20) : daysAgo(DATE, 2),
					passageSlug: passage.slug,
					source: 'daily'
				})
			)
		});
		expect(pickPassage(state, DATE)?.slug).toBe(old.slug);
	});

	it('breaks a never-seen tie with dayIndex', () => {
		const pool = allPassages()
			.filter((passage) => !EMPTY_READING_FORK.settings.reservedPapers.includes(passage.year))
			.slice()
			.sort((a, b) => a.slug.localeCompare(b.slug));
		expect(pickPassage(fork(), DATE)?.slug).toBe(pool[dayIndex(DATE, pool.length)]?.slug);
	});

	it('puts a fresh official purpose question last and keeps to one official item', () => {
		const passage = findPassage('buurt-whatsapp');
		expect(passage).toBeTruthy();
		const ids = selectQuestions(fork(), passage!, DATE);
		expect(ids).toEqual(['p-buurt-whatsapp-1', 'lezen-2025-28']);
		expect(ids.filter((id) => id.startsWith('lezen-'))).toHaveLength(1);
		expect(ids.at(-1)).toBe('lezen-2025-28');
	});

	it('orders practice items by the weakest question type', () => {
		const passage = findPassage('buurt-whatsapp')!;
		const state = fork({
			attempts: [
				attempt({ itemId: 'lezen-2023-10', at: '2026-09-01', correct: false }),
				attempt({ itemId: 'lezen-2023-20', at: '2026-09-01', correct: true })
			]
		});
		expect(selectQuestions(state, passage, DATE)).toEqual(['p-buurt-whatsapp-6', 'lezen-2025-28']);
	});

	it('skips an official item attempted in the last 21 days', () => {
		const passage = findPassage('buurt-whatsapp')!;
		const state = fork({
			attempts: [
				attempt({
					itemId: 'lezen-2025-28',
					at: daysAgo(DATE, 3),
					passageSlug: 'buurt-whatsapp',
					source: 'daily'
				}),
				...['p-buurt-whatsapp-1', 'p-buurt-whatsapp-2', 'p-buurt-whatsapp-3'].map((id) =>
					attempt({ itemId: id, at: '2026-08-01', passageSlug: 'buurt-whatsapp', source: 'daily' })
				)
			]
		});
		const ids = selectQuestions(state, passage, DATE);
		expect(ids).not.toContain('lezen-2025-28');
		expect(ids.filter((id) => id.startsWith('lezen-')).length).toBeLessThanOrEqual(1);
		expect(ids.some((id) => id.startsWith('p-'))).toBe(true);
		for (let index = 1; index < ids.length; index++) {
			const prev = ids[index - 1];
			const current = ids[index];
			if (prev.startsWith('p-') && current.startsWith('p-')) {
				expect(itemPassageSlug(prev)).not.toBe(itemPassageSlug(current));
			}
		}
	});

	it('holds a paraphrase until its official item has been attempted', () => {
		const questions = ['p-buurt-whatsapp-1', 'p-buurt-whatsapp-2', 'lezen-2025-28'];
		expect(selectParaphrase(fork(), 'buurt-whatsapp', DATE, questions)).toBe('pp-buurt-whatsapp-1');
		const seen = fork({
			attempts: [
				attempt({
					itemId: 'lezen-2025-26',
					at: '2026-09-01',
					passageSlug: 'buurt-whatsapp'
				})
			]
		});
		const drills = ['pp-buurt-whatsapp-1', 'pp-buurt-whatsapp-2'];
		expect(selectParaphrase(seen, 'buurt-whatsapp', DATE, questions)).toBe(
			drills[dayIndex(DATE, drills.length)]
		);
	});

	it('skips the map when this passage was mapped in the last 21 days', () => {
		expect(shouldMap(fork(), 'buurt-whatsapp', DATE)).toBe(true);
		expect(shouldMap(fork(), 'bakkerij', DATE)).toBe(true);
		const mapped = fork({
			attempts: [
				attempt({
					itemId: 'map:buurt-whatsapp',
					at: daysAgo(DATE, 10),
					passageSlug: 'buurt-whatsapp',
					source: 'map',
					origin: 'practice'
				})
			]
		});
		expect(shouldMap(mapped, 'buurt-whatsapp', DATE)).toBe(false);
	});
});
