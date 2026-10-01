# Practice pack brief: new jobs on real texts

You are writing practice content for a B1 reading trainer (Staatsexamen NT2 Programma I, Lezen). The learner already has the official exam questions for each text. Your job is to give her **new questions on the same text** so she keeps practising reading in context without answering the same official question again. Quality matters more than quantity: one wrong key or unnatural Dutch sentence teaches her something false.

Input: one passage (name, intro source line, paragraphs as `paragraphsOf(text)`), its official items, and their annotations (`annotations.json`). Output: one JSON file in the shape of `practice-sample-buurt-whatsapp.json`. Study that sample first.

## 1. Read before writing

Read the whole passage twice. Write down, for yourself, what each body paragraph does and what the text is for. Then list which evidence sentences the official items already use; you must not reuse an official item's evidence together with the same answer.

## 2. Paragraph map

One entry per body paragraph (skip headings): `p`, `anchor` (the first ~48 characters of the paragraph, copied exactly), `role`, and a one-line English `summary`.

Roles: `introduces-topic`, `background-origin`, `gives-example`, `problem-risk`, `rules-and-conflict`, `states-rule`, `exception-condition`, `reports-opinion`, `reports-research`, `advice-instruction`, `conclusion`. Pick the paragraph's main job. If two fit, pick the one a reader would need to find an answer in it.

## 3. Practice items (6 to 8)

Coverage:

- Prefer question types the official items of this passage do not cover. Types: `doel-onderdeel`, `bron-publiek`, `hoofdgedachte`, `mening-persoon`, `detail`, `oorzaak-reden`, `toepassing`, `niet-vraag`, `functie-tekstdeel`, `betekenis-in-context`, `conclusie`, `vergelijking`. Do not write a `doel-tekst` item if the passage already has an official one.
- At least two `betekenis-in-context` items on phrases a B1 reader may not know (idioms, fixed expressions, false friends), where the surrounding text makes the meaning clear.
- Rules texts: at least three `toepassing` items with a short scenario (a named person, an age, a time, an amount) that requires matching every condition of one rule.
- Texts with named people: at least one `mening-persoon` item where one lure is another person's view (`verkeerde-persoon`).
- Mirrored pairs are valuable: two items whose answers sit in different paragraphs and use similar words, so each item's key is the other's echo lure (see items 1 and 2 in the sample).

Writing rules:

- Stems and options in natural, standard Netherlands Dutch at B1, in the style of the official items: short, neutral, no trick grammar. Options are parallel in form and similar in length. Exactly one option is defensible from the text.
- Three options, A to C. Spread the keys over A, B and C across the pack.
- `evidence`: 1 to 3 quotes, each copied character for character from one paragraph (same quote marks and apostrophes), 8 to 200 characters, the smallest span that proves the answer.
- Every wrong option gets a `trap` and a one-sentence English `why`: `echo`, `waar-niet-gevraagd`, `te-breed`, `te-smal`, `tegenovergesteld`, `niet-in-tekst`, `verkeerde-persoon`, `verkeerde-voorwaarde`, `overdreven`. At least half the lures in a pack should be something other than `niet-in-tekst`; the exam's hard lures are echoes, wrong conditions, flips and overstatements.
- `move`: one English sentence telling her where to look and which signal to use. `why`: one or two English sentences pointing at the evidence. No em dashes anywhere.
- Never copy an official stem or option. Never make an item whose answer gives away an official item's answer; if unavoidable, add `"afterItemId": "<official id>"` so it is only served after that item.

## 4. Paraphrase drills (2 or 3)

Pick a sentence that carries meaning (a reason, a rule, an opinion). Prompt: "Welke zin zegt hetzelfde als de zin uit de tekst?" One option is a faithful paraphrase with different words; the lures are an echo (same words, different meaning), an overstatement, or a flip. If the source sentence is the evidence of an official item, set `afterItemId`.

## 5. Fresh texts

For a fresh (non-official) text, first write the passage itself: B1, 400 to 1,000 words, in the genre you were given, with a booklet-style source line as `intro` ("Deze tekst komt van..."), a title, headings where the genre has them, and realistic but invented names and organisations. Then write 5 to 7 exam-style items, the last one always "Wat is het doel van deze tekst?", plus the paragraph map and paraphrase drills as above.

## 6. Check before you hand in

Run the pack test (`npx vitest run src/lib/reading/practice.test.ts`) or an equivalent script: anchors and quotes resolve, enums are valid, distractor keys are the option letters minus the key, ids are unique. Then reread every item as the learner: can you point to the sentence that makes the key right and each lure wrong? If not, fix or drop the item. Report any item you were unsure about.
