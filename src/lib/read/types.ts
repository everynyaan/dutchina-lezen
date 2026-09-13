export type ReadTag = 'phrase-pack' | 'culture' | 'grammar-bite' | 'word-story';

export interface ReadLine {
	/** The Dutch sentence or expression. */
	nl: string;
	/** Natural English gloss, not a word-for-word crib. */
	en: string;
}

export interface FormulaBead {
	text: string;
	variant: 'default' | 'verb' | 'subject' | 'ghost';
}

export interface DailyRead {
	/** Stable id, r001 .. rNNN, zero-padded to 3, unique, in file order. */
	id: string;
	tag: ReadTag;
	/** Dutch title, 2-5 words. */
	title: string;
	/** English title. */
	titleEn: string;
	/** 3-5 entries. For tag phrase-pack this MUST be exactly 5 entries. */
	lines: ReadLine[];
	/** REQUIRED for tag grammar-bite, forbidden for every other tag. */
	formula?: {
		tone: 'rose' | 'lavender' | 'teal' | 'peach';
		beads: FormulaBead[];
	};
	/** Optional one-sentence closing note in English, max 140 characters. */
	note?: string;
}
