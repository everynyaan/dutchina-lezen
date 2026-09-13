// D26 (Phase 4): the shared question/ components are formally keying-agnostic.
// No result-keying concept may cross the QuestionView prop boundary — consumers
// own their own keying. /quiz and the Kuromi drill runner key results
// structurally by id and question; /daily remains positional as a documented,
// quarantined exception because its keys are persisted state and its generator
// is out of scope. This test exists so a future consumer cannot quietly bake
// one convention into the shared layer and break the other.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

const forbidden = ['dailyHomework', 'dailyQuiz', 'questionIds', 'currentIndex', '.results'];

describe('question components are keying-agnostic', () => {
	it('ConversationQuestion.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'ConversationQuestion.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('LezenQuestion.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'LezenQuestion.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('LuisterenQuestion.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'LuisterenQuestion.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('MatchQuestion.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'MatchQuestion.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('OptionList.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'OptionList.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('QuestionView.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'QuestionView.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('RecallQuestion.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'RecallQuestion.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});

	it('TypedRecallQuestion.svelte contains no result-keying knowledge', () => {
		const fileContents = fs.readFileSync(path.join(dir, 'TypedRecallQuestion.svelte'), 'utf-8');
		for (const substring of forbidden) {
			expect(fileContents).not.toContain(substring);
		}
	});
});
