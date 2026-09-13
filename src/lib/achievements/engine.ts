// ============================================================
// DUTCHINA ACHIEVEMENT ENGINE
// Pure functions. Takes current state, returns list of newly
// unlocked achievement IDs. The caller persists and toasts.
//
// This module does NOT mutate state. It does NOT read from
// localStorage or any store. It is dumb condition checking.
// ============================================================

import { ACHIEVEMENTS, type AchievementDef } from './ACHIEVEMENTS';
import type { CurrentState } from '$lib/state/schema';

/**
 * Check all achievements against current state.
 * Returns IDs of achievements that are newly unlocked
 * (condition met AND not already in state.achievements).
 */
export function checkAchievements(state: CurrentState): string[] {
	const newlyUnlocked: string[] = [];

	for (const achievement of ACHIEVEMENTS) {
		// Skip if already unlocked
		if (state.achievements[achievement.id]?.unlockedAt) {
			continue;
		}

		if (isConditionMet(achievement, state)) {
			newlyUnlocked.push(achievement.id);
		}
	}

	return newlyUnlocked;
}

/**
 * Check if a single achievement's condition is met.
 */
function isConditionMet(achievement: AchievementDef, state: CurrentState): boolean {
	const cond = achievement.condition;

	switch (cond.type) {
		case 'boss_wins':
			return state.boss.wins >= cond.threshold;
		case 'best_streak':
			return state.match.bestStreak >= cond.threshold;
		case 'total_reviewed':
			return state.cards.totalReviewed >= cond.threshold;
		case 'rank_defeated':
			return state.boss.rankDefeated >= cond.threshold;
		case 'practice_days':
			return state.practiceDays >= cond.threshold;
		case 'rank_reached':
			return state.rank >= cond.threshold;
		case 'rank_tier':
			return state.rank > cond.rank || (state.rank === cond.rank && state.tier >= cond.tier);
		case 'total_lp':
			return state.totalLp >= cond.threshold;
		case 'boss_attempts':
			return state.boss.attempts >= cond.threshold;
		case 'match_today':
			return state.match.completedToday >= cond.threshold;
		case 'chapters_read':
			return state.conversation.readChapters.length >= cond.threshold;
		case 'reviews_submitted':
			return Object.keys(state.reviews.submissions).length >= cond.threshold;
		case 'reviews_passed':
			return (
				Object.values(state.reviews.submissions).filter((s) => s.verdict === 'pass').length >=
				cond.threshold
			);
	}
}

/**
 * Apply newly unlocked achievements to state.
 * Returns the updated achievements record (caller assigns it to state).
 */
export function applyAchievementUnlocks(
	current: Record<string, { unlockedAt: string | null }>,
	newIds: string[]
): Record<string, { unlockedAt: string | null }> {
	if (newIds.length === 0) return current;

	const now = new Date().toISOString();
	const updated = { ...current };
	for (const id of newIds) {
		updated[id] = { unlockedAt: now };
	}
	return updated;
}
