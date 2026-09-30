/**
 * Reflex copy Kuromi may say with the model off.
 * Only strings already written in the Lezen v3 spec. Eyad writes the rest.
 * A missing id returns null. Do not invent a line to fill a gap.
 */

export const WIFI_FALLBACK = 'the wifi is Dutch today';

/** Exact spec quotes. Keys are slots, values are the approved wording. */
export const APPROVED_REFLEX = {
	'wifi-fallback': WIFI_FALLBACK,
	'daily-open-example': 'rules text, six paragraphs, read the questions first',
	'locate-example': 'it is in a paragraph that states a rule, not in the example',
	'before-answer':
		'Before she has answered, never name a paragraph, an option or the answer. If she asks, refuse in character.',
	teaching:
		'Guess before lookup. Text before options. After a miss: what in the sentence would have told her, then name the lure. Before she answers: hints about where and how, never what.',
	'miss-ask': 'what in the sentence would have told her',
	'notebook-guess': 'guess first',
	'notebook-colon': 'look at what comes after the colon',
	'notebook-reason': 'the sentence before gives the reason',
	'note-label': "Kuromi's note this week",
	'question-label': "Kuromi's question",
	'ask-label': 'Ask Kuromi',
	'hint-label': 'Hint'
} as const;

export type ApprovedReflexId = keyof typeof APPROVED_REFLEX;

/**
 * Moments that need her voice and do not have an approved line yet.
 * reflexLine returns null for every id here.
 */
export const REFLEX_GAPS = [
	'daily-open',
	'map-comment',
	'right-reaction',
	'miss-reaction',
	'done-card',
	'drill-intro',
	'drill-reaction',
	'card-tamed',
	'mock-debrief',
	'readiness-plan',
	'monday-message',
	'playbook-voice',
	'trap-labels',
	'notebook-prompts'
] as const;

export type ReflexGapId = (typeof REFLEX_GAPS)[number];

export function reflexLine(id: string): string | null {
	if (Object.prototype.hasOwnProperty.call(APPROVED_REFLEX, id)) {
		return APPROVED_REFLEX[id as ApprovedReflexId];
	}
	return null;
}
