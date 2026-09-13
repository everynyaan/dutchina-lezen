/** Count + unit label helpers (singular at 1, plural otherwise). */

export function dutchCount(n: number, singular: string, plural: string): string {
	return `${n} ${n === 1 ? singular : plural}`;
}

/** e.g. "1 week" / "0 weeks" / "2 weeks" / "11 weeks" */
export function weekLabel(n: number): string {
	return dutchCount(n, 'week', 'weeks');
}

/** e.g. "1 word pair" / "12 word pairs" */
export function woordparenLabel(n: number): string {
	return dutchCount(n, 'word pair', 'word pairs');
}

/** e.g. "1 card" / "3 cards" */
export function kaartenLabel(n: number): string {
	return dutchCount(n, 'card', 'cards');
}

/** e.g. "1 task open" / "5 tasks open" */
export function takenOpenLabel(n: number): string {
	return dutchCount(n, 'task open', 'tasks open');
}
