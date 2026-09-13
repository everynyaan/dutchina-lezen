// ============================================================
// WORD POOL DATA LOADER
// Imports the static JSON files and exports typed arrays.
// These are bundled by Vite at build time, not fetched at runtime.
// ============================================================

import wordPoolRaw from './WORD_POOL.json';
import sentencesRaw from './SENTENCES.json';

export type WordCategory =
	| 'people-family'
	| 'food-drink'
	| 'home'
	| 'work-study'
	| 'travel-transport'
	| 'health-body'
	| 'feelings'
	| 'time-numbers'
	| 'nature-weather'
	| 'shopping-money'
	| 'communication'
	| 'society'
	| 'actions'
	| 'describing'
	| 'connectors'
	| 'misc';

export interface WordCategoryMeta {
	id: WordCategory;
	label: string;
	emoji: string;
	tone: 'soft-pink' | 'soft-lilac' | 'soft-mint' | 'soft-butter';
}

export const WORD_CATEGORIES: readonly WordCategoryMeta[] = [
	{ id: 'people-family', label: 'People & Family', emoji: '👥', tone: 'soft-pink' },
	{ id: 'food-drink', label: 'Food & Drink', emoji: '🍽', tone: 'soft-lilac' },
	{ id: 'home', label: 'Home', emoji: '🏠', tone: 'soft-mint' },
	{ id: 'work-study', label: 'Work & Study', emoji: '📚', tone: 'soft-butter' },
	{ id: 'travel-transport', label: 'Travel & Transport', emoji: '✈', tone: 'soft-pink' },
	{ id: 'health-body', label: 'Health & Body', emoji: '💪', tone: 'soft-lilac' },
	{ id: 'feelings', label: 'Feelings', emoji: '❤', tone: 'soft-mint' },
	{ id: 'time-numbers', label: 'Time & Numbers', emoji: '🔢', tone: 'soft-butter' },
	{ id: 'nature-weather', label: 'Nature & Weather', emoji: '🌿', tone: 'soft-pink' },
	{ id: 'shopping-money', label: 'Shopping & Money', emoji: '💰', tone: 'soft-lilac' },
	{ id: 'communication', label: 'Communication', emoji: '💬', tone: 'soft-mint' },
	{ id: 'society', label: 'Society', emoji: '🏛', tone: 'soft-butter' },
	{ id: 'actions', label: 'Actions', emoji: '⚡', tone: 'soft-pink' },
	{ id: 'describing', label: 'Describing', emoji: '✨', tone: 'soft-lilac' },
	{ id: 'connectors', label: 'Connectors', emoji: '🔗', tone: 'soft-mint' },
	{ id: 'misc', label: 'Misc', emoji: '📦', tone: 'soft-butter' }
];

export interface WordEntry {
	id: string;
	dutch: string;
	english: string;
	pos: string;
	rank: number;
	category: WordCategory;
	sentence_nl: string;
	sentence_en: string;
}

export interface SentenceEntry {
	id: string;
	word_id: string;
	rank: number;
	nl: string;
	en: string;
}

export const WORD_POOL: WordEntry[] = wordPoolRaw as WordEntry[];
export const SENTENCES: SentenceEntry[] = sentencesRaw as SentenceEntry[];

/**
 * Get all words for a specific rank.
 */
export function getWordsForRank(rank: number): WordEntry[] {
	return WORD_POOL.filter((w) => w.rank === rank);
}

/**
 * Get all words for a rank and all ranks below it.
 */
export function getWordsUpToRank(rank: number): WordEntry[] {
	return WORD_POOL.filter((w) => w.rank <= rank);
}

/**
 * Get all words in a specific semantic category.
 */
export function getWordsInCategory(category: WordCategory): WordEntry[] {
	return WORD_POOL.filter((w) => w.category === category);
}
