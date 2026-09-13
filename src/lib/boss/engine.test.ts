import { describe, it, expect } from 'vitest';
import { createFight, generateRound, checkAnswer, applyAnswer, blankOutWord } from './engine';
import { BOSS_HP, MAX_STRIKES } from './constants';
import type { WordEntry } from '$lib/data/wordPool';

// ============================================================
// TEST WORD POOL
// ============================================================

function makeWord(id: string, rank: number, dutch: string, english: string, pos = 'n'): WordEntry {
	return {
		id,
		dutch,
		english,
		pos,
		rank,
		category: 'misc',
		sentence_nl: `Ik heb een ${dutch} gekocht.`,
		sentence_en: `I bought a ${english}.`
	};
}

const testPool: WordEntry[] = [
	makeWord('w01', 0, 'huis', 'house'),
	makeWord('w02', 0, 'boek', 'book'),
	makeWord('w03', 0, 'stoel', 'chair'),
	makeWord('w04', 0, 'tafel', 'table'),
	makeWord('w05', 0, 'deur', 'door'),
	makeWord('w06', 0, 'raam', 'window'),
	makeWord('w07', 0, 'lamp', 'lamp'),
	makeWord('w08', 0, 'klok', 'clock'),
	makeWord('w09', 1, 'fiets', 'bicycle'),
	makeWord('w10', 1, 'trein', 'train'),
	makeWord('w11', 1, 'auto', 'car'),
	makeWord('w12', 1, 'bus', 'bus')
];

// ============================================================
// createFight
// ============================================================

describe('createFight', () => {
	it('returns correct HP for each rank', () => {
		for (let rank = 0; rank <= 7; rank++) {
			const fight = createFight(rank);
			expect(fight.bossMaxHp).toBe(BOSS_HP[rank]);
			expect(fight.bossHp).toBe(BOSS_HP[rank]);
		}
	});

	it('starts with MAX_STRIKES player strikes', () => {
		const fight = createFight(0);
		expect(fight.playerStrikes).toBe(MAX_STRIKES);
		expect(fight.maxStrikes).toBe(MAX_STRIKES);
	});

	it('starts at round 1 with fighting status', () => {
		const fight = createFight(0);
		expect(fight.round).toBe(1);
		expect(fight.status).toBe('fighting');
	});

	it('starts with empty usedWordIds', () => {
		const fight = createFight(0);
		expect(fight.usedWordIds.size).toBe(0);
	});

	it('stores the boss rank', () => {
		const fight = createFight(3);
		expect(fight.bossRank).toBe(3);
	});
});

// ============================================================
// generateRound
// ============================================================

describe('generateRound', () => {
	it('returns two questions of different types', () => {
		const fight = createFight(0);
		const round = generateRound(fight, testPool);
		expect(round).not.toBeNull();
		if (round) {
			expect(round.optionA.type).not.toBe(round.optionB.type);
		}
	});

	it('returns null if pool has fewer than 4 words for the rank', () => {
		const tinyPool = testPool.slice(0, 3); // only 3 rank-0 words
		const fight = createFight(0);
		const round = generateRound(fight, tinyPool);
		expect(round).toBeNull();
	});

	it('avoids already-used words', () => {
		const fight = createFight(0);
		// Mark some words as used
		fight.usedWordIds.add('w01');
		fight.usedWordIds.add('w02');
		fight.usedWordIds.add('w03');

		const round = generateRound(fight, testPool);
		if (round) {
			expect(fight.usedWordIds.has(round.optionA.wordId)).toBe(false);
			expect(fight.usedWordIds.has(round.optionB.wordId)).toBe(false);
		}
	});

	it('uses words from the boss rank, not other ranks', () => {
		const fight = createFight(0);
		const round = generateRound(fight, testPool);
		if (round) {
			// Both questions should use rank 0 words
			const rank0Ids = new Set(testPool.filter((w) => w.rank === 0).map((w) => w.id));
			expect(rank0Ids.has(round.optionA.wordId)).toBe(true);
			expect(rank0Ids.has(round.optionB.wordId)).toBe(true);
		}
	});
});

// ============================================================
// checkAnswer
// ============================================================

describe('checkAnswer', () => {
	it('MC correct: exact option match', () => {
		const q = {
			type: 'multiple_choice' as const,
			prompt: 'huis',
			correctAnswer: 'house',
			options: ['house', 'book', 'chair', 'table'],
			correctIndex: 0,
			damage: 10,
			wordId: 'w01'
		};
		expect(checkAnswer(q, 'house')).toBe(true);
		expect(checkAnswer(q, 'book')).toBe(false);
	});

	it('production: case-insensitive', () => {
		const q = {
			type: 'production' as const,
			prompt: 'house',
			correctAnswer: 'huis',
			damage: 25,
			wordId: 'w01'
		};
		expect(checkAnswer(q, 'huis')).toBe(true);
		expect(checkAnswer(q, 'Huis')).toBe(true);
		expect(checkAnswer(q, 'HUIS')).toBe(true);
	});

	it('production: trims whitespace', () => {
		const q = {
			type: 'production' as const,
			prompt: 'house',
			correctAnswer: 'huis',
			damage: 25,
			wordId: 'w01'
		};
		expect(checkAnswer(q, '  huis  ')).toBe(true);
	});

	it('production: strips trailing punctuation', () => {
		const q = {
			type: 'production' as const,
			prompt: 'house',
			correctAnswer: 'huis',
			damage: 25,
			wordId: 'w01'
		};
		expect(checkAnswer(q, 'huis.')).toBe(true);
		expect(checkAnswer(q, 'huis!')).toBe(true);
	});

	it('production: wrong answer is wrong', () => {
		const q = {
			type: 'production' as const,
			prompt: 'house',
			correctAnswer: 'huis',
			damage: 25,
			wordId: 'w01'
		};
		expect(checkAnswer(q, 'boek')).toBe(false);
		expect(checkAnswer(q, 'huiz')).toBe(false); // misspelling is wrong
	});
});

// ============================================================
// applyAnswer
// ============================================================

describe('applyAnswer', () => {
	it('correct: reduces boss HP by damage amount', () => {
		const fight = createFight(0);
		const result = applyAnswer(fight, true, 25, 'w01');
		expect(result.bossHp).toBe(fight.bossHp - 25);
		expect(result.playerStrikes).toBe(MAX_STRIKES);
	});

	it('wrong: reduces player strikes by 1', () => {
		const fight = createFight(0);
		const result = applyAnswer(fight, false, 25, 'w01');
		expect(result.bossHp).toBe(fight.bossHp);
		expect(result.playerStrikes).toBe(MAX_STRIKES - 1);
	});

	it('boss HP at 0 sets status to won', () => {
		const fight = createFight(0);
		// Set boss HP to exactly the damage amount
		const lowHpFight = { ...fight, bossHp: 10 };
		const result = applyAnswer(lowHpFight, true, 10, 'w01');
		expect(result.bossHp).toBe(0);
		expect(result.status).toBe('won');
	});

	it('boss HP does not go below 0', () => {
		const fight = createFight(0);
		const lowHpFight = { ...fight, bossHp: 5 };
		const result = applyAnswer(lowHpFight, true, 25, 'w01');
		expect(result.bossHp).toBe(0);
		expect(result.status).toBe('won');
	});

	it('strikes at 0 sets status to lost', () => {
		const fight = createFight(0);
		const oneStrikeFight = { ...fight, playerStrikes: 1 };
		const result = applyAnswer(oneStrikeFight, false, 10, 'w01');
		expect(result.playerStrikes).toBe(0);
		expect(result.status).toBe('lost');
	});

	it('increments round number', () => {
		const fight = createFight(0);
		const result = applyAnswer(fight, true, 10, 'w01');
		expect(result.round).toBe(2);
	});

	it('adds wordId to usedWordIds', () => {
		const fight = createFight(0);
		const result = applyAnswer(fight, true, 10, 'w01');
		expect(result.usedWordIds.has('w01')).toBe(true);
	});

	it('does not mutate original fight state', () => {
		const fight = createFight(0);
		const originalHp = fight.bossHp;
		applyAnswer(fight, true, 25, 'w01');
		expect(fight.bossHp).toBe(originalHp);
	});
});

// ============================================================
// blankOutWord
// ============================================================

describe('blankOutWord', () => {
	it('blanks the target word in a sentence', () => {
		expect(blankOutWord('Ik heb een huis gekocht.', 'huis')).toBe('Ik heb een ______ gekocht.');
	});

	it('handles case-insensitive match', () => {
		expect(blankOutWord('Het Boek is goed.', 'boek')).toBe('Het ______ is goed.');
	});

	it('handles word not found gracefully', () => {
		const result = blankOutWord('Ik ga naar school.', 'fiets');
		expect(result).toContain('______');
	});
});

// ============================================================
// Full fight simulation
// ============================================================

describe('full fight simulation', () => {
	it('answering correctly until boss HP hits 0 results in win', () => {
		let fight = createFight(0); // 50 HP

		// Answer production questions (25 damage each) correctly
		fight = applyAnswer(fight, true, 25, 'w01'); // 25 HP left
		expect(fight.status).toBe('fighting');

		fight = applyAnswer(fight, true, 25, 'w02'); // 0 HP
		expect(fight.status).toBe('won');
		expect(fight.bossHp).toBe(0);
		expect(fight.playerStrikes).toBe(MAX_STRIKES);
	});

	it('answering wrong 3 times results in loss', () => {
		let fight = createFight(0);

		fight = applyAnswer(fight, false, 10, 'w01'); // 2 strikes
		expect(fight.status).toBe('fighting');

		fight = applyAnswer(fight, false, 10, 'w02'); // 1 strike
		expect(fight.status).toBe('fighting');

		fight = applyAnswer(fight, false, 10, 'w03'); // 0 strikes
		expect(fight.status).toBe('lost');
		expect(fight.playerStrikes).toBe(0);
	});
});
