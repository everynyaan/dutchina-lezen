import { getAnnotation, paragraphsOf } from './annotations';
import { allPassages, findPassage } from './bank';
import { PARAGRAPH_ROLES, type ParagraphMapEntry, type ParagraphRole } from './loop';
import { QTYPES, TRAP_KINDS, type Evidence, type QType, type TrapKind } from './types';
import legacyFile from './practice/legacy.json';

export type { ParagraphMapEntry, ParagraphRole };

export interface PracticeItem {
	id: string;
	qtype: QType;
	question: string;
	options: Record<string, string>;
	answer: string;
	evidence: Evidence[];
	move: string;
	why: string;
	distractors: Record<string, { trap: TrapKind; why: string }>;
	afterItemId?: string;
	/** Official items that must be attempted before this item can be served. */
	afterItemIds?: string[];
}

interface LegacyPracticeItem extends PracticeItem {
	passageSlug: string;
}

export interface ParaphraseDrill {
	id: string;
	source: Evidence;
	afterItemId?: string;
	/** Official items that must be attempted before this drill can be served. */
	afterItemIds?: string[];
	prompt: string;
	options: Record<string, string>;
	answer: string;
	distractors: Record<string, { trap: TrapKind; why: string }>;
}

export interface PracticePack {
	passageSlug: string;
	paragraphMap: ParagraphMapEntry[];
	items: PracticeItem[];
	paraphrase: ParaphraseDrill[];
	note?: string;
}

const modules = import.meta.glob(['./practice/*.json', '!./practice/legacy.json'], { eager: true });
const LEGACY = legacyFile as unknown as LegacyPracticeItem[];

function unwrap(mod: unknown): unknown {
	if (mod && typeof mod === 'object' && 'default' in mod) {
		return (mod as { default: unknown }).default;
	}
	return mod;
}

function fileSlug(path: string): string {
	const name = path.split('/').pop() ?? path;
	return name.replace(/\.json$/, '');
}

const loaded: { file: string; pack: PracticePack }[] = Object.entries(modules)
	.map(([file, mod]) => ({ file, pack: unwrap(mod) as PracticePack }))
	.sort((a, b) => fileSlug(a.file).localeCompare(fileSlug(b.file)));

const bySlug = new Map<string, { file: string; pack: PracticePack }>();
for (const row of loaded) {
	const slug = row.pack?.passageSlug || fileSlug(row.file);
	bySlug.set(slug, row);
}

function flat(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

/** The passage substring for a quote. Newlines in the text match spaces in the quote. */
function locateQuote(text: string, quote: string): { p: number; quote: string } | null {
	const needle = flat(quote);
	if (!needle) return null;
	const hits: { p: number; quote: string }[] = [];
	for (const [index, paragraph] of paragraphsOf(text).entries()) {
		if (paragraph.includes(quote)) {
			hits.push({ p: index, quote });
			continue;
		}
		if (!flat(paragraph).includes(needle)) continue;
		hits.push({ p: index, quote: sliceQuote(paragraph, needle) ?? quote });
	}
	return hits.length === 1 ? hits[0] : null;
}

function sliceQuote(paragraph: string, needle: string): string | null {
	let collapsed = '';
	const startAt: number[] = [];
	let index = 0;
	while (index < paragraph.length) {
		if (/\s/.test(paragraph[index])) {
			const spaceAt = index;
			while (index < paragraph.length && /\s/.test(paragraph[index])) index += 1;
			if (collapsed.length === 0) continue;
			collapsed += ' ';
			startAt.push(spaceAt);
			continue;
		}
		collapsed += paragraph[index];
		startAt.push(index);
		index += 1;
	}
	const at = collapsed.indexOf(needle);
	if (at < 0) return null;
	const from = startAt[at];
	const last = startAt[at + needle.length - 1];
	return paragraph.slice(from, last + 1);
}

function quoteIndex(text: string, quote: string): number | null {
	return locateQuote(text, quote)?.p ?? null;
}

function anchorIndexes(text: string, anchor: string): number[] {
	if (!anchor) return [];
	const paragraphs = paragraphsOf(text);
	const exact = paragraphs.flatMap((paragraph, index) =>
		paragraph.startsWith(anchor) ? [index] : []
	);
	if (exact.length === 1) return exact;
	const needle = flat(anchor).replace(/^[.?!]\s+/, '');
	if (!needle) return exact;
	const contains = paragraphs.flatMap((paragraph, index) =>
		flat(paragraph).includes(needle) ? [index] : []
	);
	if (contains.length === 1) return contains;
	let best = 0;
	let hits: number[] = [];
	for (const [index, paragraph] of paragraphs.entries()) {
		const collapsed = flat(paragraph);
		if (collapsed.length < 12 || !needle.startsWith(collapsed)) continue;
		if (collapsed.length > best) {
			best = collapsed.length;
			hits = [index];
		} else if (collapsed.length === best) hits.push(index);
	}
	return hits.length === 1 ? hits : exact;
}

function checkChoices(
	id: string,
	options: Record<string, string> | undefined,
	answer: string | undefined,
	distractors: Record<string, { trap: TrapKind; why: string }> | undefined,
	problems: string[]
) {
	const letters = Object.keys(options ?? {}).sort();
	if (letters.join('') !== 'ABC') {
		problems.push(`${id} must have options A, B and C`);
	}
	if (!answer || !letters.includes(answer)) {
		problems.push(`${id} answer is not one of its options`);
	}
	const expected = letters.filter((letter) => letter !== answer).sort();
	const got = Object.keys(distractors ?? {}).sort();
	if (got.join() !== expected.join()) {
		problems.push(`${id} distractor keys are ${got.join(',') || 'empty'}`);
	}
	for (const [letter, row] of Object.entries(distractors ?? {})) {
		if (!(TRAP_KINDS as readonly string[]).includes(row?.trap)) {
			problems.push(`${id} option ${letter} has an unknown trap`);
		}
		if (!row?.why?.trim()) problems.push(`${id} option ${letter} has no reason`);
	}
}

/** Problems in one pack. Empty means the pack can be served. */
export function packProblems(slug: string): string[] {
	const row = bySlug.get(slug);
	if (!row) return [`no pack for ${slug}`];
	const pack = row.pack;
	const problems: string[] = [];
	if (fileSlug(row.file) !== pack.passageSlug) {
		problems.push(`${row.file} slug does not match ${pack.passageSlug}`);
	}
	if (JSON.stringify(pack).includes('\u2014')) problems.push(`${slug} contains an em dash`);
	const passage = findPassage(slug);
	if (!passage) {
		problems.push(`${slug} is not an official passage`);
		return problems;
	}
	const text = passage.text;
	const items = pack.items ?? [];
	const drills = pack.paraphrase ?? [];
	const map = pack.paragraphMap ?? [];
	const legacyCount = LEGACY.filter((item) => item.passageSlug === slug).length;
	const total = items.length + legacyCount;
	if (total < 6 || total > 9) {
		problems.push(`${slug} has ${total} items with legacy; a passage needs 6 to 9`);
	}
	if (drills.length < 2 || drills.length > 3) {
		problems.push(`${slug} has ${drills.length} paraphrase drills; a pack needs 2 or 3`);
	}
	const meanings = items.filter((item) => item.qtype === 'betekenis-in-context');
	if (meanings.length < 1) {
		problems.push(`${slug} needs a betekenis-in-context item`);
	}

	const ids = [...items.map((item) => item.id), ...drills.map((drill) => drill.id)];
	if (new Set(ids).size !== ids.length) problems.push(`${slug} repeats an id`);

	const mapped = new Map<number, number>();
	for (const entry of map) {
		if (!(PARAGRAPH_ROLES as readonly string[]).includes(entry.role)) {
			problems.push(`${slug} paragraph ${entry.p} has an unknown role`);
		}
		if (!entry.summary?.trim()) problems.push(`${slug} paragraph ${entry.p} has no summary`);
		const hits = anchorIndexes(text, entry.anchor);
		if (hits.length !== 1) {
			problems.push(`${slug} anchor does not resolve: ${entry.anchor.slice(0, 40)}`);
			continue;
		}
		mapped.set(hits[0], (mapped.get(hits[0]) ?? 0) + 1);
	}
	if (mapped.size === 0 && map.length > 0) {
		problems.push(`${slug} paragraph map does not resolve`);
	}

	const lureKinds: string[] = [];
	for (const item of items) {
		if (!(QTYPES as readonly string[]).includes(item.qtype)) {
			problems.push(`${item.id} has an unknown qtype`);
		}
		if (!item.question?.trim()) problems.push(`${item.id} has no question`);
		if (!item.move?.trim()) problems.push(`${item.id} has no move`);
		if (!item.why?.trim()) problems.push(`${item.id} has no why`);
		checkChoices(item.id, item.options, item.answer, item.distractors, problems);
		if (!item.evidence?.length) problems.push(`${item.id} has no evidence`);
		for (const evidence of item.evidence ?? []) {
			const at = quoteIndex(text, evidence.quote);
			if (at === null) problems.push(`${item.id} quote is not in one paragraph`);
		}
		for (const row of Object.values(item.distractors ?? {})) lureKinds.push(row.trap);
		if (passage.questions.some((question) => question.question === item.question)) {
			problems.push(`${item.id} copies an official stem`);
		}
		const gated = new Set(gateIds(item));
		for (const official of passage.questions) {
			const annotation = getAnnotation(official.id);
			if (!annotation || gated.has(official.id)) continue;
			const practiceQuotes = (item.evidence ?? []).map((evidence) => flat(evidence.quote)).sort();
			const officialQuotes = annotation.evidence.map((evidence) => flat(evidence.quote)).sort();
			const sameEvidence =
				practiceQuotes.length > 0 && practiceQuotes.join('\n') === officialQuotes.join('\n');
			const sameClaim = item.options?.[item.answer] === official.options[official.answer];
			if (sameEvidence && (item.answer === official.answer || sameClaim)) {
				problems.push(`${item.id} repeats the evidence and answer of ${official.id}`);
			}
		}
	}

	for (const drill of drills) {
		if (!drill.prompt?.trim()) problems.push(`${drill.id} has no prompt`);
		checkChoices(drill.id, drill.options, drill.answer, drill.distractors, problems);
		const at = quoteIndex(text, drill.source?.quote ?? '');
		if (at === null) problems.push(`${drill.id} source quote is not in one paragraph`);
		for (const row of Object.values(drill.distractors ?? {})) lureKinds.push(row.trap);
		const owners = passage.questions.filter((question) =>
			getAnnotation(question.id)?.evidence.some(
				(evidence) => evidence.quote === drill.source?.quote
			)
		);
		if (owners.length > 0 && !owners.some((question) => question.id === drill.afterItemId)) {
			problems.push(`${drill.id} uses official evidence and needs afterItemId`);
		}
	}

	const plain = lureKinds.filter((trap) => trap !== 'niet-in-tekst').length;
	if (lureKinds.length > 0 && plain * 2 < lureKinds.length) {
		problems.push(`${slug} needs at least half its lures to be something other than niet-in-tekst`);
	}
	return problems;
}

export function allPackProblems(): string[] {
	const problems = [...bySlug.keys()].flatMap((slug) => packProblems(slug));
	const ids = loaded.flatMap((row) => [
		...(row.pack.items ?? []).map((item) => item.id),
		...(row.pack.paraphrase ?? []).map((drill) => drill.id)
	]);
	if (new Set(ids).size !== ids.length)
		problems.push('a practice id is used in more than one pack');
	return problems;
}

export function packSlugs(): string[] {
	return [...bySlug.keys()].sort();
}

export function passagesMissingPacks(): string[] {
	const have = new Set(packSlugs());
	return [...new Set(allPassages().map((passage) => passage.slug))]
		.filter((slug) => !have.has(slug))
		.sort();
}

function serve(slug: string): PracticePack | null {
	const row = bySlug.get(slug);
	if (!row) return null;
	const problems = packProblems(slug);
	if (problems.length > 0) {
		throw new Error(problems.join('\n'));
	}
	const passage = findPassage(slug);
	if (!passage) return null;
	const text = passage.text;
	return {
		...row.pack,
		paragraphMap: row.pack.paragraphMap.map((entry) => ({
			...entry,
			p: anchorIndexes(text, entry.anchor)[0]
		})),
		items: row.pack.items.map((item) => ({
			...item,
			evidence: item.evidence.map((evidence) => {
				const located = locateQuote(text, evidence.quote);
				return located ? { ...evidence, p: located.p, quote: located.quote } : evidence;
			})
		})),
		paraphrase: row.pack.paraphrase.map((drill) => {
			const located = locateQuote(text, drill.source.quote);
			return {
				...drill,
				source: located ? { ...drill.source, p: located.p, quote: located.quote } : drill.source
			};
		})
	};
}

function seenSet(
	attempted: ReadonlySet<string> | readonly string[] | undefined
): ReadonlySet<string> | undefined {
	if (!attempted) return undefined;
	return attempted instanceof Set ? attempted : new Set(attempted);
}

function gateIds(row: { afterItemId?: string; afterItemIds?: string[] }): string[] {
	const ids = [...(row.afterItemIds ?? [])];
	if (row.afterItemId && !ids.includes(row.afterItemId)) ids.push(row.afterItemId);
	return ids;
}

function gateOpen(
	row: { afterItemId?: string; afterItemIds?: string[] },
	seen: ReadonlySet<string> | undefined
): boolean {
	const ids = gateIds(row);
	if (ids.length === 0) return true;
	if (!seen) return false;
	return ids.every((id) => seen.has(id));
}

function resolveLegacy(item: LegacyPracticeItem): PracticeItem {
	const passage = findPassage(item.passageSlug);
	return {
		...item,
		evidence: item.evidence.map((evidence) => {
			if (!passage) return evidence;
			const at = quoteIndex(passage.text, evidence.quote);
			return at === null ? evidence : { ...evidence, p: at };
		})
	};
}

/** Practice items for a passage. Gated items stay hidden until `attempted` covers afterItemId and afterItemIds. */
export function practiceItemsFor(
	slug: string,
	attempted?: ReadonlySet<string> | readonly string[]
): PracticeItem[] {
	const seen = seenSet(attempted);
	const pack = (serve(slug)?.items ?? []).filter((item) => gateOpen(item, seen));
	const legacy = LEGACY.filter((item) => item.passageSlug === slug && gateOpen(item, seen)).map(
		resolveLegacy
	);
	return [...pack, ...legacy];
}

export function paragraphMapFor(slug: string): ParagraphMapEntry[] {
	return serve(slug)?.paragraphMap ?? [];
}

/**
 * Paraphrase drills for a passage.
 * Pass `attempted` to hide drills until afterItemId and afterItemIds are covered.
 * Omit it when resolving a drill that was already chosen.
 */
export function paraphraseFor(
	slug: string,
	attempted?: ReadonlySet<string> | readonly string[]
): ParaphraseDrill[] {
	const drills = serve(slug)?.paraphrase ?? [];
	if (attempted === undefined) return drills;
	const seen = seenSet(attempted);
	return drills.filter((drill) => gateOpen(drill, seen));
}

/**
 * Keep up to `count` ids, skipping any that would sit next to another item from the same pack.
 * Official ids are not pack items, so they may sit next to each other.
 */
export function takeSpaced(ids: readonly string[], count = ids.length): string[] {
	const out: string[] = [];
	for (const id of ids) {
		if (out.length >= count) break;
		const pack = itemPassageSlug(id);
		const prev = out.length > 0 ? itemPassageSlug(out[out.length - 1]) : undefined;
		if (pack && prev && pack === prev) continue;
		out.push(id);
	}
	return out;
}

export function practiceById(id: string): PracticeItem | undefined {
	for (const row of loaded) {
		const item = row.pack.items?.find((candidate) => candidate.id === id);
		if (item) return item;
	}
	const legacy = LEGACY.find((item) => item.id === id);
	return legacy ? resolveLegacy(legacy) : undefined;
}

export function paraphraseById(id: string): ParaphraseDrill | undefined {
	for (const row of loaded) {
		const drill = row.pack.paraphrase?.find((candidate) => candidate.id === id);
		if (drill) return drill;
	}
	return undefined;
}

/** Passage that owns a practice item or a paraphrase drill. */
export function itemPassageSlug(id: string): string | undefined {
	for (const row of loaded) {
		const slug = row.pack?.passageSlug || fileSlug(row.file);
		if (row.pack.items?.some((item) => item.id === id)) return slug;
		if (row.pack.paraphrase?.some((drill) => drill.id === id)) return slug;
	}
	return LEGACY.find((item) => item.id === id)?.passageSlug;
}
