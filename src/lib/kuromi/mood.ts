export const PERSONA_MOODS = [
	'talk',
	'mischief',
	'hmph',
	'grumpy',
	'pout',
	'wink',
	'blush',
	'love',
	'hearteyes',
	'sing',
	'question',
	'shocked',
	'eek',
	'scared',
	'cry',
	'laugh',
	'sleep',
	'magic',
	'hehe',
	'excited',
	'defeated',
	'thanks',
	'bounce'
] as const;

export type PersonaMood = (typeof PERSONA_MOODS)[number];

export const DEFAULT_MOOD: PersonaMood = 'talk';

/**
 * Namespaced sticker/react vocabulary (CA-12). [mood: ] stays Kuromi-only and
 * un-namespaced (PERSONA_MOODS above); [sticker: ]/[react: ] widen to all three
 * characters and must be namespaced `who/mood`, e.g. `melody/cheer`.
 *
 * Kuromi's sticker/react vocabulary reuses PERSONA_MOODS exactly -- kuromi/pixel
 * is deliberately excluded (Boss realm sprite only, never chat).
 *
 * Melody and Piano vocabularies mirror static/characters/manifest.json
 * (see src/lib/art/manifest.ts, out of this file's scope -- kept in sync by hand).
 */
export const MELODY_STICKER_MOODS = [
	'worried',
	'wink',
	'rose',
	'dizzy',
	'smile',
	'shy',
	'content',
	'juice',
	'serene',
	'question',
	'reading',
	'love',
	'giggle',
	'sorry',
	'cheer',
	'glasses',
	'idea',
	'hearteyes',
	'hood'
] as const;

export type MelodyStickerMood = (typeof MELODY_STICKER_MOODS)[number];

export const PIANO_STICKER_MOODS = [
	'dreamy',
	'excited',
	'notice',
	'juice',
	'peek',
	'hungry',
	'sleep'
] as const;

export type PianoStickerMood = (typeof PIANO_STICKER_MOODS)[number];

export type CharacterId = 'kuromi' | 'melody' | 'piano';

/** A resolved, validated namespaced sticker/react reference. */
export interface CharacterMoodRef {
	who: CharacterId;
	mood: string;
}

/**
 * A validated, ready-to-render inline multiple-choice question extracted from
 * a `[question]...[/question]` block (see parseQuestionBlock). All string
 * fields have already been stripped of nested tag markers and clamped to
 * sane lengths -- this is the shape InlineQuestion.svelte consumes directly.
 */
export interface ParsedQuestion {
	prompt: string;
	options: string[];
	/** Character-for-character equal to exactly one entry in `options`. */
	correct: string;
	explanation: string | null;
}

export interface ParsedReply {
	text: string;
	mood: PersonaMood;
	sticker: CharacterMoodRef | null;
	react: CharacterMoodRef | null;
	/** At most one inline MCQ per reply; a malformed block resolves to null and is stripped. */
	question: ParsedQuestion | null;
}

const MOOD_SET: ReadonlySet<string> = new Set(PERSONA_MOODS);
const KUROMI_STICKER_SET: ReadonlySet<string> = MOOD_SET;
const MELODY_STICKER_SET: ReadonlySet<string> = new Set(MELODY_STICKER_MOODS);
const PIANO_STICKER_SET: ReadonlySet<string> = new Set(PIANO_STICKER_MOODS);

/** Trailing `[mood: word]` on the last non-empty line (case-insensitive). Un-namespaced, Kuromi-only. */
const TRAILING_TAG = /^(.*)(\[\s*mood\s*:\s*([A-Za-z-]+)\s*\])\s*$/i;

// Whole-line sticker/react tags. Capture is deliberately permissive ([^\]]*) so any
// content inside the brackets -- namespaced, bare, malformed, or empty -- is consumed
// and stripped from the line; validity is decided afterward by resolveCharacterMoodRef.
const STICKER_LINE = /^\s*\[\s*sticker\s*:\s*([^\]]*)\]\s*$/i;
const REACT_LINE = /^\s*\[\s*react\s*:\s*([^\]]*)\]\s*$/i;
// Same permissive capture, global, for the safety-net strip of anything left mid-sentence.
const STICKER_ANY = /\[\s*sticker\s*:[^\]]*\]/gi;
const REACT_ANY = /\[\s*react\s*:[^\]]*\]/gi;

// Whole-line [question] / [/question] block delimiters (§3 protocol -- deliberately
// not JSON, not a code fence). Content lines in between are handled by parseQuestionBlock.
const QUESTION_START_LINE = /^\s*\[\s*question\s*\]\s*$/i;
const QUESTION_END_LINE = /^\s*\[\s*\/\s*question\s*\]\s*$/i;
// Any stray/nested bracket-tag-shaped token inside question-block content -- stripped
// on sight so a nested [mood: x] or accidental [question] cannot leak into rendered text.
const NESTED_TAG_ANY = /\[[^\]\r\n]*\]/g;

const QUESTION_MAX_PROMPT_LEN = 300;
const QUESTION_MAX_OPTION_LEN = 120;
const QUESTION_MAX_EXPLANATION_LEN = 500;
const QUESTION_MIN_OPTIONS = 2;
const QUESTION_MAX_OPTIONS = 4;

/** Strip nested tag markers, then trim, then clamp to `max` chars. */
function cleanQuestionField(raw: string, max: number): string {
	const stripped = raw.replace(NESTED_TAG_ANY, '').trim();
	return stripped.length > max ? stripped.slice(0, max).trim() : stripped;
}

/**
 * Validate and build a ParsedQuestion from the raw lines strictly between a
 * matched `[question]` / `[/question]` pair. Fails closed: any of the rules
 * in §3 (2-4 options, answer must match an option character-for-character,
 * empty prompt, duplicate options) returns null -- the block is dropped, the
 * caller has already removed its raw text regardless of this result.
 */
function parseQuestionBlock(lines: string[]): ParsedQuestion | null {
	let prompt: string | null = null;
	const rawOptions: string[] = [];
	let rawCorrect: string | null = null;
	let rawExplanation: string | null = null;

	for (const line of lines) {
		const t = line.trim();
		if (t === '') continue;

		if (t.startsWith('-')) {
			const value = t.slice(1).trim();
			if (value !== '') rawOptions.push(value);
			continue;
		}
		if (t.startsWith('*')) {
			if (rawCorrect === null) rawCorrect = t.slice(1).trim();
			continue;
		}
		if (t.startsWith('>')) {
			if (rawExplanation === null) rawExplanation = t.slice(1).trim();
			continue;
		}
		// First non-marker, non-blank line is the prompt (§3); later ones ignored.
		if (prompt === null) prompt = t;
	}

	if (prompt === null) return null;
	const cleanPrompt = cleanQuestionField(prompt, QUESTION_MAX_PROMPT_LEN);
	if (cleanPrompt === '') return null;

	const options = rawOptions.map((o) => cleanQuestionField(o, QUESTION_MAX_OPTION_LEN));
	if (options.length < QUESTION_MIN_OPTIONS || options.length > QUESTION_MAX_OPTIONS) return null;
	if (new Set(options).size !== options.length) return null;
	// Empty after cleaning (§3): a raw option that was only a nested tag must not
	// survive as a blank tappable button.
	if (options.some((o) => o === '')) return null;

	if (rawCorrect === null) return null;
	const correct = cleanQuestionField(rawCorrect, QUESTION_MAX_OPTION_LEN);
	// Empty after cleaning (§3): a star answer that was only a nested tag is
	// invalid -- reject explicitly, do not rely on the includes-check alone.
	if (correct === '') return null;
	if (!options.includes(correct)) return null;

	const explanation =
		rawExplanation === null
			? null
			: cleanQuestionField(rawExplanation, QUESTION_MAX_EXPLANATION_LEN);

	return {
		prompt: cleanPrompt,
		options,
		correct,
		explanation: explanation === '' ? null : explanation
	};
}

/**
 * Validate a raw sticker/react value as a namespaced `who/mood` reference.
 * Unknown character, unknown mood for that character, or malformed input (no
 * slash, empty who/mood, extra slashes) all resolve to null -- dropped silently,
 * never surfaced.
 */
function resolveCharacterMoodRef(raw: string): CharacterMoodRef | null {
	const parts = raw.trim().split('/');
	if (parts.length !== 2) return null;

	const who = parts[0].trim().toLowerCase();
	const mood = parts[1].trim().toLowerCase();
	if (!who || !mood) return null;

	if (who === 'kuromi' && KUROMI_STICKER_SET.has(mood)) return { who: 'kuromi', mood };
	if (who === 'melody' && MELODY_STICKER_SET.has(mood)) return { who: 'melody', mood };
	if (who === 'piano' && PIANO_STICKER_SET.has(mood)) return { who: 'piano', mood };
	return null;
}

/**
 * Parse a model reply that may end with a `[mood: <name>]` tag and may
 * contain whole-line `[sticker: <who>/<mood>]` / `[react: <who>/<mood>]` tags.
 * Pure: no side effects. Does not mutate the stored transcript -- call at render time.
 */
export function parseReply(raw: string): ParsedReply {
	if (raw.trim() === '') {
		return { text: '', mood: DEFAULT_MOOD, sticker: null, react: null, question: null };
	}

	// STEP 1 -- existing last-non-empty-line mood-tag extraction (unchanged, un-namespaced).
	const lines = raw.split('\n');
	let lastIdx = -1;
	for (let i = lines.length - 1; i >= 0; i--) {
		if (lines[i].trim() !== '') {
			lastIdx = i;
			break;
		}
	}

	if (lastIdx === -1) {
		return { text: '', mood: DEFAULT_MOOD, sticker: null, react: null, question: null };
	}

	const lastLine = lines[lastIdx];
	const match = lastLine.match(TRAILING_TAG);

	let mood: PersonaMood = DEFAULT_MOOD;
	let remaining: string;
	if (!match) {
		// No valid trailing mood tag: remaining is the raw text unchanged.
		remaining = raw;
	} else {
		const value = match[3].toLowerCase();
		mood = MOOD_SET.has(value) ? (value as PersonaMood) : DEFAULT_MOOD;
		const beforeOnLine = match[1];
		remaining =
			lastIdx === 0 ? beforeOnLine : lines.slice(0, lastIdx).join('\n') + '\n' + beforeOnLine;
	}

	// STEP 2 -- whole-line sticker / react scan, document order, first wins. Also scans
	// for a [question]...[/question] block (§3): at most one per reply, first occurrence
	// wins (valid or not), an unterminated block consumes the rest of the message. Every
	// matched block's raw lines are removed from `kept` regardless of validity, exactly
	// like an unknown sticker name is dropped today -- a broken question never survives
	// as raw text.
	let stickerSeen = false;
	let reactSeen = false;
	let sticker: CharacterMoodRef | null = null;
	let react: CharacterMoodRef | null = null;
	let questionBlockSeen = false;
	let question: ParsedQuestion | null = null;
	const kept: string[] = [];

	const remainingLines = remaining.split('\n');
	for (let i = 0; i < remainingLines.length; i++) {
		const line = remainingLines[i];

		if (QUESTION_START_LINE.test(line)) {
			let endIdx = -1;
			for (let j = i + 1; j < remainingLines.length; j++) {
				if (QUESTION_END_LINE.test(remainingLines[j])) {
					endIdx = j;
					break;
				}
			}
			if (endIdx === -1) {
				// Unterminated: drop the marker and everything after it (§3).
				if (!questionBlockSeen) questionBlockSeen = true;
				break;
			}
			if (!questionBlockSeen) {
				questionBlockSeen = true;
				question = parseQuestionBlock(remainingLines.slice(i + 1, endIdx));
			}
			i = endIdx;
			continue;
		}

		const stickerMatch = line.match(STICKER_LINE);
		if (stickerMatch) {
			if (!stickerSeen) {
				stickerSeen = true;
				sticker = resolveCharacterMoodRef(stickerMatch[1]);
			}
			continue;
		}

		const reactMatch = line.match(REACT_LINE);
		if (reactMatch) {
			if (!reactSeen) {
				reactSeen = true;
				react = resolveCharacterMoodRef(reactMatch[1]);
			}
			continue;
		}

		kept.push(line);
	}

	const intermediate = kept.join('\n');

	// STEP 3 -- strip leftover mid-sentence sticker/react tags (display only).
	const stripped = intermediate.replace(STICKER_ANY, '').replace(REACT_ANY, '').trim();

	// STEP 4 -- tag-only reply: never render an empty bubble. (Unchanged from the
	// prior version for the no-question case: this intentionally falls back to the raw
	// string, tags and all, rather than an empty bubble. The client applies its own
	// additional display-time strip as a safety net so no raw mood/sticker/react tag is
	// ever actually shown to Domi -- see ChatSheet.svelte, out of this file's scope.
	// A question block's content lines (prompt/options/answer/explanation) are plain
	// text, not bracket tags, so that client-side strip cannot clean them up -- if any
	// [question] block was detected here (valid or not), fall back to '' instead of raw
	// so nothing raw ever renders; the "only a question" case still shows something
	// sensible via the client's own empty-text fallback plus the rendered question itself.)
	if (stripped === '') {
		return { text: questionBlockSeen ? '' : raw, mood, sticker, react, question };
	}

	return { text: stripped, mood, sticker, react, question };
}
