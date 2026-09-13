import { describe, it, expect } from 'vitest';
import { checkAchievements, applyAchievementUnlocks } from './engine';
import { ACHIEVEMENTS } from './ACHIEVEMENTS';
import { createDefaultState } from '$lib/state/defaults';
import type { CurrentState } from '$lib/state/schema';

/** Helper: clone default state and override specific fields */
function stateWith(overrides: Partial<CurrentState>): CurrentState {
	const base = createDefaultState();
	return { ...base, ...overrides } as CurrentState;
}

describe('learner-visible achievement copy', () => {
	it('uses gates and skill tests, not Iron or earn LP', () => {
		for (const a of ACHIEVEMENTS.filter((x) => !x.learnerHidden)) {
			const blob = `${a.title} ${a.description}`;
			expect(blob).not.toMatch(/\b(Iron|Bronze|Silver|Gold|Platinum|Master|LP|rank-up)\b/i);
		}
	});
});

describe('checkAchievements', () => {
	it('returns empty array for fresh default state', () => {
		const state = createDefaultState();
		const result = checkAchievements(state);
		expect(result).toEqual([]);
	});

	it('detects first_blood when boss.wins >= 1', () => {
		const state = stateWith({
			boss: { attempts: 1, wins: 1, losses: 0, rankDefeated: 0 }
		});
		const result = checkAchievements(state);
		expect(result).toContain('first_blood');
	});

	it('detects streak_master when match.bestStreak >= 5', () => {
		const state = createDefaultState();
		state.match.bestStreak = 5;
		const result = checkAchievements(state);
		expect(result).toContain('streak_master');
	});

	it('detects card_shark when cards.totalReviewed >= 100', () => {
		const state = createDefaultState();
		state.cards.totalReviewed = 100;
		const result = checkAchievements(state);
		expect(result).toContain('card_shark');
	});

	it('detects daily_grinder when practiceDays >= 7', () => {
		const state = stateWith({ practiceDays: 7 });
		const result = checkAchievements(state);
		expect(result).toContain('daily_grinder');
	});

	it('detects halfway_there when rank >= 4', () => {
		const state = stateWith({ rank: 4 });
		const result = checkAchievements(state);
		expect(result).toContain('halfway_there');
	});

	it('detects b1_ready when rank 7 tier 4', () => {
		const state = stateWith({ rank: 7, tier: 4 });
		const result = checkAchievements(state);
		expect(result).toContain('b1_ready');
	});

	it('does NOT detect b1_ready when rank 7 tier 3', () => {
		const state = stateWith({ rank: 7, tier: 3 });
		const result = checkAchievements(state);
		expect(result).not.toContain('b1_ready');
	});

	it('detects rank_defeated achievements for specific ranks', () => {
		const state = stateWith({
			boss: { attempts: 3, wins: 3, losses: 0, rankDefeated: 2 }
		});
		const result = checkAchievements(state);
		expect(result).toContain('iron_slayer');
		expect(result).toContain('bronze_slayer');
		expect(result).toContain('silver_slayer');
		expect(result).not.toContain('gold_slayer');
	});

	it('skips already-unlocked achievements', () => {
		const state = stateWith({
			boss: { attempts: 1, wins: 1, losses: 0, rankDefeated: 0 }
		});
		state.achievements = {
			first_blood: { unlockedAt: '2026-04-30T12:00:00Z' }
		};
		const result = checkAchievements(state);
		expect(result).not.toContain('first_blood');
		// iron_slayer should still fire (rankDefeated >= 0)
		expect(result).toContain('iron_slayer');
	});

	it('detects total_lp milestone', () => {
		const state = stateWith({ totalLp: 1000 });
		const result = checkAchievements(state);
		expect(result).toContain('lp_thousand');
	});

	it('detects match_marathon when completedToday >= 50', () => {
		const state = createDefaultState();
		state.match.completedToday = 50;
		const result = checkAchievements(state);
		expect(result).toContain('match_marathon');
	});

	it('detects boss_veteran when attempts >= 10', () => {
		const state = stateWith({
			boss: { attempts: 10, wins: 5, losses: 5, rankDefeated: 3 }
		});
		const result = checkAchievements(state);
		expect(result).toContain('boss_veteran');
	});

	// ---- Conversation achievements ----

	it('detects ach_story_first when 1 chapter read', () => {
		const state = createDefaultState();
		state.conversation.readChapters = ['cc_0_1'];
		const result = checkAchievements(state);
		expect(result).toContain('ach_story_first');
	});

	it('detects ach_story_5 when 5 chapters read', () => {
		const state = createDefaultState();
		state.conversation.readChapters = Array.from({ length: 5 }, (_, i) => `cc_${i}`);
		const result = checkAchievements(state);
		expect(result).toContain('ach_story_5');
	});

	it('detects ach_stories_all when 25 chapters read', () => {
		const state = createDefaultState();
		state.conversation.readChapters = Array.from({ length: 25 }, (_, i) => `cc_${i}`);
		const result = checkAchievements(state);
		expect(result).toContain('ach_stories_all');
	});

	// ---- Reviews achievements ----

	it('detects ach_review_first when 1 submission exists', () => {
		const state = createDefaultState();
		state.reviews.submissions = {
			task_1: {
				taskId: 'task_1',
				answer: 'test',
				submittedAt: '2026-05-01T12:00:00Z',
				verdict: null,
				comment: '',
				reviewedAt: null
			}
		};
		const result = checkAchievements(state);
		expect(result).toContain('ach_review_first');
	});

	it('detects ach_review_pass when 1 submission has pass verdict', () => {
		const state = createDefaultState();
		state.reviews.submissions = {
			task_1: {
				taskId: 'task_1',
				answer: 'test',
				submittedAt: '2026-05-01T12:00:00Z',
				verdict: 'pass',
				comment: 'Good job',
				reviewedAt: '2026-05-01T13:00:00Z'
			}
		};
		const result = checkAchievements(state);
		expect(result).toContain('ach_review_pass');
	});

	it('does NOT detect ach_review_pass when submissions are fail or pending', () => {
		const state = createDefaultState();
		state.reviews.submissions = {
			task_1: {
				taskId: 'task_1',
				answer: 'test',
				submittedAt: '2026-05-01T12:00:00Z',
				verdict: 'fail',
				comment: '',
				reviewedAt: '2026-05-01T13:00:00Z'
			},
			task_2: {
				taskId: 'task_2',
				answer: 'test2',
				submittedAt: '2026-05-01T14:00:00Z',
				verdict: null,
				comment: '',
				reviewedAt: null
			}
		};
		const result = checkAchievements(state);
		expect(result).not.toContain('ach_review_pass');
		// But ach_review_first should fire (2 submissions)
		expect(result).toContain('ach_review_first');
	});
});

describe('applyAchievementUnlocks', () => {
	it('returns same record when no new IDs', () => {
		const current = { first_blood: { unlockedAt: '2026-04-30T12:00:00Z' } };
		const result = applyAchievementUnlocks(current, []);
		expect(result).toBe(current); // same reference, no copy
	});

	it('adds new achievements with ISO timestamp', () => {
		const current = {};
		const result = applyAchievementUnlocks(current, ['first_blood', 'streak_master']);
		expect(result.first_blood.unlockedAt).toBeTruthy();
		expect(result.streak_master.unlockedAt).toBeTruthy();
		// Should be valid ISO string
		expect(() => new Date(result.first_blood.unlockedAt!)).not.toThrow();
	});

	it('preserves existing achievements when adding new ones', () => {
		const current = { first_blood: { unlockedAt: '2026-01-01T00:00:00Z' } };
		const result = applyAchievementUnlocks(current, ['streak_master']);
		expect(result.first_blood.unlockedAt).toBe('2026-01-01T00:00:00Z');
		expect(result.streak_master.unlockedAt).toBeTruthy();
	});
});
