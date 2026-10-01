// ============================================================
// LEZEN MODULE TYPES
// Types for the NT2 Lezen (Reading) exam practice module.
// Content sourced from official Staatsexamen NT2 Programma I
// Openbaar examen Lezen I (2023, 2024, 2025): beoordelingsmodel keys
// plus tekst/opgaven. The computer paper is 36 questions. The published
// papers needed 24 of 35. These openbaar papers are 35 items. Options are
// A–D on the official papers.
// ============================================================

export type LezenAnswer = 'A' | 'B' | 'C' | 'D';

export interface LezenQuestion {
	id: string;
	vraag: number;
	question: string;
	options: Record<string, string>;
	answer: LezenAnswer;
}

export interface LezenPassage {
	name: string;
	slug: string;
	intro: string;
	/** Full passage text with \n\n paragraph separators */
	text: string;
	questions: LezenQuestion[];
	/** Margin labels for a passage that numbers its paragraphs, such as I to V. */
	paragraphLabels?: string[];
	/** Label to paragraph index, after any printed prefix has been removed. */
	paragraphMap?: Record<string, number>;
}

export interface LezenExam {
	year: number;
	totalQuestions: number;
	passingScore: number;
	passages: LezenPassage[];
}
