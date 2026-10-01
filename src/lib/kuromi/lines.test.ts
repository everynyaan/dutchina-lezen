import { describe, expect, it } from 'vitest';
import {
	APPROVED_REFLEX,
	BEFORE_ANSWER_SLOTS,
	WIFI_FALLBACK,
	canRenderBeforeAnswer,
	reflexBeforeAnswer,
	reflexLine,
	reflexSlots
} from './lines';

const FILLED = {
	itemId: 'lezen-2025-1',
	date: '2026-10-01',
	genre: 'rules text',
	paragraphs: 'six',
	minutes: 'fifteen',
	role: 'states-rule',
	lure: 'echo',
	trap: 'echo',
	score: '2',
	total: '3',
	move: 'read the question first',
	explanation: 'Watch the words.',
	passLine: '24',
	target: '25',
	attempts: '12',
	weakestType: 'detail',
	times: '3',
	left: '2'
};

describe('reflex lines', () => {
	it('keeps the wifi fallback as the exact spec sentence', () => {
		expect(WIFI_FALLBACK).toBe('the wifi is Dutch today');
		expect(reflexLine('wifi-fallback')).toBe(WIFI_FALLBACK);
	});

	it('returns only approved spec wording for the short labels', () => {
		expect(reflexLine('miss-ask')).toBe('what in the sentence would have told her');
		expect(reflexLine('teaching')).toBe(APPROVED_REFLEX.teaching);
		expect(reflexLine('locate-example')).toBe(
			'it is in a paragraph that states a rule, not in the example'
		);
		expect(reflexLine('ask-label')).toBe('Ask Kuromi');
		expect(reflexLine('hint-label')).toBe('Hint');
		expect(reflexLine('made-up-voice')).toBeNull();
	});

	it('resolves every authored slot from a stable seed', () => {
		const slots = reflexSlots();
		expect(slots.length).toBeGreaterThan(8);
		for (const path of slots) {
			const line = reflexLine(path, FILLED);
			expect(line, path).toBeTruthy();
			expect(line, path).not.toContain('{');
			expect(line, path).not.toContain('lezen-2025-1');
			expect(line, path).not.toContain('states-rule');
			expect(line, path).not.toContain('\u2014');
			expect(reflexLine(path, FILLED)).toBe(line);
		}
		expect(reflexLine('daily-open', { ...FILLED, itemId: 'lezen-2025-2' })).not.toBeUndefined();
	});

	it('capitalises a placeholder that starts a sentence and finishes a move', () => {
		const seen = new Set<string>();
		for (let day = 1; day <= 31; day++) {
			const line = reflexLine('daily-open', {
				...FILLED,
				date: `2026-10-${String(day).padStart(2, '0')}`
			});
			expect(line).toBeTruthy();
			expect(line!.startsWith('rules text')).toBe(false);
			seen.add(line!);
		}
		expect([...seen].some((line) => line.startsWith('Rules text'))).toBe(true);
		const done = reflexLine('done-card', FILLED);
		expect(done).toMatch(/Read the question first\./);
		expect(done).not.toContain('read the question first');
	});

	it('uses human labels and lets only the open slots render before an answer', () => {
		const intro = reflexBeforeAnswer('drill-intro', FILLED);
		expect(intro).toBeTruthy();
		expect(intro).toContain('Echo');
		expect(intro).not.toMatch(/\becho\b/);
		const comment = reflexBeforeAnswer('map-comment.right', FILLED);
		expect(comment).toContain('States a rule');
		expect(comment).not.toContain('states-rule');
		expect(reflexBeforeAnswer('miss-reaction', FILLED)).toBeNull();
		expect(reflexBeforeAnswer('right-reaction', FILLED)).toBeNull();
		expect(reflexBeforeAnswer('done-card', FILLED)).toBeNull();
		expect(reflexBeforeAnswer('drill-reaction.wrong', FILLED)).toBeNull();
		expect(reflexBeforeAnswer('card-tamed', FILLED)).toBeNull();
		expect(reflexBeforeAnswer('mock-debrief.open', FILLED)).toBeNull();
		for (const slot of BEFORE_ANSWER_SLOTS) {
			expect(canRenderBeforeAnswer(slot), slot).toBe(true);
		}
		const roots = new Set(reflexSlots().map((path) => path.split('.')[0]));
		for (const root of roots) {
			expect(canRenderBeforeAnswer(root)).toBe(
				(BEFORE_ANSWER_SLOTS as readonly string[]).includes(root)
			);
		}
		expect(reflexLine('miss-reaction', FILLED)).toContain('Echo');
		expect(reflexLine('monday-message', FILLED)).toContain('Find the fact');
	});
});
