/**
 * Phase 2 skip/swap. 3 per calendar day on the daily quiz, 3 per
 * calendar day on the week set. Same type, same engine gate, unanswered
 * only. Splices persisted ids — never full-regenerates.
 */
import { generateReplacementQuestion, homeworkQuestionId } from '$lib/daily/generator';
import type { DailyQuestion } from '$lib/daily/types';
import { examInHomework, type GateId } from '$lib/gates/gates';
import { sample, seededRng } from './rng';
import { buildQuestions, type QuizSourceData } from './generator';
import type { QuizBuiltQuestion } from './types';

export const SWAP_CAP = 3;

export interface SwapLedger {
	date: string | null;
	used: number;
	swappedOutIds: string[];
}

export const EMPTY_SWAPS: SwapLedger = { date: null, used: 0, swappedOutIds: [] };

export type SwapBlockReason = 'capped' | 'completed' | 'answered' | 'empty';

export function emptySwaps(): SwapLedger {
	return { date: null, used: 0, swappedOutIds: [] };
}

export function swapsForToday(swaps: SwapLedger | undefined | null, today: string): SwapLedger {
	if (!swaps || swaps.date !== today) {
		return { date: today, used: 0, swappedOutIds: [] };
	}
	return {
		date: today,
		used: Math.max(0, Number(swaps.used) || 0),
		swappedOutIds: Array.isArray(swaps.swappedOutIds) ? [...swaps.swappedOutIds] : []
	};
}

/** Same calendar day: keep-local ids, max(used). Stale dates reset first. */
export function mergeSwaps(
	local: SwapLedger | undefined | null,
	remote: SwapLedger | undefined | null,
	today: string
): SwapLedger {
	const L = swapsForToday(local, today);
	const R = swapsForToday(remote, today);
	return {
		date: today,
		used: Math.max(L.used, R.used),
		swappedOutIds: [...L.swappedOutIds]
	};
}

export function quizIdKind(
	id: string
): 'match' | 'recall' | 'conv' | 'lezen' | 'luisteren' | null {
	if (id.startsWith('match:')) return 'match';
	if (id.startsWith('recall:')) return 'recall';
	if (id.startsWith('conv:')) return 'conv';
	if (id.startsWith('lezen:')) return 'lezen';
	if (id.startsWith('luisteren:')) return 'luisteren';
	return null;
}

function wordRef(id: string): string {
	const i = id.indexOf(':');
	return i === -1 ? id : id.slice(i + 1);
}

function resolveQuizKind(
	kind: NonNullable<ReturnType<typeof quizIdKind>>,
	gate: GateId
): 'match' | 'recall' | 'conv' | 'lezen' {
	if ((kind === 'lezen' || kind === 'luisteren') && !examInHomework(gate)) {
		return 'match';
	}
	if (kind === 'conv' && gate === 1) return 'match';
	if (kind === 'luisteren') return 'lezen';
	return kind;
}

export function pickQuizReplacementId(
	currentId: string,
	existingIds: string[],
	swappedOutIds: string[],
	data: QuizSourceData,
	gate: GateId,
	seed: string
): string | null {
	const kind = quizIdKind(currentId);
	if (!kind) return null;
	const resolved = resolveQuizKind(kind, gate);
	const blocked = new Set<string>([...existingIds, ...swappedOutIds, currentId]);
	const blockedWords = new Set<string>();
	for (const id of blocked) {
		if (id.startsWith('match:') || id.startsWith('recall:')) {
			blockedWords.add(wordRef(id));
		}
	}

	if (resolved === 'match' || resolved === 'recall') {
		const pool = [...data.rustyWords, ...data.candidateWords].filter(
			(w) => !blockedWords.has(w.id)
		);
		if (pool.length === 0) return null;
		const [picked] = sample(pool, 1, seededRng(seed));
		if (!picked) return null;
		return `${resolved}:${picked.id}`;
	}

	if (resolved === 'conv') {
		const used = new Set(
			[...blocked].map((id) => (id.startsWith('conv:') ? wordRef(id) : ''))
		);
		const pool = data.conversationPool.filter((s) => !used.has(s.question.id));
		if (pool.length === 0) return null;
		const [picked] = sample(pool, 1, seededRng(seed));
		return picked ? `conv:${picked.question.id}` : null;
	}

	const used = new Set([...blocked].map((id) => (id.startsWith('lezen:') ? wordRef(id) : '')));
	const pool = data.lezenPool.filter((s) => !used.has(s.question.id));
	if (pool.length === 0) return null;
	const [picked] = sample(pool, 1, seededRng(seed));
	return picked ? `lezen:${picked.question.id}` : null;
}

export interface QuizSwapInput {
	questionIds: string[];
	index: number;
	results: Record<string, boolean>;
	completed: boolean;
	swaps: SwapLedger | undefined;
	today: string;
	gate: GateId;
	data: QuizSourceData;
	seed: string;
}

export type QuizSwapOk = {
	ok: true;
	questionIds: string[];
	swaps: SwapLedger;
	previousId: string;
	replacementId: string;
};

export type QuizSwapFail = { ok: false; reason: SwapBlockReason };

export function applyQuizSwap(input: QuizSwapInput): QuizSwapOk | QuizSwapFail {
	if (input.completed) return { ok: false, reason: 'completed' };
	const ledger = swapsForToday(input.swaps, input.today);
	if (ledger.used >= SWAP_CAP) return { ok: false, reason: 'capped' };

	const previousId = input.questionIds[input.index];
	if (!previousId) return { ok: false, reason: 'empty' };
	if (previousId in input.results) return { ok: false, reason: 'answered' };

	const replacementId = pickQuizReplacementId(
		previousId,
		input.questionIds,
		ledger.swappedOutIds,
		input.data,
		input.gate,
		`${input.seed}|swap|${ledger.used}|${input.index}|${previousId}`
	);
	if (!replacementId) return { ok: false, reason: 'empty' };

	const questionIds = input.questionIds.slice();
	questionIds[input.index] = replacementId;
	return {
		ok: true,
		questionIds,
		swaps: {
			date: input.today,
			used: ledger.used + 1,
			swappedOutIds: [...ledger.swappedOutIds, previousId]
		},
		previousId,
		replacementId
	};
}

export function undoQuizSwap(
	questionIds: string[],
	index: number,
	swaps: SwapLedger,
	previousId: string,
	today: string
): { questionIds: string[]; swaps: SwapLedger } {
	const ledger = swapsForToday(swaps, today);
	const next = questionIds.slice();
	next[index] = previousId;
	return {
		questionIds: next,
		swaps: {
			date: today,
			used: Math.max(0, ledger.used - 1),
			swappedOutIds: ledger.swappedOutIds.filter((id) => id !== previousId)
		}
	};
}

export function rebuildQuizAt(
	ids: string[],
	data: QuizSourceData,
	seed: string
): QuizBuiltQuestion[] {
	return buildQuestions(ids, data, seed);
}

export interface HomeworkSwapInput {
	questions: DailyQuestion[];
	index: number;
	results: Record<number, boolean>;
	completed: boolean;
	swaps: SwapLedger | undefined;
	today: string;
	gate: GateId;
	rank: number;
}

export type HomeworkSwapOk = {
	ok: true;
	questions: DailyQuestion[];
	swaps: SwapLedger;
	previous: DailyQuestion;
	previousId: string;
};

export function applyHomeworkSwap(input: HomeworkSwapInput): HomeworkSwapOk | QuizSwapFail {
	if (input.completed) return { ok: false, reason: 'completed' };
	const ledger = swapsForToday(input.swaps, input.today);
	if (ledger.used >= SWAP_CAP) return { ok: false, reason: 'capped' };

	const previous = input.questions[input.index];
	if (!previous) return { ok: false, reason: 'empty' };
	if (input.index in input.results) return { ok: false, reason: 'answered' };

	const previousId = homeworkQuestionId(previous);
	const exclude = new Set<string>([
		...input.questions.map(homeworkQuestionId),
		...ledger.swappedOutIds,
		previousId
	]);
	const replacement = generateReplacementQuestion(previous.type, input.rank, input.gate, exclude);
	if (!replacement) return { ok: false, reason: 'empty' };

	const questions = input.questions.slice();
	questions[input.index] = replacement;
	return {
		ok: true,
		questions,
		swaps: {
			date: input.today,
			used: ledger.used + 1,
			swappedOutIds: [...ledger.swappedOutIds, previousId]
		},
		previous,
		previousId
	};
}

export function undoHomeworkSwap(
	questions: DailyQuestion[],
	index: number,
	swaps: SwapLedger,
	previous: DailyQuestion,
	previousId: string,
	today: string
): { questions: DailyQuestion[]; swaps: SwapLedger } {
	const ledger = swapsForToday(swaps, today);
	const next = questions.slice();
	next[index] = previous;
	return {
		questions: next,
		swaps: {
			date: today,
			used: Math.max(0, ledger.used - 1),
			swappedOutIds: ledger.swappedOutIds.filter((id) => id !== previousId)
		}
	};
}
