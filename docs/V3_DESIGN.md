# Dutchina V3 — Design Direction (docs/V3_DESIGN.md)

This document is canon for all visual and compositional work from Phase 4.5 onward. Where it conflicts with V3_BRIEF's Design System section, THIS FILE WINS. V3_STATE deviations still win over both. The recomposition phase executes these designs; lanes do not reinterpret them.

**This file is LIVING canon.** It is edited in-repo as rulings are made; external copies are superseded. Every edit is recorded as a numbered canon amendment (CA-n) in V3_STATE. Lanes still do not reinterpret it — only the architect amends it, and only on Eyad's ruling.

The verdict that produced this doc: the Phase 1 retheme shipped V2's UX in new colors — structurally identical, visually overwhelming, designed by nobody. This doc is the design. Barebones execution of it is a spec violation: the Flavor Layer (§6) is as mandatory as the palette.

---

## 1. Principles (the laws)

1. **One hero per screen.** Exactly one element gets the full treatment (3px ink border + offset shadow + white surface). Everything else is subordinate.
2. **Border budget: ≤3 outlined elements per viewport.** 2px borders for secondary cards, hairlines (#e8d3d8-class tints) or none for the rest. The budget counts outlined CONTENT surfaces per viewport. Persistent chrome (frame, nav, rails) and required sub-elements inside a composed hero (its bubbles, its chips) are excluded.
3. **≤2 primary actions above the fold.** Everything else recedes.
4. **Numbers are ambient.** No progress bar unless the screen is ABOUT that progress. Stats render as small tinted badges, never scoreboards.
   **CA-17 (Phase 6): total LP is displayed, in the Doelen sheet and nowhere else.** The sheet is already the app's one deliberate "look at your numbers" surface, so a lifetime total there is not a scoreboard — it is the sheet doing its job. Home and every other screen stay exactly as they are; this amendment scopes §1.4, it does not weaken it. Total LP must never reach a hero, a nav badge, or an ambient badge row.
5. **Calm ≠ colorless.** Fewer elements, but every survivor is a treat: tinted gradient fill, sticker, doodle, or badge. Flat grey minimalism is as wrong as clutter.
6. **Section identity.** Every module owns a color + signature asset (§4), used consistently wherever it appears.
7. **Kuromi is the messenger.** System state (streaks, nudges, mission talk) speaks through her, never through widget grids.
8. **No generic illustration — ever.** All character/decorative art comes from `static/characters/` (kuromi, melody, piano, doodles) . If no asset fits a spot, the spot stays EMPTY. Stock/AI vector illustration is banned. Font Awesome = utility glyphs only.
9. **Nothing is perfectly straight.** Stickers, badges, and section labels carry rotation jitter (§6). Grid-perfect layouts read as templates.
10. **Animated on events only.** Resting/ambient placements use static variants (`.png` twins in the manifest). `prefers-reduced-motion` swaps all to static.

## 2. Color

### 2.1 Daylight (app-wide light mode) — the dusty family
```
--cream:      #FFEDDD   /* page background */
--peach:      #FEC1B6   /* Daily Read identity; warm surfaces */
--rose:       #F3A6BA   /* primary pink; Match identity; active nav */
--rose-deep:  #D1678F   /* emphasis, CTAs, wrong-answer, doodle default tint */
--lavender:   #939FBC   /* Stories/Cards identity; secondary surfaces */
--teal:       #7ABCC4   /* success, correct, Quiz identity */
--ink:        #3D3550   /* borders, headings, dark featured card */
--text:       #3A3040   /* body */
--muted-line: #9c8d93   /* hairlines + decorative ONLY — never text (2.79:1) */
--muted-ink:  #766771   /* ALL secondary text (4.66:1 on cream, AA) */
```
Rules: hues come ONLY from this family and its tints (color-mix/alpha tints are fine; new hues are not). Candy mint and butter are dead. Surfaces are tinted gradients (`linear-gradient(160deg, tint 55%, tint 26%)` **MINIMUM**), not flat fills. **Section-identity cards must read unmistakably tinted at arm's length; a near-white identity card is a spec violation.** Text on tinted surfaces uses the darkened cousin of the surface hue (e.g. teal surface → #23555c headings) — derive per pairing, verify ≥4.5:1. Raising tint strength raises the contrast bar too: re-verify every text pairing against the new, darker surface.

### 2.2 The Realm (Boss only) — charcoal + orchid
```
--realm-bg:      #363232    --realm-panel: #565656   --realm-line: #6B6B6B
--orchid:        #EEA1E3    --orchid-soft: #F4B5EB
```
Two-family rule: neutrals + orchid, NOTHING else enters the realm. Panels are glassy (translucent #565656, soft 1px #6B6B6B borders, subtle orchid inner glow). Answer feedback is realm-native: correct = orchid glow + check icon; wrong = grey-out + shake + cross icon — meaning always carried by iconography, color is flavor. The realm exists ONLY inside the boss flow. In daylight, the Boss tile/card is its ambassador: #363232 fill, orchid text, faint orchid inner glow. The enter/exit transition (§7) is the threshold.

Ink (#3D3550) and realm-bg (#363232) are deliberate cousins; the dark *featured* card in daylight rails uses INK (plum), only Boss surfaces use charcoal.

## 3. Typography
- Quicksand 700 display (headings, labels, numbers, card titles), Nunito 400/600/700/800 body. Self-hosted (already in repo).
- Root 17px. Hard floor **14px** for any rendered text — this doc closes V3_STATE's 13px finding: fix `Pill size="sm"` and `SpeakerButton`'s micro label as part of Phase 4.5.
- Reading surfaces (stories, reads, lezen): 18–19px, line-height ≥1.6.
- Headings: ink, letter-spacing -0.02em. UI microcopy is lowercase-friendly ("practice", "good morning") — headers may be lowercase for warmth; body text uses normal casing. (Pre-CA-16 this line cited Dutch examples; the lowercase warmth survives the switch to English, the Dutch does not.)

**Language rule — CA-16 (Phase 6). THE APP IS IN ENGLISH. This supersedes CA-13's function split entirely, and any blanket "Dutch-forward" instruction before it.**

CA-13 asked every implementer to judge whether a given string was "ambient flavor" or "comprehension-critical". That judgment was made differently by every lane, and the boundary was never checkable. The rule is now trivially checkable instead:

- **EVERYTHING in the menu and the app chrome is ENGLISH.** Navigation and section labels (`lezen` → **Reading**, `luisteren` → **Listening**, `schrijven` → **Writing**, `kaarten` → **Cards**, `oefenen` → **Practice**, `doelen` → **Goals**, `missies` → **Missions**, `prestaties` → **Achievements**, `weekset` → **Week set**), greetings, mission strings **and their requirement descriptions**, empty states, buttons, toasts, modals, settings, errors, system explanations — all of it.
- **Dutch exists ONLY as learning content**: the word pool, sentences, stories and their chapters, lezen/luisteren exam passages and their questions, schrijven prompts, grammar examples, Daily Read texts. Dutch is the thing being taught, never the thing doing the teaching.
- **The audit rule: any Dutch string outside a content module is a violation.** It needs no interpretation. Content modules are `src/lib/{lezen,luisteren,read,grammar,conversation,reviews,data}/` and `WORD_POOL.json` / `SENTENCES.json`.
- **Kuromi speaks English with Dutch examples**, unchanged. Her voice is not UI chrome and this rule does not touch it.

**§8's per-screen briefs below still describe composition faithfully, but their Dutch microcopy examples are superseded by this rule** — read `"oefenen"` there as the Practice section, `"weekset 0/36 · missies ›"` as the same quiet line in English, and so on. The layout is canon; the language of the label is not.

## 4. Section identity map
| Section | Color | Signature asset | Appears |
|---|---|---|---|
| Daily Quiz | teal | check-mark doodle | home action chip, /quiz header |
| Daily Read | peach | kuromi/coffee | home action chip, /read header |
| Stories | lavender | speech-bubble doodle | nav, /stories shelf |
| Grammar | cream+rose-deep accents | formula beads | nav, /grammar |
| Vocab/Cards | lavender (light end) | kuromi/question | nav, shelves |
| Match | rose | kuromi/mischief | home card, /match |
| Schrijven/Reviews | peach | kuromi/sit | home card, /reviews |
| Boss | charcoal+orchid | kuromi/pixel | dark card everywhere, realm |
| Kuromi surfaces | white + 3px ink border | her expressions | hero, chat, hub, shelf |
| Weekset/missions | ink (plum featured card) | — | right rail / doelen sheet |

**CA-18 (Phase 6): the Shelf lives in the app's own navigation, not inside `/kuromi`.** Supersedes the original brief's "`/kuromi` becomes the hub — chat plus a Shelf tab". A tab inside the hub is not a door: it is only reachable by someone who already went looking for her, so everything she generates was invisible to the app. Placement is now:

- **Desktop** — the left rail's secondary section (below Words / Reading / Listening) gains a **Kuromi** entry. It is the home for all content she generates, and it opens the Shelf: pages, label filter chips, archive view, styled per this section's Kuromi-surface identity (white + 3px ink border, her sticker presence).
- **Mobile** — the same **Kuromi** entry joins the existing quiet secondary row on Home: Words · Reading · Listening · Kuromi. **No bottom-nav changes** — the 5-tab track is at capacity (§8) and this amendment does not spend that budget.
- **`/kuromi` remains chat + conversation history only.**
- **Primary mobile discovery is her announcement links**; the row entry is the return path. An announcement that names a page in prose without a working link is a **failure**, not a degraded success — the link is the mechanism by which the Shelf is reachable at all on mobile.

Recorded because the Shelf shipped fully built, fully tested and completely unreachable: the components passed every mounted test while the app shell rendered no door to them. That is the same class as the unopenable Doelen sheet and the unrenderable achievement grid (§11.6), now the third and fourth instances in this project, and the rule stands — **a composition change is verified by RENDERING the screen, never by the component's own tests.**

## 5. Character system
Manifest: `static/characters/manifest.json` (kuromi 24 static + 6 animated; melody 19; piano 7 — melody/piano each have `.gif` animated + `.png` static-frame twins).

- **Kuromi — the host.** ~90% of appearances. Home hero, chat, quiz/boss reactions, empty states. Expression is ALWAYS state-driven via manifest contexts; never random.
- **Chat mood protocol:** the persona ends every reply with `[mood: <name>]` on its own line. Client parses, strips from displayed text, and renders that expression beside the bubble (animated variant — chat replies are events). Unknown/missing mood → `talk`.
- **Protocol extensions.** Alongside `[mood: x]` the persona may emit `[sticker: <name>]` — rendered as a ~96px inline sticker inside her reply, animated variant — and `[react: <name>]` — a ~24px emote badge attached to Domi's most recent bubble. **Max one of each per reply.** Unknown names are dropped silently. The client parses and strips ALL tags; Domi never sees a raw tag.
- **Sticker/react names are NAMESPACED across all three characters:** `kuromi/hehe`, `melody/cheer`, `piano/peek`. `[mood:]` stays Kuromi-only and un-namespaced. Melody and Piano deliveries are in character as grudging concessions, never warmth she'd admit to.
  **Sequencing constraint:** the namespaced parser and the persona line permitting these MUST land together. Shipping the persona line first emits `melody/cheer`, which the un-namespaced parser does not recognise as a tag at all — so it renders as raw text in the bubble instead of being dropped. `docs/KUROMI_PERSONA.md` already carries the line; `netlify/functions/lib/persona.mts` must NOT be re-synced from it until the parser handles namespaces.
- **Avatars: every message row carries one.** Kuromi's rows show her current-mood expression at 40–48px beside her bubble; Domi's rows show her avatar from the existing `static/avatars/` set (`PROFILES[profile].avatar`) beside hers.
- **My Melody — the soft counterweight.** Owns gentle moments: streak-saved (`love`/`cheer`), welcome-back after gaps (`serene`/`worried`), Daily Read companion (`reading`/`juice`), hints (`idea`). Kuromi's persona may grumble about her presence.
- **My Sweet Piano — ambient cameo, max 3 mapped placements:** `sleep` in empty states/late night, `peek` at one screen edge (Stories shelf), `dreamy` in the desktop rail corner. Wordless, static by default.
- **Pixel Kuromi** (`kuromi/pixel.gif`): Boss realm ONLY.
- Placement sizes: hero 64–96px, card-corner stickers 32–40px, chat 44–56px, cameos ≤44px.

## 6. Flavor layer (MANDATORY — this is where "meh" dies)
Every screen must carry ALL of:
1. **Offset shadows.** Raised surfaces default to hard offset shadow: `0 4px 0 <tinted>` (rose-tinted on daylight, e.g. rgba(209,103,143,.25)); pills/badges `0 2px 0`. Soft blur shadows only as a secondary layer. This is the sticker-on-paper physics from the cheat sheet — its absence is why flat mockups feel dead.
2. **Rotation jitter.** Stickers, corner badges, and section-header labels: transform rotate between -3° and 3° (deterministic per element, not random per render). Nothing decorative sits at exactly 0°.
3. **Doodles.** 2–4 per screen from `static/characters/doodles/` (65, all `currentColor`): a squiggle underline under one section header (rose-deep), one sparkle/star accent near the hero, one contextual doodle (arrow pointing at a CTA, circle-scribble emphasis ring around the streak badge). Never more than 4; never zero.
4. **Border character.** Solid ink for structure; **dashed** 2–3px for tips/free/summon elements (Kuromi's rail box, hint stickers); mixed radii (22px cards, 14–16px chips, 999px pills).
5. **Patterned fills.** Page background: cream + fixed radial tint gradients + polka-dot overlay (~.3 opacity rose dots). Optionally one card per screen carries a subtle dot/heart pattern fill at ≤6% opacity.
6. **Grain.** 2–3% noise overlay on the app frame (single CSS `::after`, blend-mode overlay) for printed-paper feel. Respect `prefers-reduced-transparency` fallbacks.
7. **Bubble language.** All Kuromi speech in bubbles with tails (18/18/18/5 radius). Her bubble: lavender tint + 2px ink border. Domi's (chat): peach tint.

## 7. Motion spec
150–250ms, ease-out, purposeful; nothing loops idle. `prefers-reduced-motion`: all off, static art.
- **Events must actually animate.** Chat replies, sticker sends and reacts are EVENTS: the animated variant must genuinely play there, not silently resolve to a still. A static render in an event context is a bug, not a safe default.
- Bubble pop-in: scale .9→1 + fade, 180ms.
- Expression swap: crossfade 150ms.
- Sticker tap wobble: rotate ±4°, 200ms.
- Card press: existing press-scale tokens (keep).
- Streak flame flicker: only at the moment streak increments.
- **Realm threshold:** entering boss = 400ms deepen (cream→plum→charcoal radial wipe); exiting reverses. This is the app's one big transition; nothing else gets a screen-level transition.
- Chat sheet: existing slide-up, 220ms.

## 8. Screen compositions
Approved via mockups (mobile + desktop home). Per-screen briefs — hero / actions / quiet zone / flavor placements:

**Home (mobile)** — as mocked: greeting row (lowercase greeting + date, 2 utility icons) → HERO Kuromi card (expression + state-aware bubble; quiz chip teal / tekst chip peach INSIDE the card, coffee sticker overlapping the tekst chip edge) → ambient badge row (streak rose / rank lavender / B1 teal — tinted pill badges, icon circles) → "oefenen" (squiggle underline) 2×2 rich cards: Match(rose+mischief), Kaarten(lavender+question), Schrijven(peach+sit), Boss(charcoal+orchid+pixel) → one quiet line: "weekset 0/36 · missies ›" opening the Doelen sheet → nav. Sparkle doodle at hero's top-right corner, ±2° on stickers.

**Home — the daily path (the glow).** Exactly ONE element on home may glow at a time: a soft ~1.2s pulse in that element's section color. This is a **ratified exception to "nothing loops idle"** (§7); under `prefers-reduced-motion` it renders as a static ring instead of a pulse.

The glow target is a deterministic priority function, first match wins:

1. weekset unfinished AND ≤2 days remain in the week → **weekset**
2. daily quiz not done today → **quiz**
3. daily tekst not read today → **tekst**
4. weekset unfinished → **weekset**
5. all clear → **klaar state**: no glow, hero celebrates, gentle oefenen hint

**The glow never points at an invisible element.** When the weekset holds the glow on mobile, the plum weekset card PROMOTES into the home flow (between hero and oefenen) and recedes when it loses priority. Kuromi's bubble references the glowing action, and a doodle arrow points from her card toward it.

Driven entirely by the existing `dailyQuiz` / `dailyRead` flags plus weekset progress — **no new state**. (Phase 5: the priority order becomes a config key on the steward whitelist.)

**Doelen sheet** (bottom sheet from the quiet line): weekset as plum featured card with orchid progress pill, missions as 2–3 hairline rows with thin tinted bars. This is the ONLY place mission bars exist.

**Home (desktop)** — the framed handbook: dotted warm-gradient backdrop; 3px ink frame with `0 10px 0` ink-tinted shadow; grid rail(≈180px)/center/rail(≈220px) at ≥1080px (single mobile-composition column below that; the frame appears ≥768px). Left rail: wordmark, 5 labeled nav items (active = rose pill), Kuromi resident at bottom in a dashed box with "rant hier" ink pill (opens the same chat sheet). Center: greeting headline + bubble, Vandaag pair, oefenen grid. Right rail: weekset plum card, missions mini-rows, stacked stat badges, piano/dreamy static in the corner. Nothing demoted on mobile is homeless on desktop.

**/quiz** — hero = the question card (this screen IS the quiz): teal identity header with check doodle, question via extracted renderers restyled (2px ink border, offset shadow), Kuromi corner reactor (32px) swapping per answer: correct→`hehe`, wrong→`shocked`, 5/5→`excited` animated + confetti-doodle burst, 0-2/5→`defeated` with a consoling melody/`smile` cameo. Progress: five dots, not a bar.

**/read** — the calm surface: peach identity, kuromi/coffee in the header (static), read in 18–19px serif-feeling Nunito spacing, EN gloss as tap-to-reveal soft rows, "rusty picks" as three pill words with TTS at the end, melody/reading tiny static cameo bottom corner. Minimal flavor: 2 doodles max, no confetti energy here.

**/stories** — shelf of story cards (lavender identity): cover emoji large, progress as N/M pill (no bars), chapter list = ChapterBadge circles with jitter; piano/peek at one shelf edge. Chapter reading page: same large-type treatment as /read, questions at the end via renderers.

**/grammar** — the handbook chapter look transplanted: cream page, formula bars with beads, dashed tip stickers, trap stickers (solid ink on lavender tint), chapter-num circles. This screen may run denser than others — it IS the cheat sheet — but still ≤3 outlined elements per viewport.

**/vocab & /cards** — category shelves as tinted identity cards (word count + mastered as small badges), word rows: dutch bold 17px+, english muted, pos pill, TTS, SRS status dot. Kuromi/question watches over the empty-search state.

**/match & /reviews** — restyle per identity colors on renderers; Kuromi corner reactor same protocol as /quiz.

**/boss (the Realm)** — threshold transition in; realm palette; glassy panels; HUD: LP/streak/lives as glowing orchid chips; boss looms behind the question panel; pixel-Kuromi as the player-corner sprite reacting (win→`excited`, loss→`defeated`); chunky answer slabs with orchid press glow. Retro accent allowed here only.

**/kuromi hub & chat sheet** — her domain: white surfaces, 3px ink borders, the most bubble-dense screens; mood-tag expression beside every reply (44–56px); drill panel as a mischief-identity card; failure states in-character with `grumpy`/`defeated`. Shelf (Phase 6) renders pages from blocks that reuse these identity treatments; label filter chips are jittered pills.

**Chat sheet geometry.** The sheet is **never full-viewport at ≥768px** — that is a layout bug, not a presentation choice. At ≥768px it is a **right-side panel: 420–480px wide, full height, 3px ink LEFT border**, summoned from the rail or the FAB. Mobile (<768px) keeps the 85vh bottom sheet. **The message column is capped at 640px max-width on every surface**, sheet and hub alike.

**Toasts/modals** — sticker-styled: 2px ink border, offset shadow, ±1.5° rotation, auto-icon by tone (success teal check, Kuromi-action = her 28px face).

## 9. Icons
Font Awesome Pro 6.5.1 (repo path per V3_BRIEF addendum). Duotone primary weight for nav/section icons (secondary layer at 30–40% opacity in the section's color); light for utility glyphs. Per-icon SVG subsetting only — the full webfont must not ship. Target set ≤35 icons; the recomposition architect compiles the exact list into V3_STATE.

**≤35 is a SOFT budget.** Additions are allowed, but only by swapping an icon out or by an explicit bump recorded in V3_STATE. Silent growth is a spec violation — the point is that someone decides, not that the number never moves.

## 10. Verification gate
Phase 4.5 builds **Home (mobile + desktop) as a vertical slice first** — real stickers, full flavor layer, motion — and STOPS for Eyad's vibe verdict before any other screen is recomposed. Iterate the flavor rules on that slice until approved; the approved slice becomes the reference implementation every other screen must match. A screen "matches" when: hero rule holds, border budget holds, section identity correct, ≥2 doodles, offset shadows present, jitter present, all art from the manifest, text floor 14px, reduced-motion clean.

## 11. Step 2 rollout rules (binding on every lane spec)

1. **Overlays portal to `document.body`.** Every `position: fixed` or overlay element — sheets, modals, popovers, toasts, the summon FAB — must portal to body. A page-rendered fixed element does NOT escape the viewport: `.content` carries `view-transition-name`, which forms a stacking context, so the element stacks below the shell's chrome regardless of z-index. This is in every Step 2 lane spec, not left to discovery.
2. **Mechanical deprecated-token gate.** Every lane's diff is grepped for `--color-pink`, `--color-mint`, `--color-butter`, and bare `mint`/`butter` colour literals. **Any hit fails the lane.** The deprecated aliases still resolve, so nothing but a grep stops a lane reaching for them; discipline that only lives in prose does not propagate.
3. **Icon additions follow §9's soft-budget rule** — swap or recorded bump, never silent growth.
4. **Text uses `--muted-ink`, never `--muted-line`.** The gate greps for `--muted-line` (and legacy `--color-muted`) in any text-colour position.
5. **Language follows §3's function split** — Dutch for ambient flavor, English for anything comprehension-critical. Audit each screen's strings against it, including chrome translated during the slice iteration.
6. **Every composition change is checked for reachability by RENDERING the screen.** Demoting something is only legitimate if it stays reachable. Three regressions in the slice — an unopenable Doelen sheet and an unrenderable achievement grid — passed check, lint, test and build cleanly and were caught only by looking.

### Step 2 punch list (ordered)

- **Nav first — it is on every screen.** Optical balance pass: glyphs ~22–24px, labels one size down, active-pill padding rebalanced.
- **Chat renderer strips/renders markdown emphasis.** No raw asterisks in bubbles.
- **Namespaced sticker/react parser**, landing together with the persona re-sync (§5 sequencing constraint).
- Then the remaining screens per §8.

## 12. Sound (Step 2 unit — APPROVED to run)

**Pause for explicit download permission before fetching anything.** The unit is approved to run in Step 2, but the lane stops and asks before pulling files from the external source.


Source: `https://soundeffect-lab.info/sound/button/` plus its 演出 / アクション categories where needed. Files live in `static/sfx/`, wired through the existing single `src/lib/sound/sfx.ts` with **one master gain** hooked to the existing sound toggle.

**Event map (daylight)** — matched by the source site's Japanese listing names:

| Event | Sound | Alt |
|---|---|---|
| tap / press | 決定ボタンを押す22 (ピコッ、可愛らしい) | 34 (ポン、柔らかい) |
| cursor / nav move | カーソル移動7 (可愛いイメージ) | — |
| correct answer | 決定12 (可愛い音) | 決定4 |
| **wrong (GENTLE)** | キャンセル6 (ポップなイメージ) | — |
| streak tick | 決定37 (キラリーン) | 41 |
| rank up / magic | 決定21 (長めのキラキラ) | 10 |
| kuromi appears / sticker send | 決定42 (プホッ) | 45 (キュピッ) |
| chat message in | メッセージ表示音3 | — |
| LP award | ゲージ回復1 or 3 (控えめ) | — |
| chapter / quiz complete | 成功音 | — |
| klaar celebration | 決定24 (明るい長め) | 28 / 29 (鉄琴・木琴の生演奏 — audition first, most Sanrio texture on the site) |

**Realm variants (boss only):** entry → メニューを開く2 (ブォン、重低音); boss hit → 決定11 (ドズン) or 15 (ドギュン). Realm sounds may be pitched −2 to −4 semitones from their daylight equivalents.

**Rules.** A harsh buzzer is banned outright — ビープ音4 (ブブー) must never be used for a wrong answer; wrongness is carried by iconography, not punishment. One sound per event. Every sound fires **with its mood/motion twin** — sound + sticker + animation together or not at all. Master ceiling ≈ −12 dB, per-sound normalised. The sound toggle is respected everywhere. **No audio before the first user gesture.** Total budget **≤25 files / ~500 KB** — audition and trim, do not hoard. Web Audio synth is the fallback for any event where no sample lands.
