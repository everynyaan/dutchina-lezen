import { resolveLoopItem, type LoopItem, type LoopPhase } from '$lib/reading/loop';

export type CoachPhase = 'locate' | 'options' | 'feedback';

export interface CoachMapEntry {
	role: string;
	summary: string;
	p?: number;
}

export interface CoachSource {
	question: string;
	qtype: string;
	move: string;
	answer: string;
	evidence: { quote: string; p?: number }[];
	distractors: Record<string, { trap: string; why?: string }>;
	paragraphMap?: CoachMapEntry[];
}

export interface LocatePacket {
	phase: 'locate';
	question: string;
	qtype: string;
	paragraphMap: { role: string; summary: string }[];
}

export interface OptionsPacket {
	phase: 'options';
	question: string;
	qtype: string;
	move: string;
}

export interface FeedbackPacket {
	phase: 'feedback';
	question: string;
	qtype: string;
	move: string;
	key: string;
	evidence: string[];
	traps: string[];
}

export type CoachPacket = LocatePacket | OptionsPacket | FeedbackPacket;

export interface TextChatPacket {
	passageText: string;
	paragraphMap: { role: string; summary: string }[];
	/** Unit 15 owns notebook entries. This build always sends an empty list. */
	notebook: [];
	items: CoachPacket[];
}

export interface MockDebriefPacket {
	correct: number;
	total: number;
	passLine: number;
	target: number;
	passed: boolean;
	minutesPerText: number[];
	flaggedRight: number;
	flaggedWrong: number;
	byQtype: { qtype: string; correct: number; total: number }[];
}

export interface GroundedCandidate {
	evidence?: { quote?: string }[];
	options?: Record<string, string>;
	answer?: string;
}

function mapRoles(
	entries: readonly CoachMapEntry[] | undefined
): { role: string; summary: string }[] {
	return (entries ?? []).map((entry) => ({ role: entry.role, summary: entry.summary }));
}

/**
 * What the model may see for one item.
 * Locate: question, qtype, roles and summaries. No paragraph index, key, evidence, or trap.
 * Options: question, qtype, and the move. No key, evidence, or trap.
 * Feedback: key, evidence quotes, and trap labels are all present.
 */
export function buildCoachContext(phase: CoachPhase, item: CoachSource): CoachPacket {
	if (phase === 'locate') {
		return {
			phase,
			question: item.question,
			qtype: item.qtype,
			paragraphMap: mapRoles(item.paragraphMap)
		};
	}
	if (phase === 'options') {
		return {
			phase,
			question: item.question,
			qtype: item.qtype,
			move: item.move
		};
	}
	return {
		phase: 'feedback',
		question: item.question,
		qtype: item.qtype,
		move: item.move,
		key: item.answer,
		evidence: item.evidence.map((row) => row.quote),
		traps: Object.values(item.distractors).map((row) => row.trap)
	};
}

export function coachSourceFromLoop(
	item: LoopItem,
	paragraphMap: readonly CoachMapEntry[] = []
): CoachSource {
	const resolved = resolveLoopItem(item);
	return {
		question: item.question,
		qtype: resolved.qtype,
		move: resolved.move,
		answer: item.answer,
		evidence: resolved.evidence.map((row) => ({ quote: row.quote, p: row.p })),
		distractors: resolved.distractors,
		paragraphMap: paragraphMap.map((entry) => ({
			role: entry.role,
			summary: entry.summary,
			p: entry.p
		}))
	};
}

function phaseForItem(
	id: string,
	answered: ReadonlySet<string>,
	activeId: string | null,
	activePhase: LoopPhase
): CoachPhase {
	if (answered.has(id) || (id === activeId && activePhase === 'feedback')) return 'feedback';
	if (id === activeId && activePhase === 'options') return 'options';
	return 'locate';
}

export function textChatFromLoop(input: {
	passageText: string;
	paragraphMap: readonly CoachMapEntry[];
	items: { id: string; item: LoopItem }[];
	answeredIds: ReadonlySet<string>;
	activeId: string | null;
	activePhase: LoopPhase;
}): TextChatPacket {
	return {
		passageText: input.passageText,
		paragraphMap: mapRoles(input.paragraphMap),
		notebook: [],
		items: input.items.map((row) =>
			buildCoachContext(
				phaseForItem(row.id, input.answeredIds, input.activeId, input.activePhase),
				coachSourceFromLoop(row.item, input.paragraphMap)
			)
		)
	};
}

/**
 * Accept a model-written practice item only when every evidence quote is an
 * exact substring of the passage and exactly one option key is the answer.
 * This build does not generate items and does not score accepted ones.
 */
export function acceptGroundedItem(passageText: string, item: GroundedCandidate): boolean {
	const quotes = (item.evidence ?? []).map((row) => row.quote);
	if (quotes.length === 0) return false;
	if (
		quotes.some(
			(quote) => typeof quote !== 'string' || quote.length === 0 || !passageText.includes(quote)
		)
	) {
		return false;
	}
	if (typeof item.answer !== 'string' || item.answer.length === 0) return false;
	const keys = Object.keys(item.options ?? {});
	return keys.filter((key) => key === item.answer).length === 1;
}
