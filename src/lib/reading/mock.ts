import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import type { LezenExam } from '$lib/lezen/types';
import { dayIndex, daysBetween } from './bank';

export const MOCK_MINUTES = 110;
export const MINUTES_PER_TEXT = 18;
export const PASS_SCORE = 22;
export const MOCK_COOLDOWN_DAYS = 14;

export function pickMockExam(today: string): LezenExam {
	const exams = LEZEN_EXAMS;
	return exams[dayIndex(today, exams.length, 9)];
}

export function mockReady(lastMockAt: string | null, today: string): boolean {
	if (!lastMockAt) return true;
	return daysBetween(lastMockAt, today) >= MOCK_COOLDOWN_DAYS;
}

export function passedMock(correct: number): boolean {
	return correct >= PASS_SCORE;
}
