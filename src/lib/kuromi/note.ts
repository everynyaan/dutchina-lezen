/** Outside schema v25. The readiness screen reads this key. It is not a readingFork field. */
export const COACH_NOTE_KEY = 'dutchina_coach_note';
const NOTE_MAX = 280;

export function readCoachNote(): string {
	if (typeof localStorage === 'undefined') return '';
	return localStorage.getItem(COACH_NOTE_KEY) ?? '';
}

export function writeCoachNote(text: string): string {
	const next = text.trim().slice(0, NOTE_MAX);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(COACH_NOTE_KEY, next);
	}
	return next;
}
