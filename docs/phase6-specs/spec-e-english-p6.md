# LANE e-english — Phase 6 Unit E: the full-English audit (CA-16)

## 0. Ground rules — read before anything

- Worktree: `.claude/worktrees/e-english`, branch `e-english`, based on `phase-6` **after every feature
  lane has merged**. You are the last content lane. **Work ONLY there.**
- **FORBIDDEN:** `git checkout`, `git restore`, `git clean`, `git reset`, `git stash`, `npm run format`,
  and editing any file outside §2. Do not run `npm run check`.
- Run grok **FOREGROUND ONLY**. Never background or detach. On a first "not authenticated", re-probe with
  `grok models`; report unavailable only after **three** consecutive failures.
- Scratch files: system temp dir, PID/timestamp-qualified, none left in the repo.
- Edit with **Python, `encoding='utf-8'`, `newline=''`**. Never PowerShell string manipulation — one such
  run corrupted a file in this repo (em-dashes became `???`, a stray CR merged two statements).
- **If the spec conflicts with the code, STOP and report.**

## 1. THE RULE — quoted verbatim from canon (`docs/V3_DESIGN.md` §3, CA-16)

> **Language rule — CA-16 (Phase 6). THE APP IS IN ENGLISH. This supersedes CA-13's function split
> entirely, and any blanket "Dutch-forward" instruction before it.**
>
> CA-13 asked every implementer to judge whether a given string was "ambient flavor" or
> "comprehension-critical". That judgment was made differently by every lane, and the boundary was never
> checkable. The rule is now trivially checkable instead:
>
> - **EVERYTHING in the menu and the app chrome is ENGLISH.** Navigation and section labels (`lezen` →
>   **Reading**, `luisteren` → **Listening**, `schrijven` → **Writing**, `kaarten` → **Cards**, `oefenen`
>   → **Practice**, `doelen` → **Goals**, `missies` → **Missions**, `prestaties` → **Achievements**,
>   `weekset` → **Week set**), greetings, mission strings **and their requirement descriptions**, empty
>   states, buttons, toasts, modals, settings, errors, system explanations — all of it.
> - **Dutch exists ONLY as learning content**: the word pool, sentences, stories and their chapters,
>   lezen/luisteren exam passages and their questions, schrijven prompts, grammar examples, Daily Read
>   texts. Dutch is the thing being taught, never the thing doing the teaching.
> - **The audit rule: any Dutch string outside a content module is a violation.** It needs no
>   interpretation. Content modules are `src/lib/{lezen,luisteren,read,grammar,conversation,reviews,data}/`
>   and `WORD_POOL.json` / `SENTENCES.json`.
> - **Kuromi speaks English with Dutch examples**, unchanged. Her voice is not UI chrome and this rule
>   does not touch it.
>
> **§8's per-screen briefs below still describe composition faithfully, but their Dutch microcopy
> examples are superseded by this rule** — read `"oefenen"` there as the Practice section,
> `"weekset 0/36 · missies ›"` as the same quiet line in English, and so on. The layout is canon; the
> language of the label is not.

Also binding, from §3:

> - Headings: ink, letter-spacing -0.02em. UI microcopy is lowercase-friendly ("practice", "good
>   morning") — headers may be lowercase for warmth; body text uses normal casing.

**The lowercase warmth survives. Translate the language, keep the register.** `oefenen` becomes
`practice`, not `PRACTICE` and not `Practice` where the original was lowercase for warmth.

## 2. Editable surface

**Every file under `src/` that renders a user-facing string**, EXCEPT the content modules named in the
rule above. In practice this centres on:

- all `.svelte` under `src/lib/components/**` and `src/routes/**`
- `src/lib/missions/MISSIONS.ts` — mission labels **and their requirement descriptions**
- `src/lib/components/home/pluralize.ts` (+ its test) — Dutch pluralization of "week"/"dag"
- `src/lib/home/dailyPath.ts` — any user-facing label
- `src/lib/boss/bossContent.ts` — **only** its chrome; boss taunt/flavor content needs a judgment call, see §4
- `src/lib/kuromi/context.ts` — the `screen` label table Kuromi is told about

**NOT editable, and not violations:**

- `src/lib/{lezen,luisteren,read,grammar,conversation,reviews,data}/**` — content modules. Dutch there is
  the subject matter.
- `netlify/functions/lib/persona.mts` and `docs/KUROMI_PERSONA.md` — her voice is exempt by the rule
  itself, and persona text is the architect's, never a lane's.
- `docs/**` — the architect owns canon.

## 3. WHAT IS **NOT** UI TEXT — read this twice

This is the single largest way this lane can cause damage. The following are **code**, not chrome, and
**must not be touched**:

- **Route URLs and directory names.** `/lezen` stays `/lezen`. `/luisteren` stays `/luisteren`. Renaming
  a route directory changes every `resolve()` call, every link, and every bookmark Domi has. **The label
  in the nav becomes "Reading"; the URL does not change.**
- **State field names and schema keys** — `weekset`, `practiceDays`, `dailyRead`, anything persisted.
  Renaming one is a schema change requiring a migration, and this lane ships no migration.
- **CSS class names, `data-*` attributes, component names, file names, variable names, function names.**
  `DoelenSheet.svelte` keeps its name; its rendered heading becomes English.
- **Mission ids, achievement ids, word ids, category ids** — anything data keys off.
- **Test fixture strings** that assert on the above.

If changing a string would change behaviour, a URL, or a stored value, it is not chrome. Leave it and
report it.

## 4. HOW TO DO THE WORK — this is a judgment task

**You may NOT do this with a scripted find-and-replace over a Dutch wordlist.** This is a hard
prohibition with a recorded cause: an earlier lane in this project turned a content-judgment task into a
keyword script and scored **76.7%** on a blind audit, miscategorising words by substring match. A
wordlist cannot tell `lezen`-the-nav-label from `lezen`-the-route from `lezen`-the-CSS-class.

The method is:

1. **Read each file.** Enumerate every string that reaches a user's eyes — rendered text, `aria-label`,
   `alt`, `title`, `placeholder`, `<title>`, toast/error copy.
2. For each, classify: **chrome** (→ English), **learning content** (→ stays Dutch), or **code**
   (→ untouched, per §3).
3. Translate chrome, preserving register, length and tone. These are small warm labels, not formal
   copy — a nav label that gets longer can break a layout, so prefer the short natural word.
4. Where a Dutch string is grammatically fused into logic — **`pluralize.ts` produces "1 week" / "5
   weken"** — port the logic, do not just swap words. English pluralization is a different function, and
   the existing tests encode the Dutch rules. Rewrite both together.

**Scripts are permitted ONLY to find candidates and to verify afterwards** — never to decide or to apply
a change. Say in your report exactly which scripts you ran and for what.

**`bossContent.ts` needs an explicit judgment call.** Boss fight flavor text is neither obviously chrome
nor obviously learning content. **Do not decide it unilaterally**: classify each string, translate the
ones that are plainly UI (buttons, labels, HUD, result screens), and **list the ambiguous flavor lines in
your report for the architect to rule on.** Leave those unchanged.

## 5. Layout is a real risk

English is often longer than Dutch. The nav bar in this app is **measured at capacity** — at 375px the
track is 333px and six labels once totalled 327px, which is why the app has 5 tabs and not 7. A longer
label can overflow it.

- After translating, **re-measure the nav at 375px** and report the numbers.
- Same for any fixed-width chip, pill or badge you touch.
- **A translation that overflows is a bug**, not an acceptable cost. Pick a shorter English word.

## 6. Verification — headless

```
npx prettier --check "src/**"
npx eslint src
npx vitest run
```

Then render, because layout regressions do not show up in any of the above:

```
npm run build && npx vite preview --port <free port>
```

- `vite preview` against a build, **not** `vite dev` (dev hits an `fs.allow` 403 inside a worktree).
- **Unregister the service worker and clear caches before measuring** — `dutchina-shell` re-registers on
  every page load and has served stale CSS through two dev-server restarts here.
- **Hydration takes ~7s** — poll for real body content, never a fixed wait.
- **Kill your preview server when done.**
- **Seed state with `context.addInitScript`**, not `localStorage.setItem` on a live page.

Walk **every route** at **375px and 1280px** and report:

- **zero Dutch strings in chrome** — this is the deliverable. Include the Shelf, the Kuromi hub, both
  tabs, settings, the Doelen sheet, achievements, toasts, and the modals;
- Dutch **still present** where it should be: word pool rows, story chapters, lezen/luisteren passages,
  Daily Read texts, grammar examples, and inside Shelf page blocks;
- `scrollWidth === clientWidth` on every route (no overflow from longer labels);
- the nav at 375px: total label width and whether any tab clips;
- zero text below 14px; zero console errors.

**The "zero Dutch chrome" claim must be evidenced by a walk you actually performed, route by route** —
not by a grep returning no matches. A grep proves your wordlist found nothing, not that the app is
English.

## 7. Report contract

Return, and nothing more:

1. files touched;
2. ≤10 lines on what changed;
3. the verification commands with output tails, plus every measured number from §6;
4. **the route-by-route walk**: for each route, what chrome you changed and what Dutch you deliberately
   left because it is learning content;
5. **which scripts you ran and for what** (§4) — and confirmation that no script decided or applied a
   translation;
6. **the `bossContent.ts` ambiguous list** for the architect to rule on;
7. anything you found that looked like chrome but was actually code (§3), left untouched;
8. any spec conflict, unexpected file, or thing you could not verify headlessly.
