import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICON_SVG, ICON_WEIGHT, type IconName } from './icons';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(here, '../..');
const iconsRoot = here;

describe('ICON_SVG / ICON_WEIGHT', () => {
	it('ICON_SVG has exactly 35 entries', () => {
		expect(Object.keys(ICON_SVG)).toHaveLength(35);
	});

	it('ICON_SVG and ICON_WEIGHT share the same 35 names', () => {
		const svgNames = new Set(Object.keys(ICON_SVG));
		const weightNames = new Set(Object.keys(ICON_WEIGHT));
		expect(svgNames).toEqual(weightNames);
		expect(svgNames.size).toBe(35);
	});

	it('every ICON_SVG entry is an svg with a viewBox', () => {
		for (const [name, svg] of Object.entries(ICON_SVG)) {
			const trimmed = svg.trim();
			expect(trimmed.startsWith('<svg'), `${name} should start with <svg`).toBe(true);
			expect(trimmed.includes('viewBox'), `${name} should contain viewBox`).toBe(true);
		}
	});

	it('no ICON_SVG entry contains <style (defs strip + light never had it)', () => {
		for (const [name, svg] of Object.entries(ICON_SVG)) {
			expect(svg.includes('<style'), `${name} still has <style`).toBe(false);
		}
	});

	it('duotone entries have fa-secondary; light entries do not', () => {
		for (const name of Object.keys(ICON_WEIGHT) as IconName[]) {
			const svg = ICON_SVG[name];
			if (ICON_WEIGHT[name] === 'duotone') {
				expect(svg.includes('fa-secondary'), `duotone ${name} missing fa-secondary`).toBe(true);
			} else {
				expect(svg.includes('fa-secondary'), `light ${name} has fa-secondary`).toBe(false);
			}
		}
	});

	it('ICON_WEIGHT splits exactly 15 duotone and 20 light', () => {
		const values = Object.values(ICON_WEIGHT);
		expect(values.filter((w) => w === 'duotone')).toHaveLength(15);
		expect(values.filter((w) => w === 'light')).toHaveLength(20);
	});
});

describe('webfont gate', () => {
	function walkFiles(dir: string, out: string[] = []): string[] {
		for (const entry of readdirSync(dir)) {
			if (entry === 'node_modules') continue;
			const full = path.join(dir, entry);
			const st = statSync(full);
			if (st.isDirectory()) {
				walkFiles(full, out);
			} else {
				out.push(full);
			}
		}
		return out;
	}

	it('no file under src/ contains a webfonts path reference', () => {
		// Built at runtime so this test file does not contain the forbidden substring.
		const needle = ['webfont', 's/'].join('');
		const files = walkFiles(srcRoot);
		const offenders: string[] = [];
		for (const file of files) {
			try {
				const text = readFileSync(file, 'utf-8');
				if (text.includes(needle)) {
					offenders.push(path.relative(srcRoot, file));
				}
			} catch {
				// skip unreadable / non-text
			}
		}
		expect(offenders, `${needle} found in: ${offenders.join(', ')}`).toEqual([]);
	});

	it('src/lib/icons/ has no webfont or CSS font files', () => {
		const forbiddenExt = new Set(['.woff', '.woff2', '.ttf', '.eot', '.css']);
		const files = walkFiles(iconsRoot);
		const offenders = files.filter((f) => forbiddenExt.has(path.extname(f).toLowerCase()));
		expect(
			offenders.map((f) => path.relative(iconsRoot, f)),
			`forbidden font/css files: ${offenders.join(', ')}`
		).toEqual([]);
	});
});
