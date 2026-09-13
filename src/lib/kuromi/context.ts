// ============================================================
// KUROMI CONTEXT PACKET
// Builds the small per-message context sent with each chat turn.
// Reads rusty words via the existing freshSource adapter only.
// ============================================================

import type { AdjustmentEntry, CurrentState, KuromiPage } from '$lib/state/schema';
import { loadRustyWords } from '$lib/fresh/freshSource';
import { currentGateFromState, getWordsUpToGate } from '$lib/gates/gates';
import { lockWhenLines } from '$lib/gates/home';
import { kuromiMasterySnapshot, masteryInputFromState } from '$lib/gates/progress';
import type {
	KuromiActivitySignal,
	KuromiContextPacket,
	KuromiShelfPageSummary,
	KuromiShelfSummary
} from './types';

/** Direct pathname-prefix → screen label (longest-prefix match, excluding '/'). */
const SCREEN_PREFIXES: ReadonlyArray<readonly [string, string]> = [
	['/eval', "today's 5-minute eval (feeds trap cards)"],
	['/mock', 'a 110-minute mock exam'],
	['/gate', 'the gate hub'],
	['/match', 'the match game'],
	['/cards', 'trap-sticker move drills'],
	['/stories', 'the story shelf'],
	['/grammar', 'the pattern handbook'],
	['/vocab', 'the vocabulary lists'],
	['/quiz', "today's quiz"],
	['/read', "today's reading"],
	['/lezen', 'the Reading exam'],
	['/luisteren', 'the Listening exam'],
	['/daily', 'the weekly homework'],
	['/boss', 'a boss fight'],
	['/reviews', 'the writing reviews']
];

/** Packet detail clamp: executor writes up to 400; 5×400 is too large for every chat turn. */
const ADJUSTMENT_DETAIL_MAX = 200;
const RECENT_ADJUSTMENTS_MAX = 5;
const ACTIVITY_WINDOW_DAYS = 14;

/**
 * Shelf summary clamps -- keep the per-page footprint small since this rides
 * along on every chat turn as part of the outbound system message and shares
 * the same ABSOLUTE_MAX_OUTBOUND_CHARS budget as the persona prompt and the
 * client's own messages. title/labels are intentionally tighter than the
 * write-time caps in pageSchema.ts (PAGE_TITLE_MAX=80, MAX_LABELS_PER_PAGE=6) --
 * this copy is for recognition/addressing a page by name, not display; the
 * real title and full label set are untouched on the page itself. id is kept
 * at full length uncapped -- she needs it verbatim for update_page/archive_page,
 * which is the entire point of this field.
 */
const SHELF_PAGES_MAX = 15;
const SHELF_TITLE_MAX = 60;
const SHELF_LABELS_MAX = 3;
const SHELF_LABEL_CHARS_MAX = 24;

/**
 * Map a route pathname to a short human screen label.
 * '/' is exact-match only. Story chapters (3+ segments under stories)
 * take priority over the generic /stories shelf label.
 */
export function screenLabelForPath(pathname: string): string {
	if (pathname === '/') return 'home';

	// stories/<story>/<chapter>… → chapter takes priority over shelf
	const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
	if (segments[0] === 'stories' && segments.length >= 3) {
		return 'a story chapter';
	}

	let bestLabel: string | null = null;
	let bestLen = -1;
	for (const [prefix, label] of SCREEN_PREFIXES) {
		if ((pathname === prefix || pathname.startsWith(prefix + '/')) && prefix.length > bestLen) {
			bestLabel = label;
			bestLen = prefix.length;
		}
	}

	return bestLabel ?? 'somewhere in the app';
}

/**
 * Has she actually practiced, ever? A fresh profile mints practiceDays = 1 on
 * page load, and the unskippable weekly-bonus modal then awards +5 LP for
 * simply showing up — so neither practiceDays nor totalLp can distinguish a
 * real streak from an empty one. Only a durable record of completed work can.
 *
 * Deliberately fails safe: a surface missing from this list makes Kuromi
 * under-report a streak she could have mentioned, which is harmless. The
 * failure this guards against is the opposite — claiming a streak that is not
 * there.
 */
function hasPracticeEvidence(state: CurrentState): boolean {
	return (
		Object.keys(state.cardReviews).length > 0 ||
		state.conversation.readChapters.length > 0 ||
		Object.keys(state.conversation.questionResults).length > 0 ||
		Object.keys(state.lezen.questionResults).length > 0 ||
		Object.keys(state.luisteren.questionResults).length > 0 ||
		Object.keys(state.reviews.submissions).length > 0 ||
		state.boss.attempts > 0 ||
		state.dailyQuiz.completed ||
		state.dailyRead.done ||
		state.readingFork.eval.completed ||
		state.readingFork.trapCards.length > 0
	);
}

function buildRecentActivity(state: CurrentState): string[] {
	const activity: string[] = [];
	if (state.practiceDays > 0 && hasPracticeEvidence(state)) {
		activity.push(`${state.practiceDays}-week streak`);
	}
	if (state.readingFork.eval.completed) {
		activity.push("showed up for today's eval");
	}
	if (state.dailyQuiz && state.dailyQuiz.completed) {
		activity.push("finished today's quiz");
	}
	if (state.dailyRead && state.dailyRead.done) {
		activity.push("did today's reading");
	}
	return activity.slice(0, 3);
}

function buildLastQuiz(state: CurrentState): KuromiContextPacket['lastQuiz'] {
	const { completed, results, questionIds } = state.dailyQuiz;
	const total = questionIds.length;
	if (!completed || total === 0) {
		return { completed, score: null };
	}
	const correct = Object.values(results).filter(Boolean).length;
	return { completed, score: { correct, total } };
}

/**
 * Newest 5 adjustments, newest-first.
 * Host storage is oldest-first (`push` in StewardHost.appendAdjustment); we reverse here.
 */
function buildRecentAdjustments(
	adjustments: AdjustmentEntry[]
): KuromiContextPacket['recentAdjustments'] {
	const newestFirst = [...adjustments].reverse().slice(0, RECENT_ADJUSTMENTS_MAX);
	return newestFirst.map((entry) => ({
		tool: entry.tool,
		outcome: entry.outcome,
		// Re-clamp below executor's 400: 5×400 would bloat every chat system message.
		detail:
			entry.detail.length <= ADJUSTMENT_DETAIL_MAX
				? entry.detail
				: entry.detail.slice(0, ADJUSTMENT_DETAIL_MAX),
		timestamp: entry.timestamp,
		undone: entry.undone
	}));
}

/** Days between two YYYY-MM-DD strings (today − date). Null if invalid / future / >14. */
function daysAgoWithinWindow(date: string | null, today: string): number | null {
	if (date === null) return null;
	const parseYmd = (s: string): number | null => {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
		if (!m) return null;
		return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	};
	const then = parseYmd(date);
	const now = parseYmd(today);
	if (then === null || now === null) return null;
	const diff = Math.round((now - then) / 86_400_000);
	if (diff < 0 || diff > ACTIVITY_WINDOW_DAYS) return null;
	return diff;
}

/**
 * Bounded "most recent occurrence ≤14 days" summary — NOT a day-by-day 14-day log
 * (schema has none). Fails safe: absent / stale / un-evidenced → daysAgo null.
 */
function buildActivityShape(state: CurrentState, today: string): KuromiActivitySignal[] {
	const practiceDate = hasPracticeEvidence(state) ? state.lastSessionDate : null;
	const quizDate = state.dailyQuiz.completed ? state.dailyQuiz.date : null;
	const readDate = state.dailyRead.done ? state.dailyRead.date : null;

	return [
		{ label: 'practice', daysAgo: daysAgoWithinWindow(practiceDate, today) },
		{ label: 'daily quiz', daysAgo: daysAgoWithinWindow(quizDate, today) },
		{ label: 'daily read', daysAgo: daysAgoWithinWindow(readDate, today) },
		{ label: 'flashcards', daysAgo: daysAgoWithinWindow(state.cards.lastReviewDate, today) },
		{ label: 'match game', daysAgo: daysAgoWithinWindow(state.match.lastMatchDate, today) }
	];
}

/** Missing / non-boolean archived counts as active (fail toward the cap, matches pageStore.ts). */
function isActivePage(page: KuromiPage): boolean {
	return (page as { archived?: unknown }).archived !== true;
}

function clamp(s: string, max: number): string {
	return s.length <= max ? s : s.slice(0, max);
}

function summarizePage(page: KuromiPage): KuromiShelfPageSummary {
	return {
		id: page.id,
		title: clamp(page.title, SHELF_TITLE_MAX),
		labels: page.labels
			.slice(0, SHELF_LABELS_MAX)
			.map((label) => clamp(label, SHELF_LABEL_CHARS_MAX)),
		blockCount: page.blocks.length
	};
}

/**
 * Compact shelf summary: active pages only, newest-updated first, capped at
 * SHELF_PAGES_MAX. No block contents, no quip -- id/title/labels/blockCount only.
 * archivedCount is a bare count so Kuromi knows archived pages exist without
 * carrying them. pages is always an array (possibly empty), never omitted.
 */
function buildShelfSummary(pages: KuromiPage[]): KuromiShelfSummary {
	const active = pages.filter(isActivePage);
	const archivedCount = pages.length - active.length;
	const newestFirst = [...active].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	return {
		pages: newestFirst.slice(0, SHELF_PAGES_MAX).map(summarizePage),
		archivedCount
	};
}

/**
 * Build the wire-contract context packet for a chat request.
 * Call with the current route pathname, live game state, and today's
 * YYYY-MM-DD (for the rusty-words adapter and activityShape daysAgo).
 */
export async function buildKuromiContext(
	pathname: string,
	state: CurrentState,
	today: string
): Promise<KuromiContextPacket> {
	const currentGate = currentGateFromState(state);
	const entries = await loadRustyWords(today, 5, getWordsUpToGate(currentGate));
	const rustyWords = entries.map((w) => w.dutch);
	const lockWhen = lockWhenLines(currentGate);
	const mastery = kuromiMasterySnapshot(
		currentGate,
		state.gates.mastered,
		masteryInputFromState(state),
		lockWhen[0]?.when ?? null
	);

	return {
		route: pathname,
		screen: screenLabelForPath(pathname),
		currentGate,
		lockWhen,
		mastery,
		rustyWords,
		recentActivity: buildRecentActivity(state),
		config: state.appConfig,
		streak: { weeks: state.practiceDays, mode: state.appConfig.streaks },
		lastQuiz: buildLastQuiz(state),
		readingFork: {
			showUpStreak: state.readingFork.showUpStreak,
			evalCompleted: state.readingFork.eval.completed,
			trapStickers: state.readingFork.trapStickers,
			dueCards: state.readingFork.trapCards.filter((c) => c.dueDate <= today).length,
			lastMock: state.readingFork.lastMockScore,
			cesuur: 22
		},
		recentAdjustments: buildRecentAdjustments(state.adjustments),
		activityShape: buildActivityShape(state, today),
		shelf: buildShelfSummary(state.pages)
	};
}
