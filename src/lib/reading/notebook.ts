import { paragraphsOf } from './annotations';
import { passageDocs, wordFormsIn, type PassageDoc } from './bankCorpus';
import { lexiconRecords, lookupForm, recordsForLemma, type LexRecord } from './lexicon';
import { signalFunction } from './playbook';
import { HORIZON_SLUG, horizonLocked } from './sets';
import {
	EMPTY_NOTEBOOK,
	NOTE_TAGS,
	type NotebookEntry,
	type NotebookState,
	type ReadingForkState,
	type SentenceNoteType,
	type TrapKind
} from './types';

export const EXAM_LOOKUP_LINE =
	'On the exam every lookup costs about a minute. Try guessing first.';

export interface WordMark {
	form: string;
	note: string;
	tone: 'soft' | 'faint';
}

export interface PaintedWord {
	text: string;
	note: string | null;
	tone: 'soft' | 'faint' | null;
}

export interface LemmaCounts {
	forms: { form: string; count: number }[];
	inText: number;
	across: number;
	texts: number;
	genres: string;
}

export interface Elsewhere {
	slug: string;
	name: string;
	sentence: string;
	p: number;
}

export interface SenseChoice {
	nl: string;
	right: boolean;
}

export interface SenseCheck {
	entryId: string;
	sentence: string;
	slug: string;
	name: string;
	prompt: string;
	choices: SenseChoice[];
}

interface Hit {
	slug: string;
	sentence: string;
	p: number;
	form: string;
}

const docs = passageDocs();
const docBySlug = new Map<string, PassageDoc>(docs.map((doc) => [doc.slug, doc]));

let hitsByForm: Map<string, Hit[]> | null = null;

function formHits(): Map<string, Hit[]> {
	if (hitsByForm) return hitsByForm;
	const map = new Map<string, Hit[]>();
	for (const doc of docs) {
		const paragraphs = paragraphsOf(doc.text);
		paragraphs.forEach((paragraph, p) => {
			const sentences = paragraph
				.split(/(?<=[.!?])\s+/)
				.map((sentence) => sentence.replace(/\s+/g, ' ').trim())
				.filter(Boolean);
			for (const sentence of sentences) {
				for (const form of new Set(wordFormsIn(sentence))) {
					const list = map.get(form) ?? [];
					list.push({ slug: doc.slug, sentence, p, form });
					map.set(form, list);
				}
			}
		});
	}
	hitsByForm = map;
	return map;
}

export function notebookOf(fork: ReadingForkState | null | undefined): NotebookState {
	const notebook = fork?.notebook;
	if (!notebook || !Array.isArray(notebook.entries)) return { ...EMPTY_NOTEBOOK, lookups: {} };
	return {
		entries: notebook.entries,
		lookups: notebook.lookups ?? {}
	};
}

export function withNotebook(fork: ReadingForkState, notebook: NotebookState): ReadingForkState {
	return { ...fork, notebook };
}

export function lookupsLeft(notebook: NotebookState, slug: string, budget: number): number {
	const used = notebook.lookups[slug] ?? 0;
	return Math.max(0, budget - used);
}

export function lookupLabel(left: number): string {
	if (left <= 0) return EXAM_LOOKUP_LINE;
	return left === 1 ? '1 lookup left' : `${left} lookups left`;
}

export function spendLookup(notebook: NotebookState, slug: string, budget: number): NotebookState {
	const used = notebook.lookups[slug] ?? 0;
	if (used >= budget) return notebook;
	return { ...notebook, lookups: { ...notebook.lookups, [slug]: used + 1 } };
}

function newId(): string {
	return `nb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function blankEntry(partial: Omit<NotebookEntry, 'id' | 'createdAt' | 'metSince' | 'lastMetAt'> & {
	id?: string;
	createdAt?: string;
}): NotebookEntry {
	return {
		metSince: 0,
		lastMetAt: null,
		metPassages: [],
		...partial,
		id: partial.id ?? newId(),
		createdAt: partial.createdAt ?? new Date().toISOString()
	};
}

export function addWordEntry(
	notebook: NotebookState,
	input: {
		surface: string;
		quote: string;
		passageSlug: string;
		p: number;
		note?: string;
		guessed?: NotebookEntry['guessed'];
		guessText?: string;
		englishRevealed?: boolean;
		now?: string;
	}
): NotebookState {
	const surface = input.surface.trim();
	const record = lookupForm(surface);
	const entry = blankEntry({
		kind: 'word',
		passageSlug: input.passageSlug,
		p: input.p,
		quote: input.quote.trim() || surface,
		surface,
		lemma: record?.lemma ?? surface.toLowerCase(),
		englishRevealed: input.englishRevealed ?? false,
		guessed: input.guessed ?? null,
		guessText: input.guessText,
		note: input.note ?? '',
		tags: [],
		starred: false,
		createdAt: input.now
	});
	return { ...notebook, entries: [...notebook.entries, entry] };
}

export function addSentenceEntry(
	notebook: NotebookState,
	input: {
		quote: string;
		passageSlug: string;
		p: number;
		sentenceType: SentenceNoteType;
		note?: string;
		now?: string;
	}
): NotebookState {
	const entry = blankEntry({
		kind: 'sentence',
		passageSlug: input.passageSlug,
		p: input.p,
		quote: input.quote.trim(),
		sentenceType: input.sentenceType,
		englishRevealed: false,
		guessed: null,
		note: input.note ?? '',
		tags: [],
		starred: false,
		createdAt: input.now
	});
	return { ...notebook, entries: [...notebook.entries, entry] };
}

export function addTrapEntry(
	notebook: NotebookState,
	input: {
		question: string;
		passageSlug: string;
		p: number;
		evidence: string;
		trap: TrapKind;
		itemId: string;
		picked: string;
		why: string;
		now?: string;
	}
): NotebookState {
	if (notebook.entries.some((entry) => entry.kind === 'trap' && entry.itemId === input.itemId && entry.picked === input.picked)) {
		return notebook;
	}
	const entry = blankEntry({
		kind: 'trap',
		passageSlug: input.passageSlug,
		p: input.p,
		quote: input.evidence || input.question,
		trap: input.trap,
		itemId: input.itemId,
		picked: input.picked,
		englishRevealed: false,
		guessed: null,
		note: `${input.question} You picked ${input.picked}. ${input.why}`.trim(),
		tags: [],
		starred: false,
		createdAt: input.now
	});
	return { ...notebook, entries: [...notebook.entries, entry] };
}

export function addCoachEntry(
	notebook: NotebookState,
	input: { kind: 'word' | 'sentence'; quote: string; note: string; now?: string }
): NotebookState | null {
	const quote = input.quote.trim();
	const note = input.note.trim();
	if ((input.kind !== 'word' && input.kind !== 'sentence') || !quote || !note) return null;
	const located = locateQuote(quote);
	if (input.kind === 'word') {
		return addWordEntry(notebook, {
			surface: quote,
			quote,
			passageSlug: located?.slug ?? '',
			p: located?.p ?? 0,
			note,
			now: input.now
		});
	}
	return addSentenceEntry(notebook, {
		quote,
		passageSlug: located?.slug ?? '',
		p: located?.p ?? 0,
		sentenceType: 'hard',
		note,
		now: input.now
	});
}

function locateQuote(quote: string): { slug: string; p: number } | null {
	const needle = quote.trim();
	if (!needle) return null;
	for (const doc of docs) {
		if (doc.year === 2023) continue;
		const paragraphs = paragraphsOf(doc.text);
		const p = paragraphs.findIndex((paragraph) => paragraph.includes(needle));
		if (p >= 0) return { slug: doc.slug, p };
	}
	return null;
}

export function patchEntry(
	notebook: NotebookState,
	id: string,
	patch: Partial<Pick<NotebookEntry, 'note' | 'tags' | 'starred' | 'englishRevealed'>>
): NotebookState {
	return {
		...notebook,
		entries: notebook.entries.map((entry) => {
			if (entry.id !== id) return entry;
			const next = { ...entry, ...patch };
			if (patch.tags) {
				next.tags = patch.tags.filter((tag) => (NOTE_TAGS as readonly string[]).includes(tag));
			}
			return next;
		})
	};
}

export function chatNotebook(entries: NotebookEntry[], slug: string) {
	return entries
		.filter((entry) => entry.passageSlug === slug)
		.map((entry) => ({
			kind: entry.kind,
			quote: entry.quote,
			note: entry.note,
			lemma: entry.lemma,
			surface: entry.surface
		}));
}

export function entriesForSlug(notebook: NotebookState, slug: string): NotebookEntry[] {
	return notebook.entries.filter((entry) => entry.passageSlug === slug);
}

function lemmaForms(lemma: string): string[] {
	const rows = recordsForLemma(lemma);
	const forms = new Set<string>(rows.map((row) => row.form));
	forms.add(lemma);
	return [...forms];
}

export function lemmaRecord(surface: string): LexRecord | null {
	const direct = lookupForm(surface);
	if (!direct) return null;
	if (direct.lemma === direct.form) return direct;
	return lookupForm(direct.lemma) ?? direct;
}

export function countsFor(lemma: string, slug: string): LemmaCounts {
	const forms = lemmaForms(lemma);
	const hits = formHits();
	const tallies = new Map<string, number>();
	const slugs = new Set<string>();
	const genres = new Map<string, number>();
	let inText = 0;
	let across = 0;
	for (const form of forms) {
		for (const hit of hits.get(form) ?? []) {
			tallies.set(form, (tallies.get(form) ?? 0) + 1);
			across += 1;
			slugs.add(hit.slug);
			if (hit.slug === slug) inText += 1;
			const genre = docBySlug.get(hit.slug)?.genre ?? 'general';
			genres.set(genre, (genres.get(genre) ?? 0) + 1);
		}
	}
	let best = 'general';
	let bestN = 0;
	for (const [genre, n] of genres) {
		if (n > bestN) {
			best = genre;
			bestN = n;
		}
	}
	const labeled =
		best === 'general' || bestN === 0 ? 'mixed texts' : `mostly ${best} texts`;
	return {
		forms: forms
			.filter((form) => (tallies.get(form) ?? 0) > 0)
			.map((form) => ({ form, count: tallies.get(form) ?? 0 }))
			.sort((a, b) => b.count - a.count || a.form.localeCompare(b.form, 'nl')),
		inText,
		across,
		texts: slugs.size,
		genres: labeled
	};
}

export function whereElse(
	lemma: string,
	opened: ReadonlySet<string>,
	exceptSlug: string
): Elsewhere[] {
	const forms = new Set(lemmaForms(lemma));
	const hits = formHits();
	const seen = new Set<string>();
	const out: Elsewhere[] = [];
	for (const form of forms) {
		for (const hit of hits.get(form) ?? []) {
			if (hit.slug === exceptSlug) continue;
			if (!opened.has(hit.slug)) continue;
			if (seen.has(hit.slug)) continue;
			const doc = docBySlug.get(hit.slug);
			if (!doc) continue;
			seen.add(hit.slug);
			out.push({ slug: hit.slug, name: doc.name, sentence: hit.sentence, p: hit.p });
			if (out.length >= 4) return out;
		}
	}
	return out;
}

export function openedSlugs(fork: ReadingForkState): Set<string> {
	const reserved = new Set(fork.settings?.reservedPapers ?? [2023]);
	const takenSets = new Set(
		(fork.mocks ?? []).map((mock) => mock.setId).filter((id): id is string => Boolean(id))
	);
	const horizonOk = !horizonLocked(fork.mocks ?? []);
	const open = new Set<string>();
	const consider = (slug: string | null | undefined) => {
		if (!slug) return;
		const doc = docBySlug.get(slug);
		if (!doc) return;
		if (doc.year && reserved.has(doc.year)) return;
		if (doc.setId && !takenSets.has(doc.setId)) return;
		if (doc.slug === HORIZON_SLUG && !horizonOk) return;
		open.add(slug);
	};
	for (const attempt of fork.attempts ?? []) consider(attempt.passageSlug);
	consider(fork.eval?.passageSlug);
	return open;
}

export function signalLine(surface: string): string | null {
	const record = lookupForm(surface);
	const word = record?.lemma ?? surface.toLowerCase();
	if (record?.signal || signalFunction(word) || signalFunction(surface)) {
		return signalFunction(word) ?? signalFunction(surface);
	}
	return null;
}

export function caseFacts(sentence: string): string[] {
	const facts: string[] = [];
	for (const match of sentence.matchAll(
		/\d+(?:[.:]\d+)?(?:\s*(?:jaar|uur|euro|weken|dagen|minuten|procent|%))?/gi
	)) {
		facts.push(match[0]);
	}
	for (const word of ['als', 'tenzij', 'mits', 'wanneer', 'behalve', 'alleen als', 'niet', 'nooit']) {
		const pattern = new RegExp(`(?:^|[^\\p{L}])${word}(?:$|[^\\p{L}])`, 'iu');
		if (pattern.test(sentence)) facts.push(word);
	}
	return [...new Set(facts)];
}

function lemmaInText(lemma: string, text: string): boolean {
	const forms = lemmaForms(lemma);
	const present = new Set(wordFormsIn(text));
	return forms.some((form) => present.has(form));
}

export function noteEncounter(
	notebook: NotebookState,
	slug: string,
	text: string,
	now: string
): NotebookState {
	let changed = false;
	const entries = notebook.entries.map((entry) => {
		if (entry.kind !== 'word' || !entry.lemma) return entry;
		if (entry.passageSlug === slug) return entry;
		const seen = entry.metPassages ?? [];
		if (seen.includes(slug)) return entry;
		if (!lemmaInText(entry.lemma, text)) return entry;
		changed = true;
		return {
			...entry,
			metSince: entry.metSince + 1,
			lastMetAt: now,
			metPassages: [...seen, slug]
		};
	});
	return changed ? { ...notebook, entries } : notebook;
}

export function wordMarks(notebook: NotebookState, slug: string, showMine: boolean): WordMark[] {
	const marks: WordMark[] = [];
	for (const entry of notebook.entries) {
		if (entry.kind !== 'word' || !entry.lemma) continue;
		const tone: 'soft' | 'faint' | null =
			entry.passageSlug === slug ? 'soft' : showMine ? 'faint' : null;
		if (!tone) continue;
		const note = entry.note.trim();
		for (const form of lemmaForms(entry.lemma)) {
			marks.push({ form, note, tone });
		}
	}
	return marks;
}

const WORD_SPLIT =
	/([\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)?(?:-[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)?)*)/gu;

export function paintWords(text: string, marks: WordMark[]): PaintedWord[] {
	const byForm = new Map<string, WordMark>();
	for (const mark of marks) {
		const prev = byForm.get(mark.form);
		if (!prev || (prev.tone === 'faint' && mark.tone === 'soft')) byForm.set(mark.form, mark);
	}
	const parts = text.split(WORD_SPLIT);
	return parts.filter((part) => part.length > 0).map((part) => {
		const mark = byForm.get(part.toLowerCase().replaceAll('’', "'"));
		if (!mark) return { text: part, note: null, tone: null };
		return { text: part, note: mark.note, tone: mark.tone };
	});
}

export function sortByLastMet(entries: NotebookEntry[]): NotebookEntry[] {
	return [...entries].sort((a, b) => {
		const aAt = a.lastMetAt ?? a.createdAt;
		const bAt = b.lastMetAt ?? b.createdAt;
		return bAt.localeCompare(aAt);
	});
}

export function bankFrequency(entry: NotebookEntry): number {
	if (!entry.lemma) return 0;
	return countsFor(entry.lemma, entry.passageSlug).across;
}

export function sortByFrequency(entries: NotebookEntry[]): NotebookEntry[] {
	return [...entries].sort((a, b) => bankFrequency(b) - bankFrequency(a));
}

function hash(value: string): number {
	let h = 0;
	for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619) >>> 0;
	return h;
}

export function senseChecks(notebook: NotebookState, opened: ReadonlySet<string>): SenseCheck[] {
	const checks: SenseCheck[] = [];
	const used = new Set<string>();
	for (const entry of sortByLastMet(notebook.entries)) {
		if (checks.length >= 5) break;
		if (entry.kind !== 'word' || !entry.lemma) continue;
		const record = lemmaRecord(entry.surface ?? entry.lemma);
		if (!record?.nl || record.pos === 'name' || record.pos === 'num') continue;
		const elseHits = whereElse(entry.lemma, opened, entry.passageSlug);
		const hit = elseHits.find((row) => opened.has(row.slug));
		if (!hit) continue;
		const pool = recordsForLemma(record.lemma).length
			? otherDefinitions(record.pos, record.nl, record.lemma)
			: [];
		const distractors = pool.slice(0, 2);
		if (distractors.length < 2) continue;
		const choices = [record.nl, ...distractors].map((nl, index) => ({
			nl,
			right: index === 0
		}));
		const order = hash(entry.id);
		choices.sort((a, b) => hash(a.nl + order) - hash(b.nl + order));
		if (used.has(entry.id)) continue;
		used.add(entry.id);
		checks.push({
			entryId: entry.id,
			sentence: hit.sentence,
			slug: hit.slug,
			name: hit.name,
			prompt: 'What does it mean here?',
			choices
		});
	}
	return checks;
}

function otherDefinitions(pos: LexRecord['pos'], right: string, lemma: string): string[] {
	const seen = new Set<string>([right]);
	const out: string[] = [];
	for (const row of lexiconRecords()) {
		if (row.pos !== pos || row.lemma === lemma || !row.nl || row.nl === right) continue;
		if (seen.has(row.nl)) continue;
		seen.add(row.nl);
		out.push(row.nl);
		if (out.length >= 8) break;
	}
	return out;
}
