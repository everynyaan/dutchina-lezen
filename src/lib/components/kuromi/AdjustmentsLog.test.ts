import { describe, it, expect } from 'vitest';
import { toolMeta } from './AdjustmentsLog.svelte';

describe('toolMeta fallback (AdjustmentsLog)', () => {
	it('returns a defined fallback row for an unrecognised tool string without throwing', () => {
		expect(() => toolMeta('brand_new_future_tool')).not.toThrow();
		const row = toolMeta('brand_new_future_tool');
		expect(row).toBeDefined();
		expect(row).not.toBeUndefined();
		expect(row.label).toBe('brand_new_future_tool');
		expect(typeof row.icon).toBe('string');
		expect(typeof row.jit).toBe('string');
		expect(row.icon.length).toBeGreaterThan(0);
		expect(row.jit.length).toBeGreaterThan(0);
	});

	it('returns known meta for create_page / update_page / archive_page', () => {
		expect(toolMeta('create_page').label).toBe('Create page');
		expect(toolMeta('update_page').label).toBe('Update page');
		expect(toolMeta('archive_page').label).toBe('Archive page');
	});
});
