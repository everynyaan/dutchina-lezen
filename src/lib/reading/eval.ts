import type { BankPassage } from './bank';
import { allPassages, dayIndex } from './bank';
import type { Miss, ReadingEvalState, ReadingForkState } from './types';

/** Training paper only. 2023 and 2024 stay sealed for the mock. */
export function trainingPassages(): BankPassage[] {
	return allPassages().filter((passage) => passage.year === 2025);
}

export function buildDailyEval(date: string): ReadingEvalState {
	const passages = trainingPassages();
	const passage = passages[dayIndex(date, passages.length)];
	return {
		date,
		passageSlug: passage.slug,
		results: {},
		completed: false
	};
}

export function ensureTodayEval(current: ReadingEvalState, date: string): ReadingEvalState {
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
