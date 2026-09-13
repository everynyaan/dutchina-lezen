export interface GrammarBead {
	text: string;
	/** Maps to the Bead primitive variant. verb = rose, subject = sky, ghost = dashed/optional. */
	variant?: 'default' | 'verb' | 'subject' | 'ghost';
}

export interface GrammarExample {
	nl: string;
	en: string;
}

export interface GrammarTrap {
	title: string;
	body: string;
	/** tip = dashed pink free win, trap = solid warning. Default trap. */
	variant?: 'tip' | 'trap';
}

export interface GrammarCard {
	/** e.g. g_word_order_v2 */
	id: string;
	title: string;
	/** The pattern, rendered as beads inside a FormulaBar. */
	formula: GrammarBead[];
	formulaTone?: 'rose' | 'lavender' | 'teal' | 'peach';
	example: GrammarExample;
	trap: GrammarTrap;
}

export interface GrammarChapter {
	/** 1-based, shown in the ChapterBadge. */
	n: number;
	/** e.g. word-order */
	id: string;
	title: string;
	/** One sentence framing the chapter. */
	blurb: string;
	tone: 'rose' | 'lavender' | 'teal' | 'peach';
	cards: GrammarCard[];
}
