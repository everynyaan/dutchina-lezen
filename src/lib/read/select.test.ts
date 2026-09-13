import { describe, it, expect } from 'vitest';
import { selectRead } from './select';
import type { DailyRead } from './types';

function makePool(n: number): DailyRead[] {
	return Array.from({ length: n }, (_, i) => ({
		id: `f${String(i + 1).padStart(3, '0')}`,
		tag: 'culture' as const,
		title: `Titel ${i + 1}`,
		titleEn: `Title ${i + 1}`,
		lines: [{ nl: `nl-${i + 1}`, en: `en-${i + 1}` }]
	}));
}

describe('selectRead', () => {
	it('is deterministic for the same (profile, date)', () => {
		const pool = makePool(12);
		const a = selectRead(pool, 'read', '2026-08-15');
		const b = selectRead(pool, 'read', '2026-08-15');
		const c = selectRead(pool, 'read', '2026-08-15');
		expect(a).not.toBeNull();
		expect(a!.id).toBe(b!.id);
		expect(b!.id).toBe(c!.id);
	});

	it('varies across different dates', () => {
		const pool = makePool(12);
		const dates = [
			'2026-08-01',
			'2026-08-02',
			'2026-08-03',
			'2026-08-04',
			'2026-08-05',
			'2026-08-06',
			'2026-08-07',
			'2026-08-08',
			'2026-08-09',
			'2026-08-10'
		];
		const ids = dates.map((d) => selectRead(pool, 'read', d)?.id);
		const distinct = new Set(ids.filter(Boolean));
		expect(distinct.size).toBeGreaterThan(1);
	});

	it('returns null for an empty pool', () => {
		expect(selectRead([], 'profileA', '2026-08-15')).toBeNull();
	});

	it('always returns a member of the input pool', () => {
		const pool = makePool(12);
		const dates = ['2026-08-01', '2026-08-05', '2026-08-10', '2026-09-01', '2026-12-25'];
		for (const date of dates) {
			const result = selectRead(pool, 'read', date);
			expect(result).not.toBeNull();
			expect(pool.some((r) => r.id === result!.id)).toBe(true);
		}
	});
});
