import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import type { LezenExam, LezenPassage, LezenQuestion } from '$lib/lezen/types';
import {
	QTYPE_LABEL,
	TRAP_EXPLANATION,
	TRAP_LABEL,
	getAnnotation,
	paragraphsOf
} from './annotations';
import { findPassage } from './bank';
import { PARAGRAPH_ROLES, ROLE_LABEL, type ParagraphRole } from './loop';
import { packSlugs, paragraphMapFor, practiceItemsFor } from './practice';
import { QTYPES, TRAP_KINDS, type QType, type TrapKind } from './types';

/** Two or three sentences. Built from the question-type moves, not a new method. */
export const PLAYBOOK_MOVE: Record<QType, string> = {
	'doel-tekst':
		'Source line, headline and last paragraph decide it. Answer it last. The purpose is what the writer is doing, not a fact from the middle.',
	'doel-onderdeel':
		'Find where the text says what that part is for. A nearby fact is not the purpose. Read the sentence that introduces the part.',
	'bron-publiek':
		'Source line, form, and who is addressed decide it. Watch je or u, rules, and headings. The audience is the person the text speaks to.',
	hoofdgedachte:
		'The main point is the whole text, not one quotable line. A true detail from one paragraph is too small. Check the title and the close.',
	'mening-persoon':
		"Find the name, then read only that person's words. The writer's view is a different person. Do not borrow a neighbour's sentence.",
	detail:
		'Take a keyword from the question and scan for it. Read the sentence before and the sentence after. A matching word in the wrong sentence is a lure.',
	'oorzaak-reden':
		'Look for omdat, want, doordat, daardoor, waardoor, zodat, daarom, and dus. The reason is the clause those words attach to. A result is not the cause.',
	toepassing:
		'Mark the case facts: age, time, amount, and condition. Find the rule that matches all of them. One matching fact is not enough.',
	'niet-vraag':
		'Check each option against the text. The one you cannot find is the answer. A true line that the text does say is the trap.',
	'functie-tekstdeel':
		'An example serves the general point around it. Read the sentence before the example and the sentence after. The example itself is not the answer.',
	'betekenis-in-context':
		'The explanation follows the word. Watch a colon, "dat wil zeggen", or an example. A dictionary sense that the text does not use is wrong.',
	conclusie:
		'The conclusion is what the result shows as a whole. You will not find that sentence to quote. A detail of the result is too small.',
	vergelijking:
		'Find both sides in the text. Wrong options swap them. Check which side each claim belongs to.'
};

export const PURPOSE_DECIDE =
	'Read the source line and the tone. Informeren states facts the reader needs. Enthousiast maken sells an event or a place. Uitleggen walks through how something works. Adviseren tells the reader what to do. Overtuigen argues for a view.';

export const RULES_TEXT =
	'Read the questions first, then scan for the matching rule. Mark the case facts.';

export const TIME_PLAN =
	'About 18 minutes per text. Less on short texts. Keep 10 minutes for flagged items.';

export const ROLE_LOOKS: Record<ParagraphRole, string> = {
	'introduces-topic': 'The opening names the subject and why it matters.',
	'background-origin': 'Earlier events, or how the situation started.',
	'gives-example': 'A concrete case of the point just made.',
	'problem-risk': 'What goes wrong, or who is at risk.',
	'rules-and-conflict': 'Rules people clash over, or a dispute about them.',
	'states-rule': 'A requirement, a ban, or what is allowed.',
	'exception-condition': 'A case the rule does not cover, or a condition that changes it.',
	'reports-opinion': "Someone's view, often with a name and a verb of saying.",
	'reports-research': 'Findings, numbers, or what a study showed.',
	'advice-instruction': 'What the reader should do.',
	conclusion: 'What the text adds up to, often at the end.'
};

const SIGNAL_GROUPS: { name: string; words: string[] }[] = [
	{
		name: 'Reasons',
		words: ['omdat', 'want', 'doordat', 'daardoor', 'waardoor', 'zodat', 'daarom', 'dus']
	},
	{ name: 'Contrast', words: ['maar', 'echter', 'toch', 'hoewel', 'terwijl'] },
	{ name: 'Addition', words: ['bovendien', 'daarnaast', 'ook'] },
	{ name: 'Conditions', words: ['als', 'tenzij', 'mits', 'alleen als', 'behalve'] },
	{ name: 'Limits', words: ['niet', 'geen', 'nooit', 'alleen', 'pas', 'al'] }
];

interface OfficialRow {
	year: number;
	passage: LezenPassage;
	question: LezenQuestion;
	last: boolean;
}

function officialRows(): OfficialRow[] {
	const rows: OfficialRow[] = [];
	for (const exam of LEZEN_EXAMS) {
		for (const passage of exam.passages) {
			passage.questions.forEach((question, index) => {
				rows.push({
					year: exam.year,
					passage,
					question,
					last: index === passage.questions.length - 1
				});
			});
		}
	}
	return rows;
}

export interface QtypePlayCard {
	qtype: QType;
	label: string;
	move: string;
	count: number;
	total: number;
	example: { question: string; quote: string; year: number; passage: string } | null;
}

export function qtypeCards(): QtypePlayCard[] {
	const rows = officialRows();
	const tagged = rows.filter((row) => getAnnotation(row.question.id));
	return QTYPES.map((qtype) => {
		const ofType = tagged.filter((row) => getAnnotation(row.question.id)?.qtype === qtype);
		const sample = ofType.find((row) => getAnnotation(row.question.id)?.evidence[0]?.quote);
		const annotation = sample ? getAnnotation(sample.question.id) : undefined;
		return {
			qtype,
			label: QTYPE_LABEL[qtype],
			move: PLAYBOOK_MOVE[qtype],
			count: ofType.length,
			total: tagged.length,
			example:
				sample && annotation?.evidence[0]
					? {
							question: sample.question.question,
							quote: annotation.evidence[0].quote,
							year: sample.year,
							passage: sample.passage.name
						}
					: null
		};
	}).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export interface TrapExample {
	lure: string;
	why: string;
	year: number;
	passage: string;
}

export interface TrapPlayCard {
	trap: TrapKind;
	label: string;
	explanation: string;
	examples: TrapExample[];
}

export function trapCards(): TrapPlayCard[] {
	const rows = officialRows();
	return TRAP_KINDS.map((trap) => {
		const examples: TrapExample[] = [];
		for (const row of rows) {
			const annotation = getAnnotation(row.question.id);
			if (!annotation) continue;
			for (const [letter, distractor] of Object.entries(annotation.distractors)) {
				if (distractor.trap !== trap) continue;
				const lure = row.question.options[letter];
				if (!lure) continue;
				examples.push({
					lure,
					why: distractor.why,
					year: row.year,
					passage: row.passage.name
				});
				if (examples.length === 2) break;
			}
			if (examples.length === 2) break;
		}
		if (examples.length < 2) {
			for (const slug of packSlugs()) {
				const passage = findPassage(slug);
				for (const item of practiceItemsFor(slug)) {
					for (const [letter, distractor] of Object.entries(item.distractors)) {
						if (distractor.trap !== trap) continue;
						const lure = item.options[letter];
						if (!lure || examples.some((row) => row.lure === lure)) continue;
						examples.push({
							lure,
							why: distractor.why,
							year: passage?.year ?? 0,
							passage: passage?.name ?? slug
						});
						if (examples.length === 2) break;
					}
					if (examples.length === 2) break;
				}
				if (examples.length === 2) break;
			}
		}
		return {
			trap,
			label: TRAP_LABEL[trap],
			explanation: TRAP_EXPLANATION[trap],
			examples
		};
	});
}

export interface PurposeGuide {
	lastCount: number;
	passageCount: number;
	keyed: { year: number; passage: string; purpose: string }[];
	decide: string;
}

export function purposeGuide(): PurposeGuide {
	let lastCount = 0;
	let passageCount = 0;
	const keyed: PurposeGuide['keyed'] = [];
	for (const exam of LEZEN_EXAMS) {
		for (const passage of exam.passages) {
			passageCount += 1;
			const last = passage.questions[passage.questions.length - 1];
			if (last && getAnnotation(last.id)?.qtype === 'doel-tekst') lastCount += 1;
			for (const question of passage.questions) {
				if (getAnnotation(question.id)?.qtype !== 'doel-tekst') continue;
				const purpose = question.options[question.answer];
				if (!purpose) continue;
				keyed.push({ year: exam.year, passage: passage.name, purpose });
			}
		}
	}
	return { lastCount, passageCount, keyed, decide: PURPOSE_DECIDE };
}

export function purposeLine(guide: PurposeGuide): string {
	return `Purpose questions are usually the last question of a text. On these papers that is ${guide.lastCount} of ${guide.passageCount}.`;
}

export interface SignalHit {
	word: string;
	example: string | null;
	source: string | null;
}

export interface SignalGroup {
	name: string;
	words: SignalHit[];
}

function wordPattern(word: string): RegExp {
	const body = word
		.split(/\s+/)
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('\\s+');
	return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'iu');
}

function sentenceAround(text: string, matchIndex: number, matchLength: number): string {
	const start = Math.max(0, text.lastIndexOf('.', matchIndex));
	const from = start === 0 ? 0 : start + 1;
	let end = text.length;
	for (const mark of ['.', '?', '!']) {
		const at = text.indexOf(mark, matchIndex + matchLength);
		if (at !== -1 && at < end) end = at + 1;
	}
	let sentence = text.slice(from, end).replace(/\s+/g, ' ').trim();
	if (sentence.length > 220) {
		const local = Math.max(0, matchIndex - from - 70);
		sentence = sentence.slice(local, local + 180).trim();
	}
	return sentence;
}

function signalExample(word: string): { example: string; source: string } | null {
	const pattern = wordPattern(word);
	const years = [2025, 2024, 2023] as const;
	for (const year of years) {
		const exam = LEZEN_EXAMS.find((row) => row.year === year);
		if (!exam) continue;
		for (const passage of exam.passages) {
			const hit = pattern.exec(passage.text);
			if (!hit || hit.index === undefined) continue;
			return {
				example: sentenceAround(passage.text, hit.index, hit[0].length),
				source: `${exam.year}. ${passage.name}`
			};
		}
	}
	return null;
}

export function signalGroups(): SignalGroup[] {
	return SIGNAL_GROUPS.map((group) => ({
		name: group.name,
		words: group.words.map((word) => {
			const hit = signalExample(word);
			return { word, example: hit?.example ?? null, source: hit?.source ?? null };
		})
	}));
}

export interface RolePlayCard {
	role: ParagraphRole;
	label: string;
	looksLike: string;
	example: string | null;
	source: string | null;
}

export function roleCards(): RolePlayCard[] {
	const found = new Map<ParagraphRole, { example: string; source: string }>();
	for (const slug of packSlugs()) {
		const passage = findPassage(slug);
		if (!passage) continue;
		const paragraphs = paragraphsOf(passage.text);
		for (const entry of paragraphMapFor(slug)) {
			if (found.has(entry.role)) continue;
			const byAnchor = paragraphs.find((paragraph) =>
				paragraph.includes(entry.anchor.slice(0, 24))
			);
			const byIndex = paragraphs[entry.p] ?? paragraphs[entry.p - 1] ?? null;
			const example = byAnchor ?? byIndex;
			if (!example) continue;
			found.set(entry.role, { example, source: `${passage.year}. ${passage.name}` });
		}
	}
	return PARAGRAPH_ROLES.map((role) => {
		const hit = found.get(role) ?? null;
		return {
			role,
			label: ROLE_LABEL[role],
			looksLike: ROLE_LOOKS[role],
			example: hit?.example ?? null,
			source: hit?.source ?? null
		};
	});
}

export function moveSentenceCount(move: string): number {
	return move.split(/[.!?]/).filter((part) => part.trim().length > 0).length;
}

/** Papers the playbook reads. Exposed so tests can see the bank was not edited. */
export function playbookYears(): number[] {
	return (LEZEN_EXAMS as LezenExam[]).map((exam) => exam.year);
}
