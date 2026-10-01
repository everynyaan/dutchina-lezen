# Dutchina Lezen handoff

Repo: `everynyaan/dutchina-lezen`. Read `LEZEN_V3_SPEC.md` first and in full; it is the only spec. Work one unit per session, in the order it gives.

**Update of 2026-10-01, if the 15 units are already built:** the questions the app calls official are not the official ones (spec section 2). Apply Unit 1 Part A0 (replace questions, intros, pass lines; add the `vijf-fabels` paragraph labels), reload `data/annotations.json` (it now tags the real items), and load `data/legacy-practice-items.json` as practice items (Unit 5, with the `afterItemIds` rule). Any mock result recorded on the old questions is not a valid mock; clear `mocks` for papers 2023 and 2024 and re-reserve them.

## What is in this folder and where it goes

| File | Goes to | Used by |
| --- | --- | --- |
| `LEZEN_V3_SPEC.md` | read, do not copy into the repo | every unit |
| `data/OFFICIAL_ITEMS.json` | source for the `questions`, `intro` and `passingScore` fields in `src/lib/lezen/LEZEN_CONTENT.ts` | Unit 1 (Part A0) |
| `data/annotations.json` | `src/lib/reading/annotations.json` | Unit 1 |
| `data/legacy-practice-items.json` | `src/lib/reading/practice/legacy.json` | Unit 5 |
| `data/practice-sample-buurt-whatsapp.json` | `src/lib/reading/practice/buurt-whatsapp.json` | Unit 5 (shape reference and first pack) |
| `data/PRACTICE_SETS.json` | `src/lib/reading/sets/PRACTICE_SETS.json` | Unit 14 |
| `data/practice-sets-annotations.json` | `src/lib/reading/sets/annotations.json` | Unit 14 (register with the Unit 1 loader) |
| `data/CHANGES.md` | `docs/PRACTICE_SETS_CHANGES.md` | reference only |
| `briefs/ANNOTATION_BRIEF.md` | `docs/ANNOTATION_BRIEF.md` | Unit 13, any new items |
| `briefs/PRACTICE_BRIEF.md` | `docs/PRACTICE_BRIEF.md` | Unit 5 packs, Unit 13 texts |
| `briefs/LEXICON_BRIEF.md` | `docs/LEXICON_BRIEF.md` | Unit 15 lexicon |

## Start-of-work checklist

1. `npm install`, `cp .env.example .env`, `npm run format` (commit the formatting alone), then confirm `npm run check` and `npm test` are green. Push the checkout to the GitHub repo before anything else if it has no remote.
2. Read spec sections 0 to 3 before touching Unit 1.
3. Content that still has to be produced, in parallel with the code: practice packs for the other 17 official passages (Unit 5, `briefs/PRACTICE_BRIEF.md`), the 2021 and 2022 official papers once Eyad supplies them (Unit 13), the lexicon (Unit 15, `briefs/LEXICON_BRIEF.md`), and the Kuromi reflex lines (Unit 12, written or approved by Eyad).
4. Eyad has confirmed the Kuromi backend (`SYNC_KEY`, `XAI_API_KEY`, background functions) is configured on the site.

## Rules that override anything else

- Never change an official answer key. The keys in `data/OFFICIAL_ITEMS.json` are verified against the CvTE answer sheets. Report doubts instead.
- The questions currently in `LEZEN_CONTENT.ts` are NOT the official ones (see spec section 2). Unit 1 replaces them; until then, do not build on them.
- Text before options, always. No screen may show answer options before the learner has looked in the text (except the mock, which has no locate step).
- Kuromi never receives the key, evidence or trap labels of an item the learner has not answered. This is tested, not assumed.
- No em dashes in any user-facing string or content file.
