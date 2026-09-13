// Combining Diacritical Marks block (U+0300–U+036F).
const COMBINING_MARKS = /[\u0300-\u036F]/g;

export function normalizeAnswer(raw: string): string {
	// 1. trim, collapse internal whitespace, lowercase
	let s = raw.trim().replace(/\s+/g, ' ').toLowerCase();
	// 2. strip trailing period
	if (s.endsWith('.')) s = s.slice(0, -1);
	// 3. strip a single leading article
	if (s.startsWith('de ')) s = s.slice(3);
	else if (s.startsWith('het ')) s = s.slice(4);
	else if (s.startsWith('een ')) s = s.slice(4);
	// 4. remove diacritics
	s = s.normalize('NFD').replace(COMBINING_MARKS, '');
	return s;
}
