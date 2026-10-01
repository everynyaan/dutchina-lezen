import type { LezenExam, LezenPassage, LezenQuestion } from '$lib/lezen/types';
import rawSets from './sets/PRACTICE_SETS.json';
import type { ItemOrigin, MockResult, ReadingForkState } from './types';

/** Unofficial rehearsals. Target 25 of 35. Not an official pass line. */
export const SET_TARGET = 25;
export const SET_SIZE = 35;
export const HORIZON_SLUG = 'set1-horizon-college';
export const SET_MIX_NOTE =
	'These sets lean on Apply the rule questions, about a third of the items, and have few Find the fact questions. The official papers remain the reference for the real mix.';

export interface SetQuestion extends LezenQuestion {
	origin: 'revised' | 'new';
	replaces: number;
}

export interface SetPassage extends Omit<LezenPassage, 'questions'> {
	questions: SetQuestion[];
}

export interface PracticeSet {
	id: string;
	title: string;
	origin: 'video-set';
	passages: SetPassage[];
	notes: string[];
}

export const PRACTICE_SETS = rawSets as PracticeSet[];

export function practiceSets(): PracticeSet[] {
	return PRACTICE_SETS;
}

export function setById(id: string): PracticeSet | null {
	return PRACTICE_SETS.find((set) => set.id === id) ?? null;
}

export function setNumber(id: string): number {
	const n = Number(id.replace(/^set/, ''));
	return Number.isInteger(n) ? n : 0;
}

export function setHistoryLabel(id: string): string {
	return `Practice set ${setNumber(id)}`;
}

export function allSetQuestions(): { setId: string; passage: SetPassage; question: SetQuestion }[] {
	return PRACTICE_SETS.flatMap((set) =>
		set.passages.flatMap((passage) =>
			passage.questions.map((question) => ({ setId: set.id, passage, question }))
		)
	);
}

export function setQuestionById(
	id: string
): { setId: string; passage: SetPassage; question: SetQuestion } | null {
	return allSetQuestions().find((row) => row.question.id === id) ?? null;
}

export function setPassageBySlug(
	slug: string
): (SetPassage & { year: number; setId: string }) | null {
	for (const set of PRACTICE_SETS) {
		const passage = set.passages.find((row) => row.slug === slug);
		if (passage) return { ...passage, year: 0, setId: set.id };
	}
	return null;
}

export function originForItem(itemId: string): ItemOrigin {
	if (itemId.startsWith('lezen-')) return 'official';
	if (itemId.startsWith('set')) return 'fresh';
	return 'practice';
}

type SetMock = Pick<MockResult, 'paperYear' | 'setId'>;

/** True until a real 2025 paper sitting exists. A practice set does not count. */
export function horizonLocked(mocks: readonly SetMock[]): boolean {
	return !mocks.some((mock) => mock.paperYear === 2025 && !mock.setId);
}

export function latestSetResult(mocks: readonly MockResult[], setId: string): MockResult | null {
	let latest: MockResult | null = null;
	for (const mock of mocks) {
		if (mock.setId !== setId || !mock.finishedAt) continue;
		if (
			latest === null ||
			mock.finishedAt > latest.finishedAt ||
			(mock.finishedAt === latest.finishedAt && mock.id > latest.id)
		) {
			latest = mock;
		}
	}
	return latest;
}

export function setTaken(mocks: readonly MockResult[], setId: string): boolean {
	return latestSetResult(mocks, setId) !== null;
}

function toPassage(passage: SetPassage): LezenPassage {
	return {
		name: passage.name,
		slug: passage.slug,
		intro: passage.intro,
		text: passage.text,
		questions: passage.questions.map((question) => ({
			id: question.id,
			vraag: question.vraag,
			question: question.question,
			options: question.options,
			answer: question.answer
		}))
	};
}

/** The rehearsal paper. Horizon College stays out until the 2025 mock exists. */
export function examForSet(setId: string, horizonOpen: boolean): LezenExam | null {
	const set = setById(setId);
	if (!set) return null;
	const passages = set.passages
		.filter((passage) => horizonOpen || passage.slug !== HORIZON_SLUG)
		.map(toPassage);
	if (passages.length === 0) return null;
	const totalQuestions = passages.reduce((sum, passage) => sum + passage.questions.length, 0);
	return {
		year: 0,
		totalQuestions,
		passingScore: SET_TARGET,
		passages
	};
}

/** Taken sets, for daily and drills. Horizon stays out while it is locked. */
export function eligibleSetPassages(
	fork: Pick<ReadingForkState, 'mocks'>
): (LezenPassage & { year: number })[] {
	const open = !horizonLocked(fork.mocks);
	const rows: (LezenPassage & { year: number })[] = [];
	for (const set of PRACTICE_SETS) {
		if (!setTaken(fork.mocks, set.id)) continue;
		for (const passage of set.passages) {
			if (passage.slug === HORIZON_SLUG && !open) continue;
			rows.push({ ...toPassage(passage), year: 0 });
		}
	}
	return rows;
}

export function unseenSetAccuracy(
	fork: Pick<ReadingForkState, 'attempts'>
): { correct: number; total: number } | null {
	const ids = new Set(allSetQuestions().map((row) => row.question.id));
	const ordered = fork.attempts
		.map((attempt, index) => ({ attempt, index }))
		.sort((a, b) => a.attempt.at.localeCompare(b.attempt.at) || a.index - b.index);
	const first = new Map<string, boolean>();
	for (const row of ordered) {
		if (!ids.has(row.attempt.itemId) || first.has(row.attempt.itemId)) continue;
		first.set(row.attempt.itemId, row.attempt.correct);
	}
	if (first.size === 0) return null;
	let correct = 0;
	for (const hit of first.values()) if (hit) correct += 1;
	return { correct, total: first.size };
}
