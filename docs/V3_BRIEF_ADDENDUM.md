# Dutchina V3 — Brief Addendum (docs/V3_BRIEF_ADDENDUM.md)

Extends docs/V3_BRIEF.md. Precedence: V3_STATE > V3_DESIGN (visual/compositional) > this addendum > V3_BRIEF. The brief's Boundaries, Routing, and Session economics sections remain in force for all phases below.

## Phase 4.5 — Recomposition

**Goal:** rebuild every screen's UX and UI per docs/V3_DESIGN.md. This is the phase Phase 1 should have been: composed design executed, not a token swap. Engines, state, routes' logic: untouched. Phase 4's Kuromi UI is provisional and is recomposed here like everything else.

**Step 0 — assets & foundations (single lane, blocking):**
- Unzip the provided asset pack into `static/characters/` (kuromi/, melody/, piano/, doodles/, manifest.json). Build `Character.svelte` (props: who, mood, size, animated — resolves via manifest, static fallback, reduced-motion aware) and `Doodle.svelte` (name, color, size, tilt — inline-injects the currentColor SVG).
- Retoken app.css to the V3_DESIGN §2 palettes (daylight family + realm block). Kill dead tokens (mint/butter). Add flavor primitives: offset-shadow utilities, jitter utility (deterministic per-element hash → -3..3°), grain overlay, polka backdrop, dashed-border variants.
- Vendor Font Awesome Pro 6.5.1: copy ONLY per-icon SVGs actually used (architect compiles the list, target ≤35, duotone+light) into `src/lib/icons/`; build a thin `Icon.svelte`. The full webfont/CSS must NOT ship; add a gate grep for `webfonts/`.
- Fix the 13px floor (Pill size="sm", SpeakerButton label) — closes V3_STATE's parked finding.
- Chat mood protocol: parse `[mood: x]` from Kuromi replies in the message renderer, strip it, render the expression via Character.svelte. Unknown → talk.

**Step 1 — VERTICAL SLICE (gate):** Home mobile + desktop framed layout + Doelen sheet, at full V3_DESIGN fidelity including motion. STOP. Present to Eyad for the vibe verdict. Iterate on this slice only until approved. The approved slice is the reference implementation; record any rule changes into V3_DESIGN via V3_STATE deviation entries.

**Step 2 — rollout (parallel lanes, post-approval):** all remaining screens per V3_DESIGN §8 — quiz, read, stories(+chapter), grammar, vocab/cards, match, reviews, boss realm (incl. threshold transition), kuromi hub + chat sheet, toasts/modals, settings. Lane specs cite the slice as the standard. Per-screen "matches" checklist from V3_DESIGN §10 is part of each lane's verification.

**Persona swap (small contained unit):** replace the architect-authored system prompt in kuromi.mts chat mode with the approved Dutchina-Kuromi persona (provided text, includes the mood-tag instruction); add the one-line voice note to drill mode's quip fields. Re-run the Phase 4 chat manual checks + one soften-then-deny exchange.

**Editable surface:** app.css, src/lib/components/**, src/lib/icons/** (new), src/lib/kuromi/** (UI only), all route files' presentation, static/characters/** (new), kuromi.mts (persona text only), netlify/toml if needed. NOT editable: state engine, lp.ts, srs.ts, sync.mts, generators, schema (no migration expected this phase — flag immediately if one seems needed).

**DONE:** gates green; slice-approved; every screen passes the §10 checklist at 375px and ≥1080px; reduced-motion pass; key/webfont greps clean; advisor end-of-phase review; committed; V3_STATE updated.

## Phase 5 amendments (Steward — otherwise per V3_BRIEF)
- Config-reactive surfaces implement against the recomposed UI: streak/missions/display toggles map to the Doelen sheet and ambient badges, `progression.display: collection` renders the sticker-book view IN the design language (jittered earned stickers on shelves).
- Kuromi announcements use the mood protocol (e.g. forgive_streak → `thanks` or `hehe`).
- Carried fixes land here as contained units: (a) sync.mts routing bug — fix and verify against a deploy preview; (b) DOMI_SYNC_KEY in client bundle — move to runtime-entered key in settings (stored locally), out of the bundle; add gate grep; (c) background function plan-gating — verify drill background jobs on the production plan BEFORE building steward tools on the same mechanism; if plan-gated, decide sync-with-longer-timeout fallback first.
- QuizRunner index-derived ids: migrate to structural ids (Phase 3 convention) BEFORE drills become persistable — prerequisite for Phase 6, do it here.

## Phase 6 amendments (Shelf — otherwise per V3_BRIEF)
- Shelf and pages render entirely in V3_DESIGN language: label chips jittered, blocks reuse identity treatments, piano/melody cameos allowed per casting rules.
- Block renderers consume the recomposed grammar-card/vocab/read components — no parallel renderers.
- Drill blocks replay via the structural-id QuizRunner (fixed in Phase 5).

## Session notes
- One session per phase still holds; Phase 4.5's slice gate may end the session at the gate (write V3_STATE, resume rollout in a fresh session with the verdict) — treat gate-stop as a legitimate session end.
- V3_DESIGN.md and this addendum are committed to docs/ before the Phase 4.5 session starts, from Eyad's canonical copies — the architect never retypes them.
