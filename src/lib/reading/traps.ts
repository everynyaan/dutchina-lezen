import { trapForPick } from './annotations';
import { addDays } from './bank';
import { paraphraseById, practiceById } from './practice';
import type { ReadingForkState, TrapCardV2, TrapKind } from './types';

export function trapOf(itemId: string, picked: string): TrapKind | null {
	const official = trapForPick(itemId, picked);
	if (official) return official.trap;
	const practice = practiceById(itemId)?.distractors[picked];
	if (practice) return practice.trap;
	const drill = paraphraseById(itemId)?.distractors[picked];
	if (drill) return drill.trap;
	return null;
}

/** One card per trap. A miss resets the streak and makes the card due today. */
export function recordMiss(
	fork: ReadingForkState,
	itemId: string,
	picked: string,
	today: string
): ReadingForkState {
	const trap = trapOf(itemId, picked);
	if (!trap) return fork;
	const existing = fork.traps.find((card) => card.trap === trap);
	const next: TrapCardV2 = existing
		? {
				...existing,
				lastItemId: itemId,
				seenItemIds: existing.seenItemIds.includes(itemId)
					? existing.seenItemIds
					: [...existing.seenItemIds, itemId],
				dueDate: today,
				streak: 0,
				misses: existing.misses + 1,
				tamedAt: null
			}
		: {
				trap,
				lastItemId: itemId,
				seenItemIds: [itemId],
				dueDate: today,
				streak: 0,
				misses: 1,
				createdAt: today,
				tamedAt: null
			};
	const traps = existing
		? fork.traps.map((card) => (card.trap === trap ? next : card))
		: [...fork.traps, next];
	return { ...fork, traps };
}

/** Correct: due in 1, then 3, then 7 days. The third in a row tames the card. Wrong: due tomorrow, not learned. */
export function gradeTrap(card: TrapCardV2, correct: boolean, today: string): TrapCardV2 {
	if (!correct) {
		return { ...card, streak: 0, dueDate: addDays(today, 1), tamedAt: null };
	}
	const streak = card.streak + 1;
	const dueIn = streak >= 3 ? 7 : streak === 2 ? 3 : 1;
	return {
		...card,
		streak,
		dueDate: addDays(today, dueIn),
		tamedAt: streak >= 3 ? (card.tamedAt ?? today) : card.tamedAt
	};
}

/** Cards whose due date is today or earlier. Oldest due date first. */
export function dueTraps(fork: ReadingForkState, today: string): TrapCardV2[] {
	return fork.traps
		.filter((card) => card.dueDate <= today)
		.slice()
		.sort(
			(a, b) =>
				a.dueDate.localeCompare(b.dueDate) || b.misses - a.misses || a.trap.localeCompare(b.trap)
		);
}
