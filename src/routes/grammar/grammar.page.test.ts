import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GRAMMAR_CONTENT } from '$lib/grammar/GRAMMAR_CONTENT';

const pageSrc = readFileSync(fileURLToPath(new URL('./+page.svelte', import.meta.url)), 'utf8');

describe('patterns handbook page', () => {
	it('is the full book, not a four-gate homework picker', () => {
		expect(pageSrc).not.toContain('GateBrowseFilter');
		expect(pageSrc).not.toContain('Homework stays');
		expect(pageSrc).not.toContain('currentGateFromState');
		expect(pageSrc).toContain('GRAMMAR_CONTENT');
		expect(GRAMMAR_CONTENT.length).toBeGreaterThan(3);
	});
});
