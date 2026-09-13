/**
 * Phase 1 home + hub. Copy, routing, and viewable mastery bars.
 * Unlock still lives in mastery.ts — this file only reads the predicate.
 */
import { getWordsUpToGate, isGateId, type GateId } from './gates';
import type { WordEntry } from '$lib/data/wordPool';
import type { MasteryInput } from './mastery';
import {
	EMPTY_MASTERY_INPUT,
	evaluateGateProgress,
	type GateProgress
} from './progress';

export const GATE_COPY: Record<GateId, { title: string; when: string }> = {
	1: { title: 'First words', when: "You're here." },
	2: {
		title: 'Everyday Dutch',
		when: 'Opens when Gate 1 words stick and the quizzes here are solid.'
	},
	3: {
		title: 'Real sentences',
		when: 'Opens when Gate 2 is mastered. Exam paper stays optional until then.'
	},
	4: {
		title: 'B1',
		when: 'Opens when Gate 3 is mastered. This is the exam room.'
	}
};

export const GATE_IDENTITY: Record<GateId, 'rose' | 'lavender' | 'peach' | 'teal'> = {
	1: 'rose',
	2: 'lavender',
	3: 'peach',
	4: 'teal'
};

export const PAST_GATE_WHEN = 'Open.';

export interface GateSticker {
	n: GateId;
	title: string;
	icon: string;
}

/** Collection stickers — four rooms, never Iron–Master. */
export const GATE_STICKERS: GateSticker[] = [
	{ n: 1, title: GATE_COPY[1].title, icon: 'BookOpen' },
	{ n: 2, title: GATE_COPY[2].title, icon: 'BookMarked' },
	{ n: 3, title: GATE_COPY[3].title, icon: 'BookOpenCheck' },
	{ n: 4, title: GATE_COPY[4].title, icon: 'GraduationCap' }
];

export function gateStickerEarned(n: GateId, current: GateId, mastered: number[]): boolean {
	return n <= current || mastered.includes(n);
}

export type HubResolution =
	| { kind: 'open'; gate: GateId; requested: GateId }
	| { kind: 'locked'; requested: GateId; current: GateId };

export function parseGateQuery(raw: string | null | undefined): GateId | null {
	if (raw == null || raw === '') return null;
	const n = Number(raw);
	return isGateId(n) ? n : null;
}

/** URL n later than current → lock. Missing/invalid n → current hub. */
export function resolveHub(requested: GateId | null, current: GateId): HubResolution {
	const gate = requested ?? current;
	if (gate > current) return { kind: 'locked', requested: gate, current };
	return { kind: 'open', gate, requested: gate };
}

/** Locked hub never returns a later-gate pool. */
export function hubWords(resolution: HubResolution): WordEntry[] {
	if (resolution.kind === 'locked') return [];
	return getWordsUpToGate(resolution.gate);
}

export type HubLinkId = 'quiz' | 'weekset' | 'words' | 'grammar' | 'boss' | 'lezen' | 'luisteren';

/** Exam gym is off home and off Gate 1/2 hub. G3+ may show it as optional. */
export function hubShowsExamGym(gate: GateId): boolean {
	return gate >= 3;
}

export function hubLinks(resolution: HubResolution): HubLinkId[] {
	if (resolution.kind === 'locked') return [];
	const links: HubLinkId[] = ['quiz', 'weekset', 'words'];
	if (resolution.gate === 1) links.push('grammar');
	links.push('boss');
	if (hubShowsExamGym(resolution.gate)) links.push('lezen', 'luisteren');
	return links;
}

/**
 * Homework generators follow the open (current) gate, never a later URL n.
 * Locked hub → null so callers must not generate G2+ from a G1 lock screen.
 */
export function homeworkGateForHub(resolution: HubResolution, current: GateId): GateId | null {
	if (resolution.kind === 'locked') return null;
	return current;
}

export interface HomeGateCard {
	n: GateId;
	title: string;
	when: string;
	open: boolean;
	current: boolean;
	href: string | null;
	identity: 'rose' | 'lavender' | 'peach' | 'teal';
	progress: GateProgress;
}

/** Locked rooms and their when-lines — what Kuromi is allowed to explain. */
export function lockWhenLines(current: GateId): { gate: GateId; when: string }[] {
	return ([1, 2, 3, 4] as const)
		.filter((n) => n > current)
		.map((n) => ({ gate: n, when: GATE_COPY[n].when }));
}

export function homeGateCards(
	current: GateId,
	input: MasteryInput = EMPTY_MASTERY_INPUT,
	mastered: number[] = []
): HomeGateCard[] {
	return ([1, 2, 3, 4] as const).map((n) => {
		const isCurrent = n === current;
		const open = n <= current;
		const progress = evaluateGateProgress(n, current, mastered, input);
		const when = isCurrent
			? progress.line
			: open
				? PAST_GATE_WHEN
				: GATE_COPY[n].when;
		return {
			n,
			title: GATE_COPY[n].title,
			when,
			open,
			current: isCurrent,
			href: open ? `/gate?n=${n}` : null,
			identity: GATE_IDENTITY[n],
			progress
		};
	});
}
