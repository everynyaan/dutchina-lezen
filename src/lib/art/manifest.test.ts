import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import manifestJson from '../../../static/characters/manifest.json';
import {
	KUROMI_MOODS,
	DOODLE_NAMES,
	KUROMI_STATIC_FALLBACK,
	resolveCharacter,
	type CharacterEntry,
	type CharacterName
} from './manifest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const charactersDir = path.join(repoRoot, 'static', 'characters');

interface CharacterManifest {
	kuromi: Record<string, CharacterEntry>;
	melody: Record<string, CharacterEntry>;
	piano: Record<string, CharacterEntry>;
	doodles: { files: string[] };
}

const manifest = manifestJson as CharacterManifest;

const CHARACTERS: CharacterName[] = ['kuromi', 'melody', 'piano'];

const CHAT_PROTOCOL_MOODS = [
	'talk',
	'mischief',
	'hmph',
	'grumpy',
	'pout',
	'wink',
	'blush',
	'love',
	'hearteyes',
	'sing',
	'question',
	'shocked',
	'eek',
	'scared',
	'cry',
	'laugh',
	'sleep',
	'magic',
	'hehe',
	'excited',
	'defeated',
	'thanks',
	'bounce'
] as const;

describe('character manifest on disk', () => {
	for (const who of CHARACTERS) {
		it(`every ${who} entry file/static exists on disk`, () => {
			const entries = manifest[who];
			for (const [mood, entry] of Object.entries(entries)) {
				const filePath = path.join(charactersDir, entry.file);
				expect(existsSync(filePath), `${who}/${mood} file missing: ${entry.file}`).toBe(true);
				if (entry.static) {
					const staticPath = path.join(charactersDir, entry.static);
					expect(existsSync(staticPath), `${who}/${mood} static missing: ${entry.static}`).toBe(
						true
					);
				}
			}
		});
	}
});

describe('manifest constants', () => {
	it('KUROMI_MOODS has exactly 30 entries', () => {
		expect(KUROMI_MOODS).toHaveLength(30);
	});

	it('DOODLE_NAMES has exactly 65 entries', () => {
		expect(DOODLE_NAMES).toHaveLength(65);
	});

	it('every DOODLE_NAMES entry has a real .svg on disk', () => {
		for (const name of DOODLE_NAMES) {
			const doodlePath = path.join(charactersDir, 'doodles', `${name}.svg`);
			expect(existsSync(doodlePath), `doodle missing: ${name}.svg`).toBe(true);
		}
	});

	it('every KUROMI_STATIC_FALLBACK value is a static kuromi mood', () => {
		for (const [animatedMood, staticMood] of Object.entries(KUROMI_STATIC_FALLBACK)) {
			const entry = manifest.kuromi[staticMood];
			expect(entry, `fallback for ${animatedMood} -> ${staticMood} missing`).toBeDefined();
			expect(entry.animated).toBe(false);
		}
	});
});

describe('resolveCharacter', () => {
	it('kuromi/hehe static resolves to mischief.png', () => {
		const result = resolveCharacter('kuromi', 'hehe', false);
		expect(result).not.toBeNull();
		expect(result!.src.endsWith('mischief.png')).toBe(true);
	});

	it('kuromi/hehe animated resolves to hehe.gif', () => {
		const result = resolveCharacter('kuromi', 'hehe', true);
		expect(result).not.toBeNull();
		expect(result!.src.endsWith('hehe.gif')).toBe(true);
	});

	it('melody/reading static resolves to reading.png', () => {
		const result = resolveCharacter('melody', 'reading', false);
		expect(result).not.toBeNull();
		expect(result!.src.endsWith('reading.png')).toBe(true);
	});

	it('unknown mood returns null', () => {
		expect(resolveCharacter('kuromi', 'nope', true)).toBeNull();
	});

	it('chat protocol moods all resolve animated and static', () => {
		for (const mood of CHAT_PROTOCOL_MOODS) {
			const animated = resolveCharacter('kuromi', mood, true);
			const still = resolveCharacter('kuromi', mood, false);
			expect(animated, `animated null for ${mood}`).not.toBeNull();
			expect(still, `static null for ${mood}`).not.toBeNull();
		}
	});
});
