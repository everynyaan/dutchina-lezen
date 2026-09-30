import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';

/**
 * resolve() cannot take the full Pathname union: one more route makes the
 * conditional argument list fail to match. Callers that already hold a
 * Pathname use this instead of resolve(variable).
 */
export function resolvePath(path: Pathname): string {
	return (resolve as (path: Pathname) => string)(path);
}
