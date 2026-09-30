# Annotation brief: NT2 B1 Lezen exam items

You are annotating real Staatsexamen NT2 Programma I (B1) Lezen exam items so a training app can teach a learner WHY an answer is right and WHICH trap each wrong option sets. The learner is preparing for the real exam; the app must teach context, pattern recognition and trap recognition, not memorization.

Input: one exam year from `src/lib/lezen/LEZEN_CONTENT.ts`. For each passage, `paragraphs` means `paragraphsOf(passage.text)` from `src/lib/reading/annotations.ts` (split on blank lines, trimmed, empties removed). Paragraph indices are 0-based positions in that array; headings count as their own paragraph.

Read every passage in full before annotating its questions. Work carefully: this is teaching content and a wrong explanation is worse than none.

## Output

Append one object per question, in file order, to `src/lib/reading/annotations.json`:

```json
{
	"id": "lezen-2025-3",
	"qtype": "functie-tekstdeel",
	"evidence": [{ "p": 4, "quote": "exact substring copied from paragraphs[4]" }],
	"move": "One English sentence: the reading move that finds the answer (where to look, what signal to use).",
	"why": "One or two English sentences: why the keyed answer is right, pointing at the evidence.",
	"distractors": {
		"A": {
			"trap": "echo",
			"why": "One English sentence: what makes it tempting and why it is wrong."
		}
	},
	"keyCheck": "ok"
}
```

Rules:

- `evidence`: 1 to 3 entries. Each `quote` MUST be an exact, character-for-character substring of `paragraphs[p]` (same quotes, apostrophes, dashes, spacing). Keep each quote short (8 to 200 characters): the smallest span that proves the answer. For `doel-tekst` or whole-text questions, quote the signals that reveal the purpose (e.g. the intro-like first line, imperative instructions, a closing call to action). Do not quote from `intro` (it is not part of `paragraphs`).
- `distractors`: one entry for every option letter that is NOT the keyed answer. Never include the keyed letter.
- `move`, `why` and distractor `why` are in plain English (the app chrome is English; Dutch only appears as quoted text). You may quote a few Dutch words from the text inside them in single quotes. No em dashes.
- `keyCheck`: "ok", or "suspect: <reason>" if after careful reading you believe the official key is wrong or the item is ambiguous. Do not change the key.

## qtype (pick exactly one)

- `doel-tekst`: purpose of the whole text (informeren, overtuigen, adviseren, instructie geven, werven...). "Wat is het doel van deze tekst?"
- `doel-onderdeel`: purpose of something specific named in the text (e.g. of an organization's project, of a WhatsApp group), answered from the text.
- `bron-publiek`: where the text comes from / who it is for / what kind of organization something is.
- `hoofdgedachte`: main point, best summary, the writer's overall opinion.
- `mening-persoon`: what a named person thinks or says ("volgens X", "Wat vindt X").
- `detail`: a stated fact (what, when, where, how many, how).
- `oorzaak-reden`: why something happens or is done ("Waarom").
- `toepassing`: a scenario is described (a person, numbers, a situation) and you must apply a rule or procedure from the text to it.
- `niet-vraag`: which option is NOT stated / NOT allowed / NOT a cause (a NIET question).
- `functie-tekstdeel`: why the writer uses an example, question list, quote or section ("Wat wil X duidelijk maken met...").
- `betekenis-in-context`: meaning of a word or phrase as used in this text.
- `conclusie`: what follows from or is shown by research/results/an example; surprising outcome.
- `vergelijking`: a difference or similarity between two groups/things.

## trap (pick exactly one per distractor)

- `echo`: copies or closely echoes words from the text, but the text says something else about them or they belong to another part.
- `waar-niet-gevraagd`: true according to the text, but does not answer THIS question.
- `te-breed`: too general; claims more than the text or the question supports (for purpose/main-point items: describes the topic, not the purpose, or covers only the general area).
- `te-smal`: covers one detail or one paragraph, not the whole text or whole point.
- `tegenovergesteld`: reverses what the text says (negation, direction, before/after, more/less).
- `niet-in-tekst`: plausible from general knowledge or common sense, but not stated or supported in the text.
- `verkeerde-persoon`: an opinion or statement that belongs to a different person or group in the text.
- `verkeerde-voorwaarde`: in scenario or rule items, the rule for a different case, threshold, time, age, amount or condition.
- `overdreven`: an absolute or exaggerated version (altijd, nooit, alle, alleen, moet) of a softer statement.

Pick the single most useful label for a learner; if two fit, prefer the more specific one (verkeerde-voorwaarde, verkeerde-persoon, tegenovergesteld over echo).

## Before you finish

1. Run `npx vitest run src/lib/reading/annotations.test.ts`. Fix any failure and re-run until clean.
2. Report counts per qtype, counts per trap, and every `keyCheck` that is not "ok" with its reason, so Eyad can check those against the official answer key.
