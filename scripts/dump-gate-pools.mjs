/**
 * Read-only dump of WORD_POOL by rank and story load.
 * Does not change generators. Re-run after any retag.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const pool = JSON.parse(readFileSync('src/lib/data/WORD_POOL.json', 'utf8'));
const src = readFileSync('src/lib/conversation/CONVERSATION_CONTENT.ts', 'utf8');

mkdirSync('docs/qa', { recursive: true });

const byRank = {};
for (const w of pool) (byRank[w.rank] ??= []).push(w);

for (const rank of Object.keys(byRank)) {
	const sorted = byRank[rank].slice().sort((a, b) => a.dutch.localeCompare(b.dutch));
	writeFileSync(`docs/qa/word-pool-rank-${rank}.json`, JSON.stringify(sorted, null, 2));
}

const stories = [];
const storyRe = /id: '(cs_\d+)',\s*rank: (\d+),\s*title: '([^']+)'/g;
let m;
while ((m = storyRe.exec(src))) stories.push({ id: m[1], rank: Number(m[2]), title: m[3] });

const chapterRe =
	/id: '(cc_(\d+)_\d+)',\s*chapterNumber: (\d+),\s*title: '([^']+)',\s*text: '([\s\S]*?)',\s*summary:/g;
const chapters = [];
while ((m = chapterRe.exec(src))) {
	const text = m[5].replace(/\\n/g, '\n');
	chapters.push({
		id: m[1],
		storyIndex: Number(m[2]),
		title: m[4],
		words: text.split(/\s+/).filter(Boolean).length
	});
}

const load = stories.map((s) => {
	const idx = Number(s.id.replace('cs_', ''));
	const chs = chapters.filter((c) => c.storyIndex === idx);
	return {
		...s,
		chapters: chs.length,
		totalWords: chs.reduce((a, c) => a + c.words, 0),
		chapterWords: chs.map((c) => ({ id: c.id, title: c.title, words: c.words }))
	};
});

writeFileSync('docs/qa/stories-load.json', JSON.stringify(load, null, 2));
console.log('dumped ranks', Object.keys(byRank).join(', '), 'stories', load.length);
