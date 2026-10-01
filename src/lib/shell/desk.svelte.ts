/** Presentation-only. Home uses this to open the full type grid in the centre. */
let allTypes = $state(false);

export function allTypesOpen(): boolean {
	return allTypes;
}

export function setAllTypesOpen(open: boolean): void {
	allTypes = open;
}

let mockOpener: ((id: string) => void) | null = null;

export function registerMockOpener(fn: (id: string) => void): () => void {
	mockOpener = fn;
	return () => {
		if (mockOpener === fn) mockOpener = null;
	};
}

export function openMockResult(id: string): void {
	mockOpener?.(id);
}
