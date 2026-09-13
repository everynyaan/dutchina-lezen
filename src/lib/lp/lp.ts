// ============================================================
// DUTCHINA LP STORE
// Pure functions for the LP economy. No Svelte dependency.
// Takes current state values + an event, returns the new values
// and side-effect flags (tierChanged, rankChanged, sfx to play).
//
// The caller is responsible for:
//   - Applying the result to the reactive state
//   - Persisting the state
//   - Firing SFX based on the result's sfxEvents list
//   - Checking daily bonus eligibility before emitting daily_first_session
//
// This module does NOT enforce daily bonus uniqueness.
// It does NOT read or write state. It is dumb arithmetic.
// ============================================================

import type { SfxEvent } from '$lib/sound/sfx';

// ============================================================
// LP EVENT TYPES
// Each event corresponds to a user action that earns or loses LP.
// ============================================================

export type LpEventType =
	| 'match_correct'
	| 'match_wrong'
	| 'card_rated'
	| 'mission_complete'
	| 'boss_win'
	| 'boss_loss'
	| 'daily_first_session'
	| 'conversation_correct'
	| 'luisteren_correct'
	| 'lezen_correct'
	| 'review_verdict'
	| 'daily_correct'
	| 'quiz_complete'
	| 'quiz_perfect'
	| 'kuromi_award';

export type CardRating = 'again' | 'hard' | 'good' | 'easy';

export interface LpEventMatchCorrect {
	type: 'match_correct';
	streakPipsLit: number; // 0 to 5
}

export interface LpEventMatchWrong {
	type: 'match_wrong';
}

export interface LpEventCardRated {
	type: 'card_rated';
	rating: CardRating;
}

export interface LpEventMissionComplete {
	type: 'mission_complete';
}

export interface LpEventBossWin {
	type: 'boss_win';
	tier: number; // current tier at time of win (1-4)
}

export interface LpEventBossLoss {
	type: 'boss_loss';
}

export interface LpEventDailyFirstSession {
	type: 'daily_first_session';
}

export interface LpEventConversationCorrect {
	type: 'conversation_correct';
}

export interface LpEventLuisterenCorrect {
	type: 'luisteren_correct';
}

export interface LpEventLezenCorrect {
	type: 'lezen_correct';
}

export type ReviewVerdict = 'pass' | 'close' | 'fail';

export interface LpEventReviewVerdict {
	type: 'review_verdict';
	verdict: ReviewVerdict;
}

export interface LpEventDailyCorrect {
	type: 'daily_correct';
}

export interface LpEventQuizComplete {
	type: 'quiz_complete';
}

export interface LpEventQuizPerfect {
	type: 'quiz_perfect';
}

export interface LpEventKuromiAward {
	type: 'kuromi_award';
	amount: number;
}

export type LpEvent =
	| LpEventMatchCorrect
	| LpEventMatchWrong
	| LpEventCardRated
	| LpEventMissionComplete
	| LpEventBossWin
	| LpEventBossLoss
	| LpEventDailyFirstSession
	| LpEventConversationCorrect
	| LpEventLuisterenCorrect
	| LpEventLezenCorrect
	| LpEventReviewVerdict
	| LpEventDailyCorrect
	| LpEventQuizComplete
	| LpEventQuizPerfect
	| LpEventKuromiAward;

// ============================================================
// LP RESULT
// Returned by applyEvent. The caller applies these values.
// ============================================================

export interface LpResult {
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	delta: number; // signed LP change (can be negative for boss_loss)
	tierChanged: boolean;
	rankChanged: boolean;
	gateBlocked: boolean; // true if boss gate prevented a rank-up
	sfxEvents: SfxEvent[];
}

// ============================================================
// INPUT SHAPE
// The caller passes current rank/tier/lp/totalLp.
// ============================================================

export interface LpState {
	rank: number;
	tier: number;
	lp: number;
	totalLp: number;
	bossCleared: boolean; // true if current rank's boss has been beaten. Default true for backwards compat.
}

// ============================================================
// CONSTANTS
// From section 6 of the Project Instructions.
// ============================================================

const LP_PER_TIER = 100;
const TIERS_PER_RANK = 4;
const MAX_RANK = 7;
const BOSS_LOSS_PENALTY = 25;

const CARD_RATING_LP: Record<CardRating, number> = {
	again: 0,
	hard: 1,
	good: 3,
	easy: 3
};

// ============================================================
// CORE FUNCTION
// ============================================================

export function applyEvent(state: LpState, event: LpEvent): LpResult {
	const result: LpResult = {
		rank: state.rank,
		tier: state.tier,
		lp: state.lp,
		totalLp: state.totalLp,
		delta: 0,
		tierChanged: false,
		rankChanged: false,
		gateBlocked: false,
		sfxEvents: []
	};

	// Default bossCleared to true for backwards compatibility.
	// Only the layout passes the real value from state.boss.rankDefeated.
	const bossCleared = state.bossCleared ?? true;

	// Calculate delta
	const delta = calculateDelta(event);
	result.delta = delta;

	if (delta > 0) {
		// Positive LP
		result.totalLp += delta;
		result.lp += delta;

		// Handle tier/rank overflow
		while (result.lp >= LP_PER_TIER) {
			// B1 cap: rank 7 tier 4 is the ceiling
			if (result.rank >= MAX_RANK && result.tier >= TIERS_PER_RANK) {
				result.lp = LP_PER_TIER - 1; // cap at 99
				break;
			}

			result.lp -= LP_PER_TIER;
			result.tier += 1;
			result.tierChanged = true;

			if (result.tier > TIERS_PER_RANK) {
				// Boss gate: block rank-up if current rank's boss not beaten.
				// Domi must beat the boss to advance ranks.
				if (!bossCleared) {
					result.tier = TIERS_PER_RANK;
					result.lp = LP_PER_TIER - 1;
					result.tierChanged = false; // didn't actually change tier
					result.gateBlocked = true;
					break;
				}

				if (result.rank < MAX_RANK) {
					result.tier = 1;
					result.rank += 1;
					result.rankChanged = true;
				} else {
					// At max rank, cap at tier 4
					result.tier = TIERS_PER_RANK;
					result.lp = LP_PER_TIER - 1;
					break;
				}
			}
		}

		// SFX for positive deltas
		result.sfxEvents.push('lp_gain');
		if (result.rankChanged) {
			result.sfxEvents.push('rank_up');
		} else if (result.tierChanged) {
			result.sfxEvents.push('tier_up');
		}
	} else if (delta < 0) {
		// Negative LP (boss_loss, match_wrong)
		result.lp += delta; // delta is negative

		// Floor: cannot drop below (currentRank, tier 1, lp 0)
		// Tier can drop, rank cannot.
		if (result.lp < 0) {
			// Convert negative lp to tier drops within the same rank
			while (result.lp < 0 && result.tier > 1) {
				result.tier -= 1;
				result.lp += LP_PER_TIER;
				result.tierChanged = true;
			}
			// If still negative after dropping to tier 1, clamp to 0
			if (result.lp < 0) {
				result.lp = 0;
			}
		}

		if (event.type === 'boss_loss') {
			result.sfxEvents.push('boss_loss');
		}
		// match_wrong: no SFX from LP system (match page plays 'wrong' directly)
	}
	// delta === 0 (card_rated 'again'): no sfx, no state change

	return result;
}

// ============================================================
// DELTA CALCULATION
// ============================================================

function calculateDelta(event: LpEvent): number {
	switch (event.type) {
		case 'match_correct': {
			const base = 2;
			const streakBonus = Math.min(Math.max(event.streakPipsLit, 0), 5);
			return base + streakBonus;
		}
		case 'match_wrong':
			return -2;
		case 'card_rated':
			return CARD_RATING_LP[event.rating];
		case 'mission_complete':
			return 15;
		case 'boss_win': {
			const base = 40;
			const tierBonus = (Math.max(event.tier, 1) - 1) * 10;
			return base + tierBonus;
		}
		case 'boss_loss':
			return -BOSS_LOSS_PENALTY;
		case 'daily_first_session':
			return 5;
		case 'conversation_correct':
			return 2;
		case 'luisteren_correct':
			return 2;
		case 'lezen_correct':
			return 2;
		case 'review_verdict': {
			// Pass: +15, Close: +8, Fail: 0
			if (event.verdict === 'pass') return 15;
			if (event.verdict === 'close') return 8;
			return 0; // fail
		}
		case 'daily_correct':
			return 2;
		case 'quiz_complete':
			return 3;
		case 'quiz_perfect':
			return 2;
		case 'kuromi_award':
			// This clamp is defense-in-depth ONLY -- the real weekly cap is
			// enforced by the executor (a later unit), which reads steward.awards
			// before proposing an award at all. 72 is one weekly homework
			// session's approximate LP value (~36 questions x 2 LP each), chosen
			// as a generous per-event ceiling that still cannot be repeatedly
			// abused to skip the executor's real cap.
			return Math.min(72, Math.max(0, Math.floor(event.amount)));
	}
}
