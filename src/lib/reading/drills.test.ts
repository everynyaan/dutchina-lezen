import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getAnnotation } from './annotations';
import { addDays, allPassages, findPassage, findQuestion } from './bank';
import {
	lureChoices,
	selectLures,
	selectParaphraseDrills,
	selectQtypeItems,
	selectTrapItem
} from './drills';
import { itemAttemptedWithin } from './history';
import { practiceItemsFor } from './practice';
import {
	EMPTY_READING_FORK,
	type ReadingAttempt,
	type ReadingForkState,
	type TrapKind
} from './types';

const TODAY = '2026-09-30';

function attempt(itemId: string, slug: string, at: string): ReadingAttempt {
	return {
		itemId,
		origin: itemId.startsWith('lezen-') ? 'official' : 'practice',
		passageSlug: slug,
		source: 'daily',
		at,
		picked: 'B',
		correct: false,
		locateP: null,
		locateHit: null,
		ms: 0
	};
}

function fork(patch: Partial<ReadingForkState>): ReadingForkState {
	return {
		...EMPTY_READING_FORK,
		...patch,
		attempts: patch.attempts ?? [],
		traps: patch.traps ?? []
	};
}

function echoIds(): { id: string; slug: string; year: number }[] {
	const rows: { id: string; slug: string; year: number }[] = [];
	for (const passage of allPassages()) {
		for (const item of practiceItemsFor(passage.slug)) {
			if (Object.values(item.distractors).some((row) => row.trap === 'echo')) {
				rows.push({ id: item.id, slug: passage.slug, year: passage.year });
			}
		}
		for (const question of passage.questions) {
			const annotation = getAnnotation(question.id);
			if (!annotation) continue;
			if (Object.values(annotation.distractors).some((row) => row.trap === 'echo')) {
				rows.push({ id: question.id, slug: passage.slug, year: passage.year });
			}
		}
	}
	return rows;
}

function yearOf(id: string): number | undefined {
	return (
		findQuestion(id)?.passage.year ??
		findPassage(echoIds().find((row) => row.id === id)?.slug ?? '')?.year
	);
}

describe('selectTrapItem', () => {
	it('is deterministic and prefers a practice item on another passage', () => {
		const other = allPassages().find((passage) => passage.year === 2024);
		expect(other).toBeTruthy();
		const state = fork({
			traps: [
				{
					trap: 'echo',
					lastItemId: other!.questions[0].id,
					seenItemIds: [other!.questions[0].id],
					dueDate: TODAY,
					streak: 0,
					misses: 1,
					createdAt: TODAY,
					tamedAt: null
				}
			]
		});
		const first = selectTrapItem(state, 'echo', TODAY);
		const second = selectTrapItem(state, 'echo', TODAY);
		expect(first).toBe(second);
		expect(first?.startsWith('p-buurt-whatsapp-')).toBe(true);
		expect(yearOf(first!)).not.toBe(2023);
	});

	it('uses another passage when the last miss was on the only practice pack', () => {
		const state = fork({
			traps: [
				{
					trap: 'echo',
					lastItemId: 'p-buurt-whatsapp-1',
					seenItemIds: ['p-buurt-whatsapp-1'],
					dueDate: TODAY,
					streak: 0,
					misses: 1,
					createdAt: TODAY,
					tamedAt: null
				}
			]
		});
		const id = selectTrapItem(state, 'echo', TODAY);
		expect(id?.startsWith('lezen-')).toBe(true);
		const found = findQuestion(id!);
		expect(found?.passage.slug).not.toBe('buurt-whatsapp');
		expect(found?.passage.year).not.toBe(2023);
	});

	it('relaxes 14 days to 3 days, then to any item', () => {
		const echoes = echoIds().filter((row) => row.year !== 2023 && row.slug !== 'buurt-whatsapp');
		expect(echoes.length).toBeGreaterThan(0);
		const recent = fork({
			traps: [
				{
					trap: 'echo',
					lastItemId: 'p-buurt-whatsapp-1',
					seenItemIds: ['p-buurt-whatsapp-1'],
					dueDate: TODAY,
					streak: 0,
					misses: 1,
					createdAt: TODAY,
					tamedAt: null
				}
			],
			attempts: echoes.map((row) => attempt(row.id, row.slug, addDays(TODAY, -10)))
		});
		const relaxed = selectTrapItem(recent, 'echo', TODAY);
		expect(relaxed?.startsWith('lezen-')).toBe(true);
		expect(itemAttemptedWithin(recent, relaxed!, 14, TODAY)).toBe(true);
		expect(itemAttemptedWithin(recent, relaxed!, 3, TODAY)).toBe(false);
		expect(findQuestion(relaxed!)?.passage.slug).not.toBe('buurt-whatsapp');

		const blocked = fork({
			...recent,
			attempts: echoIds()
				.filter((row) => row.year !== 2023)
				.map((row) => attempt(row.id, row.slug, addDays(TODAY, -1)))
		});
		const any = selectTrapItem(blocked, 'echo', TODAY);
		expect(any?.startsWith('p-')).toBe(true);
		expect(yearOf(any!)).not.toBe(2023);
	});
});

describe('micro-drills', () => {
	it('spot the lure prefers an open card and offers three trap kinds', () => {
		const state = fork({
			attempts: [attempt('p-buurt-whatsapp-1', 'buurt-whatsapp', TODAY)],
			traps: [
				{
					trap: 'echo',
					lastItemId: 'p-buurt-whatsapp-1',
					seenItemIds: ['p-buurt-whatsapp-1'],
					dueDate: TODAY,
					streak: 0,
					misses: 1,
					createdAt: TODAY,
					tamedAt: null
				}
			]
		});
		const lures = selectLures(state, TODAY);
		expect(lures.length).toBeGreaterThan(0);
		expect(lures[0].trap).toBe('echo');
		expect(lures[0].choices).toHaveLength(3);
		expect(new Set(lures[0].choices).size).toBe(3);
		expect(lures[0].choices).toContain('echo' satisfies TrapKind);
		expect(lures.every((row) => findPassage(row.slug)?.year !== 2023)).toBe(true);
		const choices = lureChoices('echo', 'seed');
		expect(choices).toHaveLength(3);
		expect(choices).toContain('echo');
	});

	it('holds a paraphrase until its official item has been attempted', () => {
		const seen = fork({
			attempts: [attempt('p-buurt-whatsapp-1', 'buurt-whatsapp', TODAY)]
		});
		expect(selectParaphraseDrills(seen, TODAY).map((row) => row.id)).toEqual([
			'pp-buurt-whatsapp-1'
		]);
		const unlocked = fork({
			attempts: [
				attempt('p-buurt-whatsapp-1', 'buurt-whatsapp', TODAY),
				attempt('lezen-2025-26', 'buurt-whatsapp', TODAY)
			]
		});
		expect(
			selectParaphraseDrills(unlocked, TODAY)
				.map((row) => row.id)
				.sort()
		).toEqual(['pp-buurt-whatsapp-1', 'pp-buurt-whatsapp-2']);
	});

	it('serves three items of a qtype, practice first, off the sealed paper', () => {
		const ids = selectQtypeItems(fork({}), 'oorzaak-reden', TODAY);
		expect(ids).toHaveLength(3);
		expect(ids[0].startsWith('p-')).toBe(true);
		expect(ids[1].startsWith('p-')).toBe(true);
		expect(ids[2].startsWith('lezen-')).toBe(true);
		for (const id of ids) {
			const year = findQuestion(id)?.passage.year ?? findPassage('buurt-whatsapp')?.year;
			expect(year).not.toBe(2023);
		}
		expect(selectQtypeItems(fork({}), 'oorzaak-reden', TODAY)).toEqual(ids);
	});
});

describe('debrief page', () => {
	const page = readFileSync(
		fileURLToPath(new URL('../../routes/cards/+page.svelte', import.meta.url)),
		'utf8'
	);

	it('matches the daily text label and grades the drill itself', () => {
		expect(page).toContain('Nothing to debrief. Finish the daily text.');
		expect(page).not.toContain("Finish today's text.");
		expect(page).toContain('Watch for:');
		expect(page).toContain('ReadingLoop');
		expect(page).not.toContain('Got the move');
		expect(page).not.toContain('Still shaky');
		expect(page).not.toContain('MissReview');
	});

	it('keeps the passage column beside the question', () => {
		const desk = readFileSync(
			fileURLToPath(new URL('../components/reading/ReadingLoop.svelte', import.meta.url)),
			'utf8'
		);
		expect(desk).toContain('minmax(0, 11fr) minmax(0, 6fr) minmax(0, 3fr)');
		expect(desk).toContain('grid-column: 1');
		expect(desk).toContain('grid-column: 2');
		expect(desk).toContain('Use a wider window.');
	});
});
