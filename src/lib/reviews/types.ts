// ============================================================
// DUTCHINA REVIEWS TYPES
// Types for the NT2 Schrijven exam review system.
// ============================================================

export type SchrijvenTaskType = 'zinstaak' | 'deelschrijftaak' | 'korte_schrijftaak';

export interface SchrijvenTask {
	id: string; // e.g. 'sch_2025_1' or 'sch_p_0_1'
	year: number; // 2023, 2024, 2025 (exam). 0 = practice (scaffolded).
	taskNumber: number; // 1-12 for exams, 1-6 for practice
	type: SchrijvenTaskType;
	title: string; // e.g. 'Overleg woensdag'
	scenario: string; // context/instruction for Domi
	partialText: string; // the e-mail/message with gap(s)
	gradingCriteria: {
		adequacy: string; // what the answer should contain
		grammar: string; // grammatical structure required
		extraAspects?: string; // spelling, word usage, coherence (tasks 9-12)
	};
	maxPoints: number; // from the beoordelingsmodel
	rank?: number; // 0-2 for practice tasks, undefined for exam tasks
}
