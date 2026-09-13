/** Original Dutchina loops — not this reading fork. */

export const RETIRED_PREFIXES = [
	'/match',
	'/boss',
	'/luisteren',
	'/vocab',
	'/daily',
	'/quiz',
	'/stories',
	'/gate',
	'/reviews',
	'/read',
	'/conversation'
] as const;

export function isRetiredPath(pathname: string): boolean {
	const p = pathname.replace(/\/+$/, '') || '/';
	return RETIRED_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}
