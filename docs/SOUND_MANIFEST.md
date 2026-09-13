# Sound Manifest

Decision document for acquiring sound-effect files from an external source. Plan only — nothing has been fetched.

## 1. The file list

Proposed count: 13 files, all under the section 12 cap of 25 files / approximately 500 KB. The actual KB total is unknown until audition/download, which has not happened.

| Section 12 Event              | Source listing name (Japanese, exact)   | Proposed local filename (static/sfx/...) | Daylight or Realm |
| ----------------------------- | --------------------------------------- | ---------------------------------------- | ----------------- |
| tap / press                   | 決定ボタンを押す22 (ピコッ、可愛らしい) | static/sfx/button_tap.mp3                | Daylight          |
| cursor / nav move             | カーソル移動7 (可愛いイメージ)          | static/sfx/tab_switch.mp3                | Daylight          |
| correct answer                | 決定12 (可愛い音)                       | static/sfx/correct.mp3                   | Daylight          |
| wrong (GENTLE)                | キャンセル6 (ポップなイメージ)          | static/sfx/wrong.mp3                     | Daylight          |
| streak tick                   | 決定37 (キラリーン)                     | static/sfx/streak_pip.mp3                | Daylight          |
| rank up / magic               | 決定21 (長めのキラキラ)                 | static/sfx/rank_up.mp3                   | Daylight          |
| kuromi appears / sticker send | 決定42 (プホッ)                         | static/sfx/kuromi_appear.mp3             | Daylight          |
| chat message in               | メッセージ表示音3                       | static/sfx/chat_message_in.mp3           | Daylight          |
| LP award                      | ゲージ回復1 (控えめ)                    | static/sfx/lp_gain.mp3                   | Daylight          |
| chapter / quiz complete       | 成功音                                  | static/sfx/session_complete.mp3          | Daylight          |
| klaar celebration             | 決定24 (明るい長め)                     | static/sfx/daily_homework_complete.mp3   | Daylight          |
| entry (realm)                 | メニューを開く2 (ブォン、重低音)        | static/sfx/realm_entry.mp3               | Realm             |
| boss hit (realm)              | 決定11 (ドズン)                         | static/sfx/realm_boss_hit.mp3            | Realm             |

**Alt fallbacks** (proposed primary is taken first; Alt is the fallback if the primary underwhelms on audition):

- **tap / press:** Alt is 34 (ポン、柔らかい) — fallback if 22 reads too sharp against the existing synth `button_tap`'s high-ping character.
- **correct answer:** Alt is 決定4 — fallback if 12 does not read as distinct enough from `rank_up`'s fanfare.
- **streak tick:** Alt is 41 — fallback if 37 does not scale well when repeated rapidly, since streak pips fire in quick succession.
- **rank up / magic:** Alt is 10 — fallback if 21 is too close in length or texture to `daily_homework_complete`'s fanfare.
- **kuromi appears / sticker send:** Alt is 45 (キュピッ) — fallback if 42 reads too subdued for a character-appearance beat.
- **klaar celebration:** Alt is 28/29 (鉄琴・木琴の生演奏) — section 12 itself says these need audition first ("most Sanrio texture on the site"), which means they cannot be evaluated without a download, so this decision is deferred to Section 6 (open questions) rather than settled here.
- **boss hit (realm):** Alt is 15 (ドギュン) — fallback if 11 does not read as distinct enough from the daylight "correct answer" hit already in the game.
- **LP award:** section 12 says the listing is "ゲージ回復1 or 3 (控えめ)" — both are offered as primary options, not a primary-plus-fallback pair like the other rows. This document proposes taking 1 as primary and 3 as the fallback arbitrarily, pending Eyad's preference. Flagged again in Section 6.

## 2. Call-site status per event

For each of the same 13 events, in the same order as Section 1:

1. **tap / press** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `button_tap`, live call sites: `src/lib/components/SettingsPanel.svelte:190`, `src/routes/+page.svelte:237`, `src/routes/boss/+page.svelte:408`, `src/routes/boss/+page.svelte:416`, `src/routes/boss/+page.svelte:424`, `src/routes/boss/+page.svelte:829`, `src/routes/boss/+page.svelte:876`, `src/routes/daily/+page.svelte:229`.
2. **cursor / nav move** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `tab_switch`, live call sites: `src/lib/components/shell/RailNav.svelte:61`, `src/routes/+layout.svelte:566`.
3. **correct answer** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `correct`, live call sites: `src/routes/cards/+page.svelte:119`, `src/routes/daily/+page.svelte:98`, `src/routes/lezen/+page.svelte:188`, `src/routes/luisteren/+page.svelte:170`, `src/routes/match/+page.svelte:127`, `src/routes/quiz/+page.svelte:209`, `src/routes/stories/[story]/[chapter]/+page.svelte:340`.
4. **wrong (GENTLE)** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `wrong`, live call sites: `src/routes/cards/+page.svelte:121`, `src/routes/daily/+page.svelte:102`, `src/routes/lezen/+page.svelte:188` (shared ternary with correct), `src/routes/luisteren/+page.svelte:172`, `src/routes/match/+page.svelte:146`, `src/routes/quiz/+page.svelte:211`, `src/routes/stories/[story]/[chapter]/+page.svelte:344`.
5. **streak tick** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `streak_pip`, dispatched via the dedicated `playStreakPip(streak)` export rather than the generic `playSfx`, live call site: `src/routes/match/+page.svelte:130`.
6. **rank up / magic** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `rank_up`, live call site chain: `src/lib/lp/lp.ts:236` pushes `'rank_up'` into the `sfxEvents` result array, consumed at `src/routes/+layout.svelte:334` inside a loop that calls `playSfx(sfxEvent)` for each entry.
7. **kuromi appears / sticker send** — (c) has no member and no call site. NO SfxEvent member exists and NO call site exists anywhere in `src/`. Wiring it means adding a new SfxEvent member and editing `src/lib/components/kuromi/SummonButton.svelte` (the `onSummon` handler fires when Kuromi is summoned) and/or wherever a sticker-send action lives. Grep confirmed neither file currently imports anything from `src/lib/sound/`.
8. **chat message in** — (c) has no member and no call site. NO SfxEvent member exists and NO call site exists anywhere in `src/`. Wiring it means adding a new SfxEvent member and editing `src/lib/components/kuromi/ChatSheet.svelte`, where an incoming KuromiTurn reply is appended to the transcript. Grep confirmed it does not import anything from `src/lib/sound/` today.
9. **LP award** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `lp_gain`, live call sites: `src/routes/reviews/+page.svelte:220` (direct `playSfx` call), and `src/lib/lp/lp.ts:234` pushes `'lp_gain'` into `sfxEvents`, consumed at `src/routes/+layout.svelte:334`.
10. **chapter / quiz complete** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `session_complete`, live call sites: `src/routes/cards/+page.svelte:130`, `src/routes/match/+page.svelte:163`, `src/routes/quiz/+page.svelte:227`, `src/routes/stories/[story]/[chapter]/+page.svelte:368`.
11. **klaar celebration** — (a) already has an SfxEvent member AND live call sites. SfxEvent member `daily_homework_complete`, live call site: `src/routes/daily/+page.svelte:143`, firing once when all daily homework is completed. This matches "klaar" (Dutch for finished/done) as the biggest daily completion beat, distinct from the smaller per-item `session_complete`.
12. **entry (realm)** — (c) has no member and no call site. NO SfxEvent member and NO call site anywhere. `src/lib/components/boss/RealmThreshold.svelte` is a purely visual wipe transition with no audio import at all (grep confirmed). It is instantiated at `src/routes/boss/+page.svelte:358` and driven by a `thresholdPhase` state set to `'enter'` or `'exit'`. Wiring the realm entry sound means adding a new function, for example `playRealmEntry()`, to `src/lib/sound/bossAudio.ts` and calling it from `src/routes/boss/+page.svelte` at the point `thresholdPhase` is set to `'enter'`, or inside `startFight()`, which already calls `startBossMusic()` at line 159.
13. **boss hit (realm)** — hybrid case: SfxEvent DOES have a `boss_hit` member, but its DISPATCH entry in `src/lib/sound/sfx.ts` is an intentional no-op. The file's own header comment says boss sounds are handled by `bossAudio.ts` and that the entries here are no-ops to prevent double-firing. The REAL live call site is `src/lib/sound/bossAudio.ts`'s exported `playBossHit()` function, called directly, bypassing `playSfx` and the SfxEvent union entirely, at `src/routes/boss/+page.svelte:238`. So: swapping in a realm-variant sample for boss hit means editing `playBossHit()` in `bossAudio.ts`, not `sfx.ts`'s DISPATCH table, and it never goes through the SfxEvent union at all.

**State-document claim verification:**

- **Claim A:** "9 of SfxEvent's 18 members map to section 12 and all already have call sites." **VERIFIED TRUE.** The 9 are `button_tap`, `tab_switch`, `correct`, `wrong`, `streak_pip`, `rank_up`, `lp_gain`, `session_complete`, `daily_homework_complete`, all confirmed above with live call sites. (The remaining 9 SfxEvent members — `tier_up`, `boss_hit`, `boss_win`, `boss_loss`, `card_flip`, `mission_complete`, `session_start`, `story_page_turn`, `error_buzz` — serve other UX moments not in section 12's table.)
- **Claim B:** "Two section 12 events have no call site anywhere: kuromi appears/sticker send, and chat message in." **VERIFIED TRUE,** confirmed above as case (c) for both.

## 3. The master gain gap

CONFIRMED from reading `src/lib/sound/sfx.ts` directly. There is no GainNode bus of any kind in the file. Every `play*` function connects its oscillators and noise sources straight to `c.destination`, the AudioContext's own destination. Muting works purely by an early return: `playSfx()` and `playStreakPip()` both start with `if (muted) return;` before even touching the AudioContext. There is no gain ramp and no ceiling, only play-or-do-not-play.

The smallest change that introduces one master gain honoring the existing sound toggle: a single module-level GainNode would be created once per AudioContext, lazily, alongside the existing `getCtx()`, right after the context itself is created, connected once to `c.destination`, and set to the section 12 ceiling (approximately -12 dB, a linear gain value around 0.25) whenever unmuted. Every one of the individual `play*` functions would need its final `connect(c.destination)` calls changed to `connect(masterGain)` instead: a mechanical, per-function edit, not a structural rewrite, since each function already builds its own local gain chain and only the last hop changes. The existing `setSfxMuted()` boolean and its early return in `playSfx` and `playStreakPip` can stay in place as a cheap guard that avoids even building the audio graph; the new master gain node is what section 12's "one master gain" actually calls for on top of that, and it is also the node any future sample-playback code (an AudioBufferSourceNode per event, once real mp3 files replace synthesis) would connect to, so sample volume stays centrally controlled at the same ceiling.

## 4. The three private AudioContexts

- **`src/lib/sound/bossAudio.ts`:** CONFIRMED, owns its own private AudioContext (module-level `let ctx: AudioContext | null = null`, lazily constructed via `new AudioContext()` in its own `getCtx()`), entirely separate from `sfx.ts`'s own context.
- **`src/lib/components/ParticleOverlay.svelte`:** CONFIRMED, owns its own private AudioContext (module-level `let actx: AudioContext | null = null`, the same lazy-construction pattern in its own local `getCtx()`), used for celebratory burst sounds such as coin pings and ascending phrases tied to particle effects.
- **`src/lib/sound/bossMusic.ts`:** **CORRECTION** — this file does NOT own an AudioContext at all. It uses a plain HTMLAudioElement (`new Audio(soundtrackPath)`) for the looping boss soundtrack, not the Web Audio API. It has no GainNode either; volume is controlled directly via the element's own `.volume` property, with hand-rolled `setInterval`-based fade in and fade out (`TARGET_VOLUME = 0.4`), and it already listens to the SFX mute state via `syncBossMusicMute()`, which calls `isSfxMuted()` from `sfx.ts`. **The prior record's claim that all three files "each own a private AudioContext" is only accurate for two of the three; `bossMusic.ts`'s playback mechanism is architecturally different, an HTMLAudioElement rather than the Web Audio API, though it is equally something the master gain must not try to route through.**

The master gain being built in `sfx.ts` must never attach to, or attempt to control, `bossAudio.ts`'s `ctx` or its internal gain nodes, or `ParticleOverlay.svelte`'s `actx`. These are separate AudioContext instances with their own destinations, and the master gain node lives in a third, independent AudioContext inside `sfx.ts`. It also has no business touching `bossMusic.ts`'s HTMLAudioElement.volume fade logic, a wholly different, non-Web-Audio mechanism that already self-mutes correctly.

A grep for "realm" across `src/lib/sound/` returned zero matches. There is currently NO realm-variant pitch-shifting or realm-specific sound code anywhere in the codebase yet, not in `bossAudio.ts` and not anywhere else. The prior record's phrasing that "the wiring lives in `bossAudio.ts`" describes where it logically belongs, since `bossAudio.ts` is the only file that already implements the `boss_hit` synth and owns the boss AudioContext, rather than describing something that currently exists. Realm wiring is **not** already built. `bossAudio.ts`'s editability was restricted by an architect decision, not by canon, per `docs/V3_STATE.md`, specifically to prevent a collision between the sound lane and the boss lane, and that restriction is liftable when this unit resumes, since both of the realm-event files identified in Section 1 (entry, boss hit) will need new functions added there.

## 5. What needs Eyad's explicit permission before anything else happens

1. Reading the source site's (https://soundeffect-lab.info) licence and terms page — currently UNVERIFIED by this or any prior lane. Section 12's own rule is that licence terms are read before any mp3 file is touched, and that has not happened.
2. Downloading the audition candidates: the primary and fallback picks named in Section 1, plus the 28/29 klaar-celebration alt, which per section 12 needs an audition specifically because it cannot be evaluated from the listing name alone.
3. Downloading the final selected set into `static/sfx/` once auditions are complete.

No external request of any kind has been made by this lane: zero URLs opened, zero files fetched.

## 6. Open questions for Eyad

- The klaar-celebration Alt (28/29, 鉄琴・木琴の生演奏) explicitly requires audition before it can be evaluated, per section 12's own text ("most Sanrio texture on the site"). This cannot be resolved without a download, so it stays open until permission 2 above is granted.
- LP award's source listing ("ゲージ回復1 or 3 (控えめ)") offers two options as co-equal primaries rather than a primary-plus-Alt pair like every other row. This document arbitrarily proposed 1 as primary and 3 as fallback in Section 1; Eyad should confirm or override that choice.
- The two uncalled section 12 events (kuromi appears/sticker send, chat message in) need new SfxEvent member names decided. Is "kuromi appears" and "sticker send" one combined event or two separate ones? Section 12's table lists them as a single row, but `SummonButton.svelte` (appearance) and `ChatSheet.svelte` (message send) are two different components, so they may want two separate SfxEvent members rather than one.
- Section 12's closing rule allows realm sounds to be pitched -2 to -4 semitones from their daylight equivalents, as an alternative to a dedicated sample. Section 1 proposes a dedicated file for realm boss-hit (決定11) rather than pitch-shifting the daylight correct sample. Eyad should confirm which approach he prefers, since a dedicated listing item was still named in section 12's table for that row.
