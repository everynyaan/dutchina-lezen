import { describe, it, expect } from 'vitest';
import { normalizeAnswer } from './normalizeAnswer';

describe('normalizeAnswer — trim', () => {
	it('removes leading and trailing whitespace', () => {
		expect(normalizeAnswer('  huis  ')).toBe('huis');
		expect(normalizeAnswer('  huis  ')).toBe(normalizeAnswer('huis'));
		expect(normalizeAnswer('huis')).toBe('huis');
	});
});

describe('normalizeAnswer — internal whitespace', () => {
	it('collapses multiple and mixed internal spaces to a single space', () => {
		expect(normalizeAnswer('het  huis')).toBe('huis');
		expect(normalizeAnswer('grote   blauwe  auto')).toBe('grote blauwe auto');
		expect(normalizeAnswer('foo \t  bar')).toBe('foo bar');
	});
});

describe('normalizeAnswer — lowercasing', () => {
	it('lowercases the entire string', () => {
		expect(normalizeAnswer('HUIS')).toBe('huis');
		expect(normalizeAnswer('HeT HuIs')).toBe('huis');
	});
});

describe('normalizeAnswer — trailing period', () => {
	it('strips a single trailing period', () => {
		expect(normalizeAnswer('huis.')).toBe('huis');
	});

	it('strips only one trailing period', () => {
		// Source strips a single endsWith('.') once → "huis.." becomes "huis."
		expect(normalizeAnswer('huis..')).toBe('huis.');
	});
});

describe('normalizeAnswer — leading articles', () => {
	it('strips de, het, and een when followed by a space', () => {
		expect(normalizeAnswer('de hond')).toBe('hond');
		expect(normalizeAnswer('het huis')).toBe('huis');
		expect(normalizeAnswer('een kat')).toBe('kat');
	});

	it('does not strip words that merely start with article letters', () => {
		expect(normalizeAnswer('deur')).toBe('deur');
		expect(normalizeAnswer('heten')).toBe('heten');
		expect(normalizeAnswer('eend')).toBe('eend');
	});
});

describe('normalizeAnswer — diacritics', () => {
	it('removes combining diacritical marks', () => {
		expect(normalizeAnswer('café')).toBe('cafe');
		expect(normalizeAnswer('één')).toBe('een');
	});
});

describe('normalizeAnswer — equivalence', () => {
	it('treats inputs that differ only by normalization rules as equal', () => {
		// Whitespace + case + article + trailing period
		expect(normalizeAnswer('  De  HOND.  ')).toBe(normalizeAnswer('de hond'));
		expect(normalizeAnswer('  De  HOND.  ')).toBe('hond');

		// Diacritics only
		expect(normalizeAnswer('café')).toBe(normalizeAnswer('cafe'));
		expect(normalizeAnswer('één')).toBe(normalizeAnswer('een'));
	});
});
