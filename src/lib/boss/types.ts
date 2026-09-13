// ============================================================
// DUTCHINA BOSS FIGHT TYPES
// ============================================================

export type BossQuestionType =
	| 'production' // Type the Dutch word. 25 damage.
	| 'sentence_completion' // Pick the missing word. 15 damage.
	| 'multiple_choice' // Pick the correct translation. 10 damage.
	| 'transformation' // Rewrite sentence (pick correct version). 20 damage.
	| 'error_identification'; // Find the grammar error. 10 damage.

export interface BossQuestion {
	type: BossQuestionType;
	/** What Domi sees as the prompt */
	prompt: string;
	/** The correct answer string (for production: the word she must type) */
	correctAnswer: string;
	/** For MC and sentence_completion: shuffled options including the correct one */
	options?: string[];
	/** Index of correct option in options[] */
	correctIndex?: number;
	/** Damage dealt to boss on correct answer */
	damage: number;
	/** The source word ID from WORD_POOL, for dedup within a fight */
	wordId: string;
}

export interface BossRoundChoice {
	optionA: BossQuestion;
	optionB: BossQuestion;
}

export interface BossFightState {
	/** Rank of the boss being fought (may differ from player rank on replays) */
	bossRank: number;
	bossMaxHp: number;
	bossHp: number;
	playerStrikes: number; // starts at 3, decrements on wrong
	maxStrikes: number; // always 3
	round: number; // current round number (1-indexed)
	usedWordIds: Set<string>; // prevent repeating the same word in a fight
	status: 'fighting' | 'won' | 'lost';
}
