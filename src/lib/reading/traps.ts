import type { TrapType } from './types';
import { TRAP_TYPES } from './types';

export function classifyTrap(question: string): TrapType {
	const q = question.toLowerCase();
	if (
		/verwijs|verwijst|waar slaat|wie of wat is ['‘]?(hij|zij|die|dat|deze|dit|het)\b/.test(q) ||
		/\b(hij|zij|die|deze)\b.+\b(wie|wat)\b/.test(q)
	) {
		return 'verwijzing';
	}
	if (
		/doel van deze tekst|waar gaat .+ over|hoofd(onderwerp|gedachte)|waarvoor is deze tekst bedoeld|voor wie is deze tekst/.test(
			q
		)
	) {
		return 'hoofdonderwerp';
	}
	if (/conclusie|wat kun je .+ afleiden|wat blijkt uit|wat is de strekking/.test(q)) {
		return 'conclusie';
	}
	if (
		/tekst komt|deze tekst komt|wat voor (organisatie|tekst|website)|soort tekst|bron van/.test(q)
	) {
		return 'bron-doel';
	}
	return 'bijna-goed';
}

export function isTrapType(value: string): value is TrapType {
	return (TRAP_TYPES as readonly string[]).includes(value);
}

/** First ~280 chars of a passage, used as the card snippet — not a translation. */
export function passageSnippet(text: string): string {
	const compact = text.replace(/\s+/g, ' ').trim();
	if (compact.length <= 280) return compact;
	return compact.slice(0, 277).trimEnd() + '…';
}
