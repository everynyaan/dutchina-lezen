import { getAnnotation, resolveEvidence } from './annotations';
import { addDays, allPassages, dayIndex, daysBetween, type BankPassage } from './bank';
import { accuracyByQtype, lastSeenPassage } from './history';
import { isWholeText, type LoopItem } from './loop';
import {
	paragraphMapFor,
	paraphraseById,
	paraphraseFor,
	practiceById,
	practiceItemsFor
} from './practice';
import { eligibleSetPassages } from './sets';
import {
	ATTEMPT_CAP,
	type DailyTextState,
	type QType,
	type ReadingAttempt,
	type ReadingForkState
} from './types';

const FRESH_DAYS = 7;
const MAP_GAP_DAYS = 21;
const OFFICIAL_GAP_DAYS = 21;

function reservedYears(fork: ReadingForkState): Set<number> {
	const years = fork.settings?.reservedPapers ?? [2023];
	return new Set(years);
}

function seenOn(fork: ReadingForkState, slug: string): string {
	return lastSeenPassage(fork, slug)?.slice(0, 10) ?? '';
}

function notSeenRecently(fork: ReadingForkState, slug: string, date: string): boolean {
	const seen = seenOn(fork, slug);
	if (!seen) return true;
	return daysBetween(seen, date) > FRESH_DAYS;
}

/** Non-reserved passages, unseen for 7 days, oldest last-seen first. Ties use dayIndex. */
export function pickPassage(fork: ReadingForkState, date: string): BankPassage | null {
	const reserved = reservedYears(fork);
	const pool = [
		...allPassages().filter((passage) => !reserved.has(passage.year)),
		...eligibleSetPassages(fork)
	];
	if (pool.length === 0) return null;
	const fresh = pool.filter((passage) => notSeenRecently(fork, passage.slug, date));
	const candidates = (fresh.length > 0 ? fresh : pool).slice().sort((a, b) => {
		const seen = seenOn(fork, a.slug).localeCompare(seenOn(fork, b.slug));
		return seen || a.slug.localeCompare(b.slug);
	});
	const oldest = seenOn(fork, candidates[0].slug);
	const tied = candidates.filter((passage) => seenOn(fork, passage.slug) === oldest);
	return tied[dayIndex(date, tied.length)] ?? null;
}

function attemptedWithin(
	fork: ReadingForkState,
	itemId: string,
	days: number,
	date: string
): boolean {
	return fork.attempts.some((attempt) => {
		if (attempt.itemId !== itemId || !attempt.at) return false;
		const gap = daysBetween(attempt.at.slice(0, 10), date);
		return gap >= 0 && gap <= days;
	});
}

function neverAnswered(fork: ReadingForkState, itemId: string): boolean {
	return !fork.attempts.some((attempt) => attempt.itemId === itemId);
}

function qtypeAccuracy(stats: ReturnType<typeof accuracyByQtype>, qtype: QType): number {
	const row = stats[qtype];
	if (!row || row.t === 0) return 0.5;
	return row.c / row.t;
}

/** Up to three questions. At most one official. A fresh doel-tekst goes last. */
export function selectQuestions(
	fork: ReadingForkState,
	passage: BankPassage,
	date: string
): string[] {
	if (passage.year === 0) {
		const stats = accuracyByQtype(fork);
		const fresh = passage.questions.filter((question) => neverAnswered(fork, question.id));
		const doel = fresh.find((question) => getAnnotation(question.id)?.qtype === 'doel-tekst');
		const rest = fresh
			.filter((question) => question.id !== doel?.id)
			.sort((a, b) => {
				const aType = getAnnotation(a.id)?.qtype ?? 'detail';
				const bType = getAnnotation(b.id)?.qtype ?? 'detail';
				const gap = qtypeAccuracy(stats, aType) - qtypeAccuracy(stats, bType);
				return gap || a.id.localeCompare(b.id);
			});
		const chosen = rest.slice(0, doel ? 2 : 3).map((question) => question.id);
		if (doel) chosen.push(doel.id);
		return chosen;
	}
	const practice = practiceItemsFor(passage.slug);
	const stats = accuracyByQtype(fork);
	const officialDoel = passage.questions.find(
		(question) =>
			getAnnotation(question.id)?.qtype === 'doel-tekst' &&
			!attemptedWithin(fork, question.id, OFFICIAL_GAP_DAYS, date)
	);
	const practiceWhole = practice
		.filter((item) => isWholeText(item.qtype) && neverAnswered(fork, item.id))
		.sort((a, b) => {
			const rank = (qtype: QType) =>
				qtype === 'doel-tekst' ? 0 : qtype === 'hoofdgedachte' ? 1 : 2;
			return rank(a.qtype) - rank(b.qtype) || a.id.localeCompare(b.id);
		});
	const last = officialDoel?.id ?? practiceWhole[0]?.id ?? null;
	const practiceRest = practice
		.filter((item) => item.id !== last && neverAnswered(fork, item.id))
		.sort((a, b) => {
			const gap = qtypeAccuracy(stats, a.qtype) - qtypeAccuracy(stats, b.qtype);
			return gap || a.id.localeCompare(b.id);
		});
	const officialRest = passage.questions
		.filter(
			(question) =>
				question.id !== last && !attemptedWithin(fork, question.id, OFFICIAL_GAP_DAYS, date)
		)
		.sort((a, b) => a.id.localeCompare(b.id));
	const slots = last ? 2 : 3;
	const chosen: string[] = [];
	for (const item of practiceRest) {
		if (chosen.length >= slots) break;
		chosen.push(item.id);
	}
	if (!officialDoel && chosen.length < slots && officialRest[0]) {
		chosen.push(officialRest[0].id);
	}
	if (last) chosen.push(last);
	return chosen;
}

/** One paraphrase. afterItemId is allowed when that item is already in history or in today's questions. */
export function selectParaphrase(
	fork: ReadingForkState,
	slug: string,
	date: string,
	questionIds: readonly string[]
): string | null {
	const drills = paraphraseFor(slug)
		.filter((drill) => {
			if (!drill.afterItemId) return true;
			if (questionIds.includes(drill.afterItemId)) return true;
			return fork.attempts.some((attempt) => attempt.itemId === drill.afterItemId);
		})
		.sort((a, b) => a.id.localeCompare(b.id));
	if (drills.length === 0) return null;
	return drills[dayIndex(date, drills.length)]?.id ?? null;
}

export function shouldMap(fork: ReadingForkState, slug: string, date: string): boolean {
	if (paragraphMapFor(slug).length === 0) return false;
	const recent = fork.attempts.some((attempt) => {
		if (attempt.source !== 'map' || attempt.passageSlug !== slug || !attempt.at) return false;
		const gap = daysBetween(attempt.at.slice(0, 10), date);
		return gap >= 0 && gap <= MAP_GAP_DAYS;
	});
	return !recent;
}

export function buildDailyText(fork: ReadingForkState, date: string): DailyTextState {
	const passage = pickPassage(fork, date);
	if (!passage) {
		return {
			date,
			passageSlug: null,
			mapDone: true,
			itemIds: [],
			answers: {},
			completed: false
		};
	}
	const questions = selectQuestions(fork, passage, date);
	const paraphrase = selectParaphrase(fork, passage.slug, date, questions);
	return {
		date,
		passageSlug: passage.slug,
		mapDone: !shouldMap(fork, passage.slug, date),
		itemIds: paraphrase ? [...questions, paraphrase] : questions,
		answers: {},
		completed: false
	};
}

export function dailyLoopItem(passage: BankPassage, id: string): LoopItem | null {
	const practice = practiceById(id);
	if (practice && practiceItemsFor(passage.slug).some((item) => item.id === id)) {
		const resolved = practiceItemsFor(passage.slug).find((item) => item.id === id)!;
		return {
			id: resolved.id,
			question: resolved.question,
			options: resolved.options,
			answer: resolved.answer,
			qtype: resolved.qtype,
			why: resolved.why,
			distractors: resolved.distractors,
			evidence: resolved.evidence
		};
	}
	const drill = paraphraseById(id);
	if (drill && paraphraseFor(passage.slug).some((item) => item.id === id)) {
		const resolved = paraphraseFor(passage.slug).find((item) => item.id === id)!;
		return {
			id: resolved.id,
			question: resolved.prompt,
			options: resolved.options,
			answer: resolved.answer,
			why: 'One sentence means the same thing. The others change it.',
			distractors: resolved.distractors,
			evidence: [resolved.source]
		};
	}
	const question = passage.questions.find((item) => item.id === id);
	if (!question) return null;
	const annotation = getAnnotation(id);
	let evidence = annotation?.evidence ?? [];
	if (annotation) {
		try {
			const indexes = resolveEvidence(passage.text, annotation.evidence);
			evidence = annotation.evidence.map((item, index) => ({ ...item, p: indexes[index] }));
		} catch {
			evidence = annotation.evidence;
		}
	}
	return {
		id: question.id,
		question: question.question,
		options: question.options,
		answer: question.answer,
		qtype: annotation?.qtype,
		why: annotation?.why ?? '',
		distractors: annotation?.distractors ?? {},
		evidence
	};
}

export function appendAttempt(attempts: ReadingAttempt[], next: ReadingAttempt): ReadingAttempt[] {
	const all = [...attempts, next];
	return all.length > ATTEMPT_CAP ? all.slice(all.length - ATTEMPT_CAP) : all;
}

export function mapAttempt(slug: string, date: string): ReadingAttempt {
	return {
		itemId: `map:${slug}`,
		origin: 'practice',
		passageSlug: slug,
		source: 'map',
		at: date,
		picked: '',
		correct: true,
		locateP: null,
		locateHit: null,
		ms: 0
	};
}

/** Used by tests that need a date a fixed distance away. */
export function daysAgo(date: string, days: number): string {
	return addDays(date, -days);
}
