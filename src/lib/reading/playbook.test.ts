import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PLAN_LINE } from './readiness';
import {
	PLAYBOOK_MOVE,
	TIME_PLAN,
	moveSentenceCount,
	playbookYears,
	purposeGuide,
	purposeLine,
	qtypeCards,
	roleCards,
	signalGroups,
	trapCards
} from './playbook';

const home = readFileSync(
	fileURLToPath(new URL('../../routes/+page.svelte', import.meta.url)),
	'utf8'
);
const page = readFileSync(
	fileURLToPath(new URL('../../routes/playbook/+page.svelte', import.meta.url)),
	'utf8'
);
const layout = readFileSync(
	fileURLToPath(new URL('../../routes/+layout.svelte', import.meta.url)),
	'utf8'
);

describe('playbook', () => {
	it('gives every question type a short move, a count, an example, and practice', () => {
		const cards = qtypeCards();
		expect(cards).toHaveLength(13);
		expect(cards.reduce((sum, card) => sum + card.count, 0)).toBe(105);
		for (const card of cards) {
			expect(moveSentenceCount(PLAYBOOK_MOVE[card.qtype])).toBeGreaterThanOrEqual(2);
			expect(moveSentenceCount(PLAYBOOK_MOVE[card.qtype])).toBeLessThanOrEqual(3);
			if (card.count > 0) expect(card.example?.quote.length).toBeGreaterThan(10);
			expect(card.move).not.toContain('\u2014');
		}
		expect(cards.find((card) => card.qtype === 'niet-vraag')?.count).toBe(0);
		expect(page).toContain('Practice this');
		expect(page).not.toContain('PracticeBook');
	});

	it('shows two real lures for every trap', () => {
		for (const card of trapCards()) {
			expect(card.examples, card.trap).toHaveLength(2);
			expect(card.examples[0].lure.length).toBeGreaterThan(0);
			expect(card.examples[0].why.length).toBeGreaterThan(0);
		}
	});

	it('computes purpose questions and the time plan', () => {
		const guide = purposeGuide();
		expect(guide.passageCount).toBe(18);
		expect(guide.lastCount).toBeGreaterThan(0);
		expect(guide.keyed.length).toBeGreaterThan(0);
		expect(purposeLine(guide)).toContain('usually the last question');
		expect(TIME_PLAN).toBe(
			'About 18 minutes per text. Less on short texts. Keep 10 minutes for flagged items.'
		);
		expect(page).toContain('TIME_PLAN');
		expect(page).toContain('RULES_TEXT');
	});

	it('pulls signal words from the papers and roles from the packs', () => {
		const words = signalGroups().flatMap((group) => group.words);
		expect(words.map((hit) => hit.word)).toContain('daardoor');
		expect(words.find((hit) => hit.word === 'omdat')?.example).toBeTruthy();
		expect(words.find((hit) => hit.word === 'mits')?.example).toBeNull();
		const packed = roleCards().filter((role) => role.example);
		expect(packed.length).toBeGreaterThan(0);
		expect(packed.length).toBeLessThan(roleCards().length);
		expect(playbookYears()).toEqual([2025, 2024, 2023]);
	});

	it('is a tab, and Patterns stays a secondary link', () => {
		expect(layout).toContain("label: 'Playbook'");
		expect(layout).toContain("href: '/playbook'");
		expect(layout).toContain("href: '/grammar'");
		expect(page).toContain("resolve('/grammar')");
		expect(page).not.toContain('\u2014');
	});

	it('keeps the dated plan on the home, above the empty question types', () => {
		const readiness = home.split('class="readiness"')[1] ?? '';
		expect(readiness.indexOf('PLAN_LINE')).toBeGreaterThan(-1);
		expect(readiness.indexOf('PLAN_LINE')).toBeLessThan(readiness.indexOf('Question types'));
		expect(PLAN_LINE).toContain('Baseline official mock by 2026-10-12');
		expect(PLAN_LINE).toContain('Light review only from 2026-11-09');
		expect(home).not.toContain('PracticeBook');
	});
});
