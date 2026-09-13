/**
 * Gate 1 grammar drills — pure beginner only.
 * Patterns: de/het, V2 with subject first, present ik/jij/hij.
 * Not the deleted 230-exercise engine. Not exam-register.
 */

export const G1_DRILL_PATTERNS = ['de_het', 'v2_subject_first', 'present_ik_jij_hij'] as const;

export type G1DrillPattern = (typeof G1_DRILL_PATTERNS)[number];

export interface GrammarDrill {
	id: string;
	pattern: G1DrillPattern;
	/** English instruction — chrome stays English. */
	prompt: string;
	/** Dutch cue shown under the prompt (article blank, sentence, or stem). */
	cue: string;
	options: string[];
	answer: string;
	explain: string;
}

/** Words/frames that must never appear in the G1 bank. */
export const G1_DRILL_EXAM_REGISTER_RE =
	/opleiding|staatsexamen|hoorzitting|cardioloog|milieu|tweede kamer|europese unie|volk\b|wet\b|kofschip|omdat |terwijl |voordat |invers|sub-?clause|participle|ge- prefix|\ber\b/i;

export const GATE1_DRILLS: readonly GrammarDrill[] = [
	// ---- de / het (7) — allowlist nouns only ----
	{
		id: 'g1d_de_hond',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ hond',
		options: ['de', 'het'],
		answer: 'de',
		explain: 'de hond — the dog. Most people and animals take de.'
	},
	{
		id: 'g1d_het_boek',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ boek',
		options: ['de', 'het'],
		answer: 'het',
		explain: 'het boek — the book. This one you just learn.'
	},
	{
		id: 'g1d_de_auto',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ auto',
		options: ['de', 'het'],
		answer: 'de',
		explain: 'de auto — the car.'
	},
	{
		id: 'g1d_het_kind',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ kind',
		options: ['de', 'het'],
		answer: 'het',
		explain: 'het kind — the child. het meisje is the same family.'
	},
	{
		id: 'g1d_de_tafel',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ tafel',
		options: ['de', 'het'],
		answer: 'de',
		explain: 'de tafel — the table.'
	},
	{
		id: 'g1d_het_water',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ water',
		options: ['de', 'het'],
		answer: 'het',
		explain: 'het water — the water.'
	},
	{
		id: 'g1d_de_school',
		pattern: 'de_het',
		prompt: 'Pick de or het.',
		cue: '___ school',
		options: ['de', 'het'],
		answer: 'de',
		explain: 'de school — the school.'
	},

	// ---- V2, subject first (6) — no inversion as the point ----
	{
		id: 'g1d_v2_maak',
		pattern: 'v2_subject_first',
		prompt: 'The verb sits in slot two. Which sentence is right?',
		cue: 'I make coffee.',
		options: ['Ik maak koffie.', 'Ik koffie maak.'],
		answer: 'Ik maak koffie.',
		explain: 'Subject first, then the verb: Ik | maak | koffie.'
	},
	{
		id: 'g1d_v2_ziet',
		pattern: 'v2_subject_first',
		prompt: 'The verb sits in slot two. Which sentence is right?',
		cue: 'He sees the dog.',
		options: ['Hij ziet de hond.', 'Hij de hond ziet.'],
		answer: 'Hij ziet de hond.',
		explain: 'Hij | ziet | de hond. The verb is second.'
	},
	{
		id: 'g1d_v2_wilt',
		pattern: 'v2_subject_first',
		prompt: 'The verb sits in slot two. Which sentence is right?',
		cue: 'You want water.',
		options: ['Jij wilt water.', 'Jij water wilt.'],
		answer: 'Jij wilt water.',
		explain: 'Jij | wilt | water.'
	},
	{
		id: 'g1d_v2_zegt',
		pattern: 'v2_subject_first',
		prompt: 'The verb sits in slot two. Which sentence is right?',
		cue: 'She says yes.',
		options: ['Zij zegt ja.', 'Zij ja zegt.'],
		answer: 'Zij zegt ja.',
		explain: 'Zij | zegt | ja.'
	},
	{
		id: 'g1d_v2_hond',
		pattern: 'v2_subject_first',
		prompt: 'The verb sits in slot two. Which sentence is right?',
		cue: 'The dog is nice.',
		options: ['De hond is leuk.', 'De hond leuk is.'],
		answer: 'De hond is leuk.',
		explain: 'De hond | is | leuk. The whole subject is slot one.'
	},
	{
		id: 'g1d_v2_eet',
		pattern: 'v2_subject_first',
		prompt: 'The verb sits in slot two. Which sentence is right?',
		cue: 'I eat fish.',
		options: ['Ik eet vis.', 'Ik vis eet.'],
		answer: 'Ik eet vis.',
		explain: 'Ik | eet | vis.'
	},

	// ---- present ik / jij / hij (6) — stem vs -t, no inversion ----
	{
		id: 'g1d_pres_ik_maak',
		pattern: 'present_ik_jij_hij',
		prompt: 'Fill the blank. ik never takes -t.',
		cue: 'Ik ___ koffie. (maken)',
		options: ['maak', 'maakt', 'maken'],
		answer: 'maak',
		explain: 'Ik + stem. Ik maak. No -t.'
	},
	{
		id: 'g1d_pres_jij_maakt',
		pattern: 'present_ik_jij_hij',
		prompt: 'Fill the blank. jij adds -t.',
		cue: 'Jij ___ koffie. (maken)',
		options: ['maak', 'maakt', 'maken'],
		answer: 'maakt',
		explain: 'Jij + stem + t. Jij maakt.'
	},
	{
		id: 'g1d_pres_hij_maakt',
		pattern: 'present_ik_jij_hij',
		prompt: 'Fill the blank. hij adds -t.',
		cue: 'Hij ___ koffie. (maken)',
		options: ['maak', 'maakt', 'maken'],
		answer: 'maakt',
		explain: 'Hij + stem + t. Hij maakt.'
	},
	{
		id: 'g1d_pres_ik_woon',
		pattern: 'present_ik_jij_hij',
		prompt: 'Fill the blank. ik never takes -t.',
		cue: 'Ik ___ thuis. (wonen)',
		options: ['woon', 'woont', 'wonen'],
		answer: 'woon',
		explain: 'Ik woon. Bare stem.'
	},
	{
		id: 'g1d_pres_jij_speelt',
		pattern: 'present_ik_jij_hij',
		prompt: 'Fill the blank. jij adds -t.',
		cue: 'Jij ___ buiten. (spelen)',
		options: ['speel', 'speelt', 'spelen'],
		answer: 'speelt',
		explain: 'Jij speelt. Stem + t.'
	},
	{
		id: 'g1d_pres_hij_ziet',
		pattern: 'present_ik_jij_hij',
		prompt: 'Fill the blank. hij adds -t.',
		cue: 'Hij ___ de hond. (zien)',
		options: ['zie', 'ziet', 'zien'],
		answer: 'ziet',
		explain: 'Hij ziet. Stem + t.'
	}
];

export function drillsForGate(gate: number): readonly GrammarDrill[] {
	return gate === 1 ? GATE1_DRILLS : [];
}

export function isApprovedG1Pattern(pattern: string): pattern is G1DrillPattern {
	return (G1_DRILL_PATTERNS as readonly string[]).includes(pattern);
}
