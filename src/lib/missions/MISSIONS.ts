// ============================================================
// DUTCHINA MISSION DEFINITIONS
// Pool of possible weekly missions. 3 are selected per ISO week.
//
// Each mission tracks progress against a target. Progress
// updates happen in the LP event handler alongside achievement
// checks. When progress >= target, mission auto-completes.
// Targets are sized for a week of sporadic use (reachable in
// 1-2 binge sittings, not a daily grind).
//
// Progress source types:
//   'match_questions'    - incremented per Match question answered (correct or not)
//   'cards_reviewed'     - incremented per card review
//   'match_streak'       - check current streak against target (not cumulative)
//   'boss_attempt'       - incremented per boss fight started
//   'lp_earned_today'    - tracks LP earned; accumulates over the week on the mission
// ============================================================

export type MissionProgressSource =
	| 'match_questions'
	| 'cards_reviewed'
	| 'match_streak'
	| 'boss_attempt'
	| 'lp_earned_today'
	| 'conversation_correct'
	| 'luisteren_correct'
	| 'lezen_correct'
	| 'review_submitted'
	| 'daily_complete';

export interface MissionDef {
	id: string;
	description: string;
	target: number;
	source: MissionProgressSource;
}

// NOTE: mission IDs are kept stable across the daily->weekly change so
// no persisted mission ID is orphaned. Only targets and copy scale up.
export const MISSION_POOL: MissionDef[] = [
	{
		id: 'match_15',
		description: 'finish 45 match questions this week',
		target: 45,
		source: 'match_questions'
	},
	{
		id: 'match_30',
		description: 'finish 80 match questions this week',
		target: 80,
		source: 'match_questions'
	},
	{
		id: 'cards_10',
		description: 'review 30 cards this week',
		target: 30,
		source: 'cards_reviewed'
	},
	{
		id: 'cards_20',
		description: 'review 60 cards this week',
		target: 60,
		source: 'cards_reviewed'
	},
	{
		id: 'streak_3',
		description: 'hit a streak of 3 in match',
		target: 3,
		source: 'match_streak'
	},
	{
		id: 'streak_5',
		description: 'hit a streak of 5 in match',
		target: 5,
		source: 'match_streak'
	},
	{
		id: 'boss_1',
		description: 'try 2 skill tests this week',
		target: 2,
		source: 'boss_attempt'
	},
	{
		id: 'lp_30',
		description: 'put in a solid week of practice',
		target: 150,
		source: 'lp_earned_today'
	},
	{
		id: 'lp_60',
		description: 'put in a long week of practice',
		target: 300,
		source: 'lp_earned_today'
	},
	{
		id: 'conversation_5',
		description: 'answer 15 story questions correctly this week',
		target: 15,
		source: 'conversation_correct'
	},
	{
		id: 'review_1',
		description: 'submit a writing exercise this week',
		target: 1,
		source: 'review_submitted'
	},
	{
		id: 'luisteren_5',
		description: 'answer 15 listening questions correctly this week',
		target: 15,
		source: 'luisteren_correct'
	},
	{
		id: 'lezen_5',
		description: 'answer 15 reading questions correctly this week',
		target: 15,
		source: 'lezen_correct'
	},
	{
		id: 'daily_done',
		description: 'finish the week set',
		target: 1,
		source: 'daily_complete'
	}
];

/** Lookup map for O(1) access by ID */
export const MISSION_MAP: Record<string, MissionDef> = Object.fromEntries(
	MISSION_POOL.map((m) => [m.id, m])
);
