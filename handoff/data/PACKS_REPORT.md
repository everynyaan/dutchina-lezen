# Practice packs report

17 packs, 69 new items and 49 paraphrase drills (118 in total). Keys across all of them: A 38, B 38, C 42. Every pack passes the validator: enums valid, every quote and anchor is an exact substring found in exactly one paragraph, distractor letters equal the option letters minus the key, ids unique across all packs, no em dashes, no item reuses an official or legacy item's evidence with the same answer. Every lure has a trap label. Only 13 of the 236 lures are `niet-in-tekst`; the rest are mostly echo (77), tegenovergesteld (63), overdreven (35) and verkeerde-voorwaarde (23).

Blind check: separate reviewers solved all 118 items from the text alone, with the keys hidden. All 118 matched the key, all were marked "sure", and none had a second defensible option. Their wording notes were fixed afterwards: 13 items had an option that was longer than the others, copied the text too closely, or was phrased awkwardly, and one stem asked two questions.

| Text | New | New items by qtype | Legacy | Total | Paraphrase |
|---|---|---|---|---|---|
| vijf-fabels | 4 | betekenis-in-context 2, functie-tekstdeel 1, oorzaak-reden 1 | 4 | 8 | 3 |
| ondernemingsraad | 2 | betekenis-in-context 1, oorzaak-reden 1 | 6 | 8 | 3 |
| maakt-geld-ons-gelukkig | 3 | betekenis-in-context 1, functie-tekstdeel 1, oorzaak-reden 1 | 5 | 8 | 3 |
| emma-dolfijnentrainer | 3 | betekenis-in-context 2, mening-persoon 1 | 5 | 8 | 3 |
| word-buddy | 2 | betekenis-in-context 1, mening-persoon 1 | 6 | 8 | 3 |
| examenreglement | 3 | betekenis-in-context 1, toepassing 2 | 6 | 9 | 3 |
| bakkerij | 3 | betekenis-in-context 1, functie-tekstdeel 1, oorzaak-reden 1 | 5 | 8 | 3 |
| beursstand | 4 | betekenis-in-context 1, oorzaak-reden 1, toepassing 1, vergelijking 1 | 4 | 8 | 3 |
| verzuim-op-het-werk | 2 | betekenis-in-context 1, vergelijking 1 | 6 | 8 | 2 |
| autosportklas | 2 | betekenis-in-context 1, mening-persoon 1 | 6 | 8 | 3 |
| arbeidsmarkt | 2 | betekenis-in-context 1, mening-persoon 1 | 6 | 8 | 3 |
| abonnement-wonderrijk | 4 | betekenis-in-context 1, toepassing 3 | 4 | 8 | 3 |
| ruud-rij-instructeur | 8 | betekenis-in-context 3, mening-persoon 2, niet-vraag 1, oorzaak-reden 2 | 0 | 8 | 3 |
| een-potje-huilen | 8 | betekenis-in-context 3, functie-tekstdeel 1, niet-vraag 1, oorzaak-reden 2, vergelijking 1 | 0 | 8 | 3 |
| verkopen-is-een-vak | 8 | betekenis-in-context 2, detail 1, hoofdgedachte 1, niet-vraag 1, oorzaak-reden 2, toepassing 1 | 0 | 8 | 3 |
| overuren | 8 | betekenis-in-context 3, detail 1, niet-vraag 1, toepassing 3 | 0 | 8 | 2 |
| vision-college | 3 | betekenis-in-context 1, toepassing 2 | 6 | 9 | 3 |

## Decisions and things to look at

- Examenreglement and vision-college have 9 items, not 7 or 8. Each already has 6 legacy items, and the brief also asks for a betekenis-in-context item plus two new toepassing scenarios. That makes 3 new items, so 9 in total. I kept all 9 rather than drop a scenario.
- Several items are gated with `afterItemId` because they would hint at an official answer. Examples: p-maakt-geld-ons-gelukkig-2 (after lezen-2023-17), p-verkopen-is-een-vak-8 (after lezen-2025-13), p-overuren-1 (after lezen-2025-19) and p-arbeidsmarkt-2 (after lezen-2024-29). The app should respect the field on items as well as on drills.
- p-verkopen-is-een-vak-8 (Meneer Jansen is in a hurry, so approach him at once) keys the opposite of what official item lezen-2025-13 keys (wait until the customer shows interest). Both follow the text, because each applies to a different kind of customer. It is gated after 2025-13. Read it once to confirm you like the contrast.
- p-overuren-8 (Lisa works half an hour extra every day, so she gets paid) needs a small inference. The text only names the occasional half hour as unpaid, so the learner has to combine that exception with "Overwerk wordt extra beloond". The blind reviewer got it right but called it inferential.
- p-examenreglement Ahmed scenario: the text never defines "verliespunt". The case is built so he fails on the minimum-5 rule whatever a verliespunt is.
- Mirrored pairs are deliberate in een-potje-huilen (items 6 and 7), verkopen-is-een-vak ("terugkomen") and overuren (Tom and Lisa). In each pair, the key of one item is a lure in the other, so do not serve both items of a pair back to back.
- Source text quirks, not changed: vision-college p2 stops mid-sentence and p20 starts with a stray "?". Autosportklas p3 says "bestaat al veel langer" without saying longer than what.
- Some texts have no `mening-persoon` item because they name no one with an opinion: maakt-geld (only Layard, who is the source of every claim), bakkerij, een-potje-huilen and verkopen-is-een-vak.
