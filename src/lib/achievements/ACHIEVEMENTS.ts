// ============================================================
// DUTCHINA ACHIEVEMENT DEFINITIONS
// Static achievement data. Each achievement has an ID, display
// info, and a condition that maps to state fields.
//
// Condition types:
//   'boss_wins'                - boss.wins >= threshold
//   'best_streak'              - match.bestStreak >= threshold
//   'total_reviewed'           - cards.totalReviewed >= threshold
//   'rank_defeated'            - boss.rankDefeated >= threshold (specific rank boss beaten)
//   'practice_days'            - practiceDays >= threshold (practiceDays now counts weeks)
//   'rank_reached'             - rank >= threshold
//   'rank_tier'                - rank === thresholdRank AND tier >= thresholdTier (final B1 check)
//   'total_lp'                 - totalLp >= threshold
//   'boss_attempts'            - boss.attempts >= threshold
//   'match_today'              - match.completedToday >= threshold (session-based, checked live)
//   'chapters_read'            - conversation.readChapters.length >= threshold
//   'reviews_submitted'        - Object.keys(reviews.submissions).length >= threshold
//   'reviews_passed'           - count of submissions with verdict === 'pass' >= threshold
// ============================================================

export type AchievementCondition =
	| { type: 'boss_wins'; threshold: number }
	| { type: 'best_streak'; threshold: number }
	| { type: 'total_reviewed'; threshold: number }
	| { type: 'rank_defeated'; threshold: number }
	| { type: 'practice_days'; threshold: number }
	| { type: 'rank_reached'; threshold: number }
	| { type: 'rank_tier'; rank: number; tier: number }
	| { type: 'total_lp'; threshold: number }
	| { type: 'boss_attempts'; threshold: number }
	| { type: 'match_today'; threshold: number }
	| { type: 'chapters_read'; threshold: number }
	| { type: 'reviews_submitted'; threshold: number }
	| { type: 'reviews_passed'; threshold: number };

export interface AchievementDef {
	id: string;
	title: string;
	description: string;
	icon: string; // lucide icon name
	condition: AchievementCondition;
	/** Hide LP/rank learner copy. Engine still evaluates the condition. */
	learnerHidden?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
	// ---- Boss milestones ----
	{
		id: 'first_blood',
		title: 'Skill-test debut',
		description: 'Win a skill test — just for fun',
		icon: 'Swords',
		condition: { type: 'boss_wins', threshold: 1 }
	},
	{
		id: 'iron_slayer',
		title: 'First skill test',
		description: 'Pass a skill test in First words',
		icon: 'Wrench',
		condition: { type: 'rank_defeated', threshold: 0 }
	},
	{
		id: 'bronze_slayer',
		title: 'Second skill test',
		description: 'Pass another skill test in First words',
		icon: 'Shield',
		condition: { type: 'rank_defeated', threshold: 1 }
	},
	{
		id: 'silver_slayer',
		title: 'Everyday test',
		description: 'Pass a skill test in Everyday Dutch',
		icon: 'Award',
		condition: { type: 'rank_defeated', threshold: 2 }
	},
	{
		id: 'gold_slayer',
		title: 'Everyday rematch',
		description: 'Pass another skill test in Everyday Dutch',
		icon: 'Trophy',
		condition: { type: 'rank_defeated', threshold: 3 }
	},
	{
		id: 'platinum_slayer',
		title: 'Real-sentence test',
		description: 'Pass a skill test in Real sentences',
		icon: 'Crown',
		condition: { type: 'rank_defeated', threshold: 4 }
	},
	{
		id: 'emerald_slayer',
		title: 'Real-sentence rematch',
		description: 'Pass another skill test in Real sentences',
		icon: 'Gem',
		condition: { type: 'rank_defeated', threshold: 5 }
	},
	{
		id: 'diamond_slayer',
		title: 'B1 skill test',
		description: 'Pass a skill test in the B1 room',
		icon: 'Diamond',
		condition: { type: 'rank_defeated', threshold: 6 }
	},
	{
		id: 'master_slayer',
		title: 'B1 rematch',
		description: 'Pass another skill test in the B1 room',
		icon: 'Sparkles',
		condition: { type: 'rank_defeated', threshold: 7 }
	},
	{
		id: 'boss_veteran',
		title: 'Skill-test regular',
		description: 'Try 10 skill tests — just for fun',
		icon: 'Target',
		condition: { type: 'boss_attempts', threshold: 10 }
	},

	// ---- Streak milestones ----
	{
		id: 'streak_master',
		title: 'Hot streak',
		description: 'Hit a 5-pip streak in Match',
		icon: 'Flame',
		condition: { type: 'best_streak', threshold: 5 }
	},

	// ---- Card milestones ----
	{
		id: 'card_shark',
		title: 'Card Shark',
		description: 'Review 100 cards lifetime',
		icon: 'CreditCard',
		condition: { type: 'total_reviewed', threshold: 100 }
	},
	{
		id: 'card_collector',
		title: 'Card Collector',
		description: 'Review 500 cards lifetime',
		icon: 'Library',
		condition: { type: 'total_reviewed', threshold: 500 }
	},

	// ---- Weekly streak milestones ----
	// IDs kept stable so previously-earned records are never orphaned;
	// thresholds now count consecutive ISO weeks (practiceDays == weeks).
	{
		id: 'daily_grinder',
		title: 'Monthly Regular',
		description: 'Practice 4 weeks in a row',
		icon: 'CalendarDays',
		condition: { type: 'practice_days', threshold: 4 }
	},
	{
		id: 'two_week_warrior',
		title: 'Season Warrior',
		description: 'Practice 12 weeks in a row',
		icon: 'CalendarCheck',
		condition: { type: 'practice_days', threshold: 12 }
	},
	{
		id: 'monthly_master',
		title: 'Half-Year Hero',
		description: 'Practice 26 weeks in a row',
		icon: 'CalendarHeart',
		condition: { type: 'practice_days', threshold: 26 }
	},

	// ---- Rank milestones ----
	{
		id: 'halfway_there',
		title: 'Everyday Dutch',
		description: 'Reach the Everyday Dutch room',
		icon: 'Milestone',
		condition: { type: 'rank_reached', threshold: 4 },
		learnerHidden: true
	},
	{
		id: 'b1_ready',
		title: 'B1 room',
		description: 'Open the B1 room',
		icon: 'GraduationCap',
		condition: { type: 'rank_tier', rank: 7, tier: 4 },
		learnerHidden: true
	},

	// ---- LP milestones (hidden — engines still count) ----
	{
		id: 'lp_thousand',
		title: 'Four Digits',
		description: 'A long stretch of practice',
		icon: 'TrendingUp',
		condition: { type: 'total_lp', threshold: 1000 },
		learnerHidden: true
	},
	{
		id: 'lp_grinder',
		title: 'Long haul',
		description: 'A very long stretch of practice',
		icon: 'Zap',
		condition: { type: 'total_lp', threshold: 2000 },
		learnerHidden: true
	},

	// ---- Match session ----
	{
		id: 'match_marathon',
		title: 'Match Marathon',
		description: 'Complete 50 matches in a single day',
		icon: 'Repeat',
		condition: { type: 'match_today', threshold: 50 }
	},

	// ---- Conversation milestones ----
	{
		id: 'ach_story_first',
		title: 'Page Turner',
		description: 'Complete your first story chapter',
		icon: 'BookOpenCheck',
		condition: { type: 'chapters_read', threshold: 1 }
	},
	{
		id: 'ach_story_5',
		title: 'Bookworm',
		description: 'Complete 5 story chapters',
		icon: 'Library',
		condition: { type: 'chapters_read', threshold: 5 }
	},
	{
		id: 'ach_stories_all',
		title: 'Library Complete',
		description: 'Read all 25 story chapters',
		icon: 'BookHeart',
		condition: { type: 'chapters_read', threshold: 25 }
	},

	// ---- Reviews milestones ----
	{
		id: 'ach_review_first',
		title: 'First Draft',
		description: 'Submit your first writing exercise',
		icon: 'PenLine',
		condition: { type: 'reviews_submitted', threshold: 1 }
	},
	{
		id: 'ach_review_10',
		title: 'Prolific Writer',
		description: 'Submit 10 writing exercises',
		icon: 'PenTool',
		condition: { type: 'reviews_submitted', threshold: 10 }
	},
	{
		id: 'ach_review_pass',
		title: 'Nailed It',
		description: 'Receive a Pass verdict on a writing exercise',
		icon: 'BadgeCheck',
		condition: { type: 'reviews_passed', threshold: 1 }
	}
];

/** Lookup map for O(1) access by ID */
export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
	ACHIEVEMENTS.map((a) => [a.id, a])
);
