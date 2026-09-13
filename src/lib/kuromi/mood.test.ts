import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	parseReply,
	PERSONA_MOODS,
	MELODY_STICKER_MOODS,
	PIANO_STICKER_MOODS,
	DEFAULT_MOOD
} from './mood';
import { resolveCharacter } from '../art/manifest';

const dir = path.dirname(fileURLToPath(import.meta.url));

describe('parseReply', () => {
	it('parses a normal reply with a trailing tag on its own line', () => {
		const result = parseReply('Hi there.\n[mood: hehe]');
		expect(result).toEqual({
			text: 'Hi there.',
			mood: 'hehe',
			sticker: null,
			react: null,
			question: null
		});
	});

	it('accepts odd casing and spacing in the tag', () => {
		const result = parseReply('[Mood:  HeHe ]');
		expect(result.mood).toBe('hehe');
		expect(result.text).toBe('[Mood:  HeHe ]');
		expect(result.sticker).toBeNull();
		expect(result.react).toBeNull();
	});

	it('parses a tag with no preceding newline', () => {
		const result = parseReply('Hi there. [mood: wink]');
		expect(result).toEqual({
			text: 'Hi there.',
			mood: 'wink',
			sticker: null,
			react: null,
			question: null
		});
	});

	it('strips unknown mood values and falls back to talk', () => {
		const result = parseReply('Oops.\n[mood: banana]');
		expect(result).toEqual({
			text: 'Oops.',
			mood: 'talk',
			sticker: null,
			react: null,
			question: null
		});
	});

	it('returns trimmed text and default mood when no tag is present', () => {
		const result = parseReply('  Just banter.  ');
		expect(result).toEqual({
			text: 'Just banter.',
			mood: DEFAULT_MOOD,
			sticker: null,
			react: null,
			question: null
		});
	});

	it('leaves a mid-text bracket untouched when the last line is not a tag', () => {
		const raw = 'I said [mood: wink] to her.\nThen I left.';
		const result = parseReply(raw);
		expect(result.mood).toBe('talk');
		expect(result.text).toBe(raw.trim());
		expect(result.text).toContain('[mood: wink]');
		expect(result.sticker).toBeNull();
		expect(result.react).toBeNull();
	});

	it('keeps tag-only replies unstripped so the bubble is never empty', () => {
		const raw = '[mood: cry]';
		const result = parseReply(raw);
		expect(result).toEqual({ text: raw, mood: 'cry', sticker: null, react: null, question: null });
	});

	it('handles empty string input', () => {
		expect(parseReply('')).toEqual({
			text: '',
			mood: 'talk',
			sticker: null,
			react: null,
			question: null
		});
		expect(parseReply('   \n  ')).toEqual({
			text: '',
			mood: 'talk',
			sticker: null,
			react: null,
			question: null
		});
	});

	it('still parses correctly when the reply contains ] characters elsewhere', () => {
		const result = parseReply('See array[0] and map["k"] here.\n[mood: question]');
		expect(result).toEqual({
			text: 'See array[0] and map["k"] here.',
			mood: 'question',
			sticker: null,
			react: null,
			question: null
		});
	});

	it('preserves earlier lines of a multi-line reply verbatim', () => {
		const raw = 'Line one stays.\nLine two stays.\n[mood: laugh]';
		const result = parseReply(raw);
		expect(result.mood).toBe('laugh');
		expect(result.text).toBe('Line one stays.\nLine two stays.');
		expect(result.sticker).toBeNull();
		expect(result.react).toBeNull();
	});

	it('round-trips every mood in PERSONA_MOODS', () => {
		for (const m of PERSONA_MOODS) {
			const result = parseReply('hi\n[mood: ' + m + ']');
			expect(result.mood).toBe(m);
			expect(result.text).toBe('hi');
			expect(result.sticker).toBeNull();
			expect(result.react).toBeNull();
		}
	});

	it('round-trips a mood-only reply with sticker and react left null', () => {
		const result = parseReply('Just the usual.\n[mood: mischief]');
		expect(result).toEqual({
			text: 'Just the usual.',
			mood: 'mischief',
			sticker: null,
			react: null,
			question: null
		});
	});

	// --- CA-12: namespaced sticker/react vocabulary ---

	it('parses a namespaced kuromi sticker tag plus a mood tag and strips the sticker line', () => {
		const result = parseReply('Nailed it!\n[sticker: kuromi/excited]\n[mood: hehe]');
		expect(result.mood).toBe('hehe');
		expect(result.sticker).toEqual({ who: 'kuromi', mood: 'excited' });
		expect(result.react).toBeNull();
		expect(result.text).toBe('Nailed it!');
		expect(result.text).not.toContain('[sticker');
	});

	it('parses a namespaced kuromi react tag plus a mood tag and strips the react line', () => {
		const result = parseReply('Nice.\n[react: kuromi/love]\n[mood: blush]');
		expect(result.mood).toBe('blush');
		expect(result.react).toEqual({ who: 'kuromi', mood: 'love' });
		expect(result.sticker).toBeNull();
		expect(result.text).toBe('Nice.');
		expect(result.text).not.toContain('[react');
	});

	it('parses a namespaced melody sticker', () => {
		const result = parseReply('Ugh, fine, that was sweet.\n[sticker: melody/cheer]\n[mood: hmph]');
		expect(result.sticker).toEqual({ who: 'melody', mood: 'cheer' });
		expect(result.text).toBe('Ugh, fine, that was sweet.');
	});

	it('parses a namespaced piano react', () => {
		const result = parseReply('Quiet in here.\n[react: piano/peek]\n[mood: talk]');
		expect(result.react).toEqual({ who: 'piano', mood: 'peek' });
		expect(result.text).toBe('Quiet in here.');
	});

	it('drops a bare non-namespaced sticker name (namespace is required)', () => {
		const result = parseReply('Hello.\n[sticker: excited]\n[mood: talk]');
		expect(result.sticker).toBeNull();
		expect(result.mood).toBe('talk');
		expect(result.text).toBe('Hello.');
		expect(result.text).not.toContain('[sticker');
	});

	it('drops an unknown character namespace and still strips the line', () => {
		const result = parseReply('Hi.\n[sticker: bogus/excited]\n[mood: talk]');
		expect(result.sticker).toBeNull();
		expect(result.text).toBe('Hi.');
		expect(result.text).not.toContain('[sticker');
	});

	it('drops an unknown mood within a valid kuromi namespace', () => {
		const result = parseReply('Hi.\n[sticker: kuromi/bogus]\n[mood: talk]');
		expect(result.sticker).toBeNull();
		expect(result.text).toBe('Hi.');
	});

	it('drops an unknown mood within the melody namespace', () => {
		const result = parseReply('Hi.\n[sticker: melody/bogus]\n[mood: talk]');
		expect(result.sticker).toBeNull();
	});

	it('drops kuromi/pixel -- Boss realm sprite only, never a chat sticker', () => {
		const result = parseReply('Hi.\n[sticker: kuromi/pixel]\n[mood: talk]');
		expect(result.sticker).toBeNull();
		expect(result.text).toBe('Hi.');
	});

	it('lets the first sticker tag win across characters and strips later ones', () => {
		const result = parseReply(
			'Hi.\n[sticker: kuromi/excited]\n[sticker: melody/cheer]\n[mood: talk]'
		);
		expect(result.sticker).toEqual({ who: 'kuromi', mood: 'excited' });
		expect(result.text).toBe('Hi.');
		expect(result.text).not.toContain('[sticker');
	});

	it('keeps sticker null when the first sticker is invalid even if a later one is valid', () => {
		const result = parseReply('Hi.\n[sticker: bogus/nope]\n[sticker: kuromi/hehe]\n[mood: talk]');
		expect(result.sticker).toBeNull();
		expect(result.text).toBe('Hi.');
	});

	it('lets the first react tag win and strips later ones', () => {
		const result = parseReply('Hi.\n[react: kuromi/love]\n[react: kuromi/wink]\n[mood: talk]');
		expect(result.react).toEqual({ who: 'kuromi', mood: 'love' });
		expect(result.text).toBe('Hi.');
	});

	it('keeps react null when the first react name is invalid even if a later one is valid', () => {
		const result = parseReply('Hi.\n[react: kuromi/bogus]\n[react: kuromi/wink]\n[mood: talk]');
		expect(result.react).toBeNull();
		expect(result.text).toBe('Hi.');
	});

	it('tolerates case and whitespace inside namespaced sticker and react tags', () => {
		const result = parseReply(
			'Wow.\n[Sticker:  Kuromi / Excited ]\n[REACT: MELODY/cheer]\n[mood: talk]'
		);
		expect(result.sticker).toEqual({ who: 'kuromi', mood: 'excited' });
		expect(result.react).toEqual({ who: 'melody', mood: 'cheer' });
		expect(result.mood).toBe('talk');
		expect(result.text).toBe('Wow.');
	});

	it('falls back to the original raw text (tags included) when only tag lines remain -- the client applies its own display-time strip on top of this', () => {
		const raw = '[sticker: kuromi/excited]\n[mood: hehe]';
		const result = parseReply(raw);
		expect(result.text).toBe(raw);
		expect(result.mood).toBe('hehe');
		expect(result.sticker).toEqual({ who: 'kuromi', mood: 'excited' });
		expect(result.react).toBeNull();
	});

	it('never lets a raw sticker/react tag reach the rendered text once other content survives, even when malformed or unknown', () => {
		const cases = [
			'Body.\n[sticker: ]\n[mood: talk]',
			'Body.\n[sticker: /]\n[mood: talk]',
			'Body.\n[sticker: kuromi]\n[mood: talk]',
			'Body.\n[sticker: kuromi/melody/cheer]\n[mood: talk]',
			'Body.\n[react: totally/bogus]\n[mood: talk]'
		];
		for (const raw of cases) {
			const result = parseReply(raw);
			expect(result.text).not.toMatch(/\[\s*(sticker|react)\s*:/i);
			expect(result.sticker).toBeNull();
			expect(result.react).toBeNull();
		}
	});

	it('plain text containing a slash is never mistaken for a sticker tag', () => {
		const raw = 'Type kuromi/excited into the search box.\nThen wait.\n[mood: hmph]';
		const result = parseReply(raw);
		expect(result.mood).toBe('hmph');
		expect(result.text).toBe('Type kuromi/excited into the search box.\nThen wait.');
		expect(result.sticker).toBeNull();
	});

	describe('parseReply -- [question] block (Unit C, section 3)', () => {
		const WELL_FORMED =
			'Which is right: "het huis" or "de huis"?\n' +
			'- het huis\n' +
			'- de huis\n' +
			'* het huis\n' +
			'> Diminutives and huis-shaped nouns take het.';

		function wrap(block: string): string {
			return 'Quick one for you.\n[question]\n' + block + '\n[/question]\n[mood: hehe]';
		}

		it('parses a well-formed block, strips it from the text, and keeps the mood tag', () => {
			const result = parseReply(wrap(WELL_FORMED));
			expect(result.text).toBe('Quick one for you.');
			expect(result.mood).toBe('hehe');
			expect(result.text).not.toContain('[question]');
			expect(result.text).not.toContain('[/question]');
			expect(result.question).toEqual({
				prompt: 'Which is right: "het huis" or "de huis"?',
				options: ['het huis', 'de huis'],
				correct: 'het huis',
				explanation: 'Diminutives and huis-shaped nouns take het.'
			});
		});

		it('parses a block with no explanation line as explanation: null', () => {
			const block = 'Pick one.\n- a\n- b\n* a';
			const result = parseReply(wrap(block));
			expect(result.question?.explanation).toBeNull();
			expect(result.question?.options).toEqual(['a', 'b']);
			expect(result.question?.correct).toBe('a');
		});

		it('drops the block when the star answer does not match any option', () => {
			const block = 'Pick one.\n- a\n- b\n* c';
			const result = parseReply(wrap(block));
			expect(result.question).toBeNull();
			expect(result.text).toBe('Quick one for you.');
			expect(result.text).not.toContain('[question]');
			expect(result.text).not.toContain('* c');
		});

		it('drops the block when there is only 1 option', () => {
			const block = 'Pick one.\n- a\n* a';
			const result = parseReply(wrap(block));
			expect(result.question).toBeNull();
			expect(result.text).not.toContain('- a');
		});

		it('drops the block when there are 5 options', () => {
			const block = 'Pick one.\n- a\n- b\n- c\n- d\n- e\n* a';
			const result = parseReply(wrap(block));
			expect(result.question).toBeNull();
			expect(result.text).not.toContain('- e');
		});

		it('drops the block on duplicate options', () => {
			const block = 'Pick one.\n- a\n- a\n* a';
			const result = parseReply(wrap(block));
			expect(result.question).toBeNull();
		});

		it('drops the block when an option cleans to an empty string', () => {
			const block = 'Which is right?\n- [mood: hehe]\n- de huis\n* de huis';
			const result = parseReply(wrap(block));
			expect(result.question).toBeNull();
			expect(result.text).not.toContain('[question]');
			expect(result.text).not.toContain('[/question]');
			expect(result.text).not.toContain('de huis');
		});

		it('drops the block on an empty prompt', () => {
			const block = '- a\n- b\n* a';
			const result = parseReply(wrap(block));
			expect(result.question).toBeNull();
		});

		it('drops an unterminated block and leaves no visible residue', () => {
			const raw = 'Here comes one.\n[question]\nPick one.\n- a\n- b\n* a';
			const result = parseReply(raw);
			expect(result.question).toBeNull();
			expect(result.text).not.toContain('[question]');
			expect(result.text).not.toContain('- a');
			expect(result.text).toBe('Here comes one.');
		});

		it('drops every malformed case with no raw question marker surviving', () => {
			const malformed = [
				'Pick.\n- a\n- a\n* a',
				'Pick.\n- a\n* z',
				'Pick.\n- a\n* a\n- b\n- c\n- d\n- e',
				'- a\n- b\n* a'
			];
			for (const block of malformed) {
				const result = parseReply(wrap(block));
				expect(result.question, block).toBeNull();
				expect(result.text.includes('[question]')).toBe(false);
				expect(result.text.includes('[/question]')).toBe(false);
			}
		});

		it('parses a question block coexisting with mood, sticker and react tags', () => {
			const raw =
				'Watch this.\n' +
				'[sticker: kuromi/excited]\n' +
				'[react: kuromi/hehe]\n' +
				'[question]\n' +
				WELL_FORMED +
				'\n[/question]\n' +
				'[mood: excited]';
			const result = parseReply(raw);
			expect(result.mood).toBe('excited');
			expect(result.sticker).toEqual({ who: 'kuromi', mood: 'excited' });
			expect(result.react).toEqual({ who: 'kuromi', mood: 'hehe' });
			expect(result.question?.prompt).toBe('Which is right: "het huis" or "de huis"?');
			expect(result.text).toBe('Watch this.');
		});

		it('a reply that is only a question block still renders something sensible', () => {
			const raw = '[question]\n' + WELL_FORMED + '\n[/question]\n[mood: talk]';
			const result = parseReply(raw);
			expect(result.question).not.toBeNull();
			expect(result.question?.correct).toBe('het huis');
			expect(result.text).not.toContain('[question]');
			expect(result.text).not.toContain('het huis');
		});

		it('drops extra blocks beyond the first (at most one question per reply)', () => {
			const raw =
				'First.\n[question]\n' +
				WELL_FORMED +
				'\n[/question]\n' +
				'Second.\n[question]\nOther one?\n- x\n- y\n* x\n[/question]\n[mood: talk]';
			const result = parseReply(raw);
			expect(result.question?.prompt).toBe('Which is right: "het huis" or "de huis"?');
			expect(result.text).not.toContain('Other one?');
			expect(result.text).not.toContain('[question]');
		});

		it('clamps an absurdly long prompt/option/explanation rather than rejecting the block', () => {
			const longPrompt = 'P'.repeat(2000);
			const longOption = 'O'.repeat(2000);
			const longExplanation = 'E'.repeat(2000);
			const block =
				longPrompt + '\n- ' + longOption + '\n- b\n* ' + longOption + '\n> ' + longExplanation;
			const result = parseReply(wrap(block));
			expect(result.question).not.toBeNull();
			expect(result.question!.prompt.length).toBeLessThanOrEqual(300);
			expect(result.question!.options[0].length).toBeLessThanOrEqual(120);
			expect(result.question!.explanation!.length).toBeLessThanOrEqual(500);
		});

		it('strips a nested tag-shaped bracket out of question content instead of leaking it', () => {
			const block =
				'Pick [mood: hehe] one.\n- a\n- b\n* a\n> Because [sticker: kuromi/love] reasons.';
			const result = parseReply(wrap(block));
			expect(result.question?.prompt).toBe('Pick  one.');
			expect(result.question?.explanation).toBe('Because  reasons.');
		});
	});
});

describe('namespaced sticker/react vocabulary resolves in the manifest (D45 both-modes standard)', () => {
	const ALL_NAMESPACED: Array<{ who: 'kuromi' | 'melody' | 'piano'; mood: string }> = [
		...PERSONA_MOODS.map((mood) => ({ who: 'kuromi' as const, mood })),
		...MELODY_STICKER_MOODS.map((mood) => ({ who: 'melody' as const, mood })),
		...PIANO_STICKER_MOODS.map((mood) => ({ who: 'piano' as const, mood }))
	];

	for (const { who, mood } of ALL_NAMESPACED) {
		it(`${who}/${mood} resolves to a real manifest entry, animated and static`, () => {
			const animated = resolveCharacter(who, mood, true);
			const still = resolveCharacter(who, mood, false);
			expect(animated, `animated null for ${who}/${mood}`).not.toBeNull();
			expect(still, `static null for ${who}/${mood}`).not.toBeNull();
		});
	}
});
// THE SANDBOX GUARANTEE (Phase 6 Unit C, section 4/7): answering an inline chat
// question must change no persisted learning state. A grep-based test over this
// lane's own modules is the honest form of that assertion -- it cannot verify
// runtime behaviour, but it makes the constraint mechanically checkable: none of
// the forbidden specifiers below may appear in the [question]-block parser here
// or in InlineQuestion.svelte, the component that renders it.
describe('inline MCQ sandbox guarantee -- no persisted learning state (section 4/7)', () => {
	const FORBIDDEN_SPECIFIERS = [
		'$lib/lp/',
		'$lib/cards/srs',
		'$lib/cards/cardStore',
		'cardStore',
		'$lib/missions',
		'$lib/achievements'
	];

	// Checks actual `import ... from '<specifier>'` statements only -- not this
	// very file's own doc comments, which quote the forbidden list in prose (see
	// InlineQuestion.svelte's header) and would otherwise false-positive on
	// themselves.
	const IMPORT_LINE = /^\s*import\s[^;]*from\s*['"]([^'"]+)['"];?\s*$/gm;

	function assertSandboxed(filePath: string) {
		const source = fs.readFileSync(filePath, 'utf-8');
		const specifiers: string[] = [];
		for (const match of source.matchAll(IMPORT_LINE)) specifiers.push(match[1]);
		for (const forbidden of FORBIDDEN_SPECIFIERS) {
			const hit = specifiers.find((s) => s.includes(forbidden));
			expect(hit, `${filePath} imports from ${forbidden}`).toBeUndefined();
		}
	}

	it('mood.ts imports nothing from the LP/SRS/mission/achievement surface', () => {
		assertSandboxed(path.join(dir, 'mood.ts'));
	});

	it('InlineQuestion.svelte imports nothing from that surface either', () => {
		assertSandboxed(path.join(dir, '..', 'components', 'kuromi', 'InlineQuestion.svelte'));
	});
});
