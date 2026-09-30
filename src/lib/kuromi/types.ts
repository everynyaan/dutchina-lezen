import type { AdjustmentEntry, AppConfig, StreakMode } from '$lib/state/schema';

export type KuromiMode = 'chat' | 'drill';

/** One bounded "most recent within 14 days" activity signal. */
export interface KuromiActivitySignal {
	label: string; // e.g. 'practice', 'daily quiz', 'daily read', 'flashcards', 'match game'
	daysAgo: number | null; // null = no evidence within the last 14 days
}

/**
 * One active page, compacted for the context packet: enough for Kuromi to
 * address it by name/id in update_page and archive_page calls. No block
 * contents, no quip -- those would blow the outbound char budget with every
 * chat turn. title and labels are re-clamped defensively here, independent
 * of the write-time clamps in pageSchema.ts.
 */
export interface KuromiShelfPageSummary {
	id: string;
	title: string;
	labels: string[];
	blockCount: number;
}

/**
 * Compact shelf summary for the context packet. Active pages only, newest
 * updatedAt first, capped at SHELF_PAGES_MAX (context.ts) -- so Kuromi can
 * find a page by name without Domi supplying its id by hand. archivedCount
 * is a bare number so she knows archived pages exist without carrying them.
 * Always present (never omitted), even when pages is empty, so its absence
 * never reads as "unknown".
 */
export interface KuromiShelfSummary {
	pages: KuromiShelfPageSummary[];
	archivedCount: number;
}

export interface KuromiContextPacket {
	route: string; // pathname, e.g. '/lezen'
	screen: string; // human label, e.g. 'a lezen reading exam'
	/** Engine gate. She explains locks; she never writes this. */
	currentGate: 1 | 2 | 3 | 4;
	/** When-lines for rooms still locked. Read-only. */
	lockWhen: { gate: number; when: string }[];
	/**
	 * Current-gate mastery snapshot. Human pieces only — she explains what's
	 * left; she never writes currentGate from this.
	 */
	mastery: {
		gate: 1 | 2 | 3 | 4;
		percent: number;
		pieces: Array<{ key: 'A' | 'B' | 'C' | 'D'; done: boolean; human: string }>;
		nextUnlock: string | null;
	};
	rustyWords: string[]; // up to 5 Dutch words
	recentActivity: string[]; // up to 3 short strings
	/** Live app config, verbatim from state — so Kuromi does not re-toggle what is already set. */
	config: AppConfig;
	/** Weekly streak count + current streak mode. Named `weeks` so it is not misread as day-count. */
	streak: { weeks: number; mode: StreakMode };
	/** Today's daily quiz completion + score (score null when incomplete or empty). */
	lastQuiz: {
		completed: boolean;
		score: { correct: number; total: number } | null;
	};
	/** Reading-fork pulse. Published papers: pass line 24, target 25. */
	readingFork: {
		showUpStreak: number;
		evalCompleted: boolean;
		unseenMisses: number;
		lastMock: { correct: number; total: number; passed: boolean; year: number } | null;
		passLine: 24;
		target: 25;
		liveTotal: 36;
	};
	/** Newest 5 steward adjustments (tool/outcome/detail/timestamp/undone only — no payload). */
	recentAdjustments: Array<{
		tool: AdjustmentEntry['tool'];
		outcome: AdjustmentEntry['outcome'];
		detail: string;
		timestamp: string;
		undone: boolean;
	}>;
	/**
	 * NOT a true day-by-day 14-day activity log — the schema does not carry one.
	 * This is a bounded "most recent occurrence, capped at 14 days" summary of five
	 * scalar last-occurrence signals, chosen deliberately to fail safe (never claim
	 * activity that cannot be evidenced) rather than invent a shape the data does
	 * not support. A real 14-day day-by-day shape would need a new persisted per-day
	 * log plus a schema/migration bump.
	 */
	activityShape: KuromiActivitySignal[];
	/** Compact shelf summary so Kuromi can address her own pages by id/name -- see KuromiShelfSummary. */
	shelf: KuromiShelfSummary;
}

export interface KuromiTurn {
	role: 'user' | 'assistant';
	content: string;
}

export interface KuromiChatRequest {
	mode: 'chat';
	messages: KuromiTurn[];
	context: KuromiContextPacket;
}

/** Unfiltered tool call as returned by the Netlify kuromi function (hostile input). */
export interface KuromiToolCall {
	id: string;
	name: string;
	arguments: string;
}

export type StewardOutcome = 'applied' | 'capped' | 'rejected';

export interface StewardToolResult {
	id: string;
	outcome: StewardOutcome;
	detail: string;
}

export interface KuromiChatResponse {
	reply: string;
	/** Present on leg-1 when the model emitted tool calls. Treat as untrusted. */
	toolCalls?: KuromiToolCall[];
}

/**
 * Leg-2 request: client sends the tool calls that produced real results
 * (never dropped/fabricated names) plus matching 1:1 toolResults.
 */
export interface KuromiToolResultRequest {
	mode: 'chat';
	messages: KuromiTurn[];
	context: KuromiContextPacket;
	pendingToolCalls: KuromiToolCall[];
	toolResults: StewardToolResult[];
}

export type KuromiErrorCode =
	| 'unauthorized'
	| 'bad_request'
	| 'upstream'
	| 'invalid_shape'
	| 'not_configured'
	| 'timeout';

export interface KuromiErrorResponse {
	error: string;
	code: KuromiErrorCode;
}

/** Background chat job record stored in Netlify Blobs (`kuromi-chats`). */
export type KuromiChatJobStatus = 'pending' | 'ready' | 'error';

export interface KuromiChatJobRecord {
	status: KuromiChatJobStatus;
	createdAt: number;
	reply?: string;
	toolCalls?: KuromiToolCall[];
	code?: string;
	error?: string;
}

// Drill types are added by the hub lane -- do not define them here.
