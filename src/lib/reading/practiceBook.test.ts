import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import PracticeBook from '$lib/components/reading/PracticeBook.svelte';
import PracticeBookHost from '$lib/components/reading/practiceBook.host.svelte';
import {
	bookEntries,
	entries,
	entryFor,
	openedBook,
	wordsForLetter
} from './practiceBook';

const bookSrc = readFileSync(
	fileURLToPath(new URL('../components/reading/PracticeBook.svelte', import.meta.url)),
	'utf8'
);
const timeSrc = readFileSync(
	fileURLToPath(new URL('../components/reading/TimeBox.svelte', import.meta.url)),
	'utf8'
);
const passageSrc = readFileSync(
	fileURLToPath(new URL('../components/reading/PassageText.svelte', import.meta.url)),
	'utf8'
);

const ENGLISH_WORD = /\b(the|a|an)\b/i;

function tokens(text: string): Set<string> {
	return new Set([...text.toLowerCase().matchAll(/\p{L}+/gu)].map((match) => match[0]));
}

describe('practice book', () => {
	it('has no search box', () => {
		expect(bookSrc.includes('<input')).toBe(false);
		const { body } = render(PracticeBook, { props: { years: [2024, 2025] } });
		expect(body.includes('<input')).toBe(false);
		expect(body).toContain('Book');
	});

	it('does not stem geschoold to scholen', () => {
		expect(entryFor('scholen')?.headword).toBe('scholen');
		expect(entryFor('geschoold')).toBeNull();
		expect(entryFor('Geschoold!')).toBeNull();
		expect(entries.some((entry) => entry.headword === 'geschoold')).toBe(false);
	});

	it('lists S in Dutch order, each word starting with s', () => {
		const words = wordsForLetter('s').map((entry) => entry.headword);
		expect(words.length).toBeGreaterThan(0);
		expect(words).toEqual([...words].sort((a, b) => a.localeCompare(b, 'nl')));
		expect(words.every((word) => word.toLocaleLowerCase('nl').startsWith('s'))).toBe(true);
	});

	it('opens on A with no remembered word and does not change answers or flags', () => {
		expect(openedBook()).toEqual({ letter: 'A', headword: null });
		expect(bookSrc).toContain('openedBook()');
		expect(bookSrc).not.toMatch(/\banswers\b/);
		expect(bookSrc).not.toMatch(/\bflagged\b/);
		const answers = { 'lezen-2025-1': 'A' };
		const flagged = { 'lezen-2025-1': true };
		const { body } = render(PracticeBookHost, { props: { answers, flagged } });
		expect(body).toContain(JSON.stringify({ answers, flagged }));
		expect(body).toContain('Book');
		expect(body).not.toContain('timmerman');
	});

	it('keeps Dutch glosses and keeps examples out of the exam passages', () => {
		const all = bookEntries([2023, 2024, 2025]);
		const passages = LEZEN_EXAMS.flatMap((exam) => exam.passages.map((passage) => passage.text));
		for (const entry of all) {
			expect(entry.gloss).not.toMatch(ENGLISH_WORD);
			expect(entry.example ?? '').not.toMatch(ENGLISH_WORD);
			for (const text of passages) {
				expect(text.includes(entry.gloss)).toBe(false);
				if (entry.example) expect(text.includes(entry.example)).toBe(false);
			}
		}
	});

	it('hides 2023-only headwords while that paper is sealed', () => {
		expect(entryFor('ondernemingsraad')).toBeNull();
		expect(entryFor('cursusgeld')?.headword).toBe('cursusgeld');
		expect(entryFor('ondernemingsraad', [2023, 2024, 2025])?.headword).toBe('ondernemingsraad');
		const openTokens = new Set<string>();
		const allTokens = new Set<string>();
		for (const exam of LEZEN_EXAMS) {
			for (const passage of exam.passages) {
				for (const token of tokens(passage.text)) {
					allTokens.add(token);
					if (exam.year !== 2023) openTokens.add(token);
				}
			}
		}
		for (const entry of entries) {
			if (entry.headword === 'scholen') continue;
			expect(openTokens.has(entry.headword)).toBe(true);
		}
		expect(allTokens.has('ondernemingsraad')).toBe(true);
		expect(openTokens.has('ondernemingsraad')).toBe(false);
	});

	it('leaves the clock without a pause API and the passage without lookup', () => {
		expect(timeSrc).not.toMatch(/pause/);
		expect(passageSrc).not.toContain('practiceBook');
		expect(passageSrc).not.toContain('entryFor');
	});
});
