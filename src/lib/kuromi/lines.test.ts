import { describe, expect, it } from 'vitest';
import { APPROVED_REFLEX, REFLEX_GAPS, WIFI_FALLBACK, reflexLine } from './lines';

describe('reflex lines', () => {
	it('keeps the wifi fallback as the exact spec sentence', () => {
		expect(WIFI_FALLBACK).toBe('the wifi is Dutch today');
		expect(reflexLine('wifi-fallback')).toBe(WIFI_FALLBACK);
	});

	it('returns only approved spec wording', () => {
		expect(reflexLine('miss-ask')).toBe('what in the sentence would have told her');
		expect(reflexLine('teaching')).toBe(APPROVED_REFLEX.teaching);
		expect(reflexLine('locate-example')).toBe(
			'it is in a paragraph that states a rule, not in the example'
		);
		expect(reflexLine('ask-label')).toBe('Ask Kuromi');
		expect(reflexLine('hint-label')).toBe('Hint');
	});

	it('leaves every unwritten moment empty for Eyad', () => {
		for (const id of REFLEX_GAPS) {
			expect(reflexLine(id), id).toBeNull();
		}
		expect(reflexLine('made-up-voice')).toBeNull();
	});
});
