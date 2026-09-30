import type { BankPassage } from './bank';
import { allPassages, dayIndex } from './bank';
import type { DailyTextState, Miss, ReadingForkState } from './types';

/** Training bank is 2024 and 2025. 2023 stays off Today while it can still be a predictive mock. */
export function trainingPassages(): BankPassage[] {
	return allPassages().filter((passage) => passage.year === 2024 || passage.year === 2025);
}

/** Right/wrong map derived from today's answers. Callers that still think in booleans use this. */
export function evalResults(state: DailyTextState): Record<string, boolean> {
	const out: Record<string, boolean> = {};
	for (const [id, answer] of Object.entries(state.answers)) {
		out[id] = answer.correct;
	}
	return out;
}

export function buildDailyEval(date: string): DailyTextState {
	const passages = trainingPassages();
	const passage = passages[dayIndex(date, passages.length)];
	return {
		date,
		passageSlug: passage.slug,
		mapDone: false,
		itemIds: passage.questions.map((question) => question.id),
		answers: {},
		completed: false
	};
}

export function ensureTodayEval(current: DailyTextState, date: string): DailyTextState {
	if (current.date === date && current.passageSlug) return current;
	return buildDailyEval(date);
}

export function applyShowUpStreak(
	fork: ReadingForkState,
	today: string
): { showUpStreak: number; lastEvalDate: string } {
	if (fork.lastEvalDate === today) {
		return { showUpStreak: fork.showUpStreak, lastEvalDate: today };
	}
	const yesterdayGap =
		fork.lastEvalDate === null ? 999 : Math.abs(Date.parse(today) - Date.parse(fork.lastEvalDate));
	const days = fork.lastEvalDate ? Math.round(yesterdayGap / 86400000) : 999;
	const showUpStreak = days === 1 ? fork.showUpStreak + 1 : 1;
	return { showUpStreak, lastEvalDate: today };
}

/** One unseen miss per question. A seen miss can be enqueued again. */
export function enqueueMiss(misses: Miss[], questionId: string, picked: string): Miss[] {
	if (misses.some((miss) => miss.questionId === questionId && !miss.seen)) return misses;
	return [...misses, { questionId, picked, seen: false }];
}

export function markMissSeen(misses: Miss[], questionId: string): Miss[] {
	let flipped = false;
	return misses.map((miss) => {
		if (!flipped && miss.questionId === questionId && !miss.seen) {
			flipped = true;
			return { ...miss, seen: true };
		}
		return miss;
	});
}

export function unseenMisses(misses: Miss[]): Miss[] {
	return misses.filter((miss) => !miss.seen);
}
