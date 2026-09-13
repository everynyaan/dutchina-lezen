# LANE b-conversations — Phase 6 Unit B: multi-conversation chat history

## 0. Ground rules

Worktree `.claude/worktrees/b-conversations`, branch `b-conversations`, based on `phase-6` **after Unit 0,
A1, A2 and A3 have merged**. Work ONLY there.

**FORBIDDEN:** `git checkout`/`restore`/`clean`/`reset`/`stash`, `npm run format`, editing any file not in
§1, running `npm run check`. Run grok **FOREGROUND ONLY** (re-probe a first "not authenticated" with
`grok models`; report unavailable only after three consecutive failures). Scratch files in system temp,
PID-qualified, none left behind. Edit with **Python, `encoding='utf-8'`, `newline=''`** — never
PowerShell string manipulation. Verification **headless only**, temp-profile, closed after.
**Concurrency notice comes in your dispatch message; files outside your set are not yours to judge.**
**If the spec conflicts with the code, STOP and report** — every lane that has done so here was right.

## 1. Editable file set

| File                                                | Action                                |
| --------------------------------------------------- | ------------------------------------- |
| `src/lib/kuromi/conversations.ts`                   | **create**                            |
| `src/lib/kuromi/conversations.test.ts`              | **create**                            |
| `src/lib/kuromi/history.ts`                         | edit — see §4                         |
| `src/lib/kuromi/history.test.ts`                    | edit if it exists                     |
| `src/lib/components/kuromi/ConversationList.svelte` | **create**                            |
| `src/lib/components/kuromi/ChatSheet.svelte`        | edit                                  |
| `src/routes/kuromi/+page.svelte`                    | edit — mount the list in the Chat tab |

`schema.ts`, `subsystems.ts`, `executor.ts`, `pageStore.ts` are **read-only**.

## 2. Objective

Chat becomes multi-conversation, like any AI chat app: a **conversation list in the hub**, open an old one
and **resume where it left off**. Conversations are **synced** (Unit 0 put `conversations` on the state and
in the `pages` subsystem), **capped**, and **auto-titled from the opening topic**.

## 3. THE DISTINCTION THAT MUST NOT BLUR

There are two different caps and conflating them is the main way this lane goes wrong:

- **The model context window** — what gets _sent_ to xAI. Today `capHistory()`: **12 turns / 4000 chars**.
  **This does not change.** It exists to bound prompt cost and it is unrelated to storage.
- **The storage cap** — what gets _kept and synced_. New, and much larger.

A conversation displays and persists far more than it sends. Keep the two functions separate and named so
nobody later "simplifies" them into one.

## 4. `conversations.ts` — pure functions only

No Svelte, no localStorage, no Dexie, no `Date.now()` in a way that hides in logic (take `nowISO` as an
argument so tests are deterministic).

```ts
export const MAX_CONVERSATIONS = 20;
export const MAX_TURNS_PER_CONVERSATION = 40;
export const MAX_TURN_CHARS = 4000;
export const MAX_CONVERSATIONS_BYTES = 300_000;

export function newConversation(nowISO: string, id: string): KuromiConversation;
export function appendToConversation(
	c: KuromiConversation,
	turn: KuromiConversationTurn,
	nowISO: string
): KuromiConversation;
export function deriveTitle(firstUserMessage: string): string;
export function capConversations(list: KuromiConversation[]): KuromiConversation[];
export function sortByRecency(list: KuromiConversation[]): KuromiConversation[];
```

Rules, all failing closed:

- `appendToConversation` clamps the turn's content to `MAX_TURN_CHARS`, drops **oldest whole turns** past
  `MAX_TURNS_PER_CONVERSATION` (never a partial turn), and bumps `updatedAt`.
- `capConversations` first drops oldest-by-`updatedAt` past `MAX_CONVERSATIONS`, **then** applies the byte
  guard: while `JSON.stringify(list).length > MAX_CONVERSATIONS_BYTES`, drop the oldest. The count cap is
  the user-visible rule; the byte guard is the safety net that actually protects the sync row and
  localStorage. **Never drop the most recent conversation**, even if it alone exceeds the budget — clamp
  its turns instead and report that case in your tests.
- `deriveTitle` is **deterministic and local — no model call.** Take the first user message, collapse
  whitespace, trim to ~48 chars at a **word boundary**, add an ellipsis if truncated. Empty/whitespace →
  a fixed English fallback. It is a title, not a summary.
- Timestamps and ids come from arguments, never minted inside these functions.

**`updatedAt` is what merge uses for last-writer-wins**, so it must be a real ISO string from the host and
must move on every append. Do not invent a far-future value to "win" a merge.

## 5. `history.ts` — what survives

`capHistory()` is the **model context window** and stays exactly as it is (§3). Its other exports
(`loadHistory` / `appendTurn` / `clearHistory`) read and write
`dutchina_kuromi_chat_<profile>` in localStorage, which multi-conversation state replaces.

**Add a one-time import, do not just delete the key.** On first load after this ships, if the legacy key
holds turns, fold them into a single conversation titled from its first user message, persist it, and
then remove the legacy key. Domi's current transcript should not evaporate. Guard it so it runs once and
cannot resurrect the key later.

Anything you retire, retire fully — no dead exports left behind.

## 6. UI

**`ConversationList.svelte`**: conversations newest-first, showing title and a relative date; the active
one marked; a **New conversation** control. Selecting one loads it into `ChatSheet` and **resumes** — the
existing turns render and the next message appends to that conversation.

Mount it in the **Chat tab of the hub** (`/kuromi`). On the mobile sheet presentation, the list must be
reachable too — if that means a compact control that opens it, build that. **Reachability is the rule
that has bitten this project three times**, and every instance passed check/lint/test/build and was caught
only by looking at the screen.

**Mood, sticker and react rendering must be preserved in history.** Tags are parsed at **render** time
from the stored raw reply — turns keep `{role, content}` with tags intact. So this should work for free:
**verify it, and do not "clean" tags out of stored content.** A loaded old conversation must show the same
expressions, stickers and reacts it showed live.

Design: CA-16 — **every string you write is English**. §3's 14px floor. `--color-muted-ink` for secondary
text, never `--color-muted-line`. No `--color-pink`/`--color-mint`/`--color-butter` (grep-gated). Only
icons already in `src/lib/icons/` — the 35-icon budget has zero headroom. Overlays portal to
`document.body`. 2–4 visible doodles survive on the hub (count with `offsetParent !== null`).
**No `{@html}` on model-authored text** — recorded entry gate.

## 7. Tests

`conversations.test.ts` — every rule in §4 with its inverse: turn clamping; oldest-turn drop at 41;
oldest-conversation drop at 21; the byte guard dropping until under budget; **the single-oversized-newest
conversation case clamping instead of vanishing**; `deriveTitle` on a long message, a one-word message,
an empty message, and one with newlines; `capConversations` never reordering survivors' contents.

Plus: the legacy-import path produces one conversation and clears the key; running it twice does nothing
the second time.

**Every new test must be shown to FAIL against pre-change code.** Report which and what they printed.

## 8. Verification — headless

```
npx prettier --check "src/lib/kuromi/**" "src/lib/components/kuromi/**" "src/routes/kuromi/**"
npx eslint src/lib/kuromi src/lib/components/kuromi src/routes/kuromi
npx vitest run src/lib/kuromi
```

Then `npm run build && npx vite preview` (not `vite dev` — `fs.allow` 403 inside a worktree). Clear the
service worker and caches before measuring; poll for real body content (hydration ~7s); kill the preview
server after; seed with `context.addInitScript`, not `localStorage.setItem` on a live page.

Seed **3 conversations** with differing `updatedAt`, one containing a reply with a `[mood:]`,
a `[sticker:]` and a `[react:]` tag. Measure at 375px and 1280px:

- the list renders newest-first; selecting an old one loads its turns and the composer appends to **that**
  conversation, not a new one;
- **New conversation** starts an empty one and does not destroy the previous;
- the seeded tags render as expression, sticker and react — **and no raw tag text is visible anywhere**;
- the legacy localStorage key is imported once and then absent;
- caps: driving past 20 conversations drops the oldest and keeps the newest;
- zero horizontal overflow; 14px floor holds; zero console errors.

## 9. Report contract

1. files touched; 2. ≤10 lines on changes; 3. commands + output tails + every measured number;
2. which tests you ran against pre-change code and what they printed;
3. what you did with each retired `history.ts` export;
4. confirmation `{@html}` is absent from your diff (show the grep);
5. any spec conflict, unexpected file, or thing you could not verify headlessly.
