import { itemAttemptedWithin } from './history';
import type { ReadingForkState } from './types';

type ForkAttempts = Pick<ReadingForkState, 'attempts'>;

const RECENT_DAYS = 21;

/** Distinct days this passage shows up in the attempt log. */
export function seenTimes(fork: ForkAttempts, slug: string): number {
	const dates = new Set<string>();
	for (const attempt of fork.attempts) {
		if (attempt.passageSlug !== slug || !attempt.at) continue;
		dates.add(attempt.at.slice(0, 10));
	}
	return dates.size;
}

export function seenLabel(times: number): string {
	return times === 1 ? 'Seen 1 time' : `Seen ${times} times`;
}

/** True when any official item on this passage was answered in the last 21 days. */
export function recentOfficial(
	fork: ForkAttempts,
	passage: { questions: readonly { id: string }[] },
	now = new Date().toISOString().slice(0, 10)
): boolean {
	return passage.questions.some((question) =>
		itemAttemptedWithin(fork, question.id, RECENT_DAYS, now)
	);
}
