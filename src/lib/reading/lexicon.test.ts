import { describe, expect, it } from 'vitest';
import { formStats } from './bankCorpus';
import { countsFor } from './notebook';
import { lexiconRecords, lookupForm, recordsForHead, recordsForLemma } from './lexicon';

describe('lexicon', () => {
	it('has one record for every form in the bank', () => {
		const stats = formStats();
		const records = [...lexiconRecords()];
		const byForm = new Map<string, number>();
		for (const row of records) byForm.set(row.form, (byForm.get(row.form) ?? 0) + 1);
		const missing = stats.filter((stat) => byForm.get(stat.form) !== 1).map((stat) => stat.form);
		expect(missing).toEqual([]);
		expect(records).toHaveLength(4739);
		expect(records.length).toBeGreaterThanOrEqual(stats.length);
	});

	it('marks signal words, keeps names undefined, and stores expressions', () => {
		const omdat = lookupForm('omdat');
		expect(omdat?.signal).toBe(true);
		expect(omdat?.nl).toContain('reden');
		const name = lexiconRecords().find((row) => row.pos === 'name');
		expect(name).toBeTruthy();
		expect(name?.nl ?? null).toBeNull();
		expect(name?.en ?? null).toBeNull();
		const expr = lookupForm('op zichzelf');
		expect(expr?.pos).toBe('expr');
		expect(expr?.form.split(' ').length).toBeGreaterThan(1);
		expect(lexiconRecords().some((row) => row.head)).toBe(true);
		expect(
			lexiconRecords()
				.filter((row) => row.pos === 'expr')
				.every((row) => row.form.includes(' '))
		).toBe(true);
	});

	it('counts a compound under its own lemma and groups siblings by head', () => {
		const compound = lexiconRecords().find(
			(row) => row.head && row.head !== row.lemma && row.form === row.lemma
		);
		expect(compound?.head).toBeTruthy();
		const own = new Set(recordsForLemma(compound!.lemma).map((row) => row.form));
		const grouped = recordsForHead(compound!.head!);
		expect(grouped.some((row) => row.lemma !== compound!.lemma)).toBe(true);
		const counts = countsFor(compound!.lemma, 'ruud-rij-instructeur');
		for (const row of counts.forms) expect(own.has(row.form)).toBe(true);
		const sibling = grouped.find((row) => row.lemma !== compound!.lemma && !own.has(row.form));
		expect(sibling).toBeTruthy();
		expect(counts.forms.some((row) => row.form === sibling!.form)).toBe(false);
	});
});
