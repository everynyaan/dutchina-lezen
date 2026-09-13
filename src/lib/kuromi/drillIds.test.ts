// ============================================================
// KUROMI — mintDrillIds unit tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { mintDrillIds, type KuromiQuestion } from './drill';

function mcq(overrides: Partial<KuromiQuestion> = {}): KuromiQuestion {
	return {
		type: 'mcq',
		prompt: 'What is the Dutch word for cat?',
		options: ['hond', 'kat', 'vogel', 'vis'],
		answer: 'kat',
		explanation_quip: 'Obviously. It is literally kat.',
		...overrides
	};
}

function recall(overrides: Partial<KuromiQuestion> = {}): KuromiQuestion {
	return {
		type: 'recall',
		prompt: 'Translate: the house',
		options: [],
		answer: 'het huis',
		explanation_quip: 'het, because reasons. Dutch reasons.',
		...overrides
	};
}

const ID_SAFE = /^[A-Za-z0-9_-]+$/;

describe('mintDrillIds', () => {
	it('same content at different positions gets the same id', () => {
		const a = mcq({ prompt: 'A?', answer: 'a' });
		const b = recall({ prompt: 'B?', answer: 'b' });
		const c = mcq({ prompt: 'C?', answer: 'c' });
		const original = [a, b, c];
		const idsOriginal = mintDrillIds(original);

		const reordered = [c, a, b];
		const idsReordered = mintDrillIds(reordered);

		// Content of a / b / c keeps its id regardless of position
		expect(idsReordered[1]).toBe(idsOriginal[0]); // a
		expect(idsReordered[2]).toBe(idsOriginal[1]); // b
		expect(idsReordered[0]).toBe(idsOriginal[2]); // c
	});

	it('assigns unique ids when two questions are byte-identical', () => {
		const twin = mcq({ prompt: 'Duplicate?', answer: 'yes' });
		const other = recall({ prompt: 'Unique?', answer: 'no' });
		// Two genuinely identical questions (same type, prompt, options, answer, quip)
		const questions: KuromiQuestion[] = [twin, other, { ...twin }];
		const ids = mintDrillIds(questions);

		expect(ids).toHaveLength(3);
		expect(new Set(ids).size).toBe(3);
		// First occurrence of twin content is stable; second twin differs only by counter
		expect(ids[0]).not.toBe(ids[2]);
	});

	it('is deterministic across separately constructed equal inputs', () => {
		const build = (): KuromiQuestion[] => [
			mcq({ prompt: 'One', answer: '1' }),
			recall({ prompt: 'Two', answer: '2' }),
			mcq({ prompt: 'Three', answer: '3' })
		];
		const ids1 = mintDrillIds(build());
		const ids2 = mintDrillIds(build());
		expect(ids1).toEqual(ids2);
	});

	it('every id matches /^[A-Za-z0-9_-]+$/', () => {
		const questions: KuromiQuestion[] = [
			mcq({ prompt: 'Hello / world?', answer: 'a & b' }),
			recall({ prompt: 'Say "hi"', answer: "it's fine" }),
			mcq()
		];
		const ids = mintDrillIds(questions);
		for (const id of ids) {
			expect(id).toMatch(ID_SAFE);
		}
	});

	it('empty array input yields empty array output', () => {
		expect(mintDrillIds([])).toEqual([]);
	});
});
