// ============================================================
// KUROMI VISIBILITY FLAG
// Module-level Svelte 5 rune. Callers (SummonButton, boss route)
// decide when to hide/show; this file is only the flag + setter.
// .svelte.ts so $state is valid outside a component.
// ============================================================

let visible = $state(true);
let chatNonce = $state(0);

/** Set whether the summon button (and by extension chat access) is shown. */
export function setKuromiVisible(v: boolean): void {
	visible = v;
}

/** Ask the shell to open chat. Hint and Ask Kuromi call this. */
export function requestKuromiChat(): void {
	chatNonce += 1;
}

export function kuromiChatNonce(): number {
	return chatNonce;
}

/**
 * Read the current visibility flag. Call inside a reactive context
 * ($derived / template) so consumers update when the flag changes.
 */
export function isKuromiVisible(): boolean {
	return visible;
}
