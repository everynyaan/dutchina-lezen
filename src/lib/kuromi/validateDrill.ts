// ============================================================
// KUROMI — DRILL SEMANTIC VALIDATOR
//
// Pure function: no fetch, no env, no Blobs. Safe for client use.
// Accumulates every violated rule into a reasons array.
// ============================================================

import type { KuromiDrillSet, KuromiQuestion, KuromiQuestionType } from './drill';

export type ValidateDrillOk = { ok: true; set: KuromiDrillSet };
export type ValidateDrillFail = { ok: false; reasons: string[] };
export type ValidateDrillResult = ValidateDrillOk | ValidateDrillFail;

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function isQuestionType(value: unknown): value is KuromiQuestionType {
	return value === 'mcq' || value === 'recall';
}

/**
 * Validate a raw drill set against expected question count.
 * Collects ALL rule violations — does not bail on the first failure.
 */
export function validateDrill(raw: unknown, expectedCount: number): ValidateDrillResult {
	const reasons: string[] = [];

	if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
		return { ok: false, reasons: ['raw must be a non-null object'] };
	}

	const obj = raw as Record<string, unknown>;

	if (!isNonEmptyString(obj.title)) {
		reasons.push('title must be a non-empty string');
	}
	if (!isNonEmptyString(obj.intro_quip)) {
		reasons.push('intro_quip must be a non-empty string');
	}
	if (!Array.isArray(obj.questions)) {
		reasons.push('questions must be an array');
		return { ok: false, reasons };
	}

	const questions = obj.questions;
	if (questions.length !== expectedCount) {
		reasons.push(`questions.length must be exactly ${expectedCount}, got ${questions.length}`);
	}

	const seenPrompts = new Map<string, number>();
	const validated: KuromiQuestion[] = [];

	for (let i = 0; i < questions.length; i++) {
		const q = questions[i];
		const label = `questions[${i}]`;

		if (q === null || typeof q !== 'object' || Array.isArray(q)) {
			reasons.push(`${label} must be an object`);
			continue;
		}

		const question = q as Record<string, unknown>;
		const type = question.type;
		const prompt = question.prompt;
		const explanation = question.explanation_quip;
		const answer = question.answer;
		const options = question.options;

		if (!isQuestionType(type)) {
			reasons.push(`${label}.type must be "mcq" or "recall"`);
		}
		if (!isNonEmptyString(prompt)) {
			reasons.push(`${label}.prompt must be a non-empty string`);
		} else {
			const key = prompt.trim().toLowerCase();
			const prev = seenPrompts.get(key);
			if (prev !== undefined) {
				reasons.push(`${label}.prompt duplicates questions[${prev}].prompt (case-insensitive)`);
			} else {
				seenPrompts.set(key, i);
			}
		}
		if (!isNonEmptyString(explanation)) {
			reasons.push(`${label}.explanation_quip must be a non-empty string`);
		}

		if (type === 'mcq') {
			if (!Array.isArray(options)) {
				reasons.push(`${label}.options must be an array of 3–5 non-empty strings`);
			} else {
				if (options.length < 3 || options.length > 5) {
					reasons.push(`${label}.options must have 3–5 entries, got ${options.length}`);
				}
				const trimmedOpts: string[] = [];
				let allStrings = true;
				for (let j = 0; j < options.length; j++) {
					const opt = options[j];
					if (!isNonEmptyString(opt)) {
						reasons.push(`${label}.options[${j}] must be a non-empty string`);
						allStrings = false;
					} else {
						trimmedOpts.push(opt.trim());
					}
				}
				if (allStrings && trimmedOpts.length > 0) {
					const unique = new Set(trimmedOpts);
					if (unique.size !== trimmedOpts.length) {
						reasons.push(`${label}.options must be mutually distinct after trim`);
					}
				}
				if (!isNonEmptyString(answer)) {
					reasons.push(`${label}.answer must be a non-empty string`);
				} else if (allStrings && trimmedOpts.length > 0) {
					const trimmedAnswer = answer.trim();
					if (!trimmedOpts.includes(trimmedAnswer)) {
						reasons.push(`${label}.answer must exactly match one of the trimmed options`);
					}
				}
			}
		} else if (type === 'recall') {
			if (!isNonEmptyString(answer)) {
				reasons.push(`${label}.answer must be a non-empty string`);
			}
			if (options !== undefined && options !== null) {
				if (!Array.isArray(options)) {
					reasons.push(`${label}.options for recall must be absent or an empty array`);
				} else if (options.length > 0) {
					reasons.push(`${label}.options for recall must be empty, got ${options.length} entries`);
				}
			}
		}

		// Only assemble a validated question when the core fields look right enough
		// to type-narrow; full pass still requires reasons.length === 0 at the end.
		if (
			isQuestionType(type) &&
			isNonEmptyString(prompt) &&
			isNonEmptyString(explanation) &&
			isNonEmptyString(answer)
		) {
			const optsArray = Array.isArray(options)
				? (options as unknown[]).filter((o): o is string => typeof o === 'string')
				: [];
			validated.push({
				type,
				prompt: prompt.trim(),
				options: type === 'recall' ? [] : optsArray.map((o) => o.trim()),
				answer: answer.trim(),
				explanation_quip: explanation.trim()
			});
		}
	}

	if (reasons.length > 0) {
		return { ok: false, reasons };
	}

	return {
		ok: true,
		set: {
			title: (obj.title as string).trim(),
			intro_quip: (obj.intro_quip as string).trim(),
			questions: validated
		}
	};
}
