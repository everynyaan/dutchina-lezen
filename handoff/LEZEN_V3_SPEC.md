# Dutchina Lezen: content and learning spec (v3)

Scope is deliberately narrow: the content and the learning loop. Platform work (sync, phone layout, offline cache, security, removing the retired app) is out of scope. Kuromi is in scope: she is the coach across the whole loop (Unit 12), and her hosting (`SYNC_KEY`, `XAI_API_KEY`, background functions on the Netlify site) must work for that; Eyad confirms it before Ship A. Domi uses the app on a PC.

Repo: `everynyaan/dutchina-lezen` at `16a0515`. Implementer: Grok in Cursor. Owner: Eyad. Learner: Domi. Exam: Staatsexamen NT2 Programma I, Lezen, **2026-11-12**.

Files in this handoff (see `README.md` for where each one goes):
- `LEZEN_V3_SPEC.md`: this document.
- `data/OFFICIAL_ITEMS.json`: the real official questions of the 2023, 2024 and 2025 papers, transcribed from the CvTE booklets, with the official keys and per-year pass lines (Unit 1).
- `data/annotations.json`: those 105 official items tagged (Unit 1).
- `data/legacy-practice-items.json`: the 69 usable questions the original app had written on these texts, relabelled as practice items with their tags (Unit 5).
- `data/practice-sample-buurt-whatsapp.json`: a worked example of a practice pack (Unit 5).
- `data/PRACTICE_SETS.json`, `data/practice-sets-annotations.json`: the three practice sets from the PDFs, rebuilt (Unit 14); `data/CHANGES.md` lists every change from the PDFs.
- `briefs/ANNOTATION_BRIEF.md`, `briefs/PRACTICE_BRIEF.md`, `briefs/LEXICON_BRIEF.md`: how to produce more tagged items, practice packs and the notebook lexicon.

## 0. Rules for the implementer

- One unit per session, in order. A unit is done when `npm run check`, `npm test` and its manual check pass at 1280px wide in `npm run dev`. Run `npm run format` once at the start so `npm run lint` is usable; lint is red today only on formatting.
- Every state-shape change goes through `src/lib/state/migrations.ts` with a `CURRENT_SCHEMA_VERSION` bump and a test in `migrations.test.ts`. Before migrating, `store.ts` copies the raw stored string to `dutchina_state_<profile>_backup_v<old>`; if migration throws, do not save over the stored state.
- Sync is off for this fork. Do not write merge logic; where the sync code needs the new fields, default them and move on.
- App chrome is English; Dutch appears only as learning content.
- Never change official answer keys. Only Unit 1 may touch `LEZEN_CONTENT.ts`, and only as listed there.
- `netlify/functions/lib/persona.mts` is hand-written voice. Make only the edits listed in Units 2 and 12.

## 1. Exam facts

| Fact | Value |
| --- | --- |
| Duration | 110 minutes |
| Shape | 6 texts, 36 multiple-choice questions on the live exam |
| Delivery | Texts in a printed booklet, questions on the computer |
| Dictionary | Van Dale Pocketwoordenboek NT2 only, own copy |
| Scoring | 1 point per correct answer, scaled; pass is 500 |
| Published papers | 2023, 2024, 2025: 35 items each; pass line 23 (2023), 24 (2024), 24 (2025), from the official score tables |
| Option count | Mostly three options; 17 of the 105 official items have four (10 in 2023, 5 in 2024, 2 in 2025) |
| Paragraph labels | The 2023 text "Vijf fabels" prints roman numerals I to V in the margin and its questions refer to them ("in alinea II en IV"); the other 17 texts have no labels |
| More official papers | 2021 and 2022 Programma I openbare examens, in the official practice environment |

Sources: staatsexamensnt2.nl ("Hoe ziet het examen eruit", "Beoordeling", news of 2024-01-15).

## 2. The problem in one page

The app is supposed to build understanding through context. Today it builds the opposite:

- **The app's "official" questions are mostly not official.** Compared with the CvTE booklets: 2023 matches 0 of 35, 2024 matches 3 of 35, 2025 matches 28 of 35 (texts 1 to 5). The texts are faithful; the questions on them were written by whoever built the original app. They also drop the four-option items and the paragraph numbers the real papers use, and the pass line 24 was applied to all years while 2023 is 23. `data/OFFICIAL_ITEMS.json` replaces them; the old questions survive as practice items.

- Questions are asked without the text that answers them. The daily eval shows the title and one paragraph; drills show a 280 character cut. Domi can only answer from the options, which is guessing, and guessing on repeated items turns into remembering letters.
- The gist step is a keyword match between the title and an intro line. That rewards word matching, which is one of the two most common lures in the bank.
- The trap labels come from regexes on the question wording and put 75% of items in a catch-all. Nothing tells her why the key is right, where the evidence is, or why her option was tempting.
- Drills are self-graded, so a wrong answer can be marked as learned.
- Everything draws on the same 18 passages and 105 items, with no memory of what she has seen. Over 46 days she would see each passage about 2.5 times in the daily eval alone, answering the same questions. That is how memorization happens: not because she studies answers, but because the same question keeps coming back.
- The pass line shown everywhere (22) is wrong; the papers' own line is 24 of 35.
- The Patterns tab drills de/het and word order, which the reading exam does not test.
- The rules texts (examenreglement, Wonderrijk, Vision College) have numbered rules glued into giant paragraphs, lists and a table flattened into one line, and one word split into its own paragraph. Structure is part of reading; the app currently destroys it.

## 3. Learning design: understanding instead of memorizing

The design rests on four ideas. Every unit below serves one of them.

**1. Separate the text from the question.** Memorization attaches to question-and-answer pairs, not to texts. Knowing a text well is fine and even useful; answering the same question twice is not. So the app may bring a text back, but it must bring it back with a **new job**: a question she has not answered, a different question type, a paragraph-role task, a paraphrase task. The bank therefore gets three layers:

- **Official items** (105 now, about 175 with 2021 and 2022): the measuring stick. Used sparingly in daily practice, fully in mocks.
- **Practice items on official texts** (new, about 7 per passage): new questions written on the same texts, grounded in quoted evidence, with distractors built from the same trap types. These carry most daily practice, so official items stay fresh.
- **Practice sets** (the three sets from Eyad's PDFs: 18 texts, 105 rebuilt items): extra full-length rehearsals first, then unseen prose for practice. See Unit 14.

**2. Always go text first, options last.** The loop for every practice question is:

1. Read the question. Options are hidden.
2. Find it: click the paragraph that holds the answer (skipped for whole-text questions).
3. Show options, choose, confirm.
4. Feedback: the evidence sentence is highlighted, one line says why the key is right, and if she missed, her option's trap is named with a one-line reason. On a correct answer the lure is still shown.

Hiding the options until she has looked in the text is the single most important change. It makes the text, not the options, the source of the answer.

**3. Teach the structure of texts, not only answers.** Before questions on a text, a short "map" step asks what each paragraph does (introduces the topic, gives the origin, gives examples of a problem, states a rule, gives an exception, reports an opinion, reports research). That is exactly what purpose, main-point and "why this example" questions test, and it gives her a map for locating answers fast.

**4. Train the mechanism behind the exam's questions.** The exam's key almost always paraphrases the evidence, and the lures reuse the text's words. Two micro-drills train that directly:

- **Paraphrase match:** a sentence from the text and three rewordings; one means the same, the others are an echo, an overstatement or a flip.
- **Spot the lure:** a wrong option from an item she already answered; she names what is wrong with it (echo, not in the text, wrong condition, overstated...).

Supporting rules:

- **Repetition policy.** An official item is not served again within 21 days outside a mock. A passage comes back no sooner than 7 days later and always with a job she has not done on it. Option order is shuffled in practice (never in the mock), so she cannot remember letters.
- **Mocks use unseen papers.** At least one paper stays reserved until its mock.
- **Progress means skills, not scores.** Readiness is shown per question type and for "found the right paragraph", not as a count of items done.

## 4. Units and order

Ship A by 2026-10-04: Units 1 to 7. Ship B by 2026-10-11: Units 8 and 9, so the first mock can run that weekend. Ship C by 2026-10-20: Units 10 to 15 (Unit 14, the practice sets section, can move into Ship B if there is time, since the sets are ready; Unit 15's lexicon generation is content work and starts now). Content work in Units 5 and 13 starts now in parallel. Feature freeze 2026-11-01.

---

### Unit 1: text cleanup and item annotations

**Part A0, replace the questions.** In `src/lib/lezen/LEZEN_CONTENT.ts`, replace every passage's `questions` array with the questions of that passage from `data/OFFICIAL_ITEMS.json` (same ids `lezen-YYYY-N`, same `q()` helper; options may have a `D`), set each paper's `passingScore` from the file (2023: 23, 2024: 24, 2025: 24), and replace each passage's `intro` with the file's `intro` (the booklet source line in full; three app intros were truncated and two lacked the line "Lees eerst de vraag. Zoek het antwoord in de tekst."). Widen `LezenAnswer` to `'A' | 'B' | 'C' | 'D'` if needed. Add `paragraphLabels?: string[]` and `paragraphMap?: Record<string, number>` to `LezenPassage` and set them for `vijf-fabels` from the file (I to V, mapping to paragraph indices 2, 4, 6, 8, 10 after the prefixes are stripped); `ReadingPane` prints a label in the margin of a mapped paragraph. Strip the "I ", "II " ... prefixes the app text carries at the start of those paragraphs. Keep the old questions out of this file entirely; they move to `data/legacy-practice-items.json` (Unit 5).

**Part A, cleanup of `src/lib/lezen/LEZEN_CONTENT.ts`** (structure and typos only; no rewording, no key changes):
- examenreglement: each numbered article (1.1 to 4.5) and heading in its own paragraph; "- " list items on their own lines.
- abonnement-wonderrijk: one numbered rule per paragraph; split glued subheadings such as "2.1 Kinderen tot 4 jaar".
- vision-college: merge "gebruik je de" / "Visionpas" / ". Je scant..." into one paragraph, the same for "Vragen" / "? Ga naar Team debiteuren"; split glued headings ("Visionpas Je hebt...", "Vragen Met (andere) vragen"); address on its own lines.
- arbeidsmarkt: split the heading "Financiële basis"; lay out the "Top 5 wensen" table as two short lists.
- verzuim-op-het-werk: split the wit, zwart and grijs definitions.
- Inline bullets (•, ▪, "- ") in overuren, bakkerij, ondernemingsraad, vision-college, vijf-fabels: one item per line.
- Split beursstand paragraph 2 and autosportklas paragraph 4 (over 250 words) at their topic shifts.
- Typos: "€ 5,-administratiekosten" gets a space; "auto-sportklas" becomes "autosportklas"; 2025-31 option C "concierge" becomes "conciërge"; 2023-23 "client" becomes "cliënt"; vijf-fabels intro "thuisstudie doen, Deze" becomes "thuisstudie doen. Deze".
- Quotes: normalize the mixed quote pairs in buurt-whatsapp and word-buddy to curly quotes; make apostrophes in items 2025-8, 2025-29, 2024-2, 2023-25 match their passage.
- Test: no paragraph over 250 words, none under 3 characters.

**Part B, annotations.** Add `src/lib/reading/annotations.json` (from `data/annotations.json`), `src/lib/reading/annotations.ts`, `src/lib/reading/annotations.test.ts`, `docs/ANNOTATION_BRIEF.md` (from `briefs/`). Types in `src/lib/reading/types.ts`:

```ts
export const QTYPES = ['doel-tekst','doel-onderdeel','bron-publiek','hoofdgedachte','mening-persoon','detail','oorzaak-reden','toepassing','niet-vraag','functie-tekstdeel','betekenis-in-context','conclusie','vergelijking'] as const;
export type QType = (typeof QTYPES)[number];
export const TRAP_KINDS = ['echo','waar-niet-gevraagd','te-breed','te-smal','tegenovergesteld','niet-in-tekst','verkeerde-persoon','verkeerde-voorwaarde','overdreven'] as const;
export type TrapKind = (typeof TRAP_KINDS)[number];
export interface Evidence { p: number; quote: string } // p is a hint; resolve by quote
export interface ItemAnnotation {
  id: string; qtype: QType; evidence: Evidence[];
  move: string; why: string;                                   // English
  distractors: Record<string, { trap: TrapKind; why: string }>; // every non-key letter
  keyCheck: string;                                            // for Eyad only
}
```

`annotations.ts` exports `paragraphsOf(text)` (split on blank lines, trim, drop empties), `getAnnotation(id)`, `trapForPick(id, picked)`, `resolveEvidence(text, evidence)` (paragraph index that contains each quote), and English label maps:

| qtype | Label | Move shown in the UI |
| --- | --- | --- |
| doel-tekst | Purpose of the text | Source line, headline and last paragraph decide it. Answer it last. |
| doel-onderdeel | Purpose of a part | Find where the text says what that thing is for. |
| bron-publiek | Source and audience | Source line, form (je or u, rules, headings), who is addressed. |
| hoofdgedachte | Main point | The whole text, not one quotable line. |
| mening-persoon | Who thinks what | Find the name, read only that person's words. |
| detail | Find the fact | Keyword from the question, scan, read the sentence before and after. |
| oorzaak-reden | Why | Look for omdat, want, doordat, daardoor, waardoor, zodat, daarom. |
| toepassing | Apply the rule | Mark the case facts (age, time, amount, condition); find the rule that matches all of them. |
| niet-vraag | NOT question | Check each option in the text; the one you cannot find is the answer. |
| functie-tekstdeel | Why this example | The sentence around the example states the general point. |
| betekenis-in-context | Word in context | The explanation follows the word: a colon, "dat wil zeggen", an example. |
| conclusie | What follows | What the result shows as a whole, not a detail of it. |
| vergelijking | Compare | Find both sides; wrong options swap them. |

| trap | Label | Explanation |
| --- | --- | --- |
| echo | Echo | Uses words from the text, but the text says something else about them. |
| waar-niet-gevraagd | True, not the question | The text says it, but it does not answer what was asked. |
| te-breed | Too broad | Claims more, or more generally, than the text supports. |
| te-smal | Too narrow | One detail or paragraph, not the whole point. |
| tegenovergesteld | Flipped | Says the opposite of the text. |
| niet-in-tekst | Not in the text | Sounds reasonable; the text never says it. |
| verkeerde-persoon | Wrong person | Someone else in the text said or thinks this. |
| verkeerde-voorwaarde | Wrong condition | The rule for a different case, time, age or amount. |
| overdreven | Overstated | An absolute version (always, never, all, only) of a softer claim. |

Test: one annotation per official item and vice versa; valid enums; distractor keys equal option letters minus the key; every quote found in exactly one paragraph (after Part A, re-copy any quote that no longer matches, never reword); no em dashes.

All 105 official keys were checked against the official beoordelingsmodel PDFs; every `keyCheck` is "ok". Do not change a key for any reason.

---

### Unit 2: correct facts and copy

- Delete `PASS_SCORE` in `src/lib/reading/mock.ts`; add `passLineFor(exam) = exam.passingScore`, `targetFor(exam) = passLine + 1`. Generic copy: "The published papers needed 23 or 24 of 35. Aim for 25 or more."
- Remove every "22", "22 of 36", "Cesuur 22" and "not exam prep" string from home, eval, cards, mock, lezen, `src/lib/kuromi/context.ts` and `types.ts` (`cesuur: 22` becomes `passLine: 24, target: 25`), `docs/KUROMI_PERSONA.md`, README. Update `kuromiFunction.test.ts` (it expects `/pass at 22/`; expect `/24 of 35/`).
- `persona.mts` chat prompt, exact replacements: "six long texts, 36 multiple choice, 110 minutes, pass at 22" becomes "six texts in a printed booklet, 36 multiple-choice questions on the computer, 110 minutes; the published papers needed 24 of 35, so she aims for 25 or more". "(referents, hoofdonderwerp, trap options)" becomes "(where the answer sits, what the question type wants, and which lure an option is)". "(the almost-right option, the hij that isn't / who she thought)" becomes "(the option that echoes the text's words, the rule for the wrong case)". "whether today's 5-minute eval is done" becomes "whether today's daily text is done". "cesuur 22." becomes "the paper's pass line." "She needs 22 of 36, not a perfect paper." becomes "She needs about 24 of 35, not a perfect paper." "The daily 5-minute eval FEEDS trap cards; it is not exam prep." becomes "The daily text is a short real-exam rep that feeds trap cards." Drill prompt: "cesuur 22" becomes "pass line 24 of 35"; "(referents, hoofdonderwerp, bijna-goed)" becomes "(finding the evidence, question types and lures)".

Acceptance: grep finds no 22 pass line and no "not exam prep"; tests green.

---

### Unit 3: the reading loop components

Files: `src/lib/components/reading/ReadingPane.svelte`, `QuestionBlock.svelte`, `AnswerFeedback.svelte`, `ParagraphMap.svelte`.

Layout (desktop only, minimum 1200px; below that the app shows a "use a wider window" note): three columns. Text on the left (about 55%), question panel in the middle (about 30%), notebook rail on the right (about 15%, expandable to 30% and collapsible to a tab; Unit 15). Text and question panel scroll independently. Body text 18px, line-height 1.6. The intro prints as a muted source line above the title, as in the booklet. Remove the mobile tab switch, bottom nav and phone-width CSS; keep the desktop rail nav.

`ReadingPane` props: `passage`, `highlight?: Evidence[]`, `locateMode?`, `onLocate?(p)`, `locatedP?`, `scrollToEvidence?`. Renders `paragraphsOf(text)` with stable `data-p`; headings styled as headings; list lines as lists. `highlight` wraps quotes in `<mark>` by plain substring split. `locateMode` makes each paragraph a clickable block with hover and selected states. `scrollToEvidence` is used only after answering.

`QuestionBlock` props: `item` (official or practice), `phase: 'locate' | 'options' | 'feedback'`, `picked`, `shuffle: boolean`, `flaggable?`, `flagged?`, callbacks. In `locate` the options are **not rendered**; the panel shows the question, the qtype move line and "Click the paragraph where the answer is" with a small "Skip" link. Whole-text qtypes (`doel-tekst`, `hoofdgedachte`, `bron-publiek`) start at `options`. Options render as buttons; a Check button confirms. `shuffle` reorders options with a seed from the attempt, and displays letters A, B, C in the new order; answers are stored as the original letter.

`AnswerFeedback`: correct gives "Right." plus `why`; wrong gives "Not this one.", her option's trap label and `distractors[picked].why`, then `why`. Always shows "The lure here: <option text> (<trap label>)" for the most tempting distractor (first whose trap is not `niet-in-tekst`). If she located: "You looked in paragraph N; the answer is in paragraph M" or "You found the right place." The text scrolls to the highlighted evidence.

`ParagraphMap`: for a passage with a paragraph map (Unit 5), highlights each body paragraph in turn and asks "What does this paragraph mainly do?" with three role choices (the right one plus two other roles from the passage or the role list). Instant feedback with the one-line summary. Headings are skipped.

Acceptance: component tests for highlight, locate click, options hidden during `locate`, shuffle mapping back to the original letter.

---

### Unit 4: state v24 (attempt memory)

Add to `readingFork` (keep the field name `eval` for the daily state; keep retired fields untouched):

```ts
export type ItemOrigin = 'official' | 'practice' | 'fresh';
export type AttemptSource = 'daily' | 'drill' | 'texts' | 'mock' | 'map' | 'paraphrase' | 'lure';
export interface ReadingAttempt {
  itemId: string; origin: ItemOrigin; passageSlug: string; source: AttemptSource;
  at: string; picked: string; correct: boolean;
  locateP: number | null; locateHit: boolean | null; ms: number; mockId?: string;
}
export interface TrapCardV2 { trap: TrapKind; lastItemId: string; seenItemIds: string[]; dueDate: string; streak: number; misses: number; createdAt: string; tamedAt: string | null }
export interface DailyTextState { date: string | null; passageSlug: string | null; mapDone: boolean; itemIds: string[]; answers: Record<string, { picked: string; correct: boolean; locateP: number | null }>; completed: boolean }
export interface ReadingSettings { examDate: string; reservedPapers: number[]; lookupsPerText: number }  // lookupsPerText default 5, Unit 15
// readingFork also gains notebook: NotebookState (Unit 15)
// readingFork gains: attempts (cap 5000), traps, mockInProgress, mocks, settings; eval becomes DailyTextState
```

`MockSession` and `MockResult` as defined in Unit 9 (add them in this unit so the migration can create one). Migration v23 to v24: keep `showUpStreak` and `lastEvalDate`; reset `eval`; drop old `trapCards` and `trapStickers` (their labels were wrong); seed `attempts` from `lezen.questionResults` (origin official, source texts, picked ""); convert `lastMockScore` to one `MockResult` with `paperYear = [2025, 2024, 2023][dayIndex(lastMockAt, 3, 9)]`; `settings.examDate = '2026-11-12'`, `reservedPapers` = the newest paper with no mock.

Helpers in `src/lib/reading/history.ts` (pure, tested): `lastSeenPassage(fork, slug)`, `itemAttemptedWithin(fork, itemId, days)`, `accuracyByQtype(fork, { origin?, last: 30 })`, `locateRate(fork, last)`.

Acceptance: migration test from a realistic v23 fixture; helper tests.

---

### Unit 5: practice content layer

This is the content that makes the anti-memorization policy possible. Data lives in `src/lib/reading/practice/` as one JSON file per passage (`<slug>.json`), in the shape of `data/practice-sample-buurt-whatsapp.json`:

```ts
export type ParagraphRole = 'introduces-topic' | 'background-origin' | 'gives-example' | 'problem-risk' | 'rules-and-conflict' | 'states-rule' | 'exception-condition' | 'reports-opinion' | 'reports-research' | 'advice-instruction' | 'conclusion';
export interface PracticePack {
  passageSlug: string;
  paragraphMap: { p: number; anchor: string; role: ParagraphRole; summary: string }[]; // anchor = first ~48 chars of the paragraph, used to re-find it
  items: PracticeItem[];        // same fields as an official item plus its annotation: id, qtype, question, options, answer, evidence, move, why, distractors
  paraphrase: ParaphraseDrill[]; // { id, source: Evidence, afterItemId?, prompt, options, answer, distractors }
}
```

Content rules (full rules in `PRACTICE_BRIEF.md`):
- 6 to 8 practice items per official passage, covering qtypes the passage's official items do not already cover, and never duplicating an official item's evidence and answer. At least two `betekenis-in-context` items per passage on phrases a B1 reader may not know, where the context gives the meaning.
- Each item has 3 options in exam style (short Dutch, same register as the official items), evidence quotes copied exactly from the text, and every distractor labelled with a trap kind and a one-line English reason.
- 2 or 3 paraphrase drills per passage. A drill whose source sentence is the evidence of an official item carries `afterItemId` and is served only after that item has been attempted.
- A paragraph map entry for every body paragraph.
- "Spot the lure" drills are not authored: they are generated at runtime from annotations of items she has already attempted (the wrong option, its trap as the answer, two other trap kinds as choices).

Loader `src/lib/reading/practice.ts`: loads packs, resolves `anchor` and `evidence` against the current passage text, exposes `practiceItemsFor(slug)`, `paragraphMapFor(slug)`, `paraphraseFor(slug)`. Test: every pack validates (enums, exact quotes, anchors resolve, distractor keys, no em dashes, ids unique), and every official passage has a pack.

**Legacy practice items.** `data/legacy-practice-items.json` holds 69 questions that the original app had written on these texts, now relabelled (`origin: 'practice'`, `source: 'app-legacy'`, ids `p-legacy-YYYY-N`), with their tags. Load them as a practice pack per passage next to the authored packs. Each carries `afterItemIds`: the official items of the same passage that use the same evidence and question type; serve such an item only after those official items have been attempted, so it cannot pre-teach an official question. Every text now has between 1 and 6 of these; the authored packs top them up to 6 to 8 per text.

Content production: the 18 packs are written from `PRACTICE_BRIEF.md` by a strong model and spot-checked (Eyad or a Dutch speaker checks at least 2 packs fully and 10 random items). The sample pack for buurt-whatsapp is included; do not generate content inside this implementation unit, only the loader, types and tests, then drop packs in as they arrive.

---

### Unit 6: daily text (`/eval`)

Title "Daily text", about 15 minutes. One passage per day:

1. **Pick the passage:** from non-reserved papers, not seen in the last 7 days, oldest last-seen first; ties by `dayIndex(date, n)`. Texts from a practice set join this pool only after that set has been taken in exam mode (Unit 14); from then on, every third day uses one.
2. **Map it** (skipped if she mapped this passage in the last 21 days): `ParagraphMap` over the body paragraphs. About 2 minutes.
3. **Three questions:** chosen in this order of preference: practice items she has never answered, in her weakest qtypes (from `accuracyByQtype`); then official items not attempted in the last 21 days. At most one official item per day. If the passage has an official `doel-tekst` item not attempted in 21 days, it goes last; otherwise a practice whole-text item can go last.
4. **One paraphrase drill** from the passage, respecting `afterItemId`.
5. **Done card:** each question with its type, right or wrong, the trap if missed, and "found the paragraph" yes or no.

Every question uses the loop from section 3: options hidden, locate, options, confirm, feedback. Options are shuffled. Wrong picks call `recordMiss`; implement it in this unit exactly as specified in Unit 7. The daily state is stored so a reload resumes where she left off. Delete the gist step and its `gistOptions`.

Acceptance: selection is deterministic per date and state and obeys the repetition policy (tests with a seeded history); manual run shows map, locate-then-options, feedback with highlight, paraphrase and done card.

---

### Unit 7: trap drills and micro-drills (`/cards`)

- `recordMiss(fork, itemId, picked, today)`: trap = the picked option's trap (official or practice item). Create or update that trap's card: misses +1, streak 0, due today, `tamedAt` null.
- Drill for trap T: an item (practice first, then official) whose distractors include T, from a non-reserved paper, not attempted in the last 14 days, from a different passage than the last miss; relax to 3 days, then any. Show the full text, the trap's label and explanation above the question ("Watch for: Echo"), then the standard loop. Auto-graded: correct means streak +1 and due in 1, 3, then 7 days; three in a row sets `tamedAt`. Wrong means streak 0 and due tomorrow. Remove "Got the move" and "Still shaky".
- Add two micro-drill modes on the same page:
  - **Spot the lure:** 5 wrong options from items she has attempted (preferring traps with open cards); she picks the trap kind from three; feedback shows the option's `why` and highlights the evidence in the text on the left.
  - **Paraphrase:** 5 paraphrase drills from passages she has seen, respecting `afterItemId`.
- `/cards?qtype=<id>`: 3 items of that qtype (practice first) in the standard loop; used by the readiness screen.
- Delete `classifyTrap`, `drillSnippet` and the regex classification.

Acceptance: scheduling and selection tests; manual: a wrong daily answer with an echo lure creates an Echo card, the drill uses a different passage, and a wrong drill answer cannot be marked learned.

---

### Unit 8: full-text practice (`/lezen`)

Make the free-practice route use the same loop: `ReadingPane` on the left, questions on the right, text always visible, official items in exam order with a Flag toggle, Check to confirm, feedback after each item (or all at the end, a toggle "Exam style: feedback at the end"). Fix the missing space between sentences. Remove LP and mission calls. Log attempts. Hide reserved papers with "<year> is saved for your mock". Show "seen N times" per passage and warn when she opens a passage whose official items she answered in the last 21 days: "You answered these recently. Try the practice questions instead." with a button that runs the passage's practice items.

---

### Unit 9: mock (`/mock`)

```ts
export interface MockSession { id: string; paperYear: number; booklet: boolean; startedAt: number; endsAt: number; answers: Record<string, string>; flagged: Record<string, boolean>; textMs: number[]; activeText: number; activeSince: number | null }
export interface MockResult { id: string; paperYear: number; setId?: string; finishedAt: string; expired: boolean; correct: number; total: number; passLine: number; byQtype: Partial<Record<QType, { c: number; t: number }>>; textMs: number[]; answers: Record<string, string>; flagged: Record<string, boolean> }
```

- A mock always uses a reserved, unseen paper when one exists; otherwise the least recently mocked paper with the warning "You have seen this paper. Expect a higher score than on the day."
- Persist the session in state (answers, flags, start time, per-text elapsed time); the clock is `endsAt - Date.now()`, so it survives reloads. At zero, auto hand-in.
- Screen: text left, questions right, text switcher 1 to 6, Flag, an Overview grid (answered, unanswered, flagged, click to jump), Hand in with a warning about unanswered items. No feedback, no shuffling, no text-to-speech, no word help. Hide the Kuromi button during the mock (`setKuromiVisible(false)`); she returns for the debrief (Unit 12).
- **Booklet mode:** `/mock/booklet?paper=YYYY` prints the six texts (A4, serif, page break per text, source line and title). In booklet mode the screen shows only questions, as on the exam day. Recommend it for every full mock, with her Van Dale NT2 dictionary on the desk.
- **Debrief:** score against the paper's pass line and the target; accuracy by qtype; minutes and score per text; flagged-and-right versus flagged-and-wrong; every item with her answer, the key and full `AnswerFeedback`. Misses call `recordMiss`. The paper leaves `reservedPapers`. A history lists all mocks.

---

### Unit 10: readiness home

Top to bottom: days to the exam; last mock against its pass line and target (or "No mock yet"); question types sorted weakest first with accuracy over her last 30 attempts of that type (official and practice shown separately when both have at least 5 attempts) and a "Practice this" link to `/cards?qtype=`; "found the right paragraph" rate over the last 50 located questions; open trap cards; then the daily text, drills, mock and texts cards. A plan line: baseline official mock by 2026-10-12; practice set 2 in exam mode in the week of 2026-10-12; practice set 3 in the week of 2026-10-19; a second official mock (or practice set 1) in the week of 2026-10-26; final official mock 2026-11-02 to 11-05; light review only from 2026-11-09.

---

### Unit 11: reading playbook (replaces the Patterns tab)

Route `/playbook`, tab label "Playbook"; `/grammar` stays reachable as a secondary link. Content, all examples pulled at runtime from annotations and packs:
- One card per question type: the move in two or three sentences, how often it appears in the official papers (computed), one official example with its evidence quote, and "Practice this".
- One card per trap: explanation and two real examples (the lure text and its `why`).
- Purpose questions: usually the last question of a text; the keyed purposes across the three papers (computed); how to decide between informeren, enthousiast maken, uitleggen, adviseren and overtuigen from the source line and the tone.
- Rules texts: read the questions first, then scan for the matching rule; mark the case facts.
- Signal words with a short example from a bank text each: reasons (omdat, want, doordat, daardoor, waardoor, zodat, daarom, dus), contrast (maar, echter, toch, hoewel, terwijl), addition (bovendien, daarnaast, ook), conditions (als, tenzij, mits, alleen als, behalve), limits (niet, geen, nooit, alleen, pas, al).
- Paragraph roles: what each role looks like, with one example paragraph per role from the packs.
- Time plan: about 18 minutes per text; less on short texts; keep 10 minutes for flagged items.

---

### Unit 12: Kuromi, the coach across the loop

Kuromi is the voice of the method. The app enforces text-first; Kuromi is the one who explains, nudges, hints and debriefs, in character, on every screen. To keep her fast, cheap and safe, she works in two layers:

- **Reflex layer (instant, offline, deterministic):** short lines in her voice built from the annotations and the learner's state. About 60 to 80 phrasings in a template file `src/lib/kuromi/lines.ts`, written in her persona voice (Eyad or the persona author writes or approves them; they are copy, not generated). Every feedback moment, trap label, notebook prompt and readiness line has a Kuromi phrasing. This layer never calls the model, so she is present even when the backend is slow or down.
- **Live layer (the model, via the existing chat function):** open-ended moments: a hint when she is stuck, a chat about the text in front of her, the mock debrief narrative, the weekly plan message, and grounded extra questions. Falls back to the reflex layer on any error, in character ("the wifi is Dutch today").

**Her moments, unit by unit.**
- Daily text (Unit 6): she opens the text ("rules text, six paragraphs, read the questions first"), comments on the map step, reacts to every answer with the evidence and the lure, and after a miss asks what in the sentence would have told Domi. On the done card she names the one move to keep in mind tomorrow.
- Drills (Unit 7): she introduces the lure to watch for, reacts to the answer, and calls a card tamed.
- Texts (Unit 8): same reactions; plus "Ask Kuromi" about the text (live).
- Mock (Unit 9): silent during. The debrief is hers: she reads the `MockResult` (score against the pass line, minutes per text, flagged right and wrong, accuracy by type) and tells Domi the three things to fix, then offers the drills that match.
- Readiness (Unit 10): the plan line is written in her voice; a weekly live message on Mondays summarises the week's attempts and picks the week's focus.
- Playbook (Unit 11): the cards read as her handbook.
- Practice sets (Unit 14): she frames each set (unofficial, target 25) and runs its debrief.
- Notebook (Unit 15): she is the one asking "guess first"; when Domi asks for help she gives a context clue before the meaning ("look at what comes after the colon", "the sentence before gives the reason"); when a noted word comes back she says so.

**Stuck help (live, guarded).** A "Hint" button in the locate and options phases. The server packet decides what she can know:
- Locate phase: the question, its qtype, and the paragraph map (roles and summaries) but not the evidence. She can say "it is in a paragraph that states a rule, not in the example" or which signal word to scan for. She cannot name the paragraph.
- Options phase: the question and the qtype move only; no key, no evidence, no distractor labels. She can restate the move and warn about the common lure type for this qtype.
- After the answer: the full annotation. She may quote the evidence and name the lure.
The packet is built client-side by `buildCoachContext(phase, item)` and tested so that key, evidence and distractor labels are absent before the answer. The persona gets a hard line: "Before she has answered, never name a paragraph, an option or the answer. If she asks, refuse in character."

**Chat about the text (live).** From any reading screen, the chat sheet includes the passage text, the paragraph map, the notebook entries for that text, and every item she has already answered with its annotation. Questions about unanswered items get the guarded packet above.

**Grounded extra questions (live, optional, replaces the old drill panel).** "Kuromi, give me two more questions on this text." The server returns items in the practice item shape and must include an `evidence.quote`; the client rejects any item whose quote is not an exact substring of the text and any item without exactly one keyed option. Accepted items run in the standard loop, labelled "Kuromi's question", scored nowhere, and never enter the daily pool. This replaces `DrillPanel` and the topic-based drill prompt, which invented Dutch with no text.

**Tools (whitelist, client-executed):** `add_notebook_entry(kind, quote, note)` (she can save a word or sentence Domi discusses), `suggest_drill(qtype | trap)` (opens `/cards?qtype=` or the trap drill), `save_coach_note(text)` (a line on the readiness screen, "Kuromi's note this week"). Remove `update_config`, `award_lp`, `forgive_streak` and the STEWARDSHIP and "## Her settings" persona sections; they act on retired features. Shelf pages stay for notes only, without the gate-1 rule.

**Context packet (`src/lib/kuromi/context.ts`):** replace the retired fields (`currentGate`, `lockWhen`, `mastery`, `rustyWords`, `lastQuiz`, `activityShape`, `streak.weeks`) with `readingFork`: `examDate`, days left, `showUpStreak`, readiness numbers (Unit 10), open trap cards, last mock, today's daily state, the current screen, and the guarded `currentItem`. Fix `SCREEN_PREFIXES` to the live routes.

**Persona (`persona.mts`) edits, in addition to Unit 2:** replace the de/het inline-quiz example with a "which paragraph holds the answer" example; add the TEACHING lines: "Guess before lookup. Text before options. After a miss: what in the sentence would have told her, then name the lure. Before she answers: hints about where and how, never what." Keep her voice and the mood tags.

**If the backend is not configured**, the reflex layer still runs everywhere and the live buttons (Hint, Ask Kuromi, extra questions, weekly message) are hidden. Eyad checks `SYNC_KEY`, `XAI_API_KEY` and background functions on the site before Ship A so this fallback is not the normal state.

Acceptance: `buildCoachContext` tests prove no key, evidence or distractor label leaks before an answer, and that all three are present after; a reflex line appears on every feedback moment with the backend off; the debrief renders from a `MockResult` with the backend on and off; a generated extra question with a non-matching quote is rejected; the tool list contains only the three tools above plus the page and conversation tools.
---

### Unit 13: more texts (content, starts now)

**Official papers:** add the 2021 and 2022 Lezen I openbare examens from the official practice environment to `LEZEN_CONTENT.ts` (same shape, `passingScore` and `totalQuestions` from the official key, answers checked against the key, added to `LEZEN_EXAMS` and `EXAM_YEARS`), annotate them with `ANNOTATION_BRIEF.md`, write their practice packs, and reserve both papers for mocks. Paper budget: baseline mock on the currently reserved paper, second mock on 2022, final mock on 2021.

**Fresh texts (optional now):** the practice sets (Unit 14) already provide 18 unseen texts. Only if time allows, add more practice texts in `src/lib/reading/fresh/`, same shape as an official passage plus a practice pack, marked `origin: 'fresh'`. Genres mirror the papers: two each of a job or school website text, a rules or conditions text (numbered articles, scenario questions), an interview or portrait, a news article reporting research with opinions, an information folder, and a study-book text. B1 level, 400 to 1,000 words, 5 to 7 exam-style items each (always including one purpose question as the last item), written and annotated per `PRACTICE_BRIEF.md`. They are the transfer check: shown in readiness as "unseen texts" accuracy, used every third daily text, never in mocks.

---

---

### Unit 14: practice sets section (`/sets`)

Source: Eyad's three PDFs "Lezen B1 Oefenexamen Set 1 to 3" (unofficial, transcribed from a video). Converted and rebuilt data is in `data/PRACTICE_SETS.json` and `data/practice-sets-annotations.json`; copy them to `src/lib/reading/sets/`.

What was wrong with the PDFs, and what was done (do not redo this, just load the data):
- The texts are good B1 Dutch in the exam's genres and are kept verbatim, except typo fixes ("personeelssysteem"; a duplicated sentence in set 2 text 3; "eraan", "examen die past" and a stray heading period in set 3).
- The questions trained word matching: 80 of 105 keys copied the text, about half the wrong options were absurd, set 1's key was A for 34 of 35, set 3's key was a strict rotation, and set 2 items 16 and 17 asked about text that is not there. Every item was revised or replaced: keys paraphrase the evidence, lures are real traps from the text, keys are balanced (12, 11, 12 per set, no runs over 3), and each set now has NOT, word-in-context, why-this-part, who-thinks-what and compare items. An independent blind solve agreed with all 105 keys; the one ambiguous item was fixed. `data/CHANGES.md` lists every change.
- Each item keeps `origin` (revised or new) and `replaces` (the PDF's question number) so Eyad can compare with the PDF.
- Set 1 text 6 (Horizon College) is a rewrite of the official 2025 text Vision College. Its items no longer mirror the 2025 items, but the text itself still does. **Lock set 1 text 6 until the 2025 paper has been taken as a mock**, so it cannot spoil that mock.

Data shape: each set is `{ id, title, origin: 'video-set', passages: [{ slug, name, intro, text, questions: [{ id, vraag, question, options, answer, origin, replaces }] }], notes }`. Annotations use the official annotation shape and ids (`set1-1` ... `set3-35`). Register them with the Unit 1 annotation loader and extend its test to cover them.

The section:
- Route `/sets`, nav label "Practice sets". Three cards (Set 1, 2, 3) showing the six text titles, state (not started, in progress, taken on <date> with score) and, for set 1, the lock note on text 6 while it applies.
- **Exam mode first.** Each set is taken once as a full rehearsal with the Unit 9 mock engine: 110 minutes, reload-safe, booklet print, flags, overview, no feedback during, debrief after (score against a target of 25 of 35, labelled "practice set, unofficial"; accuracy by question type; minutes per text; flagged right and wrong; every item with `AnswerFeedback`). Misses call `recordMiss`. Store the result as a `MockResult` with `paperYear: 0` and `setId`, shown in the mock history as "Practice set N".
- **Practice mode after.** Once a set has been taken, its texts open text by text in the standard loop (locate, options, feedback) and join the daily text pool and the drill pools as `origin: 'fresh'`. Before a set has been taken, its texts stay out of daily, drills and texts, so the rehearsal stays unseen.
- Readiness (Unit 10) shows practice-set results separately from official mocks, and "unseen texts" accuracy from first attempts on set items.
- Suggested order (the plan line in Unit 10): set 2, then set 3, then set 1 after the 2025 mock. Set 2 and 3 are closest to the exam's difficulty after the rebuild.

Note for readiness: the rebuilt sets lean on scenario questions (`toepassing`, about a third of the items) and have few plain fact questions, because the plain fact items were the verbatim ones. The official papers remain the reference for the real mix.

Acceptance: all 105 set items load and pass the annotation test; a set taken in exam mode produces a debrief and unlocks its texts for practice; untaken sets never appear in daily or drills; set 1 text 6 stays locked until a 2025 `MockResult` exists.

---

### Unit 15: the notebook (right rail)

**Why it exists.** Domi will meet words she does not know. On exam day her only help is a paper Dutch-to-Dutch dictionary and the sentence around the word. The notebook trains exactly that: guess from the context first, look up second, and remember words by the sentences they lived in, not by a translation list. It also gives her a place to keep what she notices about how texts and tricks work.

**Layout.** A right rail on every reading screen (daily, drills, texts, sets in practice mode, mock debrief). Collapsed: a narrow tab with the count of entries for the current text. Expanded: 30% of the width. Hidden entirely during a mock in exam mode (the real exam has no notebook; her own paper notes are allowed, the app does not need to simulate that).

**Selecting in the text.** Selecting a word or a run of words in `ReadingPane` shows a small popover with three actions:
- **Guess** (the default action, keyboard Enter): a one-line prompt "What do you think it means here?" with two options, "I know it" and "Not sure", plus a free text box she may skip. Only after that does the meaning show. This keeps the text as the first source.
- **Look up**: shows the meaning directly. Costs one lookup from the text's budget (`settings.lookupsPerText`, default 5, shown as "3 lookups left"). At zero, look up still works but the rail says "On the exam every lookup costs about a minute. Try guessing first." The budget is a nudge, never a lock.
- **Add to notebook**: saves an entry (see below) whether or not she looked it up. The word gets a soft underline in the text.
Selecting a whole sentence changes the popover to **Add sentence** with a type: signal word, rule or condition, opinion, hard sentence.

**What a meaning looks like.** Dutch first, English second: a short B1 Dutch definition in the style of the Van Dale NT2 pocket dictionary, then a one-word English gloss behind a "show English" click. Both come from a generated lexicon, not from an API (see lexicon below), so it works offline and is the same every time.

**A notebook entry (word or expression).**
- The word as she selected it, its base form (lemma) and part of speech.
- The sentence it came from, with the word marked, and a link back to the text and paragraph.
- Meaning: Dutch definition, English gloss (revealed or still hidden), and her own note field.
- **Forms and frequency:** every form of the lemma found in the bank ("verzuim, verzuimt, verzuimen, ziekteverzuim") with counts, "in this text: 4 times", "across all texts: 12 times in 5 texts", and the genres it appears in ("mostly rules texts"). This tells her how exam-relevant a word is.
- **Where else:** example sentences from other texts, only from texts she has already opened. Never from reserved or untaken papers and sets, so mocks stay unseen. Each sentence links to its text.
- If the word is a signal word (omdat, echter, tenzij, mits...), the entry shows the playbook's one-line function for it.
- Tags she can add (work, school, health, rules, money) and a star.

**Sentence entries.** The sentence, its type, the text it came from, and her note. Rule sentences get a "case facts" helper: the numbers, ages, times and conditions in the sentence are listed, which mirrors the move for scenario questions.

**Trap entries (automatic offer, never automatic save).** After a wrong answer, `AnswerFeedback` offers "Add to notebook": saves the question, her option, the trap label and the one-line reason, with a link to the evidence. Her notebook then holds her own trap history in her own words, next to the drills.

**Re-encounters.** When a noted word appears in a new text, it is underlined faintly (toggle "show my words"). Hovering shows her own note, not the translation. The entry counts "met 3 times since you noted it". This is how the notebook helps memory without flashcards: the word keeps coming back inside real sentences.

**Notebook page (`/notebook`).** All entries, filterable by type, tag, text and "still hidden English". Sorted by last met. A small optional check, "5 words in new sentences": for five entries, a sentence from a text she has opened but did not note the word in, with the question "What does it mean here?" and three Dutch definitions (the right one plus two from other lemmas of the same part of speech). It tests understanding in context, never recall of a translation. Export to a printable page for the final week, sorted by frequency in the bank.

**State (add to the v24 schema in Unit 4).**

```ts
export type NoteKind = 'word' | 'sentence' | 'trap';
export interface NotebookEntry {
  id: string; kind: NoteKind; createdAt: string;
  passageSlug: string; p: number; quote: string;          // where it came from, resolved by quote like evidence
  lemma?: string; surface?: string;                        // word entries
  sentenceType?: 'signal' | 'rule' | 'opinion' | 'hard';   // sentence entries
  trap?: TrapKind; itemId?: string; picked?: string;       // trap entries
  englishRevealed: boolean; guessed: 'knew' | 'unsure' | null; guessText?: string;
  note: string; tags: string[]; starred: boolean;
  metSince: number; lastMetAt: string | null;
}
export interface NotebookState { entries: NotebookEntry[]; lookups: Record<string, number> /* passageSlug -> used */ }
```

**Lexicon (content, generated once, `src/lib/reading/lexicon.json`).** The whole bank (official papers, practice sets, practice packs) has about 4,100 distinct word forms. Generate, with a strong model and `briefs/LEXICON_BRIEF.md`, one record per form: `{ form, lemma, pos, nl: "short B1 Dutch definition", en: "gloss" }`, with multi-word expressions handled as their own lemma when the bank uses them ("in beweging komen", "op zichzelf", "voorzien in"). Names and numbers get `pos: "name"` and no definition. A test checks every form in the bank has a record. Forms and frequency counts are then computed at build time from the bank plus the lexicon's form-to-lemma map, so no morphology library is needed. Sentences shown in "where else" are found by exact form match within the lemma's form list.

**What not to build.** No SRS scheduling for the notebook, no translation of whole sentences on demand (a sentence "translate" would replace reading with reading English; the paraphrase drill covers meaning at sentence level), no live translation API.

Acceptance: select a word, guess, look up, add; the entry shows lemma, forms with correct counts for that text, and example sentences only from opened texts; the rail is hidden in exam mode; a noted word is underlined in a later text and its counter increases; the notebook check uses definitions, not translations; every bank form has a lexicon record (test).

## 5. Manual check before each ship (1280px)

1. Daily text: map step, then questions with options hidden until she locates, feedback with highlight and trap, paraphrase, done card; reload resumes.
2. Repetition: with a seeded history, no official item comes back within 21 days outside the mock, and a returning passage brings a job she has not done.
3. Drills: a miss creates the right trap card; the drill uses another passage; spot-the-lure and paraphrase modes work.
4. Texts: full passage, sentences spaced, flag works, recent-answer warning appears.
5. Mock (Ship B): reserved paper, reload-safe clock, booklet mode, debrief, paper released.
6. Kuromi: a hint before answering names no paragraph or option; after a miss she quotes the evidence and names the lure; the mock debrief is in her voice; with the backend off, reflex lines still appear everywhere.
7. Practice sets: take one in exam mode, see the debrief, then its texts appear in practice; set 1 text 6 is locked before the 2025 mock.
8. Notebook: guess before meaning, lookup budget counts down, entry shows forms and counts, example sentences never come from an untaken paper or set, rail hidden in exam mode.
9. Nowhere: "22", "not exam prep", de/het drills in the main nav, questions without their text.

## 6. Outside the code

- Download the 2021 and 2022 Lezen I papers and keys from the official practice environment.
- Keys are verified against the official sheets. Anything that looks wrong in an official item is a transcription issue to report, never a key change.
- Have a Dutch speaker skim two practice packs before they go live.
- Domi: use the official online practice environment once for the real interface; do every full mock in booklet mode with her Van Dale NT2 dictionary.
