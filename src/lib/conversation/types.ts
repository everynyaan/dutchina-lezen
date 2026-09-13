// ============================================================
// DUTCHINA CONVERSATION TYPES
// Defines the shape of conversation/story content.
// Stories contain chapters, chapters contain text, vocab, and
// comprehension MCQs.
// ============================================================

export interface VocabEntry {
	dutch: string;
	english: string;
	article?: string; // 'de' or 'het' if a noun
}

export interface ConversationQuestion {
	/** Unique ID, pattern: cq_{storyIndex}_{chapterNum}_{questionNum} */
	id: string;
	/** Question text in Dutch */
	text: string;
	/** Exactly 4 options */
	options: string[];
	/** Correct option index (0-3) */
	correctIndex: number;
}

export interface ConversationChapter {
	/** Unique ID, pattern: cc_{storyIndex}_{chapterNum} */
	id: string;
	/** Chapter number within the story (1-based) */
	chapterNumber: number;
	/** Chapter title */
	title: string;
	/** Full chapter story text in Dutch */
	text: string;
	/** Dutch summary paragraph */
	summary: string;
	/** Vocabulary list for this chapter */
	vocabulary: VocabEntry[];
	/** 5 comprehension questions */
	questions: ConversationQuestion[];
}

export interface ConversationStory {
	/** Unique ID, pattern: cs_{storyIndex} */
	id: string;
	/** Rank this story belongs to (0-7) */
	rank: number;
	/** Story title */
	title: string;
	/** Chapters in reading order */
	chapters: ConversationChapter[];
}

/** LP awarded per correct conversation answer */
export const CONVERSATION_LP_PER_CORRECT = 2;
