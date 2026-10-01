import { describe, expect, it } from 'vitest';
import { allPassages, findPassage } from './bank';
import {
	addTrapEntry,
	addWordEntry,
	caseFacts,
	countsFor,
	noteEncounter,
	openedSlugs,
	paintWords,
	senseChecks,
	spendLookup,
	whereElse,
	wordMarks
} from './notebook';
import { EMPTY_NOTEBOOK, EMPTY_READING_FORK, type ReadingAttempt } from './types';

function attempt(slug: string): ReadingAttempt {
	return {
		itemId: 'x',
		origin: 'official',
		passageSlug: slug,
		source: 'texts',
		at: '2026-09-30',
		picked: 'A',
		correct: true,
		locateP: null,
		locateHit: null,
		ms: 0
	};
}

describe('notebook', () => {
	it('counts forms in this text and hides reserved papers from examples', () => {
		const slug = 'ruud-rij-instructeur';
		const passage = findPassage(slug);
		expect(passage).toBeTruthy();
		const counts = countsFor('werk', slug);
		expect(counts.inText).toBeGreaterThan(0);
		expect(counts.forms.some((row) => row.form === 'werk' || row.form === 'werken')).toBe(true);
		const sealed = findPassage('buurt-whatsapp');
		expect(sealed?.year).toBe(2025);
		const fork = {
			...EMPTY_READING_FORK,
			attempts: [attempt(slug), attempt('set1-horizon-college')]
		};
		expect(openedSlugs(fork).has('set1-horizon-college')).toBe(false);
		const sealedSlug = allPassages().find((row) => row.year === 2023)?.slug;
		expect(sealedSlug).toBeTruthy();
		const sealedFork = {
			...EMPTY_READING_FORK,
			attempts: [attempt(sealedSlug!)]
		};
		expect(openedSlugs(sealedFork).has(sealedSlug!)).toBe(false);
		const examples = whereElse('werk', openedSlugs(fork), slug);
		expect(examples.every((row) => row.slug !== slug)).toBe(true);
		expect(examples.every((row) => !row.slug.startsWith('set'))).toBe(true);
		for (const row of examples) {
			const doc = findPassage(row.slug);
			expect(doc?.year).not.toBe(2023);
		}
	});

	it('underlines a noted word in a later text and counts the meeting once', () => {
		const first = findPassage('ruud-rij-instructeur');
		const later = findPassage('buurt-whatsapp');
		expect(first && later).toBeTruthy();
		let notebook = addWordEntry(EMPTY_NOTEBOOK, {
			surface: 'een',
			quote: 'een',
			passageSlug: first!.slug,
			p: 0,
			note: 'my job note',
			now: '2026-09-01T00:00:00.000Z'
		});
		notebook = noteEncounter(notebook, later!.slug, later!.text, '2026-09-02T00:00:00.000Z');
		notebook = noteEncounter(notebook, later!.slug, later!.text, '2026-09-03T00:00:00.000Z');
		expect(notebook.entries[0].metSince).toBe(1);
		const marks = wordMarks(notebook, later!.slug, true);
		const painted = paintWords('ander een hier', marks);
		const hit = painted.find((part) => part.text.toLowerCase() === 'een');
		expect(hit?.tone).toBe('faint');
		expect(hit?.note).toBe('my job note');
		expect(painted.some((part) => part.note === 'to work')).toBe(false);
	});

	it('spends lookups only until the budget and still allows the meaning', () => {
		let notebook = EMPTY_NOTEBOOK;
		for (let i = 0; i < 7; i++) notebook = spendLookup(notebook, 'buurt-whatsapp', 5);
		expect(notebook.lookups['buurt-whatsapp']).toBe(5);
	});

	it('offers a trap once and checks meaning with Dutch definitions', () => {
		const notebook = addTrapEntry(EMPTY_NOTEBOOK, {
			question: 'Why?',
			passageSlug: 'ruud-rij-instructeur',
			p: 1,
			evidence: 'Ruud wordt rij-instructeur',
			trap: 'echo',
			itemId: 'lezen-2025-1',
			picked: 'B',
			why: 'The option repeats a word from the text.'
		});
		const again = addTrapEntry(notebook, {
			question: 'Why?',
			passageSlug: 'ruud-rij-instructeur',
			p: 1,
			evidence: 'Ruud wordt rij-instructeur',
			trap: 'echo',
			itemId: 'lezen-2025-1',
			picked: 'B',
			why: 'The option repeats a word from the text.'
		});
		expect(again.entries).toHaveLength(1);
		expect(again.entries[0].note).toContain('You picked B');
		const noted = addWordEntry(EMPTY_NOTEBOOK, {
			surface: 'werk',
			quote: 'werk',
			passageSlug: 'ruud-rij-instructeur',
			p: 0,
			note: ''
		});
		const fork = {
			...EMPTY_READING_FORK,
			attempts: [attempt('ruud-rij-instructeur'), attempt('buurt-whatsapp')],
			notebook: noted
		};
		const checks = senseChecks(noted, openedSlugs(fork));
		for (const check of checks) {
			expect(check.prompt).toBe('What does it mean here?');
			expect(check.choices.some((choice) => choice.right)).toBe(true);
			for (const choice of check.choices) {
				expect(choice).not.toHaveProperty('en');
				expect(choice.nl.split(/\s+/).length).toBeGreaterThan(2);
			}
		}
		expect(caseFacts('Als je 18 jaar bent, mag je alleen als je een pas hebt.')).toEqual(
			expect.arrayContaining(['18 jaar', 'als', 'alleen als'])
		);
	});
});
