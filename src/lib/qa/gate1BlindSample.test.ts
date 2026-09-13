import { describe, it, expect } from 'vitest';
import { selectQuestionIds } from '$lib/quiz/generator';
import { generateDailySession } from '$lib/daily/generator';
import { WORD_POOL } from '$lib/data/wordPool';
import { getWordsForGate } from '$lib/gates/gates';
import {
	DROP_FROM_HOMEWORK_IDS,
	GATE1_WORD_ID_SET
} from '$lib/gates/gate1Allowlist';
import type { QuizSourceData } from '$lib/quiz/generator';

const BAD_PREFIXES = ['lezen:', 'luisteren:'];
const BAD_STORY = ['cs_0', 'cs_1', 'cq_0_', 'cq_1_', 'cc_0_', 'cc_1_'];

describe('blind-style Gate 1 sample', () => {
	it('N generated G1 items contain none of the known-bad ids', () => {
		const allowlist = getWordsForGate(1);
		const data: QuizSourceData = {
			rustyWords: [],
			candidateWords: allowlist,
			allWords: WORD_POOL,
			conversationPool: [],
			lezenPool: []
		};

		const ids: string[] = [];
		for (let i = 0; i < 8; i++) {
			ids.push(...selectQuestionIds(data, `blind|g1|${i}`));
		}
		const week = generateDailySession(0, undefined, 1);
		for (const q of week) {
			if (q.type === 'match' || q.type === 'recall') ids.push(`${q.type}:${q.wordId}`);
			if (q.type === 'conversation') ids.push(`conv:${q.questionId}`);
			if (q.type === 'lezen') ids.push(`lezen:${q.questionId}`);
			if (q.type === 'luisteren') ids.push(`luisteren:${q.questionId}`);
		}

		expect(ids.length).toBeGreaterThan(20);
		for (const id of ids) {
			for (const prefix of BAD_PREFIXES) {
				expect(id.startsWith(prefix), id).toBe(false);
			}
			for (const bit of BAD_STORY) {
				expect(id.includes(bit), id).toBe(false);
			}
			const wordId = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id;
			if (wordId.startsWith('w')) {
				expect(GATE1_WORD_ID_SET.has(wordId), wordId).toBe(true);
				expect((DROP_FROM_HOMEWORK_IDS as readonly string[]).includes(wordId)).toBe(false);
			}
		}
	});
});
