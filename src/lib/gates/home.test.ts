import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, generateDailySession } from '$lib/daily/generator';
import { STEWARD_TOOL_NAMES, PAGE_TOOL_NAMES } from '$lib/kuromi/executor';
import { GATE1_WORD_ID_SET } from './gate1Allowlist';
import { examInHomework, getWordsForGate } from './gates';
import {
	GATE_COPY,
	GATE_STICKERS,
	PAST_GATE_WHEN,
	gateStickerEarned,
	homeGateCards,
	homeworkGateForHub,
	hubLinks,
	lockWhenLines,
	hubShowsExamGym,
	hubWords,
	parseGateQuery,
	resolveHub
} from './home';
import { hubChecks } from './progress';

describe('home / hub routing', () => {
	it('Gate 1 home is one open card and three locked cards with ship copy', () => {
		const cards = homeGateCards(1);
		expect(cards.map((c) => c.n)).toEqual([1, 2, 3, 4]);
		expect(cards.filter((c) => c.open)).toHaveLength(1);
		expect(cards.filter((c) => !c.open)).toHaveLength(3);
		expect(cards[0]).toMatchObject({
			title: 'First words',
			when: "You're on your way. Start a few cards from this room.",
			href: '/gate?n=1',
			current: true
		});
		expect(cards[0].progress).toMatchObject({ kind: 'open', percent: 0 });
		expect(cards[0].progress.line).not.toMatch(/interval|Iron|LP/i);
		expect(cards[1].href).toBeNull();
		expect(cards[1].when).toBe(GATE_COPY[2].when);
		expect(cards[1].progress).toMatchObject({ kind: 'locked', percent: 0, line: 'Locked' });
		expect(cards[2].when).toBe(GATE_COPY[3].when);
		expect(cards[2].progress.percent).toBe(0);
		expect(cards[3].when).toBe(GATE_COPY[4].when);
		expect(cards[3].progress.percent).toBe(0);
		expect(GATE_COPY[2].when).toBe(
			'Opens when Gate 1 words stick and the quizzes here are solid.'
		);
		expect(GATE_COPY[3].when).toBe(
			'Opens when Gate 2 is mastered. Exam paper stays optional until then.'
		);
		expect(GATE_COPY[4].when).toBe('Opens when Gate 3 is mastered. This is the exam room.');
	});

	it('placed-at-2 home keeps earlier gate tappable and later gates locked', () => {
		const cards = homeGateCards(2);
		expect(cards[0]).toMatchObject({ open: true, href: '/gate?n=1', when: PAST_GATE_WHEN });
		expect(cards[0].progress).toMatchObject({ kind: 'done', percent: 100, line: 'Done' });
		expect(cards[1]).toMatchObject({
			open: true,
			current: true,
			href: '/gate?n=2'
		});
		expect(cards[1].progress.kind).toBe('open');
		expect(cards[1].when).toContain("You're on your way");
		expect(cards[2].open).toBe(false);
		expect(cards[2].href).toBeNull();
		expect(cards[2].progress.percent).toBe(0);
		expect(cards[3].open).toBe(false);
	});

	it('parseGateQuery and resolveHub: /gate and /gate?n=current open; later n locks', () => {
		expect(parseGateQuery(null)).toBeNull();
		expect(parseGateQuery('')).toBeNull();
		expect(parseGateQuery('1')).toBe(1);
		expect(parseGateQuery('2')).toBe(2);
		expect(parseGateQuery('9')).toBeNull();
		expect(resolveHub(null, 1)).toEqual({ kind: 'open', gate: 1, requested: 1 });
		expect(resolveHub(1, 1)).toEqual({ kind: 'open', gate: 1, requested: 1 });
		expect(resolveHub(2, 1)).toEqual({ kind: 'locked', requested: 2, current: 1 });
		expect(resolveHub(4, 1)).toEqual({ kind: 'locked', requested: 4, current: 1 });
		expect(resolveHub(1, 2)).toEqual({ kind: 'open', gate: 1, requested: 1 });
	});

	it('open G1 hub lists quiz / week set / words / grammar / boss and hides exam gym', () => {
		const open = resolveHub(1, 1);
		expect(hubLinks(open)).toEqual(['quiz', 'weekset', 'words', 'grammar', 'boss']);
		expect(hubLinks(resolveHub(2, 2))).toEqual(['quiz', 'weekset', 'words', 'boss']);
		expect(hubShowsExamGym(1)).toBe(false);
		expect(hubShowsExamGym(2)).toBe(false);
		expect(hubShowsExamGym(3)).toBe(true);
		expect(hubShowsExamGym(4)).toBe(true);
		expect(hubLinks(resolveHub(3, 3))).toContain('lezen');
		expect(hubLinks(resolveHub(3, 3))).toContain('luisteren');
		expect(hubLinks(open)).not.toContain('lezen');
		expect(hubLinks(resolveHub(2, 2)).join(' ')).not.toMatch(/lezen|luisteren|reviews|schrijven/);
	});

	it('lockWhenLines lists only later rooms', () => {
		expect(lockWhenLines(1).map((l) => l.gate)).toEqual([2, 3, 4]);
		expect(lockWhenLines(4)).toEqual([]);
		expect(lockWhenLines(2)[0].when).toBe(GATE_COPY[3].when);
	});

	it('collection stickers are the four gates, earned for current or mastered', () => {
		expect(GATE_STICKERS.map((s) => s.title)).toEqual([
			'First words',
			'Everyday Dutch',
			'Real sentences',
			'B1'
		]);
		expect(gateStickerEarned(1, 1, [])).toBe(true);
		expect(gateStickerEarned(2, 1, [])).toBe(false);
		expect(gateStickerEarned(1, 2, [1])).toBe(true);
		expect(gateStickerEarned(2, 2, [1])).toBe(true);
		expect(GATE_STICKERS.every((s) => !/iron|bronze|silver|gold|master/i.test(s.title))).toBe(true);
	});

	it('does not expose a set_gate tool', () => {
		const tools = [...STEWARD_TOOL_NAMES, ...PAGE_TOOL_NAMES];
		expect(tools).not.toContain('set_gate');
	});

	it('open card missing-line and hub checks stay plain-language', () => {
		const cards = homeGateCards(1, {
			cardReviews: {},
			quizLog: [
				{ gate: 1, date: '2026-08-27', correct: 4, total: 5 },
				{ gate: 1, date: '2026-08-28', correct: 5, total: 5 }
			],
			weekLog: []
		});
		expect(cards[0].progress.kind).toBe('open');
		expect(cards[0].progress.line).not.toMatch(/interval|Iron|LP/i);
		const checks = hubChecks(cards[0].progress);
		expect(checks[2].status).toBe('2 of 3 good dailies');
		expect(checks[3].status).toBe('still ahead');
		expect(checks.every((c) => !/interval|Iron|LP/i.test(`${c.label} ${c.status}`))).toBe(true);
	});
});

describe('locked gate does not serve later-gate generators', () => {
	it('/gate?n=2 while current=1 has no words, no links, no homework gate', () => {
		const locked = resolveHub(2, 1);
		expect(locked.kind).toBe('locked');
		expect(hubWords(locked)).toEqual([]);
		expect(hubLinks(locked)).toEqual([]);
		expect(homeworkGateForHub(locked, 1)).toBeNull();
		expect(homeworkGateForHub(locked, 1)).not.toBe(2);
		expect(getWordsForGate(2).length).toBeGreaterThan(0);
	});

	it('open G1 hub words and week-set stay on the allowlist, no NT2', () => {
		const open = resolveHub(1, 1);
		const words = hubWords(open);
		expect(words.length).toBeGreaterThan(0);
		for (const word of words) {
			expect(GATE1_WORD_ID_SET.has(word.id)).toBe(true);
		}
		const gate = homeworkGateForHub(open, 1);
		expect(gate).toBe(1);
		if (gate !== 1) throw new Error('expected homework gate 1');
		const session = generateDailySession(0, DEFAULT_CONFIG, gate);
		expect(session.some((q) => q.type === 'lezen' || q.type === 'luisteren')).toBe(false);
		expect(session.some((q) => q.type === 'conversation')).toBe(false);
	});
});

describe('examInHomework unchanged', () => {
	it('is false on G1–G3 and true only on G4', () => {
		expect(examInHomework(1)).toBe(false);
		expect(examInHomework(2)).toBe(false);
		expect(examInHomework(3)).toBe(false);
		expect(examInHomework(4)).toBe(true);
	});
});
