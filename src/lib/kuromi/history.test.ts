import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { capHistory, readLegacyChat, commitLegacyChatImport } from './history';
import type { KuromiTurn } from './types';

/** Minimal in-memory localStorage for Node vitest (no jsdom in this project). */
class MemoryStorage {
	private map = new Map<string, string>();
	getItem(key: string): string | null {
		return this.map.has(key) ? (this.map.get(key) as string) : null;
	}
	setItem(key: string, value: string): void {
		this.map.set(key, String(value));
	}
	removeItem(key: string): void {
		this.map.delete(key);
	}
	clear(): void {
		this.map.clear();
	}
}

function turn(role: KuromiTurn['role'], content: string): KuromiTurn {
	return { role, content };
}

beforeEach(() => {
	const storage = new MemoryStorage();
	Object.defineProperty(globalThis, 'localStorage', {
		value: storage,
		configurable: true,
		writable: true
	});
	// history.ts guards on typeof window === 'undefined'
	Object.defineProperty(globalThis, 'window', {
		value: globalThis,
		configurable: true,
		writable: true
	});
});

afterEach(() => {
	// @ts-expect-error cleanup test globals
	delete globalThis.window;
	// @ts-expect-error cleanup test globals
	delete globalThis.localStorage;
});

describe('capHistory (pure)', () => {
	it('applies turn count then length rules in order', () => {
		const turns = Array.from({ length: 14 }, (_, i) => turn('user', `t${i}`));
		const capped = capHistory(turns);
		expect(capped).toHaveLength(12);
		expect(capped[0].content).toBe('t2');
	});

	it('drops oldest whole turns when combined content exceeds 4000 chars; never slices content', () => {
		const a = 'A'.repeat(1500);
		const b = 'B'.repeat(1500);
		const c = 'C'.repeat(1500);
		const capped = capHistory([turn('user', a), turn('assistant', b), turn('user', c)]);
		expect(capped).toHaveLength(2);
		expect(capped[0].content).toBe(b);
		expect(capped[1].content).toBe(c);
		expect(capped[0].content.length).toBe(1500);
		expect(capped[1].content.length).toBe(1500);
	});

	it('keeps a single oversized turn intact (never partial truncate)', () => {
		const huge = 'X'.repeat(5000);
		const capped = capHistory([turn('user', huge)]);
		expect(capped).toHaveLength(1);
		expect(capped[0].content).toBe(huge);
		expect(capped[0].content.length).toBe(5000);
	});
});

describe('readLegacyChat + commitLegacyChatImport (two-phase)', () => {
	const now = '2026-06-15T12:00:00.000Z';
	const newId = 'imported-1';
	const legacyKey = 'dutchina_kuromi_chat_domi';
	const flagKey = 'dutchina_kuromi_chat_imported_domi';

	it('readLegacyChat on an absent key returns nothing-to-import', () => {
		expect(readLegacyChat('domi', now, newId)).toEqual({ status: 'nothing-to-import' });
		expect(localStorage.getItem(flagKey)).toBeNull();
		expect(localStorage.getItem(legacyKey)).toBeNull();
	});

	it('readLegacyChat on a valid transcript returns found and leaves the legacy key present', () => {
		const raw = JSON.stringify([
			{ role: 'user', content: 'Hello Kuromi' },
			{ role: 'assistant', content: 'Hey.' },
			{ role: 'bot', content: 'bad' },
			{ role: 'user', content: 'Again' }
		]);
		localStorage.setItem(legacyKey, raw);

		const result = readLegacyChat('domi', now, newId);
		expect(result.status).toBe('found');
		if (result.status !== 'found') return;
		expect(result.conversation.id).toBe(newId);
		expect(result.conversation.title).toBe('Hello Kuromi');
		expect(result.conversation.turns).toEqual([
			{ role: 'user', content: 'Hello Kuromi' },
			{ role: 'assistant', content: 'Hey.' },
			{ role: 'user', content: 'Again' }
		]);
		expect(result.conversation.createdAt).toBe(now);
		expect(result.conversation.updatedAt).toBe(now);
		// Core of the fix: read must not remove the legacy key or set the flag.
		expect(localStorage.getItem(legacyKey)).toBe(raw);
		expect(localStorage.getItem(flagKey)).toBeNull();
	});

	it('commitLegacyChatImport(profile, true) after found removes the legacy key and sets the flag', () => {
		localStorage.setItem(
			legacyKey,
			JSON.stringify([
				{ role: 'user', content: 'Hello Kuromi' },
				{ role: 'assistant', content: 'Hey.' }
			])
		);

		const result = readLegacyChat('domi', now, newId);
		expect(result.status).toBe('found');
		commitLegacyChatImport('domi', true);
		expect(localStorage.getItem(legacyKey)).toBeNull();
		expect(localStorage.getItem(flagKey)).toBe('1');
	});

	it('simulated reload before commit: second read still returns the same found transcript', () => {
		const raw = JSON.stringify([
			{ role: 'user', content: 'Survive reload' },
			{ role: 'assistant', content: 'Ok' }
		]);
		localStorage.setItem(legacyKey, raw);

		const first = readLegacyChat('domi', now, newId);
		expect(first.status).toBe('found');
		if (first.status !== 'found') return;
		expect(first.conversation.title).toBe('Survive reload');
		// Do NOT commit — simulate crash/reload.
		expect(localStorage.getItem(flagKey)).toBeNull();
		expect(localStorage.getItem(legacyKey)).toBe(raw);

		const second = readLegacyChat('domi', now, 'imported-reload');
		expect(second.status).toBe('found');
		if (second.status !== 'found') return;
		expect(second.conversation.turns).toEqual(first.conversation.turns);
		expect(second.conversation.title).toBe('Survive reload');
		expect(localStorage.getItem(legacyKey)).toBe(raw);
	});

	it('corrupt JSON: read returns nothing-to-import and leaves the raw value; commit(false) sets flag without deleting', () => {
		const corrupt = '{not json';
		localStorage.setItem(legacyKey, corrupt);

		expect(readLegacyChat('domi', now, newId)).toEqual({ status: 'nothing-to-import' });
		expect(localStorage.getItem(legacyKey)).toBe(corrupt);
		expect(localStorage.getItem(flagKey)).toBeNull();

		commitLegacyChatImport('domi', false);
		expect(localStorage.getItem(flagKey)).toBe('1');
		expect(localStorage.getItem(legacyKey)).toBe(corrupt);
	});

	it('cannot resurrect: after found+commit(true), a new legacy value is left untouched as already-imported', () => {
		localStorage.setItem(
			legacyKey,
			JSON.stringify([
				{ role: 'user', content: 'First import' },
				{ role: 'assistant', content: 'Ok' }
			])
		);

		const first = readLegacyChat('domi', now, newId);
		expect(first.status).toBe('found');
		if (first.status !== 'found') return;
		expect(first.conversation.title).toBe('First import');
		commitLegacyChatImport('domi', true);
		expect(localStorage.getItem(legacyKey)).toBeNull();

		const resurrected = JSON.stringify([{ role: 'user', content: 'Should stay' }]);
		localStorage.setItem(legacyKey, resurrected);

		const second = readLegacyChat('domi', now, 'imported-2');
		expect(second).toEqual({ status: 'already-imported' });
		expect(localStorage.getItem(legacyKey)).toBe(resurrected);
	});
});
