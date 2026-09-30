import { describe, expect, it } from 'vitest';
import { recordMiss } from './traps';
import { EMPTY_READING_FORK } from './types';

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
