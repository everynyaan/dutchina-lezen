# Lexicon brief: definitions for every word form in the bank

Purpose: the reading trainer's notebook shows a meaning for any word the learner selects in a text. Meanings come from this lexicon, not from a live API. The learner is at B1 and her exam allows only a Dutch-to-Dutch pocket dictionary (Van Dale NT2), so the Dutch definition is the primary meaning and the English gloss is secondary.

Input: `bank-forms.json`, an array of `{ form, count, sample: "one sentence from the bank containing the form" }`, one entry per distinct lowercase word form in the bank (about 4,100). Work through all of them in batches; do not skip rare forms.

Output: `lexicon.json`, an array with one record per input form:

```json
{ "form": "verzuimt", "lemma": "verzuimen", "pos": "verb", "nl": "niet komen werken of naar school gaan terwijl je dat wel moet", "en": "to be absent" }
```

Rules:
- `lemma`: the dictionary form (infinitive for verbs, singular for nouns, base form for adjectives). Separable verbs get the full infinitive ("opstaan" for "sta ... op"). Compounds keep the compound as lemma ("ziekteverzuim"), and additionally list the head noun in `head` ("verzuim") so forms of the head can be counted together.
- `pos`: one of noun, verb, adj, adv, prep, conj, pron, det, num, name, other. Names of people, companies, places and products get `name` with no `nl` or `en`. Numbers, times and codes get `num` with no definitions.
- `nl`: a short definition in simple Dutch (B1 or below, 5 to 15 words), in the style of a learner's dictionary: describe, do not use the word itself or a harder synonym. Use the sample sentence to pick the sense used in the bank; if the bank uses two senses, give both separated by " | " and put the bank's most common sense first.
- `en`: one to three words.
- Fixed expressions the bank uses ("in beweging komen", "op zichzelf zijn", "voorzien in een behoefte", "in de knel komen") get their own record with `form` equal to the expression and `pos: "expr"`, and each of their component forms keeps its own record too. Add an expression record whenever the sample sentence's meaning is not the sum of the words.
- Signal words (omdat, want, doordat, daardoor, waardoor, zodat, daarom, dus, maar, echter, toch, hoewel, terwijl, bovendien, daarnaast, ook, als, tenzij, mits, behalve, niet, geen, nooit, alleen, pas, al, ondanks, namelijk) get `signal: true` and an `nl` that says what they do in a sentence ("geeft een reden", "geeft een tegenstelling").
- Netherlands Dutch throughout. No em dashes.

Validate before finishing: exactly one record per input form, valid `pos`, every non-name non-num record has non-empty `nl` and `en`, every `nl` under 16 words, no `nl` containing its own lemma. Report counts per `pos` and the ten forms you were least sure about.
