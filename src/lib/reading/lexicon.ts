import raw from './lexicon.json';
import type { LexRecord } from './lexiconBuild';

const records = raw as LexRecord[];

const byForm = new Map<string, LexRecord>();
for (const row of records) {
	if (!byForm.has(row.form)) byForm.set(row.form, row);
}

export type { LexRecord };

export function lexiconRecords(): readonly LexRecord[] {
	return records;
}

export function lookupForm(form: string): LexRecord | null {
	return byForm.get(form.toLowerCase().replaceAll('’', "'")) ?? null;
}

export function recordsForLemma(lemma: string): LexRecord[] {
	return records.filter((row) => row.lemma === lemma);
}
