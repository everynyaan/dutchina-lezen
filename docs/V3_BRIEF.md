# Dutchina V3 — Overhaul Brief (Claude Code / Opus 4.8)

**How to run this:** this brief is consumed by the architect session (Claude, orchestrator). The architect owns decomposition, specs, routing, and verification — it does not type implementation code. Work runs one phase at a time, in order; the architect writes spec-contract prompts (objective, files, interfaces, constraints, verification) and routes per the rules below. Existing CLAUDE.md house rules apply (root-cause fixes, no new dependencies without flagging, no rewrites).

### Routing (Grok does the heavy lifting)

- **Every implementation unit defaults to `grok-implementer`.** No unit is pre-assigned to Fable. The architect's job is to write specs tight enough that Grok can execute them — exact file paths, exact interfaces, exact schema shapes. A spec the architect can't finish writing means the decision isn't made yet; that's architect work, not a reason to escalate.
- **`fable-implementer` is escalation-only:** a unit that fails its spec gets one corrected spec back to Grok; a second failure escalates to Fable. Never escalate preemptively.
- **The architect keeps:** decomposition, all spec writing, the Kuromi persona prompt, lane routing, and judging verification evidence. Nothing else.
- **`fable-advisor` consults** (read-only, <300-word verdicts — cheap; pass a scoped diff and the goal, never the conversation): pre-commit at four boundaries — Phase 0 token/primitive architecture, Phase 3 migration shape, Phase 5 tool whitelist + caps, Phase 6 block schema — plus the mandatory end-of-phase review. No phase reports done without it.
- **Parallelize wherever files don't overlap:** the Phase 1 retheme fans out one agent per route in a single message; Phase 2's enrichment batch and grammar UI run in parallel; Phase 3's content authoring and engine/UI units run in parallel.

### Session economics (the 7-hour fix)

Architect context compounds — everything in the session is re-read at premium prices every turn. Rules:

1. **One session per phase, then the session dies.** Continuity lives in `docs/V3_STATE.md`: at phase end the architect writes what shipped, decisions made, and deviations from this brief (≤1 page). The next session reads V3_STATE.md + the shared sections + its own phase section — nothing else from this brief.
2. **Mid-phase checkpoint:** past ~2 hours or visibly heavy context, write the handoff and restart fresh. Never push through a bloated session.
3. **Lane report contract:** lanes return files touched, ≤10 lines summarizing changes, and the verification command with output tail. **Full diffs never enter architect context** — the architect spot-checks by reading specific files (or via a cheap read-only agent) and hands the advisor a scoped diff.
4. **Emit judgment, not volume:** if the architect is typing a code block longer than an interface signature, that's an undelegated spec — stop and delegate. Fixing a lane's bug by hand is the same failure; send a corrected spec back instead.

---

## Context (paste into every session)

**Source repo:** https://github.com/everynyaan/dutchina — V3 is built in a new root cloned from this repo (V2 stays intact as the reference/fallback). All file paths in this brief are relative to that new root.

Dutchina is a SvelteKit 2 / Svelte 5 (runes) PWA using Tailwind 4 (`@theme` tokens in `src/app.css`), Dexie for card reviews, adapter-static, deployed on Netlify with one function (`netlify/functions/sync.mts`, Netlify Blobs, `x-sync-key` header auth, profiles `domi`/`admin`).

State lives in localStorage per profile (`src/lib/state/schema.ts`, versioned migrations in `migrations.ts`), synced via `src/lib/sync/sync.ts`. Any new persistent keys require a schema version bump + migration + inclusion in the sync payload.

Content modules: `WORD_POOL.json` (1,795 words: `{id, dutch, english, pos, rank, sentence_nl, sentence_en}`), `SENTENCES.json`, conversation stories→chapters with per-chapter vocab + 5 MCQs (`src/lib/conversation/CONVERSATION_CONTENT.ts`), NT2 lezen/luisteren exams, schrijven reviews, match engine, and `src/lib/daily/generator.ts` which builds the **weekly** homework (~36 questions). Game layer: LP economy (`src/lib/lp/lp.ts`), ranks, missions, achievements, boss fights. Routes: `/`, `boss`, `cards`, `conversation`, `daily`, `lezen`, `luisteren`, `match`, `reviews`, `vocab`.

Known wart: word/sentence JSON exists in BOTH `src/data/` and `src/lib/data/`. Only `src/lib/data/wordPool.ts` imports are live. In Phase 0, verify nothing imports from `src/data/`, then delete the duplicates.

**V3 is an overhaul of theme + surfaces. It is not a rewrite.** The state engine, LP economy, SRS, sync, boss/missions/achievements systems all survive unchanged unless a phase explicitly says otherwise.

**Architecture north star: Kuromi-extensibility.** The point of V3's structure is that future updates expand what Kuromi can do without surgery. Three extension seams, laid in Phases 4–6, are the contract:

1. **Capability = tool → intent → executor handler.** New Kuromi powers are added by registering a tool schema in `kuromi.mts` and a validated handler in the executor — never by giving the model new write paths.
2. **Content = block type → renderer.** New things Kuromi can create are new block types in the schema + a renderer component — pages compose them automatically.
3. **Behavior = config key → reactive surface.** New toggles are config keys that surfaces read reactively — Kuromi can steward anything config-shaped via her existing `update_config` tool.
   When implementing Phases 4–6, keep these registries single-location and additive (one file to touch per seam). If a phase's design would require touching engine code to add a future Kuromi capability, the design is wrong — stop and restructure the seam instead.

---

## Design System (paste into every session)

The entire app moves to the "Dutch Little Handbook" aesthetic — Kuromi × My Melody: pastel candy surfaces, thick dark-plum outlines, sticker shadows, rounded everything. This REPLACES the current navy/cream dual theme.

### Tokens (replace the `@theme` block in `src/app.css`)

```css
--color-cream: #fff8f5; /* page bg */
--color-blush: #ffe8ef; /* soft pink surface */
--color-pink: #ff9bb8;
--color-pink-deep: #e86b8f;
--color-rose: #ff6b8a;
--color-lavender: #c9b8e8;
--color-lilac: #ede4ff;
--color-kuromi: #3d3550; /* the ink/outline plum — borders, headings */
--color-kuromi-mid: #5c4f78;
--color-mint: #c8f0d8;
--color-mint-deep: #5bb88a;
--color-butter: #fff0b8;
--color-sky: #d4e8ff;
--color-sky-deep: #6b9fd4;
--color-ink: #3a3040; /* body text */
--color-soft: #7a6e7e; /* muted text */
--color-line: #f0d4de; /* hairline borders */
--card-shadow: 0 4px 0 #f0c4d0, 0 8px 24px rgba(232, 107, 143, 0.12);
--sticker-shadow: 0 3px 0 rgba(61, 53, 80, 0.12);
--font-display: 'Quicksand', sans-serif; /* headings, labels, numbers */
--font-sans: 'Nunito', sans-serif; /* body */
```

Map old semantic roles to new tokens so component churn stays sane: `bg→cream`, `s1→white`, `s2→blush`, `s3→lilac`, `border→kuromi (3px on cards) / line (2px hairlines)`, `text→ink`, `muted→soft`. Success→mint-deep, danger→rose, warning→butter tones, info→sky-deep. Keep the semantic variable NAMES where practical (`--color-bg`, `--color-text`, etc.) pointing at the new values, so most components retheme via token swap rather than per-file edits.

### Component language (build as shared primitives in Phase 0)

- **Card:** white (or soft pastel gradient top: `soft-pink | soft-lilac | soft-mint | soft-butter` variants), `border: 3px solid var(--color-kuromi)`, `border-radius: 22px`, `box-shadow: var(--card-shadow)`.
- **Pill/chip:** 999px radius, 2px kuromi border, sticker-shadow, Quicksand 700, pastel fill variants (pink/purple/mint/butter/kuromi-inverse/rose).
- **Sticker callout:** 18px radius, 3px **dashed** border for "free/tip" (pink), 3px **solid** for "trap/warning" (kuromi on lilac), butter variant for listening/audio notes.
- **Formula bar + beads:** blush/lilac/mint/butter bar, pill "beads" with 2px borders and `0 2px 0` hard shadows — used for grammar patterns (verb bead = rose, subject bead = sky, ghost bead = dashed).
- **Speech bubble:** white, 2px line border, `18px 18px 18px 6px` radius — Kuromi chat + example sentences.
- **Chapter-num circle:** 52px, pastel gradient fill, 3px kuromi border.
- **Page background:** cream with fixed radial pastel gradients (blush top-left, lilac top-right, mint bottom) + a subtle pink polka-dot overlay at ~0.35 opacity (`::before`, `pointer-events: none`).
- **Press feedback:** keep the existing `--press-scale`/`--press-duration` tactile pattern.

Load Nunito (400/600/700/800) and Quicksand (500/600/700) locally via `@font-face` with woff2 files in `static/fonts/` — this is a PWA; no runtime Google Fonts dependency. Outfit/DM Sans are removed.

### Typography (note item #1: bigger everywhere)

- Root: 16px → **17px** (`html { font-size: 17px }`); everything in rem scales with it.
- Floor: no interactive or body text below **14px** rendered. Audit for hardcoded `text-xs`/12px labels and bump to 13–14px minimum.
- Body copy in reading surfaces (stories, lezen passages, Daily Read): **18–19px**, line-height ≥1.6.
- Headings: Quicksand 700, kuromi color, `letter-spacing: -0.02em`.

### Theme toggle decision

V3 ships **light-only**. Delete the `[data-theme='dark']` token block, remove the toggle from the home header and SettingsPanel, but LEAVE `src/lib/theme/theme.ts` in place (inert) — a Kuromi "night mode" (deep-plum #3D3550 surfaces) is a planned later addition and the plumbing costs nothing to keep.

### Assets

Mascot/character art: official Kuromi/My Melody artwork is fine to use directly (single-user, private, contained environment — Eyad's call). Put assets in `static/kuromi/`; emoji accents (🎀🖤💜) work as placeholders until art is dropped in.

---

## Boundaries (paste into every session)

- Editable surface per phase is listed in that phase. Everything else is read-only context.
- Do not touch: `netlify/functions/sync.mts` auth logic, `src/lib/lp/lp.ts` reward math, `src/lib/cards/srs.ts` scheduling math, boss/missions/achievements engines — unless the phase names them.
- Every schema change goes through `src/lib/state/migrations.ts` with a version bump and a migration test in `migrations.test.ts`. Never mutate `schema.ts` shape without one.
- No new runtime dependencies without flagging first. The Kuromi function (Phase 4) calls the Anthropic API with plain `fetch` — no SDK.
- Avoid over-engineering: no speculative abstractions, no config for hypothetical features. The right amount of complexity is the minimum each phase needs.
- Verification every phase: `npm run check`, `npm run lint`, `npm test` all green, plus the phase's manual checklist run in `npm run dev`. Do not claim done from reading code alone.

---

## Phase 0 — Design system foundation

**Goal:** new tokens, fonts, type scale, and shared primitives exist; app still works with old components sitting on new tokens.

1. Replace the `@theme` token block per the Design System section; delete the dark block; keep semantic names aliased to new values.
2. Self-host Nunito + Quicksand (`static/fonts/`, `@font-face` in `app.css`); remove Outfit/DM Sans references.
3. Root font-size 17px; sweep for sub-14px text (`grep` for `text-xs`, `text-[1`, `font-size: 1[12]`) and raise to the floor.
4. Build primitives in `src/lib/components/ui/`: `Card.svelte` (variant prop), `Pill.svelte`, `Sticker.svelte`, `FormulaBar.svelte` + `Bead.svelte`, `Bubble.svelte`, `ChapterBadge.svelte`. Match the reference CSS exactly — 3px borders, hard offset shadows, 22px radii. These are the ONLY new components this phase.
5. Page background treatment in `+layout.svelte` (radial gradients + polka dots).
6. Verify nothing imports from `src/data/`; delete the duplicate JSON files there.
7. Update `meta theme-color` and manifest colors to cream/pink.

OUT OF SCOPE: restyling individual routes (Phase 1), any feature work.

**Manual check:** app boots, every route renders legibly on the new base (ugly-but-functional is expected), fonts load offline, no console errors.

---

## Phase 1 — Full retheme + stories/chapters pagination

**Goal:** every existing route looks like the handbook; conversation stories become paginated pages (note #2).

**Retheme (all routes + shared components):** rebuild each screen's presentation on the Phase 0 primitives. Priorities: home (RankCard, MissionCards, TodaySummary, AchievementGrid as pastel cards with kuromi borders), bottom nav (white pill bar, 3px kuromi border, active tab = pink fill like the reference nav), cards/match/reviews/lezen/luisteren/daily/boss, Toast, modals, SettingsPanel. Boss fights may keep their dramatic energy but within the palette (kuromi-plum + rose, not navy). Logic and state wiring must not change — this phase is presentation only. Apply the retheme to EVERY route and shared component, not just the ones named here.

**Stories restructure:** split `/conversation` into:

- `/stories` — story shelf (cards with cover emoji, progress pill per story).
- `/stories/[story]` — chapter list (ChapterBadge circles, locked/done states).
- `/stories/[story]/[chapter]` — the reading page: chapter text in large type (18–19px, generous spacing) with `WordHighlight`/TTS intact, then summary, then vocab as pills, then the 5 MCQs. Prev/next chapter footer nav.
- `/conversation` redirects to `/stories`. Preserve existing progress state keys — no migration needed if keys are untouched; if route names are stored anywhere in state or missions, map them.

OUT OF SCOPE: new content, new features, quiz changes.

**Manual check:** walk every route on a phone-width viewport; complete one chapter end-to-end (text → TTS → questions → LP awarded); confirm missions/achievements still fire.

---

## Phase 2 — Vocab categorization + grammar cards

**Goal:** notes #4 and #6.

**Vocab (note #4):**

1. Add `category: string` to `WordEntry` and enrich all 1,795 entries in `WORD_POOL.json`. Use a fixed taxonomy (~12–16 themes), e.g.: `people-family, food-drink, home, work-study, travel-transport, health-body, feelings, time-numbers, nature-weather, shopping-money, communication, society, actions, describing, connectors, misc`. Do the enrichment as a scripted batch pass (a one-off script is fine; delete it after), assigning every word exactly one category. Spot-check ≥50 random entries for sanity.
2. Rebuild `/vocab` as category shelves: a grid of category cards (pastel variants, word count + mastered count per category from SRS data), tapping into a category list view with search/filter. Word rows: dutch (bold, 17px+), english, pos pill, TTS button, SRS status dot.
3. Keep rank-gating logic intact — categories are a browsing dimension on top of ranks, not a replacement.

**Grammar cards (note #6):** new `/grammar` route + `src/lib/grammar/GRAMMAR_CONTENT.ts`. Reference cards only — V2 deliberately removed grammar drilling; do not add grammar quizzes or LP hooks. Content: port and extend the cheat-sheet handbook material (word order V2/inversion, verb conjugation patterns, negation niet/geen, de/het + adjective endings, er, separable verbs, perfect tense, modals, pronunciation traps). Each card = FormulaBar with beads for the pattern + one Bubble example (nl + en) + a Sticker for the trap. Organize as handbook chapters with ChapterBadge headers. Add `/grammar` to the nav (this makes 2 new tabs total with `/stories` renamed — check the bottom bar still fits; if crowded, group lezen/luisteren under a single "NT2" hub tab and use your judgment on the cleanest 5-tab layout, explaining the choice).

Editable: `WORD_POOL.json` (+ `wordPool.ts` type), `src/routes/vocab/`, new `src/routes/grammar/`, new `src/lib/grammar/`, nav in `+layout.svelte`.

**Manual check:** every category populated (no empty shelves, no uncategorized words), grammar route readable at arm's length on a phone, search works.

---

## Phase 3 — Daily quiz, Daily Read, memory freshness

**Goal:** notes #3, #5, #7. One coherent daily layer; the existing WEEKLY homework generator stays untouched.

**Freshness engine first (note #7)** — `src/lib/fresh/fresh.ts`, pure functions: a word is **rusty** if its SRS card has `interval ≥ 21` days and `nextReviewDate` is more than 14 days away (learned, but not scheduled soon), or it was mastered and untouched for 30+ days. Export `getRustyWords(limit)` reading from cardStore. This module feeds both surfaces below.

**Daily quiz (note #3):** `/quiz` route + `src/lib/quiz/`. Exactly 5 questions, refreshes at local midnight, fully optional (no streak damage, no mission dependency). Seeded deterministically from `profile + YYYY-MM-DD` (add a tiny seeded RNG, e.g. mulberry32 — no dependency) so the same day always yields the same 5 across devices/reloads. Composition: 2 match-style from rusty words, 1 recall (type-the-Dutch) from rusty words, 1 conversation MCQ from a completed chapter, 1 lezen question — falling back to rank-appropriate fresh material when rusty supply is short. Reuse the existing question renderers from the daily/match modules; do not build new question UIs. Reward: small fixed LP on completion + a bonus for 5/5 (route through `applyEvent` with a new event type; keep it modest — roughly half a homework session's per-question value — so the weekly economy isn't inflated). State: `dailyQuiz: {date, questionIds, results}` → schema bump + migration. Home gets a "Today" card cluster linking quiz + read with done/undone states.

**Daily Read (note #5):** `/read` route + `src/lib/read/READ_CONTENT.ts`. A pool of ≥60 short reads (3–5 sentences each, NL with EN gloss), each tagged: `phrase-pack` (5 useful expressions), `culture` (NL/Dutch-life tidbits), `grammar-bite` (one pattern, FormulaBar), `word-story` (one word's uses). Selection is date-seeded from the same RNG. The page renders the read in large type + a "Rusty picks" footer: 3 words from `getRustyWords`, shown as pills with TTS. Reading it marks `dailyRead: {date, done}` (same migration). No quiz attached — this is a calm surface.

Editable: new `src/lib/fresh|quiz|read/`, new routes, `schema.ts` + `migrations.ts` (+ tests), home page Today cluster, sync payload.

OUT OF SCOPE: `daily/generator.ts` (weekly homework), missions/achievements definitions.

**Manual check:** quiz is identical across two reloads same-day and different next day (fake the clock), migration test covers old→new state, sync round-trips the new keys.

---

## Phase 4 — Kuromi (note #8)

**Goal:** a chat surface where Domi can rant to a comedically Dutch-exasperated Kuromi, and a modular pipeline where Kuromi generates on-demand sandbox question sets rendered by the app's own components.

**Backend:** `netlify/functions/kuromi.mts`. Mirrors sync.mts conventions: `x-sync-key` auth, profile param, POST only. Proxies to the xAI API via plain `fetch` — OpenAI-compatible chat completions at `https://api.x.ai/v1/chat/completions`, key in `XAI_API_KEY` env var (never shipped to the client), no SDK. Model is `grok-4.5` for both modes — reasoning effort selected per mode: `low` for chat (keeps replies snappy), `high` for drill (correctness of the `answer` field matters for a learner). Two request modes in one endpoint via a `mode` field:

- `mode: "chat"` — freeform. Server-side system prompt defines Kuromi: mischievous Sanrio-punk energy, theatrically DESPISES the Dutch language (the grammar is a personal insult to her, `het` was invented to hurt her specifically) yet is begrudgingly excellent at teaching it; teases but is never mean to Domi; answers in English with Dutch examples; keeps replies short and punchy. She receives lightweight learner context in the request (rank, rusty-word sample, recent activity) so her jabs and help are personal.
- `mode: "drill"` — returns strict JSON only: `{title, intro_quip, questions: [{type: "mcq"|"recall", prompt, options?, answer, explanation_quip}]}` for a requested `{topic, count (≤10), difficulty}`. Enforce this with xAI's native structured outputs: pass the schema via `response_format: {type: "json_schema", json_schema: {...strict schema, additionalProperties: false}}` so the API guarantees shape. Still validate server-side (semantic checks: `answer` present in `options` for mcq, count matches); on a semantic failure, retry once, then return a typed error.

**Frontend — Kuromi is summonable from anywhere; this is the primary access pattern.** Build the chat as a shared `ChatSheet.svelte` component with two mounts:

1. **The summon button (primary, phone-first):** a floating Kuromi button — her chibi head, ~56px, 3px kuromi border, sticker shadow — pinned bottom-right above the nav bar on EVERY route, opening the chat as a bottom sheet (~85vh, drag-to-dismiss, kuromi-border top edge) over the current screen. Domi never loses her place: mid-lesson rants open in context and close back to the lesson. The sheet passes the current route + screen context into the chat request's context packet, so Kuromi knows where Domi is ("you've been staring at that lezen passage for a while, huh").
2. **The hub (`/kuromi`):** full-page mount of the same component, plus the "Make me a drill" panel — topic (free text or category/grammar-topic picker), count, difficulty → calls drill mode → renders the set with a lightweight QuizRunner that reuses existing MCQ/recall components. (Phase 6 later adds the Shelf tab here.)
   Kuromi bubbles lilac with a kuromi border, Domi's blush; avatar from `static/kuromi/`. The floating button must not overlap tappable controls on any route (audit match/boss screens; nudge or hide during active boss rounds). **Sandbox sets award zero LP** and write nothing to SRS — they're a playground, and keeping them out of the economy prevents farming. Persist only the last N chat turns locally (localStorage, outside synced game state) for continuity across both mounts; cap and truncate.

Failure handling: offline or function error → Kuromi sulks in-character ("I refuse to work under these conditions") with a retry. No streaming needed in v1 — single response with a typing indicator is fine.

Editable: new function, new route, new `src/lib/kuromi/`, `netlify.toml` if the function needs config, nav.

OUT OF SCOPE: sync.mts, LP, SRS, any generated-content persistence into the word pool. (Kuromi gains progression powers in Phase 5, not here — Phase 4 ships the relationship first.)

**Manual check:** summon button opens the sheet from every route on a phone viewport and dismisses back to the same screen state; route context reaches Kuromi (she references where Domi is); chat continuity holds between sheet and hub; drill of 5 on a picked category renders and grades; the semantic-failure path shows the in-character error; key absent from all client bundles (`grep` the build output for `xai-`).

---

## Phase 5 — Kuromi the Steward (sandbox + progression stewardship)

**Goal:** Dutchina becomes a sandbox Domi shapes through Kuromi. Kuromi can read Domi's state and — through bounded, whitelisted actions — adjust her LP and reconfigure the app's pressure mechanics to her taste. Background: the V2 LP layer half-failed (partly ignored, partly stressful); the fix is a character mediating the system, not raw mechanics.

**Architecture principle (absolute): Kuromi proposes, the engine disposes.** The model never writes state. The function returns typed _intents_ (xAI tool calls); a client-side executor (`src/lib/kuromi/executor.ts`) validates each against a whitelist + caps and routes it through `applyEvent` / the config store. Anything outside the whitelist is dropped with a logged warning. LP math in `lp.ts` remains untouchable — new event types plug into `applyEvent` like every other source.

**1. Config layer** — `appConfig` in synced state (schema bump + migration + test; defaults reproduce current behavior exactly so the migration is invisible):

- `progression.display: "score" | "collection" | "hidden"` — same LP data; `collection` renders it as a Kuromi sticker book (earned ranks/achievements as stickers on shelves) instead of numbers. Default `score`.
- `streaks: "strict" | "gentle" | "off"` — `gentle` auto-repairs a missed day, narrated by Kuromi in her next chat ("I covered for you. You owe me.").
- `missions: "on" | "off"`.
- `quiz.focusCategories: string[]` — biases daily-quiz and drill sourcing.
  All gamification surfaces (home cards, streak UI, mission cards) read config reactively.

**2. Kuromi tools** (xAI function calling, definitions in the function, execution client-side):

- `get_learner_state()` — resolved client-side before send, actually: fold this into the context packet every chat request already carries (Phase 4), enriched with streak status, 14-day activity shape, and last quiz results. No round trip needed.
- `update_config(patch)` — validated against the config schema; unknown keys rejected.
- `award_lp(amount, reason)` — positive only, hard-capped (per award ≤ one homework session's value; per rolling week ≤ two sessions' value). **Kuromi can never deduct LP** — a bot that punishes recreates the exact stress being removed; her "punishment" is verbal, in character.
- `forgive_streak(reason)`.

**3. Visibility rule (absolute):** every executed intent is announced by Kuromi in the chat ("fine, missions are OFF, quit whining") AND surfaced as an undo-able Toast. No silent state changes, ever. The executor writes an `adjustments` log (last 50, synced) so Eyad can audit what she's been up to.

**4. Persona extension:** stewardship is in character — adjustments are favors, deals, and grudging acts of mercy, never system notifications. She uses her state read to modulate: busy/stressed week → she offers to soften the app; strong week → she escalates with a challenge drill.

Editable: `src/lib/kuromi/` (executor, tools, config store), `schema.ts` + `migrations.ts` (+ tests), `kuromi.mts` (tool definitions), gamification surface components (config-reactive reads + collection view), sync payload.

OUT OF SCOPE: `lp.ts` math, SRS scheduling, boss engine internals, mission/achievement definitions (config can hide missions, not redefine them).

**Manual check:** "I hate missions" in chat → missions off + announcement + undo Toast + log entry; award cap enforced when Kuromi is asked to shower LP; a fabricated out-of-whitelist tool call is dropped and logged; migration test covers V2→V3 state with defaults; collection view shows existing earned progress correctly.

**Sequencing note:** Phase 3's daily-quiz LP reward ships as specced and becomes config-aware here — do not redesign it in Phase 3.

---

## Phase 6 — Kuromi's Shelf (persistent pages)

**Goal:** Kuromi can create labeled, persistent pages in a section of her own, which Domi browses and filters. Example flow: Domi says she wants to hammer grammar → Kuromi builds a grammar page ("Het Hurts: a survival guide"), labels it, drops it on the shelf, and links it in chat.

**Structure:** `/kuromi` becomes the hub — chat plus a Shelf tab. Shelf = grid of page cards (title, Kuromi's one-line quip, label pills, created date, block count) with filter chips across the top (labels + a search box). Pages open at `/kuromi/shelf/[id]`.

**Pages are typed block documents, not freeform output.** Same propose/dispose principle as Phase 5, applied to content: Kuromi emits JSON; the executor validates against a strict block schema; existing renderers display it. She can never persist arbitrary markup. Block types (a page is an ordered list of these):

- `grammar-card` — pattern (FormulaBar bead spec), example nl/en (Bubble), optional trap (Sticker). Renders exactly like `/grammar` cards.
- `vocab-set` — word-pool ids and/or custom `{nl, en}` pairs, rendered as the vocab pill list with TTS.
- `drill` — the Phase 4 drill JSON, embedded and replayable. Still zero LP, no SRS writes (the shelf is sandbox; if Kuromi wants to reward completion she cuts a deal via her Phase 5 `award_lp` tool — the systems compose, they don't merge).
- `read` — short nl text + en gloss, Daily-Read styling.
- `note` — Kuromi prose (quips, mnemonics, encouragement-shaped insults).

**Tools (added to the Phase 5 whitelist):** `create_page({title, labels, blocks})`, `update_page(id, {title?, labels?, blocks?})`, `archive_page(id)`. Labels come from a suggested set (`grammar, vocab, phrases, listening, review, challenge`) plus free-form topic labels; the filter row is built from labels actually in use. Deletion is archive-only (hidden behind a filter, restorable) — Kuromi can never destroy Domi's stuff irreversibly. Every page action is announced in chat with a link and hits the Phase 5 adjustments log.

**Storage & caps:** pages live in synced state (`kuromiPages`, schema bump + migration + test). Caps enforced by the executor: ≤ 60 active pages, ≤ 20 blocks/page, ≤ 10 questions/drill block — protects the sync blob and localStorage from unbounded growth. At the page cap, Kuromi must archive before creating (in character: "shelf's full, something's gotta go").

Editable: `src/routes/kuromi/` (hub, shelf, page view), `src/lib/kuromi/` (block schema, executor extension, renderers), `kuromi.mts` (tool definitions), `schema.ts` + `migrations.ts` (+ tests), sync payload.

OUT OF SCOPE: everything Phase 5 lists, plus the app's own content modules — shelf pages never write into `GRAMMAR_CONTENT`, `READ_CONTENT`, or the word pool.

**Manual check:** "make me a grammar page" round-trip → page on shelf, labeled, announced with working link; filters narrow correctly with 5+ pages; embedded drill replays and grades; block cap and page cap enforced in character; an invalid block type is rejected and logged; archive → restore works; pages survive a sync round-trip on a second device.

---

## Cross-phase reminder (the one rule that fights the default)

This is a retheme and surface expansion on a live app with a real user's earned progress. **Do not restructure engines, do not "improve" adjacent code in passing, and never ship a state-shape change without a migration + test.** When a phase seems to require breaking that, stop and explain instead of doing it.
