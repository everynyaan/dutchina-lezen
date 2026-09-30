import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import pack from './practice/buurt-whatsapp.json';
import { PRACTICE_SETS } from './sets';

const WORD =
	/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)?(?:-[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)?)*/gu;
const NUM = /\d+(?:[.:]\d+)*/g;

export interface PassageDoc {
	slug: string;
	year: number;
	setId: string | null;
	name: string;
	text: string;
	genre: string;
}

export interface FormStat {
	form: string;
	count: number;
	cap: number;
	midCap: number;
	sample: string;
}

export function normalizeForm(raw: string): string {
	return raw.toLowerCase().replaceAll('’', "'");
}

export function genreOf(name: string, text: string): string {
	const blob = `${name} ${text.slice(0, 700)}`.toLowerCase();
	const rows: [string, RegExp][] = [
		['rules', /\b(regel|voorwaarde|mag |moet |alleen als|verboden|toegestaan)\b/],
		['school', /\b(school|opleiding|student|cursus|examen|leerling)\b/],
		['work', /\b(werk|baan|collega|werkgever|kantoor|medewerker)\b/],
		['health', /\b(gezond|ziek|arts|zorg|ziekenhuis|pijn)\b/],
		['money', /\b(euro|kosten|huur|betalen|geld|prijs|abonnement)\b/]
	];
	let best = 'general';
	let score = 0;
	for (const [genre, pattern] of rows) {
		const hits = blob.match(new RegExp(pattern, 'g'));
		const n = hits?.length ?? 0;
		if (n > score) {
			score = n;
			best = genre;
		}
	}
	return best;
}

export function passageDocs(): PassageDoc[] {
	const docs: PassageDoc[] = [];
	for (const exam of LEZEN_EXAMS) {
		for (const passage of exam.passages) {
			docs.push({
				slug: passage.slug,
				year: exam.year,
				setId: null,
				name: passage.name,
				text: passage.text,
				genre: genreOf(passage.name, passage.text)
			});
		}
	}
	for (const set of PRACTICE_SETS) {
		for (const passage of set.passages) {
			docs.push({
				slug: passage.slug,
				year: 0,
				setId: set.id,
				name: passage.name,
				text: passage.text,
				genre: genreOf(passage.name, passage.text)
			});
		}
	}
	return docs;
}

function pushDutch(target: string[], value: unknown) {
	if (typeof value === 'string' && value.trim()) target.push(value);
}

function questionStrings(
	question: string,
	options: Record<string, string>,
	target: string[]
) {
	pushDutch(target, question);
	for (const option of Object.values(options)) pushDutch(target, option);
}

/** Passage texts plus the Dutch the learner reads in items. English notes stay out. */
export function dutchStrings(): string[] {
	const strings: string[] = [];
	for (const doc of passageDocs()) strings.push(doc.text);
	for (const exam of LEZEN_EXAMS) {
		for (const passage of exam.passages) {
			for (const question of passage.questions) {
				questionStrings(question.question, question.options, strings);
			}
		}
	}
	for (const set of PRACTICE_SETS) {
		for (const passage of set.passages) {
			for (const question of passage.questions) {
				questionStrings(question.question, question.options, strings);
			}
		}
	}
	for (const item of pack.items) {
		questionStrings(item.question, item.options, strings);
		for (const row of item.evidence) pushDutch(strings, row.quote);
	}
	for (const row of pack.paraphrase) {
		pushDutch(strings, row.prompt);
		questionStrings('', row.options, strings);
		pushDutch(strings, row.source.quote);
	}
	for (const row of pack.paragraphMap) pushDutch(strings, row.anchor);
	return strings;
}

export function corpusBlob(): string {
	return dutchStrings().join('\n');
}

function sentencesOf(text: string): string[] {
	return text
		.split(/\n+|(?<=[.!?])\s+/)
		.map((sentence) => sentence.replace(/\s+/g, ' ').trim())
		.filter((sentence) => sentence.length > 0);
}

export function formStats(): FormStat[] {
	const stats = new Map<string, FormStat>();
	function add(form: string, cap: boolean, mid: boolean, sentence: string) {
		if (!form) return;
		const row = stats.get(form) ?? { form, count: 0, cap: 0, midCap: 0, sample: '' };
		row.count += 1;
		if (cap) row.cap += 1;
		if (mid) row.midCap += 1;
		if (!row.sample && sentence) row.sample = sentence.slice(0, 220);
		stats.set(form, row);
	}
	for (const text of dutchStrings()) {
		for (const sentence of sentencesOf(text)) {
			const words = [...sentence.matchAll(WORD)];
			words.forEach((match, index) => {
				const raw = match[0];
				add(normalizeForm(raw), /^[\p{Lu}]/u.test(raw), index > 0 && /^[\p{Lu}]/u.test(raw), sentence);
			});
			for (const match of sentence.matchAll(NUM)) {
				add(match[0], false, false, sentence);
			}
		}
	}
	return [...stats.values()].sort((a, b) => a.form.localeCompare(b.form, 'nl'));
}

export function wordFormsIn(text: string): string[] {
	return [...text.matchAll(WORD)].map((match) => normalizeForm(match[0]));
}
