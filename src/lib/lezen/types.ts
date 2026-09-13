// ============================================================
// LEZEN MODULE TYPES
// Types for the NT2 Lezen (Reading) exam practice module.
// Content sourced from official Staatsexamen NT2 Programma I
// openbaar examen PDFs (2023, 2024, 2025).
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
}

export interface LezenExam {
	year: number;
	totalQuestions: number;
	passingScore: number;
	passages: LezenPassage[];
}
