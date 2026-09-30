import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	allPackProblems,
	packSlugs,
	paragraphMapFor,
	paraphraseFor,
	passagesMissingPacks,
	practiceItemsFor
} from './practice';

describe('practice packs', () => {
	it('validates every pack that has arrived', () => {
		expect(packSlugs()).toEqual(['buurt-whatsapp']);
		expect(allPackProblems()).toEqual([]);
	});

	it('resolves the buurt-whatsapp sample against the live passage', () => {
		const items = practiceItemsFor('buurt-whatsapp');
		expect(items).toHaveLength(7);
		expect(items.filter((item) => item.qtype === 'betekenis-in-context')).toHaveLength(2);
		expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
		expect(items.every((item) => Object.keys(item.options).sort().join('') === 'ABC')).toBe(true);
		expect(paragraphMapFor('buurt-whatsapp').map((entry) => entry.p)).toEqual([1, 3, 5, 7]);
		const drills = paraphraseFor('buurt-whatsapp');
		expect(drills).toHaveLength(2);
		expect(drills[1]?.afterItemId).toBe('lezen-2025-26');
		expect(drills[1]?.source.p).toBe(5);
	});

	it('returns nothing for a passage that has no pack yet', () => {
		expect(practiceItemsFor('bakkerij')).toEqual([]);
		expect(paragraphMapFor('bakkerij')).toEqual([]);
		expect(paraphraseFor('bakkerij')).toEqual([]);
		expect(passagesMissingPacks()).toHaveLength(17);
		expect(passagesMissingPacks()).not.toContain('buurt-whatsapp');
	});

	it('has no em dashes in the sample pack or the practice brief', () => {
		const brief = readFileSync(new URL('../../../docs/PRACTICE_BRIEF.md', import.meta.url), 'utf8');
		const pack = readFileSync(new URL('./practice/buurt-whatsapp.json', import.meta.url), 'utf8');
		expect(brief.includes('\u2014')).toBe(false);
		expect(pack.includes('\u2014')).toBe(false);
	});
});
