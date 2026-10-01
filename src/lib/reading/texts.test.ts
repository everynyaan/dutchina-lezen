import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findPassage } from './bank';
import { recentOfficial, seenLabel, seenTimes } from './texts';
import { EMPTY_READING_FORK, type ReadingAttempt, type ReadingForkState } from './types';

function attempt(
	partial: Partial<ReadingAttempt> & Pick<ReadingAttempt, 'itemId' | 'at' | 'passageSlug'>
): ReadingAttempt {
	return {
		origin: 'official',
		source: 'texts',
		picked: 'A',
		correct: true,
		locateP: null,
		locateHit: null,
		ms: 0,
		...partial
	};
}

function fork(attempts: ReadingAttempt[]): ReadingForkState {
	return { ...EMPTY_READING_FORK, attempts };
}

describe('full-text practice', () => {
	const passage = findPassage('buurt-whatsapp');
	if (!passage) throw new Error('missing buurt-whatsapp');

	it('counts distinct days a passage was seen', () => {
		const state = fork([
			attempt({ itemId: 'lezen-2025-24', at: '2026-09-01', passageSlug: 'buurt-whatsapp' }),
			attempt({
				itemId: 'lezen-2025-25',
				at: '2026-09-01T18:00:00',
				passageSlug: 'buurt-whatsapp'
			}),
			attempt({ itemId: 'lezen-2025-24', at: '2026-09-10', passageSlug: 'buurt-whatsapp' }),
			attempt({ itemId: 'lezen-2024-1', at: '2026-09-10', passageSlug: 'bakkerij' })
		]);
		expect(seenTimes(state, 'buurt-whatsapp')).toBe(2);
		expect(seenTimes(state, 'bakkerij')).toBe(1);
		expect(seenTimes(state, 'missing')).toBe(0);
		expect(seenLabel(0)).toBe('Seen 0 times');
		expect(seenLabel(1)).toBe('Seen 1 time');
		expect(seenLabel(2)).toBe('Seen 2 times');
	});

	it('warns when an official item was answered in the last 21 days', () => {
		const id = passage.questions[0].id;
		const recent = fork([attempt({ itemId: id, at: '2026-09-20', passageSlug: passage.slug })]);
		const stale = fork([attempt({ itemId: id, at: '2026-09-01', passageSlug: passage.slug })]);
		expect(recentOfficial(recent, passage, '2026-09-30')).toBe(true);
		expect(recentOfficial(stale, passage, '2026-09-30')).toBe(false);
		expect(recentOfficial(fork([]), passage, '2026-09-30')).toBe(false);
	});
});

describe('texts page', () => {
	const page = readFileSync(
		fileURLToPath(new URL('../../routes/lezen/+page.svelte', import.meta.url)),
		'utf8'
	);

	it('uses the reading loop and drops LP and mission calls', () => {
		expect(page).toContain('ReadingLoop');
		expect(page).toContain('QuestionBlock');
		expect(page).toContain('flaggable');
		expect(page).toContain("source: 'texts'");
		expect(page).toContain('Exam style: feedback at the end');
		expect(page).toContain('sealed for your mock on 12 Oct');
		expect(page).toContain('You answered these recently. Try the practice questions instead.');
		expect(page).toContain('There are no practice questions for this text.');
		expect(page).toContain('seenLabel');
		expect(page).not.toContain('BOOKLET_PASS_LABEL');
		expect(page).toContain('PracticeBook');
		expect(page).not.toContain('applyLpEvent');
		expect(page).not.toContain('updateMissions');
		expect(page).not.toMatch(/questionResults\s*=/);
		expect(page).not.toMatch(/questionResults\s*\[/);
		expect(page).not.toContain('splitIntoParagraphs');
		expect(page).not.toContain('Van Dale');
		expect(page).not.toContain('\u2014');
		expect(page).not.toContain('\u2013');
	});
});
