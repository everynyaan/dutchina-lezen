import { describe, expect, it } from 'vitest';
import { dueTraps, gradeTrap, recordMiss } from './traps';
import { EMPTY_READING_FORK, type TrapCardV2 } from './types';

describe('recordMiss', () => {
	it('opens one card per trap and resets it on the next miss', () => {
		const today = '2026-09-30';
		const once = recordMiss(EMPTY_READING_FORK, 'p-buurt-whatsapp-1', 'B', today);
		expect(once.traps).toEqual([
			{
				trap: 'echo',
				lastItemId: 'p-buurt-whatsapp-1',
				seenItemIds: ['p-buurt-whatsapp-1'],
				dueDate: today,
				streak: 0,
				misses: 1,
				createdAt: today,
				tamedAt: null
			}
		]);
		const again = recordMiss(once, 'p-buurt-whatsapp-2', 'A', today);
		expect(again.traps).toHaveLength(1);
		expect(again.traps[0]).toMatchObject({
			trap: 'echo',
			lastItemId: 'p-buurt-whatsapp-2',
			misses: 2,
			streak: 0,
			tamedAt: null,
			dueDate: today
		});
		expect(again.traps[0].seenItemIds).toEqual(['p-buurt-whatsapp-1', 'p-buurt-whatsapp-2']);
		const other = recordMiss(again, 'p-buurt-whatsapp-1', 'C', today);
		expect(other.traps.map((card) => card.trap).sort()).toEqual(['echo', 'niet-in-tekst']);
	});

	it('leaves the fork alone when the pick has no trap', () => {
		expect(recordMiss(EMPTY_READING_FORK, 'p-buurt-whatsapp-1', 'A', '2026-09-30')).toBe(
			EMPTY_READING_FORK
		);
	});
});

describe('gradeTrap', () => {
	const today = '2026-09-30';
	const card: TrapCardV2 = {
		trap: 'echo',
		lastItemId: 'p-buurt-whatsapp-1',
		seenItemIds: ['p-buurt-whatsapp-1'],
		dueDate: today,
		streak: 0,
		misses: 1,
		createdAt: today,
		tamedAt: null
	};

	it('spaces a correct streak by 1, 3, then 7 days and tames the third', () => {
		const once = gradeTrap(card, true, today);
		expect(once).toMatchObject({ streak: 1, dueDate: '2026-10-01', tamedAt: null });
		const twice = gradeTrap(once, true, once.dueDate);
		expect(twice).toMatchObject({ streak: 2, dueDate: '2026-10-04', tamedAt: null });
		const tamed = gradeTrap(twice, true, twice.dueDate);
		expect(tamed).toMatchObject({ streak: 3, dueDate: '2026-10-11', tamedAt: twice.dueDate });
	});

	it('a wrong answer is due tomorrow and is not learned', () => {
		const tamed = { ...card, streak: 3, tamedAt: today };
		const missed = gradeTrap(tamed, false, today);
		expect(missed).toMatchObject({ streak: 0, dueDate: '2026-10-01', tamedAt: null });
	});

	it('lists only cards that are due', () => {
		const later = { ...card, trap: 'overdreven' as const, dueDate: '2026-10-02' };
		const older = { ...card, trap: 'te-smal' as const, dueDate: '2026-09-28', misses: 4 };
		const fork = { ...EMPTY_READING_FORK, traps: [later, card, older] };
		expect(dueTraps(fork, today).map((row) => row.trap)).toEqual(['te-smal', 'echo']);
	});
});
