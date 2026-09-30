import rawAnnotations from './annotations.json';
import setAnnotations from './sets/annotations.json';
import type { Evidence, ItemAnnotation, QType, TrapKind } from './types';

export const ANNOTATIONS: ItemAnnotation[] = rawAnnotations as unknown as ItemAnnotation[];
export const SET_ANNOTATIONS: ItemAnnotation[] = setAnnotations as unknown as ItemAnnotation[];

const byId = new Map<string, ItemAnnotation>();
for (const annotation of ANNOTATIONS) byId.set(annotation.id, annotation);
for (const annotation of SET_ANNOTATIONS) {
	if (!byId.has(annotation.id)) byId.set(annotation.id, annotation);
}

export const QTYPE_LABEL: Record<QType, string> = {
	'doel-tekst': 'Purpose of the text',
	'doel-onderdeel': 'Purpose of a part',
	'bron-publiek': 'Source and audience',
	hoofdgedachte: 'Main point',
	'mening-persoon': 'Who thinks what',
	detail: 'Find the fact',
	'oorzaak-reden': 'Why',
	toepassing: 'Apply the rule',
	'niet-vraag': 'NOT question',
	'functie-tekstdeel': 'Why this example',
	'betekenis-in-context': 'Word in context',
	conclusie: 'What follows',
	vergelijking: 'Compare'
};

export const QTYPE_MOVE: Record<QType, string> = {
	'doel-tekst': 'Source line, headline and last paragraph decide it. Answer it last.',
	'doel-onderdeel': 'Find where the text says what that thing is for.',
	'bron-publiek': 'Source line, form (je or u, rules, headings), who is addressed.',
	hoofdgedachte: 'The whole text, not one quotable line.',
	'mening-persoon': "Find the name, read only that person's words.",
	detail: 'Keyword from the question, scan, read the sentence before and after.',
	'oorzaak-reden': 'Look for omdat, want, doordat, daardoor, waardoor, zodat, daarom.',
	toepassing:
		'Mark the case facts (age, time, amount, condition); find the rule that matches all of them.',
	'niet-vraag': 'Check each option in the text; the one you cannot find is the answer.',
	'functie-tekstdeel': 'The sentence around the example states the general point.',
	'betekenis-in-context':
		'The explanation follows the word: a colon, "dat wil zeggen", an example.',
	conclusie: 'What the result shows as a whole, not a detail of it.',
	vergelijking: 'Find both sides; wrong options swap them.'
};

export const TRAP_LABEL: Record<TrapKind, string> = {
	echo: 'Echo',
	'waar-niet-gevraagd': 'True, not the question',
	'te-breed': 'Too broad',
	'te-smal': 'Too narrow',
	tegenovergesteld: 'Flipped',
	'niet-in-tekst': 'Not in the text',
	'verkeerde-persoon': 'Wrong person',
	'verkeerde-voorwaarde': 'Wrong condition',
	overdreven: 'Overstated'
};

export const TRAP_EXPLANATION: Record<TrapKind, string> = {
	echo: 'Uses words from the text, but the text says something else about them.',
	'waar-niet-gevraagd': 'The text says it, but it does not answer what was asked.',
	'te-breed': 'Claims more, or more generally, than the text supports.',
	'te-smal': 'One detail or paragraph, not the whole point.',
	tegenovergesteld: 'Says the opposite of the text.',
	'niet-in-tekst': 'Sounds reasonable; the text never says it.',
	'verkeerde-persoon': 'Someone else in the text said or thinks this.',
	'verkeerde-voorwaarde': 'The rule for a different case, time, age or amount.',
	overdreven: 'An absolute version (always, never, all, only) of a softer claim.'
};

export function paragraphsOf(text: string): string[] {
	return text
		.split(/\n\n+/)
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);
}

export function getAnnotation(id: string): ItemAnnotation | undefined {
	return byId.get(id);
}

export function trapForPick(
	id: string,
	picked: string
): { trap: TrapKind; why: string } | undefined {
	return getAnnotation(id)?.distractors[picked];
}

/** Paragraph index that contains each quote. The stored p is only a hint. */
export function resolveEvidence(text: string, evidence: Evidence[]): number[] {
	const paragraphs = paragraphsOf(text);
	return evidence.map((item) => {
		const hits = paragraphs.flatMap((paragraph, index) =>
			paragraph.includes(item.quote) ? [index] : []
		);
		if (hits.length !== 1) {
			throw new Error(`quote is in ${hits.length} paragraphs: ${item.quote.slice(0, 80)}`);
		}
		return hits[0];
	});
}
