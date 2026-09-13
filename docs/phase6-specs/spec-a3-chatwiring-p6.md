# LANE a3-chatwiring — Phase 6 Unit A3: StewardHost page methods + the ChatSheet page-tool loop

## 0. Ground rules

- Worktree: `.claude/worktrees/a3-chatwiring`, branch `a3-chatwiring`, based on `phase-6` **after Unit 0,
  A1 and A2 have merged**. **Work ONLY there.**
- **Concurrency notice: live lanes are named in your dispatch message.** Files outside your set that
  appear changed are **not yours to judge, revert, or clean up.** Report and continue.
- **FORBIDDEN:** `git checkout`, `git restore`, `git clean`, `git reset`, `git stash`, `npm run format`,
  editing any file not in §1. Do not run `npm run check`.
- Run grok **FOREGROUND ONLY**. Never background or detach. Re-probe a first "not authenticated" with
  `grok models`; report unavailable only after **three** consecutive failures.
- Scratch files: system temp, PID/timestamp-qualified, none left behind.
- Edit with **Python, `encoding='utf-8'`, `newline=''`**. Never PowerShell string manipulation.
- **Verification is HEADLESS ONLY.** Temp-profile, isolated, closed after.
- **If the spec conflicts with the code, STOP and report.**

## 1. Editable file set

| File                                         | Action                                   |
| -------------------------------------------- | ---------------------------------------- |
| `src/routes/+layout.svelte`                  | edit — `StewardHost` implementation only |
| `src/lib/components/kuromi/ChatSheet.svelte` | edit                                     |
| `src/lib/kuromi/announce.ts`                 | **create**                               |
| `src/lib/kuromi/announce.test.ts`            | **create**                               |

`executor.ts`, `pageStore.ts`, `pageSchema.ts`, `schema.ts` are **read-only** — earlier lanes own them
and they are already correct.

## 2. Objective

Make the page tools actually reachable. `+layout.svelte`'s `StewardHost` gains the two page mutators;
`ChatSheet` routes page tool calls through the existing `executeIntents` loop; **every page action is
announced in chat with a working link, an undo Toast, and an adjustments-log entry.**

## 3. `+layout.svelte` — two host methods, nothing else

A1 defined these on `StewardHost`:

```ts
upsertPage(page: KuromiPage): void;
removePage(id: string): void;
```

Implement them against `gameState.pages` **using `pageStore.ts`'s pure helpers** (`upsertPageIn`,
`removePageFrom`) and the file's existing state-mutation + persistence pattern. Do not write a second
implementation of the array logic, and do not reach for localStorage directly.

**The recorded hazard this repeats:** `patchConfig` was given its own hand-written key list as a "second
layer", it diverged from the executor's, and it failed **silently** after the executor had already
returned `applied` and written an audit entry — manufacturing a phantom-narration bug. **A host method
that re-derives logic is not defence in depth.** These two methods must be dumb: call the helper, assign
the result, persist. If you are writing a conditional in either of them, stop and report.

**Do not touch anything else in this file.** In particular do not touch the weekly streak/practiceDays
reset block — V3_STATE records that logic as **correct and explicitly not to be "repaired"**, and an
earlier session wrongly called it a bug.

Both dev-only console handles (`__kuromiSteward`, `__dutchina`) stay `import.meta.env.DEV`-gated. If your
change would expose anything new globally, it does not ship.

## 4. `ChatSheet.svelte` — the tool loop

The two-leg loop already exists for the three Phase 5 tools and **already handles page tools generically
if the executor accepts them** — verify that before writing anything, and if it is already generic, say
so and change nothing there. Your job is what the existing loop does not do: the announcement.

Rules that are already load-bearing and must not regress:

- **Leg 2 is sent with the `pendingToolCalls` the executor returned — never rebuilt from the raw calls.**
  That is what keeps fabricated tool names from reaching the server, where they would 400 the request and
  take any legitimate call in the same turn down with them.
- **Both legs share ONE context packet, built BEFORE `executeIntents`.** Rebuilding it for leg 2 feeds
  her post-mutation state as the prior state, and she narrates the new value as the old one — observed
  live once already. The truthful `toolResults` carry what changed; the packet carries what things were.
- **On leg-2 failure the change is already applied**, so render a fixed in-character fallback and still
  show the Toast and the log entry. Never drop the announcement because the narration call failed.
- Action toasts live **30s** and pause on hover/focus (8s was measured too short in live use; pause is
  WCAG 2.2.1 for a timed control). Do not change these constants.

## 5. `announce.ts` — the page-action announcement

A small pure module so the announcement is testable without a browser.

```ts
export interface PageAnnouncement {
	text: string; // what gets appended to her reply, plain text
	href: string; // '/kuromi/shelf/<id>'
	pageTitle: string;
}
export function buildPageAnnouncement(
	result: StewardToolResult,
	call: KuromiToolCall,
	pages: KuromiPage[]
): PageAnnouncement | null;
```

- Returns `null` for anything that is not a page tool, and for `rejected` outcomes (there is no page to
  link to). `capped` **does** announce — it persisted, just smaller.
- The link is a real route: `/kuromi/shelf/<id>`. **Do not hand-build the string in the component**;
  build it here so one test covers it. Use SvelteKit's `resolve()` at the call site and type the value as
  `import('$app/types').Pathname` — widening an `href` to `string` erases the typed-route check and
  produces `svelte-check` errors that **eslint and prettier both pass**. This has cost a lane a full
  corrective pass in this project already.
- The text is short and factual — the _voice_ is hers, from leg 2. This is the fallback wording used when
  leg 2 fails, and the link anchor otherwise. English (CA-16).

**The announcement renders as a typed link element, not as markup.** `ChatSheet` already renders bubble
text through an escape-then-emphasis path; the link is a real `<a>` in the component, built from
`href`/`pageTitle`. **No `{@html}` on anything model-authored** — that is a recorded Phase 6 entry gate.
The page title is Kuromi's text and must reach the DOM through plain interpolation.

## 6. Sound

Page actions are Kuromi events. If a sound fires, it fires \*\*with its mood/motion twin — sound + sticker

- animation together or not at all\*\* (§12). Prefer reusing an existing wired event over adding one; if no
  event fits, add nothing and say so. Do not add files to `static/sfx/`.

## 7. Tests

`announce.test.ts`: page tool + `applied` → announcement with the right href and title; `capped` →
announces; `rejected` → `null`; a non-page tool → `null`; an id absent from `pages` → `null` rather than
a dead link; the href matches `/kuromi/shelf/<id>` exactly.

**Every new test must be shown to FAIL against the pre-change code.** Report which you ran and what they
printed.

## 8. Verification — headless

```
npx prettier --check "src/routes/+layout.svelte" "src/lib/components/kuromi/**" "src/lib/kuromi/announce*"
npx eslint src/routes/+layout.svelte src/lib/components/kuromi src/lib/kuromi/announce.ts src/lib/kuromi/announce.test.ts
npx vitest run src/lib/kuromi
```

Then render. `npm run build && npx vite preview` — **`vite dev` cannot serve `/.netlify/functions/*`**
(there is no proxy in `vite.config.ts`), so anything touching the real chat path needs
`netlify dev --dir build`. Note `netlify dev` binds a **fixed internal port 3999** that no flag moves, so
only one instance can run in a tree at a time.

You **cannot** exercise the real model end-to-end (that needs a signed-in session and an access key, and
the architect cannot script a magic-link sign-in). So:

- **Stub the client** and drive `executeIntents` with a synthetic `create_page` tool call. Verify: the
  page lands in state, the announcement bubble renders with a **clickable link that navigates to the
  page**, the undo Toast appears, undo removes the page, and an adjustments entry exists.
- Then repeat for `update_page` and `archive_page`.
- Verify a **`rejected`** outcome renders her refusal with **no link and no undo**.
- Verify the service worker is cleared before measuring — a stale bundle has twice dissolved a reported
  defect in this project.
- Report explicitly which paths are stub-verified and which are unproven, and say plainly that the real
  signed-in path is the architect's manual pass, not yours.

## 9. Report contract

1. files touched;
2. ≤10 lines on what changed;
3. verification commands with output tails, plus the rendered results from §8;
4. whether the existing tool loop was already generic over tool names (§4), quoting the lines that
   decided it;
5. which tests you ran against pre-change code and what they printed;
6. confirmation that `{@html}` appears nowhere in your diff (show the grep);
7. explicit list of what is stub-verified vs unproven;
8. any spec conflict, unexpected file, or thing you could not verify headlessly.
