# Gate-level QA audit — 2026-08-29

**Verdict (1a implemented 2026-08-29):** Gate 1 is a curated allowlist (`src/lib/gates/gate1Allowlist.ts`, 162 lemmas), not `rank <= 1`. Generators read `gates.current` (v21 stub, fail-safe 1). G1/G2/G3 homework has zero `lezen:`/`luisteren:`. G1 has no Olly story slot. Leak tests in `currentLeaks.audit.test.ts` are the new contract.

Head at audit: `fb5756b`. Implementation is uncommitted on top of that.

## 1a implemented

| Item | Status |
| --- | --- |
| Curated G1 allowlist (ids, not rank) | **Done** — 162 lemmas. Drop-list / past / abstract / EU out. Pulled `hond`, `vis`, `keuken`, `politie`, `avond`, present stems (`geef`, `maak`, `neem`, `vind`). |
| Hard `sentence_nl` | Overlay on keepers + hide-if-hard-token fallback in `getWordsForGate(1)` |
| G1 stories | `getStoriesForGate(1) = []`. `cs_0` / `cs_1` move to G2 reading. No micro-texts yet. |
| Daily five / week set | G1: match/recall only from allowlist. G2/G3: no exam. G4: exams allowed. Empty conv does not climb. Rusty ⊆ gate pool. |
| Stale week snapshot | Regenerates once when it still has exam types and `examInHomework` is false. |
| Schema | v21 `gates` stub. Iron / empty SRS → `current = 1`. LP tuple preserved. |
| Leak tests | Inverted. Plus snapshot + blind-style sample. |

### Remaining too-hard in G1 (honest)

- Pool is still missing first-year lemmas: *hallo, huis, fiets, ik, alsjeblieft, dankjewel, brood, melk, thee, kat, zus*, and core infinitives *zijn / hebben / gaan / komen / drinken / kunnen / willen / moeten*. Do not invent them by flattening WORD_POOL.
- Several keepers still have dual-POS English glosses (*lopen* lists gun barrels; *school* lists school of fish). Overlay hides the Dutch frame, not the English POS dump on the card.
- Present inflections (*doe / doet / zie / ziet / wilt / kun*) stand in for missing infinitives — fine for week 1, a bit messy as separate cards.
- Colours are only groen / wit / zwart. Numbers missing *een / twee / drie*.

### Remaining G2–G4 rating gaps

- G2–G4 are still **rank bands** (2–3 / 4–5 / 6–7), minus the G1 allowlist and the drop-list. Rank 0–1 leftovers (past tense, abstract *doel/feit*, België cluster) are **unused** until a later retag — they are not dumped into G2.
- `cs_2` *De ridder* is still an A2 novel with *toverdrank / vermoorden* — OK as G2 reading with a load warning, not first-words.
- Easy leftovers still parked late outside the allowlist: days/months, *trein/bus/winkel* (intentionally G2, not pulled).
- G4 still owns the NT2 banks. Do not flatten G4.
- Grammar handbook still unlocked end-to-end. Phase 4 drills not started.
- Home is still Iron / LP / week-set glow — **Phase 1 rooms not shipped**.

---

**Original verdict (pre-1a):** Phase 1 cannot ship on `rank <= 1`. Gate 1 needs a **curated allowlist**, rewritten example sentences, and **no Olly chapters in homework**. Rank is a frequency split. Velocity’s lived experience is correct.

## Method

| Pass | What | Coverage |
| --- | --- | --- |
| A | Structural leak check (exam in G1/2 homework paths) | 100% of generator + quiz pool code |
| B | Gate 1 words | **All 220 rank 0** and **all 220 rank 1** lemmas hand-read |
| C | Gate 1 stories | **All 7 chapters** of `cs_0` and `cs_1`, including all 35 MCQs |
| D | Later gates | Sample only: `cs_2` ch1 (G2), `cs_4` questions (G3), `cs_6` questions (G4); exam banks confirmed B1 |
| E | Grammar / boss / match | Handbook 9 chapters; boss starts rank 2; match uses same `WORD_POOL` + `sentence_nl` |

**Not rated:** remaining 1,324 words (ranks 2–7) one-by-one; full text of `cs_2`–`cs_7` chapters 2–3; every NT2 lezen/luisteren item (those are correctly B1 and belong in Exam Gym / Gate 4).

---

## 1. Per-gate may / must-not

Learner: Domi, complete beginner, intimidated. Destination: B1 Staatsexamen. Internal map G1=0–1, G2=2–3, G3=4–5, G4=6–7+exams is a **starting guess only**. Do not trust `WordEntry.rank`.

### Gate 1 — First words (A1 / first 2–4 weeks)

| Type | May | Must not |
| --- | --- | --- |
| **Vocab** | Concrete here-and-now: family, yes/no, you/your, eat/drink, home objects, colours, 1–12, today/tomorrow, school, car, book. One sense. Present tense. | Archaic genitives; English `the`; abbreviations; nationality essays; abstract *doel/feit/rol*; past-tense cards; EU / Tweede Kamer / Middeleeuwen; anything Domi would not say in week 1. |
| **Typed recall** | English → one Dutch word. Short. | Multi-word idioms; inflected past as the target; “type the participle”. |
| **Match** | Dutch word or a 4–6 word present-tense frame. Options are everyday English. | Showing `sentence_nl` that contains *achthoek, milieu, cardioloog, hoorzitting, vogelaar*. POS jokes (*lijken* = corpses). |
| **Story MCQ** | 40–80 word present-tense micro-text **or** no story slot until those exist. Questions may be English. | Olly Richards chapters (~900–1,200 words). Dutch MCQ that requires the whole chapter. Plot-detail “what time did X wake”. |
| **Grammar** | de/het on the noun in front of her; ik/jij/hij present; V2 with subject first. Handbook cards 1–2 only as reference. | Subclause verb-final; inversion as the point; kofschip; separable *ge-*; *er* four jobs; boss transformations. |
| **Lezen** | None. | Any `LEZEN_EXAMS` passage. |
| **Luisteren** | None. | Any `LUISTEREN_EXAMS` track. |

### Gate 2 — Everyday Dutch (high A1 / low A2)

| Type | May | Must not |
| --- | --- | --- |
| **Vocab** | Shop, train/bus, days, months, cheap/expensive, *hond*, kitchen, please/thanks **if added**, simple past of *zijn/hebben/gaan/komen*. | Formal *dikwijls, qua, ondanks, dankzij*; *fax, hof, bod*; exam-register *opleiding/wet/volk*; B1 newspaper nouns. |
| **Recall / match** | Same as G1 plus a short past or modal (*mag ik…*). | Exam paper as context. Climbing to rank 4+ rusty words. |
| **Story MCQ** | Short A2 chapter **or** Olly *after* a warning that it is a real story, not first words. Prefer summaries + 1 paragraph. | Treating `cs_2` *De ridder* (toverdrank, vermoorden) as “slightly above beginner” without a load warning. NT2. |
| **Grammar** | Inversion; *hebben/zijn*; *geen/niet*; jij-inversion. Boss rank-2 items OK **after** a drill. | Perfect + kofschip as the only item type. *Er*. |
| **Lezen / luisteren** | None in homework. | `generateLezenQuestions` / luisteren quotas. |

### Gate 3 — Real sentences (A2 / low B1)

| Type | May | Must not |
| --- | --- | --- |
| **Vocab** | Work, body, feelings, connectors (*terwijl, voordat*), participles as vocab. | Dumping leftover first-year words here (*keuken* is not G3). Staatsexamen passages as daily five. |
| **Story** | Full Olly chapters. Dutch MCQ OK. | Exam-year lezen substituted for story. |
| **Grammar** | Perfect, separable, modals. Handbook ch. 3–5. | *Er* four functions as the first grammar she sees. |
| **Lezen / luisteren** | Default still **zero** in homework (plan). Optional 0–2 Exam Gym taste only if Velocity asks. | Ungated 7+7 week-set quotas. |

### Gate 4 — B1

| Type | May | Must not |
| --- | --- | --- |
| **Vocab** | Remaining pool, including abstract/society. | Empty of real B1 — G4 must still be the hard room. |
| **Story** | Remaining Olly (`cs_6`, `cs_7`) plus any moved-up chapters. | Only easy leftovers. |
| **Grammar** | *Er*, adjective -e exception, exam-style error ID. Boss ranks 6–7. | Pretending handbook-only is enough for Staatsexamen. |
| **Lezen / luisteren** | Full NT2 2023–2025 banks. Banner: this is B1 paper. | Leaking these into G1/G2 snapshots. |

---

## 2. Findings

### 2a. Structural leaks — FAIL (100% of Iron homework paths)

1. **Week set** (`src/lib/daily/generator.ts`): `DEFAULT_CONFIG` is match 10 + recall 6 + conversation 6 + **lezen 7 + luisteren 7**. Comment on lines 15–17 states lezen/luisteren are NT2 and **not rank-gated**. `generateDailySession(0)` always calls both exam builders.

2. **Daily five** (`src/routes/quiz/+page.svelte`): `buildLezenPool()` walks **all** `LEZEN_EXAMS`. `selectQuestionIds` appends `lezen:` whenever that pool is non-empty. Iron daily is 2 match + 1 recall + 1 story + **1 B1 exam item**.

3. **Story fallback climb**: `buildConversationPoolForSelection` step (c) falls back to **every** story if the rank slice is empty. Empty-pool climbs, it does not stay in-gate.

4. **Rusty words**: `loadRustyWords` reads the full `WORD_POOL`. Above-gate rusty can fill the 3 word slots after lezen is removed.

5. **Stale week snapshot**: `dailyHomework.questions` is kept until ISO-week rollover. Shipping a filter does not rewrite an in-flight week.

6. **Match empty slice**: `pickTargetWord` returns `null` if the exact current rank has no words. After remap this can zero match, which then pressures fallbacks.

7. **Example sentences are the second leak.** Match/recall show `word.sentence_nl`. Rank 0 *acht* is shown as “Een achthoek heeft acht zijden.” Even a keeper lemma is not beginner-safe.

### 2b. How bad is Gate 1?

**Words:** Rank 0–1 is a **frequency list**, not a first-year syllabus.

- Entire pool is missing: *hallo, hoi, dag, goedemorgen, alsjeblieft, dankjewel, ik, hij, zij, wij, huis, zus, brood, melk, thee, appel, kat, fiets, drinken, komen, gaan, hebben, zijn, kunnen, willen, moeten*.
- Easy words stuck late: *hond* r2, *vis* r3, *keuken* r6, *politie* r7.
- Rank 0 food is six items: eten, glas, koffie, lekker, water, wijn.
- Rank 0 includes English `the`, archaic *der/des/ten/ter*, 15+ past-tense cards, *Belg/Belgen/België/Belgisch*, *doel* (Rode Kruis noodhulp), *Europese Unie*, *Tweede Kamer*, *minister/beleid*, *Middeleeuwen*.
- Rank 1 includes `a.`, `d.`, `etc`, *as* (axis), *fax*, *dikwijls*, *qua*, *ondanks*, *psychopaten* frame on *ware*, *gabber* on *soort*.

Opinionated split of the 440: **do not keep more than ~150–180 lemmas in Gate 1**, and almost every keeper needs a new sentence. `rank <= 1` as the Gate 1 pool is a ship fail.

**Stories:** Both assigned G1 stories fail first-words.

| id | Title | Words | Why it fails G1 |
| --- | --- | --- | --- |
| `cs_0` | De Gekke Loempia | 3,750 / 4 ch | A2 graded reader. Vocab: *uitwisselingsstudent, elektrotechnisch, gebruikelijk tarief, opgelaten, ironisch*. MCQs in Dutch. `cq_0_3_11` asks when **Arnoud** woke; the chapter is Daniel, clock says 10:00, keyed answer is 9:00. |
| `cs_1` | Een heel bijzondere excursie | 3,416 / 3 ch | Creature story. Vocab: *wezen, struikgewas, zich inbeelden, ontvangst, verdwaald*. Same ~1,100 words/chapter as later ranks. |

All eight Olly stories are ~3,300–3,750 words. Rank is story order, not difficulty. **None is A1 first-words. None is B1 exam paper.** G1 homework must not use them as-is.

**Grammar:** Handbook (9 chapters) is unlocked end-to-end. Boss grammar starts at rank 2 (present-tense transforms) — conceptually G1/G2, but G1 has **zero drills**. Phase 4 drills are not optional if G1 is honest.

**Exam banks:** 105 lezen / ~111 luisteren / schrijven 2023–2025. Correctly B1. Keep in Exam Gym / Gate 4. Do not retag into G1–G3 homework.

### 2c. G2–G4 sample (easy stuck late / hard too early)

- **Hard too early:** G1 words and stories above. G2 `cs_2` *De ridder* opens on *toverdrank, krachtdrank, vermoorden, achterdochtig* — fine as “real story”, not as “slightly above beginner first-words”.
- **Easy too late:** *hond* r2, *vis* r3, *keuken* r6, *politie* r7. G4 still has real B1 via exam banks — do not flatten G4 to leftovers.

---

## 3. Recommended retags

| Asset | Action | Not |
| --- | --- | --- |
| NT2 lezen/luisteren/schrijven | **Exam Gym / Gate 4 only** | Do not “beginner-ify” exam paper |
| `cs_0`, `cs_1` | **Move to Gate 2 or 3** (reading). G1 story slot = new micro-texts or empty until Phase 4 | Do not rewrite Olly in Phase 1 (plan still holds) |
| `cs_2`–`cs_5` | Stay G2/G3 as graded readers, with a load warning | Do not treat them as first-words |
| `cs_6`, `cs_7` | Stay G4 stories | Do not empty G4 |
| Rank 0–1 junk (`the`, `der`, `des`, `a.`, `as`=axis) | **Drop from all homework** | Do not “teach” corpus garbage |
| Past-tense / participle cards | **Gate 2+** | Do not keep as G1 targets |
| Abstract / formal rank 0–1 | **Move to G3/G4** (see `gate1-word-verdicts.json`) | |
| Everyday stuck late (*hond, keuken*) | **Pull into G1/G2 allowlist** | |
| Keeper lemmas with hard `sentence_nl` | **Rewrite or hide the sentence** in G1 match/recall | Filtering rank is not enough |
| Gate 1 word pool | **Curated allowlist** (~150–180), not `getWordsUpToRank(1)` | |

---

## 4. Ship-gate QA protocol (blocks Netlify)

Re-run after every retag. Fail the phase if any G1 item is intermediate/B1.

### Automated (CI — must be green)

1. No `lezen:` / `luisteren:` in generated G1 or G2 daily-five or week-set.
2. Empty story pool → top-up with G1 match/recall. Never `STORIES` or `LEZEN_EXAMS`.
3. Rusty / candidate words ⊆ current gate allowlist (or `getWordsUpToGate` **after** allowlist exists).
4. Snapshot: fixed seed + Gate 1 profile → 5 ids, all `match:` / `recall:` / `conv:` from the allowlist. Commit the snapshot.
5. Stale week snapshot containing exam ids while `examInHomework` is false → regenerate once (tested).
6. `WORD_POOL` G1 allowlist does not contain the drop-list in `gate1-word-verdicts.json`.

`src/lib/qa/currentLeaks.audit.test.ts` **documents today’s fails**. Phase 1 inverts those assertions; do not delete the file without replacing it.

### Human / Claude + Grok

1. **Every story in the gate:** chapter word count, vocab list, each MCQ. Fail if a G1 chapter is >120 words or the question needs a 900-word read.
2. **Gate 1 word exceptions list:** keep / rewrite-sentence / move / drop. This audit’s JSON is the first draft.
3. **Gate 4 still B1:** at least 5 lezen + 5 luisteren in a G4 pull. Fail if G4 is only leftover A1.
4. **Blind pull:** 15 items per gate, independent rater (Velocity or a second model). Fail Phase 1 if **any** G1 item is intermediate/B1.

### Sitting

Velocity + Domi on a preview. If Domi hits one hard question in Gate 1, fail ship.

---

## 5. What this means for the plan

Content retag is **Phase 1a**, a prerequisite of “honest rooms”. Shipping four gate cards on `rank <= 1` is a new lie.

Phase 1 code (helpers, exam out of homework, empty-pool does not climb) still ships **together** with 1a, not instead of it.
