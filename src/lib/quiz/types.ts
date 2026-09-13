import type {
	DailyMatchQuestion,
	DailyConversationQuestion,
	DailyLezenQuestion
} from '$lib/daily/types';

/** Type-the-Dutch recall. The one genuinely new question UI in this phase. */
export interface QuizRecallQuestion {
	type: 'quiz-recall';
	questionId: string;
	wordId: string;
	english: string; // the prompt
	pos: string;
	answer: string; // the expected Dutch
	sentenceNl: string; // shown after answering, for context
	sentenceEn: string;
}

export type QuizQuestion =
	| DailyMatchQuestion
	| QuizRecallQuestion
	| DailyConversationQuestion
	| DailyLezenQuestion;

/** A question paired with the persisted id it was rebuilt from. */
export interface QuizBuiltQuestion {
	id: string;
	question: QuizQuestion;
}

export const QUIZ_QUESTION_COUNT = 5;
