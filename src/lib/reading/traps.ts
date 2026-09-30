import { trapForPick } from './annotations';
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
