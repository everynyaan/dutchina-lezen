import { describe, it, expect } from 'vitest';
import { createDefaultState } from '$lib/state/defaults';
import type {
	AdjustmentEntry,
	AppConfig,
	CurrentState,
	KuromiPage,
	PageBlock,
	StewardAward
} from '$lib/state/schema';
import type { LpEvent, LpResult } from '$lib/lp/lp';
import {
	MAX_ACTIVE_PAGES,
	MAX_BLOCKS_PER_PAGE,
	MAX_QUESTIONS_PER_DRILL,
	MAX_LABELS_PER_PAGE,
	MAX_LABEL_CHARS,
	SUGGESTED_LABELS,
	PAGE_TITLE_MAX,
	PAGE_QUIP_MAX,
	NOTE_BODY_MAX,
	READ_TEXT_MAX,
	VOCAB_PAIR_MAX,
	VOCAB_SET_MAX_ENTRIES,
	BEAD_TEXT_MAX,
	GRAMMAR_FORMULA_MAX_BEADS,
	GRAMMAR_EXAMPLE_MAX,
	TRAP_TITLE_MAX,
	TRAP_BODY_MAX,
	VOCAB_WORD_ID_MAX,
	QUESTION_PROMPT_MAX,
	QUESTION_ANSWER_MAX,
	QUESTION_OPTION_MAX,
	MAX_OPTIONS_PER_QUESTION,
	normalizeLabel,
	normalizeLabels,
	countActivePages,
	validateBlock,
	validateBlocks
} from './pageSchema';
import { executeIntents, type StewardHost } from './executor';
import type { KuromiToolCall } from './types';

function bead(text: string, variant?: 'default' | 'verb' | 'subject' | 'ghost') {
	return variant ? { text, variant } : { text };
}

function validGrammarCard(overrides: Record<string, unknown> = {}) {
	return {
		type: 'grammar-card',
		title: 'Word order',
		formula: [bead('Subject'), bead('verb', 'verb')],
		example: { nl: 'Ik eet', en: 'I eat' },
		...overrides
	};
}

function validVocabSet(overrides: Record<string, unknown> = {}) {
	return {
		type: 'vocab-set',
		wordIds: ['w1'],
		custom: [{ nl: 'huis', en: 'house' }],
		...overrides
	};
}

function validDrill(overrides: Record<string, unknown> = {}) {
	return {
		type: 'drill',
		title: 'Drill',
		intro_quip: 'try this',
		questions: [
			{
				type: 'mcq',
				prompt: 'Q?',
				options: ['a', 'b'],
				answer: 'a',
				explanation_quip: 'because'
			}
		],
		...overrides
	};
}

function validRead(overrides: Record<string, unknown> = {}) {
	return { type: 'read', nl: 'Hallo', en: 'Hello', ...overrides };
}

function validNote(overrides: Record<string, unknown> = {}) {
	return { type: 'note', body: 'remember this', ...overrides };
}

describe('pageSchema constants', () => {
	it('exports the documented caps', () => {
		expect(MAX_ACTIVE_PAGES).toBe(60);
		expect(MAX_BLOCKS_PER_PAGE).toBe(20);
		expect(MAX_QUESTIONS_PER_DRILL).toBe(10);
		expect(MAX_LABELS_PER_PAGE).toBe(6);
		expect(MAX_LABEL_CHARS).toBe(24);
		expect(PAGE_TITLE_MAX).toBe(80);
		expect(PAGE_QUIP_MAX).toBe(200);
		expect(NOTE_BODY_MAX).toBe(2000);
		expect(READ_TEXT_MAX).toBe(2000);
		expect(VOCAB_PAIR_MAX).toBe(120);
		expect(VOCAB_SET_MAX_ENTRIES).toBe(40);
		expect([...SUGGESTED_LABELS]).toEqual([
			'grammar',
			'vocab',
			'phrases',
			'listening',
			'review',
			'challenge'
		]);
	});
});

describe('normalizeLabel / normalizeLabels', () => {
	it('trims, lowercases, and collapses whitespace', () => {
		expect(normalizeLabel('  Foo   BAR ')).toBe('foo bar');
	});

	it('dedupes, drops empties, clamps count and chars', () => {
		const labels = normalizeLabels([
			'Grammar',
			'grammar',
			'  ',
			'vocab',
			'this-label-is-way-too-long-to-keep',
			'phrases',
			'listening',
			'review',
			'challenge',
			'extra-seventh'
		]);
		expect(labels).toHaveLength(6);
		expect(labels[0]).toBe('grammar');
		expect(labels.every((l) => l.length <= 24)).toBe(true);
		expect(labels.find((l) => l.startsWith('this-label'))!.length).toBe(24);
	});

	it('7 labels clamp to 6; a 30-char label clamps to 24', () => {
		const seven = normalizeLabels(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
		expect(seven).toHaveLength(6);
		const long = normalizeLabels(['x'.repeat(30)]);
		expect(long[0].length).toBe(24);
	});
});

describe('countActivePages', () => {
	function page(partial: Partial<KuromiPage> & { id: string }): KuromiPage {
		return {
			title: 't',
			quip: 'q',
			labels: [],
			blocks: [],
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
			archived: false,
			...partial
		};
	}

	it('counts archived:false as active', () => {
		expect(countActivePages([page({ id: '1', archived: false })])).toBe(1);
	});

	it('does not count archived:true', () => {
		expect(countActivePages([page({ id: '1', archived: true })])).toBe(0);
	});

	it('counts a page with archived missing as active', () => {
		const broken = page({ id: '1' });
		delete (broken as { archived?: boolean }).archived;
		expect(countActivePages([broken])).toBe(1);
	});
});

describe('validateBlock — grammar-card', () => {
	it('accepts a valid grammar-card and strips unknown props', () => {
		const result = validateBlock({
			...validGrammarCard({
				formulaTone: 'rose',
				trap: { title: 'Tip', body: 'body', variant: 'tip' }
			}),
			extra: 'nope',
			id: 'should-strip',
			createdAt: '2099-01-01T00:00:00.000Z',
			updatedAt: '2099-01-01T00:00:00.000Z'
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.block.type).toBe('grammar-card');
		expect(result.block).not.toHaveProperty('extra');
		expect(result.block).not.toHaveProperty('id');
		expect(result.block).not.toHaveProperty('createdAt');
		expect(result.block).not.toHaveProperty('updatedAt');
	});

	it('rejects non-string title', () => {
		expect(validateBlock(validGrammarCard({ title: 1 })).ok).toBe(false);
	});

	it('rejects empty formula', () => {
		expect(validateBlock(validGrammarCard({ formula: [] })).ok).toBe(false);
	});

	it('drops invalid formula variant and formulaTone', () => {
		const result = validateBlock(
			validGrammarCard({
				formula: [{ text: 'X', variant: 'nope' }],
				formulaTone: 'neon'
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.formula[0]).toEqual({ text: 'X' });
		expect(block.formulaTone).toBeUndefined();
	});

	it('rejects example with empty nl/en', () => {
		expect(validateBlock(validGrammarCard({ example: { nl: '', en: 'x' } })).ok).toBe(false);
		expect(validateBlock(validGrammarCard({ example: { nl: 'x', en: '' } })).ok).toBe(false);
	});

	it('rejects trap with empty title/body when present', () => {
		expect(validateBlock(validGrammarCard({ trap: { title: '', body: 'b' } })).ok).toBe(false);
		expect(validateBlock(validGrammarCard({ trap: { title: 't', body: '' } })).ok).toBe(false);
	});

	it('accepts grammar-card without trap', () => {
		expect(validateBlock(validGrammarCard()).ok).toBe(true);
	});
});

describe('validateBlock — vocab-set', () => {
	it('accepts a valid vocab-set', () => {
		expect(validateBlock(validVocabSet()).ok).toBe(true);
	});

	it('rejects vocab-set with both wordIds and custom empty', () => {
		const result = validateBlock(validVocabSet({ wordIds: [], custom: [] }));
		expect(result.ok).toBe(false);
	});

	it('accepts wordIds-only or custom-only', () => {
		expect(validateBlock(validVocabSet({ wordIds: ['a'], custom: [] })).ok).toBe(true);
		expect(validateBlock(validVocabSet({ wordIds: [], custom: [{ nl: 'a', en: 'b' }] })).ok).toBe(
			true
		);
	});

	it('clamps combined entries to VOCAB_SET_MAX_ENTRIES', () => {
		const wordIds = Array.from({ length: 30 }, (_, i) => `w${i}`);
		const custom = Array.from({ length: 20 }, (_, i) => ({ nl: `n${i}`, en: `e${i}` }));
		const result = validateBlock(validVocabSet({ wordIds, custom }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'vocab-set' }>;
		expect(block.wordIds.length + block.custom.length).toBe(VOCAB_SET_MAX_ENTRIES);
	});
});

describe('validateBlock — drill', () => {
	it('accepts a valid drill', () => {
		expect(validateBlock(validDrill()).ok).toBe(true);
	});

	it('rejects mcq whose answer is absent from options', () => {
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options: ['a', 'b'],
						answer: 'c',
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(false);
	});

	it('rejects mcq with fewer than 2 options', () => {
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options: ['a'],
						answer: 'a',
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(false);
	});

	it('rejects empty questions', () => {
		expect(validateBlock(validDrill({ questions: [] })).ok).toBe(false);
	});

	it('clamps 11 drill questions to 10', () => {
		const questions = Array.from({ length: 11 }, (_, i) => ({
			type: 'recall' as const,
			prompt: `Q${i}`,
			options: [],
			answer: `A${i}`,
			explanation_quip: ''
		}));
		const result = validateBlock(validDrill({ questions }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions).toHaveLength(MAX_QUESTIONS_PER_DRILL);
	});

	it('defaults missing explanation_quip to empty string', () => {
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'recall',
						prompt: 'Q',
						options: [],
						answer: 'A'
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].explanation_quip).toBe('');
	});
});

describe('validateBlock — read / note / unknown', () => {
	it('accepts valid read and note', () => {
		expect(validateBlock(validRead()).ok).toBe(true);
		expect(validateBlock(validNote()).ok).toBe(true);
	});

	it('rejects empty read/note strings', () => {
		expect(validateBlock(validRead({ nl: '' })).ok).toBe(false);
		expect(validateBlock(validNote({ body: '' })).ok).toBe(false);
	});

	it('rejects unknown block type and names it in error', () => {
		const result = validateBlock({ type: 'magic-sparkle', title: 'x' });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error).toMatch(/magic-sparkle/);
	});

	it('clamps long read/note bodies rather than rejecting', () => {
		const read = validateBlock(validRead({ nl: 'n'.repeat(READ_TEXT_MAX + 50), en: 'e' }));
		expect(read.ok).toBe(true);
		if (read.ok) {
			const block = read.block as Extract<PageBlock, { type: 'read' }>;
			expect(block.nl.length).toBe(READ_TEXT_MAX);
		}
		const note = validateBlock(validNote({ body: 'b'.repeat(NOTE_BODY_MAX + 10) }));
		expect(note.ok).toBe(true);
		if (note.ok) {
			const block = note.block as Extract<PageBlock, { type: 'note' }>;
			expect(block.body.length).toBe(NOTE_BODY_MAX);
		}
	});
});

describe('validateBlocks', () => {
	it('rejects non-array and empty array', () => {
		expect(validateBlocks(null).ok).toBe(false);
		expect(validateBlocks([]).ok).toBe(false);
	});

	it('accepts an array of valid blocks', () => {
		const result = validateBlocks([validNote(), validRead()]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.blocks).toHaveLength(2);
	});

	it('one bad block rejects the whole array', () => {
		const result = validateBlocks([validNote(), { type: 'nope' }, validRead()]);
		expect(result.ok).toBe(false);
	});

	it('21 blocks clamp to 20', () => {
		const blocks = Array.from({ length: 21 }, () => validNote());
		const result = validateBlocks(blocks);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.blocks).toHaveLength(MAX_BLOCKS_PER_PAGE);
	});

	it('strips id/createdAt/updatedAt from block outputs', () => {
		const result = validateBlocks([{ ...validNote(), id: 'x', createdAt: 't', updatedAt: 't' }]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.blocks[0]).not.toHaveProperty('id');
		expect(result.blocks[0]).not.toHaveProperty('createdAt');
		expect(result.blocks[0]).not.toHaveProperty('updatedAt');
	});
});

describe('field-level caps — BEAD_TEXT_MAX', () => {
	it('at the cap passes unchanged', () => {
		const text = 'b'.repeat(BEAD_TEXT_MAX);
		const result = validateBlock(validGrammarCard({ formula: [bead(text)] }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.formula[0].text).toBe(text);
		expect(block.formula[0].text.length).toBe(BEAD_TEXT_MAX);
	});

	it('over the cap clamps to exactly the cap', () => {
		const text = 'b'.repeat(BEAD_TEXT_MAX + 25);
		const result = validateBlock(validGrammarCard({ formula: [bead(text)] }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.formula[0].text.length).toBe(BEAD_TEXT_MAX);
		expect(block.formula[0].text).toBe(text.slice(0, BEAD_TEXT_MAX));
	});
});

describe('field-level caps — GRAMMAR_FORMULA_MAX_BEADS', () => {
	it('exactly 12 beads passes unchanged', () => {
		const formula = Array.from({ length: GRAMMAR_FORMULA_MAX_BEADS }, (_, i) => bead(`b${i}`));
		const result = validateBlock(validGrammarCard({ formula }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.formula).toHaveLength(GRAMMAR_FORMULA_MAX_BEADS);
	});

	it('13 beads clamps to length 12', () => {
		const formula = Array.from({ length: GRAMMAR_FORMULA_MAX_BEADS + 1 }, (_, i) => bead(`b${i}`));
		const result = validateBlock(validGrammarCard({ formula }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.formula).toHaveLength(GRAMMAR_FORMULA_MAX_BEADS);
		expect(block.formula[GRAMMAR_FORMULA_MAX_BEADS - 1].text).toBe(
			`b${GRAMMAR_FORMULA_MAX_BEADS - 1}`
		);
	});
});

describe('field-level caps — GRAMMAR_EXAMPLE_MAX', () => {
	it('at the cap passes unchanged', () => {
		const nl = 'n'.repeat(GRAMMAR_EXAMPLE_MAX);
		const en = 'e'.repeat(GRAMMAR_EXAMPLE_MAX);
		const result = validateBlock(validGrammarCard({ example: { nl, en } }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.example.nl).toBe(nl);
		expect(block.example.en).toBe(en);
	});

	it('over the cap clamps example.nl and example.en to exactly the cap', () => {
		const nl = 'n'.repeat(GRAMMAR_EXAMPLE_MAX + 40);
		const en = 'e'.repeat(GRAMMAR_EXAMPLE_MAX + 40);
		const result = validateBlock(validGrammarCard({ example: { nl, en } }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.example.nl.length).toBe(GRAMMAR_EXAMPLE_MAX);
		expect(block.example.en.length).toBe(GRAMMAR_EXAMPLE_MAX);
		expect(block.example.nl).toBe(nl.slice(0, GRAMMAR_EXAMPLE_MAX));
		expect(block.example.en).toBe(en.slice(0, GRAMMAR_EXAMPLE_MAX));
	});
});

describe('field-level caps — TRAP_TITLE_MAX / TRAP_BODY_MAX', () => {
	it('at the caps pass unchanged', () => {
		const title = 't'.repeat(TRAP_TITLE_MAX);
		const body = 'b'.repeat(TRAP_BODY_MAX);
		const result = validateBlock(validGrammarCard({ trap: { title, body } }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.trap!.title).toBe(title);
		expect(block.trap!.body).toBe(body);
	});

	it('over the caps clamp title and body to exactly their caps', () => {
		const title = 't'.repeat(TRAP_TITLE_MAX + 20);
		const body = 'b'.repeat(TRAP_BODY_MAX + 50);
		const result = validateBlock(validGrammarCard({ trap: { title, body } }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'grammar-card' }>;
		expect(block.trap!.title.length).toBe(TRAP_TITLE_MAX);
		expect(block.trap!.body.length).toBe(TRAP_BODY_MAX);
		expect(block.trap!.title).toBe(title.slice(0, TRAP_TITLE_MAX));
		expect(block.trap!.body).toBe(body.slice(0, TRAP_BODY_MAX));
	});
});

describe('field-level caps — VOCAB_WORD_ID_MAX', () => {
	it('at the cap passes unchanged', () => {
		const id = 'w'.repeat(VOCAB_WORD_ID_MAX);
		const result = validateBlock(validVocabSet({ wordIds: [id], custom: [] }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'vocab-set' }>;
		expect(block.wordIds[0]).toBe(id);
		expect(block.wordIds[0].length).toBe(VOCAB_WORD_ID_MAX);
	});

	it('over the cap clamps to exactly the cap', () => {
		const id = 'w'.repeat(VOCAB_WORD_ID_MAX + 15);
		const result = validateBlock(validVocabSet({ wordIds: [id], custom: [] }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'vocab-set' }>;
		expect(block.wordIds[0].length).toBe(VOCAB_WORD_ID_MAX);
		expect(block.wordIds[0]).toBe(id.slice(0, VOCAB_WORD_ID_MAX));
	});
});

describe('field-level caps — QUESTION_PROMPT_MAX', () => {
	it('at the cap passes unchanged', () => {
		const prompt = 'p'.repeat(QUESTION_PROMPT_MAX);
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'recall',
						prompt,
						options: [],
						answer: 'A',
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].prompt).toBe(prompt);
	});

	it('over the cap clamps to exactly the cap', () => {
		const prompt = 'p'.repeat(QUESTION_PROMPT_MAX + 40);
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'recall',
						prompt,
						options: [],
						answer: 'A',
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].prompt.length).toBe(QUESTION_PROMPT_MAX);
		expect(block.questions[0].prompt).toBe(prompt.slice(0, QUESTION_PROMPT_MAX));
	});
});

describe('field-level caps — QUESTION_ANSWER_MAX', () => {
	it('at the cap passes unchanged (recall)', () => {
		const answer = 'a'.repeat(QUESTION_ANSWER_MAX);
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'recall',
						prompt: 'Q?',
						options: [],
						answer,
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].answer).toBe(answer);
	});

	it('over the cap clamps to exactly the cap (recall)', () => {
		const answer = 'a'.repeat(QUESTION_ANSWER_MAX + 30);
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'recall',
						prompt: 'Q?',
						options: [],
						answer,
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].answer.length).toBe(QUESTION_ANSWER_MAX);
		expect(block.questions[0].answer).toBe(answer.slice(0, QUESTION_ANSWER_MAX));
	});
});

describe('field-level caps — QUESTION_OPTION_MAX', () => {
	it('at the cap passes unchanged on an mcq option', () => {
		const longOpt = 'o'.repeat(QUESTION_OPTION_MAX);
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options: [longOpt, 'short'],
						answer: longOpt,
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].options[0]).toBe(longOpt);
		expect(block.questions[0].answer).toBe(longOpt);
	});

	it('over the cap clamps option and answer together so mcq still validates', () => {
		const over = 'o'.repeat(QUESTION_OPTION_MAX + 25);
		const clamped = over.slice(0, QUESTION_OPTION_MAX);
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options: [over, 'short'],
						answer: over,
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].options[0].length).toBe(QUESTION_OPTION_MAX);
		expect(block.questions[0].options[0]).toBe(clamped);
		expect(block.questions[0].answer).toBe(clamped);
		expect(block.questions[0].options).toContain(block.questions[0].answer);
	});
});

describe('field-level caps — MAX_OPTIONS_PER_QUESTION', () => {
	it('exactly 6 options passes unchanged', () => {
		const options = ['a', 'b', 'c', 'd', 'e', 'f'];
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options,
						answer: 'c',
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].options).toHaveLength(MAX_OPTIONS_PER_QUESTION);
		expect(block.questions[0].options).toEqual(options);
	});

	it('7 options clamps to 6', () => {
		const options = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options,
						answer: 'a',
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].options).toHaveLength(MAX_OPTIONS_PER_QUESTION);
		expect(block.questions[0].options).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
	});
});

describe('mcq coherence after option-count clamp', () => {
	it('answer at options[5] survives clamp to 6 and validates', () => {
		const options = ['o0', 'o1', 'o2', 'o3', 'o4', 'o5', 'o6'];
		const answer = options[5];
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options,
						answer,
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const block = result.block as Extract<PageBlock, { type: 'drill' }>;
		expect(block.questions[0].options).toHaveLength(6);
		expect(block.questions[0].options).toContain(answer);
	});

	it('answer at options[6] is dropped by clamp and the question is rejected', () => {
		const options = ['o0', 'o1', 'o2', 'o3', 'o4', 'o5', 'o6'];
		const answer = options[6];
		const result = validateBlock(
			validDrill({
				questions: [
					{
						type: 'mcq',
						prompt: 'Q?',
						options,
						answer,
						explanation_quip: ''
					}
				]
			})
		);
		expect(result.ok).toBe(false);
	});
});

describe('audit-trail regression — field clamps stay silent', () => {
	// These new clamps are deliberately left OUT of the executor's
	// cap-detection (detectBlocksCaps / buildPageCapDetail in executor.ts),
	// because that helper only inspects blocks.length and
	// block.questions.length — never the string/array lengths inside a
	// block's fields. None of these new clamps change blocks.length or a
	// drill's questions.length, so they cannot cause that helper to emit a
	// false "capped" claim; they clamp silently, matching the existing
	// silent-clamp precedent already set by VOCAB_SET_MAX_ENTRIES in
	// validateVocabSet (which the executor also never reports).
	it('oversized bead / trap body / question prompt still return only {ok, block}', () => {
		const beadResult = validateBlock(
			validGrammarCard({ formula: [bead('b'.repeat(BEAD_TEXT_MAX + 10))] })
		);
		expect(beadResult.ok).toBe(true);
		expect(Object.keys(beadResult)).toEqual(['ok', 'block']);

		const trapResult = validateBlock(
			validGrammarCard({
				trap: { title: 'Tip', body: 'b'.repeat(TRAP_BODY_MAX + 20) }
			})
		);
		expect(trapResult.ok).toBe(true);
		expect(Object.keys(trapResult)).toEqual(['ok', 'block']);

		const promptResult = validateBlock(
			validDrill({
				questions: [
					{
						type: 'recall',
						prompt: 'p'.repeat(QUESTION_PROMPT_MAX + 10),
						options: [],
						answer: 'A',
						explanation_quip: ''
					}
				]
			})
		);
		expect(promptResult.ok).toBe(true);
		expect(Object.keys(promptResult)).toEqual(['ok', 'block']);
	});
});

// ============================================================
// Null-equivalence — omit vs explicit null must produce IDENTICAL
// results for every field made nullable under strict tool schemas.
// ============================================================

describe('null-equivalence — omit vs explicit null', () => {
	function assertOmitEqualsNull(
		buildOmitted: () => unknown,
		buildNull: () => unknown,
		label: string
	) {
		const omitted = validateBlock(buildOmitted());
		const withNull = validateBlock(buildNull());
		expect(withNull, `${label}: null case`).toEqual(omitted);
	}

	it('grammar-card formulaTone: omit === null', () => {
		assertOmitEqualsNull(
			() => validGrammarCard(),
			() => validGrammarCard({ formulaTone: null }),
			'formulaTone'
		);
	});

	it('grammar-card trap: omit === null (GAP 1)', () => {
		assertOmitEqualsNull(
			() => validGrammarCard(),
			() => validGrammarCard({ trap: null }),
			'trap'
		);
	});

	it('grammar-card bead variant: omit === null', () => {
		assertOmitEqualsNull(
			() => validGrammarCard({ formula: [{ text: 'Subject' }] }),
			() => validGrammarCard({ formula: [{ text: 'Subject', variant: null }] }),
			'bead.variant'
		);
	});

	it('grammar-card trap.variant: omit === null', () => {
		assertOmitEqualsNull(
			() => validGrammarCard({ trap: { title: 'Gotcha', body: 'watch it' } }),
			() =>
				validGrammarCard({
					trap: { title: 'Gotcha', body: 'watch it', variant: null }
				}),
			'trap.variant'
		);
	});

	it('vocab-set title: omit === null', () => {
		assertOmitEqualsNull(
			() => validVocabSet(),
			() => validVocabSet({ title: null }),
			'vocab-set.title'
		);
	});

	it('vocab-set wordIds: omit === null (GAP 2)', () => {
		// Keep custom non-empty so both paths can succeed (both-empty rejects).
		assertOmitEqualsNull(
			() => {
				const { wordIds: _omit, ...rest } = validVocabSet({
					custom: [{ nl: 'huis', en: 'house' }]
				});
				void _omit;
				return rest;
			},
			() =>
				validVocabSet({
					wordIds: null,
					custom: [{ nl: 'huis', en: 'house' }]
				}),
			'vocab-set.wordIds'
		);
	});

	it('vocab-set custom: omit === null (GAP 2)', () => {
		assertOmitEqualsNull(
			() => {
				const { custom: _omit, ...rest } = validVocabSet({ wordIds: ['w1'] });
				void _omit;
				return rest;
			},
			() => validVocabSet({ wordIds: ['w1'], custom: null }),
			'vocab-set.custom'
		);
	});

	it('read title: omit === null', () => {
		assertOmitEqualsNull(
			() => validRead(),
			() => validRead({ title: null }),
			'read.title'
		);
	});

	it('drill question explanation_quip: omit === null', () => {
		assertOmitEqualsNull(
			() =>
				validDrill({
					questions: [
						{
							type: 'mcq',
							prompt: 'Q?',
							options: ['a', 'b'],
							answer: 'a'
						}
					]
				}),
			() =>
				validDrill({
					questions: [
						{
							type: 'mcq',
							prompt: 'Q?',
							options: ['a', 'b'],
							answer: 'a',
							explanation_quip: null
						}
					]
				}),
			'explanation_quip'
		);
	});
});

describe('null-equivalence — update_page title/labels/blocks (GAP 3)', () => {
	// Mirrors makeFakeHost from executor.test.ts (helper is not exported).
	function makeFakeHost(overrides: { state?: Partial<CurrentState>; nowISO?: string } = {}): {
		host: StewardHost;
		state: CurrentState;
	} {
		const state: CurrentState = {
			...createDefaultState(),
			...overrides.state,
			appConfig: {
				...createDefaultState().appConfig,
				...(overrides.state?.appConfig ?? {})
			},
			steward: {
				awards: [...(overrides.state?.steward?.awards ?? [])],
				lastForgivenWeek: overrides.state?.steward?.lastForgivenWeek ?? null
			},
			adjustments: [...(overrides.state?.adjustments ?? [])],
			pages: [...(overrides.state?.pages ?? [])]
		};

		let idSeq = 0;
		let lpCounter = 0;
		const nowISO = overrides.nowISO ?? '2026-07-15T12:00:00.000Z';

		const host: StewardHost = {
			getState: () => state,
			applyLpEvent(event: LpEvent): LpResult {
				lpCounter += 1;
				if (event.type === 'kuromi_award') {
					state.lp += event.amount;
					state.totalLp += event.amount;
				}
				return {
					rank: state.rank,
					tier: state.tier,
					lp: state.lp,
					totalLp: state.totalLp,
					delta: event.type === 'kuromi_award' ? event.amount : 0,
					tierChanged: false,
					rankChanged: false,
					gateBlocked: false,
					sfxEvents: []
				};
			},
			patchConfig(patch: Partial<AppConfig>): void {
				if (patch.progression) {
					state.appConfig.progression = {
						...state.appConfig.progression,
						...patch.progression
					};
				}
				if (patch.streaks !== undefined) state.appConfig.streaks = patch.streaks;
				if (patch.missions !== undefined) state.appConfig.missions = patch.missions;
				if (patch.quiz) {
					state.appConfig.quiz = { ...state.appConfig.quiz, ...patch.quiz };
				}
				if (patch.dailyPath) {
					state.appConfig.dailyPath = {
						...state.appConfig.dailyPath,
						...patch.dailyPath
					};
				}
			},
			setStreak(practiceDays: number, lastSessionDate: string | null): void {
				state.practiceDays = practiceDays;
				state.lastSessionDate = lastSessionDate;
			},
			appendAdjustment(entry: AdjustmentEntry): void {
				state.adjustments.push(entry);
			},
			recordAward(award: StewardAward): void {
				state.steward.awards.push(award);
			},
			markForgivenWeek(week: string): void {
				state.steward.lastForgivenWeek = week;
			},
			nowISO: () => nowISO,
			todayISO: () => '2026-07-15',
			newId: () => `id-${++idSeq}`,
			lpEventCounter: () => lpCounter,
			restoreLpSnapshot(snapshot): void {
				state.rank = snapshot.rank;
				state.tier = snapshot.tier;
				state.lp = snapshot.lp;
				state.totalLp = snapshot.totalLp;
			},
			markAdjustmentUndone(id: string): void {
				const entry = state.adjustments.find((a) => a.id === id);
				if (entry) entry.undone = true;
			},
			upsertPage(page: KuromiPage): void {
				const idx = state.pages.findIndex((p) => p.id === page.id);
				if (idx >= 0) state.pages[idx] = page;
				else state.pages.push(page);
			},
			removePage(id: string): void {
				state.pages = state.pages.filter((p) => p.id !== id);
			}
		};

		return { host, state };
	}

	function call(id: string, name: string, args: unknown): KuromiToolCall {
		return {
			id,
			name,
			arguments: typeof args === 'string' ? args : JSON.stringify(args)
		};
	}

	function seedPage(): KuromiPage {
		return {
			id: 'page-seed',
			title: 'Known Title',
			quip: 'seed quip',
			labels: ['grammar', 'vocab'],
			blocks: [{ type: 'note', body: 'seed body' }],
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
			archived: false
		};
	}

	it('omit title/labels/blocks leaves page unchanged; explicit null must match (GAP 3)', () => {
		const omitHost = makeFakeHost({ state: { pages: [seedPage()] } });
		const nullHost = makeFakeHost({ state: { pages: [seedPage()] } });

		const omitResult = executeIntents(
			[
				call('c1', 'update_page', {
					id: 'page-seed',
					reason: 'touch nothing via omit'
				})
			],
			omitHost.host
		);
		const nullResult = executeIntents(
			[
				call('c2', 'update_page', {
					id: 'page-seed',
					title: null,
					labels: null,
					blocks: null,
					reason: 'touch nothing via null'
				})
			],
			nullHost.host
		);

		expect(omitResult.results[0]?.outcome).toBe('applied');
		expect(nullResult.results[0]?.outcome).toBe('applied');
		expect(nullResult.results[0]).toMatchObject({
			outcome: omitResult.results[0]?.outcome
		});

		const omitPage = omitHost.state.pages.find((p) => p.id === 'page-seed');
		const nullPage = nullHost.state.pages.find((p) => p.id === 'page-seed');
		expect(omitPage).toBeDefined();
		expect(nullPage).toBeDefined();
		// title / labels / blocks must be identical (null must not clear or reject)
		expect(nullPage!.title).toBe(omitPage!.title);
		expect(nullPage!.labels).toEqual(omitPage!.labels);
		expect(nullPage!.blocks).toEqual(omitPage!.blocks);
		expect(nullPage!.title).toBe('Known Title');
		expect(nullPage!.labels).toEqual(['grammar', 'vocab']);
		expect(nullPage!.blocks).toEqual([{ type: 'note', body: 'seed body' }]);
	});
});
