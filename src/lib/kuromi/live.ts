/**
 * Live buttons stay hidden unless the layout sets this from PUBLIC_KUROMI_LIVE=1.
 * The flag is not read here: the public env module crashes component tests.
 */
let live = false;

export function configureKuromiLive(flag: string | undefined): void {
	live = flag === '1';
}

export function isKuromiLive(): boolean {
	return live;
}

/** Monday on the YYYY-MM-DD calendar date, UTC, so the label does not drift with the hour. */
export function isMondayDate(ymd: string): boolean {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
	if (!match) return false;
	const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return new Date(utc).getUTCDay() === 1;
}

export function showWeeklyMessage(today: string): boolean {
	return isKuromiLive() && isMondayDate(today);
}
