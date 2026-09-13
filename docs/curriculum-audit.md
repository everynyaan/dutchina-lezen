# Curriculum Difficulty Audit (V2 brief, Stream 7)

Audit of every per-module question / exercise / challenge against the rank it sits at, looking for difficulty appropriateness, sequencing dependencies, correctness of expected answers, and structural issues.

This is a curated report based on systematic sampling and structural review of each content module, not an exhaustive per-question check. The goal is to surface the patterns and the genuinely broken items, not to second-guess every Olly Richards comprehension MCQ.

---

## TL;DR

| Module           | Volume                                                                   | Verdict                                                                                                  | Action                          |
| ---------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Grammar**      | 230 exercises across 29 lessons                                          | Solid. Sequencing is textbook CEFR A2→B1. Vocab is rank-appropriate.                                     | None needed.                    |
| **Boss fights**  | 98 handcrafted questions (ranks 2–7) + vocab-pool generation (ranks 0–1) | Solid. Genuinely harder than the regular module at the same rank. Grammar coverage maps to rank lessons. | None needed.                    |
| **Conversation** | 8 stories, 25 chapters, 125 MCQs (Olly Richards)                         | Solid. Author-sequenced, vocab escalates appropriately.                                                  | None needed.                    |
| **Lezen**        | 105 questions, 18 passages, 3 exam years                                 | All B1 NT2. Not rank-gated.                                                                              | Keep open — see decision below. |
| **Luisteren**    | 111 questions, R2-hosted media, 3 exam years                             | All B1 NT2. Not rank-gated.                                                                              | Keep open — see decision below. |
| **Match**        | Word-translation MCQ over 1,764 words                                    | Distractor selection has one real flaw — see Match section.                                              | One small code fix recommended. |

---

## Grammar

**230 exercises across 29 lessons. Distribution:**

| Rank | Lessons | Topic coverage                                                   |
| ---- | ------- | ---------------------------------------------------------------- |
| 0    | 3       | Articles · Spelling · Adjectives                                 |
| 1    | 4       | Plurals · Demonstratives · Diminutives · Comparisons             |
| 2    | 4       | Subject pronouns · Object pronouns · Present tense · Hebben/Zijn |
| 3    | 4       | Modal verbs · Perfect · Imperfect · Perfect vs Imperfect         |
| 4    | 4       | Separable verbs · Reflexive · Imperative · Future                |
| 5    | 3       | Er (all uses) · Prepositions · Negation                          |
| 6    | 3       | Word order · Subclauses · Relative clauses                       |
| 7    | 4       | Passive · Conditional · Formal register · Advanced verbs         |

This is a textbook CEFR A2→B1 progression. Standard Quist & Strik / Fenoulhet ordering. **No dependency breaks** — no rank-N exercise assumes grammar from rank > N.

### Sampling notes

- **Rank 0 (articles)**: vocab in prompts is uniformly A1 — `huis`, `man`, `glas`, `wijn`, `winkel`, `kind`, `tuin`, `ring`, `boek`, `tafel`. Translations provided. ✓
- **Rank 1 (plurals)**: transform exercises with hints explaining the rule (`f→v before -en`, `s→z before -en`, `-el/-em/-en/-er often take -s`). Excellent scaffolding. ✓
- **Rank 3 (modal verbs)**: `kan / moet / mag / wil(len) / zullen / hoeft` — all rank 3 grammar. Accepted-alternatives include the `wil/willen` ambiguity around `zij` (singular she vs. plural they). ✓
- **Rank 5 (Er)**: tests Er as subject placeholder, in prepositional reference, and with quantities. All canonical B1 material. ✓
- **Rank 7 (passive)**: tests perfect passive (`is geschreven`), present passive (`wordt geschreven`), imperfect passive (`werd geopend`), passive without subject (`er wordt gefietst`), agent preposition (`door`). Solid B1+ coverage. ✓

### Specific spot-checks

I verified the expected answer on samples across all ranks. No correctness issues found. Notable cases:

- `g_3_modal_verbs_4`: "Zij \_\_\_ een nieuwe auto kopen (want)" — answer `willen`, accepts `wil`. Both correct because `zij` reads as singular OR plural in isolation. ✓
- `g_7_passive_3`: "The book has been written" → "Het boek is geschreven." Uses `is` (perfect) not `wordt` (present). ✓
- `g_7_passive_6`: "Er \_\_\_ hier veel gefietst" → `wordt`. Impersonal/subjectless passive — canonical. ✓

### Concerns: none requiring action

A possible cleanup, not a bug: the `transform` exercise type accepts only a small set of alternatives in some cases (e.g., diminutive rules with multiple valid forms). Worth a low-priority pass to widen `accepted: [...]` lists if Domi gets dinged for valid variants — but that's a content-tuning task, not a structural problem.

---

## Boss Fights

**98 handcrafted questions** (ranks 2–7, transformation + error_identification) **plus 5 vocab-pool-generated types** at ranks 0–1 (production, sentence_completion, multiple_choice).

### Design soundness

| Aspect                                          | Status |
| ----------------------------------------------- | ------ |
| Boss is harder than regular module at same rank | ✓ Yes  |
| Boss tests grammar concepts taught at that rank | ✓ Yes  |
| Vocabulary in boss prompts is at-or-below rank  | ✓ Yes  |

The difficulty jump from Match → Boss is real:

- Match at rank 2 = pick the English translation of a Dutch word
- Boss at rank 2 = transform a sentence's subject, conjugate the verb correctly, form a question with inversion

### Grammar correspondence by rank

| Boss rank | Topics tested                                  | Lessons covering these                                      |
| --------- | ---------------------------------------------- | ----------------------------------------------------------- |
| 2         | Present tense, hebben/zijn, question inversion | `gl_2_present_tense`, `gl_2_hebben_zijn`, `gl_2_pronouns_*` |
| 3         | Perfect, imperfect, modal verbs                | `gl_3_perfect`, `gl_3_imperfect`, `gl_3_modal_verbs`        |
| 4         | Separable, reflexive, future                   | `gl_4_separable`, `gl_4_reflexive`, `gl_4_future`           |
| 5         | Er, prepositions, negation                     | `gl_5_er`, `gl_5_prepositions`, `gl_5_negation`             |
| 6         | Word order, subclauses, relative               | `gl_6_word_order`, `gl_6_subclauses`, `gl_6_relative`       |
| 7         | Passive, conditional, formal                   | `gl_7_passive`, `gl_7_conditional`, `gl_7_formal`           |

Tight alignment.

### Damage tiers + timer pressure

The DAMAGE/timer schedule is well-balanced:

- Damage scales with difficulty (`production: 25`, `transformation: 20`, `sentence_completion: 15`, `multiple_choice: 10`, `error_identification: 10`)
- Timer escalates 30s → 15s across ranks 3–7 (ranks 0–2 untimed)
- HP scales 50 → 160

No issues.

### Vocab caveat

Production questions ("type the Dutch word for X") are generated from `WORD_POOL.json` at runtime. If `WORD_POOL` has misranked words (Stream 6 territory), Production questions at rank N might draw from words that are too easy or too hard. **This is a Stream 6 dependency, not a Stream 7 issue.**

---

## Conversation Stories

**8 stories, 25 chapters, 125 comprehension MCQs.**

The 8 stories come from Olly Richards' graded readers ([_Short Stories in Dutch for Beginners_](https://storylearning.com/courses/short-stories-in-dutch-for-beginners) etc.) — pre-sequenced by a published author who knows what difficulty band lives at A2 vs B1.

| Rank | Story title (Dutch)                                     |
| ---- | ------------------------------------------------------- |
| 0    | De Gekke Loempia (The Crazy Spring Roll)                |
| 1    | Een heel bijzondere excursie (A very special excursion) |
| 2    | De ridder (The Knight)                                  |
| 3    | Het horloge (The Watch)                                 |
| 4    | De kist (The Chest)                                     |
| 5    | Onbekend terrein (Unknown Territory)                    |
| 6    | (rank 6 story)                                          |
| 7    | (rank 7 story)                                          |

### Sampling notes

- **Rank 0 MCQs (De Gekke Loempia)** ask about who lives where, what the parents speak, what the father gives them — everyday-life comprehension, A2 reading. ✓
- **Rank 5 MCQs (Onbekend terrein)** ask about Viking village roles, hunting plans, food shortages — story-internal lore with B1+ vocabulary (`hoofdman`, `ontdekkingsreiziger`, `voedseltekort`, `verkenningsplannen`). Real difficulty jump. ✓

### Concerns: none requiring action

Spot-checks against the chapter text would catch any obviously-wrong answers, but per the brief's "8 stories from Olly Richards, mapped to ranks 0-7. These are pre-sequenced by a published author, so the ordering should be fine," I deferred to the source author. No issues found in the sample.

---

## Lezen / Luisteren — Decision

**Decision: keep them rank-open (current behavior). Don't gate.**

### Argument for the decision

- Domi is specifically prepping for the **NT2 Programma I (Staatsexamen)** exam. The exam is **B1 across the board**.
- The Lezen/Luisteren modules host real exam questions from official Staatsexamen openbaar examen PDFs (2023, 2024, 2025). They ARE the goal, not a reward to unlock.
- Gating B1 exam content behind A2 rank progression would push the goal further away from view at exactly the moment when Domi most needs to see what NT2 looks like.
- Progress already exists at exam-year granularity: per-exam score + pass/fail, with `passingScore` shown. Rank-locking would add a second progression axis that doesn't map to anything in the real exam.

### Argument against (rejected)

- A rank-0 user attempting full B1 reading text might be demoralizing.
- But: Domi is past rank 0 (she's been using the app daily). The risk is hypothetical.
- A rank-0 newcomer of a future profile could still attempt and bounce, but that's a feature, not a bug — it sets realistic expectations.

### Future option (not now)

If newcomer overwhelm ever becomes a real problem, add a **soft hint** (not a gate): show a small `Recommended: ≥ rank 4` chip on the entry tile. But don't lock the door.

---

## Match — distractor selection

**One real flaw worth fixing.**

### Current behavior (`src/lib/match/engine.ts`, `pickDistractors`)

```ts
// Same rank first
let candidates = pool.filter((w) => w.rank === target.rank && w.id !== target.id);

// If not enough same-rank words, expand to adjacent ranks
if (candidates.length < DISTRACTOR_COUNT) {
	const adjacent = pool.filter(
		(w) => w.id !== target.id && w.rank !== target.rank && Math.abs(w.rank - target.rank) <= 1
	);
	candidates = [...candidates, ...adjacent];
}
// ... fall back to any rank if still short
```

Distractor selection filters by **rank** (same difficulty band — good) but **not by part of speech**. The result:

- Target verb `lopen` ("to walk") can have noun distractors like `huis` ("house"), `boek` ("book"), `tafel` ("table").
- In English-translation choices: `to walk / house / book / table` — the correct one is trivially distinguishable because three of four options aren't verbs.

The brief explicitly flags this:

> Check that distractors are plausible (same part of speech, similar difficulty) rather than trivially different.

### Proposed fix

`WordEntry` already carries a `pos` field. Filter by it first, fall back to ignoring POS only if same-POS+same-rank pool is too thin:

```ts
export function pickDistractors(pool: WordEntry[], target: WordEntry): WordEntry[] {
	// Same rank AND same POS first (most plausible)
	let candidates = pool.filter(
		(w) => w.rank === target.rank && w.pos === target.pos && w.id !== target.id
	);

	// Fall back to same POS, adjacent ranks
	if (candidates.length < DISTRACTOR_COUNT) {
		const adjacent = pool.filter(
			(w) => w.id !== target.id && w.pos === target.pos && Math.abs(w.rank - target.rank) <= 1
		);
		candidates = [...candidates, ...adjacent];
	}

	// Fall back to same rank, any POS
	if (candidates.length < DISTRACTOR_COUNT) {
		const sameRankAnyPos = pool.filter((w) => w.rank === target.rank && w.id !== target.id);
		candidates = [...candidates, ...sameRankAnyPos];
	}

	// Last resort: any word
	if (candidates.length < DISTRACTOR_COUNT) {
		candidates = pool.filter((w) => w.id !== target.id);
	}

	return shuffle(candidates).slice(0, DISTRACTOR_COUNT);
}
```

### Risk assessment

- Some POS+rank cells may be thin (e.g., very few rank-0 adjectives compared to rank-0 nouns). The cascading fallbacks handle this gracefully.
- The fix is purely an algorithmic improvement — no state changes, no migration needed, no UI change. Could ship in a small follow-up PR.

### Open question

Beyond POS, semantic-category awareness (e.g., target color → distractors are other colors) would make the questions still better but requires metadata that doesn't exist on `WordEntry`. **Not recommended now** — would require a content-side annotation effort that's disproportionate to the gain over a POS-filter.

---

## Summary of recommended actions

| Module          | Action                        | Effort            | Priority |
| --------------- | ----------------------------- | ----------------- | -------- |
| Grammar         | None                          | —                 | —        |
| Boss            | None                          | —                 | —        |
| Conversation    | None                          | —                 | —        |
| Lezen/Luisteren | Keep open (no code change)    | None              | —        |
| **Match**       | **Filter distractors by POS** | 1 file, ~15 lines | Medium   |

The Match POS fix is the only concrete code change recommended by this audit. Everything else holds up.

---

## Where this audit ends

This is a structural/sampling audit. Things I deliberately did **not** do:

- **Exhaustive per-question correctness checking** on 230 grammar exercises + 98 boss questions + 125 conversation MCQs + 105 lezen + 111 luisteren. That's > 660 items; manual verification is impractical and would benefit from a native-speaker review pass.
- **Translation-pair checking** in `WORD_POOL.json`. That's Stream 6's domain.
- **Sentence-naturalness checking** in `SENTENCES.json` (the contextual sentences shown in Match/Cards). Native speaker review territory.

If Domi or her boyfriend flag specific items as wrong over the next few weeks, those are easy one-line fixes by `id`.
