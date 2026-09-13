import type { LezenQuestion } from '$lib/lezen/types';
import { allPassages, dayIndex, type BankPassage } from './bank';
import { classifyTrap, passageSnippet } from './traps';
import type { TrapType } from './types';
import { TRAP_MOVE, TRAP_TYPES } from './types';

export interface DrillItem {
	passage: BankPassage;
	question: LezenQuestion;
}

export interface DrillPrompt {
	trap: TrapType;
	questionId: string;
	passageSlug: string;
	passageName: string;
	year: number;
	snippet: string;
	question: string;
	options: Record<string, string>;
	answer: string;
	move: string;
	/** Classified type of the stem (may differ on thin-bank fallback). */
	stemTrap: TrapType;
	reused: boolean;
	sameAsMiss: boolean;
	fallback: boolean;
}

export function itemsForTrap(trap: TrapType): DrillItem[] {
	const items: DrillItem[] = [];
	for (const passage of allPassages()) {
		for (const question of passage.questions) {
			if (classifyTrap(question.question) === trap) {
				items.push({ passage, question });
			}
		}
	}
	return items;
}

export function uniqueIds(ids: Array<string | undefined | null>): string[] {
	const out: string[] = [];
	for (const id of ids) {
		if (id && !out.includes(id)) out.push(id);
	}
	return out;
}

function toPrompt(
	item: DrillItem,
	trap: TrapType,
	flags: { reused: boolean; sameAsMiss: boolean; fallback: boolean }
): DrillPrompt {
	return {
		trap,
		questionId: item.question.id,
		passageSlug: item.passage.slug,
		passageName: item.passage.name,
		year: item.passage.year,
		snippet: drillSnippet(item.passage.text, item.question.id),
		question: item.question.question,
		options: item.question.options,
		answer: item.question.answer,
		move: TRAP_MOVE[trap],
		stemTrap: classifyTrap(item.question.question),
		reused: flags.reused,
		sameAsMiss: flags.sameAsMiss,
		fallback: flags.fallback
	};
}

/** Prefer a later paragraph so the card is not the same first-280-chars cut. */
export function drillSnippet(text: string, salt: string): string {
	const paras = text
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean);
	if (paras.length <= 1) return passageSnippet(text);
	const i = dayIndex(salt, paras.length, 11);
	const chunk = [paras[i], paras[i + 1] ?? paras[i === 0 ? 1 : i - 1]].filter(Boolean).join('\n\n');
	return passageSnippet(chunk);
}

/**
 * Pick a real exam item to drill a trap.
 * Never invents questions. Prefers an unused same-type stem, then a used
 * same-type stem that is not the miss, then any other real stem.
 */
export function pickDrill(opts: {
	trap: TrapType;
	avoidIds: string[];
	seed: string;
}): DrillPrompt {
	const avoid = uniqueIds(opts.avoidIds);
	const pool = itemsForTrap(opts.trap);
	const unused = pool.filter((item) => !avoid.includes(item.question.id));

	if (unused.length > 0) {
		const item = unused[dayIndex(opts.seed, unused.length)];
		return toPrompt(item, opts.trap, { reused: false, sameAsMiss: false, fallback: false });
	}

	const notOriginal = pool.filter((item) => item.question.id !== avoid[0]);
	if (notOriginal.length > 0) {
		const item = notOriginal[dayIndex(opts.seed, notOriginal.length, 1)];
		return toPrompt(item, opts.trap, { reused: true, sameAsMiss: false, fallback: false });
	}

	if (pool.length > 0) {
		return toPrompt(pool[0], opts.trap, { reused: true, sameAsMiss: true, fallback: false });
	}

	const cousins = TRAP_TYPES.filter((t) => t !== opts.trap).flatMap(itemsForTrap);
	const other = cousins.filter((item) => !avoid.includes(item.question.id));
	const fallbackPool = other.length ? other : cousins;
	if (fallbackPool.length === 0) {
		throw new Error('Lezen bank is empty — cannot build a trap drill');
	}
	const item = fallbackPool[dayIndex(opts.seed, fallbackPool.length, 2)];
	return toPrompt(item, opts.trap, { reused: true, sameAsMiss: false, fallback: true });
}
