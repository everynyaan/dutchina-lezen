import { describe, it, expect } from 'vitest';
import { upsertPageIn, removePageFrom, setArchivedIn, labelsInUse, filterPages } from './pageStore';
import type { KuromiPage, PageBlockNote } from '$lib/state/schema';

function page(overrides: Partial<KuromiPage> = {}): KuromiPage {
	const note = { type: 'note', body: 'x' } as const satisfies PageBlockNote;
	return {
		id: 'p1',
		title: 'Title',
		quip: 'Quip',
		labels: [],
		blocks: [note],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		archived: false,
		...overrides
	};
}

describe('upsertPageIn', () => {
	it('appends a new page', () => {
		const a = page({ id: 'a' });
		const b = page({ id: 'b', title: 'B' });
		const result = upsertPageIn([a], b);
		expect(result).toHaveLength(2);
		expect(result[1]).toBe(b);
		expect(result[0]).toBe(a);
	});

	it('replaces an existing page by id, preserving position', () => {
		const a = page({ id: 'a' });
		const b = page({ id: 'b', title: 'B' });
		const c = page({ id: 'c' });
		const b2 = page({ id: 'b', title: 'B2' });
		const result = upsertPageIn([a, b, c], b2);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe(a);
		expect(result[1]).toEqual(b2);
		expect(result[2]).toBe(c);
	});

	it('does not mutate the input array', () => {
		const a = page({ id: 'a' });
		const input = [a];
		const snapshot = [...input];
		const result = upsertPageIn(input, page({ id: 'b' }));
		expect(input).toEqual(snapshot);
		expect(result).not.toBe(input);
	});
});

describe('removePageFrom', () => {
	it('removes the matching page', () => {
		const a = page({ id: 'a' });
		const b = page({ id: 'b' });
		expect(removePageFrom([a, b], 'a')).toEqual([b]);
	});

	it('returns an equivalent new array when id is not found', () => {
		const a = page({ id: 'a' });
		const input = [a];
		const result = removePageFrom(input, 'missing');
		expect(result).toEqual(input);
		expect(result).not.toBe(input);
	});

	it('does not mutate the input array', () => {
		const a = page({ id: 'a' });
		const b = page({ id: 'b' });
		const input = [a, b];
		const snapshot = [...input];
		removePageFrom(input, 'a');
		expect(input).toEqual(snapshot);
	});
});

describe('setArchivedIn', () => {
	const now = '2026-06-15T12:00:00.000Z';

	it('sets archived true and updatedAt to nowISO', () => {
		const a = page({ id: 'a', archived: false });
		const result = setArchivedIn([a], 'a', true, now);
		expect(result[0].archived).toBe(true);
		expect(result[0].updatedAt).toBe(now);
	});

	it('sets archived false and updatedAt to nowISO', () => {
		const a = page({ id: 'a', archived: true });
		const result = setArchivedIn([a], 'a', false, now);
		expect(result[0].archived).toBe(false);
		expect(result[0].updatedAt).toBe(now);
	});

	it('returns an equivalent new array when id is not found', () => {
		const a = page({ id: 'a' });
		const input = [a];
		const result = setArchivedIn(input, 'missing', true, now);
		expect(result).toEqual(input);
		expect(result).not.toBe(input);
		expect(result[0]).toBe(a);
	});

	it('does not mutate the input array or page', () => {
		const a = page({ id: 'a', archived: false });
		const input = [a];
		const snapshot = structuredClone(input);
		setArchivedIn(input, 'a', true, now);
		expect(input).toEqual(snapshot);
		expect(a.archived).toBe(false);
	});
});

describe('labelsInUse', () => {
	it('dedupes and sorts alphabetically', () => {
		const pages = [
			page({ id: '1', labels: ['vocab', 'grammar'] }),
			page({ id: '2', labels: ['grammar', 'phrases'] })
		];
		expect(labelsInUse(pages)).toEqual(['grammar', 'phrases', 'vocab']);
	});

	it('only counts active pages', () => {
		const pages = [
			page({ id: '1', labels: ['grammar'], archived: false }),
			page({ id: '2', labels: ['archived-only'], archived: true })
		];
		expect(labelsInUse(pages)).toEqual(['grammar']);
		expect(labelsInUse(pages)).not.toContain('archived-only');
	});

	it('treats missing/non-boolean archived as active', () => {
		const broken = page({ id: '1', labels: ['orphan'] });
		delete (broken as { archived?: boolean }).archived;
		expect(labelsInUse([broken])).toEqual(['orphan']);

		const weird = page({ id: '2', labels: ['weird'] });
		(weird as { archived: unknown }).archived = 'yes';
		expect(labelsInUse([weird])).toEqual(['weird']);
	});
});

describe('filterPages', () => {
	const fixture = [
		page({
			id: 'both',
			title: 'Word Order',
			quip: 'SVO basics',
			labels: ['grammar', 'phrases'],
			archived: false
		}),
		page({
			id: 'one',
			title: 'House words',
			quip: 'vocab drill',
			labels: ['grammar'],
			archived: false
		}),
		page({
			id: 'arch',
			title: 'Old Order',
			quip: 'retired',
			labels: ['grammar', 'phrases'],
			archived: true
		}),
		page({
			id: 'other',
			title: 'Listening tip',
			quip: 'hear it',
			labels: ['listening'],
			archived: false
		})
	];

	it('applies labels with AND semantics', () => {
		const result = filterPages(fixture, {
			labels: ['grammar', 'phrases'],
			query: '',
			archived: false
		});
		expect(result.map((p) => p.id)).toEqual(['both']);
	});

	it('matches query against title, quip, and labels case-insensitively', () => {
		expect(
			filterPages(fixture, { labels: [], query: 'word order', archived: false }).map((p) => p.id)
		).toEqual(['both']);
		expect(
			filterPages(fixture, { labels: [], query: 'SVO', archived: false }).map((p) => p.id)
		).toEqual(['both']);
		expect(
			filterPages(fixture, { labels: [], query: 'LISTEN', archived: false }).map((p) => p.id)
		).toEqual(['other']);
	});

	it('empty/whitespace query passes everything (subject to other filters)', () => {
		const result = filterPages(fixture, { labels: [], query: '   ', archived: false });
		expect(result.map((p) => p.id)).toEqual(['both', 'one', 'other']);
	});

	it('partitions by archived true/false', () => {
		expect(
			filterPages(fixture, { labels: [], query: '', archived: false }).map((p) => p.id)
		).toEqual(['both', 'one', 'other']);
		expect(
			filterPages(fixture, { labels: [], query: '', archived: true }).map((p) => p.id)
		).toEqual(['arch']);
	});

	it('combines label + query + archived together', () => {
		const result = filterPages(fixture, {
			labels: ['grammar', 'phrases'],
			query: 'order',
			archived: true
		});
		expect(result.map((p) => p.id)).toEqual(['arch']);
	});
});
