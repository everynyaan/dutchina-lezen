# Dutchina — reading fork

B1 Staatsexamen NT2 Programma I **Lezen** trainer for Domi. Context and pattern practice, not vocab memorization.

## What this fork is

- Today is one full training text from 2024 or 2025.
- Debrief is the miss, on the sentence that answers it.
- 2023 is the only sealed paper, sat once, and only as a November prediction. Pass 22 of 36. The booklet on screen has 35 items; 22 still passes.
- Otherwise no paper is sealed. All three are practice. A format rehearsal is not a November prediction if that paper was already studied.
- Patterns is not a tab.

Match, boss, listening, and random SRS are hidden.

## Run

```sh
npm install
cp -n .env.example .env
npm run dev -- --host --port 43123
```

`PUBLIC_SUPABASE_*` can stay empty. The reading fork does not need a backend. If those names are missing from `.env`, Vite’s client bundle fails to hydrate.

Production Kuromi functions need `npm run build` and Netlify; `vite dev` will not serve `/.netlify/functions/*`.

## Exam bank

`src/lib/lezen/LEZEN_CONTENT.ts` — NT2 Programma I openbaar examen PDFs 2023–2025 (35 items/year in-file). Live exam shape is 36 questions / 110 minutes / pass 22. The mock does not invent a 36th item.
