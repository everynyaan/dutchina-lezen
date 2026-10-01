# Unit 16: desktop recomposition of the reading fork

**Why.** The 15 units were specified by behaviour, not composition, and the result is screens of stacked sentences in one column with empty sides. The original app already has a binding design system, `docs/V3_DESIGN.md`, that the new screens ignored. This unit applies it to the reading fork on desktop, screen by screen. It is presentation only: no state, routing or logic changes.

**Binding references, in this order:** `docs/V3_DESIGN.md` §1 (principles), §2.1 (daylight palette), §3 (typography), §6 (flavour layer), §7 (motion), §8 "Home (desktop)" (the frame and rails), §10 (verification gate). Where §8 describes retired screens (quiz, read, stories, match, boss), the per-screen briefs below replace them. The Realm (§2.2) does not exist in this fork.

**Verification is by rendering.** For every screen below, commit a 1440×900 screenshot to `docs/screens/<route>.png` before and after (Playwright is in the repo), and attach the after-shots to the report. A screen is not done until its screenshot passes the checklist at the end.

## 1. Frame and grid

- Minimum supported width 1200px; below that show one centred line "Dutchina works best in a wider window" over the content, nothing else changes.
- The §8 desktop frame: dotted warm-gradient backdrop, 3px ink frame with `0 10px 0` ink-tinted shadow, content max-width 1440px centred. Inside: left rail 200px, centre, right rail 280px. The rails exist on every screen; what they hold changes per screen (below). The centre never exceeds 760px for prose and 1100px for grids.
- Left rail: wordmark, primary nav (Home, Daily text, Drills, Mock, Playbook; active = rose pill), secondary nav (Texts, Practice sets, Notebook, Patterns), Kuromi resident at the bottom in the dashed box with "rant here". Rename "Debrief" back to "Drills" in the nav; the debrief is a screen inside Mock, not a section.
- Right rail default content: the notebook rail (Unit 15) on reading screens; on non-reading screens, the readiness capsule (section 2) and one character cameo (melody or piano, static).
- Typography per §3: 17px root, Quicksand headings, Nunito body, reading text 18px/1.6. No heading smaller than 20px; no body text under 14px; muted text uses `--muted-ink`, never `--muted-line`.
- Flavour per §6 on every screen: offset shadows, jitter on stickers and section labels, 2 to 4 doodles, dashed borders only for tips and Kuromi, polka backdrop, grain. Border budget: at most 3 outlined content surfaces per viewport.

## 2. Shared components (build once, reuse)

- **StatBadge**: tinted pill with icon circle, label and value (`streak 4`, `located 72%`, `25 to aim for`). Numbers are ambient (§1.4): never a bar, never a scoreboard.
- **ReadinessCapsule** (right rail): days-to-exam as a plum featured card with the date in Quicksand 28px; under it three StatBadges (streak, found-the-paragraph rate, last mock vs pass line); then "this week" as one sentence in Kuromi's voice with her 32px face. This replaces the home page's long lists.
- **TypeGrid**: the 13 question types as a 3-column grid of small tinted tiles: label, accuracy as a tinted number (or a hairline "no attempts" in muted ink, not a sentence), and the "Practice this" link as an arrow glyph on hover. Sorted weakest first once data exists; before data, in the fixed order of the playbook.
- **TextCard**: title in Quicksand 18px, source line in muted ink, one row of small badges (year, N questions, seen N times or an "unseen" teal badge, locked/reserved as an ink badge with a lock glyph). 2px border, offset shadow, tinted by section identity. Grid of 3 per row on Texts and Practice sets.
- **KuromiBubble**: §6.7 bubble with tail; her face 44px beside it; one bubble per screen is the rule, more only in chat.
- **Empty states**: one bubble from Kuromi plus one action, never a list of "no attempts yet" lines.

## 3. Screens

**Home.** Hero: Kuromi card with her expression and one state-aware bubble (one fact, the next action, nothing else; the current four-sentence block is a spec violation). Below the hero, the "Today" pair as two tinted action cards side by side: Daily text (peach, time estimate, state done/undone) and Drills (lavender, due count). Below that, a 2×2 of secondary cards: Mock (teal, "next paper: 2023, sealed" and the plan's next mock date), Practice sets (rose, next set to sit), Texts, Playbook. Right rail: ReadinessCapsule, then TypeGrid collapsed to the weakest three with "all types" opening the full grid in the centre. The plan paragraph becomes a single quiet line under the Today pair ("Next: baseline mock by 12 Oct") that opens a sheet with the full plan as a dated list with ticks. Sparkle doodle at the hero corner, squiggle under "Today", arrow doodle from Kuromi toward the glowing action (the §8 glow rule applies: exactly one element glows, priority daily text not done, then due drills, then the next mock).

**Daily text, Drills, Texts (reading), Practice sets in practice mode.** The three-column loop from Unit 3 is the hero: text pane left (max 760px, 18px/1.6, paragraph labels in the margin where they exist), question panel centre-right (sticky, max 420px), notebook rail right. The question panel is one outlined card: qtype label as a jittered sticker, the question in 20px, the locate prompt or the options, Check as the one primary button, feedback below in a tinted block with the evidence quote and the trap sticker. Kuromi's reaction is a bubble inside the panel, not a separate card. Nothing else on the screen is outlined. Progress through the session's questions as dots (§8 quiz), not text. Mirrored evidence highlight in the text uses the teal tint; the learner's own notebook highlights use peach.

**Mock, setup screen.** One hero card: paper name and year, three badges (35 questions, 110 minutes, pass line N), one Kuromi bubble ("Sealed. Print the booklet, dictionary on the desk, phone away."), and exactly two actions: "Start" (primary) and "Print the booklet" (secondary). Booklet mode is a toggle inside the card, not a third button. Delete the duplicate sentences now on that card: the paper's own pass line is stated once; the generic "published papers needed 24" line disappears when a paper is selected. Right rail: mock history as small cards (date, paper, score vs line).

**Mock, exam screen.** Chrome collapses: no rails, no nav, no Kuromi. Top bar: clock, text switcher 1 to 6 as chips, answered and flagged counts as badges, Overview and Hand in. Below: text left (or hidden in booklet mode), questions right, each question a hairline card with Flag as an icon toggle. This is the one screen where calm beats flavour: one doodle at most.

**Mock, debrief.** Hero: score card with the number large, the pass line and target as badges, Kuromi's debrief bubble. Then a 2-column body: left, per-text cards (minutes and score as badges, a flagged-right/flagged-wrong pair); right, TypeGrid for this mock. Below, the item review as a list of hairline rows that expand into the full feedback block. "Add to drills" as one action per missed item.

**Texts and Practice sets.** TextCard grid, 3 per row, grouped by year or set with a jittered section label and a squiggle. Reserved papers render as a single locked card per paper ("2023, sealed for your mock on 12 Oct") instead of six greyed texts. The "Seen 0 times" line becomes a badge; "unseen" is the teal badge. A filter chip row at the top: all, unseen, seen, by type.

**Playbook.** The handbook look from §8 "/grammar": chapter-num circles for the sections (question types, traps, purpose questions, rules texts, signal words, time plan), each type and trap as a card with the move in 2 or 3 sentences and one real example in a dashed sticker. Two columns of cards. This screen may run denser, still ≤3 outlined per viewport.

**Notebook page.** Entries as a 2-column card grid with a filter chip row (word, sentence, trap, starred). Entry card: the word in Quicksand 22px, lemma and pos as badges, the source sentence, the forms-and-frequency row as small badges, the note field. The "5 words in new sentences" check is one teal action card at the top.

**Kuromi chat.** Per §8: right-side panel 420 to 480px wide with a 3px ink left border on desktop, message column capped at 640px, her face beside every reply.

**Settings.** A sheet, not a page: exam date, locate step toggle, lookups per text, paper reservations as a list with lock toggles, export and import.

## 4. Copy rules (fix in the same unit)

- One fact once. Any screen that currently states the pass line twice, or both the paper's line and the generic line, keeps only the specific one.
- Kuromi's home bubble is at most two sentences and names the next action. The current "Training is 2024 and 2025. 2023 stays sealed" contradicts the plan (2023 and 2024 are reserved; 2025 is for practice); the bubble reads from `settings.reservedPapers`, never from a hard-coded year.
- Empty states speak once, in her voice, with the action that fills them. No screen shows more than one "nothing yet" line.
- Labels, not sentences, for data: "Seen 0 times. 6 questions" becomes two badges.

## 5. Checklist per screen (the gate)

1. One hero, at most 3 outlined content surfaces in the viewport, at most 2 primary actions above the fold.
2. Rails present (except the exam screen) and carrying what section 1 says.
3. No wall of sentences: every number is a badge, every list of records is a grid of cards, every empty state is one bubble plus one action.
4. Flavour present: offset shadows, jitter, 2 to 4 doodles, dashed only where allowed.
5. Text pairings pass 4.5:1; reading text 18px/1.6; nothing under 14px.
6. Screenshot at 1440×900 committed to `docs/screens/`, before and after.
