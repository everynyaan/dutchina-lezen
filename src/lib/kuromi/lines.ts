/**
 * Reflex copy Kuromi may say with the model off.
 * UI labels stay the approved spec sentences. Longer moments come from kuromi-lines.json.
 * A missing path returns null. Do not invent a line to fill a gap.
 */

import rawLines from '../../../handoff/data/kuromi-lines.json';
import { QTYPE_LABEL, TRAP_LABEL } from '$lib/reading/annotations';
import { ROLE_LABEL } from '$lib/reading/loop';
import type { QType, TrapKind } from '$lib/reading/types';
import type { ParagraphRole } from '$lib/reading/loop';

export const WIFI_FALLBACK = 'the wifi is Dutch today';

/** Exact spec quotes. Keys are slots, values are the approved wording. */
export const APPROVED_REFLEX = {
	'wifi-fallback': WIFI_FALLBACK,
	'daily-open-example': 'rules text, six paragraphs, read the questions first',
	'locate-example': 'it is in a paragraph that states a rule, not in the example',
	'before-answer':
		'Before she has answered, never name a paragraph, an option or the answer. If she asks, refuse in character.',
	teaching:
		'Guess before lookup. Text before options. After a miss: what in the sentence would have told her, then name the lure. Before she answers: hints about where and how, never what.',
	'miss-ask': 'what in the sentence would have told her',
	'notebook-guess': 'guess first',
	'notebook-colon': 'look at what comes after the colon',
	'notebook-reason': 'the sentence before gives the reason',
	'note-label': "Kuromi's note this week",
	'question-label': "Kuromi's question",
	'ask-label': 'Ask Kuromi',
	'hint-label': 'Hint'
} as const;

export type ApprovedReflexId = keyof typeof APPROVED_REFLEX;

/** Authored reflex slots. Nested paths use a dot, such as map-comment.right. */
export const REFLEX_GAPS = [
	'daily-open',
	'map-comment',
	'right-reaction',
	'miss-reaction',
	'done-card',
	'drill-intro',
	'drill-reaction',
	'card-tamed',
	'mock-debrief',
	'readiness-plan',
	'monday-message',
	'playbook-voice',
	'trap-labels',
	'notebook-prompts'
] as const;

export type ReflexGapId = (typeof REFLEX_GAPS)[number];

/** Slots that may be spoken before she has answered. Everything else waits. */
export const BEFORE_ANSWER_SLOTS = [
	'daily-open',
	'map-comment',
	'drill-intro',
	'readiness-plan',
	'monday-message',
	'playbook-voice',
	'trap-labels',
	'notebook-prompts'
] as const;

type ReflexNode = string[] | { [key: string]: ReflexNode };

const LINES = rawLines as ReflexNode;

export type ReflexVars = {
	itemId?: string;
	date?: string;
} & Record<string, string | undefined>;

function hash(value: string): number {
	let h = 2166136261;
	for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619) >>> 0;
	return h;
}

function linesAt(path: string): string[] | null {
	const parts = path.split('.').filter(Boolean);
	let node: ReflexNode = LINES;
	for (const part of parts) {
		if (Array.isArray(node) || !(part in node)) return null;
		node = node[part];
	}
	return Array.isArray(node) && node.length > 0 ? node : null;
}

function looksLikeItemId(value: string): boolean {
	return /^(lezen-|p-legacy-|p-|set\d)/.test(value);
}

function human(key: string, value: string): string {
	if (key === 'trap' || key === 'lure') {
		if (value in TRAP_LABEL) return TRAP_LABEL[value as TrapKind];
	}
	if (key === 'role' && value in ROLE_LABEL) return ROLE_LABEL[value as ParagraphRole];
	if (key === 'weakestType' && value in QTYPE_LABEL) return QTYPE_LABEL[value as QType];
	if (looksLikeItemId(value)) return '';
	if (key === 'move') {
		const sentence = value.trim();
		if (!sentence) return '';
		const ended = /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
		return ended.charAt(0).toLocaleUpperCase('en') + ended.slice(1);
	}
	return value;
}

function startsSentence(template: string, offset: number): boolean {
	const before = template.slice(0, offset).trimEnd();
	return before === '' || /[.!?]$/.test(before);
}

function fill(template: string, vars: ReflexVars): string {
	return template.replace(/\{([A-Za-z]+)\}/g, (match, key: string, offset: number) => {
		const raw = vars[key];
		if (raw === undefined) return match;
		const value = human(key, raw);
		if (!value) return '';
		if (key === 'move' || !startsSentence(template, offset)) return value;
		return value.charAt(0).toLocaleUpperCase('en') + value.slice(1);
	});
}

export function reflexSlots(): string[] {
	const out: string[] = [];
	function walk(node: ReflexNode, prefix: string) {
		if (Array.isArray(node)) {
			if (prefix) out.push(prefix);
			return;
		}
		for (const [key, child] of Object.entries(node)) {
			walk(child, prefix ? `${prefix}.${key}` : key);
		}
	}
	walk(LINES, '');
	return out;
}

export function canRenderBeforeAnswer(path: string): boolean {
	const root = path.split('.')[0] ?? path;
	return (BEFORE_ANSWER_SLOTS as readonly string[]).includes(root);
}

/** Pick one line for a path. The same item id and date always pick the same line. */
export function reflexLine(path: string, vars: ReflexVars = {}): string | null {
	if (Object.prototype.hasOwnProperty.call(APPROVED_REFLEX, path)) {
		return APPROVED_REFLEX[path as ApprovedReflexId];
	}
	const lines = linesAt(path);
	if (!lines) return null;
	const index = hash(`${vars.itemId ?? ''}|${vars.date ?? ''}|${path}`) % lines.length;
	return fill(lines[index], vars);
}

/** A reflex line only when this slot is allowed before she answers. */
export function reflexBeforeAnswer(path: string, vars: ReflexVars = {}): string | null {
	if (!canRenderBeforeAnswer(path)) return null;
	return reflexLine(path, vars);
}
