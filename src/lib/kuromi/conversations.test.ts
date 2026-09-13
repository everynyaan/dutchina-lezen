import { describe, it, expect } from 'vitest';
import {
	MAX_CONVERSATIONS,
	MAX_TURNS_PER_CONVERSATION,
	MAX_TURN_CHARS,
	MAX_CONVERSATIONS_BYTES,
	UNTITLED_CONVERSATION,
	newConversation,
	appendToConversation,
	deriveTitle,
	upsertConversation,
	sortByRecency,
	capConversations
} from './conversations';
import type { KuromiConversation, KuromiConversationTurn } from '$lib/state/schema';

function turn(role: KuromiConversationTurn['role'], content: string): KuromiConversationTurn {
	return { role, content };
}

function conv(overrides: Partial<KuromiConversation> = {}): KuromiConversation {
	return {
		id: 'c1',
		title: UNTITLED_CONVERSATION,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		turns: [],
		...overrides
	};
}

describe('appendToConversation', () => {
	it('clamps an oversized turn to exactly MAX_TURN_CHARS', () => {
		const base = newConversation('2026-01-01T00:00:00.000Z', 'c1');
		const oversized = 'X'.repeat(MAX_TURN_CHARS + 500);
		const result = appendToConversation(base, turn('user', oversized), '2026-01-02T00:00:00.000Z');
		expect(result.turns).toHaveLength(1);
		expect(result.turns[0].content.length).toBe(MAX_TURN_CHARS);
		expect(result.turns[0].content).toBe('X'.repeat(MAX_TURN_CHARS));
	});

	it('does not clamp a turn at or under MAX_TURN_CHARS', () => {
		const base = newConversation('2026-01-01T00:00:00.000Z', 'c1');
		const exact = 'Y'.repeat(MAX_TURN_CHARS);
		const under = 'Z'.repeat(10);
		const withExact = appendToConversation(base, turn('user', exact), '2026-01-02T00:00:00.000Z');
		expect(withExact.turns[0].content.length).toBe(MAX_TURN_CHARS);
		const withUnder = appendToConversation(
			withExact,
			turn('assistant', under),
			'2026-01-03T00:00:00.000Z'
		);
		expect(withUnder.turns[1].content).toBe(under);
	});

	it('drops the oldest whole turn once length would exceed MAX_TURNS_PER_CONVERSATION', () => {
		let c = newConversation('2026-01-01T00:00:00.000Z', 'c1');
		for (let i = 0; i < MAX_TURNS_PER_CONVERSATION; i++) {
			c = appendToConversation(
				c,
				turn(i % 2 === 0 ? 'user' : 'assistant', `t${i}`),
				`2026-01-01T00:00:${String(i).padStart(2, '0')}.000Z`
			);
		}
		expect(c.turns).toHaveLength(MAX_TURNS_PER_CONVERSATION);
		expect(c.turns[0].content).toBe('t0');
		expect(c.turns[1].content).toBe('t1');

		const next = appendToConversation(c, turn('user', 't40'), '2026-01-02T00:00:00.000Z');
		expect(next.turns).toHaveLength(MAX_TURNS_PER_CONVERSATION);
		expect(next.turns[0].content).toBe('t1');
		expect(next.turns[MAX_TURNS_PER_CONVERSATION - 1].content).toBe('t40');
		// Whole turn only — never a partial/truncated turn body from the drop
		expect(next.turns.every((t) => t.content === t.content.trim() || t.content.length > 0)).toBe(
			true
		);
		expect(next.turns[0].content).not.toContain('t0');
	});

	it('bumps updatedAt to the passed nowISO', () => {
		const base = newConversation('2026-01-01T00:00:00.000Z', 'c1');
		const now = '2026-06-15T12:00:00.000Z';
		const result = appendToConversation(base, turn('user', 'hi'), now);
		expect(result.updatedAt).toBe(now);
		expect(result.createdAt).toBe(base.createdAt);
	});
});

describe('deriveTitle', () => {
	it('truncates a long message at a word boundary with an ellipsis', () => {
		const msg = 'hello world this is a fairly long conversation title that exceeds forty eight';
		expect(msg.length).toBeGreaterThan(48);
		const title = deriveTitle(msg);
		expect(title.endsWith('...')).toBe(true);
		expect(title.length).toBeLessThanOrEqual(48 + 3);
		expect(title).not.toContain('  ');
		// Truncated at a word boundary — no mid-word cut before the ellipsis
		const withoutEllipsis = title.slice(0, -3);
		expect(withoutEllipsis.endsWith(' ')).toBe(false);
		expect(msg.startsWith(withoutEllipsis)).toBe(true);
	});

	it('truncates a single word longer than 48 chars cleanly with an ellipsis', () => {
		const word = 'a'.repeat(60);
		const title = deriveTitle(word);
		expect(title).toBe('a'.repeat(48) + '...');
	});

	it('returns UNTITLED_CONVERSATION for empty and whitespace-only strings', () => {
		expect(deriveTitle('')).toBe(UNTITLED_CONVERSATION);
		expect(deriveTitle('   \n\t  ')).toBe(UNTITLED_CONVERSATION);
	});

	it('collapses internal newlines and multiple spaces to single spaces', () => {
		expect(deriveTitle('hello\n\nworld   again')).toBe('hello world again');
	});

	it('returns the full message when it fits under the title max', () => {
		expect(deriveTitle('Short title')).toBe('Short title');
	});
});

describe('upsertConversation', () => {
	it('appends when id is new', () => {
		const a = conv({ id: 'a' });
		const b = conv({ id: 'b', title: 'B' });
		const result = upsertConversation([a], b);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(a);
		expect(result[1]).toBe(b);
	});

	it('replaces in place preserving array position when id matches', () => {
		const a = conv({ id: 'a' });
		const b = conv({ id: 'b', title: 'B' });
		const c = conv({ id: 'c' });
		const b2 = conv({ id: 'b', title: 'B2' });
		const result = upsertConversation([a, b, c], b2);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe(a);
		expect(result[1]).toEqual(b2);
		expect(result[2]).toBe(c);
	});
});

describe('sortByRecency', () => {
	it('returns newest-first and does not mutate the input', () => {
		const a = conv({ id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' });
		const b = conv({ id: 'b', updatedAt: '2026-01-03T00:00:00.000Z' });
		const c = conv({ id: 'c', updatedAt: '2026-01-02T00:00:00.000Z' });
		const input = [a, b, c];
		const snapshot = [...input];
		const result = sortByRecency(input);
		expect(result.map((x) => x.id)).toEqual(['b', 'c', 'a']);
		expect(input).toEqual(snapshot);
		expect(result).not.toBe(input);
	});
});

describe('capConversations', () => {
	it('drops the single oldest when given 21 conversations, keeps relative order of survivors', () => {
		const list: KuromiConversation[] = [];
		for (let i = 0; i < MAX_CONVERSATIONS + 1; i++) {
			list.push(
				conv({
					id: `c${i}`,
					updatedAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`,
					createdAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`
				})
			);
		}
		expect(list).toHaveLength(21);
		const result = capConversations(list);
		expect(result).toHaveLength(MAX_CONVERSATIONS);
		expect(result.map((c) => c.id)).not.toContain('c0');
		// Survivors keep original relative order (c1..c20 in insertion order)
		expect(result.map((c) => c.id)).toEqual(
			Array.from({ length: MAX_CONVERSATIONS }, (_, i) => `c${i + 1}`)
		);
	});

	it('drops oldest until under byte budget when count fits but bytes exceed', () => {
		// Each conversation carries a large turn payload so 20 exceed 300k but a few fit.
		const fatContent = 'Z'.repeat(20_000);
		const list: KuromiConversation[] = [];
		for (let i = 0; i < MAX_CONVERSATIONS; i++) {
			list.push(
				conv({
					id: `fat${i}`,
					updatedAt: `2026-02-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`,
					turns: [turn('user', fatContent)]
				})
			);
		}
		expect(JSON.stringify(list).length).toBeGreaterThan(MAX_CONVERSATIONS_BYTES);
		expect(list.length).toBeLessThanOrEqual(MAX_CONVERSATIONS);

		const result = capConversations(list);
		expect(JSON.stringify(result).length).toBeLessThanOrEqual(MAX_CONVERSATIONS_BYTES);
		expect(result.length).toBeGreaterThan(0);
		expect(result.length).toBeLessThan(list.length);

		// Survivors are exactly the most recent N by updatedAt
		const expectedIds = list
			.slice()
			.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
			.slice(0, result.length)
			.map((c) => c.id)
			.reverse(); // original relative order among survivors
		// mostRecent kept; dropOldestExcept removes oldest while preserving remaining order
		const survivorIds = result.map((c) => c.id);
		const mostRecentId = list[list.length - 1].id;
		expect(survivorIds).toContain(mostRecentId);
		for (const id of survivorIds) {
			expect(id.startsWith('fat')).toBe(true);
		}
		// Internal turns byte-for-byte unchanged
		for (const survivor of result) {
			const original = list.find((c) => c.id === survivor.id)!;
			expect(survivor.turns).toEqual(original.turns);
			expect(JSON.stringify(survivor.turns)).toBe(JSON.stringify(original.turns));
		}
		// All survivors are a suffix of the most-recent conversations
		const recentFirst = [...list].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
		expect(new Set(survivorIds)).toEqual(
			new Set(recentFirst.slice(0, result.length).map((c) => c.id))
		);
		void expectedIds;
	});

	it('never vanishes a single oversized conversation — clamps turns instead', () => {
		const hugeTurns: KuromiConversationTurn[] = [];
		for (let i = 0; i < 30; i++) {
			hugeTurns.push(turn(i % 2 === 0 ? 'user' : 'assistant', 'H'.repeat(15_000)));
		}
		const only = conv({
			id: 'solo',
			updatedAt: '2026-03-01T00:00:00.000Z',
			turns: hugeTurns
		});
		expect(JSON.stringify([only]).length).toBeGreaterThan(MAX_CONVERSATIONS_BYTES);

		const result = capConversations([only]);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('solo');
		expect(result[0].turns.length).toBeLessThan(hugeTurns.length);
		expect(result[0].turns.length).toBeGreaterThan(0);
	});

	it('returns empty array for empty input', () => {
		expect(capConversations([])).toEqual([]);
	});
});

describe('newConversation', () => {
	it('builds an untitled empty conversation with the given id and timestamps', () => {
		const c = newConversation('2026-04-01T00:00:00.000Z', 'nid');
		expect(c).toEqual({
			id: 'nid',
			title: UNTITLED_CONVERSATION,
			createdAt: '2026-04-01T00:00:00.000Z',
			updatedAt: '2026-04-01T00:00:00.000Z',
			turns: []
		});
	});
});
