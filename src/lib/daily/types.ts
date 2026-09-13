// ============================================================
// DAILY HOMEWORK TYPES
//
// A daily session is a shuffled mix of ~35 questions drawn from
// every module in the app. Each question carries the data needed
// to render itself; the /daily route picks the right UI per type.
//
// Discriminated union: switch on `type` to narrow safely.
// ============================================================

import type { LezenAnswer } from '$lib/lezen/types';
import type { Answer as LuisterenAnswer, MediaType } from '$lib/luisteren/types';

/** Match: word-translation MCQ (Dutch → English). */
export interface DailyMatchQuestion {
	type: 'match';
	/** Source word ID (for de-dup across days). */
	wordId: string;
	/** Dutch sentence containing the target word. */
	sentenceNl: string;
	/** The target Dutch word (for highlight + sentence parsing). */
	targetDutch: string;
	/** Four English option strings, shuffled. */
	options: string[];
	/** Index into `options` (0-3) of the correct one. */
	correctIndex: number;
}

/** Recall: inverse of Match. Show Dutch word, pick English meaning. */
export interface DailyRecallQuestion {
	type: 'recall';
	wordId: string;
	/** The Dutch word the user must translate. */
	dutchWord: string;
	/** Optional part-of-speech tag (noun/verb/etc.). */
	pos: string;
	options: string[];
	correctIndex: number;
}

/** Conversation: a chapter's comprehension MCQ shown standalone. */
export interface DailyConversationQuestion {
	type: 'conversation';
	/** ID of the ConversationQuestion. */
	questionId: string;
	/** Chapter ID used to find the question at render time. */
	chapterId: string;
	/** Brief context excerpt so the question makes sense out-of-story. */
	excerpt: string;
	/** Question text in Dutch (denormalized for self-contained render). */
	text: string;
	/** Exactly 4 options. */
	options: string[];
	/** Correct option index (0-3). */
	correctIndex: number;
}

/** Lezen: short passage excerpt + MCQ. */
export interface DailyLezenQuestion {
	type: 'lezen';
	/** ID of the LezenQuestion (for de-dup). */
	questionId: string;
	/** 2-3 sentence excerpt around the question's context. */
	excerpt: string;
	/** Full passage text (collapsed by default in UI). */
	fullPassage: string;
	/** Passage display name. */
	passageName: string;
	question: string;
	/** Keyed A/B/C[/D]. */
	options: Record<string, string>;
	/** Letter of correct answer. */
	answer: LezenAnswer;
}

/** Luisteren: audio/video + MCQ. */
export interface DailyLuisterenQuestion {
	type: 'luisteren';
	questionId: string;
	/** R2-hosted media URL (already resolved against R2_BASE + year). */
	mediaUrl: string;
	mediaType: MediaType;
	question: string;
	options: { A: string; B: string; C: string };
	answer: LuisterenAnswer;
	/** Opgave number, useful as context label. */
	opgave: number;
}

/**
 * One question in a daily session. The currentIndex in state.dailyHomework
 * indexes into the questions[] array.
 */
export type DailyQuestion =
	| DailyMatchQuestion
	| DailyRecallQuestion
	| DailyConversationQuestion
	| DailyLezenQuestion
	| DailyLuisterenQuestion;

/** LP awarded per correct daily question. Matches the per-module base rate. */
export const DAILY_LP_PER_CORRECT = 2;

/** Target session size. The generator aims for this; can fall short if pools are thin. */
export const DAILY_TARGET_SIZE = 35;
