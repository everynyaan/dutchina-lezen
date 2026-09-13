// ============================================================
// KUROMI — DRILL TYPES
//
// Standalone types for drill generation and job polling.
// No imports from other kuromi modules (owned by other lanes).
// ============================================================

export type KuromiQuestionType = 'mcq' | 'recall';

export interface KuromiQuestion {
	type: KuromiQuestionType;
	prompt: string;
	options: string[];
	answer: string;
	explanation_quip: string;
}

export interface KuromiDrillSet {
	title: string;
	intro_quip: string;
	questions: KuromiQuestion[];
}

export type KuromiDrillJobStatus = 'pending' | 'ready' | 'error';

export interface KuromiDrillJobRecord {
	status: KuromiDrillJobStatus;
	createdAt: number;
	set?: KuromiDrillSet;
	error?: string;
	code?: string;
}

/** Small deterministic 32-bit string hash (xmur3-style), rendered as base36. */
function hashContent(str: string): string {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	h = Math.imul(h ^ (h >>> 16), 2246822507);
	h = Math.imul(h ^ (h >>> 13), 3266489909);
	h ^= h >>> 16;
	return (h >>> 0).toString(36);
}

/**
 * Mint structural, content-derived ids for drill questions.
 * Ids depend only on type+prompt+answer (not array index). Duplicates are
 * disambiguated with a per-content occurrence counter (0, 1, 2, …).
 */
export function mintDrillIds(questions: KuromiQuestion[]): string[] {
	const occurrence = new Map<string, number>();
	return questions.map((q) => {
		const contentKey = `${q.type}\0${q.prompt}\0${q.answer}`;
		const n = occurrence.get(contentKey) ?? 0;
		occurrence.set(contentKey, n + 1);
		return `q-${hashContent(contentKey)}-${n}`;
	});
}
