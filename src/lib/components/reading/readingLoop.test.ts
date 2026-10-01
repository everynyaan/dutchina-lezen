/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import AnswerFeedback from './AnswerFeedback.svelte';
import ParagraphMap from './ParagraphMap.svelte';
import QuestionBlock from './QuestionBlock.svelte';
import ReadingLoopHost from './readingLoop.host.svelte';
import ReadingPane from './ReadingPane.svelte';
import { displayOptions, resolveLoopItem, type LoopItem } from '$lib/reading/loop';

const passage = {
	name: 'The rent',
	intro: 'From a housing leaflet',
	text: 'House rules\n\nShe pays the bill by the river.\n\n• Bring a form\n• Wait outside'
};

const item: LoopItem = {
	id: 'practice-rent',
	question: 'Where does she pay?',
	options: { A: 'at the desk', B: 'by the river', C: 'on the tram' },
	answer: 'B',
	qtype: 'detail',
	why: 'The sentence names the river.',
	distractors: {
		A: { trap: 'echo', why: 'Desk is a nearby word.' },
		C: { trap: 'niet-in-tekst', why: 'The tram is not in the text.' }
	}
};

const mounted: object[] = [];

function shuffledSeed(): string {
	for (let i = 0; i < 30; i++) {
		const seed = `attempt-${i}`;
		const rows = displayOptions(item.options, true, seed);
		if (rows.some((row) => row.display !== row.original)) return seed;
	}
	throw new Error('expected a seed that changes option order');
}

afterEach(async () => {
	for (const component of mounted) await unmount(component);
	mounted.length = 0;
	document.body.innerHTML = '';
});

describe('reading loop components', () => {
	it('highlights a quote and reports the paragraph that was clicked', async () => {
		const hits: number[] = [];
		const scrolled: Element[] = [];
		HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
			scrolled.push(this);
		};
		mounted.push(
			mount(ReadingPane, {
				target: document.body,
				props: {
					passage,
					highlight: [{ p: 1, quote: 'by the river' }],
					locateMode: true,
					onLocate: (p: number) => hits.push(p),
					scrollToEvidence: true
				}
			})
		);
		await tick();
		const mark = document.querySelector('mark');
		expect(mark?.textContent).toBe('by the river');
		expect(document.body.textContent).toContain('From a housing leaflet');
		expect(document.querySelectorAll('li').length).toBe(2);
		expect(document.querySelector('li')?.textContent).toBe('Bring a form');
		const block = document.querySelector<HTMLElement>('[data-p="1"]');
		expect(block).toBeTruthy();
		block?.click();
		expect(hits).toEqual([1]);
		expect(scrolled.some((node) => node.getAttribute('data-p') === '1')).toBe(true);
	});

	it('hides options during locate and stores the original letter after a shuffle', async () => {
		const picks: string[] = [];
		const seed = shuffledSeed();
		mounted.push(
			mount(QuestionBlock, {
				target: document.body,
				props: {
					item,
					phase: 'locate',
					shuffle: true,
					seed,
					onPick: (letter: string) => picks.push(letter)
				}
			})
		);
		await tick();
		const locateText = document.body.textContent ?? '';
		expect(locateText).toContain('Where does she pay?');
		expect(locateText).toContain('Click the paragraph where the answer is');
		expect(locateText).not.toContain('at the desk');
		expect(locateText).not.toContain('by the river');
		expect(locateText).not.toContain('on the tram');
		expect(locateText).not.toContain('Check');
		expect(locateText).not.toContain('Hint');

		const locate = mounted.pop();
		if (!locate) throw new Error('missing locate component');
		await unmount(locate);
		document.body.innerHTML = '';

		const rows = displayOptions(item.options, true, seed);
		expect(rows.map((row) => row.display)).toEqual(['A', 'B', 'C']);
		mounted.push(
			mount(QuestionBlock, {
				target: document.body,
				props: {
					item,
					phase: 'options',
					shuffle: true,
					seed,
					picked: '',
					onPick: (letter: string) => picks.push(letter)
				}
			})
		);
		await tick();
		const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-original]')];
		expect(buttons).toHaveLength(3);
		for (const button of buttons) {
			const row = rows.find((entry) => entry.original === button.dataset.original);
			expect(button.dataset.display).toBe(row?.display);
			expect(button.textContent).toContain(row?.text ?? '');
		}
		const moved = buttons.find((button) => button.dataset.display !== button.dataset.original);
		expect(moved).toBeTruthy();
		moved?.click();
		expect(picks).toEqual([moved?.dataset.original]);
		expect(picks[0]).not.toBe(moved?.dataset.display);
	});

	it('starts a whole-text question on the options', async () => {
		const whole: LoopItem = { ...item, qtype: 'doel-tekst' };
		expect(resolveLoopItem(whole).wholeText).toBe(true);
		mounted.push(
			mount(QuestionBlock, {
				target: document.body,
				props: { item: whole, phase: 'locate', shuffle: false }
			})
		);
		await tick();
		const text = document.body.textContent ?? '';
		expect(text).toContain('at the desk');
		expect(text).not.toContain('Click the paragraph where the answer is');
		const first = document.querySelector<HTMLButtonElement>('[data-original]');
		expect(first?.dataset.display).toBe('A');
		expect(first?.dataset.original).toBe('A');
	});

	it('names the lure and the paragraph she looked in', () => {
		const resolved = resolveLoopItem(item);
		mounted.push(
			mount(AnswerFeedback, {
				target: document.body,
				props: { item, resolved, picked: 'A', locatedP: 0, answerP: 1 }
			})
		);
		const text = document.body.textContent ?? '';
		expect(text).toContain('Not this one.');
		expect(text).toContain('Echo. Desk is a nearby word.');
		expect(text).toContain('The sentence names the river.');
		expect(text).toContain('The lure here: at the desk (Echo)');
		expect(text).toContain('You looked in paragraph 1; the answer is in paragraph 2');
	});

	it('maps body paragraphs and skips a heading', async () => {
		const done: string[] = [];
		mounted.push(
			mount(ParagraphMap, {
				target: document.body,
				props: {
					passage,
					seed: 'map-1',
					entries: [
						{ p: 0, anchor: 'House rules', role: 'introduces-topic', summary: 'Heading only.' },
						{
							p: 1,
							anchor: 'She pays',
							role: 'states-rule',
							summary: 'This paragraph states the payment rule.'
						}
					],
					onDone: () => done.push('done')
				}
			})
		);
		await tick();
		expect(document.body.textContent).toContain('What does this paragraph mainly do?');
		expect(document.body.textContent).not.toContain('Heading only.');
		const choice = [...document.querySelectorAll('button')].find(
			(button) => button.textContent && !button.textContent.includes('States a rule')
		);
		expect(choice).toBeTruthy();
		choice?.click();
		await tick();
		expect(document.body.textContent).toContain('Not this one.');
		expect(document.body.textContent).toContain('This paragraph states the payment rule.');
		const next = [...document.querySelectorAll('button')].find(
			(button) => button.textContent === 'Done'
		);
		next?.click();
		expect(done).toEqual(['done']);
	});

	it('keeps the space between sentences in one paragraph', async () => {
		mounted.push(
			mount(ReadingPane, {
				target: document.body,
				props: {
					passage: {
						name: 'Gap',
						intro: '',
						text: 'Eerste zin. Tweede zin.'
					}
				}
			})
		);
		await tick();
		expect(document.body.textContent).toContain('Eerste zin. Tweede zin.');
	});

	it('asks for a wider window and keeps a notebook rail', async () => {
		mounted.push(mount(ReadingLoopHost, { target: document.body, props: { passage } }));
		await tick();
		expect(document.body.textContent).toContain('Use a wider window.');
		expect(document.body.textContent).toContain('Notebook');
		expect(document.body.textContent).toContain('Notes for this text land here.');
		expect(document.body.textContent).toContain('Notebook');
		expect(document.body.textContent).toContain('Where does she pay?');
	});

	it('hides the notebook rail in exam mode', async () => {
		mounted.push(
			mount(ReadingLoopHost, {
				target: document.body,
				props: { passage, hideNotebook: true }
			})
		);
		await tick();
		expect(document.querySelector('[aria-label="Notebook"]')).toBeNull();
	});
});
