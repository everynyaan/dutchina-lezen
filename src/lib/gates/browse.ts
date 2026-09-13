/**
 * Browse-gate filter. Lets Domi look up a room without changing
 * engine `gates.current` or homework generation.
 *
 * Default: current open gate. Looking up a later gate is allowed —
 * copy must say she is browsing, not unlocking.
 */
import { GRAMMAR_CONTENT } from '$lib/grammar/GRAMMAR_CONTENT';
import type { GrammarChapter } from '$lib/grammar/types';
import { TASKS, getTasksByRank } from '$lib/reviews/SCHRIJVEN_CONTENT';
import type { SchrijvenTask } from '$lib/reviews/types';
import type { WordCategory, WordEntry } from '$lib/data/wordPool';
import type { ConversationStory } from '$lib/conversation/types';
import {
	getStoriesForGate,
	getWordsForGate,
	isGateId,
	type GateId
} from './gates';

export const BROWSE_GATES: readonly GateId[] = [1, 2, 3, 4];
export const BROWSE_SESSION_KEY = 'dutchina.browseGate';
export const EXAM_YEARS = [2025, 2024, 2023] as const;

/** Handbook chapters that belong to a room. G4 lookup shows the full book. */
export const GRAMMAR_CHAPTER_GATES: Record<string, GateId> = {
	'word-order': 1,
	'present-tense': 1,
	pronunciation: 1,
	'perfect-tense': 2,
	'separable-verbs': 2,
	negation: 2,
	'de-het-adjectives': 2,
	modals: 3,
	er: 3
};

/** G1 handbook: beginner cards only. Inversion / subclause / jij-inversion wait. */
export const GRAMMAR_G1_CARD_IDS: ReadonlySet<string> = new Set([
	'g_word_order_v2',
	'g_present_stem',
	'g_present_hebben_zijn',
	'g_pron_ui_eu',
	'g_pron_ij_ei',
	'g_pron_g_sch',
	'g_pron_devoicing_vw'
]);

export function practiceRankForGate(gate: GateId): number | null {
	if (gate === 1) return 0;
	if (gate === 2) return 1;
	if (gate === 3) return 2;
	return null;
}

export function initialBrowseGate(current: GateId): GateId {
	if (typeof sessionStorage === 'undefined') return current;
	try {
		const raw = sessionStorage.getItem(BROWSE_SESSION_KEY);
		const n = Number(raw);
		return isGateId(n) ? n : current;
	} catch {
		return current;
	}
}

export function persistBrowseGate(gate: GateId): void {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(BROWSE_SESSION_KEY, String(gate));
	} catch {
		/* private mode / quota — filter still works in-memory */
	}
}

export function wordsForBrowse(gate: GateId): WordEntry[] {
	return getWordsForGate(gate);
}

export function wordsInCategoryForBrowse(category: WordCategory, gate: GateId): WordEntry[] {
	return getWordsForGate(gate).filter((w) => w.category === category);
}

export function storiesForBrowse(gate: GateId): ConversationStory[] {
	return getStoriesForGate(gate);
}

export function grammarChaptersForBrowse(gate: GateId): GrammarChapter[] {
	if (gate === 4) return GRAMMAR_CONTENT;
	const chapters = GRAMMAR_CONTENT.filter((ch) => (GRAMMAR_CHAPTER_GATES[ch.id] ?? 4) === gate);
	if (gate !== 1) return chapters;
	return chapters
		.map((ch) => ({
			...ch,
			cards: ch.cards.filter((card) => GRAMMAR_G1_CARD_IDS.has(card.id))
		}))
		.filter((ch) => ch.cards.length > 0);
}

/** Later-gate lookup: show the word, but say it is not this room yet. */
export function vocabUnlockLabel(browse: GateId, current: GateId): string | null {
	if (browse > current) return `Unlocks at Gate ${browse}`;
	return null;
}

export function schrijvenTasksForBrowse(gate: GateId): SchrijvenTask[] {
	if (gate === 4) return TASKS.filter((t) => t.year !== 0);
	const rank = practiceRankForGate(gate);
	if (rank == null) return [];
	return getTasksByRank(rank);
}

export function examYearsForBrowse(gate: GateId): number[] {
	return gate === 4 ? [...EXAM_YEARS] : [];
}

/** Homework / quiz / week-set always use the engine gate, never the browse chip. */
export function homeworkGateIgnoringBrowse(current: GateId, _browse: GateId): GateId {
	return current;
}

export function browseCaption(
	browse: GateId,
	current: GateId,
	noun: string
): string {
	if (browse === current) {
		return `This room's ${noun}. Homework still uses Gate ${current}.`;
	}
	if (browse > current) {
		return `Looking around Gate ${browse} — this room isn't unlocked yet. Homework stays on Gate ${current}.`;
	}
	return `Looking back at Gate ${browse}. Homework still uses Gate ${current}.`;
}
