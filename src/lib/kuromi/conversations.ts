import type { KuromiConversation, KuromiConversationTurn } from '$lib/state/schema';

export const MAX_CONVERSATIONS = 20;
export const MAX_TURNS_PER_CONVERSATION = 40;
export const MAX_TURN_CHARS = 4000;
export const MAX_CONVERSATIONS_BYTES = 300_000;

export const UNTITLED_CONVERSATION = 'New conversation';

const TITLE_MAX_CHARS = 48;

export function newConversation(nowISO: string, id: string): KuromiConversation {
	return {
		id,
		title: UNTITLED_CONVERSATION,
		createdAt: nowISO,
		updatedAt: nowISO,
		turns: []
	};
}

export function appendToConversation(
	c: KuromiConversation,
	turn: KuromiConversationTurn,
	nowISO: string
): KuromiConversation {
	const clamped: KuromiConversationTurn = {
		role: turn.role,
		content:
			turn.content.length > MAX_TURN_CHARS ? turn.content.slice(0, MAX_TURN_CHARS) : turn.content
	};

	let turns = [...c.turns, clamped];
	if (turns.length > MAX_TURNS_PER_CONVERSATION) {
		turns = turns.slice(turns.length - MAX_TURNS_PER_CONVERSATION);
	}

	return { ...c, turns, updatedAt: nowISO };
}

export function deriveTitle(firstUserMessage: string): string {
	const collapsed = firstUserMessage.replace(/\s+/g, ' ').trim();
	if (collapsed === '') return UNTITLED_CONVERSATION;
	if (collapsed.length <= TITLE_MAX_CHARS) return collapsed;

	const slice = collapsed.slice(0, TITLE_MAX_CHARS);
	const lastSpace = slice.lastIndexOf(' ');
	const truncated = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
	return `${truncated}...`;
}

export function upsertConversation(
	list: KuromiConversation[],
	conversation: KuromiConversation
): KuromiConversation[] {
	const idx = list.findIndex((c) => c.id === conversation.id);
	if (idx === -1) return [...list, conversation];
	return list.map((c, i) => (i === idx ? conversation : c));
}

export function sortByRecency(list: KuromiConversation[]): KuromiConversation[] {
	return [...list].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

function byteLength(list: KuromiConversation[]): number {
	return JSON.stringify(list).length;
}

function mostRecentId(list: KuromiConversation[]): string | null {
	if (list.length === 0) return null;
	let idx = 0;
	for (let i = 1; i < list.length; i++) {
		if (Date.parse(list[i].updatedAt) >= Date.parse(list[idx].updatedAt)) idx = i;
	}
	return list[idx].id;
}

function dropOldestExcept(
	list: KuromiConversation[],
	keepId: string | null,
	count: number
): KuromiConversation[] {
	if (count <= 0) return list;
	const candidates = list.filter((c) => c.id !== keepId);
	const byAge = [...candidates].sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt));
	const dropIds = new Set(byAge.slice(0, Math.min(count, byAge.length)).map((c) => c.id));
	return list.filter((c) => !dropIds.has(c.id));
}

export function capConversations(list: KuromiConversation[]): KuromiConversation[] {
	if (list.length === 0) return [];

	const keepId = mostRecentId(list);

	let working = list;
	if (working.length > MAX_CONVERSATIONS) {
		working = dropOldestExcept(working, keepId, working.length - MAX_CONVERSATIONS);
	}

	while (working.length > 1 && byteLength(working) > MAX_CONVERSATIONS_BYTES) {
		working = dropOldestExcept(working, keepId, 1);
	}

	if (working.length === 1 && byteLength(working) > MAX_CONVERSATIONS_BYTES) {
		const only = working[0];
		let turns = only.turns;
		while (turns.length > 1 && byteLength([{ ...only, turns }]) > MAX_CONVERSATIONS_BYTES) {
			turns = turns.slice(1);
		}
		working = [{ ...only, turns }];
	}

	return working;
}
