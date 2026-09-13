# Dutchina — reading fork

B1 Staatsexamen NT2 Programma I **Lezen** trainer for Domi. Context and pattern practice, not vocab memorization.

## What this fork is

- Daily **5-minute eval** (same text, gist then questions) that **feeds trap cards**
- **Trap stickers** for the move she missed (referent, gist, almost-right, etc.)
- **Kuromi** as cesuur coach: she needs **22 / 36**, not a perfect paper
- Rare **110-minute mock** (6 texts, pass 22)
- ~18 minute time boxes per text
- Show-up streak (finished the eval), not 5/5

Match, boss, listening, and random SRS are hidden.

## Run

```sh
npm install
npm run dev -- --host --port 43123
```

Production Kuromi functions need `npm run build` and Netlify; `vite dev` will not serve `/.netlify/functions/*`.

## Exam bank

`src/lib/lezen/LEZEN_CONTENT.ts` — NT2 Programma I openbaar examen PDFs 2023–2025 (35 items/year in-file). Live exam shape is 36 questions / 110 minutes / pass 22.
