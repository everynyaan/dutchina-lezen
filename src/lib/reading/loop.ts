import { seededRng, shuffle } from '$lib/quiz/rng';
import { getAnnotation, QTYPE_MOVE } from './annotations';
import type { Evidence, QType, TrapKind } from './types';

export const WHOLE_TEXT_QTYPES = ['doel-tekst', 'hoofdgedachte', 'bron-publiek'] as const;

export type LoopPhase = 'locate' | 'options' | 'feedback';

export interface LoopItem {
	id: string;
	question: string;
	options: Record<string, string>;
	answer: string;
	qtype?: QType;
	why?: string;
	distractors?: Record<string, { trap: TrapKind; why: string }>;
	evidence?: Evidence[];
}

export interface ResolvedLoopItem {
	qtype: QType;
	why: string;
	move: string;
	distractors: Record<string, { trap: TrapKind; why: string }>;
	evidence: Evidence[];
	wholeText: boolean;
}

export interface DisplayOption {
	display: string;
	original: string;
	text: string;
}

export interface TextRun {
	text: string;
	mark: boolean;
}

const DISPLAY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const LIST_LINE = /^(?:[•▪]|- )/;

export const PARAGRAPH_ROLES = [
	'introduces-topic',
	'background-origin',
	'gives-example',
	'problem-risk',
	'rules-and-conflict',
	'states-rule',
	'exception-condition',
	'reports-opinion',
	'reports-research',
	'advice-instruction',
	'conclusion'
] as const;
export type ParagraphRole = (typeof PARAGRAPH_ROLES)[number];

export const ROLE_LABEL: Record<ParagraphRole, string> = {
	'introduces-topic': 'Introduces the topic',
	'background-origin': 'Gives the origin',
	'gives-example': 'Gives an example',
	'problem-risk': 'Names a problem',
	'rules-and-conflict': 'Sets out a conflict',
	'states-rule': 'States a rule',
	'exception-condition': 'Gives an exception',
	'reports-opinion': 'Reports an opinion',
	'reports-research': 'Reports research',
	'advice-instruction': 'Gives advice',
	conclusion: 'Draws a conclusion'
};

export interface ParagraphMapEntry {
	p: number;
	anchor: string;
	role: ParagraphRole;
	summary: string;
}

export function isWholeText(qtype: QType): boolean {
	return (WHOLE_TEXT_QTYPES as readonly string[]).includes(qtype);
}

export function resolveLoopItem(item: LoopItem): ResolvedLoopItem {
	const annotation = getAnnotation(item.id);
	const qtype = item.qtype ?? annotation?.qtype ?? 'detail';
	return {
		qtype,
		why: item.why ?? annotation?.why ?? '',
		move: QTYPE_MOVE[qtype],
		distractors: item.distractors ?? annotation?.distractors ?? {},
		evidence: item.evidence ?? annotation?.evidence ?? [],
		wholeText: isWholeText(qtype)
	};
}

export function shownPhase(phase: LoopPhase, wholeText: boolean): LoopPhase {
	if (wholeText && phase === 'locate') return 'options';
	return phase;
}

/** Display letters are A, B, C in the shuffled order. `original` is the stored letter. */
export function displayOptions(
	options: Record<string, string>,
	shuffleOn: boolean,
	seed: string
): DisplayOption[] {
	const entries = Object.entries(options);
	if (!shuffleOn) {
		return entries.map(([original, text]) => ({ display: original, original, text }));
	}
	const ordered = shuffle(entries, seededRng(seed));
	return ordered.map(([original, text], index) => ({
		display: DISPLAY_LETTERS[index] ?? String(index + 1),
		original,
		text
	}));
}

export function isListParagraph(text: string): boolean {
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
	return lines.length > 0 && lines.every((line) => LIST_LINE.test(line));
}

export function isHeading(text: string, index: number): boolean {
	const trimmed = text.trim();
	if (!trimmed || isListParagraph(trimmed)) return false;
	if (trimmed.includes('\n')) return false;
	if (/[.!?)\u201D"]$/.test(trimmed)) return false;
	return trimmed.length < (index === 0 ? 120 : 80);
}

export function listLines(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => line.replace(/^(?:[•▪]|- )\s*/, ''));
}

export function markQuotes(text: string, quotes: readonly string[]): TextRun[] {
	const ranges: { start: number; end: number }[] = [];
	const ordered = [...quotes]
		.filter((quote) => quote.length > 0)
		.sort((a, b) => b.length - a.length);
	for (const quote of ordered) {
		let from = 0;
		while (from < text.length) {
			const at = text.indexOf(quote, from);
			if (at < 0) break;
			const end = at + quote.length;
			const overlaps = ranges.some((range) => at < range.end && end > range.start);
			if (!overlaps) ranges.push({ start: at, end });
			from = at + quote.length;
		}
	}
	ranges.sort((a, b) => a.start - b.start);
	if (ranges.length === 0) return [{ text, mark: false }];
	const runs: TextRun[] = [];
	let cursor = 0;
	for (const range of ranges) {
		if (range.start > cursor) runs.push({ text: text.slice(cursor, range.start), mark: false });
		runs.push({ text: text.slice(range.start, range.end), mark: true });
		cursor = range.end;
	}
	if (cursor < text.length) runs.push({ text: text.slice(cursor), mark: false });
	return runs;
}

export function temptingLure(
	distractors: Record<string, { trap: TrapKind; why: string }>,
	options: Record<string, string>
): { letter: string; text: string; trap: TrapKind } | null {
	const entries = Object.entries(distractors);
	const pick = entries.find(([, row]) => row.trap !== 'niet-in-tekst') ?? entries[0];
	if (!pick) return null;
	const [letter, row] = pick;
	return { letter, text: options[letter] ?? '', trap: row.trap };
}

/** Right role, plus two others from this passage when it has them. */
export function roleChoices(
	correct: ParagraphRole,
	passageRoles: readonly ParagraphRole[],
	seed: string
): ParagraphRole[] {
	const fromPassage = [...new Set(passageRoles.filter((role) => role !== correct))];
	const rest = PARAGRAPH_ROLES.filter((role) => role !== correct && !fromPassage.includes(role));
	const fillers = shuffle([...fromPassage, ...rest], seededRng(seed));
	const trio = [correct, fillers[0], fillers[1]].filter((role): role is ParagraphRole =>
		Boolean(role)
	);
	return shuffle(trio, seededRng(`${seed}|order`));
}
