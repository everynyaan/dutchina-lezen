import manifestJson from '../../../static/characters/manifest.json';

export type CharacterName = 'kuromi' | 'melody' | 'piano';

export interface CharacterEntry {
	file: string;
	static?: string;
	animated: boolean;
	contexts: string[];
}

interface CharacterManifest {
	kuromi: Record<string, CharacterEntry>;
	melody: Record<string, CharacterEntry>;
	piano: Record<string, CharacterEntry>;
	doodles: { files: string[] };
}

const manifest = manifestJson as CharacterManifest;

export const KUROMI_MOODS: readonly string[] = Object.keys(manifest.kuromi);

export const DOODLE_NAMES: readonly string[] = manifest.doodles.files;

// The manifest ships no static twin for Kuromi's animated moods, so reduced-motion
// users get the nearest still expression; pixel (Boss realm sprite) has no still
// analogue at all and falls back to the standard host pose - Step 2 owns the realm
// and may revisit.
export const KUROMI_STATIC_FALLBACK: Record<string, string> = {
	thanks: 'blush',
	hehe: 'mischief',
	excited: 'sing',
	defeated: 'cry',
	bounce: 'laugh',
	pixel: 'hero'
};

export function resolveCharacter(
	who: CharacterName,
	mood: string,
	wantAnimated: boolean
): { src: string; isAnimated: boolean } | null {
	const entries = manifest[who];
	if (!entries) return null;

	const entry = entries[mood];
	if (!entry) return null;

	if (wantAnimated && entry.animated) {
		return { src: `/characters/${entry.file}`, isAnimated: true };
	}

	if (entry.static) {
		return { src: `/characters/${entry.static}`, isAnimated: false };
	}

	if (!entry.animated) {
		return { src: `/characters/${entry.file}`, isAnimated: false };
	}

	// Animated-only entry with no static twin (Kuromi gif moods)
	const fallbackMood = KUROMI_STATIC_FALLBACK[mood];
	if (!fallbackMood) return null;
	return resolveCharacter('kuromi', fallbackMood, false);
}

const doodleSet = new Set(DOODLE_NAMES);

export function isDoodle(name: string): boolean {
	return doodleSet.has(name);
}

export function doodleUrl(name: string): string {
	return `/characters/doodles/${name}.svg`;
}
