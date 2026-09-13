import { describe, it, expect } from 'vitest';
import { applyEvent, type LpState } from '$lib/lp/lp';

function makeState(overrides: Partial<LpState> = {}): LpState {
	return {
		rank: 0,
		tier: 1,
		lp: 0,
		totalLp: 0,
		bossCleared: true, // default true for backwards compat in existing tests
		...overrides
	};
}

describe('LP store: match_correct', () => {
	it('+2 LP with 0 streak', () => {
		const result = applyEvent(makeState(), { type: 'match_correct', streakPipsLit: 0 });
		expect(result.delta).toBe(2);
		expect(result.lp).toBe(2);
		expect(result.totalLp).toBe(2);
	});

	it('+7 LP with 5 streak (max)', () => {
		const result = applyEvent(makeState(), { type: 'match_correct', streakPipsLit: 5 });
		expect(result.delta).toBe(7);
		expect(result.lp).toBe(7);
	});

	it('streak clamped to 5 even if higher value passed', () => {
		const result = applyEvent(makeState(), { type: 'match_correct', streakPipsLit: 10 });
		expect(result.delta).toBe(7); // 2 + 5 max
	});

	it('negative streak treated as 0', () => {
		const result = applyEvent(makeState(), { type: 'match_correct', streakPipsLit: -3 });
		expect(result.delta).toBe(2); // 2 + 0
	});
});

describe('LP store: card_rated', () => {
	it('again = 0 LP', () => {
		const result = applyEvent(makeState(), { type: 'card_rated', rating: 'again' });
		expect(result.delta).toBe(0);
		expect(result.lp).toBe(0);
	});

	it('hard = +1 LP', () => {
		const result = applyEvent(makeState(), { type: 'card_rated', rating: 'hard' });
		expect(result.delta).toBe(1);
	});

	it('good = +3 LP', () => {
		const result = applyEvent(makeState(), { type: 'card_rated', rating: 'good' });
		expect(result.delta).toBe(3);
	});

	it('easy = +3 LP', () => {
		const result = applyEvent(makeState(), { type: 'card_rated', rating: 'easy' });
		expect(result.delta).toBe(3);
	});
});

describe('LP store: mission_complete', () => {
	it('+15 LP', () => {
		const result = applyEvent(makeState(), { type: 'mission_complete' });
		expect(result.delta).toBe(15);
		expect(result.lp).toBe(15);
	});
});

describe('LP store: boss_win', () => {
	it('+40 LP at tier 1', () => {
		const result = applyEvent(makeState(), { type: 'boss_win', tier: 1 });
		expect(result.delta).toBe(40);
	});

	it('+50 LP at tier 2', () => {
		const result = applyEvent(makeState(), { type: 'boss_win', tier: 2 });
		expect(result.delta).toBe(50);
	});

	it('+60 LP at tier 3', () => {
		const result = applyEvent(makeState(), { type: 'boss_win', tier: 3 });
		expect(result.delta).toBe(60);
	});

	it('+70 LP at tier 4', () => {
		const result = applyEvent(makeState(), { type: 'boss_win', tier: 4 });
		expect(result.delta).toBe(70);
	});
});

describe('LP store: daily_first_session', () => {
	it('+5 LP', () => {
		const result = applyEvent(makeState(), { type: 'daily_first_session' });
		expect(result.delta).toBe(5);
		expect(result.lp).toBe(5);
	});
});

describe('LP store: conversation_correct', () => {
	it('+2 LP', () => {
		const result = applyEvent(makeState(), { type: 'conversation_correct' });
		expect(result.delta).toBe(2);
		expect(result.lp).toBe(2);
		expect(result.totalLp).toBe(2);
	});

	it('fires lp_gain sfx', () => {
		const result = applyEvent(makeState(), { type: 'conversation_correct' });
		expect(result.sfxEvents).toContain('lp_gain');
	});
});

describe('LP store: boss_loss', () => {
	it('-25 LP from rank 2 tier 3 lp 50: drops to lp 25, same tier', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 3, lp: 50 }), { type: 'boss_loss' });
		expect(result.rank).toBe(2);
		expect(result.tier).toBe(3);
		expect(result.lp).toBe(25);
		expect(result.tierChanged).toBe(false);
	});

	it('-25 LP from rank 2 tier 1 lp 10: drops to tier 1 lp 0 (floor)', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 1, lp: 10 }), { type: 'boss_loss' });
		expect(result.rank).toBe(2);
		expect(result.tier).toBe(1);
		expect(result.lp).toBe(0);
	});

	it('-25 LP from rank 2 tier 1 lp 0: stays at floor', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 1, lp: 0 }), { type: 'boss_loss' });
		expect(result.rank).toBe(2);
		expect(result.tier).toBe(1);
		expect(result.lp).toBe(0);
	});

	it('-25 LP from tier 2 lp 10: drops to tier 1 lp 85', () => {
		const result = applyEvent(makeState({ rank: 1, tier: 2, lp: 10 }), { type: 'boss_loss' });
		expect(result.rank).toBe(1);
		expect(result.tier).toBe(1);
		expect(result.lp).toBe(85);
		expect(result.tierChanged).toBe(true);
	});

	it('boss_loss never causes rank demotion', () => {
		// At rank 3 tier 1 lp 5, losing 25 should clamp to tier 1 lp 0
		const result = applyEvent(makeState({ rank: 3, tier: 1, lp: 5 }), { type: 'boss_loss' });
		expect(result.rank).toBe(3);
		expect(result.tier).toBe(1);
		expect(result.lp).toBe(0);
	});

	it('boss_loss does not decrement totalLp', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 3, lp: 50, totalLp: 1000 }), {
			type: 'boss_loss'
		});
		expect(result.totalLp).toBe(1000); // unchanged
	});
});

describe('LP store: tier transitions', () => {
	it('rank 0 tier 1 lp 95 + mission_complete(+15) = rank 0 tier 2 lp 10', () => {
		const result = applyEvent(makeState({ lp: 95 }), { type: 'mission_complete' });
		expect(result.rank).toBe(0);
		expect(result.tier).toBe(2);
		expect(result.lp).toBe(10);
		expect(result.tierChanged).toBe(true);
		expect(result.rankChanged).toBe(false);
	});
});

describe('LP store: rank transitions', () => {
	it('rank 0 tier 4 lp 95 + mission_complete(+15) = rank 1 tier 1 lp 10', () => {
		const result = applyEvent(makeState({ tier: 4, lp: 95 }), { type: 'mission_complete' });
		expect(result.rank).toBe(1);
		expect(result.tier).toBe(1);
		expect(result.lp).toBe(10);
		expect(result.tierChanged).toBe(true);
		expect(result.rankChanged).toBe(true);
	});
});

describe('LP store: B1 cap', () => {
	it('rank 7 tier 4 lp 99 + any positive event stays at 99', () => {
		const result = applyEvent(makeState({ rank: 7, tier: 4, lp: 99, totalLp: 3199 }), {
			type: 'match_correct',
			streakPipsLit: 0
		});
		expect(result.rank).toBe(7);
		expect(result.tier).toBe(4);
		expect(result.lp).toBe(99);
		// totalLp still increments (it's a lifetime counter)
		expect(result.totalLp).toBe(3201);
	});

	it('rank 7 tier 3 can still advance to tier 4', () => {
		const result = applyEvent(makeState({ rank: 7, tier: 3, lp: 95 }), {
			type: 'mission_complete'
		});
		expect(result.rank).toBe(7);
		expect(result.tier).toBe(4);
		expect(result.lp).toBe(10);
		expect(result.tierChanged).toBe(true);
		expect(result.rankChanged).toBe(false);
	});
});

describe('LP store: SFX events', () => {
	it('positive delta fires lp_gain', () => {
		const result = applyEvent(makeState(), { type: 'match_correct', streakPipsLit: 0 });
		expect(result.sfxEvents).toContain('lp_gain');
	});

	it('tier change fires tier_up (not rank_up)', () => {
		const result = applyEvent(makeState({ lp: 95 }), { type: 'mission_complete' });
		expect(result.sfxEvents).toContain('tier_up');
		expect(result.sfxEvents).not.toContain('rank_up');
	});

	it('rank change fires rank_up (not tier_up)', () => {
		const result = applyEvent(makeState({ tier: 4, lp: 95 }), { type: 'mission_complete' });
		expect(result.sfxEvents).toContain('rank_up');
		expect(result.sfxEvents).not.toContain('tier_up');
	});

	it('boss_loss fires boss_loss sfx', () => {
		const result = applyEvent(makeState({ rank: 1, tier: 2, lp: 50 }), { type: 'boss_loss' });
		expect(result.sfxEvents).toContain('boss_loss');
	});

	it('card_rated again fires no sfx', () => {
		const result = applyEvent(makeState(), { type: 'card_rated', rating: 'again' });
		expect(result.sfxEvents).toHaveLength(0);
	});
});

describe('LP store: boss gating', () => {
	it('bossCleared false + tier 4 overflow = capped at tier 4 lp 99, no rank-up', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 4, lp: 90, bossCleared: false }), {
			type: 'boss_win',
			tier: 4
		});
		expect(result.rank).toBe(2);
		expect(result.tier).toBe(4);
		expect(result.lp).toBe(99);
		expect(result.rankChanged).toBe(false);
	});

	it('bossCleared true + tier 4 overflow = rank-up proceeds normally', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 4, lp: 90, bossCleared: true }), {
			type: 'boss_win',
			tier: 4
		});
		expect(result.rank).toBe(3);
		expect(result.tier).toBe(1);
		expect(result.rankChanged).toBe(true);
	});

	it('bossCleared false + tier 1-3 overflow = tier-up proceeds normally', () => {
		const result = applyEvent(makeState({ rank: 2, tier: 2, lp: 90, bossCleared: false }), {
			type: 'mission_complete'
		});
		expect(result.rank).toBe(2);
		expect(result.tier).toBe(3);
		expect(result.lp).toBe(5);
		expect(result.tierChanged).toBe(true);
		expect(result.rankChanged).toBe(false);
	});

	it('bossCleared false + large LP at tier 4 still caps at 99', () => {
		const result = applyEvent(makeState({ rank: 0, tier: 4, lp: 50, bossCleared: false }), {
			type: 'boss_win',
			tier: 4
		});
		expect(result.rank).toBe(0);
		expect(result.tier).toBe(4);
		expect(result.lp).toBe(99);
		// totalLp still increments
		expect(result.totalLp).toBe(70);
	});

	it('bossCleared defaults to true when undefined (backwards compat)', () => {
		// Existing callers that do not pass bossCleared should still rank up
		const state = { rank: 0, tier: 4, lp: 95 } as LpState;
		const result = applyEvent(state, { type: 'mission_complete' });
		expect(result.rank).toBe(1);
		expect(result.rankChanged).toBe(true);
	});
});

describe('LP store: review_verdict', () => {
	it('pass awards +15 LP', () => {
		const result = applyEvent(makeState(), { type: 'review_verdict', verdict: 'pass' });
		expect(result.delta).toBe(15);
		expect(result.lp).toBe(15);
		expect(result.totalLp).toBe(15);
	});

	it('close awards +8 LP', () => {
		const result = applyEvent(makeState(), { type: 'review_verdict', verdict: 'close' });
		expect(result.delta).toBe(8);
		expect(result.lp).toBe(8);
		expect(result.totalLp).toBe(8);
	});

	it('fail awards 0 LP, no penalty', () => {
		const result = applyEvent(makeState({ lp: 50 }), { type: 'review_verdict', verdict: 'fail' });
		expect(result.delta).toBe(0);
		expect(result.lp).toBe(50);
		expect(result.totalLp).toBe(0);
	});
});

describe('LP store: quiz_complete', () => {
	it('delta is 3; fresh apply yields lp 3 and totalLp 3', () => {
		const result = applyEvent(makeState(), { type: 'quiz_complete' });
		expect(result.delta).toBe(3);
		expect(result.lp).toBe(3);
		expect(result.totalLp).toBe(3);
	});
});

describe('LP store: quiz_perfect', () => {
	it('delta is 2; fresh apply yields lp 2 and totalLp 2', () => {
		const result = applyEvent(makeState(), { type: 'quiz_perfect' });
		expect(result.delta).toBe(2);
		expect(result.lp).toBe(2);
		expect(result.totalLp).toBe(2);
	});
});

describe('LP store: quiz_complete + quiz_perfect accumulate', () => {
	it('applying both in sequence yields totalLp 5', () => {
		const first = applyEvent(makeState(), { type: 'quiz_complete' });
		const second = applyEvent(
			{
				rank: first.rank,
				tier: first.tier,
				lp: first.lp,
				totalLp: first.totalLp,
				bossCleared: true
			},
			{ type: 'quiz_perfect' }
		);
		expect(second.totalLp).toBe(5);
	});
});

describe('LP store: kuromi_award', () => {
	it('normal award (amount 10) applies as delta 10', () => {
		const result = applyEvent(makeState(), { type: 'kuromi_award', amount: 10 });
		expect(result.delta).toBe(10);
		expect(result.lp).toBe(10);
		expect(result.totalLp).toBe(10);
	});

	it('negative amount clamps to delta 0 (Kuromi cannot deduct LP)', () => {
		const result = applyEvent(makeState({ lp: 20, totalLp: 20 }), {
			type: 'kuromi_award',
			amount: -5
		});
		expect(result.delta).toBe(0);
		expect(result.lp).toBe(20);
		expect(result.totalLp).toBe(20);
	});

	it('over-cap amount (500) clamps to delta 72', () => {
		const result = applyEvent(makeState(), { type: 'kuromi_award', amount: 500 });
		expect(result.delta).toBe(72);
		expect(result.lp).toBe(72);
		expect(result.totalLp).toBe(72);
	});

	it('fractional amount floors (10.7 -> 10)', () => {
		const result = applyEvent(makeState(), { type: 'kuromi_award', amount: 10.7 });
		expect(result.delta).toBe(10);
		expect(result.lp).toBe(10);
		expect(result.totalLp).toBe(10);
	});
});
