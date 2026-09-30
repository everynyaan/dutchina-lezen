import { describe, expect, it } from 'vitest';
import { LEZEN_EXAMS } from '$lib/lezen/LEZEN_CONTENT';
import {
	ANNOTATIONS,
	QTYPE_LABEL,
	QTYPE_MOVE,
	TRAP_EXPLANATION,
	TRAP_LABEL,
	getAnnotation,
	paragraphsOf,
	resolveEvidence,
	trapForPick
} from './annotations';
import { QTYPES, TRAP_KINDS } from './types';

const questions = LEZEN_EXAMS.flatMap((exam) =>
	exam.passages.flatMap((passage) => passage.questions)
);
const passages = LEZEN_EXAMS.flatMap((exam) => exam.passages);

function words(paragraph: string): number {
	return paragraph.trim().split(/\s+/).filter(Boolean).length;
}

describe('passage paragraphs', () => {
	it('keeps every paragraph between 3 characters and 250 words', () => {
		for (const passage of passages) {
			for (const paragraph of paragraphsOf(passage.text)) {
				expect(paragraph.length, passage.slug).toBeGreaterThanOrEqual(3);
				expect(words(paragraph), passage.slug).toBeLessThanOrEqual(250);
			}
		}
	});
});

describe('official item annotations', () => {
	it('has one annotation per official item and nothing else', () => {
		expect(ANNOTATIONS.map((annotation) => annotation.id).sort()).toEqual(
			questions.map((question) => question.id).sort()
		);
		expect(new Set(ANNOTATIONS.map((annotation) => annotation.id)).size).toBe(ANNOTATIONS.length);
	});

	it('uses the qtype and trap enums, and labels every wrong option', () => {
		for (const annotation of ANNOTATIONS) {
			expect(QTYPES).toContain(annotation.qtype);
			expect(QTYPE_LABEL[annotation.qtype].length).toBeGreaterThan(0);
			expect(QTYPE_MOVE[annotation.qtype].length).toBeGreaterThan(0);
			const question = questions.find((item) => item.id === annotation.id);
			expect(question, annotation.id).toBeTruthy();
			const expected = Object.keys(question!.options)
				.filter((letter) => letter !== question!.answer)
				.sort();
			expect(Object.keys(annotation.distractors).sort(), annotation.id).toEqual(expected);
			expect(annotation.distractors[question!.answer], annotation.id).toBeUndefined();
			for (const distractor of Object.values(annotation.distractors)) {
				expect(TRAP_KINDS).toContain(distractor.trap);
				expect(TRAP_LABEL[distractor.trap].length).toBeGreaterThan(0);
				expect(TRAP_EXPLANATION[distractor.trap].length).toBeGreaterThan(0);
				expect(distractor.why.length).toBeGreaterThan(0);
			}
			expect(annotation.move.length).toBeGreaterThan(0);
			expect(annotation.why.length).toBeGreaterThan(0);
		}
	});

	it('finds every evidence quote in exactly one paragraph', () => {
		for (const passage of passages) {
			for (const question of passage.questions) {
				const annotation = getAnnotation(question.id);
				expect(annotation, question.id).toBeTruthy();
				const resolved = resolveEvidence(passage.text, annotation!.evidence);
				expect(resolved, question.id).toEqual(annotation!.evidence.map((item) => item.p));
				expect(annotation!.evidence.length, question.id).toBeGreaterThan(0);
			}
		}
	});

	it('names the trap for a wrong pick and not for the key', () => {
		const annotation = getAnnotation('lezen-2025-21');
		expect(annotation).toBeTruthy();
		expect(trapForPick('lezen-2025-21', 'D')?.trap).toBe('overdreven');
		expect(trapForPick('lezen-2025-21', 'B')).toBeUndefined();
		expect(trapForPick('missing', 'A')).toBeUndefined();
	});

	it('has no em dashes in annotations or the English labels', () => {
		const blob =
			JSON.stringify(ANNOTATIONS) +
			JSON.stringify({ QTYPE_LABEL, QTYPE_MOVE, TRAP_LABEL, TRAP_EXPLANATION });
		expect(blob.includes('\u2014')).toBe(false);
	});
});
