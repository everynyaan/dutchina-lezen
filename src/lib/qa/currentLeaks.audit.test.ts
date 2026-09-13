/**
 * Phase 1a contract: Gate 1/2 homework has no NT2, fallback does not
 * climb, rusty ⊆ allowlist, drop-list absent from the G1 allowlist.
 */
import { describe, it, expect } from 'vitest';
import { WORD_POOL } from '$lib/data/wordPool';
import { STORIES } from '$lib/conversation/CONVERSATION_CONTENT';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import { DEFAULT_CONFIG, configForGate, generateDailySession } from '$lib/daily/generator';
import { selectQuestionIds, type QuizSourceData } from '$lib/quiz/generator';
import {
	DROP_FROM_HOMEWORK_IDS,
	GATE1_MOVE_LATER_IDS,
	GATE1_PAST_IDS,
	GATE1_WORD_ID_SET,
	GATE1_WORD_IDS
} from '$lib/gates/gate1Allowlist';
import {
	currentGateFromState,
	dailyQuizNeedsRegen,
	examInHomework,
	getStoriesForGate,
	getWordsForGate,
	getWordsUpToGate,
	weekSetNeedsRegen
} from '$lib/gates/gates';

const JUNK_G1_LEMMAS = ['the', 'der', 'des', 'ten', 'ter', 'a.', 'd.', 'etc', 'as'];
const OLLY_G1_STORY_IDS = ['cs_0', 'cs_1'];

function gate1QuizData(): QuizSourceData {
	const allowlist = getWordsForGate(1);
	return {
		rustyWords: [],
		candidateWords: allowlist,
		allWords: WORD_POOL,
		conversationPool: [],
		lezenPool: []
	};
}

describe('contract: Gate 1/2 homework has no exam leaks', () => {
	it('G1 and G2 week-set config zero lezen + luisteren', () => {
		expect(configForGate(1).lezen).toBe(0);
		expect(configForGate(1).luisteren).toBe(0);
		expect(configForGate(1).conversation).toBe(0);
		expect(configForGate(2).lezen).toBe(0);
		expect(configForGate(2).luisteren).toBe(0);
		expect(examInHomework(1)).toBe(false);
		expect(examInHomework(2)).toBe(false);
		expect(examInHomework(3)).toBe(false);
		expect(examInHomework(4)).toBe(true);
		expect(DEFAULT_CONFIG.lezen).toBe(7);
		expect(DEFAULT_CONFIG.luisteren).toBe(7);
	});

	it('generateDailySession G1 and G2 emit zero NT2 lezen/luisteren', () => {
		const g1 = generateDailySession(0, DEFAULT_CONFIG, 1);
		const g2 = generateDailySession(2, DEFAULT_CONFIG, 2);
		expect(g1.some((q) => q.type === 'lezen' || q.type === 'luisteren')).toBe(false);
		expect(g2.some((q) => q.type === 'lezen' || q.type === 'luisteren')).toBe(false);
		expect(g1.some((q) => q.type === 'conversation')).toBe(false);
		expect(g1.length).toBeGreaterThan(10);
	});

	it('selectQuestionIds with a Gate 1 profile never emits lezen: or conv:', () => {
		const ids = selectQuestionIds(gate1QuizData(), 'domi|2026-08-29');
		expect(ids.some((id) => id.startsWith('lezen:'))).toBe(false);
		expect(ids.some((id) => id.startsWith('luisteren:'))).toBe(false);
		expect(ids.some((id) => id.startsWith('conv:'))).toBe(false);
		expect(ids.length).toBe(5);
		expect(ids.every((id) => id.startsWith('match:') || id.startsWith('recall:'))).toBe(true);
		for (const id of ids) {
			const wordId = id.slice(id.indexOf(':') + 1);
			expect(GATE1_WORD_ID_SET.has(wordId)).toBe(true);
		}
	});

	it('drop-list and junk lemmas are absent from the G1 allowlist', () => {
		const g1 = getWordsForGate(1);
		const dutch = new Set(g1.map((w) => w.dutch.toLowerCase()));
		const ids = new Set(g1.map((w) => w.id));
		for (const lemma of JUNK_G1_LEMMAS) {
			expect(dutch.has(lemma.toLowerCase()), `junk lemma ${lemma} must not be in G1`).toBe(
				false
			);
		}
		for (const id of DROP_FROM_HOMEWORK_IDS) {
			expect(ids.has(id)).toBe(false);
		}
		for (const id of GATE1_MOVE_LATER_IDS) {
			expect(ids.has(id), `moved-later ${id} must not be G1`).toBe(false);
		}
		for (const id of GATE1_PAST_IDS) {
			expect(ids.has(id), `past-tense ${id} must not be G1`).toBe(false);
		}
		expect(g1.length).not.toBe(WORD_POOL.filter((w) => w.rank <= 1).length);
	});

	it('rusty / candidate G1 homework is a subset of the allowlist', () => {
		const pool = getWordsUpToGate(1);
		expect(pool.length).toBe(GATE1_WORD_IDS.length);
		for (const word of pool) {
			expect(GATE1_WORD_ID_SET.has(word.id)).toBe(true);
		}
		expect(currentGateFromState({ rank: 0, cardReviews: {} })).toBe(1);
		expect(currentGateFromState({ rank: 6, cardReviews: {} })).toBe(1);
	});

	it('empty story pool does not climb to STORIES or LEZEN_EXAMS', () => {
		expect(getStoriesForGate(1)).toEqual([]);
		const g1Stories = STORIES.filter((s) => OLLY_G1_STORY_IDS.includes(s.id));
		expect(g1Stories.map((s) => s.id).sort()).toEqual(['cs_0', 'cs_1']);
		const ids = selectQuestionIds(gate1QuizData(), 'domi|2026-08-29');
		expect(ids.some((id) => id.startsWith('conv:'))).toBe(false);
		expect(ids.some((id) => id.startsWith('lezen:'))).toBe(false);
		expect(LEZEN_EXAMS.length).toBeGreaterThan(0);
	});

	it('starved conv/lezen pools still fill 5 in-gate match/recall', () => {
		const allowlist = getWordsForGate(1).slice(0, 8);
		const starved: QuizSourceData = {
			rustyWords: [],
			candidateWords: allowlist,
			allWords: WORD_POOL,
			conversationPool: [],
			lezenPool: []
		};
		const ids = selectQuestionIds(starved, 'starve|g1');
		expect(ids).toHaveLength(5);
		expect(ids.every((id) => id.startsWith('match:') || id.startsWith('recall:'))).toBe(true);
		for (const id of ids) {
			expect(GATE1_WORD_ID_SET.has(id.slice(id.indexOf(':') + 1))).toBe(true);
			expect(allowlist.some((w) => w.id === id.slice(id.indexOf(':') + 1))).toBe(true);
		}
	});
});

describe('contract: stale snapshot + snapshot seed', () => {
	it('stale week snapshot with exam ids regenerates when examInHomework is false', () => {
		expect(
			weekSetNeedsRegen([{ type: 'lezen' }, { type: 'match' }], 1)
		).toBe(true);
		expect(
			weekSetNeedsRegen([{ type: 'luisteren' }, { type: 'match' }], 2)
		).toBe(true);
		expect(weekSetNeedsRegen([{ type: 'match' }, { type: 'recall' }], 1)).toBe(false);
		expect(weekSetNeedsRegen([{ type: 'lezen' }], 4)).toBe(false);
	});

	it('stale daily quiz with lezen: or G1 conv: regenerates', () => {
		expect(dailyQuizNeedsRegen(['match:w0353', 'lezen:lezen-2024-1'], 1)).toBe(true);
		expect(dailyQuizNeedsRegen(['match:w0353', 'conv:cq_0_1_1'], 1)).toBe(true);
		expect(
			dailyQuizNeedsRegen(['match:w0353', 'recall:w0757', 'match:w0244'], 1)
		).toBe(false);
	});

	it('fixed seed + Gate 1 profile is only allowlist match/recall', () => {
		const seed = 'domi|2026-08-29|g1';
		const a = selectQuestionIds(gate1QuizData(), seed);
		const b = selectQuestionIds(gate1QuizData(), seed);
		expect(a).toEqual(b);
		expect(a).toHaveLength(5);
		expect(a.every((id) => /^(match|recall):w\d+$/.test(id))).toBe(true);
	});
});
