/**
 * Gate helpers. Phase 1a: allowlist + exam mix + fail-safe currentGate.
 * Mastery A∧B∧C∧D is Phase 3 — this file does not advance current.
 */
import { WORD_POOL, type WordEntry } from '$lib/data/wordPool';
import { STORIES } from '$lib/conversation/CONVERSATION_CONTENT';
import type { ConversationStory } from '$lib/conversation/types';
import {
	DROP_FROM_HOMEWORK_SET,
	GATE1_SENTENCE_OVERLAY,
	GATE1_WORD_ID_SET,
	HARD_G1_FRAME_RE
} from './gate1Allowlist';

export type GateId = 1 | 2 | 3 | 4;

export interface GatesState {
	current: GateId;
	mastered: number[];
	quizLog: { gate: number; date: string; correct: number; total: number }[];
	weekLog: { gate: number; week: string; correct: number; total: number }[];
}

export const DEFAULT_GATES: GatesState = {
	current: 1,
	mastered: [],
	quizLog: [],
	weekLog: []
};

/** Internal rank band for G2–G4. Gate 1 does not use this. */
const GATE_RANK_RANGE: Record<Exclude<GateId, 1>, readonly [number, number]> = {
	2: [2, 3],
	3: [4, 5],
	4: [6, 7]
};

export function isGateId(n: unknown): n is GateId {
	return n === 1 || n === 2 || n === 3 || n === 4;
}

export function rankToGate(rank: number): GateId {
	if (rank <= 1) return 1;
	if (rank <= 3) return 2;
	if (rank <= 5) return 3;
	return 4;
}

/**
 * Placement once at migrate. Iron or empty/sparse SRS → Gate 1.
 * Do not trust a high rank with almost no cards.
 */
export function placementFromState(rank: number, introducedCount: number): GateId {
	if (rank <= 1 || introducedCount < 10) return 1;
	return rankToGate(rank);
}

export function currentGateFromState(state: {
	rank?: number;
	cardReviews?: Record<string, unknown>;
	gates?: { current?: number };
}): GateId {
	if (isGateId(state.gates?.current)) return state.gates.current;
	const introduced = state.cardReviews ? Object.keys(state.cardReviews).length : 0;
	return placementFromState(state.rank ?? 0, introduced);
}

/** NT2 paper in daily five / week set. G1–G3: never. G4: yes. */
export function examInHomework(gate: GateId): boolean {
	return gate >= 4;
}

function applyGate1Sentence(word: WordEntry): WordEntry {
	const overlay = GATE1_SENTENCE_OVERLAY[word.id];
	if (overlay) {
		return { ...word, sentence_nl: overlay.sentence_nl, sentence_en: overlay.sentence_en };
	}
	if (HARD_G1_FRAME_RE.test(word.sentence_nl)) {
		return { ...word, sentence_nl: word.dutch, sentence_en: word.english };
	}
	return word;
}

export function getWordsForGate(gate: GateId): WordEntry[] {
	if (gate === 1) {
		return WORD_POOL.filter((w) => GATE1_WORD_ID_SET.has(w.id)).map(applyGate1Sentence);
	}
	const [lo, hi] = GATE_RANK_RANGE[gate];
	return WORD_POOL.filter(
		(w) =>
			w.rank >= lo &&
			w.rank <= hi &&
			!DROP_FROM_HOMEWORK_SET.has(w.id) &&
			!GATE1_WORD_ID_SET.has(w.id)
	);
}

export function getWordsUpToGate(gate: GateId): WordEntry[] {
	const ids = new Set<string>();
	const out: WordEntry[] = [];
	for (let g = 1; g <= gate; g++) {
		for (const word of getWordsForGate(g as GateId)) {
			if (ids.has(word.id)) continue;
			ids.add(word.id);
			out.push(word);
		}
	}
	return out;
}

/**
 * Gate 1: no Olly chapters (cs_0 / cs_1 are A2 novels).
 * G2: ranks 0–3 (moved G1 stories + everyday pair).
 * G3: ranks 4–5. G4: ranks 6–7.
 */
export function getStoriesForGate(gate: GateId): ConversationStory[] {
	if (gate === 1) return [];
	if (gate === 2) return STORIES.filter((s) => s.rank <= 3);
	if (gate === 3) return STORIES.filter((s) => s.rank === 4 || s.rank === 5);
	return STORIES.filter((s) => s.rank >= 6);
}

export function getStoriesUpToGate(gate: GateId): ConversationStory[] {
	const seen = new Set<string>();
	const out: ConversationStory[] = [];
	for (let g = 1; g <= gate; g++) {
		for (const story of getStoriesForGate(g as GateId)) {
			if (seen.has(story.id)) continue;
			seen.add(story.id);
			out.push(story);
		}
	}
	return out;
}

export function weekSetNeedsRegen(
	questions: { type: string }[],
	gate: GateId
): boolean {
	if (examInHomework(gate)) return false;
	return questions.some((q) => q.type === 'lezen' || q.type === 'luisteren');
}

export function dailyQuizNeedsRegen(ids: string[], gate: GateId): boolean {
	const hasExam = ids.some((id) => id.startsWith('lezen:') || id.startsWith('luisteren:'));
	if (hasExam && !examInHomework(gate)) return true;
	if (gate === 1 && ids.some((id) => id.startsWith('conv:'))) return true;
	return false;
}

export function emptyGates(): GatesState {
	return {
		current: 1,
		mastered: [],
		quizLog: [],
		weekLog: []
	};
}

export function mergeGatesCurrent(local: GateId, remote: GateId): GateId {
	return (Math.min(local, remote) as GateId) || 1;
}
