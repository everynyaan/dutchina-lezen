// ============================================================
// DUTCHINA MISSION ENGINE
// Pure functions for weekly mission management.
//
// - selectWeeklyMissions: pick 3 random missions from the pool
// - updateMissionProgress: increment progress for relevant missions
// - ensureWeeklyMissions: reset the set on ISO-week rollover
//
// This module does NOT mutate state. It does NOT fire toasts
// or award LP. The caller does that.
// ============================================================

import { MISSION_POOL, MISSION_MAP, type MissionProgressSource } from './MISSIONS';
import type { MissionState } from '$lib/state/schema';
import { getISOWeekKey } from '$lib/time/week';

const MISSIONS_PER_WEEK = 3;

// ============================================================
// WEEK HELPERS
// ============================================================

export function shouldResetWeeklyMissions(lastMissionWeek: string | null): boolean {
	if (!lastMissionWeek) return true;
	// lastMissionWeek already holds a week key (e.g. "2026-W28"), stamped
	// by ensureWeeklyMissions. Compare it directly. A stale pre-migration
	// day string (e.g. "2026-06-05") never equals a week key, so it
	// correctly forces one reset on the first post-update load.
	return lastMissionWeek !== getISOWeekKey();
}

// ============================================================
// WEEKLY SELECTION
// Seeded by the ISO-week key so the same week always produces
// the same missions (deterministic for Domi, no surprises on
// page reload). Uses a simple hash-based PRNG.
// ============================================================

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash + char) | 0;
	}
	return Math.abs(hash);
}

/**
 * Select MISSIONS_PER_WEEK missions from the pool, seeded by the
 * ISO-week key. Avoids selecting conflicting missions from the same
 * source with different targets (e.g., match_45 and match_80).
 */
export function selectWeeklyMissions(weekKey?: string): MissionState[] {
	const seed = hashString(weekKey ?? getISOWeekKey());
	const pool = [...MISSION_POOL];

	// Fisher-Yates shuffle with seeded RNG
	let rng = seed;
	for (let i = pool.length - 1; i > 0; i--) {
		rng = (rng * 1103515245 + 12345) & 0x7fffffff;
		const j = rng % (i + 1);
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}

	// Pick missions, avoiding duplicate sources
	const selected: MissionState[] = [];
	const usedSources = new Set<MissionProgressSource>();

	for (const mission of pool) {
		if (selected.length >= MISSIONS_PER_WEEK) break;
		if (usedSources.has(mission.source)) continue;

		usedSources.add(mission.source);
		selected.push({
			id: mission.id,
			progress: 0,
			completed: false
		});
	}

	return selected;
}

// ============================================================
// PROGRESS UPDATES
// Called after each LP event. Returns updated mission array
// and list of newly completed mission IDs.
// ============================================================

export interface MissionUpdateResult {
	missions: MissionState[];
	newlyCompleted: string[];
}

/**
 * Update progress for all active missions that match the given source.
 * For 'match_streak', the value is the current streak (not a delta).
 * For all other sources, the value is added to progress.
 */
export function updateMissionProgress(
	missions: MissionState[],
	source: MissionProgressSource,
	value: number
): MissionUpdateResult {
	const newlyCompleted: string[] = [];

	const updated = missions.map((m) => {
		if (m.completed) return m;

		const def = MISSION_MAP[m.id];
		if (!def || def.source !== source) return m;

		let newProgress: number;
		if (source === 'match_streak') {
			// Streak is a high-water mark, not cumulative
			newProgress = Math.max(m.progress, value);
		} else {
			newProgress = m.progress + value;
		}

		const nowComplete = newProgress >= def.target;
		if (nowComplete) {
			newlyCompleted.push(m.id);
		}

		return {
			...m,
			progress: Math.min(newProgress, def.target),
			completed: nowComplete
		};
	});

	return { missions: updated, newlyCompleted };
}

/**
 * Ensure weekly missions are current. If the ISO week has changed,
 * generate a new set. Otherwise return the existing ones. The
 * returned `date` holds the current ISO-week key (stored back into
 * state.missions.lastMissionDate).
 */
export function ensureWeeklyMissions(
	currentMissions: MissionState[],
	lastMissionWeek: string | null
): { missions: MissionState[]; date: string; wasReset: boolean } {
	const thisWeek = getISOWeekKey();

	if (!shouldResetWeeklyMissions(lastMissionWeek)) {
		return { missions: currentMissions, date: lastMissionWeek!, wasReset: false };
	}

	return {
		missions: selectWeeklyMissions(thisWeek),
		date: thisWeek,
		wasReset: true
	};
}
