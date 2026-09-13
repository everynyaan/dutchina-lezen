// ============================================================
// KUROMI VISIBILITY FLAG
// Module-level Svelte 5 rune. Callers (SummonButton, boss route)
// decide when to hide/show; this file is only the flag + setter.
// .svelte.ts so $state is valid outside a component.
// ============================================================

let visible = $state(true);

/** Set whether the summon button (and by extension chat access) is shown. */
export function setKuromiVisible(v: boolean): void {
	visible = v;
}

/**
 * Read the current visibility flag. Call inside a reactive context
 * ($derived / template) so consumers update when the flag changes.
 */
export function isKuromiVisible(): boolean {
	return visible;
}
