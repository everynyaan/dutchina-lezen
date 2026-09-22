import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import type { LezenExam } from '$lib/lezen/types';

export const MOCK_MINUTES = 110;
export const MINUTES_PER_TEXT = 18;
/** Her live paper. Booklet objects keep their own passingScore. */
export const LIVE_PASS = 22;
export const LIVE_TOTAL = 36;
export const BOOKLET_PASS_LABEL =
	'Live paper is 22 of 36. This booklet has 35. 22 still passes.';

/**
 * Sealed rehearsals, sat once, never the 2025 training paper.
 * [] → 2024, [2024] → 2023, both → null.
 */
export function pickMockExam(satMocks: number[]): LezenExam | null {
	const sat = new Set(satMocks);
	if (sat.has(2024) && sat.has(2023)) return null;
	if (sat.has(2024)) return LEZEN_EXAMS.find((exam) => exam.year === 2023) ?? null;
	return LEZEN_EXAMS.find((exam) => exam.year === 2024) ?? null;
}

export function passedSitting(correct: number): boolean {
	return correct >= LIVE_PASS;
}
