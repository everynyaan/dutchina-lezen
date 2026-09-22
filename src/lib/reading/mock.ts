import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import type { LezenExam } from '$lib/lezen/types';

export const MOCK_MINUTES = 110;
export const MINUTES_PER_TEXT = 18;
/** Her live paper. Booklet objects keep their own passingScore. */
export const LIVE_PASS = 22;
export const LIVE_TOTAL = 36;
export const BOOKLET_PASS_LABEL =
	'Live paper is 22 of 36. This booklet has 35. 22 still passes.';
/** The only paper that can stay sealed, and only for one predictive sitting. */
export const PREDICTIVE_YEAR = 2023;
export const TRAINING_YEARS = [2024, 2025] as const;
export const NOT_A_PREDICTION =
	'This score is not a November prediction. This paper was already studied.';

export function yearStudied(
	year: number,
	questionResults: Record<string, unknown>,
	evalResults: Record<string, boolean> = {},
	missIds: readonly string[] = []
): boolean {
	const prefix = `lezen-${year}-`;
	return (
		Object.keys(questionResults).some((id) => id.startsWith(prefix)) ||
		Object.keys(evalResults).some((id) => id.startsWith(prefix)) ||
		missIds.some((id) => id.startsWith(prefix))
	);
}

/** 2023 stays sealed only while we still want one unseen predictive mock. */
export function predictiveAvailable(satMocks: readonly number[], studied2023: boolean): boolean {
	return !satMocks.includes(PREDICTIVE_YEAR) && !studied2023;
}

/** Years on the practice page. 2023 appears once it is no longer sealed. */
export function practiceYears(satMocks: readonly number[], studied2023: boolean): number[] {
	const years: number[] = [2025, 2024];
	if (!predictiveAvailable(satMocks, studied2023)) years.push(2023);
	return years;
}

/**
 * The sealed predictive paper, or null when there isn't one.
 * Unstudied and not yet sat → 2023. Otherwise no paper is sealed.
 * Never returns 2024 or 2025.
 */
export function pickMockExam(satMocks: readonly number[], studied2023 = false): LezenExam | null {
	if (!predictiveAvailable(satMocks, studied2023)) return null;
	return LEZEN_EXAMS.find((exam) => exam.year === PREDICTIVE_YEAR) ?? null;
}

export function passedSitting(correct: number): boolean {
	return correct >= LIVE_PASS;
}
