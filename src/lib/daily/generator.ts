// ============================================================
// WEEKLY HOMEWORK GENERATOR
//
// Pure function. Takes the user's current rank, returns a
// shuffled DailyQuestion[] mixing every module in the app.
//
// Quotas (weekly, one 30-45 min sitting):
//   match           ~10
//   recall (cards)   ~6
//   conversation     ~6
//   lezen            ~7
//   luisteren        ~7
// Target total: ~36
//
// Vocab/story draws stay in the open gate. Lezen and luisteren
// are NT2 B1 paper — only when examInHomework(gate) is true (Gate 4).
//
// The generator is pure: no I/O, no random side-effects on
// global state. It uses Math.random() internally for shuffling
// and selection. Callers should treat the output as the source
// of truth for the week's session.
// ============================================================

import { type WordEntry } from '$lib/data/wordPool';
import { buildQuestion, pickDistractors } from '$lib/match/engine';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import { LUISTEREN_EXAMS } from '$lib/luisteren/LUISTEREN_CONTENT';
import { R2_BASE } from '$lib/luisteren/types';
import {
	examInHomework,
	getStoriesUpToGate,
	getWordsUpToGate,
	type GateId
} from '$lib/gates/gates';

import type {
	DailyQuestion,
	DailyMatchQuestion,
	DailyRecallQuestion,
	DailyConversationQuestion,
	DailyLezenQuestion,
	DailyLuisterenQuestion
} from './types';

// ============================================================
// HELPERS
// ============================================================

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Pick up to `count` random items from `arr` without replacement. */
function pickRandom<T>(arr: T[], count: number): T[] {
	if (arr.length <= count) return shuffle(arr);
	return shuffle(arr).slice(0, count);
}

/** Take the first 2 paragraphs of a passage as a context excerpt. */
function excerptOf(text: string): string {
	const paragraphs = text
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
	if (paragraphs.length === 0) return '';
	// First paragraph is usually a title/heading; include 1 more.
	return paragraphs.slice(0, Math.min(2, paragraphs.length)).join('\n\n');
}

// ============================================================
// PER-TYPE GENERATORS
// ============================================================

function generateMatchQuestions(
	rank: number,
	count: number,
	gate: GateId,
	excludeIds: Set<string> = new Set()
): DailyMatchQuestion[] {
	const pool = getWordsUpToGate(gate);
	const out: DailyMatchQuestion[] = [];
	const used = new Set<string>(excludeIds);

	let safety = count * 10;
	while (out.length < count && safety-- > 0) {
		const q = buildQuestion(pool, rank, used, { fromEntirePool: gate === 1 });
		if (!q) break;
		used.add(q.target.id);

		const correctIndex = q.options.findIndex((o) => o.isCorrect);
		out.push({
			type: 'match',
			wordId: q.target.id,
			sentenceNl: q.sentenceNl,
			targetDutch: q.target.dutch,
			options: q.options.map((o) => o.text),
			correctIndex: Math.max(0, correctIndex)
		});
	}

	return out;
}

function generateRecallQuestions(
	count: number,
	gate: GateId,
	excludeIds: Set<string> = new Set()
): DailyRecallQuestion[] {
	const pool = getWordsUpToGate(gate);
	const out: DailyRecallQuestion[] = [];
	const used = new Set<string>(excludeIds);

	const candidates = shuffle(pool);
	for (const target of candidates) {
		if (out.length >= count) break;
		if (used.has(target.id)) continue;
		used.add(target.id);

		// Use the existing match distractor picker for plausible alternatives
		const distractors = pickDistractors(pool, target);
		const optionEntries: { text: string; isTarget: boolean }[] = [
			{ text: target.english, isTarget: true },
			...distractors.map((d: WordEntry) => ({ text: d.english, isTarget: false }))
		];
		const shuffled = shuffle(optionEntries);
		const correctIndex = shuffled.findIndex((o) => o.isTarget);

		out.push({
			type: 'recall',
			wordId: target.id,
			dutchWord: target.dutch,
			pos: target.pos,
			options: shuffled.map((o) => o.text),
			correctIndex: Math.max(0, correctIndex)
		});
	}

	return out;
}

function generateConversationQuestions(count: number, gate: GateId): DailyConversationQuestion[] {
	const stories = getStoriesUpToGate(gate);
	const all: {
		storyTitle: string;
		chapterId: string;
		excerpt: string;
		q: { id: string; text: string; options: string[]; correctIndex: number };
	}[] = [];

	for (const story of stories) {
		for (const chapter of story.chapters) {
			const ex = excerptOf(chapter.text);
			for (const q of chapter.questions) {
				all.push({
					storyTitle: story.title,
					chapterId: chapter.id,
					excerpt: ex,
					q
				});
			}
		}
	}

	return pickRandom(all, count).map((item) => ({
		type: 'conversation',
		questionId: item.q.id,
		chapterId: item.chapterId,
		excerpt: item.excerpt,
		text: item.q.text,
		options: item.q.options,
		correctIndex: item.q.correctIndex
	}));
}

function generateLezenQuestions(count: number): DailyLezenQuestion[] {
	const all: {
		passage: { name: string; text: string };
		q: {
			id: string;
			question: string;
			options: Record<string, string>;
			answer: 'A' | 'B' | 'C' | 'D';
		};
	}[] = [];

	for (const exam of LEZEN_EXAMS) {
		for (const passage of exam.passages) {
			for (const q of passage.questions) {
				all.push({ passage: { name: passage.name, text: passage.text }, q });
			}
		}
	}

	return pickRandom(all, count).map((item) => ({
		type: 'lezen',
		questionId: item.q.id,
		excerpt: excerptOf(item.passage.text),
		fullPassage: item.passage.text,
		passageName: item.passage.name,
		question: item.q.question,
		options: item.q.options,
		answer: item.q.answer
	}));
}

function generateLuisterenQuestions(count: number): DailyLuisterenQuestion[] {
	const all: {
		year: number;
		q: {
			id: string;
			opgave: number;
			question: string;
			options: { A: string; B: string; C: string };
			answer: 'A' | 'B' | 'C';
			filename: string;
			mediaType: 'audio' | 'video';
		};
	}[] = [];

	for (const exam of LUISTEREN_EXAMS) {
		for (const passage of exam.passages) {
			for (const q of passage.questions) {
				all.push({ year: exam.year, q });
			}
		}
	}

	return pickRandom(all, count).map((item) => ({
		type: 'luisteren',
		questionId: item.q.id,
		mediaUrl: `${R2_BASE}/${item.year}/${item.q.filename}`,
		mediaType: item.q.mediaType,
		question: item.q.question,
		options: item.q.options,
		answer: item.q.answer,
		opgave: item.q.opgave
	}));
}

// ============================================================
// PUBLIC API
// ============================================================

export interface DailyGeneratorConfig {
	match: number;
	recall: number;
	conversation: number;
	lezen: number;
	luisteren: number;
}

// Weekly quotas. Grammar's former 7 slots redistributed toward the
// NT2 exam targets Dutchina still owns (reading + listening) plus a
// little vocab/comprehension. ~36 questions ≈ one 30-45 min sitting.
export const DEFAULT_CONFIG: DailyGeneratorConfig = {
	match: 10,
	recall: 6,
	conversation: 6,
	lezen: 7,
	luisteren: 7
};

/** G1/G2/G3: zero exam. G1 also omits Olly conversation. G4 keeps DEFAULT. */
export function configForGate(
	gate: GateId,
	base: DailyGeneratorConfig = DEFAULT_CONFIG
): DailyGeneratorConfig {
	if (examInHomework(gate)) return { ...base };
	const examSlots = base.lezen + base.luisteren;
	if (gate === 1) {
		const extra = examSlots + base.conversation;
		return {
			match: base.match + Math.ceil(extra / 2),
			recall: base.recall + Math.floor(extra / 2),
			conversation: 0,
			lezen: 0,
			luisteren: 0
		};
	}
	return {
		match: base.match + Math.ceil(examSlots / 2),
		recall: base.recall + Math.floor(examSlots / 2),
		conversation: base.conversation,
		lezen: 0,
		luisteren: 0
	};
}

/**
 * Generate a weekly homework session.
 *
 * `rank` is the internal meter (75/25 inside a mixed pool).
 * `gate` is the open room. Omitted gate fail-safes to 1 (no NT2).
 */
export function generateDailySession(
	rank: number,
	config: DailyGeneratorConfig = DEFAULT_CONFIG,
	gate: GateId = 1
): DailyQuestion[] {
	const mix = configForGate(gate, config);
	const matchQs = generateMatchQuestions(rank, mix.match, gate);
	const recallQs = generateRecallQuestions(mix.recall, gate);
	const conversationQs =
		mix.conversation > 0 ? generateConversationQuestions(mix.conversation, gate) : [];
	const lezenQs = mix.lezen > 0 ? generateLezenQuestions(mix.lezen) : [];
	const luisterenQs = mix.luisteren > 0 ? generateLuisterenQuestions(mix.luisteren) : [];

	// Shuffle the combined set so the user never sees all of one
	// type in a row. Math.random shuffle is good enough — the user
	// doesn't get the same set twice anyway (regenerated each week).
	return shuffle<DailyQuestion>([
		...matchQs,
		...recallQs,
		...conversationQs,
		...lezenQs,
		...luisterenQs
	]);
}

/**
 * One replacement for a skipped week-set item. Same type when the engine
 * gate still owns that type; leftover exam/Olly items become match/recall.
 */
export function generateReplacementQuestion(
	type: DailyQuestion['type'],
	rank: number,
	gate: GateId,
	exclude: Set<string>
): DailyQuestion | null {
	const leftoverExam = (type === 'lezen' || type === 'luisteren') && !examInHomework(gate);
	const leftoverConv = type === 'conversation' && gate === 1;
	const resolved: DailyQuestion['type'] =
		leftoverExam || leftoverConv ? (exclude.size % 2 === 0 ? 'match' : 'recall') : type;

	if (resolved === 'match') {
		const wordExclude = new Set<string>();
		for (const id of exclude) {
			if (id.startsWith('match:')) wordExclude.add(id.slice('match:'.length));
			else if (id.startsWith('recall:')) wordExclude.add(id.slice('recall:'.length));
			else if (!id.includes(':')) wordExclude.add(id);
		}
		return generateMatchQuestions(rank, 1, gate, wordExclude)[0] ?? null;
	}
	if (resolved === 'recall') {
		const wordExclude = new Set<string>();
		for (const id of exclude) {
			if (id.startsWith('match:')) wordExclude.add(id.slice('match:'.length));
			else if (id.startsWith('recall:')) wordExclude.add(id.slice('recall:'.length));
			else if (!id.includes(':')) wordExclude.add(id);
		}
		return generateRecallQuestions(1, gate, wordExclude)[0] ?? null;
	}
	if (resolved === 'conversation') {
		const used = new Set(
			[...exclude].map((id) => (id.startsWith('conv:') ? id.slice('conv:'.length) : id))
		);
		const pool = generateConversationQuestions(24, gate).filter(
			(q) => !used.has(q.questionId)
		);
		return pool[0] ?? null;
	}
	if (resolved === 'lezen') {
		const used = new Set(
			[...exclude].map((id) => (id.startsWith('lezen:') ? id.slice('lezen:'.length) : id))
		);
		const pool = generateLezenQuestions(24).filter((q) => !used.has(q.questionId));
		return pool[0] ?? null;
	}
	const used = new Set(
		[...exclude].map((id) =>
			id.startsWith('luisteren:') ? id.slice('luisteren:'.length) : id
		)
	);
	const pool = generateLuisterenQuestions(24).filter((q) => !used.has(q.questionId));
	return pool[0] ?? null;
}

export function homeworkQuestionId(q: DailyQuestion): string {
	switch (q.type) {
		case 'match':
			return `match:${q.wordId}`;
		case 'recall':
			return `recall:${q.wordId}`;
		case 'conversation':
			return `conv:${q.questionId}`;
		case 'lezen':
			return `lezen:${q.questionId}`;
		case 'luisteren':
			return `luisteren:${q.questionId}`;
	}
}

