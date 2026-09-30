import { seededRng, shuffle } from '$lib/quiz/rng';
import { getAnnotation } from './annotations';
import { allPassages, dayIndex, findQuestion, type BankPassage } from './bank';
import { itemAttemptedWithin } from './history';
import { paraphraseFor, itemPassageSlug, practiceItemsFor } from './practice';
import { eligibleSetPassages } from './sets';
import { TRAP_KINDS, type QType, type ReadingForkState, type TrapKind } from './types';

export interface LurePrompt {
	itemId: string;
	slug: string;
	letter: string;
	text: string;
	trap: TrapKind;
	why: string;
	choices: TrapKind[];
}

interface TrapRow {
	id: string;
	slug: string;
	origin: 'practice' | 'official' | 'fresh';
}

function reservedYears(fork: ReadingForkState): Set<number> {
	return new Set(fork.settings?.reservedPapers ?? [2023]);
}

function openPassages(fork: ReadingForkState): BankPassage[] {
	const reserved = reservedYears(fork);
	return [
		...allPassages().filter((passage) => !reserved.has(passage.year)),
		...eligibleSetPassages(fork)
	];
}

export function itemSlug(id: string): string | null {
	return itemPassageSlug(id) ?? findQuestion(id)?.passage.slug ?? null;
}

function trapRows(fork: ReadingForkState, trap: TrapKind): TrapRow[] {
	const rows: TrapRow[] = [];
	for (const passage of openPassages(fork)) {
		for (const item of practiceItemsFor(passage.slug)) {
			const hit = Object.values(item.distractors).some((row) => row.trap === trap);
			if (hit) rows.push({ id: item.id, slug: passage.slug, origin: 'practice' });
		}
		for (const question of passage.questions) {
			const annotation = getAnnotation(question.id);
			const hit = annotation
				? Object.values(annotation.distractors).some((row) => row.trap === trap)
				: false;
			if (hit) {
				rows.push({
					id: question.id,
					slug: passage.slug,
					origin: passage.year === 0 ? 'fresh' : 'official'
				});
			}
		}
	}
	return rows;
}

function pickRow(rows: TrapRow[], date: string, salt: number): string | null {
	if (rows.length === 0) return null;
	const sorted = rows.slice().sort((a, b) => a.id.localeCompare(b.id));
	return sorted[dayIndex(date, sorted.length, salt)]?.id ?? null;
}

/**
 * Practice first, then official. Fresh for 14 days and off the last miss's passage,
 * then fresh for 3 days, then any item that carries the trap.
 */
export function selectTrapItem(
	fork: ReadingForkState,
	trap: TrapKind,
	date: string
): string | null {
	const card = fork.traps.find((row) => row.trap === trap);
	const lastSlug = card ? itemSlug(card.lastItemId) : null;
	const rows = trapRows(fork, trap);
	const away = (row: TrapRow) => row.slug !== lastSlug;
	const fresh = (days: number) => (row: TrapRow) => !itemAttemptedWithin(fork, row.id, days, date);
	const tiers: { test: (row: TrapRow) => boolean; salt: number }[] = [
		{ test: (row) => row.origin === 'practice' && away(row) && fresh(14)(row), salt: 1 },
		{ test: (row) => row.origin === 'fresh' && away(row) && fresh(14)(row), salt: 12 },
		{ test: (row) => row.origin === 'official' && away(row) && fresh(14)(row), salt: 2 },
		{ test: (row) => row.origin === 'practice' && away(row) && fresh(3)(row), salt: 3 },
		{ test: (row) => row.origin === 'fresh' && away(row) && fresh(3)(row), salt: 13 },
		{ test: (row) => row.origin === 'official' && away(row) && fresh(3)(row), salt: 4 },
		{ test: (row) => row.origin === 'practice', salt: 5 },
		{ test: (row) => row.origin === 'fresh', salt: 14 },
		{ test: (row) => row.origin === 'official', salt: 6 }
	];
	for (const tier of tiers) {
		const id = pickRow(rows.filter(tier.test), date, tier.salt);
		if (id) return id;
	}
	return null;
}

function rotate<T>(rows: T[], date: string, salt: number): T[] {
	if (rows.length === 0) return [];
	const start = dayIndex(date, rows.length, salt);
	return [...rows.slice(start), ...rows.slice(0, start)];
}

/** The right trap plus two others, in a stable shuffled order. */
export function lureChoices(trap: TrapKind, seed: string): TrapKind[] {
	const others = shuffle(
		TRAP_KINDS.filter((kind) => kind !== trap),
		seededRng(seed)
	);
	const trio = [trap, others[0], others[1]].filter((kind): kind is TrapKind => Boolean(kind));
	return shuffle(trio, seededRng(`${seed}|order`));
}

/** Five wrong options from items she has attempted. Open trap cards come first. */
export function selectLures(fork: ReadingForkState, date: string, count = 5): LurePrompt[] {
	const seen = new Set(fork.attempts.map((attempt) => attempt.itemId));
	const open = new Set(fork.traps.filter((card) => card.tamedAt === null).map((card) => card.trap));
	const preferred: Omit<LurePrompt, 'choices'>[] = [];
	const rest: Omit<LurePrompt, 'choices'>[] = [];
	for (const passage of openPassages(fork)) {
		const practice = practiceItemsFor(passage.slug).map((item) => ({
			id: item.id,
			options: item.options,
			distractors: item.distractors
		}));
		const official = passage.questions.flatMap((question) => {
			const annotation = getAnnotation(question.id);
			if (!annotation) return [];
			return [{ id: question.id, options: question.options, distractors: annotation.distractors }];
		});
		for (const item of [...practice, ...official]) {
			if (!seen.has(item.id)) continue;
			for (const [letter, row] of Object.entries(item.distractors)) {
				const prompt = {
					itemId: item.id,
					slug: passage.slug,
					letter,
					text: item.options[letter] ?? '',
					trap: row.trap,
					why: row.why
				};
				if (open.has(row.trap)) preferred.push(prompt);
				else rest.push(prompt);
			}
		}
	}
	const byId = (a: Omit<LurePrompt, 'choices'>, b: Omit<LurePrompt, 'choices'>) =>
		a.itemId.localeCompare(b.itemId) || a.letter.localeCompare(b.letter);
	const ordered = [
		...rotate(preferred.slice().sort(byId), date, 9),
		...rotate(rest.slice().sort(byId), date, 10)
	];
	return ordered.slice(0, count).map((prompt) => ({
		...prompt,
		choices: lureChoices(prompt.trap, `${prompt.itemId}|${prompt.letter}|${date}`)
	}));
}

/** Paraphrase drills from passages she has seen. afterItemId must already be attempted. */
export function selectParaphraseDrills(
	fork: ReadingForkState,
	date: string,
	count = 5
): { slug: string; id: string }[] {
	const seen = new Set(
		fork.attempts.map((attempt) => attempt.passageSlug).filter((slug) => slug.length > 0)
	);
	const drills: { slug: string; id: string }[] = [];
	for (const passage of openPassages(fork)) {
		if (!seen.has(passage.slug)) continue;
		for (const drill of paraphraseFor(passage.slug)) {
			if (
				drill.afterItemId &&
				!fork.attempts.some((attempt) => attempt.itemId === drill.afterItemId)
			) {
				continue;
			}
			drills.push({ slug: passage.slug, id: drill.id });
		}
	}
	drills.sort((a, b) => a.id.localeCompare(b.id));
	return rotate(drills, date, 4).slice(0, count);
}

/** Three items of one question type. Practice items come before official ones. */
export function selectQtypeItems(
	fork: ReadingForkState,
	qtype: QType,
	date: string,
	count = 3
): string[] {
	const practice: string[] = [];
	const freshIds: string[] = [];
	const official: string[] = [];
	for (const passage of openPassages(fork)) {
		for (const item of practiceItemsFor(passage.slug)) {
			if (item.qtype === qtype) practice.push(item.id);
		}
		for (const question of passage.questions) {
			if (getAnnotation(question.id)?.qtype !== qtype) continue;
			if (passage.year === 0) freshIds.push(question.id);
			else official.push(question.id);
		}
	}
	const freshFirst = (ids: string[]) => {
		const fresh = ids.filter((id) => !itemAttemptedWithin(fork, id, 21, date));
		return (fresh.length > 0 ? fresh : ids).slice().sort((a, b) => a.localeCompare(b));
	};
	const fromPractice = rotate(freshFirst(practice), date, 7).slice(0, count);
	const fromFresh = rotate(freshFirst(freshIds), date, 11).slice(0, count - fromPractice.length);
	const fromOfficial = rotate(freshFirst(official), date, 8).slice(
		0,
		count - fromPractice.length - fromFresh.length
	);
	return [...fromPractice, ...fromFresh, ...fromOfficial];
}
