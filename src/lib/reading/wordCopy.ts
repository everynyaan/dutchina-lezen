export const WORD_COPY_LINE =
	'That option repeats a word from the text. Answer the question, not the echo.';

const STOPWORDS = new Set(
	'de het een van voor met dat die deze niet naar zijn haar hun ook maar want omdat als dan bij uit over aan om te en of op in je jij hij zij wij er wat hoe waar'.split(
		' '
	)
);

/** Letter tokens, lowercased. Non-letters are stripped. */
function tokens(value: string): string[] {
	return (value.toLowerCase().match(/\p{L}+/gu) ?? []).filter(
		(token) => token.length >= 6 && !STOPWORDS.has(token)
	);
}

/**
 * True when the option repeats a long content word from the passage.
 * Stopwords and tokens shorter than 6 do not count.
 */
export function looksLikeWordCopy(option: string, passage: string): boolean {
	const passageTokens = new Set(tokens(passage));
	return tokens(option).some((token) => passageTokens.has(token));
}
