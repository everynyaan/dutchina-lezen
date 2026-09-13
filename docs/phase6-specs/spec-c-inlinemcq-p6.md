# LANE c-inlinemcq — Phase 6 Unit C: inline MCQs in chat

## 0. Ground rules

Worktree `.claude/worktrees/c-inlinemcq`, branch `c-inlinemcq`, based on `phase-6` **after Unit 0, A1, A2,
A3 and B have merged**. Work ONLY there.

**FORBIDDEN:** `git checkout`/`restore`/`clean`/`reset`/`stash`, `npm run format`, editing any file not in
§1, running `npm run check`. Run grok **FOREGROUND ONLY** (re-probe a first "not authenticated" with
`grok models`; report unavailable only after three consecutive failures). Scratch files in system temp,
PID-qualified, none left behind. Edit with **Python, `encoding='utf-8'`, `newline=''`** — never PowerShell
string manipulation. Verification **headless only**. **Concurrency notice comes in your dispatch message.**
**If the spec conflicts with the code, STOP and report.**

## 1. Editable file set

| File                                              | Action                                  |
| ------------------------------------------------- | --------------------------------------- |
| `src/lib/kuromi/mood.ts`                          | edit — extend the parser                |
| `src/lib/kuromi/mood.test.ts`                     | edit (or the existing parser test file) |
| `src/lib/components/kuromi/InlineQuestion.svelte` | **create**                              |
| `src/lib/components/kuromi/ChatSheet.svelte`      | edit                                    |
| `netlify/functions/lib/persona.mts`               | edit — **verbatim insertion only**, §5  |

`OptionList.svelte` and everything under `src/lib/components/question/` are **read-only** — you consume
them, you do not modify them.

## 2. Objective

Kuromi can put **one multiple-choice question inside a chat message**. The chat renders it as tappable
options and grades it **inline**, with her reaction. **Zero LP, no SRS writes.** It reuses the existing
question components — **never a parallel renderer.**

## 3. The protocol

`parseReply()` in `mood.ts` already extracts `[mood: x]`, `[sticker: x]` and `[react: x]` and strips all
tags so Domi never sees a raw one. Extend it with a **delimited block**:

```
[question]
Which is right: "het huis" or "de huis"?
- het huis
- de huis
* het huis
> Diminutives and huis-shaped nouns take het. Deal with it.
[/question]
```

- Lines beginning `-` are options; the single line beginning `*` is the correct answer.
- The optional line beginning `>` is her explanation, revealed **after** she answers.
- The first non-marker line is the prompt.

**Deliberately not JSON and not a code fence.** The persona already forbids her putting JSON or a code
fence in a reply (Domi sees the message verbatim, so a stray tool-call-shaped blob is both broken and
humiliating). A JSON question block would contradict that rule and re-open a failure mode this project
already paid for. Do not "improve" the protocol into JSON.

Parser rules, all failing closed — a malformed block is **dropped silently and its text removed**, exactly
as an unknown sticker name is dropped today. A broken question must never render as raw text in her
bubble:

- **at most one question per reply** — extra blocks are dropped;
- **2 to 4 options**; fewer or more → drop;
- **the `*` answer must match one option character-for-character** → otherwise drop. An MCQ whose answer
  is not an option is ungradable, and this is the same rule the drill validator already enforces;
- unterminated block, empty prompt, or duplicate options → drop;
- clamp prompt/options/explanation to sane lengths; strip any nested tag markers.

`ParsedReply` gains an optional question field. **Everything else about `parseReply` is unchanged** — in
particular `[mood:]` keeps its last-line-only rule (so a stray bracket in prose cannot eat content) and
the global safety-net strip stays, so no raw tag can reach Domi even if a line scan misses one.

**Parsing happens at RENDER time from the stored raw reply**, matching how moods already work. Turns keep
`{role, content}` with tags intact, so **an old conversation replays its question correctly** and no
migration is needed. Do not strip question blocks out of stored content.

## 4. `InlineQuestion.svelte`

Renders inside her bubble. Reuse **`OptionList.svelte`** — it already takes exactly what is needed:

```ts
{ options: OptionItem[]; selectedKey; correctKey; showResult: boolean; onselect: (key) => void }
```

Map options to `OptionItem[]` with stable keys **derived from option text, not array index** — this repo's
recorded convention after an index-keying bug, and the drill ids already work this way.

Behaviour:

- untouched → options tappable, no result shown;
- on tap → `showResult`, correct/wrong styling from `OptionList`, the `>` explanation revealed if present;
- **answered state is remembered for the rest of the session** so scrolling away and back does not reset
  it, and re-tapping does nothing;
- **her reaction is local — no extra model round trip.** Pick from the manifest moods already in
  `PERSONA_MOODS`: correct → `hehe` or `excited`, wrong → `shocked` or `grumpy`. Render through
  `Character.svelte` so reduced-motion and the static-fallback table apply.
- **Sound, if any, fires with its mood/motion twin — sound + expression together or not at all** (§12).
  Reuse an already-wired event; add no files to `static/sfx/`.

**THE SANDBOX GUARANTEE — this is the requirement most likely to be violated by helpfulness:** this
component and this lane import **nothing** from `$lib/lp/*`, `$lib/cards/srs`, `cardStore`, or any mission
/achievement engine. Answering an inline question changes **no** persisted learning state: no LP, no
`cardReviews` write, no mission progress, no achievement. Chat is a sandbox. Assert it in §7.

Design: CA-16 — every string English. 14px floor. `--color-muted-ink` for secondary text, never
`--color-muted-line`. No `--color-pink`/`--color-mint`/`--color-butter` (grep-gated). Only icons already
in `src/lib/icons/`, or the lucide icons `OptionList` itself already uses. **No `{@html}` on anything
model-authored** — the prompt, options and explanation are all her text and reach the DOM through plain
interpolation.

## 5. `persona.mts` — insert VERBATIM, author nothing

Persona text is the architect's, never a lane's. Append this at the **very end** of
`KUROMI_CHAT_SYSTEM_PROMPT`, after the shelf section added by lane a1-pagetools, preserving the enclosing
template literal exactly:

```
## Quizzing her in chat

Sometimes the fastest way to teach her something is to make her answer it.
You can drop a single multiple-choice question straight into a message:

[question]
Which is right: "het huis" or "de huis"?
- het huis
- de huis
* het huis
> Huis takes het. I don't make the rules, I just enjoy them.
[/question]

Lines starting with "-" are the options. The line starting with "*" is the
correct one and must match one of the options exactly, character for
character. The line starting with ">" is optional — it's what you say once
she's answered. Two to four options, one question per message, the whole
block on its own lines.

Use it when asking beats explaining — right after she's got something wrong,
or when you want to catch her being confident. Not every message. A question
every turn is an exam, and you are not an exam.

And this is chat, not her homework: nothing here earns LP and nothing goes
on her review schedule. If she asks, tell her straight.
```

Do not paraphrase, reflow, or "improve" it. Report the file's byte count before and after.

Note the recorded sequencing rule for this file: **a persona instruction and the parser that understands
it must land in the same change.** Shipping the persona line first means she emits a block the parser does
not recognise, which then renders as **raw text in her bubble**. Your parser change and this insertion are
one commit.

`docs/KUROMI_PERSONA.md` is Eyad's canonical copy and is **not yours to edit** — the architect syncs it.

## 6. `ChatSheet.svelte`

Render `InlineQuestion` when `parsedReply.question` is present, inside her bubble, below the text. Nothing
else about the message pipeline changes — do not touch the two-leg tool loop, the shared context packet,
the 30s action toasts, or conversation handling from lane b-conversations.

## 7. Tests

Parser (`mood.test.ts`): a well-formed block parses and is stripped from the text; each malformed case in
§3 is **dropped and leaves no visible residue**; a question block coexisting with `[mood:]`, `[sticker:]`
and `[react:]` in one reply parses all four; a reply that is _only_ a question block still renders
something sensible; `*` not matching an option drops the block; 1 option and 5 options both drop.

**The sandbox assertion:** a test proving this lane's modules import nothing from the LP/SRS/mission
surface. A grep-based test over the new files is acceptable and is the honest form — say so.

**Every new test must be shown to FAIL against pre-change code.** Report which and what they printed.

## 8. Verification — headless

```
npx prettier --check "src/lib/kuromi/**" "src/lib/components/kuromi/**" "netlify/functions/lib/**"
npx eslint src/lib/kuromi src/lib/components/kuromi netlify/functions/lib
npx vitest run src/lib/kuromi
```

Then `npm run build && npx vite preview` (not `vite dev`). Clear the service worker and caches before
measuring; poll for body content (hydration ~7s); kill the preview server after; seed with
`context.addInitScript`.

Seed a conversation containing a reply with a valid question block and one with a malformed block, at
375px and 1280px:

- options render tappable; tapping shows correct/wrong and reveals the explanation;
- the wrong answer shows her wrong-reaction expression, the right answer her correct one, and **under
  `prefers-reduced-motion` a static image renders, never a broken one**;
- **`totalLp` unchanged and zero `cardReviews` writes after answering** — assert both explicitly;
- the malformed block renders **nothing at all**, and **no raw `[question]` text is visible anywhere**;
- reloading and reopening the conversation replays the question with its answered state;
- zero horizontal overflow; 14px floor; zero console errors.

**`netlify/functions/**`is OUTSIDE the SvelteKit tsconfig —`npm run check`has never type-checked it.**
Nothing but your care protects`persona.mts`. Since your only change there is a verbatim string
insertion, verify the file still parses by importing it in a scratch node script, and say you did.

## 9. Report contract

1. files touched; 2. ≤10 lines on changes; 3. commands + output tails + every measured number;
2. which tests you ran against pre-change code and what they printed;
3. `persona.mts` byte count before and after, and confirmation it still parses;
4. confirmation `{@html}` is absent from your diff (show the grep);
5. **what a hostile reply could do to your parser** — answer honestly, including "nothing";
6. any spec conflict, unexpected file, or thing you could not verify headlessly.
