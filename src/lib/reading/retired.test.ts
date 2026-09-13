import { describe, expect, it } from 'vitest';
import { isRetiredPath } from './retired';

describe('isRetiredPath', () => {
	it('flags original Dutchina loops', () => {
		expect(isRetiredPath('/match')).toBe(true);
		expect(isRetiredPath('/match/foo')).toBe(true);
		expect(isRetiredPath('/stories/hello/1')).toBe(true);
		expect(isRetiredPath('/read')).toBe(true);
	});

	it('does not flag the reading fork', () => {
		expect(isRetiredPath('/')).toBe(false);
		expect(isRetiredPath('/eval')).toBe(false);
		expect(isRetiredPath('/cards')).toBe(false);
		expect(isRetiredPath('/mock')).toBe(false);
		expect(isRetiredPath('/lezen')).toBe(false);
		expect(isRetiredPath('/grammar')).toBe(false);
		expect(isRetiredPath('/kuromi')).toBe(false);
	});
});
