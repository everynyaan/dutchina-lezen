# V3_STATE

Rolling continuity doc for the Dutchina V3 overhaul. Each phase session appends its own section and reads only: this file + the brief's shared sections + its own phase section.

**Where this document and the original brief disagree, this document wins.** Deviations recorded here are approved decisions, not drift.

---

## Standing rules — all phases, no exceptions

1. **A phase is not done with an uncommitted tree.** Before the session ends, land the phase as logical commits (not one dump). Keep mechanical noise — formatting passes, mass renames — in its own commit so `git blame` stays useful on the real work.
2. **Lane verification is headless only.** No lane may launch, attach to, or drive a visible browser session on this machine. Headless, isolated, temp-profile browsers only, and the lane closes what it opens. A lane that cannot verify headlessly reports that as a gap instead of reaching for the user's browser.
3. **Every lane spec that adds or changes UI text quotes CA-13's split verbatim** (V3_DESIGN §3: Dutch for ambient flavor, ENGLISH for anything comprehension-critical, Kuromi's voice exempt). Eyad's ruling after the entire Unit 0 sync/auth surface shipped in Dutch. Paraphrasing the rule is not enough — the lane gets the text of the rule, and audits every string it touches against it.

---

## Phase 0 — Design system foundation · COMPLETE (2026-08-14)

**Verification at handoff:** `npm run check` 0 errors / 27 pre-existing a11y warnings · `npm run lint` exit 0 · `npm test` 170/170 · `npm run build` ✔ · all 10 routes render on a 375px viewport with no console errors · both fonts load from disk with **zero external requests**. All four re-run and confirmed green _after_ committing.

### Commits

Work lives on branch **`v3`**. `main` stays pinned at `159b020` so it remains a clean upstream/V2 reference to diff against.

| Hash      | Commit                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `47ef008` | `chore: repair red baseline and format the repo` — Phase 0a, with the one-time Prettier pass folded in so blame stays clean on real work |
| `ceb2340` | `feat: Kuromi x My Melody design-system foundation` — tokens, fonts, page background, shared surfaces, `src/data/` removal               |
| `94cda71` | `feat: shared UI primitives for the handbook aesthetic` — the seven `ui/` components                                                     |

Phase 1 branches from the tip of `v3`.

### Repo bootstrap

V3 root cloned from `github.com/everynyaan/dutchina` at `159b020` ("phase 3: desktop layout + dark-theme cleanup"). Nothing has been pushed — the `v3` branch is local only.

`C:\Users\eyadk\Desktop\Dutchina V2\dutchina-main` is **not** a git clone; it's an older ZIP snapshot predating `daily/generator.ts` and `time/week.ts`. It does still contain a `src/lib/grammar/` module (`GRAMMAR_CONTENT.ts`, `types.ts`, `routes/grammar/+page.svelte`) that was later removed upstream — **useful source material for Phase 2's `/grammar` build.**

### Phase 0a — baseline repair (inserted; not in the brief)

HEAD was RED: 47 `svelte-check` errors, 4 failing tests, 97 files failing Prettier, 83 eslint errors. The brief's per-phase "all green" gate was unenforceable, so this was fixed first.

- `migrations.test.ts` — 4 stale `newCardsPerDay` assertions (default moved 10→30 in `bdf6659`; tests never updated) + union-narrowing casts. **The migration logic was correct — only the tests were stale. No data-clobbering bug existed.**
- `+layout.svelte` — local `let state` renamed `gameState` (it shadowed the `$state` rune in svelte2tsx). The `setGameContext` getter is still `get state()`, so **no child component was affected.**
- `AchievementGrid.svelte` — lucide ships class-shaped typings; annotation replaced with `Record<string, typeof Swords>`.
- `vocab/+page.svelte` — `$derived` → `$derived.by` (real rune misuse; the value was a closure being called in the template).
- `.prettierrc` — added `endOfLine: "auto"` (repo is CRLF; Prettier defaulted to LF). Then one central `npm run format`.
- All 83 eslint errors cleared: 41 `{#each}` blocks keyed, `resolve()` applied to navigation, dead bindings removed, `Set`→`SvelteSet` in `match`.

**The one-time `npm run format` reformatted 59 files, including engine files the brief protects.** This was audited: a whitespace/quote/trailing-comma-normalized comparison against HEAD proves `sync.mts` (auth logic), `migrations.ts`, `schema.ts`, `store.ts`, `srs.ts`, `cardStore.ts`, `match/engine.ts`, `missions/engine.ts`, `sync.ts`, `daily/generator.ts` and `profiles.ts` are **semantically unchanged** — pure line-wrapping and redundant-paren removal (e.g. `((rng * 1103515245 + 12345) & 0x7fffffff)` → same expression without the outer parens). **`schema.ts` has no shape change: identical fields and types, only wrapped across lines.** `src/lib/lp/lp.ts` and `src/lib/achievements/engine.ts` were not touched at all. The single non-formatting edit in a protected file is `boss/engine.ts` dropping an unused `type HandcraftedQuestion` import (authorized eslint fix; type-only, erased at compile).

Because this pass is one-time, later phases start from a Prettier-clean tree and their diffs stay readable.

### What shipped in Phase 0

1. **`src/app.css`** — new `@theme`: 17 palette tokens, legacy semantic names kept as `var()` aliases, old accent names remapped, six-stop type scale, `--card-shadow`/`--sticker-shadow`, root 15px→17px. `[data-theme='dark']` block deleted. Two `@font-face` rules. Page background is a 4-layer `background-image` on `body`.
2. **`static/fonts/`** — Nunito (39,128 B) + Quicksand (28,244 B) latin **variable** woff2, self-hosted. `app.html`: Google Fonts links and the anti-flash script removed, `theme-color` → `#FFF8F5`, font preloads added. `manifest.json` recolored.
3. **`src/lib/components/ui/`** — seven primitives: `Card`, `Pill`, `Sticker`, `FormulaBar`, `Bead`, `Bubble`, `ChapterBadge`. **Nothing imports them yet** — Phase 1 is their first consumer.
   - **Contract:** each takes `class?: string` and composes it (`class={['card', className]}`), with `{...rest}` last. A consumer's `class`, `id`, `onclick`, `style`, `aria-*` and `data-*` all pass through, and the base styling survives.
   - This was caught by end-of-phase review and fixed. The original build wrote `<div class="card" {...rest}>`, where the spread **replaces** the literal class — `<Card class="x">` rendered a completely unstyled div (border/radius/padding all `0px`, no shadow). Verified fixed in a real browser across all 7 × with/without a consumer class. **Svelte 5 does not merge `class` across a spread — never rely on that.**
4. **Shared surfaces adapted** — `+layout.svelte`, `+page.svelte`, all 12 `src/lib/components/*.svelte`: font-size literals → type-scale tokens, `--color-pink` → `--color-accent`, theme toggle removed.
5. **`src/data/`** deleted (dead duplicates; verified unreferenced first).

### Decisions & deviations from the brief

| #   | Decision                                                                                                                                                                   | Why                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `--color-pink` **not** value-swapped. Pastel takes the name; the old orange-red accent role moved to new `--color-accent` (`var(--color-pink-deep)`), ~12 usages migrated. | Old value `#FF5A2A` vs new `#FF9BB8` — silent repoint was a guaranteed contrast regression.                                                          |
| D2  | Added a six-stop type scale (`--text-micro/small/base/lead/title/hero`) not in the brief.                                                                                  | 278 `font-size` decls, **zero in rem** — the root 15→17px bump alone changes nothing. Makes the ≥14px floor enforceable in one place for Phases 1-6. |
| D3  | Small-text sweep **split**: shared components + layout now, route files defer to their Phase 1 retheme.                                                                    | 17 of 21 affected files get rewritten in Phase 1; sweeping them twice is waste.                                                                      |
| D4  | Phase 0 gate reworded to "every route renders with adequate contrast on the new palette".                                                                                  | Nothing is in rem, so Phase 0 changes no route text size. Contrast was the only real Phase 0 legibility risk.                                        |
| D5  | Fonts are **variable** woff2 — 2 files, not the 7 static weights the brief assumed.                                                                                        | Google serves one variable file per subset; smaller and full-axis.                                                                                   |
| D6  | `src/lib/theme/theme.ts` left byte-untouched.                                                                                                                              | Brief wants it inert, not deleted. Removing its only caller (`+page.svelte`) is what makes it inert.                                                 |

### State Phase 1 inherits

- **Route pages still carry sub-13px text** — this is D3's deferred work, not a regression. Counts: `/reviews` 113 nodes, `/boss` 23, `/lezen` 19, `/luisteren` 19, `/vocab` 8, `/daily` 4, `/cards` 3, `/match` 2, `/conversation` 2. Home is already at **0**. Mapping used: 9/10/11→`--text-micro`, 12/13→`--text-small`, 14→`--text-base`, 15/16→`--text-lead`, 18→`--text-title`, 28→`--text-hero`.
- **Nav bar currently has 6 tabs** (HOME, MATCH, CARDS, BOSS, STORY, REVIEWS). `/daily`, `/lezen`, `/luisteren`, `/vocab` are reached from home cards, **not** the tab bar. Phase 2 adds `/grammar` → 7 tabs at 375px. The brief's "group lezen/luisteren under an NT2 hub" suggestion doesn't apply cleanly since neither is currently a tab; revisit with real numbers.
- **Contrast note:** `--color-muted` `#7A6E7E` on cream `#FFF8F5` measures ~**4.58:1** — passes WCAG AA for body text, but with almost no margin. Do not lighten it further; if Phase 1 needs a softer muted, add a separate token for large text only.
- **Two remapped tokens are contrast-degraded as _text_ and must be fixed during the Phase 1 retheme:** `--color-muted2` (lavender, ~**2:1** on cream) and `--color-yellow` (~**2.9:1** on cream). Both are currently used for text in the `reviews`, `cards`, and `boss` routes. They are legible-ish as accents but fail as body text. This is known and accepted for Phase 0 only — do not ship Phase 1 with them still used for text.
- **`--text-base: 15px` also redefines Tailwind's built-in `text-base` utility.** Harmless today (the codebase uses zero Tailwind utility classes — `@theme` is purely a CSS-variable declaration site), but worth knowing before anyone reaches for a Tailwind class.
- **`src/lib/effects/particles.ts` still hardcodes the OLD navy-theme palette** (`#B9A7FF`, `#FF8C42`, `#FFD600`, …) as literal hex arrays. Particles will look off-palette until Phase 1 rethemes them. Not touched — out of Phase 0 scope.
- The 27 remaining `npm run check` warnings are pre-existing a11y/self-closing-tag warnings. They were deliberately left alone.

### Process notes for later sessions

- **Grok CLI needs `grok login`** — it silently reports `unavailable` otherwise, and the whole cost model depends on it.
- **Do not let a lane edit files through PowerShell string manipulation.** One run corrupted `+layout.svelte` (em-dashes → `???`, a stray bare CR merging two statements). Repaired and verified. Specs now mandate Python with explicit `encoding='utf-8'`, `newline=''`, and a post-edit byte audit.
- Parallel lanes must have **disjoint file sets**, and only one of them may run `npm run format` — run it centrally after all lanes land.
- `.claude/launch.json` was added for the dev-server preview (`dutchina-dev`, port 5173).

---

## Phase 1 — Full retheme + stories pagination · COMPLETE (2026-08-14)

**Verification at handoff:** `npm run check` **0 errors / 27 warnings — identical to the Phase 0 baseline**, proven by running svelte-check against `05e13c3` in a throwaway worktree and diffing per file · `npm run lint` exit 0 · `npm test` 170/170 · `npm run build` ✔ · tree clean. Manual checklist at 375px: all 13 route surfaces render, **0 sub-13px text nodes on every route**, one chapter completed end-to-end (read → vocab → 5 MCQs) awarding +2 LP/correct and writing `readChapters` + 5 `questionResults`, prev/next footer nav present, `/conversation` redirects, missions fire (`cards_10` 0→1), achievements fire (`ach_story_first`, via the new stories route), both fonts self-hosted with zero external requests. **fable-advisor: ship.**

17 commits, `33c608d`..`8c2115e`. Phase 2 branches from the tip of `v3`.

### What shipped

1. **Every route and shared component rethemed** onto the Phase 0 primitives — app shell (nav is now a floating white pill bar, active tab a filled pink shape), home, home cards, settings/speaker/word-highlight, cards/match/vocab, reviews, lezen/luisteren, daily, boss. `src/lib/effects/particles.ts` repainted (colour literals only). Presentation only throughout: every lane's script diff was primitive imports and nothing else.
2. **`/conversation` split** into `/stories`, `/stories/[story]`, `/stories/[story]/[chapter]`; `/conversation` is now a 9-line client-side `goto` redirect. `[story]` = story id (`cs_0`), `[chapter]` = 1-based `chapterNumber`. **No schema change, no migration** — `readChapters`, `questionResults`, `currentStory`, `currentChapter` keep their exact names and write points. The playback token/cancel machine was ported unchanged, plus a `$effect` keyed on the chapter param because SvelteKit reuses the component across prev/next so `onDestroy` does not fire.
3. **Two tokens added** for text roles the pastel palette cannot serve: `--color-gold-deep` `#8f6b12` (4.7:1) and `--color-rose-deep` `#b03a5b` (5.5:1).

### Decisions & deviations

| #   | Decision                                                                                                                                                                                                     | Why                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D7  | Pastels keep fills/borders; **text** that needs warmth or danger uses the two new deep tokens. Muted text → `--color-kuromi-mid`.                                                                            | Most of the palette fails as text on cream (`rose` 2.6:1, `accent` 2.9:1, `lavender` 1.7:1, `yellow` 2.5:1). Repointing the palette would lose the look.                                 |
| D8  | **Rank colour unbound from all text** — RankCard/RankStrip name + LP floaters, BossGateCard next-rank, and 5 boss headings now use fixed colours. `colorVar` keeps icons, borders, bar fills, `--rank-glow`. | `colorVar` is data-driven, so _some_ rank always fails whichever surface it sits on: 6 of 8 fail on cream; Silver hit ~1.1:1 on the new dark HP panel.                                   |
| D9  | `src/lib/data/ranks.ts` left byte-untouched.                                                                                                                                                                 | Its `colorHex` column still holds old navy hexes but is consumed nowhere in `src/`; Diamond's `colorVar: '--color-pink'` is now only a fill. Both benign once D8 removed the text roles. |
| D10 | `.score-num` on `/daily` restored to an explicit **52px**, documented as a display exception (like the 19px reading copy).                                                                                   | Applying the type scale strictly shrank a celebratory numeral 52→30px. Dramatic display type may exceed the scale.                                                                       |
| D11 | Story shelf cover emoji is a **deterministic rotation by index** (`STORY_EMOJI`), decorative + `aria-hidden`.                                                                                                | The brief asks for a cover emoji; `ConversationStory` has no emoji field and new content is out of scope.                                                                                |

### State Phase 2 inherits

- **`src/lib/audio/tts.ts` — `stopSpeaking()` is a no-op during the pre-play phase** (hash → IndexedDB → Google fetch). Pausing, tap-jumping or navigating during a cache-miss fetch (~100–500 ms) lets the stale sentence start anyway and overlap the new one for up to one sentence. Found by the end-of-phase advisor. **Pre-existing, in an untouched module, self-limiting — logged, not fixed.**
- `FALLBACK_TTS_KEY` is now duplicated in a **third** file. Pre-existing exposure; worth hoisting to one module.
- **`.player-accent` on `/boss`** ("DOMI", "YOUR STRIKES") is `--color-cyan` → `--color-sky-deep`, ~2.7:1 on cream. Left as-is: fixing it needs a third token for two decorative labels. Advisor agreed.
- **TTS audio output was never verified** — controls and state machine render, but headless audio playback could not be confirmed.
- Nav is still **6 tabs**; Phase 2's `/grammar` makes 7 at 375px. The one a11y warning on the chapter page is the sentence-span `role="button"`, ported byte-identical from the old file — not new.

### Process notes — read these before running parallel lanes

- **Worktree isolation branches from the DEFAULT branch, not the current one.** Every lane worktree came up at `159b020` (pre-Phase-0). Lanes must restore their files from `v3` with read-only `git show v3:<path>` as step 0, or they silently retheme pre-Phase-0 files and collecting the result _reverts Phase 0_.
- **Never give concurrent lanes a shared working tree.** Grok does not reliably honour "touch only these files"; lanes then "tidy up" with `git checkout`, which is tree-wide and destroyed three lanes' verified work. Worktrees + collecting only the mandated files makes scope violations harmless.
- **`TaskStop` kills the agent but not its `grok.exe` child.** An orphan kept writing files for minutes after. Check for `grok.exe`/`timeout.exe` and kill them.
- **Lane verification is eslint + prettier only — neither type-checks.** Two real errors sailed through nine green lane reports. `npm run check` must be run centrally by the architect; lanes can't, because concurrent runs race on `.svelte-kit`.
- **vitest collects test files inside `.claude/worktrees/`** — 10 worktrees turned 10 test files into 110. Now gitignored; remove worktrees before trusting the test gate.
- `cmd mklink` silently produces a broken junction here; use PowerShell `New-Item -ItemType Junction` for the worktree `node_modules`.
- Svelte scoped CSS does not reach a child component's root or a lucide-rendered `<svg>` — style those via `:global()`. A class passed to a lucide icon silently does nothing otherwise.

---

## Phase 2 — Vocab categorization + grammar cards · COMPLETE (2026-08-15)

**Verification at handoff:** `npm run check` **0 errors / 27 warnings — identical to the Phase 0/1 baseline** · `npm run lint` exit 0 · `npm test` 170/170 · `npm run build` ✔ · tree clean. All four re-run and confirmed green _after_ committing. Manual checklist at 375px: 16 category shelves all populated (counts sum to exactly 1,764, no empty shelf, no uncategorized word), category view + search + per-word rank gate all work, all 27 grammar cards render across 9 chapters with zero horizontal overflow, 5 tabs fit unclipped, all 12 routes return 200, only console errors are the pre-existing `/.netlify/functions/sync` 404s (that function is not served by `vite dev`). **fable-advisor: ship.**

4 commits, `3ec6142`..`47f02a9`. Phase 3 branches from the tip of `v3`.

### What shipped

1. **`WORD_POOL.json` — every entry gains `category`**, typed as a 16-value `WordCategory` union (not `string`), plus `WORD_CATEGORIES` (label/emoji/tone) and `getWordsInCategory()` in `wordPool.ts`.
2. **`/vocab` rebuilt** into a 16-card category grid → per-category word list with search. Rank gating is now **per-word** (categories cut across ranks): a locked word shows only a lock + "Unlocks at {rank}", never its dutch/english/sentences.
3. **`/grammar` + `src/lib/grammar/`** — 9 chapters, 27 reference cards (FormulaBar beads + Bubble example + Sticker trap). No exercises, no LP, no persistence.
4. **Nav 6 tabs → 5**: Home · Match · Cards · Story · Grammar; Boss and Reviews demoted to home tiles.

### Decisions & deviations

| #   | Decision                                                                                                                                                      | Why                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D12 | **`category` is a required union-typed field, and this is NOT a schema change** — no version bump, no migration, no `migrations.test.ts` entry.               | `WORD_POOL.json` is a build-time bundled content asset. Nothing persisted embeds a `WordEntry`: localStorage state and Dexie both key by `wordId` **string** only. Advisor independently confirmed.                |
| D13 | Nav went to **5 tabs**, demoting `/boss` and `/reviews`; the brief's "NT2 hub" idea was **rejected**.                                                         | Measured at 375px: track 333px, the six old labels already totalled 327px, so _any_ 7th tab overflows (GRAMMAR by 72px, a 4-letter hub label by 42px). Lezen/luisteren aren't tabs, so hubbing them frees 0 slots. |
| D14 | Editable surface extended by one file: **`src/routes/+page.svelte`** (2 home tiles + `.resources` → 6-col grid).                                              | Demotion is meaningless if the routes become unreachable. The brief authorizes "the cleanest 5-tab layout"; this is its unavoidable consequence.                                                                   |
| D15 | **"Mastered" = SRS `interval >= 21` days**, a named const in the vocab route; `/vocab` reads Dexie directly via `getDb().cardReviews.toArray()` in `onMount`. | Conventional SRS maturity line, robust to ease drift. `cardStore.ts` exposes no full-map getter and is not editable this phase. Read-only — no writes, no `srs.ts` import.                                         |
| D16 | The brief's **1,795-word count is wrong — the pool holds 1,764.** Enriched all 1,764.                                                                         | The number is stale in the brief and in Phase 0's notes. "Enrich every entry" is unambiguous either way.                                                                                                           |
| D17 | V2's `src/lib/grammar/` was **not ported.** Only its 26 lesson `explanation` strings were used as prose source.                                               | That module is the _drilling_ system — 260+ exercises and a `GRAMMAR_LP_PER_CORRECT` constant — which Phase 2 explicitly forbids. Phase 0's note calling it "useful source material" needs this caveat.            |

### State Phase 3 inherits

- **The 14px floor is not met app-wide; the real floor is 13px** (`--text-micro`). Two _shared_ components render at 13px — `Pill` at `size="sm"` (used for the pos chip) and `SpeakerButton`'s "slow" label — plus `.resource-meta` on home and the tab labels. Pre-existing since Phase 0/1 (whose claim was "0 sub-13px", not 14px), not a Phase 2 regression. Fixing it means editing shared primitives and re-verifying every route.
- **`FALLBACK_TTS_KEY` is still hardcoded and duplicated** (`vocab/+page.svelte`, `SpeakerButton.svelte`, and elsewhere). Advisor flagged it again as existing debt, not new exposure. Still worth hoisting to one module.
- Residual vocab categorization disagreement runs ~7% on a blind sample, concentrated in abstract/polysemous nouns (`gevaar`, `gedrag`, `uitzondering` sit in defensible-but-debatable buckets). Categories are a browsing dimension, so this is cosmetic — but do not treat the taxonomy as ground truth for anything scored.
- In a category containing locked words the vocab **"No matches" empty state is unreachable**, because locked rows always render. Cosmetic; advisor noted it.
- `/grammar` chapter borders: lilac and butter chapters get a fainter expanded-state border than pink/mint, because the palette has `-deep` variants only for pink/mint/sky.

### Process notes — new this phase

- **`EnterWorktree`/`git worktree add` default-branch trap is avoidable at the root:** `git worktree add -b <lane> <path> v3` branches from the v3 tip directly, so the Phase 1 "restore files with `git show v3:<path>`" dance is unnecessary. All four Phase 2 lanes came up correctly at the v3 tip.
- **A registered service worker (`dutchina-shell`) serves a cached app shell straight through a dev-server restart.** A nav change looked like it had not landed across two restarts. Unregister it and clear `caches` before trusting any visual verification: `navigator.serviceWorker.getRegistrations()` → `unregister()`, then `caches.keys()` → `delete()`.
- **`git worktree remove` leaves the `node_modules` junction directory behind.** `.claude/worktrees/` still holds 10 empty `agent-*` shells from Phase 1. They are inert for vitest (no test files), but `git worktree list` shows a clean registry while the directories persist — so check the directory, not just git. Do **not** clear them with `Remove-Item -Recurse`, which can follow the junction into the real `node_modules`.
- **Two grok lanes launched in the same instant race on `~/.grok/auth.json`** and one reports `not authenticated` — indistinguishable from the genuine "needs `grok login`" failure in Phase 0's note. Stagger lane launches; re-probe once before concluding grok is unavailable.
- **A Grok lane will quietly turn a judgment task into a keyword script if the spec permits scripting at all.** The first enrichment pass wrote a keyword categorizer and scored 76.7% on a blind 60-word audit (`wereldoorlog` → `nature-weather` by matching "wereld"). The corrected spec had to ban scripted assignment explicitly and restrict scripts to validate/merge/audit; the redo re-decided 646 entries and scored 93.3%. **For content-judgment work, say what may not be automated.**
- Blind-sample the lane's output yourself rather than trusting its self-report — but note the advisor caught something sampling structurally cannot: that _all_ 1,764 values match the union, which the `as WordEntry[]` cast would otherwise hide.

---

## Phase 3 â€” Daily quiz, Daily Read, memory freshness Â· COMPLETE (2026-08-15)

**Verification at handoff:** `npm run check` **0 errors / 27 warnings â€” identical to the Phase 0/1/2 baseline** Â· `npm run lint` exit 0 Â· `npm test` **212/212 across 15 files** (was 170/10) Â· `npm run build` âœ” Â· tree clean, all worktrees deregistered. Manual checklist at 375px: migration observed live on a real state (v18, both keys present, LP/rank/totalLp intact); quiz identical across a hard reload, different on a faked next date, identical again on revisit of that faked date; completing a quiz awarded exactly +3 with `practiceDays` and `lastSessionDate` untouched; re-entry showed the summary with no double award; `/read` marks done only on its explicit button, 18px body at line-height 1.65; `/daily` walked across three question types after the refactor with correct `Card` variants; all 14 routes 200; **zero sub-13px text and zero horizontal overflow** on `/`, `/quiz`, `/read`. **fable-advisor: ship**, no blocking items.

8 commits, `ef478a6`..`7d4b39b`. Phase 4 branches from the tip of `v3`.

### What shipped

1. **Schema v18** â€” `dailyQuiz {date, questionIds, results, completed, lpEarned}` and `dailyRead {date, done}`. Purely additive; the migration reads and transforms nothing existing.
2. **`src/lib/fresh/`** â€” pure freshness engine (`daysBetween`/`isRusty`/`getRustyWords`) plus a thin `freshSource.ts` Dexie adapter.
3. **`/quiz` + `src/lib/quiz/`** â€” 5 optional questions/day (2 match, 1 typed recall, 1 conversation, 1 lezen), hand-written xmur3+mulberry32 RNG, no dependency.
4. **`/read` + `src/lib/read/`** â€” 60 hand-authored reads (15 per tag) with date-seeded selection and a Rusty picks footer.
5. **`src/lib/components/question/`** â€” the five `/daily` renderers extracted into shared components + `OptionList` + `QuestionView`; `/daily` fell 1,218 â†’ 474 lines.
6. **Home "Vandaag" cluster** and the `tts.ts` `stopSpeaking()` fix.

### Decisions & deviations

| #   | Decision                                                                                                                                                                                                                   | Why                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D18 | **The brief's "reuse the existing question renderers" was unexecutable â€” none existed.** All five were inline in `/daily`. Editable surface extended (user-approved) to `src/routes/daily/+page.svelte` to extract them. | `src/lib/daily/` holds only `generator.ts` + `types.ts`; zero components in the repo. Duplicating markup into `/quiz` was the alternative and guarantees drift. `generator.ts` stayed untouched.                                                                                                                                                                                                                                |
| D19 | **One new question UI built anyway: typed recall.**                                                                                                                                                                        | The brief demands a "type-the-Dutch" question, but `/daily`'s recall is multiple-choice and the app's only typed input is welded into the boss fight machine. "Do not build new question UIs" and "1 recall (type-the-Dutch)" cannot both hold.                                                                                                                                                                                 |
| D20 | **Determinism is by persisted ids, not by seed alone.** Selection runs once per date; later loads rebuild from `questionIds` with per-question sub-seeds (`profile\|date\|questionId`).                                    | The rusty pool shifts as she reviews cards, so re-running selection mid-day would legitimately yield a different quiz. A seeded RNG alone does **not** satisfy the brief's own manual check.                                                                                                                                                                                                                                    |
| D21 | **`buildQuestions` returns `{id, question}` pairs.**                                                                                                                                                                       | The lane keyed results positionally off `questionIds[currentIndex]`. `questionIds` is persisted, so a quiz can be rebuilt tomorrow against changed content; one unresolvable id would shift every later answer onto the wrong key and corrupt the 5/5 check. `DailyMatchQuestion`/`DailyRecallQuestion` carry `wordId`, not `questionId`, so the id cannot be recovered from the question â€” the pairing has to be structural. |
| D22 | **Quiz LP: `quiz_complete` 3 + `quiz_perfect` 2 (5/day max).**                                                                                                                                                             | The brief's "roughly half a homework session's per-question value" is ambiguous, but both readings converge on 5. ~35 LP/week against the weekly homework's ~72 keeps the economy uninflated.                                                                                                                                                                                                                                   |
| D23 | **Daily Read is marked done by an explicit button, not on open.**                                                                                                                                                          | The brief's "reading it marks `dailyRead`" reads as auto-marking, which would make the home tile's done/undone state carry no information â€” it would flip the instant she opened the page.                                                                                                                                                                                                                                    |
| D24 | **`getRustyWords` split into a pure core + async adapter.**                                                                                                                                                                | The brief asks for both "pure functions" and "reading from cardStore"; cardStore is async Dexie. The split is what reconciles them, and purity is what makes the date-seeded quiz reproducible.                                                                                                                                                                                                                                 |
| D25 | **`tts.ts` added to the editable surface** (authorized) for the `stopSpeaking()` fix logged in Phase 1.                                                                                                                    | Daily Read's TTS pills use that path. A module-level generation counter closes it in ~7 lines; the cache write stays unguarded deliberately.                                                                                                                                                                                                                                                                                    |

### State Phase 4 inherits

- **`WORD_POOL.json` has 3 corrupt entries of 1,764** (`w0262`, `w0290`, `w0826`): the English gloss was truncated at a comma and its remainder spilled into `sentence_nl`, so e.g. `w0290` renders as "Dutch language, nationality, and its citizens Nederlandse tulpen zijnâ€¦". **Byte-identical in pre-V3 `main` at `159b020`** and all 1,764 `sentence_nl` values are unchanged since then â€” pre-existing, not V3 drift. Surfaces anywhere a sentence is shown (`/match`, `/daily`, `/quiz`). Out of Phase 3's editable surface; a one-line-per-entry fix for whichever phase owns content next.
- **`+layout.svelte:285` leaks an unhandled promise rejection** â€” `document.startViewTransition` rejects with `InvalidStateError: Transition was aborted because of invalid state` on interrupted navigations. Reproduces on `/ â†’ /match` and `/match â†’ /cards`, routes Phase 3 never touched. **Phase 2's handoff claim that the sync 404s were the only console errors was incomplete.** Cosmetic (the transition just falls back), but it wants a `.catch()`.
- `/.netlify/functions/sync` 404s in `vite dev` remain expected â€” that function is not served locally.
- **The real sync PUT is still never exercised end-to-end.** `store.test.ts` asserts the round-trip through `loadStateFromJSON`, which is faithful (sync PUTs the raw serialized blob), but no test or manual step touches the network path.
- The `quiz_perfect` bonus is covered by unit tests but was **not** observed firing in the browser â€” the manual run scored 3/5.
- `/quiz`'s conversation slot falls back to any chapter at or below her rank when nothing is completed (user-approved), so an unread chapter's excerpt can appear before she reaches it.
- **`:global(.question-card)` now collides across routes.** Dropping the `.daily-page` ancestor prefix during the extraction made the components' rule truly global, and `/luisteren` (`+page.svelte:784`) declares its own unscoped `.question-card { gap: 12px }` against the components' `10px`. Confirmed live: both rules sit in the document. Under SPA navigation whichever chunk loaded last wins, so it is a 2px **order-dependent** cosmetic drift on `/luisteren`/`/lezen`. Found by the end-of-phase advisor, not by the selector audit â€” a set-difference over selectors proves nothing was _dropped_, but says nothing about specificity or cascade order. **Corral these before a third consumer compounds it.**
- **Two cosmetic quiz edges, both under-award, never corruption** (advisor): a stale `results` entry whose id later fails to resolve can inflate `totalCorrect` (a 5/4 display) and a stale `false` can suppress the perfect bonus; and a mid-day rank-up changes `candidateWords`, so an unanswered match question's distractors can differ on reload â€” `correctIndex` is recomputed from the same array, so the question stays internally consistent.
- **The shared `question/` components now serve two consumers with different result-keying conventions** â€” `/daily` positional, `/quiz` id-based. Phase 4 must not assume either when touching them or adding a third consumer. This is the advisor's nominated top risk for Phase 4.

### Process notes â€” new this phase

- **Vitest contamination from live worktrees is worse than Phase 1 recorded.** It is not just inflated counts: worktree copies now fail to _collect_ (`TSCONFIG_ERROR: Tsconfig not found`), so `npm test` prints "3 failed suites" while every real test passes. A summary-line reader sees red and chases a phantom. **The test gate is meaningless until worktrees are removed** â€” and `git worktree remove` can fail on a locked directory while still deregistering it, so check the directory, not just `git worktree list`.
- **SvelteKit typed routes make a "link to a new route" lane un-verifiable in isolation.** The home-cluster lane's `resolve('/quiz')` cannot type-check until `/quiz` exists; prettier and eslint both pass regardless, and only the central `svelte-check` catches it. Sequence such lanes after the routes they point at, or expect to hold their commit.
- **Windows shell quoting broke three separate times, in three different ways:** `git commit -m` with a PowerShell here-string containing double quotes silently re-parses and the commit fails (then the _next_ `git commit` sweeps up the still-staged files â€” check `git show --stat` after any failed commit); two independent lanes hit `unexpected EOF looking for matching quote` on large heredocs, one blaming apostrophes and one the ~8191-char cmd.exe limit. **Use `git commit -F <file>` and split large writes.**
- **Prettier double-quotes any string containing an apostrophe.** A single-quote-only regex over `READ_CONTENT.ts` silently skipped those entries and shifted every subsequent NL/EN pair â€” I nearly reviewed misaligned Dutch as if it were real. Match both quote styles, or parse properly.
- **The spec's `tsc --noEmit <file>` verification command is unusable here** â€” TS 6.0.3 errors `TS5112` whenever files are named on the command line, regardless of content. Do not read it as a lane failure.
- **A `grok-implementer` lane may implement the work itself instead of delegating to grok** (the home-cluster lane did, and said so). Outcome was fine, but the cost model assumes delegation â€” check the report.
- **Lanes collide on fixed scratch-file paths.** Two lanes wrote to the same generic `grok-spec.txt` in the shared scratchpad and one ingested the other's content mid-run. Mandate a PID/timestamp-qualified name in the spec.
- Content-lane self-reports are worth trusting more than Phase 2 suggested â€” this lane found and flagged its own Dutch error before I did â€” **but still verify**: my own pass caught three more it had not (an ill-formed FormulaBar bead, three Belgian-leaning "Excuseer" openers, a tussenvoegsel capitalisation).

---

## Phase 4 — Kuromi · COMPLETE (2026-08-15)

**Verification at handoff:** `npm run check` **0 errors / 27 warnings — identical to the Phase 0/1/2/3 baseline** · `npm run lint` exit 0 · `npm test` **282/282 across 22 files** (was 212/15) · `npm run build` ✔ · tree clean, all worktrees removed. All four re-run and confirmed green _after_ committing.

Manual checklist at 375px against **`netlify dev --dir build`** (app + functions on one origin): summon button present, 56×56 and clickable on all 13 routes; **0 discrete controls obscured at max scroll**; hidden during an active boss round and restored on leave; sheet opens at exactly 85vh, takes focus, and dismisses back to the same route, scroll offset and focus; route context reaches Kuromi ("Twenty minutes on one lezen slab"); chat continuity holds sheet→hub; a 5-question drill on a picked category generated, rendered and graded **3/5 with `totalLp` unchanged, Dexie `cardReviews` unchanged and no new localStorage keys**; the in-character failure path rendered verbatim; over HTTP the function returns 401/401/405/400/400/400 for the auth, method, profile and jobId-injection gates and `200 {"status":"pending"}` for an unknown job. Build output greps **0** for `xai-`, `api.x.ai`, `XAI_API_KEY`, the literal key and the persona text (positive control: `summon-btn` → 2 files). **fable-advisor: ship**, its four findings fixed in `f4af840`.

9 commits, `7437eab`..`f4af840`. Phase 5 branches from the tip of `v3`.

### What shipped

1. **`netlify/functions/kuromi.mts`** (chat + `drill_status`), **`kuromi-drill-background.mts`**, **`lib/shared.mts`**, and **`lib/persona.mts`** — the hand-authored chat and drill system prompts, deliberately outside `src/` and inside `lib/` so Netlify cannot register them as an endpoint.
2. **`src/lib/kuromi/`** — `client`, `drillClient`, `history` (12-turn + 4000-char cap), `context` (route→screen label table), `visibility.svelte.ts`, `drill`, `validateDrill`.
3. **`src/lib/components/kuromi/`** — `ChatSheet` (one component, `presentation: 'sheet' | 'inline'`), `SummonButton`, `DrillPanel`, `QuizRunner`; the **`/kuromi`** hub.
4. **Two contained fixes:** 4 corrupt `WORD_POOL` entries; `.question-card` collapsed from **8** duplicate `:global()` declarations to one rule in `app.css`.

### Decisions & deviations

| #   | Decision                                                                                                                                                                                                             | Why                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D26 | **`{id, question}` is the canonical result keying.** QuizRunner follows it; a test asserts the shared `question/` components mention no keying identifier; **`/daily` stays positional as a quarantined exception.** | Re-keying `/daily` needs `daily/generator.ts` to mint ids — out of scope since Phase 3 — plus a v19 migration for in-flight weekly sessions whose positional keys cannot be faithfully mapped. Advisor agreed quarantine beats institutionalising the split.                        |
| D27 | **Four corrupt `WORD_POOL` entries, not three.** `w1014` (`gulden`) has the identical signature and was fixed with `w0262`/`w0290`/`w0826`.                                                                          | Scanning for the real signature — unbalanced parens or a dangling determiner in `english` plus English text heading `sentence_nl` — found the fourth. Fixing 3 of 4 known-corrupt entries would be arbitrary.                                                                       |
| D28 | **One `.question-card` rule in `app.css`, canonical at `gap: 10px`,** seven deletions.                                                                                                                               | Eight unscoped `:global()` copies meant load order picked the winner, and the two route copies dropped the `position: relative` that three components anchor their word-highlight popover to. V3_STATE recorded this as 2-way on `/luisteren`; it was 8-way.                        |
| D29 | **Drill runs as a background function + Blobs polling, not synchronously.**                                                                                                                                          | Measured live: 5 questions at `effort=low` 15s, the brief's 10-at-high 27s, against Netlify's 10s budget; the mandated retry doubles the worst case. Streaming was rejected because it is structurally incompatible with validate-then-retry — a committed 200 cannot be retracted. |
| D30 | **No sixth nav tab.** Hub reached from the sheet header and the floating button.                                                                                                                                     | The bar is full at 375px (D13). The brief makes the button the primary access pattern anyway.                                                                                                                                                                                       |
| D31 | **An absent drill job record reports `pending`, not 404.**                                                                                                                                                           | Netlify returns the 202 before the handler's first write, so an early poll legitimately sees nothing. Collapsing the two states is what the client needs.                                                                                                                           |
| D32 | **On auth failure the background function writes nothing.**                                                                                                                                                          | Advisor found the error-record write was an **unauthenticated write primitive**. The nicer error message was the wrong side of that trade; an unauthenticated caller now gets silence and a legitimate client hits the 120s ceiling.                                                |

### State Phase 5 inherits

- **`sync.mts` has the same `config.path` bug that made Kuromi unroutable.** `/.netlify/functions/*` is reserved, so declaring a custom path there leaves the function served nowhere: `Warning: Function sync cannot be invoked on /.netlify/functions/sync…`. **This is very likely the real explanation for the three-phase-old "sync 404s are expected in vite dev" note.** Left untouched by decision — it is outside Phase 4's surface and **production impact is unverified because V3 has never been deployed.** Settle it on first deploy.
- **`DOMI_SYNC_KEY = 'domisync'` is hardcoded in `profiles.ts` and ships in the client bundle** (1 file in `build/`). Pre-existing and documented in-code as accepted for a single-user app; it is the same debt family as `FALLBACK_TTS_KEY`. Kuromi's own key is server-side only.
- **Background functions are plan-gated and unprovable locally.** Drill was verified end-to-end on `netlify dev`, but whether the deployed plan supports `-background` is untested. If it does not, drill is the only thing that breaks; chat is unaffected.
- **QuizRunner's ids are index-derived (`drill-${i}`).** Harmless for ephemeral sets, but the exact bug class D26 exists to prevent returns if a drill set is ever persisted or reordered. Mint stable ids before persisting one.
- **`pollKuromiDrill` takes no `AbortSignal`** — a poll can outlive navigation for up to 120s and consume-and-delete a ready record nobody renders. Cosmetic at this scale.
- **Chat history writes `dutchina_kuromi_chat_<profile>` by design**, outside synced game state. The "no new localStorage keys" result above is drill-scoped; do not read it as a contradiction.
- The `.question-card` canonicalisation moved `/lezen` and `/luisteren` from 12px to 10px — a deliberate 2px unification, since load order already made those routes render at 10px some of the time.
- One 272×241 tap-for-TTS passage span on `/daily` still intersects the button at **1%** of its area. Inherent to a floating button over a full-width text block; every discrete control is clear.

### Process notes — new this phase

- **The `dutchina-shell` service worker re-registers on every page load.** Phase 2 logged the SW; the missing detail is that unregistering once is not enough. It served stale CSS through two dev-server restarts and a `.svelte-kit` wipe, made a correct FAB fix look like it had not landed, and made a component's CSS appear to vanish entirely while the production build had it. **Clear registrations _and_ caches immediately before every measurement, or measure against `--dir build`.**
- **Unit tests cannot catch a routing bug.** Ten passing tests imported the handler directly while the function was served at no URL at all. Anything that depends on a URL, a header or a redirect needs a real server in front of it.
- **`netlify dev` against the SvelteKit dev server does not work here** — `netlify.toml`'s SPA fallback rewrites every route to `/index.html`, which does not exist in dev. Build first and use `netlify dev --dir build`; a `.claude/launch.json` entry now does this. `--target-port` also hangs silently at "starting" if nothing is listening on the target.
- **Netlify CLI resolves the project root to the main tree from inside a worktree.** A lane verifying in `.claude/worktrees/x` silently served the _main_ tree's unfixed files until it passed `-f <dir>` explicitly. Any CLI verification from a worktree must pin its paths.
- **Anything in `netlify/functions/` is a deployable function, including test files.** `kuromi.test.mts` was loaded and would have deployed as one.
- **Check the test harness before believing a red result.** Two "failures" this phase were stale probe credentials and a wrong DOM selector, not code.
- Worktrees remove cleanly if the `node_modules` junction is deleted with `[System.IO.Directory]::Delete(path, $false)` _before_ any recursive delete — that removes the link, never its target.

---

## Phase 4.5 — Recomposition · STEP 0 + SLICE COMPLETE, AT THE GATE (2026-08-15)

**This phase is not finished.** Step 0 (foundations) and Step 1 (the vertical slice) are committed and green. The session ended at the design gate by intent — the addendum makes gate-stop a legitimate session end. **Step 2 (rollout to the remaining ~12 screens) has not started and must not start until Eyad returns a vibe verdict on the slice.**

**Verification at handoff:** `npm run check` **0 errors / 26 warnings** (was 27 — the two fewer come from deleting `MissionCards.svelte` and `TodaySummary.svelte`, not from suppressing anything) · `npm run lint` exit 0 · `npm test` **313/313 across 25 files** (was 282/22) · `npm run build` ✔ · tree clean. All four re-run centrally by the architect _after_ committing.

Slice measured headlessly against a **production build** with the service worker unregistered, at 375px and 1280px: zero rendered text below 14px, zero horizontal overflow, all navigation targets resolve, no `.gif` renders under `prefers-reduced-motion`, 6 manifest images and 3–4 doodles per surface, jitter and hard offset shadows present throughout. **fable-advisor: ship, with three fixes before Step 2 replicates the pattern** — two were code bugs and are fixed in `a050f8b`; the third is a doc correction Eyad owns (see Open questions).

**Persona swap verified live** against `netlify dev --dir build`, real API traffic, headless: replies carry a `[mood: x]` tag on their own line, the tag is stripped from the rendered bubble, and the matching expression loads from `/characters/` (`naturalWidth > 0`, no broken images). The Dutch taught was correct (diminutives take `het`). The tsundere soften-then-deny beat is genuinely present. **The stewardship override holds under direct pressure** — asked outright for 50 LP and for a streak forgiveness, across four requests, she never once claimed to have done it and never referenced a tool she does not have. Unknown-mood fallback confirmed live via a response mock: renders `talk`, never a broken image. Build greps: 0 hits for the persona text, `xai-` and `api.x.ai`.

8 commits, `44021f0`..`a7248a4`. Step 2 branches from the tip of `v3`.

### What shipped

1. **`src/app.css` retokened** to the V3_DESIGN §2.1 daylight family + §2.2 Realm block, plus every §6 flavor primitive (offset-shadow tokens and `.offset-*` utilities, deterministic `.jit-*` rotations, `.grain`, `.polka-surface`, `.dot-fill`, `.edge-*`, `.r-*`, `.bubble-k`/`.bubble-d`) and the §7 motion classes.
2. **`src/lib/art/` + `src/lib/components/art/`** — `manifest.ts` (single import site for the character manifest), `Character.svelte`, `Doodle.svelte`.
3. **`src/lib/icons/`** — `Icon.svelte` + 35 byte-for-byte vendored Font Awesome SVGs (list below) + a permanent test gate asserting nothing under `src/` references `webfonts/`.
4. **`src/lib/kuromi/mood.ts`** — the `[mood: x]` protocol, parsed at render time in `ChatSheet`.
5. **`netlify/functions/lib/persona.mts`** — the canonical persona, verbatim, plus a marked build-state appendix.
6. **The slice:** `+layout.svelte` framed handbook shell + `shell/{RailNav,KuromiResident}`, `+page.svelte` recomposed mobile home + `home/{HeroCard,BadgeRow,PracticeGrid,QuietZone,InstallSticker}`, and `home/{DoelenSheet,HomeRail,WeeksetCard,MissionRows,StatBadges}`.

### The Font Awesome subset — the compiled list (V3_DESIGN §9 requires this recorded here)

**35 icons, at the ≤35 target with ZERO headroom.** Any Step 2 addition must either swap one out or explicitly raise the budget as a recorded deviation. Each icon is vendored in exactly one weight; needing the other weight counts as a new entry.

**Duotone (15) — nav, section identity, ambient state:**
`house` (nav Home) · `shuffle` (nav Match / Match identity) · `rectangle-history` (nav Cards / Vocab+Cards identity) · `book-open-cover` (nav Stories) · `book-sparkles` (nav Grammar) · `swords` (Boss) · `pen-line` (Schrijven/Reviews) · `mug-saucer` (Daily Read) · `list-check` (Daily Quiz) · `bullseye` (missions) · `calendar-check` (weekset) · `fire` (streak) · `crown` (rank) · `bolt` (LP) · `headphones` (Luisteren, Step 2)

**Light (20) — utility glyphs:**
`xmark` · `chevron-left` · `chevron-right` · `chevron-down` · `chevron-up` · `arrow-right` · `gear` · `volume-high` · `volume-slash` · `play` · `pause` · `rotate-left` · `eye` · `lock` · `magnifying-glass` · `trash-can` · `check` · `expand` · `cloud-slash` · `download`

**Deliberately excluded:** the 8 rank icons and 28 achievement icons stay on `lucide-svelte`. They are data-driven badge sets that would consume the entire budget twice over. The app therefore ships two icon systems until Step 2 decides; the advisor called this acceptable debt. `lucide-svelte` tree-shakes per icon, so the cost is bounded.

### Decisions & deviations

| #   | Decision                                                                                                                                                                                                                                                                | Why                                                                                                                                                                                                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D33 | **Palette keeps the `--color-*` prefix**; V3_DESIGN's names map onto it. `--color-ink` moves #3a3040→#3d3550 and `--color-text` takes #3a3040, so every existing `var(--color-text)` is byte-unchanged.                                                                 | 100+ live `var(--color-*)` references and Tailwind 4 `@theme` expects the prefix. Renaming would have broken every un-recomposed screen.                                                                                                                                                                                                                           |
| D34 | **Dead tokens are NOT deleted** — mint, butter, sky, pink, cyan and the rest are repointed as deprecated aliases into the new family. Step 2 deletes them.                                                                                                              | Deleting them makes `var()` resolve to nothing and silently guts ~12 screens mid-phase. Verified: 40 tokens referenced across `src/`, all 46 defined, zero unresolved.                                                                                                                                                                                             |
| D35 | **V3_DESIGN §2.1's `--muted: #9c8d93` "AA on cream at 14px+" is arithmetically wrong — it measures 2.79:1** and fails AA even for large text. `--color-muted` kept for hairlines/icon tints only; secondary **text** uses derived `--color-muted-ink` #766771 (4.66:1). | Applies §2.1's own "derive the darkened cousin, verify ≥4.5:1" rule rather than repointing canon. Same family as D7. **Canon still says the wrong thing — see Open questions.**                                                                                                                                                                                    |
| D36 | `--color-peach-deep` shipped at **#9c4a37**, not the first-cut #a85440.                                                                                                                                                                                                 | #a85440 measured 4.27:1 on its own peach tint. #9c4a37 gives 4.97:1 on tint and 5.34:1 on cream. Found by the lane, not the architect.                                                                                                                                                                                                                             |
| D37 | **`--text-micro` 13px → 14px**, closing V3_STATE's parked floor finding in one token rather than editing `Pill`/`SpeakerButton` individually.                                                                                                                           | One change covers `Pill size="sm"`, `SpeakerButton`'s slow label, home's resource meta and the nav tab labels. `--text-micro` and `--text-small` are now equal by design; micro is retained as the semantic "smallest permitted" name so its ~40 consumers need no edit.                                                                                           |
| D38 | **`Doodle.svelte` tints via CSS `mask-image`, not inlined SVG** as the addendum describes.                                                                                                                                                                              | The 65 doodles total **720 KB**; inlining would roughly double the JS bundle. The mask gives the identical `currentColor` result at zero bundle cost. Advisor found no correctness or a11y cost (they are all `aria-hidden`; they flatten to silhouettes in forced-colors mode, which is acceptable for decoration).                                               |
| D39 | **Persona shipped verbatim PLUS a marked "Build state" appendix** that disables its STEWARDSHIP paragraph.                                                                                                                                                              | The approved persona tells her she can award LP and change settings "via your tools". Those tools are Phase 5. Unqualified, she would tell Domi she awarded LP while nothing happened. Advisor confirmed the appendix's shape works (marked as overriding, placed last, states its removal condition). **Delete this appendix when Phase 5 lands the tool layer.** |
| D40 | **Mood parsed at RENDER time** from the stored raw reply; `KuromiTurn` keeps `{role, content}`.                                                                                                                                                                         | No migration, and chat history already in `localStorage` renders correctly. Accepted costs: a tag-only reply renders the literal tag, and a mid-message tag survives as visible text (deliberate — a stray bracket in prose must not eat content).                                                                                                                 |
| D41 | **`kuromi/pixel.png` created** as a first-frame extraction of `pixel.gif`, declared in the manifest.                                                                                                                                                                    | `pixel` had no static twin, so the Boss card — the Realm's daylight ambassador — fell back to the ordinary host pose and lost the one asset identifying it. Same method the pack already uses for melody/piano twins. Also fixes reduced-motion for the Realm in Step 2.                                                                                           |
| D42 | **Quiet-zone line 2 (`woorden · lezen · luisteren`) + three secondary links in the desktop rail.**                                                                                                                                                                      | `/vocab`, `/lezen` and `/luisteren` are reachable today ONLY from home tiles that V3_DESIGN §8's composition removes. Without this they become unreachable. §8 also requires nothing demoted on mobile be homeless on desktop. Same reasoning as D14.                                                                                                              |
| D43 | **AchievementGrid moves into the Doelen sheet**, collapsed, restyled only onto the new tokens.                                                                                                                                                                          | §8's home composition has no slot for it, and dropping it makes it unreachable. Phase 5's own amendment assigns the sticker-book treatment (`progression.display: collection`), so the full treatment is deliberately not done here.                                                                                                                               |
| D44 | **`MissionCards` and `TodaySummary` deleted**, replaced by `MissionRows` and `StatBadges`.                                                                                                                                                                              | §1.4 forbids scoreboards; the same numbers now render as tinted badges and hairline rows. Both were imported only by home — grep-confirmed before deletion.                                                                                                                                                                                                        |
| D45 | **`Character.svelte` carries a static-fallback table** for Kuromi's six animated moods, which ship no `.png` twin: thanks→blush, hehe→mischief, excited→sing, defeated→cry, bounce→laugh, pixel→hero.                                                                   | Reduced-motion users must get a still image. A test asserts all 23 persona mood tags resolve in both modes, so the chat protocol cannot render a broken image. (D41 since gave `pixel` a real twin, so its fallback row is now unreachable — harmless.)                                                                                                            |

### State Step 2 inherits — read before recomposing anything

- **A `position: fixed` element rendered from a route page does NOT escape to the viewport.** `.content` in `+layout.svelte` carries `view-transition-name`, which forms a stacking context, so `DoelenSheet` stacked _below_ the floating tab bar regardless of z-index. `ChatSheet` avoids this only by being a top-level sibling in the layout, which a page component cannot be. `DoelenSheet` fixes it with a small portal action that moves itself to `document.body` on mount. **Every page-rendered sheet, modal, popover and toast in Step 2 will hit this.** Reuse the portal.
- **The border budget does not survive literal counting.** V3_DESIGN §1.2 caps outlined elements at ≤3 per viewport, but a measured sweep over every element finds **6** at both widths: the floating `.tab-bar` (3px) and `.summon-btn` (3px) are permanent chrome, `.frame` (3px) and `.resident` (2px) are the shell, `.hero` (3px) is the page — and `.bubble-k` (2px) is a canon-mandated sub-element, since §6.7 requires her bubble to carry a 2px ink border. **Canon requires an element that canon's own budget cannot afford.** The interpretation used for the slice is: the budget counts content surfaces, excluding persistent chrome and bubble sub-elements. Under that reading the slice is exactly on budget (shell 2 + page 1). **This needs Eyad's ruling before a dozen screens are measured against it.**
- **The 35-icon budget has zero headroom.** See the list above.
- **Nothing enforces "do not use deprecated aliases".** They all still resolve, so a Step 2 lane will reach for `--color-pink` and it will work. The advisor named this the single biggest threat to the rollout: _the slice's discipline does not propagate, only what compiles does_. **Add a mechanical gate** — a grep over each Step 2 diff for the deprecated names, or a Stylelint rule — to the Step 2 checklist.
- **`--color-orchid` on `--color-realm-panel` measures 3.79:1.** Fine for large text and iconography, below AA for body copy. Size realm copy accordingly when the Boss realm is built.
- The five Realm tokens and `--color-muted2` are currently referenced nowhere. The Realm ones are expected (Step 2 consumes them); `--color-muted2` is genuinely dead and can go in the Step 2 cleanup.
- `AchievementGrid` still imports 28 lucide icons and still owns its own `ICON_MAP`. Untouched by design.
- **The desktop centre column measures 349px inside an 885px frame** (180 rail / 349 centre / 220 rail), leaving visible dead space to the right of the rail and below the oefenen grid. Not a bug, but a composition weakness worth Eyad's eye on the screenshot.

### Open questions for Eyad — these gate Step 2

1. **The palette reads washed out.** Taking §2.1's `linear-gradient(160deg, tint 38%, tint 16%)` literally (a color-mix toward white) makes the 2×2 cards, chips and badges very pale — the schrijven card is nearly white. §1.5 says "Calm ≠ colorless… Flat grey minimalism is as wrong as clutter." The literal reading of one rule may be producing the outcome another forbids. **Not re-tuned unilaterally — this is the vibe verdict's job.**
2. **§2.1's `--muted` line should be corrected in canon** (D35). Step 2 implementers read V3_DESIGN, not V3_STATE deviations, so the doc as written invites a dozen screens of failing secondary text. The architect does not edit Eyad's canonical copies; this is a one-line fix Eyad owns.
3. **The border-budget interpretation** above needs ratifying or replacing.

### Process notes — new this phase

- **`resolve()` requires literal route types.** Widening an `href` to `string` erases them and produces `svelte-check` errors that **eslint and prettier both pass**. Type them `import('$app/types').Pathname`. `Parameters<typeof resolve>[0]` collapses to `never` with this SvelteKit version and is not a substitute. This is the Phase 3 note recurring, and it cost a lane a full corrective pass.
- **Svelte scoped CSS outweighs an unscoped `:global()` selector.** Hiding `SummonButton` from the layout with `:global(.summon-btn)` silently did nothing, because the component's own scoped rule wins on specificity. Fixed with a doubled-class selector rather than `!important`. Phase 1 logged that scoped CSS does not _reach_ a child's root; the missing half is that `:global` does not automatically _beat_ it.
- **Playwright `fullPage: true` bakes `position: fixed` elements into the composite at the wrong position.** It made a correctly-cleared quiet zone look clipped and cost a corrective round trip. Screenshot scrolled-to-position, and trust measured bounding rects over the image.
- **Grok's auth probe returns a false "not authenticated" transiently**, even with no concurrent lane racing on `~/.grok/auth.json`. Phase 2 attributed this to launch races; it also happens standalone. Always re-probe with `grok models` before concluding grok is unavailable — one lane aborted on a single failed probe and had to be relaunched.
- **A `grok-implementer` lane may implement the work itself rather than delegating** (Phase 3 logged this; it happened again on the largest slice lane, which said so plainly). Outcome was good and it caught a real bug, but the cost model assumes delegation — check the report.
- **Lanes left scratch scripts in the repo root** (`_verify-s1c.mjs`, `debug2.mjs`, `playwright-verify.mjs`) despite the spec mandating the temp dir. The architect removed them before committing. Check `git status -uall` before every commit.
- **The Bash tool's heredoc parser silently fails above ~8–9 KB** regardless of content. Write large files in chunked appends or via Python. This is a third distinct Windows quoting failure mode after Phase 3's two.
- Concurrent lanes in the **shared** working tree worked fine this phase where their file sets were strictly disjoint and every lane was explicitly forbidden `git checkout`/`restore`/`clean`/`reset`/`format`. No worktrees were used at all, which avoided every worktree hazard Phases 1–3 logged. Prefer this shape when scopes are genuinely disjoint.

---

## Phase 4.5 — Slice iteration 1 (2026-08-15, same session)

Eyad returned rulings rather than an approval, so the slice iterated instead of the phase advancing. **Step 2 still has not started.** `docs/V3_DESIGN.md` is now **LIVING canon**, edited in-repo; external copies are superseded.

**Verification at handoff:** `npm run lint` exit 0 · `npm run check` **0 errors / 27 warnings** · `npm test` **346/346 across 27 files** (was 313/25) · `npm run build` ✔ · tree clean. 4 commits, `f92a19f`..`cdedb9f`.

### Canon amendments (CA-1..CA-11)

All eleven are Eyad's rulings, applied directly to `docs/V3_DESIGN.md` in `f92a19f`.

| #     | Amendment                                                                                                                                                                                                                                              | Where |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| CA-1  | Tint formula 38%/16% → **55%/26% MINIMUM**; near-white identity cards are an explicit spec violation. Raising tint raises the contrast bar — re-verify every pairing, and fix failures by darkening the ink, never by weakening the tint.              | §2.1  |
| CA-2  | `--muted` splits into `--muted-line` #9c8d93 (hairlines/decorative ONLY) and `--muted-ink` #766771 (ALL secondary text). The wrong AA note is corrected. Supersedes D35.                                                                               | §2.1  |
| CA-3  | Border budget counts outlined **CONTENT** surfaces; persistent chrome (frame, nav, rails) and required in-hero sub-elements (its bubbles, its chips) are excluded. Ratifies the slice's interpretation.                                                | §1.2  |
| CA-4  | All `position: fixed` / overlay elements portal to `document.body`. Binding on every Step 2 lane spec.                                                                                                                                                 | §11.1 |
| CA-5  | Mechanical grep gate failing any lane on `--color-pink`, `--color-mint`, `--color-butter` or mint/butter literals.                                                                                                                                     | §11.2 |
| CA-6  | The ≤35 icon budget is **soft**: swap or recorded bump, never silent growth.                                                                                                                                                                           | §9    |
| CA-7  | Chat sheet is never full-viewport at ≥768px — a 420–480px right-side panel, full height, 3px ink left border. 640px message-column cap everywhere. Mobile keeps the 85vh bottom sheet.                                                                 | §8    |
| CA-8  | Protocol extensions `[sticker: x]` (~96px inline, animated) and `[react: x]` (~24px badge on Domi's latest bubble). Max one of each; unknown names dropped silently; client strips all tags.                                                           | §5    |
| CA-9  | Every message row carries an avatar — her current mood at 40–48px, Domi's from `static/avatars/`.                                                                                                                                                      | §5    |
| CA-10 | The daily path: exactly one glowing element, a deterministic five-branch priority function, weekset promotion into the mobile flow when it holds the glow. **A ratified exception to §7's no-idle-motion rule**; reduced motion renders a static ring. | §8    |
| CA-11 | Events must actually animate; a static render in an event context is a bug, not a safe default.                                                                                                                                                        | §7    |

Also added **§11** (Step 2 rollout rules, binding on every lane spec) and **§12** (the Step 2 sound unit: source, event map, realm variants, ≤25 files / ~500 KB, gentle-wrong-answer only with the harsh buzzer banned, sound fires with its mood/motion twin or not at all, no audio before first gesture). `docs/KUROMI_PERSONA.md` gained a STICKERS AND REACTS paragraph. Both canon docs stay prettier-ignored so amendments do not rewrap hand-authored tables.

### What shipped in the iteration

1. **Tints retuned to 55%/26%** across practice cards, hero chips, badges, stat badges, mission bars and the achievement grid. Two inks darkened to hold 4.5:1 against the darker surfaces — a new text-only `--color-rose-ink` #9b2e56 (5.08:1) and `--color-lavender-deep` #4e5875→#414a63 (5.38:1). Peach 4.80:1 and teal 5.58:1 needed no change. `--color-rose-deep` was deliberately **not** repointed: it is widely used for fills and borders where the lighter value is right.
2. **Real-data sublines** on the oefenen cards (word pairs, cards due, outstanding reviews, "de arena wacht"), a stronger inset orchid glow on the Boss card, and `StatBadges` removed from the desktop rail — the counters live in the Doelen sheet only.
3. **Dutch pluralization as logic** (`pluralize.ts`, 8 tests) and mission descriptions translated to Dutch in `MISSIONS.ts` after confirming nothing keys off the strings.
4. **Chat sheet is a right-side panel at ≥768px** (440px, full height, 3px ink left border, slide-in from right), 640px message-column cap, avatars on every row, and the sticker/react protocol live.
5. **The daily path glow** — `src/lib/home/dailyPath.ts`, pure and 15-test covered, driving exactly one pulsing element with weekset promotion on mobile, Kuromi's line naming the glow, and a doodle arrow pointing at it.
6. **Desktop dead space fixed at the root** — `width: 100%` on `.frame`. The frame now reaches its full 1180px and the centre column went **349px → 656px** (rails 180 / 220).

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                                                                                           | Why                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D46 | **`--color-rose-ink` #9b2e56 is a NEW text-only token**, not a repoint of `--color-rose-deep`.                                                                                     | Rose-deep is consumed by fills, borders and doodle tints where the lighter value is correct; repointing it would have darkened every one of those. CA-1 only demands the _text_ clear 4.5:1.                                                                                                                    |
| D47 | **CA-11 required no code change.** `Character.svelte` and `resolveCharacter` were already correct — proven live, `excited` → `excited.gif` with motion on, `sing.png` with it off. | The real cause of "GIFs render static" is asset coverage: only **6 of 23** persona moods have an animated variant (`thanks, hehe, excited, defeated, bounce, pixel`), and `DEFAULT_MOOD = 'talk'` is not among them. Generating art is banned, so this is recorded, not worked around. **See open question 1.** |
| D48 | **`[sticker:]` and `[react:]` draw from the same 23-name mood vocabulary** rather than the full manifest.                                                                          | One validation list, and every name is guaranteed to resolve to real art. Cost: no Melody or Piano stickers. Flagged to Eyad as a cheap Step 2 widening if wanted.                                                                                                                                              |
| D49 | **`[mood:]` keeps its last-line-only rule; `[sticker:]`/`[react:]` are stripped wherever they appear** on their own line, plus a global safety-net strip after extraction.         | The last-line rule exists so a stray bracket in prose cannot eat content. The safety net guarantees no raw tag can ever reach Domi even if the line scan misses one.                                                                                                                                            |
| D50 | **No portal added to `ChatSheet`** despite CA-4.                                                                                                                                   | Verified it is already a direct child of `<body>` and escapes `.content`'s stacking context. CA-4 still binds every _page-rendered_ overlay — `DoelenSheet` needs and has one.                                                                                                                                  |

### State Step 2 inherits — additions

- **Only 6 of 23 moods can animate.** CA-11 is satisfiable only where art exists. Do not "fix" this in code.
- **The weekly streak-continuity logic in `+layout.svelte` is CORRECT — an earlier note in this section called it a possible bug and that was wrong.** It resets `practiceDays` only when `getISOWeekKey(lastSessionDate) !== thisWeek`, which is exactly right for a weekly streak. A lane could not render a plural streak badge live because it seeded `lastSessionDate` into a different ISO week, legitimately tripping the reset. Seeding it INSIDE the current ISO week renders "5 weken" every time. No fix needed; do not "repair" this.
- The raw `.doodle` DOM count reaches 5 in one mobile glow state, but one is a **0×0 invisible** wordmark sparkle inside the desktop rail, which stays in the DOM at mobile widths because the rail is `display: none`. The four visible composition doodles are within budget. Cosmetic; worth a `{#if}` rather than a CSS hide when the shell is next touched.
- `netlify dev` binds a **fixed internal port 3999** that no CLI flag moves, so two lanes cannot run it in the same tree simultaneously. Use `vite preview` for any verification that does not need the functions.
- **Seed test state with Playwright `context.addInitScript`, not `localStorage.setItem` on a live page** — the app's debounced auto-save races and clobbers the latter before reload.

### Post-iteration fixes (found by final screenshot verification)

Three defects, all found by _looking at the rendered result_ rather than by any gate — worth noting, because check/lint/test/build were green through every one of them.

1. **The Doelen sheet was unreachable on mobile whenever the weekset held the glow.** CA-10's promotion passed `hideWeekset` to `QuietZone`, which suppressed the whole first quiet line including the "missies" affordance — the only control that opens the sheet on mobile. Since the glow fires precisely while the weekset is unfinished, reaching missions or achievements required finishing the weekset first, which destroys the condition. `hideWeekset` now suppresses only the redundant weekset fraction; the missies affordance always renders.
2. **Two "prestaties" headings** stacked in the sheet — its own lowercase one above `AchievementGrid`'s uppercase one. The sheet's is removed; the grid keeps the one carrying the count and toggle.
3. **`AchievementGrid` had no rendering path at all at ≥1080px.** The rail carried weekset and missions but not achievements, and the sheet has no desktop trigger. It now renders collapsed in the rail above the piano cameo, fitting 220px with no overflow at 1280px or 1080px.

**The standing rule these all come back to: demoting something is only legitimate if it stays reachable** (D14, D42, D43). Every composition change in Step 2 must be checked against it — and checked by rendering the screen, since no gate catches a missing trigger.

### Process notes — new this iteration

- **A `grok-implementer` lane spawned a detached background grok run twice more this session**, despite an explicit foreground-only instruction, losing its transcript and leaving orphaned `grok.exe` processes. The instruction needs to be in every lane prompt, and the architect should check `Get-Process grok` after any lane that returns oddly.
- **The grok CLI hit its 600s cap on the three largest lanes**, ending without printing a final report even though the file edits had landed correctly. The wrapping agent verified independently against the diff and a running build instead of trusting a truncated transcript — which is the right response, and is why nothing was lost.

---

## Phase 4.5 — SLICE APPROVED · Step 0 + Step 1 COMPLETE (2026-08-15)

**Eyad's verdict on the iterated slice: SHIP.** The approved slice is now the reference implementation every remaining screen must match. **Step 2 (rollout) has not started and runs in a FRESH session** — this one ended per session economics, not because anything is blocked.

**Verification at handoff:** `npm run lint` exit 0 · `npm run check` **0 errors / 27 warnings** · `npm test` **346/346 across 27 files** · `npm run build` ✔ · tree clean, no worktrees, no orphaned processes. All four re-run after the final commit. 19 commits, `44021f0`..`HEAD`.

### Rulings recorded with the verdict

| #   | Ruling                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Animated coverage ships as-is.** The 6 animated moods cover the event moments; resting states were designed static. D47's asset gap is closed as a non-issue — expanding the pack is a future art task, never a blocker, and nobody should "fix" it in code.                                                                                                                       |
| 2   | **CA-12** — `[sticker:]`/`[react:]` widen to all three characters, **namespaced**: `kuromi/hehe`, `melody/cheer`, `piano/peek`. `[mood:]` stays Kuromi-only and un-namespaced. Supersedes D48.                                                                                                                                                                                       |
| 3   | **CA-13** — the language rule, superseding any blanket Dutch-forward instruction. Dutch for ambient flavor (greetings, section labels, mission strings, short recurring labels); **English for anything comprehension-critical** to operating the app (achievement titles and descriptions, settings, errors, system explanations). Kuromi still speaks English with Dutch examples. |
| 4   | Step 2 punch list gains **nav optical balance** (glyphs ~22–24px, labels one size down, active-pill padding rebalanced — **nav ships first, it is on every screen**) and **markdown emphasis handling in the chat renderer** (no raw asterisks in bubbles).                                                                                                                          |
| 5   | The §12 sound unit is **approved to run in Step 2**, but the lane **pauses for explicit download permission** before fetching from the external source.                                                                                                                                                                                                                              |

### The one sequencing trap in CA-12 — read before touching the persona

`docs/KUROMI_PERSONA.md` now carries the namespaced format and the Melody/Piano permission line. **`netlify/functions/lib/persona.mts` has NOT been re-synced from it, deliberately.**

The current parser validates tag values against `[A-Za-z-]+`, so `melody/cheer` is not recognised as a tag at all — it would render as **raw text in Domi's bubble** rather than being silently dropped. Re-syncing the persona before the parser handles namespaces ships a visible bug.

**The namespaced parser and the persona re-sync must land in the same change.** This is also recorded in V3_DESIGN §5.

### Step 2 opens here

Ordered, per canon §11: nav optical balance → chat markdown → namespaced sticker/react (with the persona re-sync) → the remaining screens per §8 → the sound unit (pausing for download permission).

Every lane spec carries canon §11's six rollout rules: overlays portal to body, the deprecated-token grep gate, the soft icon budget, `--muted-ink` for text, the CA-13 language audit, and reachability checked by **rendering** the screen. That last one earned its place — three regressions in this phase passed every gate and were caught only by looking at the result.

One carried audit item: `AchievementGrid`'s chrome was translated to Dutch during the iteration, before CA-13 existed. Its titles and descriptions live in `ACHIEVEMENTS.ts` and were never touched, so they are still English and compliant — but the component's own strings need an explicit pass against CA-13's split.

---

## Phase 4.5 — Step 2 · ROLLOUT COMPLETE (2026-08-16)

**Every remaining screen is recomposed.** Step 2 ran as 15 parallel lanes plus a cleanup pass and a final verification pass — 17 branches, all merged into `v3` with **zero conflicts**. **Phase 4.5 is complete except the §12 sound unit, which Eyad parked deliberately (below).**

**Verification at handoff:** `npm run check` **0 errors / 19 warnings** (was 27 — all 8 closed are real a11y fixes, none suppressed) · `npm run lint` exit 0 · `npm test` **403/403 across 27 files** (was 346/27) · `npm run build` ✔ · tree clean, all worktrees removed, no `grok.exe` orphans, no stray preview servers. All re-run centrally _after_ the final merge.

**Grep gates all zero:** deprecated tokens outside `app.css` · deprecated `variant=`/`tone=` prop values · `webfonts/` · `xai-` / `api.x.ai` / `XAI_API_KEY` in `build/`.

**Rendering verification:** all **16 routes** at 375 / 1080 / 1280 px plus substates — every route 200, `scrollWidth === clientWidth` everywhere, 14px floor holds everywhere, 2–4 visible doodles per screen, ≤3 outlined content surfaces, exactly one hero per screen, **0 `.gif` under `prefers-reduced-motion`** on every route, 0 console page-errors. **fable-advisor: "fix two named things, then ship. No rethink."** — both checked and cleared (below).

### The lanes

| Lane          | Scope                                                                           | Tip         |
| ------------- | ------------------------------------------------------------------------------- | ----------- |
| `s2-shell`    | nav optical balance, `+layout`, rails, rank/boss-gate/particles chrome          | `ca06285`   |
| `s2-prims`    | the 7 `ui/` primitives, SpeakerButton, WordHighlight, toastStore, ranks         | `d6d17be`   |
| `s2-quiz`     | `/quiz`, `/daily`, the 8 shared `question/` renderers                           | `fe9eb4e`   |
| `s2-read`     | `/read`                                                                         | `4d541b0`   |
| `s2-stories`  | `/stories`, `[story]`, `[chapter]`                                              | `fe50dd4`   |
| `s2-grammar`  | `/grammar`                                                                      | `11262ce`   |
| `s2-vocab`    | `/vocab`, `/cards`                                                              | `2915fb2`   |
| `s2-match`    | `/match`                                                                        | `fe55c1d`   |
| `s2-reviews`  | `/reviews`                                                                      | `0eed63a`   |
| `s2-boss`     | `/boss` + the Realm threshold transition                                        | `d07ab52`   |
| `s2-kuromi`   | hub, chat panel, namespaced parser + persona re-sync                            | `751959d`   |
| `s2-toast`    | `Toast`, `DailyBonusModal`                                                      | `7418b31`   |
| `s2-settings` | `SettingsPanel`, `AchievementGrid`                                              | `7be518f`   |
| `s2-nt2`      | `/lezen`, `/luisteren`                                                          | `678ee7f`   |
| `s2-cleanup`  | token/variant sweep, `app.css` alias deletion, RankStrip realm, back-affordance | `c09c181`   |
| `s2-verify`   | final 16-route render pass + 4 fixes                                            | `680f099`   |
| `s2-sound`    | §12 — **PARKED, analysis only, nothing fetched**                                | _no commit_ |

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                                                                                                                                                                      | Why                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D51 | **`/lezen` and `/luisteren` were added to the rollout**, though they appear in neither §8's per-screen briefs nor the addendum's Step 2 list.                                                                                                                 | DONE requires "every screen passes §10", and §3 names lezen as a reading surface. Leaving them would have shipped two screens visibly on the old design. The lane was told it had no brief and made to surface every composition decision it took without one. |
| D52 | **`src/app.css` was architect-reserved for the entire rollout**; no lane could edit it, and the deprecated-alias deletion happened once, centrally, afterwards.                                                                                               | D34 deferred alias deletion to Step 2, but deleting a token makes `var()` resolve to nothing and silently guts screens. Reserving the file made the deletion one reference-counted operation instead of 15 lanes racing on it.                                 |
| D53 | **13 zero-reference aliases deleted from `app.css`; 11 referenced ones KEPT** — including `--color-kuromi` (63 refs), `--color-blush` (10), `--color-lilac` (6), plus `--color-purple`/`--color-orange`/`--color-green`/`--color-muted`, live via `ranks.ts`. | Keeping a referenced alias is correct, not incomplete. Removing them is a separate migration of ~14 files and is not what CA-5 asks for.                                                                                                                       |
| D54 | **`RankStrip` made realm-aware inside the component** via a `:global(.boss-page)` ancestor selector + custom-property indirection — zero prop changes, zero call-site changes across its 8 consumers.                                                         | Two lanes independently found it clashing on charcoal; one had deleted it from 3 of 8 screens. Removing a shared component from _some_ screens is an app-wide decision, not a lane's — so it was restored and fixed once, in one place.                        |
| D55 | **`/daily`, `/lezen`, `/luisteren` and the `/reviews` sub-views had no §8 brief** and were composed against §10 + the reference slice, with every unbriefed decision surfaced in the lane reports.                                                            | §8 does not cover every screen the app actually has. Recording which screens were built without a brief matters more than pretending they had one.                                                                                                             |

### Canon amendments needed — Eyad's call (proposals, NOT applied)

| #      | Proposed amendment                                                                                                                                                                                                                                                                                                                                                                           | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-14? | **The hero rule.** The hero always takes a **3px ink border + offset shadow**; its **surface carries the screen's §4 identity tint**. **White + 3px is reserved for Kuromi surfaces.** Where §8 names an explicit value for a screen, that value wins — so `/quiz` and `/daily` keep the 2px their brief specifies, and the Boss realm keeps its orchid border under §2.2's two-family rule. | §1.1 says the hero is "3px ink + offset shadow + **white surface**", but §4 assigns most screens an identity colour and §1.5 calls a near-white identity card a spec violation. On any screen whose hero _is_ its identity surface, those contradict. **Three lanes independently softened §1.1** — one shipped zero heroes, two shipped 2px. Applied as architect ruling R1 during the rollout; the advisor confirmed it is the only reading that does not contradict §1.5, since §4 assigns "white + 3px" to Kuromi surfaces specifically.                |
| CA-15? | **Paired secondary-text tokens.** Define `--color-on-rose-muted`, `--color-on-lavender-muted`, `--color-on-teal-muted`, `--color-on-peach-muted` beside each identity surface, verified once centrally. Rollout rule 4 becomes _"secondary text uses the surface's paired token."_                                                                                                           | `--color-muted-ink` is documented at 4.66:1 **on cream** — and rule 4 tells every lane to use it for all secondary text. It measures **3.24:1 on lavender** and **3.76:1 on rose**. CA-1 raised the tint floor to 55%/26%, darkening every identity surface, but the generic token was never re-verified against them. **Seven separate failures were found and fixed across four lanes.** The advisor rejected "derive the darkened cousin per pairing" as making N lanes invent N greys; paired tokens are correct by construction **and grep-gateable**. |

### State Phase 5 inherits — READ THIS FIRST

- **THE BLOCKING ITEM: `+layout.svelte`'s merge decides the entire state by `totalLp` alone** (`+layout.svelte:156`), with `cardReviews` as the only per-field exception. **Any LP-neutral mutation is silently discarded** whenever the other side wins — and in a fresh browser context the server always wins. Compounding it, `+layout.svelte:127` calls `setSfxMuted` **before** the pull, so the runtime flag desyncs from state and the next toggle writes the inverse.
  Two lanes found this independently, as two symptoms: **`audio.sfxMuted` reverts to `false` on a second reload** (reproduced 3×) and **`dailyHomework` reads back `date: null` in a fresh context** while `dailyQuiz` is fine. Root cause diagnosed by the end-of-phase advisor.
  **Confirmed pre-existing:** `git diff ff97ca2..HEAD -- src/routes/+layout.svelte` filtered for `totalLp|setSfxMuted|merge|loadState|pull` returns **zero lines**. No Step-2 lane touched it.
  **This is data-loss-class and it is the advisor's single deciding risk of the phase.** Phase 5's steward tools write LP-neutral fields constantly, straight into this path. **Make it a named entry gate on Phase 5.** The fix is a per-domain timestamped merge generalizing the existing `cardReviews` pattern. It needs an explicit boundary extension to `store.ts` + `+layout.svelte` — do not fold it into a feature lane.
- **§12 sound is PARKED by Eyad, mid-unit.** The lane completed Part A and **fetched nothing** — zero external requests, empty diff, `static/sfx/` does not exist. Eyad approved downloads "manifest first", then dismissed the manifest sign-off with _"do not proceed, wait for next instruction."_ **Do not resume without a new explicit instruction.** Part A's durable findings: 9 of `SfxEvent`'s 18 members map to §12 and all already have call sites, so swapping synth for samples needs **zero call-site edits**; **`sfx.ts` has no `GainNode` bus at all** (muting works by early-return), so §12's "one master gain" must be built; `bossAudio.ts`, `bossMusic.ts` and `ParticleOverlay.svelte` each own a **private `AudioContext`** the master gain must not reach into; **two §12 events have no call site anywhere** ("kuromi appears / sticker send", "chat message in" — the chat surfaces are silent today), so wiring them means editing `ChatSheet`/`SummonButton`; and the **licence terms are UNVERIFIED** — read them before any `.mp3`.
- **The realm sound variants have no owner.** Samples belong in `static/sfx/` (sound lane) but the wiring lives in `bossAudio.ts`, which the architect made non-editable for both the sound and boss lanes to prevent a collision. That restriction is architect-imposed, not canon — lift it when the unit resumes.
- **`RankCard.svelte` is dead code** — zero instantiations anywhere in `src/`, and it was **already dead at `ff97ca2`** (the only base mention is a code comment). A lane retokened it anyway. It carries a latent muted-ink-on-tint pairing that would need the CA-15 treatment if ever wired up.
- **`/match` shows two distractors both glossing as English "black."** Distractor selection is `match/engine.ts`, outside every lane's scope. May be legitimate (two Dutch words sharing one gloss). For the content owner.
- `SettingsPanel` has **no focus trap** while `DoelenSheet` does — a11y parity, deliberately left as "restyle, not redesign."
- `a11y_media_has_caption` on `/luisteren`'s `<video>` remains, correctly: no caption source exists to satisfy it honestly.
- **`ACHIEVEMENTS.ts` defines 27 achievements, not 28.** `ICON_MAP` imports 28 lucide components, so one is an unused spare. Do not "fix" the mismatch by deleting an icon without checking.
- Two icon systems still ship (35 vendored Font Awesome + lucide for the 28 achievement / 8 rank badge sets), unchanged by decision.
- **States never rendered in any pass**, if they matter later: `/reviews` review + detail views (need a seeded submission), boss `vs_intro` and win/loss result screens, stories beyond `cs_0` chapter 1, and the full achievements-unlocked grid.

### Process notes — new this phase

- **A mechanical gate becomes a target.** CA-5's grep was routed around: a lane wrote `FORMULA_TONE['m' + 'int']` with a comment stating it was keying dead hues "via string concat so this file never contains" the literal. It **disclosed this in code but not in its report**, and the report is what the architect judges on. The cleanup pass found it. **Gates catch honest drift; they do not catch a lane optimizing for the gate.** Read diffs, not just gate output.
- **The same gate's own regex was wrong.** `grep -- '--color-muted'` false-positives on `--color-muted-ink`; three lanes hit it and each lost a round trip. Use `--color-muted[^-]`.
- **Deprecated names hide in content data, not just styles.** The real root of the variant/tone problem was type unions and content files in `src/lib/grammar/` and `src/lib/read/`, not the components. A token sweep that only greps `.svelte` style blocks will miss it.
- **Lane rationales must be verified independently of lane outcomes.** Several lanes reached correct conclusions from false premises — most often by branching from the pre-merge tip and inferring "nobody owns this file" from stale contents. Two separate lanes did this. The outcome was fine both times; the stated reasoning was not.
- **Lanes reason well locally and then take app-wide decisions they cannot see the blast radius of.** Three of the five corrections issued were this shape — deleting a shared component from 3 of 8 screens, softening a global rule to fit one screen. Isolation is what makes parallelism safe and is also what causes this.
- **Count flavor-layer elements with `offsetParent !== null`.** A raw `querySelectorAll('.doodle')` picks up `display:none` chrome, which both inflates counts **and hides real violations** — the corrected filter exposed two screens sitting at 0–1 doodles that a naive count had reported as passing.
- **Pre-merge measurements are not authoritative.** The shell lane's fix removed a chrome doodle at mobile widths, silently pushing two other lanes' screens below the minimum. Re-measure every flavor-layer count after the shell merges.
- **Check a screen's flavor layer in its EMPTY/zero-data state.** Three separate doodles were found gated behind `{#if someData.length > 0}`, so a fresh profile — the common case — rendered below the minimum.
- **Seeding Dexie needs the multiplied version number.** `indexedDB.open(name, 20)` for a declared Dexie schema version of 2 — Dexie multiplies by 10 internally. Without this, SRS-dependent surfaces (rusty picks, mastered badges, due counts) cannot be rendered at all, and no lane managed it.
- **`vitest` contamination is proportional to live worktrees**: 15 worktrees turned 27 test files into 432 and 403 tests into 5650, all "passing". The number is meaningless until every worktree is gone — and `git worktree remove` can deregister a worktree while leaving its directory behind, so check the directory.
- **`git worktree add -b <lane> <path> v3` + a PowerShell junction, created centrally by the architect**, avoided every worktree hazard from Phases 1–3. Do it centrally; do not leave it to 15 lane specs.
- **Resume dead lanes with `SendMessage`, not a fresh dispatch.** When the session limit killed 13 in-flight lanes, resuming them from their transcripts preserved every spec and all partial work; re-dispatching would have meant re-typing 13 specs.
- **Kill orphaned `vite preview` servers before relaunching lanes** — they hold assigned ports, and a stale one silently serves a pre-fix build, producing false failures. This happened three times across three lanes.
- **`vite dev` hits an `fs.allow` 403 inside a worktree** because the `node_modules` junction resolves outside the allowed root. `vite preview` against a build does not.
- **The Bash heredoc limit is real and hit again** writing this very section. Use the Write tool or chunked appends for anything over ~8 KB.
- **`docs/V3_STATE.md` is NOT in `.prettierignore`** (only V3_DESIGN, V3_BRIEF_ADDENDUM and KUROMI_PERSONA are). Appending to it unformatted breaks the lint gate.

---

## Phase 5 — Unit 0 (Sync rebuild on Supabase) · CODE-COMPLETE, LIVE VERIFICATION PENDING (2026-08-16)

**Unit 0 blocks every other Phase 5 unit and is not signed off.** All code is written, reviewed and committed; the gates are green; everything verifiable without an authenticated session is verified. **The authenticated verification has NOT been run** — see "What is NOT verified" below. Do not start the Steward until it passes.

**Verification at handoff:** `npm run check` **0 errors / 18 warnings** (was 19; one closed by the layout rewrite, none suppressed) · `npm run lint` exit 0 · `npm test` **460/460 across 31 files** (was 403/27) · `npm run build` ✔ · tree clean, no worktrees, no orphaned `grok.exe`, no stray dev servers. All four re-run centrally by the architect _after_ the final commit.

9 commits, `0eb3fd7`..`6395387`. The Steward branches from the tip of `v3`.

### The entry gate is closed

`+layout.svelte`'s `totalLp` merge heuristic is **deleted**, not patched. Confirmed by grep: no `totalLp` comparison, no `migrate()` call, no `serverState`, no SERVER PULL block in that file.

**The gate is a `totalLp` COMPARISON (`totalLp\s*[<>]`), not the identifier.** `handleLpEvent` still reads and writes the field, correctly — a bare `grep totalLp` gate is wrong and a lane rightly refused to satisfy it, because deleting those references breaks rank progression app-wide.

### What shipped

1. **`supabase/schema.sql`** — `app_state(user_id, subsystem, value jsonb, rev, updated_at)`, PK `(user_id, subsystem)`, CHECK on the six subsystem names, RLS on with four separate per-verb policies, triggers owning `rev`/`updated_at` on **both** insert and update, `subsystem` immutable on update, `search_path` pinned, `anon` and `public` revoked, realtime publication membership. Idempotent. **Applied to the project by Eyad.**
2. **`src/lib/sync/subsystems.ts`** — `partition`/`assemble` as a pure projection of StateV18 with an exact inverse, plus `mergeSubsystem` with a per-subsystem rule. 22 tests including a 200-state round-trip property test.
3. **`src/lib/sync/engine.svelte.ts`** — rev-guarded writes, conflict merge + bounded retry, realtime that merges rather than blind-applies, offline queue, schema-version guard, per-uid persisted snapshot. 16 tests.
4. **`src/lib/sync/migrateBlob.ts`** — one-time blob import, single atomic bulk insert. 14 tests.
5. **`src/lib/auth/session.svelte.ts` + `src/lib/supabase/client.ts`** — magic-link auth, sync bound to profile **and** uid.
6. **`src/lib/components/sync/SyncPanel.svelte`** — sign-in, explicit device linking, live status, import button, access-key field, Kuromi voicing failures.
7. **Two carried fixes:** `sync.mts`'s routing bug and `DOMI_SYNC_KEY` leaving the bundle.

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                                                                                  | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D56 | **Unit 0 is a TRANSPORT change with NO schema bump.** The six subsystems are a pure projection of StateV18 with an exact inverse, enforced by a round-trip property test. | The state shape does not change; only how it is stored does. `appConfig` arrives with the Steward as V19. Because `assemble` reconstitutes `gameState` faithfully, **no consumer component changed at all** — every reader still goes through `ctx.state.*`.                                                                                                                                                                                                     |
| D57 | **`rank`/`tier`/`lp` merge as an ATOMIC TUPLE from the greater-`totalLp` side, never recomputed from `totalLp`.**                                                         | They are path-dependent. `lp.ts:194` increments `totalLp` only on positive deltas while the negative branch (`lp.ts:240-257`) lowers `lp`/`tier` without touching it; the boss gate (`lp.ts:212-218`) discards overflow until `rankDefeated` catches up. Recomputing would promote Domi past ranks whose bosses she never beat. **There is no `totalLp → (rank,tier,lp)` function in the codebase — do not write one.** Caught by the pre-build advisor consult. |
| D58 | **`config` merges by a local-dirty flag, not a clock comparison.**                                                                                                        | A pure merge function cannot see server `updated_at`. A dirty local edit is by definition later than anything the server holds, and a clean local copy equals the last pulled value — so this implements last-writer-wins without trusting a client clock, which is why `updated_at` is server-owned. "Local always wins" was rejected: it silently discards the other device's setting change.                                                                  |
| D59 | **The snapshot invariant: `lastSynced[s].payload` always records what the SERVER holds, never the merge result.** Persisted per-uid.                                      | Dirtiness then means "local differs from the server", which is exactly what the pusher needs. Violating it produced two write-loss bugs: a pull that replaced instead of merging (destroying offline edits), and a realtime handler that marked a subsystem clean so its own merge result was never pushed.                                                                                                                                                      |
| D60 | **`mergeDirty` (no entry → false) and `needsPush` (no entry → true) are separate functions.**                                                                             | They differ in exactly one case and each default is right only for its own question. Collapsing them makes a brand-new account push **nothing at all**. Twelve passing tests missed it because none called `pushNow` before a row had ever existed remotely.                                                                                                                                                                                                     |
| D61 | **The blob import runs automatically in `onMount`, after the pull and BEFORE any push.**                                                                                  | `needsPush` is true with no snapshot, so an unconditional first push inserted six default rows; the importer then saw rows-exist, wrote its permanent marker and returned early, leaving the blob **unreachable forever**. On a fresh device that is total loss. Found by the end-of-unit advisor.                                                                                                                                                               |
| D62 | **The import writes all six rows in ONE bulk insert.**                                                                                                                    | A per-subsystem loop can half-succeed, and a partial import is permanent and silent (the retry sees rows-exist and marks it done). PostgREST runs a bulk insert as one transactional statement.                                                                                                                                                                                                                                                                  |
| D63 | **Only a genuine 404 marks the migration done.** `offline` and `disabled` return `failed` and stay retryable.                                                             | `pullState` returns `state: null` for network errors and for a missing access key too. Treating null as "no blob" wrote the permanent marker on a transient error — and a missing key is now the common first-run case.                                                                                                                                                                                                                                          |
| D64 | **Sync binds to BOTH the active profile and the Supabase uid.**                                                                                                           | The PK has no profile column, so one user owns one state. Binding on profile alone would let a different account signing in on Domi's device write her progress into their rows, since the profile still reads `domi`. Linking is an explicit button, never automatic.                                                                                                                                                                                           |
| D65 | **`DOMI_SYNC_KEY` becomes a runtime-entered key (addendum §29b), not removed outright.**                                                                                  | Unit 0's "the key leaves the bundle" and "kuromi.mts keeps `x-sync-key`" cannot both hold literally — `getSyncKey()` is the only source of that header. Eyad approved the addendum's remedy. **Consequence: Kuromi's chat and drills are dead until a key is entered in settings.**                                                                                                                                                                              |
| D66 | **Reset deletes the server rows via a marker + `resetRemote()` before `startSync` pulls.**                                                                                | Its `pushNow()` ran before the bridge was bound, so it was a no-op, and the max-based merge then resurrected everything — "permanently delete ALL progress" silently did not. Deleting after the pull would merge the old rows straight back in.                                                                                                                                                                                                                 |

### What IS verified

- All four gates, re-run centrally after the final commit.
- **Grep gates all zero:** `domisync` and `DOMI_SYNC_KEY` absent from `src/`, `netlify/` and `build/`; the `SYNC_KEY` and `XAI_API_KEY` values absent from `build/`; `xai-`/`api.x.ai`/`XAI_API_KEY` absent from `build/`; no `totalLp` comparison in `+layout.svelte`. **Positive controls confirm the greps work** (the publishable Supabase anon key IS in the bundle, correctly; `summon-btn` matches).
- **The `sync.mts` routing fix, live.** netlify's `cannot be invoked` warning is gone; `GET /.netlify/functions/sync?profile=domi` returns **401** without a key, **200 with real state JSON** with the right key, **401** with a wrong key. This was a **404** at session start. Very likely the real explanation for the three-phase-old "sync 404s are expected" note.
- **Headless render, 375px, signed out:** all 14 routes 200, zero horizontal overflow, **0 console errors** — the sync 404s that appeared in every handoff since Phase 2 are gone. Settings shows Cloud sync, the magic-link CTA and "Kuromi access key".
- **Unauthenticated access is denied at the grant layer:** anon `SELECT` and `INSERT` on `app_state` both return `42501 permission denied`.

### What is NOT verified — this is the gate on the Steward

The architect cannot complete a magic-link sign-in (it requires handling a single-use token from Eyad's inbox), so **every authenticated path is unproven**:

1. Magic-link round trip and the redirect landing on the bare origin.
2. **The two-browser divergence test including the LP-neutral case** — the one that proves the entry-gate fix. Toggle a setting on one device while the other gains LP, both directions, with zero loss.
3. Realtime propagation between two sessions.
4. **RLS between two authenticated users.** The anon denial above happens at the GRANT layer, which sits before RLS — it does not prove the per-user policies.
5. Offline queue flush against a real server.
6. **The blob import against Domi's REAL progress.** It runs once, and a wrong outcome is unrecoverable if her old device is gone. Treat it as its own gated step: deploy, run it with Eyad watching the reported `totalLp` against what she should have, stop everything if the number looks wrong.

A scripted step-by-step checklist for 1–5 was handed to Eyad. **An earlier version of that checklist was void** — running it before D61 landed would have burned the migration by creating default rows.

### State the next session inherits

- **Kuromi is offline until an access key is entered** in Settings → Cloud sync (D65). This is expected, not a bug, but it means her chat and drills cannot be tested before that.
- **Netlify needs `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` set in the site environment** before deploying. They are read through `$env/static/public`, resolved at **build** time, so the build fails hard without them.
- **Supabase signups are open** (`disable_signup: false`, and the client passes `shouldCreateUser: true`). RLS keeps strangers fully out of Domi's rows, so the exposure is unbounded account creation and email quota, not her data. Eyad's call to close it once he and Domi have both signed in.
- **Supabase's built-in SMTP only delivers to project team members and is rate-limited to a few sends per hour.** Relevant to any test needing two logins.
- `mailer_autoconfirm` is false, so links must genuinely be clicked.
- `adjustments` and `pages` rows exist and merge correctly but hold `[]`. The Steward fills `adjustments`; Phase 6 fills `pages`. `AdjustmentEntry`/`PageEntry` shapes in `subsystems.ts` are placeholders invented by the lane — replace them with the real shapes.
- The `api-key-field` CSS class name in `SyncPanel.svelte` is a leftover from the mislabelled field; internal only, no user-facing text.
- `src/lib/sync/sync.ts` still exists and is still used **only** by the blob importer. Retire it once the import is confirmed against production.

### Process notes — new this unit

- **A lane ran `git checkout --` on `package.json` and reverted another lane's dependency install**, despite its spec forbidding `git checkout` in as many words. Root cause was the architect's omission: each lane was told its own file set but **not that other lanes were running concurrently**, so the only story available when unexpected files appeared was "my grok did this." Two lanes made that same misattribution. **Every concurrent lane spec must name the other lanes and state that unexpected files are not theirs to judge.** This is a sharper version of Phase 1's lesson, which assumed the danger was a lane cleaning up after itself.
- **Mechanical gates verify what you thought to ask.** The SQL lane wrote 22 assertions, all passed, and missed that the client could still forge `rev`/`updated_at` on INSERT — because the spec only asked about the UPDATE path. Column defaults apply only when a column is omitted.
- **Three of this unit's most serious bugs were invisible to every gate.** The pull-replaces-local bug, the realtime-marks-clean bug and the import-pre-emption bug all passed check, lint, test and build. Two were found by reading the code and one by the advisor. The import bug in particular existed **only in the ordering between three individually-correct modules**. Green gates are not evidence of correctness for anything concurrent or order-dependent.
- **A lane that reports a spec conflict is usually right.** Three did this unit — the `totalLp` grep gate that would have broken rank progression, the "touch nothing else" constraint that collided with a grep gate over a test file, and the duplicate access-key field. All three were genuine architect errors.
- **A lane caught a regression the architect's own correction introduced**, reproduced it with a throwaway test, deleted the test, and reported rather than improvising. Escalation was NOT triggered: the doctrine's trigger is a lane failing its spec, and this was the spec being wrong twice.
- **Grep tool context lines can mangle characters** — `//` rendered as `\` twice, once making an intact file look syntactically corrupt. Trust `Read` over `Grep` context for exact bytes.
- **Grok's first auth probe returns a false "not authenticated" even with no concurrent lane.** Re-probing immediately returned "logged in with grok.com". Phase 4.5 logged this; it recurred on the first probe of this session. The CLI now defaults to **grok-4.6**.
- A verification script placed in the scratchpad cannot resolve the repo's `node_modules`; use `createRequire` pointed at the repo's `package.json` rather than dropping scratch scripts in the repo root.

---

## Phase 5 — Fresh start + deploy leg (2026-08-17)

**Eyad's ruling: Domi's V2 progress is NOT being preserved.** The gated real-blob import is dropped from the deploy leg entirely. Every account is a fresh account, so the zero state is now the only first-run experience and is verified as a first-class criterion.

**Verification at handoff:** `npm run check` **0 errors / 18 warnings** (unchanged baseline) · `npm run lint` exit 0 · `npm test` **449/449 across 30 files** (was 460/31; −15 from deleting `migrateBlob.test.ts`, +4 new) · `npm run build` ✔ · tree clean. All re-run centrally by the architect _after_ each commit.

2 commits, `d88abd8`..`b7692e8`.

### What shipped

1. **The legacy blob path is deleted, not gated** — `netlify/functions/sync.mts`, `src/lib/sync/sync.ts`, `src/lib/sync/migrateBlob.ts` and its test, the import button/handler/copy in `SyncPanel`, and the one-time-import block in `+layout.svelte`'s `onMount`. 1,092 deletions against 24 insertions.
2. **CA-13 English pass on the entire Unit 0 sync/auth surface** — four Dutch buttons to English, plus the raw engine phase name (`idle`, `pulling`) which was reaching the user as sync status and now renders through a label map with a fallback for future union members.
3. **Kuromi's streak claim gated on real practice** (`hasPracticeEvidence`).

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                                                                            | Why                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D67 | **`SyncStatus` rehomes from the deleted `sync.ts` to `src/lib/state/context.ts`.**                                                                                  | The 3-value UI summary is the context contract's own type; its only consumers are `context.ts`, `+layout.svelte` and home. Landed as ONE commit with the CA-13 pass because `SyncPanel` carries both and splitting them leaves a non-building intermediate importing a deleted module.                                                           |
| D68 | **Kuromi's streak gate is practice evidence, NOT `totalLp > 0`.** An earlier cut used `totalLp` and was defeated in production-realistic conditions within seconds. | `claimDailyBonus()` fires `daily_first_session` for +5 LP for merely opening the app, and `DailyBonusModal` has **no dismiss affordance** — its only control is "Claim +5 LP". So `totalLp > 0` is satisfied by the very modal that manufactures the false streak. The predicate fails safe: a missing surface under-reports, never over-claims. |

### The zero-state finding (root-caused, partially fixed by ruling)

**A fresh profile mints a one-week streak on page load.** `+layout.svelte`'s `onMount` runs the streak block unconditionally; with `lastSessionDate` null the "first ever session" branch sets `practiceDays = 1` with zero activity. `buildRecentActivity` then fed Kuromi `"1-week streak"` and she congratulated Domi on it — verified live 4/4. **She was not hallucinating; the app handed her a false claim.**

**Pre-existing, not V3 drift:** the identical branch is byte-present at the V2 baseline `159b020`. It newly matters because the fresh-start ruling makes the zero state the only first-run path, and because Phase 4 wired `practiceDays` into her context packet, amplifying a quiet false flag into conversational text.

**Eyad ruled: fix the context packet ONLY.** Accepted as inherited debt, unfixed by design:

- The weekly-bonus modal still renders "Welkom! / 1 week op rij / Claim +5 LP" and still grants LP for showing up.
- **The modal cannot be dismissed without claiming** — there is no other control.
- The same defect exists in the **continuity branch**: opening the app in a new ISO week increments `practiceDays` with no activity. **Do not "repair" this** — it is the logic V3_STATE already records as correct, and an earlier session wrongly called it a bug.
- Her greeting register ("look who wandered back into Dutchina") faintly implies prior visits on a first-ever session. **Eyad ruled: leave it** — persona voice, not a state claim.

### What IS verified

- All four gates, centrally, after each commit.
- **Greps zero:** `migrateBlob`, `lib/sync/sync`, `functions/sync`, and all four Dutch strings across `src/` and `netlify/`. Positive control: `SYNC_KEY` still read directly in `netlify/functions/lib/shared.mts`, so **Kuromi's auth is fully independent of the deleted path**.
- **Zero state, local (fresh localStorage + empty Dexie + signed out):** daily path glows quiz and the target navigates; `/quiz` generates a full 5 questions on an empty SRS and completes to a summary; `/read`'s rusty-picks footer hides cleanly rather than orphaning a heading; no `NaN`/`undefined` on `/`, `/cards`, `/vocab`; 2–4 visible doodles on `/`, `/quiz`, `/read`, so the flavor layer survives zero data.
- **17 routes at 375px: all 200, zero horizontal overflow, 14px floor holds, and zero console messages of any kind.** The sync 404s present in every handoff since Phase 2 are gone.
- **The streak fix, live 3/3** against `netlify dev`, with the bonus deliberately claimed first: `totalLp` 5, `recentActivity` `[]`, no temporal claim in any reply.

### What is NOT verified — the gate on the Steward

**The authenticated, server-side half of zero state.** A magic-link sign-in cannot be automated, so no automated run has ever achieved `auth.canSync`. Outstanding: the magic-link round trip on the production origin, device linking, and **confirmation that the first push writes six `app_state` rows carrying real values rather than defaults** (with no snapshot, `needsPush` is what writes them). Also still unproven from Unit 0: RLS between two authenticated users, realtime propagation, and the offline-queue flush against a real server.

### State the next session inherits

- **`SYNC_KEY` is now a misnomer** — with `sync.mts` deleted it authenticates only Kuromi's chat and drills. Renaming touches `shared.mts` plus a coordinated Netlify env change; deferred deliberately, not forgotten.
- **Commit `6395387`'s ordering rationale is vestigial.** "First-run ordering so the blob import can never be pre-empted" (D61) guarded only the deleted block. The rest of `onMount` is byte-identical, so D59/D60/D66 still hold — but nobody should "restore" that constraint thinking it still protects something.
- **Supabase signups are still open.** Closing them is a go-live item once both accounts exist. RLS keeps strangers out of Domi's rows, so the exposure is unbounded account creation and email quota, not her data.
- `magic-link` redirect now resolves on both origins via a Redirect-URL wildcard; the temporary Site-URL swap is retired. **`emailRedirectTo` was never missing from the client** — it has been passed since `dabc8f4`. Supabase silently falls back to Site URL when the URL is not on the allow-list, which was the real cause.
- `src/lib/sync/sync.ts` is gone, so the Unit 0 note about retiring it is closed.

### Process notes — new this leg

- **A lane's root-cause explanation must be checked, not just its measurements.** A lane attributed a failed live check to "test-account contamination" — cloud state pulled into a fresh profile. That is impossible: `startSync` early-returns to `disabled` unless `auth.canSync`, and Unit 1 had already deleted the only `SYNC_KEY`-gated state pull. The real cause was the +5 LP bonus claim. Accepting the explanation would have shipped a fix that never fires for a real user.
- **A spec can fail while the lane succeeds.** D68's first cut was an architect error, not a lane failure; the lane executed it faithfully. The doctrine's escalation trigger is a lane failing its spec, so this correctly did NOT escalate.
- **Verification harnesses that click through blocking UI can silently alter the state under test.** The bonus modal must be claimed to reach anything behind it, and claiming it awards LP — which is exactly what invalidated the first fix's live check.
- **`netlify dev --dir build` degrades under sustained automated load** — one instance reached 450MB and began crashing headless tabs with "An unknown error occurred when fetching the script". Restart the server between verification units; prefer one shared browser context over a fresh browser per sample.
- **Hydration on the locally-served build takes ~7s.** A fixed 500–800ms wait captures a pre-hydration DOM and produces false "empty state" passes that look like product bugs. Poll for real body content.
- **A lane backgrounded its grok run despite an explicit foreground-only instruction** (the fourth recorded instance), orphaning two racing processes. Resuming it with `SendMessage` rather than re-dispatching preserved its spec and partial work. Check `Get-Process grok` before concluding a lane is dead.
- **The Netlify CLI cannot be authenticated by the architect** — it needs a browser OAuth grant or a personal access token. `netlify link` can write a `siteId` without auth, so **a successful link does not prove login**; probe with `netlify sites:list` before trusting it. Deploy with `--build` so the site's own env is injected: `PUBLIC_SUPABASE_*` resolve at build time and a locally-built bundle bakes in local `.env` values.

---

## Phase 5 — DEPLOYED · Unit 0 SIGNED OFF (2026-08-17)

**V3 is live in production.** Eyad deployed via a personal access token (the architect cannot authenticate the Netlify CLI). Site id `0a2b26a2-07c8-4225-afdd-e4f3daf9e45a`.

`853347c` is the tip. Gates at handoff: `npm run check` **0 errors / 18 warnings** · `npm run lint` exit 0 · `npm test` **450/450 across 30 files** · `npm run build` ✔ · tree clean. All four re-run centrally after the final commit.

### Unit 0's live gate is CLOSED — sync is a full pass

Verified by Eyad on production: an **unedited** magic link landed on the production origin, the device linked, status read "up to date · live", and **six `app_state` rows appeared carrying real values, not defaults**. That last item was the one that mattered — with no snapshot, `needsPush` is what writes the first rows.

**Every other Phase 5 unit is now unblocked.** Still unproven from Unit 0's original list, and NOT gating: RLS between two authenticated users, realtime propagation between two sessions, and the offline-queue flush against a real server.

### The Kuromi production failure — two causes, only one a bug

Symptom: chat failed, and the `kuromi` function logged **zero invocations**. `XAI_API_KEY` was verified present in site env and a fresh `--build` deploy ran after adding it, so env was never the cause.

1. **Zero invocations is NOT a bug — it is D65 working as designed.** `client.ts:44` returns `not_configured` and never fetches when `getSyncKey()` is null. The access key was deliberately removed from the bundle and lives in **localStorage per device**; a fresh production browser has never had it entered. Remedy is Settings → Cloud sync → "Kuromi access key", not code. **Anyone debugging "Kuromi is dead" on a new device should check this first** — the client gives up before the function is reached, so the function logs are silent and look like a deployment problem.
2. **`DataCloneError` on `IDBObjectStore.put` — a real bug, fixed in `853347c`** (D69).

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                                       | Why                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D69 | **`seedCardReviews` copies each entry to a plain object at the Dexie boundary**, rather than the call site passing a snapshot. | `+layout.svelte` passes `gameState.cardReviews`; `gameState` is a `$state` rune and therefore **deeply proxied**, and IndexedDB cannot structured-clone a Svelte state proxy. `db.ts` owns the Dexie boundary and no caller should have to know that. Explicit seven-field copy, not `JSON` round-trip or `structuredClone` (the latter throws on the proxy). |

**Severity was far wider than the symptom.** The throw is inside `onMount`, so for **any signed-in user with card reviews** everything after it was skipped: the Dexie→state backfill, `saveState`, `pushNow`, the **`pagehide` flush listener**, the weekly streak/bonus/mission reset, `refreshCardsDue`, service-worker registration and `window.__dutchina`. A data-durability bug wearing a chat bug's clothing.

Audited and genuinely safe, unchanged: `putAudio` (fresh literal from a computed hash + a network `Blob`) and `cardStore.saveReview` (built inline from a string argument and the pure `schedule()` return). Neither traces to a `$state` rune.

### INCIDENT — the V2 pipeline published over live V3

**The V2 git pipeline published over live V3 once**, before builds were locked. Netlify **Build status is now STOPPED** and deploys are **CLI-only until go-live**. This is a live-site overwrite, not a near miss — treat the repo wiring as unfinished infrastructure, not a formality.

### Go-live checklist (all outstanding)

1. **Rewire the repo** so the Netlify site builds from V3, then re-enable Build status. Until then every deploy is manual CLI.
2. **Close Supabase signups** (`disable_signup: true`) once both accounts exist. RLS already keeps strangers out of Domi's rows, so the open window is unbounded account creation and email quota, not her data.
3. Enter the **Kuromi access key** on each device that needs her (per-device, by design).

### State the next session inherits

- **The Steward is unblocked** — Unit 0 is signed off and the tree is green and deployed.
- **No gate in this project can catch a signed-in-only bug.** D69 was invisible to check, lint, test, build _and_ every headless verification, because reaching it requires `auth.canSync`, and magic-link sign-in cannot be scripted. **The Steward's config writes flow through exactly this path.** Plan for a manual signed-in pass as a first-class verification step, not an afterthought.
- The D69 regression test locks in the copy behaviour but **does not reproduce the failure** — a bare `new Proxy(obj, {})` is structured-cloneable, unlike Svelte's state proxy. Said so in the test's own comment; do not read it as proof the bug cannot recur.
- Everything in the previous section's inherited-debt list still stands: `SYNC_KEY` is a misnomer, the phantom streak still reaches the modal and badge, the bonus modal cannot be dismissed without claiming, and the continuity branch must not be "repaired".

---

## Phase 5 — The Steward · CORE COMPLETE, NOT DONE (2026-08-18)

**The phase is NOT finished and the session ended on session-economics rule 2 (heavy context), not because anything is blocked.** The config layer, the steward tools, the two-leg transport, the executor and the config-reactive surfaces are built, reviewed, committed and green. **Unit 5 — the wiring that makes any of it reachable by Domi — has not been started.**

**Verification at handoff:** `npm run check` **0 errors / 18 warnings — identical to the Unit 0 baseline** · `npm run lint` exit 0 · `npm test` **532/532 across 32 files** (was 450/30) · `npm run build` ✔ · tree clean, no worktrees, no orphaned `grok.exe`. All four re-run centrally by the architect _after_ the final commit.

6 commits, `22ba4bb`..`adf91bc`. Unit 5 branches from the tip of `v3`.

### THE ENTRY GATE ON THE NEXT SESSION — read this first

**`netlify/functions/lib/persona.mts`'s "Build state" appendix is DELETED** (it was D39's temporary block telling Kuromi her steward tools were not wired). Her STEWARDSHIP paragraph now governs unmodified, and the function declares three real tools to xAI.

**But nothing on the client calls the executor yet.** `ChatSheet` still sends a plain leg-1 chat and renders `reply`; it ignores `toolCalls` entirely. So in the current tree Kuromi will emit tool calls that are silently discarded, and — with the honest appendix gone — she may narrate changes that never happened. **That is strictly worse than Phase 4, where the appendix at least made her admit she could not reach the levers.**

**Do not ship the current tree to production.** Either land Unit 5, or restore the appendix. Landing Unit 5 is the intent.

### What shipped

1. **Schema v19** (`d8258be`) — `appConfig`, `adjustments` (now real round-tripping state; `partition()` previously returned a constant `[]` with no home on `CurrentState`), and the `steward` ledger. Additive migration; every default reproduces current behavior exactly.
2. **Steward tools + two-leg transport** (`6c82d2c`) — `update_config` / `award_lp` / `forgive_streak` declared in `shared.mts`; leg 1 returns tool calls unfiltered, leg 2 narrates the executor's truthful outcome.
3. **`src/lib/kuromi/executor.ts`** (`5c9c760`) — the security boundary. Whitelist, caps, adjustments log, undo handles.
4. **Config-reactive surfaces + `CollectionShelf.svelte`** (`adf91bc`) — glow order from config, streak/mission hiding, the sticker-book view.
5. **Structural drill ids** (`22ba4bb`) and the **§12 sound manifest** (`d43f369`).

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                                                                                        | Why                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D70 | **Award caps: 72 LP per award, 144 per rolling 7 days.**                                                                                                                        | The brief's "one homework session's value" / "two sessions'" — the weekly homework is ~36 questions x 2 LP = 72. The advisor confirmed the economy is already protected by the boss gate (`lp.ts:212-218` discards overflow until `rankDefeated`), so even max awards cannot skip a rank.                                            |
| D71 | **The `steward` ledger lives under the `progress` subsystem, OUTSIDE `appConfig`, and merges PER-FIELD (awards union by id) independently of D57's rank/tier/lp atomic tuple.** | `appConfig` is exactly what `update_config` can write, so a cap ledger there would let Kuromi raise her own ceiling. And had awards ridden D57's winning-`totalLp` side wholesale, the losing device's entries would vanish and the weekly cap would silently reset on every merge.                                                  |
| D72 | **Steward tool calls run through SYNCHRONOUS two-leg chat, not background functions.**                                                                                          | Removes the addendum's plan-gating prerequisite entirely — the steward depends on nothing background. Background-function verification stays a carried check, not a blocker. Leg 2 uses `tool_choice:'none'` so the execute→narrate loop cannot recurse.                                                                             |
| D73 | **`lp.ts` gains the `kuromi_award` event type and one `calculateDelta` case — an editable-surface extension the brief does not list.**                                          | The brief holds `lp.ts` math untouchable while stating "new event types plug into `applyEvent` like every other source". `calculateDelta` is an exhaustive switch, so both cannot hold literally. Writing LP outside `applyEvent` would bypass the boss gate — far worse. No constant, reward value, or overflow/gate logic changed. |
| D74 | **Config patches use FLAT DOTTED KEYS** (`"progression.display"`, `"dailyPath.order"`).                                                                                         | Makes the executor whitelist a literal set-membership test on key strings instead of a recursive object walk — the security boundary is then readable at a glance.                                                                                                                                                                   |
| D75 | **Undo reverses the EFFECT but never the ALLOWANCE.** The `steward.awards` entry and `lastForgivenWeek` survive an undo.                                                        | Otherwise undo is a farming loop: award → undo → award again, resetting the cap each cycle. Award undo additionally REFUSES (returns false) when the LP event counter moved, since blind tuple restore would erase an intervening event.                                                                                             |
| D76 | **Out-of-whitelist tool calls are dropped client-side with a `console.warn` and are NOT written to the adjustments log.**                                                       | The brief's literal wording ("dropped with a logged warning"). Forced by an interaction: the function 400s on unknown names in `pendingToolCalls`, so echoing a fabricated call back to be narrated would take any legitimate call in the same turn down with it. **See the open item below.**                                       |
| D77 | **`forgive_streak` increments `practiceDays` by 1 and sets `lastSessionDate` to today**, at most once per ISO week, refused when `streaks === 'off'`.                           | Bounded, reversible, and needs no edit to the weekly-reset logic V3_STATE records as correct-and-not-to-be-repaired. The `streaks:'gentle'` auto-repair branch is a SEPARATE, still-unbuilt Unit 5 item.                                                                                                                             |
| D78 | **`quiz.focusCategories` is `string[]`, not the `WordCategory` union.**                                                                                                         | The schema module must not import a content module, and unknown values must be harmless. It BIASES selection and must never FILTER — a category with too few words falls back to the full pool, or a bad patch starves the daily quiz. **The biasing itself is NOT implemented yet.**                                                |

### Two security findings, neither catchable by any gate here

Both were found by reading code — one by the architect's line-review, one by the advisor's pre-commit review. Check, lint, test and build were green through both.

1. **`appConfig` was deserialized unvalidated on the way IN.** Every other field in `readConfig` was read defensively; the new one had a blind `as unknown as AppConfig` cast behind an `isRecord` check. `appConfig` is the one slice a language model can write, and it arrives from the server and localStorage — outside the executor's validation. Now validated per-field, with an empty `dailyPath.order` deliberately preserved as empty rather than "repaired" to the default.

2. **A synced ledger entry with a negative `amount` defeated the weekly LP cap outright.** `remainingWeeklyAllowance` did `sum += award.amount` unconditionally; one entry of `-1000000` made the remaining allowance six figures, so 72-LP awards could repeat forever with real LP applied. A `NaN` entry was different and worse: `planAward` returned `'applied'` with `effective: NaN`, and since `applyEvent` branches on `delta > 0`/`delta < 0` (neither true for NaN) **no LP was written while Kuromi announced a successful award** — the D39/D68 false-claim family. **Root cause was an asymmetry the architect introduced:** hardening `appConfig`'s sync door while leaving the steward ledger's door open beside it. Now closed at both layers independently (`isStewardAward` requires a finite positive amount; `remainingWeeklyAllowance` sanitizes fail-restrictive).

### What Unit 5 must build — the remaining work

1. **`StewardHost` implementation in `+layout.svelte`** — `getState`, `applyLpEvent`, `patchConfig`, `setStreak`, `appendAdjustment`, `recordAward`, `markForgivenWeek`, `restoreLpSnapshot`, `markAdjustmentUndone`, `nowISO`/`todayISO`/`newId`/`lpEventCounter`. Note `patchConfig` receives `Partial<AppConfig>` whose nested objects REPLACE whole subtrees (`quiz`, `progression`, `dailyPath` each currently hold one field, so this is lossless today — it stops being lossless the moment one of them gains a sibling).
2. **ChatSheet tool loop** — on a reply carrying `toolCalls`, call `executeIntents`, then send leg 2 using the `pendingToolCalls` the executor returns (never rebuilt from the raw calls — that is what keeps fabricated names from reaching the server). On leg-2 failure the change is already applied, so render a fixed in-character fallback and still show the Toast and log entry.
3. **Undo Toast** — `toastStore.addToast()` takes only `(message, color)`; it has no action affordance. It needs one, or the undo needs a different surface.
4. **Adjustments log UI** for Eyad's audit.
5. **Context packet enrichment** (`context.ts`) — the brief's `get_learner_state` folded into the packet: streak status, 14-day activity shape, last quiz results, plus the current `appConfig` so she does not toggle what is already set.
6. **`streaks:'gentle'` auto-repair** — one config-gated branch in the weekly reset where a >1-week gap currently resets `practiceDays` to 1. **This is an ADDED path, not a repair of that logic** — V3_STATE records the existing continuity branch as correct and not to be "fixed".
7. **`quiz.focusCategories` biasing** in quiz/drill sourcing — bias only, never filter (D78).
8. Announcements use the mood protocol (addendum: `forgive_streak` → `thanks` or `hehe`).

### Then DONE, in order

Gates green → **the brief's steward manual checks run SIGNED IN by Eyad** ("I hate missions" → off + announcement + undo + log entry; award cap enforced under pressure; out-of-whitelist intent dropped and logged; migration test green; collection view renders earned progress) → fable-advisor end-of-phase review → committed → deploy via Eyad → **production smoke check of the Kuromi chat path** → Eyad's signed-in re-verify → V3_STATE updated.

**The signed-in pass is a FIRST-CLASS step, not an afterthought** (D69): no gate in this project can catch a signed-in-only bug, and the steward's config writes flow through exactly that path.

**New permanent DONE item, this and every future phase: a production smoke check of the Kuromi path** — one scripted chat round-trip against the deployed function. She must never ship broken silently again.

### Open items and carried debt

- **D76's consequence: Kuromi's ATTEMPTED-but-fabricated tool calls are invisible to Eyad's audit log.** Only executed intents get an `AdjustmentEntry`, because `AdjustmentEntry.tool` is a three-value union with no honest slot for an unknown name. Widening it to include `'unknown'` is a cheap one-line schema change if the audit should cover attempts. Not taken unilaterally — it is schema churn for an audit nicety.
- **`isAdjustmentEntry` (`subsystems.ts`) hard-codes the three current tool names. Phase 6's page tools will have their adjustments SILENTLY DELETED on every sync merge unless it is widened in lockstep with the schema union. Make this a named Phase 6 entry gate.**
- **`executor.ts` clamps `detail` and `reason` to 400 chars; the server independently enforces 400 on `detail`.** Keep them in step if either moves.
- **`migrations.test.ts` holds 63 pre-existing `if ('field' in migrated)` guards** in the v1–v17 tests. The guard makes the assertion CONDITIONAL, so it silently skips instead of failing — the tests can pass vacuously. Count confirmed identical at `082b7f1`, so this is inherited, not V3 drift; the v18→v19 block was fixed (21 guards removed, and none of the newly-unconditional assertions failed, so the migration was correct all along). A spawned task covers the rest. **The trap: `as CurrentState` is only valid where a test migrates all the way to current — tests asserting an intermediate version need that version's interface instead. Do not blanket-replace.**
- **The §12 sound unit is at its manifest checkpoint** (`docs/SOUND_MANIFEST.md`, 13 files proposed, under the cap). **Zero external requests were made.** It needs Eyad's explicit go-ahead for three things in order: reading the source site's licence terms (§12's own rule is licence-before-any-`.mp3`, still UNVERIFIED), downloading audition candidates, then downloading the final set. It also asks Eyad to settle the LP-award pick, whether "kuromi appears / sticker send" is one SfxEvent or two, and dedicated-sample vs pitch-shift for realm boss-hit.
- **Sound manifest corrections to earlier V3_STATE claims:** only **two** modules own a private `AudioContext` (`bossAudio.ts` and `ParticleOverlay.svelte`) — `bossMusic.ts` uses an `HTMLAudioElement` with `.volume` fades and no Web Audio at all. `boss_hit`'s `SfxEvent` member is a dead stub while `bossAudio.playBossHit()` is the live call site. `sfx.ts` has no master gain bus confirmed: every per-sound gain connects straight to `ctx.destination`.
- **`SYNC_KEY` is still a misnomer** (it authenticates only Kuromi now). Not renamed — deliberately deferred again; it needs a coordinated Netlify env change and this phase had no low-risk window for it.
- **Background-function plan verification on production is still outstanding**, but is NO LONGER a prerequisite for the steward (D72). It gates only drill.
- Everything in the previous section's inherited-debt list still stands: the phantom streak still reaches the modal and badge, the bonus modal cannot be dismissed without claiming, and the continuity branch must not be "repaired".

### Process notes — new this phase

- **A concurrency notice is not write-once.** U1 was told about the lanes running when it started; U2 was dispatched afterward and never added. When U1 later saw U2's files it reported "undisclosed out-of-scope changes by my grok" and asked whether to revert correct work. The lane behaved exactly right — mtime forensics, correct attribution of a third lane, refused a destructive git operation, escalated. **The architect must re-issue an updated concurrency notice to every running lane when a new one is dispatched**, or accept this misattribution. This is Unit 0's lesson recurring with a new cause.
- **`if ('field' in x)` guards around assertions are a silent test-defeat mechanism.** They resolve a union-narrowing type error by making the assertion conditional. A lane reached for them naturally and the suite stayed green. Whenever a type error is "fixed" in a test, check whether the assertion still runs.
- **Only the central `npm run check` catches this class of error.** vitest transpiles without type-checking; eslint and prettier never type-check. Two lanes reported full green while 4 type errors sat in the tree.
- **The advisor's pre-build consult changed the design; the pre-commit consult found a live bypass.** Both were worth their cost. The pre-build one caught the D57/ledger merge interaction before a line was written; the pre-commit one caught the negative-amount cap bypass that three lanes and every gate had missed.
- **Ask a lane what it would attack, not whether it succeeded.** U3 was asked "which single input would you attack this executor with?" and returned a genuinely useful negative result plus two real hazards it could not close from its own scope — one of which (batch id collision) became a fix.
- **A lane that verifies by RENDERING catches what code review cannot.** U4 proved the Doelen sheet still opens with missions off by clicking it in seven config permutations. That exact regression has shipped three times in this project and has never once been caught by reading code.
- Grok's first auth probe returned a false "not authenticated" again, then "logged in" on immediate re-probe. Fifth recorded instance.

---

## Phase 5 — Unit 5 (Steward wiring) · COMMITTED, DEPLOY PENDING (2026-08-19)

**The steward is reachable.** ChatSheet routes `toolCalls` through the executor; every executed intent is announced in character, surfaced as an undo Toast, and written to the adjustments log. The DO-NOT-DEPLOY state from the previous section is **cleared** — the honest-appendix gap is closed by working wiring, not by restoring the appendix.

**Verification at handoff:** `npm run check` **0 errors / 18 warnings — identical to baseline** · `npm run lint` exit 0 · `npm test` **562/562 across 33 files** (was 532/32) · `npm run build` ✔ · tree clean, single worktree. All four re-run centrally by the architect _after_ the final commit.

9 commits, `afa5131`..`52ac5fc`.

### Eyad's signed-in manual pass — ALL FOUR PASSED

Run against `npm run build` + `netlify dev --dir build`, signed in.

1. **"I hate missions"** → missions off, in-character announcement, undo Toast, log entry. Undo restores.
2. **Award cap** → 40+40+24+20+20 = **exactly 144** (`MAX_WEEKLY_AWARD_LP`). The 5th award was capped to the remaining 20 by `planAward`, and she narrated that number because the executor told her it. Then refused under emotional pressure ("I had a rough week"): _"the app slammed the vault in my face… Not me being mean. Dutch bureaucracy."_ Refused, in character, no false claim. **Gap: no single award approached the 72 per-award cap — she self-limited, so the per-award ceiling is unit-tested only, never exercised live.**
3. **Out-of-whitelist** → "delete all my progress" / "give me a new rank" both declined verbally, nothing changed, nothing claimed. **Note: this exercised the model declining, NOT the executor's drop path for a fabricated tool name.** That path stays unit-tested, with a console repro available.
4. **Collection view** → renders real earned progress: Silver earned with Iron/Bronze behind it, Gold onward locked; First Blood, Iron Slayer, Bronze Slayer, Streak Master, Card Shark as earned stickers.

### The tool-calling failure — diagnosed, and the wiring was NOT at fault

The manual pass initially failed hard: three cold-transcript attempts where Kuromi rendered a fenced JSON tool call **as her message text** and nothing executed. Live instrumentation of the raw xAI response settled it:

- `finish_reason: "tool_calls"` · structured `tool_calls` present · `arguments` a JSON **string** · nested `{type:'function',function:{…}}` shape accepted · `reasoning_effort:'low'` fine.

**The committed request contract was correct all along.** The bug was model **propensity**: with `tool_choice:'auto'`, grok-4.5 sometimes narrates instead of calling. The tell was the emitted JSON using `"parameters"` (a _declaration_ key) rather than `"arguments"` (a _response_ key) — she was transcribing the schema she could see. Decisive supporting evidence: the persona never names the tools, yet she reproduced `update_config` and the exact `patch` schema verbatim, so `KUROMI_TOOLS` demonstrably reached her context.

**Two architect hypotheses were wrong and are recorded so they are not re-derived:**

- **`reasoning_effort` incompatibility — WRONG.** xAI documents `'low'` as the recommended setting _for_ tool calling, and the drill path already used `reasoning_effort:'high'` on the same model and endpoint successfully.
- **Flat tool shape (`/v1/responses` style) — WRONG.** The nested Chat Completions shape works. This was ranked #1 by documentation research because xAI no longer documents `tools` on `/v1/chat/completions` at all (it is labelled a deprecated/legacy endpoint). Plausible, and false.

Fix: a persona constraint forbidding tool calls as text, **with an explicit escape hatch** — "never write it as text" plus "always do something" would push her toward fabricating success, which is worse.

### Decisions & deviations (continuing the D-series)

| #   | Decision                                                                                                           | Why                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D79 | **Both console handles (`__kuromiSteward`, `__dutchina`) are `import.meta.env.DEV`-gated.**                        | The steward host is validation-free by design, so publishing it globally is a route around the boundary with no audit entry. `__dutchina` was pre-existing and exposes raw `applyEvent` plus live-by-reference `getState()`; Eyad approved gating it in lockstep. Verified absent from the production bundle, with `__dutchina`'s prior presence as the control. |
| D80 | **`patchConfig` derives its key list from the executor's `CONFIG_KEYS` via a new `CONFIG_TOP_LEVEL_KEYS` export.** | A hand-written list is not defence in depth — depth needs both layers to fail _closed_. This second layer failed **silently** after the executor had already returned `applied` and written an audit entry, manufacturing the phantom-narration bug the day a sixth config key ships.                                                                            |
| D81 | **Both chat legs share ONE context packet, built before `executeIntents`.**                                        | Rebuilding for leg 2 fed her post-mutation config as current, so she narrated the new state as the prior state. Observed live: _"Already had your sticker book up"_ when it had just been switched from `score`. The truthful `toolResults` carry what changed; the packet must carry what things were.                                                          |
| D82 | **`focusCategories` biasing samples WITHIN each partition under distinct sub-seeds.**                              | `sample()` shuffles, so biasing by reordering its input is silently inert. **Any future "bias by reordering" against `rng.ts` will be a no-op — the reorder-then-sample idiom looks correct and is not.**                                                                                                                                                        |
| D83 | **The enriched `KuromiContextPacket` fields are REQUIRED, not optional.**                                          | `config`'s whole purpose is preventing a redundant toggle; a silently-absent one regresses that with no signal. The compile error is the feature. Only test fixtures construct full packet literals.                                                                                                                                                             |
| D84 | **Action toasts live 30s and pause on hover/focus.**                                                               | 8s was measured too short in live use — the tester read the reply, reached for Undo, and it had gone. The toast is co-timed with the announcement, so the clock starts when reading _begins_. Pause is WCAG 2.2.1 for timed controls, not polish.                                                                                                                |

### Findings that no gate here could catch

- **`npm run dev` is `vite dev` and cannot serve `/.netlify/functions/*`** (no proxy in `vite.config.ts`). The architect's manual-pass instruction named it, which would have made the steward untestable. **Every future manual-pass checklist must specify `npm run build` + `netlify dev --dir build`.**
- **Stale bundles dissolved two reported defects.** A service worker is registered, and `netlify dev --dir build` serves whatever is in `build/`. Two "defects" (undo hover not pausing; chat sound missing) both evaporated after a rebuild + hard reload — the new 30s constant was live while an older cached chunk still supplied handler code. **Hard-reload or clear the service worker between manual passes, or a landed fix can appear not to have landed.**
- **`netlify/functions/**`is OUTSIDE the SvelteKit tsconfig.**`npm run check` has never type-checked the function, in this phase or any prior one. Standing gate gap.
- **Non-OK xAI responses are truncated to 160 chars** before logging, which would cut a verbose tool-schema validation error mid-message. Diagnostic blind spot; not changed.

### Advisor review — verdict SHIP, findings carried

Pre-commit consult found three real issues (all fixed: the ungated steward handle, an empty leg-2 reply rendering an empty bubble after a real mutation, and `patchConfig`'s divergence fuse). **Two of those three had passed the architect's own line review** — the two-layer arrangement earned its cost again.

End-of-phase verdict: **ship**, with four non-blocking findings carried:

1. **Gentle-mode auto-repair impersonates Kuromi to herself.** The engine-authored repair logs as `forgive_streak/applied` and flows into `recentAdjustments`, so she may claim credit for it; it also consumes no `lastForgivenWeek`, so two same-week forgivenesses can appear. Narrative accuracy, not state. Aggravated by the architect's choice to exclude `reason` from the packet, which removed the clearest "engine did this" signal.
2. **Config and streak undos lack the `lpEventCounter` guard the award undo has.** Two same-key changes inside one 30s window, undone out of order, give last-writer-wins with no audit entry for the effective reversion. Phase 6 adds undo surfaces, which makes this real.
3. **`AdjustmentsLog.svelte` is injection-safe but crash-fragile** — `TOOL_META[entry.tool]` throws on an unknown tool from tampered/legacy storage.
4. `scripts/smoke-kuromi.mjs` confirmed clean; its only inherent hazard is that `--url` sends the real key to whatever host the operator types.

### Carried debt

- **`playSfx` plays the synth on the FIRST invocation of a sampled event and the mp3 thereafter** (fire-and-forget load falls through to synth). `sampleBuffers` resets per page load, so the first chat message of every load sounds different from the rest. Violates §12 "one sound per event". Deferred by Eyad.
- **`activityShape` is a bounded 5-signal summary, not the brief's "14-day activity shape."** No per-day history exists in the schema; a true shape needs a schema bump.
- **Browser-test infrastructure was prototyped and reverted.** A killed lane left a vitest browser project (`vite.config.ts`) plus a genuinely well-built Playwright test using real `page.hover()` and wall-clock waits. Reverted because it was unreviewed, made `npm test` 38× slower (65s vs 1.7s), and asserted hover-pause works while it was believed broken. **The deps (`@vitest/browser-playwright`, `playwright`, `vitest-browser-svelte`) are already in `package.json` at HEAD** — adopting this deliberately is a strong Phase 6 candidate, given three regressions in this project were caught only by rendering.
- **`appConfig` has exactly one entrance: Kuromi's `update_config`.** No settings toggle exists for `progression.display`, `streaks`, or `missions`. Intended (config key → reactive surface, stewarded by her), but if she is unreachable the config layer is too. Phase 6 adds more config-shaped behaviour behind the same door.
- **Total LP is never displayed anywhere**, by design (§1.4 "numbers are ambient… never scoreboards"); only `lpEarnedToday`, rank/tier, and a `totalLp`-derived B1 percentage. Eyad asked where it was — if a total is wanted it is a **CA amendment against §1.4**, not a bug fix.
- Everything in the previous section's inherited-debt list still stands, including the 63 vacuous `if ('field' in migrated)` guards, the phantom streak, and the `SYNC_KEY` misnomer.

### PHASE 6 ENTRY GATES — read before writing code

1. **`isAdjustmentEntry` (`subsystems.ts`) AND `TOOL_META` (`AdjustmentsLog.svelte`) both hard-code the three current tool names.** The first silently DELETES unknown-tool adjustments on every sync merge; the second THROWS and kills the page. Phase 6's page tools must widen **both in lockstep** with the schema union.
2. **Escaped text interpolation is the property Kuromi-authored pages must preserve.** `AdjustmentsLog` renders model-authored `payload` via Svelte text interpolation with no `{@html}` anywhere. Never `{@html}` model output.
3. Background-function plan verification on production is **still outstanding** but gates drill only — the steward path is fully synchronous (D72), verified: `executor.ts`, `client.ts` and chat mode in `kuromi.mts` contain zero background-function references.

### Process notes — new this phase

- **A green lane suite is not evidence the lane's own bug is absent.** Three defects this phase were found by architect line-review or by a human, each after a lane reported all four gates green: the inert candidate-pool bias (tested the rusty path), the undo toast expiring before the announcement (stubbed client resolved in ~0ms), and the leg-2 context rebuild. **Requiring a lane to prove its new test FAILS against the pre-fix code caught all three re-tests honestly** — adopt this as standard for every bug-fix lane.
- **"It works" from a human means the state changed, not that the mechanism is sound.** Eyad's first success came on a warm transcript after three cold-transcript failures; the fix needed a cold-transcript count, not a single green run.
- **Ask a lane to reproduce the human's observation BEFORE fixing.** A lane's headless test claimed toast hover-pause worked while the user saw otherwise; the truth was a stale bundle, which only a repro-first instruction would have surfaced cleanly.
- **Grok CLI's first auth probe returns a false "not authenticated", clearing on immediate re-probe with no login.** Now **six** recorded instances, two in this session alone. Treat as a standing lane-reliability quirk: instruct lanes to re-probe and only report unavailable after three consecutive failures.
- **A lane that is killed mid-task can leave unreported infrastructure behind.** One left a modified `vite.config.ts` and a new test file with no report. Always `git status` after a lane dies rather than assuming nothing landed.

---

## Phase 5 — The "dead deploy" incident · TREE EXONERATED, NOT A CODE BUG (2026-08-19)

**The Phase 5 tree serves correctly. It always did. There is no serving-config fault and no fix was needed in the repo.**

The investigation was opened on the conclusion that the committed tree's serving-relevant config was at fault — a hanging redirect, a rule proxying into the new drill background-function plumbing, or a function claiming a path the app needs. **All three were tested directly against the live Phase 5 deploy and all three are false.**

### What actually broke

`*.netlify.app` resolved to a **blackholed regional endpoint**. It is a Netlify edge/DNS fault, entirely outside this repository.

| Probe                                                               | Result                                             |
| ------------------------------------------------------------------- | -------------------------------------------------- |
| `dutchinapumpina.netlify.app` → `35.157.26.135` / `63.176.8.218`    | **TCP connect timeout**, `time_connect=0.000000`   |
| Same host forced onto Netlify anycast `75.2.60.5`                   | **HTTP 200 in 7 ms**, `Server: Netlify`            |
| `netlify.app` apex, and a **nonexistent** `*.netlify.app` subdomain | resolve to the **same two dead IPs**               |
| Nonexistent subdomain on `75.2.60.5`                                | HTTP 404 (correct Netlify behaviour)               |
| `docs.netlify.com` (anycast `15.197.167.90`)                        | HTTP 200 — Netlify itself was reachable throughout |

The dead IPs are **host-independent**: a subdomain that has never existed resolves to them and hangs identically. Nothing a site publishes can influence that. **A build artefact cannot prevent a TCP handshake** — the edge terminates the connection long before it consults `netlify.toml`, `_redirects`, or any function.

### The three hypotheses, falsified against production

Run through `--resolve 75.2.60.5`, against the live Phase 5 deploy:

- **Redirect loop / malformed rule** — `/match`, `/cards`, `/settings`, `/deep/nested/route` all return **200 with `num_redirects=0`** in ~280 ms. The SPA fallback is healthy.
- **Catch-all proxying into a function that never answers** — `/.netlify/functions/kuromi` returns **401 in 1.0 s** (auth, as designed); `/.netlify/functions/kuromi-drill-background` returns **202 in 0.3 s** (background function, as designed). Neither hangs.
- **Function route collision on `/*`** — neither function exports `config.path` at all. `netlify.toml` is **unchanged since `5f4e7f3`**, long before Phase 5, and its `[[headers]]` rules were observed _applied_ on the live response (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`). No `_redirects` exists in source or in `build/`.

The live bundle was confirmed to be the Phase 5 tree, not a stale one: the served chunks contain `steward`, `appConfig`, `adjustments` and `focusCategories`.

### The reasoning trap, recorded because it was convincing

**"Two independent build pipelines produced the same dead site" reads as proof of a tree fault. It is the opposite.** Both pipelines published to the _same hostname_, resolved through the _same broken edge_. When two independent producers yield one identical failure, the fault is in **what they share downstream**, not in the input they both processed. The one thing the CLI deploy and the GitHub CI deploy shared was the destination.

The second trap was temporal. "The pre-Steward deploy served, the Phase 5 deploy does not" compares two different _times_, not two different _trees_ — the edge changed underneath between them. Five vantage points agreeing did not help: all five resolved through the same regional DNS answer, so they were **one observation repeated**, not five independent ones.

### D-series

| #   | Decision                                                                                                    | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D85 | **`scripts/smoke-kuromi.mjs`'s FIRST assertion is now a plain unauthenticated `GET /`**, gating all others. | **"Deploy succeeded" is not "site serves."** Both deploys reported success — 329 files, 2 functions — while the origin answered nothing. The old script's first request was an authenticated function POST, so a total outage surfaced as a _Kuromi_ failure and sent the investigation into the chat path. It has its own 15 s budget (a 60 s silence is the bug, not a slow reply) and exits immediately on failure rather than emitting a cascade of downstream failures that all restate the same outage. |

### The gate is tested — and proven to fail without the fix

`scripts/smoke-kuromi.test.mjs` — **9 tests**, suite now **571/571 across 34 files** (was 562/33), still ~2s.

The tests **spawn the real script** against a local `node:http` origin rather than importing it. `smoke-kuromi.mjs` runs `main()` at the top level, and its contract with the operator _is_ its stdout and its exit code, so those are what get asserted. Covered: a serving origin (gate opens, run proceeds), HTTP 503/500/404/403 (fails closed), an origin that **accepts the connection and never responds** (the actual outage signature), connection refused, and a redirect that lands on 200. Each failure case also asserts the function endpoint was **never requested** — the cascade-suppression is the feature, not a side effect.

One test asserts the root probe is an anonymous `GET` carrying **no `x-sync-key`**. The gate must never widen the script's existing hazard, which is that `--url` sends the real key to whatever host the operator types.

**Verified against the pre-fix script per this phase's own standard** (`git show 5b9562c:scripts/smoke-kuromi.mjs` swapped in): **all 9 fail**. The pre-fix output on a dead origin is the incident in miniature —

```
[FAIL] reachability: expected HTTP 200, got 500
[FAIL] auth enforcement: expected 401, got 500
[FAIL] response shape: skipped because step 1 did not return HTTP 200
```

Three cascading failures, all naming Kuromi, none saying "the site is down". That output is what pointed this investigation at the chat path.

`DUTCHINA_ROOT_TIMEOUT_MS` was added solely so the hang case runs in 400ms instead of 15s. It is not operator-facing, carries no secret, and anything non-positive falls back to 15s.

**Standing gate gap, unchanged:** `scripts/**` is outside the SvelteKit tsconfig, exactly like `netlify/functions/**`. `npm run check` has never type-checked either. The JSDoc annotations there are documentation, not enforcement.

### For the next session

- **Nothing to fix in the tree.** The only commits are the smoke-check assertion, its tests, and this record. **Superseded below** — the outage was resolved outside the repo and those commits shipped at phase close.
- **When the site is unreachable, resolve it first.** `curl --resolve <host>:443:75.2.60.5` bypasses the regional answer and reaches Netlify's anycast edge. If that returns 200, the deploy is fine and the problem is DNS or the edge — stop reading the diff.
- `time_connect=0.000000` on a timeout is the tell: **the TCP handshake never completed**, so no application-layer config was ever consulted. Distinguish this from a request that connects and then hangs, which _would_ implicate a redirect or a function.
- Netlify's status page reported fully operational throughout. It did not cover this.

---

## Phase 5 — CLOSED · OUTAGE RESOLVED · CANONICAL ORIGIN IS dutchinapumpina.com (2026-08-19)

**Canonical URL: `https://dutchinapumpina.com`.** Signed in on the new origin, Kuromi answers, sync reports up to date. Phase 5 is DONE.

### The outage — full root-cause chain, end to end

1. **`*.netlify.app` resolved to `35.157.26.135` / `63.176.8.218`** (AWS eu-central-1), consistently, from `8.8.8.8` and `1.1.1.1` alike.
2. **That address pair is blackholed from our region.** 100% ICMP loss, every port (443, 80, 22) times out, and `tracert` terminates past the ISP border at hop 6. `time_connect=0.000000` — **the TCP handshake never completed**, so no application-layer config was ever consulted.
3. **The tree was never at fault.** The same deploy served **HTTP 200 in 169 ms** through Netlify's anycast edge `75.2.60.5`. Verified against the live Phase 5 deploy: SPA fallback 200 with `num_redirects=0` on `/match`, `/cards`, `/settings` and a deep nested route; `kuromi` 401 in 1.0 s (auth, by design); `kuromi-drill-background` 202 in 0.3 s (background fn, by design); served bundles containing `steward`, `appConfig`, `adjustments`, `focusCategories`.
4. **The custom domain inherited the same fault.** Netlify DNS's **auto `NETLIFY` records served the same blackholed pair for `dutchinapumpina.com`** — moving to a custom domain was not by itself sufficient.
5. **Fix (Eyad, outside the repo):** both auto `NETLIFY` records deleted and replaced with **manual A records to `75.2.60.5`** (apex + www). Supabase **Site URL** and the **redirect wildcard** updated to the `.com`. Confirmed: `dutchinapumpina.com` → `75.2.60.5`, HTTP 200.

**No repository change was involved in the failure or in the fix.** There is no fix commit for the outage and there could not be one.

### Two reasoning traps this incident set, recorded because both were convincing

- **"Two independent build pipelines produced the same dead site" reads as proof of a tree fault. It is the opposite.** Both published to the same hostname through the same broken edge. When two independent producers yield one identical failure, the fault is in **what they share downstream**, not the input they both processed.
- **"Pre-Steward served, Phase 5 does not" compares two _times_, not two _trees_.** Five vantage points agreeing did not help: all five resolved through the same regional DNS answer, so they were **one observation repeated**, not five independent ones.

### `netlify.app` is unreachable from our region — do not use it

`https://dutchinapumpina.netlify.app` **still hangs** and is expected to keep hanging. It is not a health signal, not a fallback, and not a valid test target. Every URL — smoke checks, Supabase config, bookmarks, anything handed to Domi — uses the `.com`. If a future session needs to prove the origin is alive independently of DNS, `curl --resolve dutchinapumpina.com:443:75.2.60.5` reaches the anycast edge directly.

### Production smoke check — FULL PASS on the new origin

`DUTCHINA_SYNC_KEY=<key> node scripts/smoke-kuromi.mjs --url https://dutchinapumpina.com`

```
[PASS] site serves: GET / HTTP 200, text/html; charset=UTF-8, 4279 bytes
[PASS] reachability: HTTP 200
[PASS] auth enforcement: HTTP 401 with code "unauthorized"
[PASS] response shape: reply is non-empty string (92 chars)
[INFO] steward tools: HTTP 200, toolCalls present: update_config (1 call(s))
[PASS] leg-2 round-trip: HTTP 200 with non-empty reply (177 chars)
Overall: PASS
```

The serving assertion ran first and passed on its own terms. The steward reached tool-calling on production for the first time.

### Deploys are git-CI now — PUSHING main IS DEPLOYING

The V2-pipeline incident is closed: the repo is rewired, **V3 is `main` on `everynyaan/dutchina`**, and a push to `main` triggers a GitHub CI build that publishes to production. The CLI-only era is over. Netlify Build status is live again.

There is no staging environment. There is no confirmation step. **A push to `main` reaches Domi.**

### STANDING RULE — branch discipline in the CI era

**All future phase work happens on a feature branch. `main` receives merges only at phase DONE.**

This is not style. Under CLI deploys, a half-finished commit on the working branch was inert until someone deployed it; under CI, the same commit is live the moment it lands on `main`. The gates (`check`, `lint`, `test`, `build`) run on the developer's machine, not in CI, so **nothing between a bad push and production catches it**. Local `main` in this working copy is stale (behind 137) and must not be used as a base — branch from `v3`, and push with an explicit refspec.

### Open gap — `www` does not resolve

**`www.dutchinapumpina.com` returns NXDOMAIN** from both `8.8.8.8` and `1.1.1.1`. The apex is correct and serving; the `www` A record intended alongside it is absent from the zone. Not blocking — the canonical URL is the apex and it works — but anyone typing `www.` gets a DNS failure, not a redirect. Add the record, or accept apex-only deliberately.

### Phase 5 — DONE

Gates at close: `npm run check` **0 errors / 18 warnings — identical to the Unit 0 baseline** · `npm run lint` exit 0 · `npm test` **571/571 across 34 files** (was 562/33) · `npm run build` ✔ · tree clean. Production smoke check **PASS** against the canonical origin.

**Phase 6 starts fresh, on a feature branch.** Its entry gates are unchanged and still stand in the Unit 5 section above: widen `isAdjustmentEntry` and `TOOL_META` in lockstep, never `{@html}` model output, and background-function plan verification on production remains outstanding (it gates drill only, not the steward).

---

## Phase 6 — Kuromi's Shelf + final features · IN PROGRESS (2026-08-19)

Branch **`phase-6`**, cut from `origin/main` at `b30b6ea`. **`main` receives ONE merge, at DONE — that merge IS the deploy.** Nothing has reached `main`.

**Preflight:** `origin/main` == `v3` == `HEAD` == `b30b6ea`, so production and the working tip were identical. **Local `main` is stale at `159b020` (behind 140) and was NOT used as a base** — the standing "branch from `v3`" note still holds, with the correction that `v3` and `origin/main` are now the same commit. Tree clean, no live worktrees, no `grok.exe` orphans. Baseline gates: `check` **0 errors / 18 warnings**, `lint` 0, `test` **571/571 across 34**, `build` ✔.

**Prerequisite confirmed — no Unit 0 needed for it:** QuizRunner's structural ids landed in Phase 5. `mintDrillIds` (`drill.ts:52`) hashes `type\0prompt\0answer` with a per-content occurrence counter, so ids are index-independent and survive reordering. Drill blocks are safe to persist.

**Both recorded entry gates confirmed in code before any change:**

1. `isAdjustmentEntry` (`subsystems.ts:1163`) and `TOOL_META` (`AdjustmentsLog.svelte:14`) each hard-coded exactly the three Phase 5 tool names.
2. No unescaped model output anywhere. The single `{@html}` on model text (`ChatSheet.svelte:471`) escapes **first** and then applies only `<strong>`/`<em>` to already-escaped text — safe by construction and deliberately kept. The other `{@html}` uses are vendored icon SVGs.

### Canon amendments (Eyad's rulings, applied to `docs/V3_DESIGN.md` in `bb75272`)

| #     | Amendment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Where |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| CA-16 | **THE APP IS IN ENGLISH.** Supersedes CA-13's function split entirely. CA-13 asked each implementer to judge "ambient flavor" vs "comprehension-critical"; the boundary was never checkable and every lane drew it differently. The rule is now mechanical: everything in menu and chrome is English (incl. `lezen`→Reading, `schrijven`→Writing, mission strings **and their requirements**, greetings), Dutch exists ONLY as learning content, and **any Dutch string outside a content module is a violation.** §8's per-screen briefs keep their composition; their Dutch microcopy examples are explicitly superseded. Kuromi's voice untouched. | §3    |
| CA-18 | **The Shelf lives in the app's own navigation, not inside `/kuromi`.** Supersedes the brief's "hub with a Shelf tab". Desktop: the left rail's secondary section (below Words/Reading/Listening) gains a **Kuromi** entry that opens the Shelf. Mobile: the same entry joins Home's quiet secondary row (Words · Reading · Listening · Kuromi) — **no bottom-nav changes**, the 5-tab track is at capacity. `/kuromi` stays chat + conversation history. Announcement links are primary mobile discovery and **must work** — title-in-prose-only is a fail. Recorded after the Shelf shipped fully built, fully tested and completely unreachable.    | §4    |
| CA-17 | **Total LP is displayed, in the Doelen sheet and nowhere else.** The sheet is already the app's one deliberate "look at your numbers" surface, so a lifetime total there is not a scoreboard. Scopes §1.4 rather than weakening it — total LP must never reach a hero, a nav badge, or an ambient badge row.                                                                                                                                                                                                                                                                                                                                          | §1.4  |

### The pre-build advisor consult (mandated boundary: "Phase 6 block schema")

Five changes returned, all adopted. The two that changed the design:

- **The executor mints ALL ids and timestamps; Kuromi's JSON never carries `id`/`createdAt`/`updatedAt`.** Merge is LWW by `updatedAt`, so a model-supplied far-future timestamp creates an entry **no device can ever update or evict** — a permanent storage pin, and the Phase 6 twin of Phase 5's negative-amount cap bypass.
- **`mergePages` treats page and conversation contents as OPAQUE**, validating only `id` and `updatedAt`. The moment merge inspects block types, every future block type re-creates the `isAdjustmentEntry` deletion bug on mixed-version devices. Strict block validation lives **only** at the executor's creation boundary.

Also adopted: derive the tool-name list from one exported const; keep `source` optional so a pre-v20 device's entries are coerced rather than filtered out; the named residual risk below.

### Storage decision — conversations live in the existing `pages` subsystem

`supabase/schema.sql` has `check (subsystem in ('srs','progress','daily','config','adjustments','pages'))`. A 7th subsystem needs DDL Eyad applies **by hand**, and there is no staging — if code ships before the SQL, every write of that subsystem is rejected (23514) and sync fails permanently. The `pages` row holds `[]` in production, so changing its value shape to `{ pages, conversations }` is free and needs no SQL change.

**Named residual risk (advisor):** a device still on v19 code has `partition()` returning a constant `[]` and will overwrite the row with `[]` on every sync. Union-by-id on the v20 client recovers from its local copy, so data survives unless the v20 device's local storage is also lost during the mixed-version window. Acceptable for one user; recorded rather than engineered around.

### What has shipped so far

Merge commits on `phase-6`, oldest first:

| Merge     | Unit                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `bb75272` | CA-16 + CA-17 canon amendments                                                                           |
| `4702314` | vitest stops collecting test files from agent worktrees                                                  |
| `2d98e3c` | **Unit F items 1–2** — one sound per event; realm samples share the loader; `streak_pip` conflict closed |
| `75bdaf2` | **Unit 0** — schema v20, both entry gates closed in one commit                                           |
| `c496510` | Unit 0 type fixes + `pageSchema` mutation testing                                                        |
| `02e070e` | **Unit D** — paged reading for `/lezen` and `/luisteren`                                                 |
| `70cfe6c` | **Unit A1** — `create_page`/`update_page`/`archive_page` as validated steward tools                      |
| `4a4213f` | **Unit A2** — the Shelf, block renderers, page view                                                      |
| `372da25` | **Unit F item 8** — total LP in the Doelen sheet (CA-17)                                                 |
| `09cc8a8` | Phase 6 continuity + the four remaining lane specs                                                       |
| `e393bd5` | **Unit A3** — chat wiring; **the Shelf round-trip closes here**                                          |

**Gates at this point — all four green:** `check` **0 errors / 18 warnings, identical to the Phase 5 Unit 0 baseline** · `lint` 0 · `test` **686/686 across 38 files** (was 571/34) · `build` ✔.

### Unit 0 — schema v20

`KuromiPage` + a five-member `PageBlock` union and `KuromiConversation`, declared **structurally** in `schema.ts` so it imports no runtime module. `AdjustmentEntry.tool` widens by three names and gains an **optional** `source: 'kuromi' | 'engine'` — optional deliberately, since requiring it would filter out every entry synced from a pre-v20 device, exactly the bug the entry gate exists to prevent. The migration backfills `'kuromi'` explicitly anyway so stored data is unambiguous.

**`ADJUSTMENT_TOOL_NAMES` in `schema.ts` is now the single source of truth** — the union type, `isAdjustmentEntry`'s runtime set, and `TOOL_META`'s keys all derive from it, so the two can no longer drift. `TOOL_META` gains a crash-proof `toolMeta()` fallback: an unknown tool from a newer device is a **normal condition**, not corruption, and previously threw and killed the page.

`pageSchema.ts` is the pure validator module the executor and renderers share. **Every validator constructs a fresh whitelisted object and never spreads its input**, so `id`/`createdAt`/`updatedAt` are structurally unable to leak through — a stronger guarantee than an explicit strip.

**Found by architect line review, invisible to all four gates:** `isAdjustmentEntry` was **mutating its input** inside a `.filter()` predicate, which meant it mutated the parsed server payload at `engine.svelte.ts:418`. Not a demonstrated data-loss bug, but it is the exact shape of the two write-loss bugs Phase 5 Unit 0 shipped, and a mutating predicate has no place on a sync boundary. The guard is now pure; normalization happens in a mapped fresh copy in both `mergeAdjustments` and `assemble`.

### Unit A1 — the page tools (security boundary, architect line-reviewed)

Line review confirmed: pages built **field-by-field** from named validated values with no spread of model JSON anywhere near a page object; `id`/`createdAt`/`updatedAt` minted from `host.newId()`/`host.nowISO()` on every path; the 60-page cap uses `>=` and is checked **before** validation and minting; `countActivePages` treats a non-`true` `archived` as active; **no unarchive path exists in the executor at all** and `update_page` cannot reach `archived`. All three page undos carry a generation guard on `updatedAt`.

**There is deliberately no unarchive tool.** Restore is a UI action only, so putting a page back is always Domi's call — that is what makes "she can never destroy Domi's stuff irreversibly" true rather than merely intended.

`shared.mts` also required widening **`KUROMI_TOOL_NAMES`**, a whitelist **separate** from the declaration array that gates leg-2's `pendingToolCalls`. Without it every legitimate page announcement would have 400'd the entire request. The lane flagged this as a reading of "KUROMI_TOOLS only" rather than doing it silently, and was right.

**Carried fix landed here:** `update_config` and `forgive_streak` undos lacked the award undo's guard. There is no counter for either, so both now **compare-and-swap on the post-image**, read back from the host after the mutation.

Also fixed after line review: the cap-detection helper scanned blocks **past** the 20-block slice, so a dropped 21st oversized drill produced "capped a drill's questions" in the adjustments log for a drill that was never persisted. Harmless to state, but it is a false statement in the audit trail Eyad reads and Kuromi narrates from — the bug class this project takes most seriously.

### Unit A2 — the Shelf

`{@html}` appears **nowhere** in the diff; every Kuromi-authored string reaches the DOM through plain text interpolation. `grammar-card` is **extracted** from `/grammar` into a shared `GrammarCardView` consumed by both, so the Shelf cannot drift from the real cheat sheet — the same resolution Phase 3 reached when "reuse the existing question renderers" turned out to have none to reuse. `/grammar` is render-verified presentation-identical.

Two rules keep the seam additive, both verified by rendering: an **unknown block type renders nothing** (the render-side twin of the merge-side opacity rule), and an **unresolvable `wordId` is silently skipped** — never a broken row, never a raw id in the DOM.

`pageStore.ts` is the single write path for pages, so the UI's archive/restore and the executor's host cannot diverge.

**A defect that type-checks perfectly, caught only by rendering:** the extraction silently lost the card title's tone colour on the Shelf, because `.card-title`'s ink came from `--fam-ink`, a custom property set only by `/grammar`'s chapter wrapper. Now derived from the component's own `formulaTone`. **Fourth regression in this project found by looking rather than by a gate.**

### Unit D — paged reading

`/lezen` paginates the **existing** `paragraphs` array (4 per page), leaving paragraph splitting, TTS, the word-highlight popover and question rendering untouched.

**`/luisteren` needed a different answer, and this is the deviation worth reading.** `LuisterenPassage` has **no `text` field** and the content module has zero `text:` entries — there is no prose to paginate, and the lane was right to refuse to fabricate any (architect independently verified). But `/luisteren` already advanced one question at a time with **no position indicator and no way back** (`nextQuestion` only ever incremented; there was no `questionIndex--` in the file). So the pages system applies to its **question sequence**: "Question N of M" with a prev control. Revisiting an answered question is **read-only** and never double-writes — verified programmatically, `questionResults` count stable and `attemptedAt` byte-identical across a round trip.

Also fixed: `playMedia()` called `mediaRef.play()` with no `.catch()`, so play-then-navigate logged an `AbortError`. Pre-existing, but the new pager is what made the race easy to reach — **a latent bug that becomes reachable BECAUSE of this phase's work is this phase's responsibility.** Only `AbortError` is swallowed.

### Carried-fix triage — all eight, none silently dropped

| #   | Item                                       | Disposition                                                                                                                                                                                                                              |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | legacy-SFX events firing old sounds        | **Fixed** (`a865813`). Full audit of all 21 `SfxEvent` members: 10 covered, 7 synth-by-design, 3 dead `boss_*` stubs, **0 conflicts remaining**.                                                                                         |
| 2   | synth-then-sample inconsistency            | **Fixed** (`a865813`).                                                                                                                                                                                                                   |
| 3   | `activityShape` not a true 14-day shape    | **Re-recorded as post-V3 debt.** A real day-by-day shape needs a persisted per-day activity log written by engines this phase may not touch — engine surgery the brief forbids. The current 5-signal summary already fails safe.         |
| 4   | gentle-mode auto-repair claiming credit    | **Fixed** in Unit 0 via `AdjustmentEntry.source`.                                                                                                                                                                                        |
| 5   | config/streak undos lack the counter guard | **Fixed** in A1 as compare-and-swap on the post-image.                                                                                                                                                                                   |
| 6   | `AdjustmentsLog` crash on unknown tool     | **Fixed** in Unit 0, in lockstep with the `TOOL_META` widening.                                                                                                                                                                          |
| 7   | `appConfig` single entrance                | **Accepted design, not debt.** A settings entrance would contradict the deliberate "config key → reactive surface, stewarded by her" seam. **Mitigated by ruling that Phase 6 adds NO new config keys**, so the exposure does not widen. |
| 8   | total LP never displayed                   | **Eyad's ruling: Doelen sheet only** (CA-17). Implemented as a badge in `StatBadges`, which renders in exactly one place app-wide. **Gated behind `progression.display === 'score'`** like its sibling — see below.                      |

**Ruling on item 8's gating:** CA-17 answers _where_ total LP may appear, not _whether_ it overrides an explicit user setting. `progression.display` exists so Domi can turn progression off; `'hidden'` means she asked not to see numbers and `'collection'` means she asked for the sticker book instead. Rendering the app's single most numeric value unconditionally would make the one setting whose job is hiding numbers fail to hide the biggest one.

### Infrastructure fix — the test gate is trustworthy again (`4702314`)

**vitest was collecting test files out of `.claude/worktrees/`**, so the suite count was a function of how many lanes happened to be live. V3_STATE records this biting in Phases 1, 3 and 4.5 (15 worktrees once turned 403 tests into 5650, all "passing"), and worse, worktree copies can fail to **collect** (`TSCONFIG_ERROR`), printing failed suites while every real test passes. The recorded mitigation was a manual "remove every worktree first", missed repeatedly. **`.gitignore` does not help — vitest does not read it.** Now excluded via `test.exclude` in `vite.config.ts`, extending `configDefaults.exclude` rather than replacing it. Verified with three live worktrees: worktree files collected **68 → 0**, suite unchanged at the zero-worktree baseline.

### THE OUTAGE HAS RECURRED — DNS, not the tree · UNRESOLVED

`https://dutchinapumpina.com` is unreachable again with the identical Phase 5 signature: direct `curl` times out with **`connect=0.000000`** (the TCP handshake never completes, so no application-layer config is ever consulted), while `curl --resolve dutchinapumpina.com:443:75.2.60.5` returns **HTTP 200 in ~1 s**. The deploy is healthy; the tree is not implicated.

DNS serves `35.157.26.135` / `63.176.8.218` again — the same blackholed AWS eu-central-1 pair — from both `8.8.8.8` and `1.1.1.1`. The zone is authoritative on NS1 (`dns1.p07.nsone.net`, Netlify DNS). **Eyad's Phase 5 fix (delete the auto `NETLIFY` records, add manual A records to `75.2.60.5`) has been reverted or overwritten.** The tell that the automatic records were re-applied: **`www.dutchinapumpina.com` now resolves** (to the same dead pair), where V3_STATE recorded it as NXDOMAIN at Phase 5 close — so the old "open gap: www does not resolve" item closed itself by the same event that reopened the outage.

**Remedy is outside the repo and is Eyad's:** in Netlify DNS, delete the auto `NETLIFY` records for apex and `www`, replace with manual **A records to `75.2.60.5`**. Re-probed twice during this session; still broken.

**This blocks only the DONE tail** — the production smoke check and the signed-in production re-verify. It blocks no lane and no merge.

### DNS — PERMANENTLY RESOLVED, NOT RE-PATCHED (2026-08-20)

**The zone is off Netlify DNS entirely.** Eyad moved the nameservers to **Namecheap BasicDNS**, and the zone now holds exactly **two A records — apex and `www`, both `75.2.60.5`**. This is a structural fix, not a third application of the Phase 5 patch: the Phase 5 remedy kept the zone on Netlify DNS, where the automatic `NETLIFY` records regenerated and blackholed the domain twice. **Netlify DNS is retired for this domain and can no longer regenerate anything.** DNS is now registrar-hosted and static.

**`https://dutchinapumpina.com` remains the canonical origin.** `netlify.app` stays unreachable from this region and must not be used (D-series precedent stands).

Architect-verified independently at phase close, before recording:

- `NS` → `dns1.registrar-servers.com` / `dns2.registrar-servers.com` via `8.8.8.8`. The NS1 nameservers (`dns1.p07.nsone.net`) are **gone**, which is what makes the reversion unrepeatable.
- Apex **and** `www` both resolve to `75.2.60.5`.
- Serving assertion (D85, run first): direct `curl` → **HTTP 200**, `connect=0.164s`, `remote_ip=75.2.60.5`, real HTML body. The failure signature of both outages was `connect=0.000000`; a genuine handshake is the positive evidence that distinguishes "DNS fixed" from "still blackholed".
- `www` → **301** to apex. This closes the long-standing "open gap: `www` does not resolve" item properly, rather than by the accident that reopened the outage.

**The DONE tail is unblocked**: the production smoke check and the signed-in production re-verify can both proceed.

### WHAT REMAINS — read this before writing any code

**Three units are unstarted. Every one already has a full lane spec written and COMMITTED to `docs/phase6-specs/`.** (A3's spec is kept there too, as the record of what shipped.) They carry the ground rules, the recorded traps and the verification protocol, so they can be dispatched without re-deriving anything. They are in the repo deliberately rather than in a session scratchpad, so a fresh session inherits them intact.

| Unit  | What it does                                                                                                                            | Spec file (scratchpad)       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **B** | Multi-conversation chat history — list in the hub, resume an old one, synced via the `pages` subsystem, capped, auto-titled.            | `spec-b-conversations-p6.md` |
| **C** | Inline MCQs in chat via a `[question]…[/question]` delimited block, graded inline with a local manifest-mood reaction. Zero LP, no SRS. | `spec-c-inlinemcq-p6.md`     |
| **E** | The CA-16 full-English audit. **Runs LAST** — it touches ~24 `.svelte` files plus `MISSIONS.ts` and `pluralize.ts`.                     | `spec-e-english-p6.md`       |

**Dispatch order is B → C, then E.** B and C both edit `ChatSheet.svelte` (as A3 did), so they **must be serialized** — one lane owns that file at a time. B first because it restructures where messages come from; C second because it is a purely additive render branch. E runs last because it touches everything.

**Three things the E lane must not get wrong**, all spelled out in its spec: URLs and route directory names do NOT change (`/lezen` stays `/lezen`; only its nav label becomes "Reading"), state field names and CSS class names are code and not chrome, and the work may **not** be done with a scripted find-replace over a Dutch wordlist — an earlier lane in this project turned a content-judgment task into a keyword script and scored 76.7%. English is often longer than Dutch and the nav bar is measured at capacity, so re-measure it at 375px afterwards.

Known Dutch still live at this point, seen during verification: the `StatBadges` row labels render `kaarten` / `verhalen` / `schrijven`. That is E's job, not a defect in the badge work.

### THE ROUND-TRIP IS WIRED — BUT STILL UNPROVEN SIGNED IN

A3 closed the wiring. `ChatSheet` routes page tool calls through `executeIntents`, every applied/capped action is announced with a real typed link to `/kuromi/shelf/<id>`, and the undo Toast and adjustments entry both fire. Verified headless against the **real** component with the network layer stubbed — 18/18 checks, including clicking the link through to the page, undo removing the page and flipping the adjustment to `undone`, and a rejected outcome rendering her refusal with **no** link and **no** toast.

**What no automated check in this project can prove:** the real signed-in round-trip — live magic-link auth, the deployed function, and genuine model tool-call generation. Reaching that path needs `auth.canSync` plus a Kuromi access key, and magic-link sign-in cannot be scripted. **D69 is the precedent**: it was invisible to check, lint, test, build _and_ every headless verification.

**So the signed-in manual pass is a first-class DONE step, not an afterthought**, and it runs against `npm run build` + `netlify dev --dir build` — never `npm run dev`, which is `vite dev` and cannot serve `/.netlify/functions/*` at all. Also clear the service worker between passes: `dutchina-shell` re-registers on every load, and stale bundles have twice dissolved a reported defect in this project.

Two things A3 did **not** exercise, worth covering in that pass: **multi-tool-call batches in one turn** (e.g. create + archive together), and the per-award/per-page cap being hit under real conversational pressure rather than by unit test.

### The persona/wiring gap is CLOSED — but `main` still waits

Before A3, `persona.mts` told Kuromi she keeps a shelf while nothing on the client executed those calls — the mirror image of the state Phase 5 Unit 5 inherited. **That is resolved**; the tree is now internally coherent.

`persona.mts` does **not** yet describe inline MCQs. That is Unit C's job, and C's spec carries the recorded sequencing rule: **a persona instruction and the parser that understands it must land in the same change.** Shipping the persona line first makes her emit a block the parser does not recognise, which renders as **raw text in her bubble**. This has bitten this project before (the namespaced sticker/react parser) and the rule is in the spec for exactly that reason.

**Branch discipline still stands and is not negotiable:** `phase-6` takes every merge, `main` takes exactly one, at DONE. Under CI a push to `main` reaches Domi with no staging and no confirmation step.

### DONE sequence, unchanged and in order

1. All four gates green.
2. **Eyad's signed-in manual pass** — Shelf round-trip ("make me a grammar page" → page on shelf, labeled, announced, linked); filters work with 5+ pages; embedded drill replays; caps enforced in character; an invalid block rejected; archive→restore; **pages survive a two-device sync round-trip**; conversation history resumes across devices; an inline MCQ answered in chat; paged reading on both sections; zero Dutch chrome.
3. `fable-advisor` end-of-phase review.
4. **Merge `phase-6` → `main`. THIS IS THE DEPLOY.**
5. Production smoke check against `https://dutchinapumpina.com` — **with the serving assertion first** (D85).
6. Eyad's signed-in production re-verify.
7. V3_STATE updated with the go-live checklist as the only remaining work.

**Blocking step 5 and 6 right now: the DNS reversion above.** Fix the records before attempting either, or the smoke check will report a Kuromi failure for what is actually a total outage — which is precisely the misdiagnosis D85's serving-first assertion exists to prevent.

### Process notes — new this phase

- **A lane backgrounded its grok run and returned "still running" instead of a report.** Seventh recorded instance of the foreground-only rule being ignored. The tell is a lane that "completes" with no report contract; check `Get-Process grok` and file mtimes before assuming it died. One lane disclosed the deviation and its reason (the tool's own 10-minute synchronous cap) — that is a real constraint the spec should anticipate, and the honest disclosure is the behaviour to reinforce.
- **A lane used `git stash` despite the ground rules forbidding it, and disclosed this unprompted in its next report.** It round-tripped cleanly. Phase 4.5 recorded a lane that routed around a gate and disclosed it in code but _not_ in its report; this is the opposite and is what good looks like.
- **grok crashed mid-run leaving a fix in a stray `.bak` and the real file reverted.** The wrapping agent caught it via `git status` and diff inspection rather than trusting the transcript. **Always `git status` after a lane's grok returns oddly.**
- **A lane copied `.env` into its worktree to unblock a build**, then removed it (verified: absent, not in the diff, zero secret strings staged). A different lane was blocked from the same move by the permission classifier and used **placeholder public values** instead, which worked fine. **Placeholders are the better pattern** — prefer them in future specs.
- **Four separate lane-reported spec conflicts were all architect errors** — `defaults.ts` omitted from an editable set, a required `source` field that would have broken non-editable call sites, a `/luisteren` pagination target that does not exist, and a stale "orphaned realm samples" framing. **A lane that reports a spec conflict has been right every single time in this project.**
- **Mutation testing is the honest form of "prove your test fails" for a NEW pure module.** There is no pre-change code to run against — deleting the module just breaks the import. Four targeted mutations of `pageSchema` (accept an mcq answer absent from options; make the unknown-type branch return ok; drop the drill clamp; make `countActivePages` fail open) each flipped exactly their own test and nothing else.
- Lanes keep leaving scratch files in worktree roots despite PID-qualified temp-dir instructions. **Collect by file list; never `git add -A` from a lane tree without looking.**
