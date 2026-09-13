import type { ReadingEvalState, TrapCard, TrapType, ReadingForkState } from './types';
import { TRAP_TYPES } from './types';
import { addDays, allPassages, dayIndex, findPassage, findQuestion } from './bank';
import { uniqueIds } from './drills';
import { classifyTrap, passageSnippet } from './traps';

export function buildDailyEval(date: string): ReadingEvalState {
	const passages = allPassages();
	const passage = passages[dayIndex(date, passages.length)];
	const others = passages.filter((p) => p.slug !== passage.slug);
	const distractorA = others[dayIndex(date, others.length, 1)];
	const distractorB = others[dayIndex(date, others.length, 2)];
	const gistOptions = shuffleStable(
		[passage.intro, distractorA.intro, distractorB.intro],
		date + passage.slug
	);
	const qs = [...passage.questions];
	const q0 = qs[dayIndex(date, qs.length, 3)];
	let q1 = qs[dayIndex(date, qs.length, 4)];
	if (q1.id === q0.id && qs.length > 1) {
		q1 = qs[(qs.indexOf(q0) + 1) % qs.length];
	}
	return {
		date,
		passageSlug: passage.slug,
		year: passage.year,
		gistOptions,
		gistAnswer: passage.intro,
		gistPicked: null,
		questionIds: capEvalQuestions(q0.id, q1?.id),
		results: {},
		completed: false
	};
}

export function ensureTodayEval(current: ReadingEvalState, date: string): ReadingEvalState {
	if (current.date === date && current.passageSlug) return current;
	return buildDailyEval(date);
}

function shuffleStable(items: string[], seed: string): string[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = dayIndex(seed, i + 1, i);
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/** One passage, at most two real questions. Gist is a separate job. */
function capEvalQuestions(first: string, second?: string): string[] {
	if (second && second !== first) return [first, second];
	return [first];
}

export function nextDueDate(today: string): string {
	return today;
}

export function cardFromMiss(args: {
	questionId: string;
	picked: string;
	today: string;
}): TrapCard | null {
	const found = findQuestion(args.questionId);
	if (!found) return null;
	const { passage, question } = found;
	const trap = classifyTrap(question.question);
	const correctText = question.options[question.answer] ?? '';
	return {
		id: `trap:${trap}`,
		trap,
		questionId: question.id,
		passageSlug: passage.slug,
		passageName: passage.name,
		question: question.question,
		correct: question.answer,
		picked: args.picked,
		correctText,
		snippet: passageSnippet(passage.text),
		createdAt: args.today,
		dueDate: nextDueDate(args.today),
		reps: 0,
		seenDrillIds: [question.id]
	};
}

export function cardFromGistMiss(args: {
	passageSlug: string;
	picked: string;
	today: string;
}): TrapCard | null {
	const passage = findPassage(args.passageSlug);
	if (!passage) return null;
	return {
		id: 'trap:hoofdonderwerp',
		trap: 'hoofdonderwerp',
		questionId: `gist:${passage.slug}`,
		passageSlug: passage.slug,
		passageName: passage.name,
		question: 'Which intro matches this text?',
		correct: '',
		picked: args.picked,
		correctText: passage.intro,
		snippet: passageSnippet(passage.text),
		createdAt: args.today,
		dueDate: nextDueDate(args.today),
		reps: 0,
		seenDrillIds: [`gist:${passage.slug}`]
	};
}

export function stampStickers(have: TrapType[], add: TrapType): TrapType[] {
	if (have.includes(add)) return have;
	return [...have, add];
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
	// Date.parse of YYYY-MM-DD is UTC; day gap ~86400000
	const days = fork.lastEvalDate ? Math.round(yesterdayGap / 86400000) : 999;
	const showUpStreak = days === 1 ? fork.showUpStreak + 1 : 1;
	return { showUpStreak, lastEvalDate: today };
}

export function dueTrapCards(fork: ReadingForkState, today: string): TrapCard[] {
	return coalesceTrapCards(fork.trapCards).filter((c) => c.dueDate <= today);
}

export function coalesceTrapCards(cards: TrapCard[]): TrapCard[] {
	const byTrap = new Map<TrapType, TrapCard>();
	for (const card of cards) {
		const prev = byTrap.get(card.trap);
		const seen = uniqueIds([
			...(prev?.seenDrillIds ?? []),
			...(card.seenDrillIds ?? []),
			prev?.questionId,
			card.questionId
		]);
		if (!prev) {
			byTrap.set(card.trap, { ...card, id: `trap:${card.trap}`, seenDrillIds: seen });
			continue;
		}
		const createdAt = prev.createdAt <= card.createdAt ? prev.createdAt : card.createdAt;
		const dueDate = prev.dueDate <= card.dueDate ? prev.dueDate : card.dueDate;
		byTrap.set(card.trap, {
			...card,
			id: `trap:${card.trap}`,
			createdAt,
			dueDate,
			reps: Math.min(prev.reps, card.reps),
			seenDrillIds: seen
		});
	}
	return TRAP_TYPES.filter((t) => byTrap.has(t)).map((t) => byTrap.get(t)!);
}

/** One sticker per trap type — a miss refreshes the drill, it does not start a word deck. */
export function upsertCard(cards: TrapCard[], card: TrapCard): TrapCard[] {
	return coalesceTrapCards([...cards, card]);
}

export function resolveTrapDrill(
	cards: TrapCard[],
	trap: TrapType,
	knew: boolean,
	today: string,
	drillQuestionId: string
): TrapCard[] {
	return coalesceTrapCards(cards).map((c) => {
		if (c.trap !== trap) return c;
		const seen = uniqueIds([...(c.seenDrillIds ?? []), drillQuestionId]);
		return {
			...c,
			seenDrillIds: seen,
			reps: knew ? c.reps + 1 : c.reps,
			dueDate: knew ? addDays(today, c.reps === 0 ? 1 : 3) : today
		};
	});
}

export { findPassage, findQuestion };
