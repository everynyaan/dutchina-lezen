# Dutchina — reading fork

B1 Staatsexamen NT2 Programma I **Lezen** trainer for Domi. Context and pattern practice, not vocab memorization.

## What this fork is

- Daily **5-minute eval** — one passage, gist then 1–2 questions, then stop. It **feeds trap cards**. It is not exam prep.
- **Trap stickers** — a miss stamps a type (`verwijzing`, `hoofdonderwerp`, `bijna-goed`, `conclusie`, `bron-doel`). Review is a **drill of that move on a new real exam snippet**, never the same sentence, never EN↔NL.
- **Kuromi** as cesuur coach: she needs **22 / 36**, skip, flag, don’t hunt one word.
- Rare **110-minute mock** (6 texts, pass 22) — dress rehearsal, not weekly.
- **~18 minute** time boxes per extra text (resets per text on the mock).
- **Show-up streak** — finished the eval, not 5/5.

Match, boss, listening, and random SRS are hidden.

## Run

```sh
npm install
npm run dev -- --host --port 43123
```

Production Kuromi functions need `npm run build` and Netlify; `vite dev` will not serve `/.netlify/functions/*`.

## Exam bank

`src/lib/lezen/LEZEN_CONTENT.ts` — NT2 Programma I openbaar examen PDFs 2023–2025 (35 items/year in-file). Live exam shape is 36 questions / 110 minutes / pass 22. The mock does not invent a 36th item.
