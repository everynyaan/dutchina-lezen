// ============================================================
// LUISTEREN MODULE TYPES
// Types for the NT2 Luisteren (Listening) exam practice module.
// Content sourced from official Staatsexamen NT2 Programma I
// openbaar examen PDFs (2023, 2024, 2025).
// ============================================================

export type Answer = 'A' | 'B' | 'C';

/** Whether the media is audio-only or video */
export type MediaType = 'audio' | 'video';

export interface LuisterenQuestion {
	/** Unique ID: e.g. "2025-6" for year 2025, opgave 6 */
	id: string;
	/** The opgave number as printed in the exam (1-based) */
	opgave: number;
	/** Question text in Dutch */
	question: string;
	/** Three MC options */
	options: { A: string; B: string; C: string };
	/** Correct answer */
	answer: Answer;
	/**
	 * Filename of the audio/video track in R2.
	 * Full URL = R2_BASE/{year}/{filename}
	 */
	filename: string;
	/** File extension determines player type */
	mediaType: MediaType;
}

export interface LuisterenPassage {
	/** Display name of the passage, e.g. "Helicon" */
	name: string;
	/** Short description / intro text */
	intro: string;
	/** Whether this passage is audio or video */
	mediaType: MediaType;
	/**
	 * Filename(s) for the intro track(s).
	 * Audio intros are .opus, video intros may have both an .opus and .webm.
	 */
	introFiles: string[];
	/** Questions belonging to this passage, in exam order */
	questions: LuisterenQuestion[];
}

export interface LuisterenExam {
	year: number;
	totalQuestions: number;
	/** Minimum correct answers to pass (cesuur / laagste voldoende) */
	passingScore: number;
	passages: LuisterenPassage[];
}

/** R2 bucket base URL for all luisteren audio/video files */
export const R2_BASE = 'https://pub-a131b7245fe0433381aa85d5573bdcee.r2.dev/luisteren';
