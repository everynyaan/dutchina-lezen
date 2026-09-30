import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createDefaultState } from '$lib/state/defaults';
import type { StewardHost } from './executor';
import { executeIntents } from './executor';
import { acceptGroundedItem, buildCoachContext, textChatFromLoop, type CoachSource } from './coach';
import { takePendingDrill } from './coachTools';
import { isKuromiLive, isMondayDate, showWeeklyMessage } from './live';
import type { LoopItem } from '$lib/reading/loop';

const KEY = 'SENTINEL_KEY_ZX9';
const QUOTE = 'SENTINEL_QUOTE_QWERTY_987';
const TRAP = 'SENTINEL_TRAP_PLUGH';
const OPTION = 'SENTINEL_OPTION_TEXT_44';
const PARAGRAPH = 917;

const source: CoachSource = {
	question: 'Which rule applies to this case?',
	qtype: 'toepassing',
	move: 'Mark the case facts and find the rule that matches all of them.',
	answer: KEY,
	evidence: [{ quote: QUOTE, p: PARAGRAPH }],
	distractors: {
		A: { trap: TRAP, why: `The lure is ${TRAP} because it repeats a nearby word.` }
	},
	paragraphMap: [
		{ p: PARAGRAPH, role: 'states-rule', summary: 'States the rule for the fee.' },
		{ p: 2, role: 'gives-example', summary: 'Gives an example of a late payment.' }
	]
};

function packetText(phase: 'locate' | 'options' | 'feedback'): string {
	return JSON.stringify(buildCoachContext(phase, source));
}

describe('buildCoachContext', () => {
	it('hides the key, the evidence quote, and the trap label before an answer', () => {
		for (const phase of ['locate', 'options'] as const) {
			const text = packetText(phase);
			expect(text, phase).not.toContain(KEY);
			expect(text, phase).not.toContain(QUOTE);
			expect(text, phase).not.toContain(TRAP);
			expect(text, phase).not.toContain(OPTION);
			expect(text, phase).not.toContain(String(PARAGRAPH));
		}
		const locate = buildCoachContext('locate', source);
		expect(locate).toEqual({
			phase: 'locate',
			question: source.question,
			qtype: source.qtype,
			paragraphMap: [
				{ role: 'states-rule', summary: 'States the rule for the fee.' },
				{ role: 'gives-example', summary: 'Gives an example of a late payment.' }
			]
		});
		const options = buildCoachContext('options', source);
		expect(options).toEqual({
			phase: 'options',
			question: source.question,
			qtype: source.qtype,
			move: source.move
		});
		expect(Object.keys(locate)).not.toContain('key');
		expect(Object.keys(options)).not.toContain('key');
	});

	it('includes the key, the evidence quote, and the trap label after the answer', () => {
		const feedback = buildCoachContext('feedback', source);
		expect(feedback).toMatchObject({
			phase: 'feedback',
			key: KEY,
			evidence: [QUOTE],
			traps: [TRAP]
		});
		const text = JSON.stringify(feedback);
		expect(text).toContain(KEY);
		expect(text).toContain(QUOTE);
		expect(text).toContain(TRAP);
	});
});

describe('text chat packets', () => {
	const item: LoopItem = {
		id: 'item-1',
		question: 'Which rule applies to this case?',
		options: { A: OPTION, B: 'the other line' },
		answer: KEY,
		qtype: 'detail',
		why: 'Because the sentence says so.',
		evidence: [{ quote: QUOTE, p: PARAGRAPH }],
		distractors: { A: { trap: TRAP as 'echo', why: TRAP } }
	};

	it('guards unanswered items and opens answered ones', () => {
		const packet = textChatFromLoop({
			passageText: `Intro\n\n${QUOTE}\n\nEnd`,
			paragraphMap: [{ p: PARAGRAPH, role: 'states-rule', summary: 'States a rule.' }],
			items: [
				{ id: 'open', item },
				{ id: 'done', item: { ...item, id: 'done', question: 'Already answered?' } }
			],
			answeredIds: new Set(['done']),
			activeId: 'open',
			activePhase: 'locate'
		});
		const open = JSON.stringify(packet.items[0]);
		const done = JSON.stringify(packet.items[1]);
		expect(open).not.toContain(KEY);
		expect(open).not.toContain(QUOTE);
		expect(open).not.toContain(TRAP);
		expect(open).not.toContain(String(PARAGRAPH));
		expect(done).toContain(KEY);
		expect(done).toContain(QUOTE);
		expect(done).toContain(TRAP);
		expect(packet.notebook).toEqual([]);
		expect(JSON.stringify(packet.paragraphMap)).not.toContain(String(PARAGRAPH));
	});
});

describe('acceptGroundedItem', () => {
	const passage = 'De regel staat na de dubbele punt: betaal voor vrijdag.';

	it('rejects a quote that is not an exact substring', () => {
		expect(
			acceptGroundedItem(passage, {
				evidence: [{ quote: 'betaal voor maandag' }],
				options: { A: 'voor vrijdag', B: 'voor maandag' },
				answer: 'A'
			})
		).toBe(false);
	});

	it('rejects an item without exactly one keyed option', () => {
		expect(
			acceptGroundedItem(passage, {
				evidence: [{ quote: 'betaal voor vrijdag' }],
				options: { A: 'voor vrijdag', B: 'voor maandag' },
				answer: 'C'
			})
		).toBe(false);
		expect(
			acceptGroundedItem(passage, {
				evidence: [{ quote: 'betaal voor vrijdag' }],
				options: {},
				answer: 'A'
			})
		).toBe(false);
	});

	it('accepts an exact quote with one keyed option', () => {
		expect(
			acceptGroundedItem(passage, {
				evidence: [{ quote: 'betaal voor vrijdag' }],
				options: { A: 'voor vrijdag', B: 'voor maandag', C: 'geen regel' },
				answer: 'B'
			})
		).toBe(true);
	});

	it('rejects an empty quote, which would match every passage', () => {
		expect(
			acceptGroundedItem(passage, {
				evidence: [{ quote: '' }],
				options: { A: 'x' },
				answer: 'A'
			})
		).toBe(false);
	});
});

describe('coach tools', () => {
	it('suggest_drill opens a cards path and does not drop the call', () => {
		const host = { getState: () => createDefaultState() } as StewardHost;
		const { results, dropped } = executeIntents(
			[
				{
					id: 'drill-1',
					name: 'suggest_drill',
					arguments: JSON.stringify({ qtype: 'detail', trap: '' })
				}
			],
			host
		);
		expect(dropped).toEqual([]);
		expect(results[0]).toMatchObject({ id: 'drill-1', outcome: 'applied' });
		expect(takePendingDrill()).toBe('/cards?qtype=detail');
	});

	it('rejects a notebook save because the notebook is not in this build', () => {
		const host = { getState: () => createDefaultState() } as StewardHost;
		const { results } = executeIntents(
			[
				{
					id: 'note-1',
					name: 'add_notebook_entry',
					arguments: JSON.stringify({ kind: 'word', quote: 'mits', note: 'condition' })
				}
			],
			host
		);
		expect(results[0]).toEqual({
			id: 'note-1',
			outcome: 'rejected',
			detail: 'Notebook is not stored in this build.'
		});
	});
});

describe('mock debrief', () => {
	it('renders from MockResult with no live call', () => {
		const mockPage = readFileSync(
			new URL('../../routes/mock/+page.svelte', import.meta.url),
			'utf8'
		);
		expect(mockPage).toContain('Flagged and right');
		expect(mockPage).toContain('Pass line');
		expect(mockPage).not.toContain('sendKuromi');
		expect(mockPage).not.toContain('isKuromiLive');
		expect(mockPage).not.toContain('>Hint<');
	});
});

describe('live gate', () => {
	it('hides live buttons unless PUBLIC_KUROMI_LIVE is 1', () => {
		expect(isKuromiLive()).toBe(false);
		expect(showWeeklyMessage('2026-09-28')).toBe(false);
	});

	it('treats 2026-09-28 as a Monday and 2026-09-30 as not', () => {
		expect(isMondayDate('2026-09-28')).toBe(true);
		expect(isMondayDate('2026-09-30')).toBe(false);
	});
});
