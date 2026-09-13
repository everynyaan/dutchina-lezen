import { describe, it, expect } from 'vitest';
import { buildPageAnnouncement } from './announce';
import type { KuromiPage } from '$lib/state/schema';
import type { KuromiToolCall, StewardToolResult } from '$lib/kuromi/types';

function page(overrides: Partial<KuromiPage> = {}): KuromiPage {
	return {
		id: 'p1',
		title: 'My Notes',
		quip: '',
		labels: [],
		blocks: [],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		archived: false,
		...overrides
	};
}

function call(overrides: Partial<KuromiToolCall> = {}): KuromiToolCall {
	return {
		id: 'tc1',
		name: 'create_page',
		arguments: JSON.stringify({ id: 'p1' }),
		...overrides
	};
}

function result(overrides: Partial<StewardToolResult> = {}): StewardToolResult {
	return {
		id: 'tc1',
		outcome: 'applied',
		detail: 'ok',
		...overrides
	};
}

describe('buildPageAnnouncement', () => {
	it('announces create_page + applied with matching page', () => {
		const pages = [page({ id: 'p1', title: 'My Notes' })];
		const ann = buildPageAnnouncement(result({ outcome: 'applied' }), call(), pages);
		expect(ann).not.toBeNull();
		expect(ann!.href).toBe('/kuromi/shelf/p1');
		expect(ann!.pageTitle).toBe('My Notes');
		expect(ann!.text.length).toBeGreaterThan(0);
	});

	it('still announces when outcome is capped', () => {
		const pages = [page()];
		const ann = buildPageAnnouncement(result({ outcome: 'capped' }), call(), pages);
		expect(ann).not.toBeNull();
		expect(ann!.href).toBe('/kuromi/shelf/p1');
	});

	it('returns null when outcome is rejected', () => {
		const pages = [page()];
		expect(buildPageAnnouncement(result({ outcome: 'rejected' }), call(), pages)).toBeNull();
	});

	it('returns null for a non-page tool even with a matching id', () => {
		const pages = [page()];
		const nonPage = call({ name: 'award_lp', arguments: JSON.stringify({ id: 'p1' }) });
		expect(buildPageAnnouncement(result(), nonPage, pages)).toBeNull();
	});

	it('returns null when id is absent from pages', () => {
		expect(buildPageAnnouncement(result(), call(), [])).toBeNull();
	});

	it('returns null on malformed JSON without throwing', () => {
		expect(() =>
			buildPageAnnouncement(result(), call({ arguments: '{not-json' }), [page()])
		).not.toThrow();
		expect(buildPageAnnouncement(result(), call({ arguments: '{not-json' }), [page()])).toBeNull();
	});

	it("href matches '/kuromi/shelf/<id>' exactly (no trailing slash, no query)", () => {
		const pages = [page({ id: 'abc-123' })];
		const ann = buildPageAnnouncement(
			result(),
			call({ arguments: JSON.stringify({ id: 'abc-123' }) }),
			pages
		);
		expect(ann).not.toBeNull();
		expect(ann!.href).toBe('/kuromi/shelf/abc-123');
		expect(ann!.href.endsWith('/')).toBe(false);
		expect(ann!.href.includes('?')).toBe(false);
	});
});
