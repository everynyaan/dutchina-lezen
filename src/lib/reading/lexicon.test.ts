import { describe, expect, it } from 'vitest';
import { formStats } from './bankCorpus';
import { assertLexicon } from './lexiconBuild';
import { lexiconRecords, lookupForm } from './lexicon';

describe('lexicon', () => {
	it('has one record for every form in the bank', () => {
		const stats = formStats();
		const records = [...lexiconRecords()];
		expect(assertLexicon(stats, records)).toEqual([]);
		expect(records.length).toBeGreaterThanOrEqual(stats.length);
	});

	it('marks signal words and keeps names undefined', () => {
		const omdat = lookupForm('omdat');
		expect(omdat?.signal).toBe(true);
		expect(omdat?.nl).toContain('reden');
		const name = lexiconRecords().find((row) => row.pos === 'name');
		expect(name).toBeTruthy();
		expect(name?.nl).toBeUndefined();
		expect(name?.en).toBeUndefined();
		expect(lookupForm('op zichzelf')?.pos).toBe('expr');
	});
});
