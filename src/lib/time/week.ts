// ============================================================
// ISO WEEK KEYS
//
// Shared cadence helper. The app converted from daily to weekly
// cadence (homework, missions, bonus, streak); every one of those
// gates compares an ISO-week key instead of a day string.
//
// Computed on a UTC basis to match the existing getTodayISO()
// convention (new Date().toISOString().slice(0, 10)) so a single
// day-boundary rule governs all cadence. Do NOT mix with the
// local-time getTodayDate() used by Match/Cards per-day counters —
// those stay daily and are out of scope for weekly cadence.
// ============================================================

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Return the ISO-8601 week key for a date, e.g. "2026-W28".
 * Weeks start Monday; week 1 is the week containing the first
 * Thursday of the year. Accepts a Date or a YYYY-MM-DD string;
 * defaults to now.
 */
export function getISOWeekKey(d: Date | string = new Date()): string {
	const src = typeof d === 'string' ? new Date(d) : d;
	// Work in UTC on a date-only basis.
	const date = new Date(Date.UTC(src.getUTCFullYear(), src.getUTCMonth(), src.getUTCDate()));
	// Shift to the Thursday of the current ISO week (Mon=0..Sun=6).
	const dayNum = (date.getUTCDay() + 6) % 7;
	date.setUTCDate(date.getUTCDate() - dayNum + 3);
	const isoYear = date.getUTCFullYear();
	// First Thursday of that ISO year.
	const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
	const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
	firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
	const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / MS_PER_WEEK);
	return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

/**
 * Whole ISO weeks between two dates, based on each date's ISO-week
 * Monday. Used by the streak gate to tell "next consecutive week"
 * (returns 1) from a longer gap (returns >= 2). Order-independent.
 */
export function weeksBetween(a: Date | string, b: Date | string): number {
	const mondayOf = (d: Date | string): number => {
		const src = typeof d === 'string' ? new Date(d) : d;
		const date = new Date(Date.UTC(src.getUTCFullYear(), src.getUTCMonth(), src.getUTCDate()));
		const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0
		date.setUTCDate(date.getUTCDate() - dayNum);
		return date.getTime();
	};
	return Math.round(Math.abs(mondayOf(a) - mondayOf(b)) / MS_PER_WEEK);
}
