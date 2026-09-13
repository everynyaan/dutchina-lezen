// ============================================================
// DAILY PATH — the glow
//
// Pure priority function per V3_DESIGN section 8 ("Home — the
// daily path (the glow)"). Determines which single element on
// home should carry the ~1.2s pulse. First match wins; never
// random, never persisted. Phase 5 promotes this order to a
// steward config key.
// ============================================================

import { DEFAULT_GLOW_ORDER, type GlowRule } from '$lib/state/schema';

export type GlowTarget = 'weekset' | 'quiz' | 'tekst' | 'klaar';

export interface DailyPathInput {
	quizDoneToday: boolean;
	tekstDoneToday: boolean;
	weeksetUnfinished: boolean;
	daysRemainingInWeek: number;
}

const RULE_TARGET: Record<GlowRule, GlowTarget> = {
	'weekset-urgent': 'weekset',
	quiz: 'quiz',
	tekst: 'tekst',
	weekset: 'weekset'
};

function ruleMatches(rule: GlowRule, input: DailyPathInput): boolean {
	switch (rule) {
		case 'weekset-urgent':
			return input.weeksetUnfinished && input.daysRemainingInWeek <= 2;
		case 'quiz':
			return !input.quizDoneToday;
		case 'tekst':
			return !input.tekstDoneToday;
		case 'weekset':
			return input.weeksetUnfinished;
	}
}

/**
 * Ordered glow priority, first match wins. Default order reproduces
 * canon's five-branch priority:
 *   1. weekset unfinished AND <=2 days remain in the week -> weekset
 *   2. daily quiz not done today -> quiz
 *   3. daily tekst not read today -> tekst
 *   4. weekset unfinished -> weekset
 *   5. otherwise -> klaar (all clear, no glow)
 *
 * An empty `order` array is legal and means nothing glows (returns 'klaar').
 */
export function resolveGlowTarget(
	input: DailyPathInput,
	order: readonly GlowRule[] = DEFAULT_GLOW_ORDER
): GlowTarget {
	for (const rule of order) {
		if (ruleMatches(rule, input)) return RULE_TARGET[rule];
	}
	return 'klaar';
}

/**
 * Days left in the ISO week (Mon-Sun), counting today.
 * Monday => 7, Sunday => 1.
 *
 * Computed on the same UTC/Monday-start basis as
 * src/lib/time/week.ts's getISOWeekKey() - do not invent a
 * second week definition.
 */
export function daysRemainingInWeek(date: Date): number {
	const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6, UTC basis
	return 7 - dayNum;
}
