import type { WordEntry } from '$lib/data/wordPool';
import type { ConversationQuestion } from '$lib/conversation/types';
import type { LezenQuestion } from '$lib/lezen/types';
import type {
	DailyMatchQuestion,
	DailyConversationQuestion,
	DailyLezenQuestion
} from '$lib/daily/types';
import type { QuizBuiltQuestion, QuizRecallQuestion } from './types';
import { sample, seededRng, shuffle } from './rng';

export interface QuizConversationSource {
	question: ConversationQuestion;
	chapterId: string;
	chapterText: string;
}

export interface QuizLezenSource {
	question: LezenQuestion;
	passageName: string;
	passageText: string;
}

export interface QuizSourceData {
	/** Rusty words, rustiest first (from getRustyWords). May be shorter than needed. */
	rustyWords: WordEntry[];
	/** Rank-appropriate words: tops up short rusty supply, and supplies distractors. */
	candidateWords: WordEntry[];
	/** Every word, so a question can be rebuilt from a persisted id even if the word left the pools. */
	allWords: WordEntry[];
	conversationPool: QuizConversationSource[];
	lezenPool: QuizLezenSource[];
}

const DISTRACTOR_COUNT = 3;
const WORD_SLOTS = 3;

/**
 * Stable-partition words so in-focus categories come first.
 * Relative order within each group is preserved. Never drops words (bias, not filter).
 * Returns a new array; does not mutate the input.
 */
function stablePartitionByFocus(words: WordEntry[], focusCategories: string[]): WordEntry[] {
	if (focusCategories.length === 0) return words.slice();
	const focusSet = new Set(focusCategories);
	const inFocus: WordEntry[] = [];
	const outOfFocus: WordEntry[] = [];
	for (const w of words) {
		if (focusSet.has(w.category)) inFocus.push(w);
		else outOfFocus.push(w);
	}
	return [...inFocus, ...outOfFocus];
}

/** Take the first 2 paragraphs of a passage as a context excerpt. */
function excerptOf(text: string): string {
	const paragraphs = text
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
	if (paragraphs.length === 0) return '';
	return paragraphs.slice(0, Math.min(2, paragraphs.length)).join('\n\n');
}

/**
 * Tiered distractor selection (mirrors match/engine pickDistractors),
 * with a seeded shuffle for deterministic option sets.
 */
function pickDistractorsFromPool(
	pool: WordEntry[],
	target: WordEntry,
	rng: () => number
): WordEntry[] {
	// Tier 1: same rank AND same POS
	let candidates = pool.filter(
		(w) => w.rank === target.rank && w.pos === target.pos && w.id !== target.id
	);

	// Tier 2: same POS, adjacent ranks (excludes same rank)
	if (candidates.length < DISTRACTOR_COUNT) {
		const sameposAdjacent = pool.filter(
			(w) =>
				w.id !== target.id &&
				w.pos === target.pos &&
				w.rank !== target.rank &&
				Math.abs(w.rank - target.rank) <= 1
		);
		candidates = [...candidates, ...sameposAdjacent];
	}

	// Tier 3: same rank, any POS
	if (candidates.length < DISTRACTOR_COUNT) {
		const sameRankAnyPos = pool.filter((w) => w.rank === target.rank && w.id !== target.id);
		candidates = [...candidates, ...sameRankAnyPos];
	}

	// Tier 4: any other word
	if (candidates.length < DISTRACTOR_COUNT) {
		const anyOther = pool.filter((w) => w.id !== target.id);
		candidates = [...candidates, ...anyOther];
	}

	const seen = new Set<string>();
	const unique: WordEntry[] = [];
	for (const w of candidates) {
		if (seen.has(w.id)) continue;
		seen.add(w.id);
		unique.push(w);
	}
	return shuffle(unique, rng).slice(0, DISTRACTOR_COUNT);
}

function inGateWords(data: QuizSourceData): WordEntry[] {
	const seen = new Set<string>();
	const out: WordEntry[] = [];
	for (const w of [...data.candidateWords, ...data.rustyWords]) {
		if (seen.has(w.id)) continue;
		seen.add(w.id);
		out.push(w);
	}
	return out;
}

function pickDistractors(data: QuizSourceData, target: WordEntry, rng: () => number): WordEntry[] {
	return pickDistractorsFromPool(inGateWords(data), target, rng);
}

function findWord(data: QuizSourceData, wordId: string): WordEntry | undefined {
	return (
		data.allWords.find((w) => w.id === wordId) ??
		data.candidateWords.find((w) => w.id === wordId) ??
		data.rustyWords.find((w) => w.id === wordId)
	);
}

function buildMatchQuestion(
	word: WordEntry,
	data: QuizSourceData,
	questionSeed: string
): DailyMatchQuestion {
	const rng = seededRng(questionSeed);
	const distractors = pickDistractors(data, word, rng);
	const optionTexts = [word.english, ...distractors.map((d) => d.english)];
	const shuffled = shuffle(optionTexts, rng);
	const correctIndex = shuffled.indexOf(word.english);
	return {
		type: 'match',
		wordId: word.id,
		sentenceNl: word.sentence_nl,
		targetDutch: word.dutch,
		options: shuffled,
		correctIndex: Math.max(0, correctIndex)
	};
}

function buildRecallQuestion(word: WordEntry): QuizRecallQuestion {
	return {
		type: 'quiz-recall',
		questionId: `recall:${word.id}`,
		wordId: word.id,
		english: word.english,
		pos: word.pos,
		answer: word.dutch,
		sentenceNl: word.sentence_nl,
		sentenceEn: word.sentence_en
	};
}

function buildConversationQuestion(source: QuizConversationSource): DailyConversationQuestion {
	return {
		type: 'conversation',
		questionId: source.question.id,
		chapterId: source.chapterId,
		excerpt: excerptOf(source.chapterText),
		text: source.question.text,
		options: source.question.options,
		correctIndex: source.question.correctIndex
	};
}

function buildLezenQuestion(source: QuizLezenSource): DailyLezenQuestion {
	return {
		type: 'lezen',
		questionId: source.question.id,
		excerpt: excerptOf(source.passageText),
		fullPassage: source.passageText,
		passageName: source.passageName,
		question: source.question.question,
		options: source.question.options,
		answer: source.question.answer
	};
}

/** The 5 namespaced ids, in fixed order. Deterministic for a given (data, seed, focusCategories). */
export function selectQuestionIds(
	data: QuizSourceData,
	seed: string,
	focusCategories: string[] = []
): string[] {
	const ids: string[] = [];
	const chosenWordIds = new Set<string>();
	const wordList: WordEntry[] = [];

	const rustyOrdered = stablePartitionByFocus(data.rustyWords, focusCategories);
	const candidatesOrdered = stablePartitionByFocus(data.candidateWords, focusCategories);

	// Draw rusty words first, in (optionally focus-biased) array order, distinct by id.
	for (const w of rustyOrdered) {
		if (wordList.length >= WORD_SLOTS) break;
		if (chosenWordIds.has(w.id)) continue;
		chosenWordIds.add(w.id);
		wordList.push(w);
	}

	// Top up from candidateWords if rusty supply is short. sample() shuffles its
	// input, which would destroy a bias applied via mere reordering — so when a
	// focus is active, sample WITHIN the in-focus group first and only fall back
	// to the out-of-focus group once in-focus supply is exhausted. Distinct
	// sub-seeds keep the two draws from consuming the same rng sequence.
	if (wordList.length < WORD_SLOTS) {
		const needed = WORD_SLOTS - wordList.length;
		const remaining = candidatesOrdered.filter((w) => !chosenWordIds.has(w.id));
		let extras: WordEntry[];
		if (focusCategories.length === 0) {
			extras = sample(remaining, needed, seededRng(`${seed}|words`));
		} else {
			const focusSet = new Set(focusCategories);
			const inFocusRemaining = remaining.filter((w) => focusSet.has(w.category));
			const outOfFocusRemaining = remaining.filter((w) => !focusSet.has(w.category));
			const focusPicks = sample(inFocusRemaining, needed, seededRng(`${seed}|words|focus`));
			const stillNeeded = needed - focusPicks.length;
			const restPicks =
				stillNeeded > 0
					? sample(outOfFocusRemaining, stillNeeded, seededRng(`${seed}|words|rest`))
					: [];
			extras = [...focusPicks, ...restPicks];
		}
		for (const w of extras) {
			if (wordList.length >= WORD_SLOTS) break;
			if (chosenWordIds.has(w.id)) continue;
			chosenWordIds.add(w.id);
			wordList.push(w);
		}
	}

	// First 2 → match, 3rd → recall.
	if (wordList[0]) ids.push(`match:${wordList[0].id}`);
	if (wordList[1]) ids.push(`match:${wordList[1].id}`);
	if (wordList[2]) ids.push(`recall:${wordList[2].id}`);

	// Conversation — never invent a pool here. Empty stays empty.
	if (data.conversationPool.length > 0) {
		const picked = sample(data.conversationPool, 1, seededRng(`${seed}|conv`));
		if (picked[0]) ids.push(`conv:${picked[0].question.id}`);
	}

	// Lezen — caller must pass an empty pool when examInHomework is false.
	if (data.lezenPool.length > 0) {
		const picked = sample(data.lezenPool, 1, seededRng(`${seed}|lezen`));
		if (picked[0]) ids.push(`lezen:${picked[0].question.id}`);
	}

	// Top up to 5 with extra match/recall when conv/lezen are absent
	// (Gate 1/2 homework: no Olly, no NT2).
	const TARGET = 5;
	let extraSlot = 0;
	while (ids.length < TARGET && wordList.length < data.candidateWords.length + data.rustyWords.length) {
		const remaining = candidatesOrdered.filter((w) => !chosenWordIds.has(w.id));
		if (remaining.length === 0) break;
		const [picked] = sample(remaining, 1, seededRng(`${seed}|topup|${extraSlot}`));
		if (!picked) break;
		chosenWordIds.add(picked.id);
		wordList.push(picked);
		ids.push(extraSlot % 2 === 0 ? `match:${picked.id}` : `recall:${picked.id}`);
		extraSlot += 1;
	}

	return ids;
}

/** Rebuild the questions from persisted ids. Deterministic. Skips an id it cannot resolve. */
export function buildQuestions(
	ids: string[],
	data: QuizSourceData,
	seed: string
): QuizBuiltQuestion[] {
	const out: QuizBuiltQuestion[] = [];

	for (const id of ids) {
		if (id.startsWith('match:')) {
			const wordId = id.slice('match:'.length);
			const word = findWord(data, wordId);
			if (!word) continue;
			// Per-question sub-seed so option order survives pool drift.
			out.push({ id, question: buildMatchQuestion(word, data, `${seed}|${id}`) });
		} else if (id.startsWith('recall:')) {
			const wordId = id.slice('recall:'.length);
			const word = findWord(data, wordId);
			if (!word) continue;
			out.push({ id, question: buildRecallQuestion(word) });
		} else if (id.startsWith('conv:')) {
			const qid = id.slice('conv:'.length);
			const source = data.conversationPool.find((s) => s.question.id === qid);
			if (!source) continue;
			out.push({ id, question: buildConversationQuestion(source) });
		} else if (id.startsWith('lezen:')) {
			const qid = id.slice('lezen:'.length);
			const source = data.lezenPool.find((s) => s.question.id === qid);
			if (!source) continue;
			out.push({ id, question: buildLezenQuestion(source) });
		}
		// Unknown namespace: skip silently.
	}

	return out;
}
