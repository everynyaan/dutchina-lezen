// ============================================================
// PAGE SCHEMA — pure validators for Kuromi page blocks
// Dependency-free: types from $lib/state/schema only.
// No Svelte, no localStorage, no Dexie, no content lookups.
// ============================================================

import type {
	KuromiPage,
	PageBead,
	PageBlock,
	PageBlockDrill,
	PageBlockGrammarCard,
	PageBlockNote,
	PageBlockRead,
	PageBlockVocabSet,
	PageDrillQuestion,
	PageExample,
	PageTrap
} from '$lib/state/schema';

export const MAX_ACTIVE_PAGES = 60;
export const MAX_BLOCKS_PER_PAGE = 20;
export const MAX_QUESTIONS_PER_DRILL = 10;
export const MAX_LABELS_PER_PAGE = 6;
export const MAX_LABEL_CHARS = 24;
export const SUGGESTED_LABELS = [
	'grammar',
	'vocab',
	'phrases',
	'listening',
	'review',
	'challenge'
] as const;

export const PAGE_TITLE_MAX = 80;
export const PAGE_QUIP_MAX = 200;
export const NOTE_BODY_MAX = 2000;
export const READ_TEXT_MAX = 2000;
export const VOCAB_PAIR_MAX = 120;
export const VOCAB_SET_MAX_ENTRIES = 40;

// Bead text inside a grammar-card formula (FormulaBar chip) -- a short
// pattern word/phrase, not prose. Real content in GRAMMAR_CONTENT.ts maxes
// out at 9 chars (e.g. "werkwoord").
export const BEAD_TEXT_MAX = 40;
// Max beads in one grammar-card formula -- a FormulaBar is a short pattern,
// not a sentence. Real content maxes out at 3 beads.
export const GRAMMAR_FORMULA_MAX_BEADS = 12;
// grammar-card example.nl / example.en -- one example sentence, same shape
// as a vocab pair but a little roomier. Real content maxes out at 61 chars.
export const GRAMMAR_EXAMPLE_MAX = 160;
// Trap callout title. Real content maxes out at 38 chars.
export const TRAP_TITLE_MAX = 80;
// Trap callout body -- a short paragraph, longer than a quip. Real content
// in GRAMMAR_CONTENT.ts maxes out at 366 chars; capped comfortably above
// that so a legitimate teaching example is never truncated.
export const TRAP_BODY_MAX = 500;
// vocab-set wordIds are lookup keys into WORD_POOL, not free text -- real
// ids are 5 chars (e.g. "w1045"). Clamped, not rejected: an over-length id
// just fails the pool lookup and renders nothing, same as any unknown id
// today (see VocabSetBlock.svelte).
export const VOCAB_WORD_ID_MAX = 40;
// Drill question prompt, answer, each options text, and the option count.
export const QUESTION_PROMPT_MAX = 300;
export const QUESTION_ANSWER_MAX = 200;
export const QUESTION_OPTION_MAX = 200;
export const MAX_OPTIONS_PER_QUESTION = 6;

const BEAD_VARIANTS = new Set(['default', 'verb', 'subject', 'ghost']);
const FORMULA_TONES = new Set(['rose', 'lavender', 'teal', 'peach']);
const TRAP_VARIANTS = new Set(['tip', 'trap']);
const QUESTION_TYPES = new Set(['mcq', 'recall']);

function isRecord(x: unknown): x is Record<string, unknown> {
	return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function clampString(s: string, max: number): string {
	return s.length <= max ? s : s.slice(0, max);
}

function asNonEmptyString(x: unknown): string | null {
	if (typeof x !== 'string') return null;
	return x.length > 0 ? x : null;
}

export function normalizeLabel(raw: string): string {
	return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeLabels(raw: unknown): string[] {
	if (!Array.isArray(raw)) return [];
	const out: string[] = [];
	const seen = new Set<string>();
	for (const item of raw) {
		if (typeof item !== 'string') continue;
		const normalized = normalizeLabel(item);
		if (normalized.length === 0) continue;
		const clamped = clampString(normalized, MAX_LABEL_CHARS);
		if (seen.has(clamped)) continue;
		seen.add(clamped);
		out.push(clamped);
		if (out.length >= MAX_LABELS_PER_PAGE) break;
	}
	return out;
}

export function countActivePages(pages: KuromiPage[]): number {
	let n = 0;
	for (const page of pages) {
		// Missing or non-boolean archived counts as active (fail toward the cap).
		if ((page as { archived?: unknown }).archived === true) continue;
		n += 1;
	}
	return n;
}

function validateBead(raw: unknown): PageBead | null {
	if (!isRecord(raw)) return null;
	const text = asNonEmptyString(raw.text);
	if (text === null) return null;
	const bead: PageBead = { text: clampString(text, BEAD_TEXT_MAX) };
	if (typeof raw.variant === 'string' && BEAD_VARIANTS.has(raw.variant)) {
		bead.variant = raw.variant as PageBead['variant'];
	}
	return bead;
}

function validateExample(raw: unknown, maxPair: number): PageExample | null {
	if (!isRecord(raw)) return null;
	const nlRaw = asNonEmptyString(raw.nl);
	const enRaw = asNonEmptyString(raw.en);
	if (nlRaw === null || enRaw === null) return null;
	return {
		nl: clampString(nlRaw, maxPair),
		en: clampString(enRaw, maxPair)
	};
}

function validateTrap(raw: unknown): PageTrap | null {
	if (!isRecord(raw)) return null;
	const title = asNonEmptyString(raw.title);
	const body = asNonEmptyString(raw.body);
	if (title === null || body === null) return null;
	const trap: PageTrap = {
		title: clampString(title, TRAP_TITLE_MAX),
		body: clampString(body, TRAP_BODY_MAX)
	};
	if (typeof raw.variant === 'string' && TRAP_VARIANTS.has(raw.variant)) {
		trap.variant = raw.variant as PageTrap['variant'];
	}
	return trap;
}

function validateGrammarCard(
	raw: Record<string, unknown>
): { ok: true; block: PageBlockGrammarCard } | { ok: false; error: string } {
	if (typeof raw.title !== 'string') {
		return { ok: false, error: 'grammar-card title must be a string' };
	}
	const title = clampString(raw.title, PAGE_TITLE_MAX);
	if (!Array.isArray(raw.formula) || raw.formula.length === 0) {
		return { ok: false, error: 'grammar-card formula must be a non-empty array' };
	}
	const formula: PageBead[] = [];
	for (const item of raw.formula.slice(0, GRAMMAR_FORMULA_MAX_BEADS)) {
		const bead = validateBead(item);
		if (bead === null) {
			return { ok: false, error: 'grammar-card formula bead invalid' };
		}
		formula.push(bead);
	}
	const example = validateExample(raw.example, GRAMMAR_EXAMPLE_MAX);
	if (example === null) {
		return { ok: false, error: 'grammar-card example.nl and example.en must be non-empty strings' };
	}
	const block: PageBlockGrammarCard = { type: 'grammar-card', title, formula, example };
	if (typeof raw.formulaTone === 'string' && FORMULA_TONES.has(raw.formulaTone)) {
		block.formulaTone = raw.formulaTone as PageBlockGrammarCard['formulaTone'];
	}
	if (raw.trap !== undefined && raw.trap !== null) {
		const trap = validateTrap(raw.trap);
		if (trap === null) {
			return { ok: false, error: 'grammar-card trap title and body must be non-empty' };
		}
		block.trap = trap;
	}
	return { ok: true, block };
}

function validateVocabSet(
	raw: Record<string, unknown>
): { ok: true; block: PageBlockVocabSet } | { ok: false; error: string } {
	if (raw.wordIds !== undefined && raw.wordIds !== null && !Array.isArray(raw.wordIds)) {
		return { ok: false, error: 'vocab-set wordIds must be an array' };
	}
	if (raw.custom !== undefined && raw.custom !== null && !Array.isArray(raw.custom)) {
		return { ok: false, error: 'vocab-set custom must be an array' };
	}
	const wordIdsIn = Array.isArray(raw.wordIds) ? raw.wordIds : [];
	const customIn = Array.isArray(raw.custom) ? raw.custom : [];

	const wordIds: string[] = [];
	for (const id of wordIdsIn) {
		if (typeof id !== 'string' || id.length === 0) {
			return { ok: false, error: 'vocab-set wordIds must be non-empty strings' };
		}
		wordIds.push(clampString(id, VOCAB_WORD_ID_MAX));
	}
	const custom: PageExample[] = [];
	for (const pair of customIn) {
		const example = validateExample(pair, VOCAB_PAIR_MAX);
		if (example === null) {
			return { ok: false, error: 'vocab-set custom entries need non-empty nl and en' };
		}
		custom.push(example);
	}
	if (wordIds.length === 0 && custom.length === 0) {
		return { ok: false, error: 'vocab-set wordIds and custom may not both be empty' };
	}

	// Clamp combined entries to VOCAB_SET_MAX_ENTRIES (wordIds first, then custom).
	let remaining = VOCAB_SET_MAX_ENTRIES;
	const clampedWordIds = wordIds.slice(0, remaining);
	remaining -= clampedWordIds.length;
	const clampedCustom = custom.slice(0, remaining);

	const block: PageBlockVocabSet = {
		type: 'vocab-set',
		wordIds: clampedWordIds,
		custom: clampedCustom
	};
	if (typeof raw.title === 'string') {
		block.title = clampString(raw.title, PAGE_TITLE_MAX);
	}
	return { ok: true, block };
}

function validateQuestion(
	raw: unknown
): { ok: true; question: PageDrillQuestion } | { ok: false; error: string } {
	if (!isRecord(raw)) return { ok: false, error: 'drill question must be a record' };
	if (typeof raw.type !== 'string' || !QUESTION_TYPES.has(raw.type)) {
		return { ok: false, error: 'drill question type must be mcq or recall' };
	}
	const promptRaw = asNonEmptyString(raw.prompt);
	const answerRaw = asNonEmptyString(raw.answer);
	if (promptRaw === null || answerRaw === null) {
		return { ok: false, error: 'drill question prompt and answer must be non-empty strings' };
	}
	if (!Array.isArray(raw.options)) {
		return { ok: false, error: 'drill question options must be an array' };
	}
	const optionsRaw: string[] = [];
	for (const opt of raw.options) {
		if (typeof opt !== 'string' || opt.length === 0) {
			return { ok: false, error: 'drill question options must be non-empty strings' };
		}
		optionsRaw.push(opt);
	}
	// Clamp before the mcq coherence check below runs -- that check must see
	// exactly what gets persisted, never the raw pre-clamp values.
	const prompt = clampString(promptRaw, QUESTION_PROMPT_MAX);
	const answer = clampString(answerRaw, QUESTION_ANSWER_MAX);
	const options = optionsRaw
		.slice(0, MAX_OPTIONS_PER_QUESTION)
		.map((opt) => clampString(opt, QUESTION_OPTION_MAX));
	if (raw.type === 'mcq') {
		if (options.length < 2) {
			return { ok: false, error: 'mcq requires at least 2 options' };
		}
		if (!options.includes(answer)) {
			return { ok: false, error: 'mcq answer must be present in options' };
		}
	}
	const explanation =
		typeof raw.explanation_quip === 'string'
			? clampString(raw.explanation_quip, PAGE_QUIP_MAX)
			: '';
	return {
		ok: true,
		question: {
			type: raw.type as 'mcq' | 'recall',
			prompt,
			options,
			answer,
			explanation_quip: explanation
		}
	};
}

function validateDrill(
	raw: Record<string, unknown>
): { ok: true; block: PageBlockDrill } | { ok: false; error: string } {
	if (typeof raw.title !== 'string') {
		return { ok: false, error: 'drill title must be a string' };
	}
	if (typeof raw.intro_quip !== 'string') {
		return { ok: false, error: 'drill intro_quip must be a string' };
	}
	if (!Array.isArray(raw.questions) || raw.questions.length === 0) {
		return { ok: false, error: 'drill questions must be a non-empty array' };
	}
	const questions: PageDrillQuestion[] = [];
	for (const q of raw.questions.slice(0, MAX_QUESTIONS_PER_DRILL)) {
		const result = validateQuestion(q);
		if (!result.ok) return result;
		questions.push(result.question);
	}
	return {
		ok: true,
		block: {
			type: 'drill',
			title: clampString(raw.title, PAGE_TITLE_MAX),
			intro_quip: clampString(raw.intro_quip, PAGE_QUIP_MAX),
			questions
		}
	};
}

function validateRead(
	raw: Record<string, unknown>
): { ok: true; block: PageBlockRead } | { ok: false; error: string } {
	const nl = asNonEmptyString(raw.nl);
	const en = asNonEmptyString(raw.en);
	if (nl === null || en === null) {
		return { ok: false, error: 'read nl and en must be non-empty strings' };
	}
	const block: PageBlockRead = {
		type: 'read',
		nl: clampString(nl, READ_TEXT_MAX),
		en: clampString(en, READ_TEXT_MAX)
	};
	if (typeof raw.title === 'string') {
		block.title = clampString(raw.title, PAGE_TITLE_MAX);
	}
	return { ok: true, block };
}

function validateNote(
	raw: Record<string, unknown>
): { ok: true; block: PageBlockNote } | { ok: false; error: string } {
	const body = asNonEmptyString(raw.body);
	if (body === null) {
		return { ok: false, error: 'note body must be a non-empty string' };
	}
	return {
		ok: true,
		block: { type: 'note', body: clampString(body, NOTE_BODY_MAX) }
	};
}

export function validateBlock(
	raw: unknown
): { ok: true; block: PageBlock } | { ok: false; error: string } {
	if (!isRecord(raw)) {
		return { ok: false, error: 'block must be a record' };
	}
	const type = raw.type;
	if (typeof type !== 'string') {
		return { ok: false, error: 'block type must be a string' };
	}
	switch (type) {
		case 'grammar-card':
			return validateGrammarCard(raw);
		case 'vocab-set':
			return validateVocabSet(raw);
		case 'drill':
			return validateDrill(raw);
		case 'read':
			return validateRead(raw);
		case 'note':
			return validateNote(raw);
		default:
			return { ok: false, error: `unknown block type: ${type}` };
	}
}

export function validateBlocks(
	raw: unknown
): { ok: true; blocks: PageBlock[] } | { ok: false; error: string } {
	if (!Array.isArray(raw)) {
		return { ok: false, error: 'blocks must be an array' };
	}
	if (raw.length === 0) {
		return { ok: false, error: 'blocks must be non-empty' };
	}
	const blocks: PageBlock[] = [];
	for (const item of raw.slice(0, MAX_BLOCKS_PER_PAGE)) {
		const result = validateBlock(item);
		if (!result.ok) return result;
		blocks.push(result.block);
	}
	return { ok: true, blocks };
}
