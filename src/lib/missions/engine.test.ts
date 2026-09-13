import { describe, it, expect } from 'vitest';
import { selectWeeklyMissions, updateMissionProgress, ensureWeeklyMissions } from './engine';
import type { MissionState } from '$lib/state/schema';
import { MISSION_MAP, MISSION_POOL } from './MISSIONS';
import { getISOWeekKey } from '$lib/time/week';

describe('learner-visible mission copy', () => {
	it('does not say earn LP, Iron, or rank-up', () => {
		for (const m of MISSION_POOL) {
			expect(m.description).not.toMatch(/\b(Iron|earn LP|rank-up|B1 chip)\b/i);
		}
	});
});

describe('selectWeeklyMissions', () => {
	it('returns exactly 3 missions', () => {
		const missions = selectWeeklyMissions('2026-W18');
		expect(missions).toHaveLength(3);
	});

	it('returns missions with valid IDs from the pool', () => {
		const missions = selectWeeklyMissions('2026-W18');
		for (const m of missions) {
			expect(MISSION_MAP[m.id]).toBeDefined();
		}
	});

	it('returns missions with 0 progress and not completed', () => {
		const missions = selectWeeklyMissions('2026-W18');
		for (const m of missions) {
			expect(m.progress).toBe(0);
			expect(m.completed).toBe(false);
		}
	});

	it('is deterministic: same week produces same missions', () => {
		const a = selectWeeklyMissions('2026-W18');
		const b = selectWeeklyMissions('2026-W18');
		expect(a).toEqual(b);
	});

	it('different weeks produce a valid set each', () => {
		const a = selectWeeklyMissions('2026-W18');
		const b = selectWeeklyMissions('2026-W19');
		// Could theoretically be the same set, but both must be valid.
		expect(a).toHaveLength(3);
		expect(b).toHaveLength(3);
	});

	it('does not select two missions with the same source', () => {
		// Test across a range of week keys
		for (let week = 1; week <= 30; week++) {
			const weekKey = `2026-W${String(week).padStart(2, '0')}`;
			const missions = selectWeeklyMissions(weekKey);
			const sources = missions.map((m) => MISSION_MAP[m.id].source);
			const uniqueSources = new Set(sources);
			expect(uniqueSources.size).toBe(sources.length);
		}
	});
});

describe('updateMissionProgress', () => {
	it('increments progress for matching source', () => {
		const missions: MissionState[] = [
			{ id: 'match_15', progress: 5, completed: false },
			{ id: 'cards_10', progress: 0, completed: false },
			{ id: 'boss_1', progress: 0, completed: false }
		];

		const result = updateMissionProgress(missions, 'match_questions', 1);
		const matchMission = result.missions.find((m) => m.id === 'match_15')!;
		expect(matchMission.progress).toBe(6);
		expect(matchMission.completed).toBe(false);
		expect(result.newlyCompleted).toEqual([]);
	});

	it('marks mission complete when target reached', () => {
		// match_15's weekly target is 45.
		const missions: MissionState[] = [
			{ id: 'match_15', progress: 44, completed: false },
			{ id: 'cards_10', progress: 0, completed: false },
			{ id: 'boss_1', progress: 0, completed: false }
		];

		const result = updateMissionProgress(missions, 'match_questions', 1);
		const matchMission = result.missions.find((m) => m.id === 'match_15')!;
		expect(matchMission.progress).toBe(45);
		expect(matchMission.completed).toBe(true);
		expect(result.newlyCompleted).toEqual(['match_15']);
	});

	it('caps progress at target', () => {
		const missions: MissionState[] = [{ id: 'match_15', progress: 44, completed: false }];

		const result = updateMissionProgress(missions, 'match_questions', 5);
		expect(result.missions[0].progress).toBe(45);
	});

	it('does not update already completed missions', () => {
		const missions: MissionState[] = [{ id: 'match_15', progress: 15, completed: true }];

		const result = updateMissionProgress(missions, 'match_questions', 1);
		expect(result.missions[0].progress).toBe(15);
		expect(result.newlyCompleted).toEqual([]);
	});

	it('handles match_streak as high-water mark', () => {
		const missions: MissionState[] = [{ id: 'streak_3', progress: 2, completed: false }];

		// Streak increases to 3
		let result = updateMissionProgress(missions, 'match_streak', 3);
		expect(result.missions[0].progress).toBe(3);
		expect(result.missions[0].completed).toBe(true);

		// If streak were to drop (shouldn't happen with high-water, but test it)
		const missions2: MissionState[] = [{ id: 'streak_3', progress: 2, completed: false }];
		result = updateMissionProgress(missions2, 'match_streak', 1);
		expect(result.missions[0].progress).toBe(2); // stays at previous high
	});

	it('does not affect missions with different source', () => {
		const missions: MissionState[] = [{ id: 'cards_10', progress: 3, completed: false }];

		const result = updateMissionProgress(missions, 'match_questions', 5);
		expect(result.missions[0].progress).toBe(3);
	});
});

describe('ensureWeeklyMissions', () => {
	it('resets missions when lastMissionWeek is null', () => {
		const result = ensureWeeklyMissions([], null);
		expect(result.wasReset).toBe(true);
		expect(result.missions).toHaveLength(3);
		expect(result.date).toBe(getISOWeekKey());
	});

	it('resets missions when the stored week is a stale pre-migration day string', () => {
		const existing: MissionState[] = [{ id: 'match_15', progress: 10, completed: false }];

		// A pre-migration value like "2026-06-05" is not a week key and
		// must force a reset on the first weekly-cadence load.
		const result = ensureWeeklyMissions(existing, '2026-06-05');
		expect(result.wasReset).toBe(true);
		expect(result.missions).toHaveLength(3);
		for (const m of result.missions) {
			expect(m.progress).toBe(0);
		}
	});

	it('keeps existing missions when the stored week matches this ISO week', () => {
		const thisWeek = getISOWeekKey();
		const existing: MissionState[] = [
			{ id: 'match_15', progress: 10, completed: false },
			{ id: 'cards_10', progress: 5, completed: false },
			{ id: 'boss_1', progress: 0, completed: false }
		];

		const result = ensureWeeklyMissions(existing, thisWeek);
		expect(result.wasReset).toBe(false);
		expect(result.missions).toBe(existing); // same reference
	});
});
