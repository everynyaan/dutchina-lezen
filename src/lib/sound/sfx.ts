// ============================================================
// DUTCHINA SFX MODULE v2
// Casino-grade Web Audio synthesis. Each event is layered,
// punchy, and designed to trigger dopamine. No binary assets.
//
// Boss fight sounds (boss_hit, boss_win, boss_loss) are handled
// by bossAudio.ts. The entries here are no-ops to prevent
// double-firing since the LP system also emits these as sfxEvents.
// ============================================================

export type SfxEvent =
	| 'correct'
	| 'wrong'
	| 'lp_gain'
	| 'tier_up'
	| 'rank_up'
	| 'boss_hit'
	| 'boss_win'
	| 'boss_loss'
	| 'card_flip'
	| 'mission_complete'
	// v2 additions (Stream 4)
	| 'button_tap'
	| 'tab_switch'
	| 'session_start'
	| 'session_complete'
	| 'streak_pip'
	| 'story_page_turn'
	| 'daily_homework_complete'
	| 'error_buzz'
	| 'kuromi_appear'
	| 'sticker_send'
	| 'chat_message_in';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function getCtx(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!audioCtx) {
		try {
			audioCtx = new AudioContext();
			masterGain = audioCtx.createGain();
			masterGain.gain.value = 0.25;
			masterGain.connect(audioCtx.destination);
			// Consistency of a sound's identity beats punctuality of a
			// sub-second UI sound; preloading makes the miss window
			// vanishingly small in practice. Safe: buffer load ≠ play,
			// and getCtx only runs after a real user gesture.
			for (const path of new Set(Object.values(SAMPLE_PATHS))) {
				preloadSample(audioCtx, path);
			}
		} catch {
			return null;
		}
	}
	if (audioCtx.state === 'suspended') {
		audioCtx.resume().catch(() => {});
	}
	return audioCtx;
}

/** Master gain bus (~-12 dB). Lazily creates against `c` if somehow missing. */
function getMasterGain(c: AudioContext): GainNode {
	if (masterGain) return masterGain;
	masterGain = c.createGain();
	masterGain.gain.value = 0.25;
	masterGain.connect(c.destination);
	return masterGain;
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
	const len = Math.floor(ctx.sampleRate * seconds);
	const buf = ctx.createBuffer(1, len, ctx.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
	return buf;
}

// ============================================================
// CORRECT: Slot machine coin hit. Two bright tones + bass thump
// + noise sparkle. Punchy, satisfying, makes you want another.
// ============================================================
function playCorrect(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);

	// Bass thump for body
	const bass = c.createOscillator();
	const bg = c.createGain();
	bass.type = 'sine';
	bass.frequency.setValueAtTime(150, t);
	bass.frequency.exponentialRampToValueAtTime(80, t + 0.08);
	bg.gain.setValueAtTime(0.35, t);
	bg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
	bass.connect(bg).connect(dest);
	bass.start(t);
	bass.stop(t + 0.12);

	// First tone: E5
	const o1 = c.createOscillator();
	const g1 = c.createGain();
	o1.type = 'sine';
	o1.frequency.setValueAtTime(659, t);
	g1.gain.setValueAtTime(0, t);
	g1.gain.linearRampToValueAtTime(0.4, t + 0.008);
	g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
	o1.connect(g1).connect(dest);
	o1.start(t);
	o1.stop(t + 0.18);

	// Second tone: B5, 60ms later
	const o2 = c.createOscillator();
	const g2 = c.createGain();
	o2.type = 'sine';
	o2.frequency.setValueAtTime(988, t + 0.06);
	g2.gain.setValueAtTime(0, t + 0.06);
	g2.gain.linearRampToValueAtTime(0.45, t + 0.068);
	g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
	o2.connect(g2).connect(dest);
	o2.start(t + 0.06);
	o2.stop(t + 0.24);

	// Shimmer harmonics
	const h1 = c.createOscillator();
	const hg1 = c.createGain();
	h1.type = 'triangle';
	h1.frequency.setValueAtTime(1976, t + 0.06);
	hg1.gain.setValueAtTime(0.1, t + 0.06);
	hg1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
	h1.connect(hg1).connect(dest);
	h1.start(t + 0.06);
	h1.stop(t + 0.22);

	// Noise sparkle
	const ns = c.createBufferSource();
	ns.buffer = noiseBuffer(c, 0.06);
	const hp = c.createBiquadFilter();
	hp.type = 'highpass';
	hp.frequency.setValueAtTime(8000, t + 0.05);
	const ng = c.createGain();
	ng.gain.setValueAtTime(0.08, t + 0.05);
	ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
	ns.connect(hp).connect(ng).connect(dest);
	ns.start(t + 0.05);
}

// ============================================================
// WRONG: Two-tone descending minor second (dissonant but soft).
// Not punishing, but unmistakable. Muffled noise underneath.
// ============================================================
function playWrong(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);

	// First tone: Eb4
	const o1 = c.createOscillator();
	const g1 = c.createGain();
	o1.type = 'triangle';
	o1.frequency.setValueAtTime(311, t);
	o1.frequency.exponentialRampToValueAtTime(280, t + 0.15);
	g1.gain.setValueAtTime(0, t);
	g1.gain.linearRampToValueAtTime(0.2, t + 0.01);
	g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
	o1.connect(g1).connect(dest);
	o1.start(t);
	o1.stop(t + 0.25);

	// Second tone: D4 (minor second below, tension)
	const o2 = c.createOscillator();
	const g2 = c.createGain();
	o2.type = 'triangle';
	o2.frequency.setValueAtTime(294, t + 0.08);
	o2.frequency.exponentialRampToValueAtTime(260, t + 0.25);
	g2.gain.setValueAtTime(0, t + 0.08);
	g2.gain.linearRampToValueAtTime(0.18, t + 0.09);
	g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
	o2.connect(g2).connect(dest);
	o2.start(t + 0.08);
	o2.stop(t + 0.35);

	// Muffled noise
	const ns = c.createBufferSource();
	ns.buffer = noiseBuffer(c, 0.2);
	const lp = c.createBiquadFilter();
	lp.type = 'lowpass';
	lp.frequency.setValueAtTime(400, t);
	lp.frequency.exponentialRampToValueAtTime(100, t + 0.15);
	const ng = c.createGain();
	ng.gain.setValueAtTime(0.08, t);
	ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
	ns.connect(lp).connect(ng).connect(dest);
	ns.start(t);
}

// ============================================================
// LP_GAIN: Casino coin drop. Two metallic pings at different
// pitches, very fast, subtle but present. ~80ms.
// ============================================================
function playLpGain(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);

	// Primary ping
	const o1 = c.createOscillator();
	const g1 = c.createGain();
	o1.type = 'sine';
	o1.frequency.setValueAtTime(2400, t);
	g1.gain.setValueAtTime(0, t);
	g1.gain.linearRampToValueAtTime(0.18, t + 0.003);
	g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
	o1.connect(g1).connect(dest);
	o1.start(t);
	o1.stop(t + 0.09);

	// Higher metallic ping
	const o2 = c.createOscillator();
	const g2 = c.createGain();
	o2.type = 'sine';
	o2.frequency.setValueAtTime(4800, t);
	g2.gain.setValueAtTime(0.06, t);
	g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
	o2.connect(g2).connect(dest);
	o2.start(t);
	o2.stop(t + 0.07);

	// Tiny body
	const o3 = c.createOscillator();
	const g3 = c.createGain();
	o3.type = 'sine';
	o3.frequency.setValueAtTime(1200, t);
	g3.gain.setValueAtTime(0.06, t);
	g3.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
	o3.connect(g3).connect(dest);
	o3.start(t);
	o3.stop(t + 0.06);
}

// ============================================================
// TIER_UP: 3-note ascending arpeggio with chord stack on top.
// C5, E5, G5. Each note gets a parallel octave for fullness.
// Noise burst at the end. Celebratory. ~450ms.
// ============================================================
function playTierUp(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const notes = [523, 659, 784]; // C5, E5, G5
	const sp = 0.1;

	notes.forEach((freq, i) => {
		const start = t + i * sp;
		const dur = i === notes.length - 1 ? 0.25 : 0.12;

		// Main note
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(freq, start);
		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(0.35, start + 0.008);
		g.gain.setValueAtTime(0.35, start + dur * 0.5);
		g.gain.exponentialRampToValueAtTime(0.001, start + dur);
		o.connect(g).connect(dest);
		o.start(start);
		o.stop(start + dur + 0.05);

		// Octave above for fullness
		const oh = c.createOscillator();
		const gh = c.createGain();
		oh.type = 'sine';
		oh.frequency.setValueAtTime(freq * 2, start);
		gh.gain.setValueAtTime(0.12, start);
		gh.gain.exponentialRampToValueAtTime(0.001, start + dur);
		oh.connect(gh).connect(dest);
		oh.start(start);
		oh.stop(start + dur + 0.05);

		// Shimmer + bass on final note
		if (i === notes.length - 1) {
			const sh = c.createOscillator();
			const sg = c.createGain();
			sh.type = 'triangle';
			sh.frequency.setValueAtTime(freq * 3, start);
			sg.gain.setValueAtTime(0.06, start);
			sg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			sh.connect(sg).connect(dest);
			sh.start(start);
			sh.stop(start + dur + 0.05);

			// Bass root
			const bs = c.createOscillator();
			const bg = c.createGain();
			bs.type = 'sine';
			bs.frequency.setValueAtTime(262, start); // C4
			bg.gain.setValueAtTime(0.15, start);
			bg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			bs.connect(bg).connect(dest);
			bs.start(start);
			bs.stop(start + dur + 0.05);

			// Noise burst
			const ns = c.createBufferSource();
			ns.buffer = noiseBuffer(c, 0.1);
			const hp = c.createBiquadFilter();
			hp.type = 'highpass';
			hp.frequency.setValueAtTime(5000, start);
			const ng = c.createGain();
			ng.gain.setValueAtTime(0.08, start);
			ng.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
			ns.connect(hp).connect(ng).connect(dest);
			ns.start(start);
		}
	});
}

// ============================================================
// RANK_UP: Full fanfare. 5-note ascending phrase with chord
// stacking, bass foundation, sustained final chord, shimmer
// harmonics, and noise sparkle trail. This is THE moment.
// ~1200ms.
// ============================================================
function playRankUp(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	// C5, E5, G5, B5, C6 (resolves to octave)
	const notes = [523, 659, 784, 988, 1047];
	const sp = 0.12;

	// Bass pedal underneath the whole thing
	const pedal = c.createOscillator();
	const pg = c.createGain();
	pedal.type = 'sine';
	pedal.frequency.setValueAtTime(131, t); // C3
	pg.gain.setValueAtTime(0, t);
	pg.gain.linearRampToValueAtTime(0.2, t + 0.05);
	pg.gain.setValueAtTime(0.2, t + 0.5);
	pg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
	pedal.connect(pg).connect(dest);
	pedal.start(t);
	pedal.stop(t + 1.3);

	notes.forEach((freq, i) => {
		const start = t + i * sp;
		const isLast = i === notes.length - 1;
		const dur = isLast ? 0.6 : 0.14;
		const gain = isLast ? 0.4 : 0.35;

		// Main note
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(freq, start);
		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(gain, start + 0.01);
		g.gain.setValueAtTime(gain, start + dur * 0.6);
		g.gain.exponentialRampToValueAtTime(0.001, start + dur);
		o.connect(g).connect(dest);
		o.start(start);
		o.stop(start + dur + 0.05);

		// Octave above
		const oh = c.createOscillator();
		const gh = c.createGain();
		oh.type = 'sine';
		oh.frequency.setValueAtTime(freq * 2, start);
		gh.gain.setValueAtTime(isLast ? 0.15 : 0.08, start);
		gh.gain.exponentialRampToValueAtTime(0.001, start + dur);
		oh.connect(gh).connect(dest);
		oh.start(start);
		oh.stop(start + dur + 0.05);

		if (isLast) {
			// Triangle shimmer
			const sh = c.createOscillator();
			const sg = c.createGain();
			sh.type = 'triangle';
			sh.frequency.setValueAtTime(freq * 3, start);
			sg.gain.setValueAtTime(0.06, start);
			sg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			sh.connect(sg).connect(dest);
			sh.start(start);
			sh.stop(start + dur + 0.05);

			// Sub-octave for warmth
			const sub = c.createOscillator();
			const subg = c.createGain();
			sub.type = 'sine';
			sub.frequency.setValueAtTime(freq / 2, start);
			subg.gain.setValueAtTime(0.12, start);
			subg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			sub.connect(subg).connect(dest);
			sub.start(start);
			sub.stop(start + dur + 0.05);

			// Sparkle noise trail
			const ns = c.createBufferSource();
			ns.buffer = noiseBuffer(c, 0.3);
			const hp = c.createBiquadFilter();
			hp.type = 'highpass';
			hp.frequency.setValueAtTime(6000, start);
			const ng = c.createGain();
			ng.gain.setValueAtTime(0.06, start);
			ng.gain.setValueAtTime(0.06, start + 0.1);
			ng.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
			ns.connect(hp).connect(ng).connect(dest);
			ns.start(start);
		}
	});
}

// ============================================================
// CARD_FLIP: Noise whoosh with slight body. ~100ms.
// ============================================================
function playCardFlip(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const ns = c.createBufferSource();
	ns.buffer = noiseBuffer(c, 0.1);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(5000, t);
	bp.frequency.exponentialRampToValueAtTime(800, t + 0.07);
	bp.Q.setValueAtTime(1.2, t);
	const g = c.createGain();
	g.gain.setValueAtTime(0.18, t);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
	ns.connect(bp).connect(g).connect(dest);
	ns.start(t);
}

// ============================================================
// MISSION_COMPLETE: Quest fanfare. 3 ascending notes with
// chord on top + octave double + noise sparkle burst. ~500ms.
// ============================================================
function playMissionComplete(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const notes = [659, 784, 988]; // E5, G5, B5
	const sp = 0.1;

	notes.forEach((freq, i) => {
		const start = t + i * sp;
		const isLast = i === notes.length - 1;
		const dur = isLast ? 0.3 : 0.12;

		// Main
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(freq, start);
		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(0.35, start + 0.008);
		g.gain.setValueAtTime(0.35, start + dur * 0.5);
		g.gain.exponentialRampToValueAtTime(0.001, start + dur);
		o.connect(g).connect(dest);
		o.start(start);
		o.stop(start + dur + 0.05);

		// Octave above
		const oh = c.createOscillator();
		const gh = c.createGain();
		oh.type = 'sine';
		oh.frequency.setValueAtTime(freq * 2, start);
		gh.gain.setValueAtTime(isLast ? 0.15 : 0.08, start);
		gh.gain.exponentialRampToValueAtTime(0.001, start + dur);
		oh.connect(gh).connect(dest);
		oh.start(start);
		oh.stop(start + dur + 0.05);

		if (isLast) {
			// Third for chord
			const third = c.createOscillator();
			const tg = c.createGain();
			third.type = 'sine';
			third.frequency.setValueAtTime(1175, start); // D6
			tg.gain.setValueAtTime(0.08, start);
			tg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			third.connect(tg).connect(dest);
			third.start(start);
			third.stop(start + dur + 0.05);

			// Sparkle burst
			const ns = c.createBufferSource();
			ns.buffer = noiseBuffer(c, 0.12);
			const hp = c.createBiquadFilter();
			hp.type = 'highpass';
			hp.frequency.setValueAtTime(7000, start);
			const ng = c.createGain();
			ng.gain.setValueAtTime(0.07, start);
			ng.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
			ns.connect(hp).connect(ng).connect(dest);
			ns.start(start);
		}
	});
}

// ============================================================
// BUTTON_TAP: Single high ping for primary action presses.
// ~35ms total. Feels like tapping glass. Volume 0.08.
// ============================================================
function playButtonTap(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = 'sine';
	o.frequency.setValueAtTime(3000, t);
	g.gain.setValueAtTime(0, t);
	g.gain.linearRampToValueAtTime(0.08, t + 0.002);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
	o.connect(g).connect(dest);
	o.start(t);
	o.stop(t + 0.04);
}

// ============================================================
// TAB_SWITCH: Soft whoosh for nav transitions.
// Bandpass-filtered noise swept 2000 -> 800Hz. ~60ms. Gain 0.07.
// Should be quieter than other cues since it fires a lot.
// ============================================================
function playTabSwitch(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const ns = c.createBufferSource();
	ns.buffer = noiseBuffer(c, 0.06);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(2000, t);
	bp.frequency.exponentialRampToValueAtTime(800, t + 0.06);
	bp.Q.setValueAtTime(1.5, t);
	const g = c.createGain();
	g.gain.setValueAtTime(0.07, t);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
	ns.connect(bp).connect(g).connect(dest);
	ns.start(t);
}

// ============================================================
// SESSION_START: Two ascending notes (C4, E4) + brief shimmer.
// "Let's go" feel. ~200ms.
// ============================================================
function playSessionStart(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const notes = [262, 330]; // C4, E4
	notes.forEach((freq, i) => {
		const start = t + i * 0.08;
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(freq, start);
		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(0.22, start + 0.01);
		g.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
		o.connect(g).connect(dest);
		o.start(start);
		o.stop(start + 0.14);
	});

	// Bright triangle shimmer on the second note
	const sh = c.createOscillator();
	const sg = c.createGain();
	sh.type = 'triangle';
	sh.frequency.setValueAtTime(1320, t + 0.08); // E6
	sg.gain.setValueAtTime(0.05, t + 0.08);
	sg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
	sh.connect(sg).connect(dest);
	sh.start(t + 0.08);
	sh.stop(t + 0.22);
}

// ============================================================
// SESSION_COMPLETE: Warm 3-note descending arpeggio (G5, E5, C5)
// with sub-octave warmth on the final note. ~400ms.
// Less triumphant than mission_complete, more "well done".
// ============================================================
function playSessionComplete(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const notes = [784, 659, 523]; // G5, E5, C5
	notes.forEach((freq, i) => {
		const start = t + i * 0.1;
		const isLast = i === notes.length - 1;
		const dur = isLast ? 0.28 : 0.12;
		const gain = isLast ? 0.3 : 0.25;

		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(freq, start);
		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(gain, start + 0.012);
		g.gain.setValueAtTime(gain, start + dur * 0.5);
		g.gain.exponentialRampToValueAtTime(0.001, start + dur);
		o.connect(g).connect(dest);
		o.start(start);
		o.stop(start + dur + 0.05);

		if (isLast) {
			// Sub-octave for warmth on the resolving note
			const sub = c.createOscillator();
			const subg = c.createGain();
			sub.type = 'sine';
			sub.frequency.setValueAtTime(freq / 2, start);
			subg.gain.setValueAtTime(0.12, start);
			subg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			sub.connect(subg).connect(dest);
			sub.start(start);
			sub.stop(start + dur + 0.05);
		}
	});
}

// ============================================================
// STREAK_PIP: Tiny ascending pip per streak increment.
// Brief spec: freq = 800 + streak * 200, capped at 2000. ~50ms.
// The DISPATCH entry uses streak=3 as the default pitch; the
// match module calls playStreakPip(streak) directly for the
// actual ramp-up behavior.
// ============================================================
function playStreakPipInternal(c: AudioContext, streak: number): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const freq = Math.min(800 + streak * 200, 2000);
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = 'sine';
	o.frequency.setValueAtTime(freq, t);
	g.gain.setValueAtTime(0, t);
	g.gain.linearRampToValueAtTime(0.09, t + 0.003);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
	o.connect(g).connect(dest);
	o.start(t);
	o.stop(t + 0.06);
}

// ============================================================
// STORY_PAGE_TURN: Paper-like rustle. Bandpass swept noise.
// 1500 -> 600Hz. ~80ms. Gain 0.1.
// ============================================================
function playStoryPageTurn(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const ns = c.createBufferSource();
	ns.buffer = noiseBuffer(c, 0.08);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(1500, t);
	bp.frequency.exponentialRampToValueAtTime(600, t + 0.07);
	bp.Q.setValueAtTime(2.0, t);
	const g = c.createGain();
	g.gain.setValueAtTime(0.1, t);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
	ns.connect(bp).connect(g).connect(dest);
	ns.start(t);
}

// ============================================================
// DAILY_HOMEWORK_COMPLETE: Achievement-moment fanfare.
// Four ascending notes (C5, E5, G5, C6) with major-third harmony,
// bass pedal underneath, shimmer + sparkle trail on the final
// note. ~800ms. Volume up to 0.38 on the resolving chord.
// ============================================================
function playDailyHomeworkComplete(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
	const sp = 0.12;

	// Bass pedal under the whole phrase
	const pedal = c.createOscillator();
	const pg = c.createGain();
	pedal.type = 'sine';
	pedal.frequency.setValueAtTime(131, t); // C3
	pg.gain.setValueAtTime(0, t);
	pg.gain.linearRampToValueAtTime(0.2, t + 0.04);
	pg.gain.setValueAtTime(0.2, t + 0.4);
	pg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
	pedal.connect(pg).connect(dest);
	pedal.start(t);
	pedal.stop(t + 0.85);

	notes.forEach((freq, i) => {
		const start = t + i * sp;
		const isLast = i === notes.length - 1;
		const dur = isLast ? 0.4 : 0.14;
		const gain = isLast ? 0.38 : 0.32;

		// Main note
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(freq, start);
		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(gain, start + 0.01);
		g.gain.setValueAtTime(gain, start + dur * 0.5);
		g.gain.exponentialRampToValueAtTime(0.001, start + dur);
		o.connect(g).connect(dest);
		o.start(start);
		o.stop(start + dur + 0.05);

		// Major third above for harmony
		const harm = c.createOscillator();
		const hg = c.createGain();
		harm.type = 'sine';
		harm.frequency.setValueAtTime(freq * 1.25, start);
		hg.gain.setValueAtTime(isLast ? 0.12 : 0.08, start);
		hg.gain.exponentialRampToValueAtTime(0.001, start + dur);
		harm.connect(hg).connect(dest);
		harm.start(start);
		harm.stop(start + dur + 0.05);

		if (isLast) {
			// Triangle shimmer on the resolving octave
			const sh = c.createOscillator();
			const sg = c.createGain();
			sh.type = 'triangle';
			sh.frequency.setValueAtTime(freq * 2, start);
			sg.gain.setValueAtTime(0.08, start);
			sg.gain.exponentialRampToValueAtTime(0.001, start + dur);
			sh.connect(sg).connect(dest);
			sh.start(start);
			sh.stop(start + dur + 0.05);

			// Sparkle noise trail
			const ns = c.createBufferSource();
			ns.buffer = noiseBuffer(c, 0.3);
			const hp = c.createBiquadFilter();
			hp.type = 'highpass';
			hp.frequency.setValueAtTime(6500, start);
			const ng = c.createGain();
			ng.gain.setValueAtTime(0.06, start);
			ng.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
			ns.connect(hp).connect(ng).connect(dest);
			ns.start(start);
		}
	});
}

// ============================================================
// ERROR_BUZZ: Soft low-frequency vibration for blocked actions.
// 80Hz sine with held envelope. ~100ms. Gain 0.18. Informative,
// not punishing.
// ============================================================
function playErrorBuzz(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = 'sine';
	o.frequency.setValueAtTime(80, t);
	g.gain.setValueAtTime(0, t);
	g.gain.linearRampToValueAtTime(0.18, t + 0.005);
	g.gain.linearRampToValueAtTime(0.18, t + 0.08);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
	o.connect(g).connect(dest);
	o.start(t);
	o.stop(t + 0.12);
}

// ============================================================
// KUROMI_APPEAR / STICKER_SEND: Short bright pop ping (~50ms).
// Sample fallback while /sfx/kuromi_appear.mp3 loads.
// ============================================================
function playKuromiAppear(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = 'sine';
	o.frequency.setValueAtTime(1760, t);
	g.gain.setValueAtTime(0, t);
	g.gain.linearRampToValueAtTime(0.22, t + 0.004);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
	o.connect(g).connect(dest);
	o.start(t);
	o.stop(t + 0.06);
}

// ============================================================
// CHAT_MESSAGE_IN: Soft two-tone message chime (~80ms).
// Lower gain (~0.1) since chat can fire frequently.
// ============================================================
function playChatMessageIn(c: AudioContext): void {
	const t = c.currentTime;
	const dest = getMasterGain(c);

	const o1 = c.createOscillator();
	const g1 = c.createGain();
	o1.type = 'sine';
	o1.frequency.setValueAtTime(880, t);
	g1.gain.setValueAtTime(0, t);
	g1.gain.linearRampToValueAtTime(0.1, t + 0.004);
	g1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
	o1.connect(g1).connect(dest);
	o1.start(t);
	o1.stop(t + 0.06);

	const o2 = c.createOscillator();
	const g2 = c.createGain();
	o2.type = 'sine';
	o2.frequency.setValueAtTime(1175, t + 0.04);
	g2.gain.setValueAtTime(0, t + 0.04);
	g2.gain.linearRampToValueAtTime(0.08, t + 0.044);
	g2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
	o2.connect(g2).connect(dest);
	o2.start(t + 0.04);
	o2.stop(t + 0.1);
}

// ============================================================
// SAMPLE PLAYBACK
// Consistency of a sound's identity beats punctuality of a
// sub-second UI sound; preloading makes the miss window
// vanishingly small in practice. Synth plays only when a
// sample is known to have permanently failed to load.
// ============================================================

const SAMPLE_PATHS: Partial<Record<SfxEvent, string>> = {
	button_tap: '/sfx/button_tap.mp3',
	tab_switch: '/sfx/tab_switch.mp3',
	correct: '/sfx/correct.mp3',
	wrong: '/sfx/wrong.mp3',
	streak_pip: '/sfx/streak_pip.mp3',
	rank_up: '/sfx/rank_up.mp3',
	kuromi_appear: '/sfx/kuromi_appear.mp3',
	sticker_send: '/sfx/kuromi_appear.mp3',
	chat_message_in: '/sfx/chat_message_in.mp3',
	lp_gain: '/sfx/lp_gain.mp3',
	session_complete: '/sfx/session_complete.mp3',
	daily_homework_complete: '/sfx/daily_homework_complete.mp3'
};

const SAMPLE_STALE_MS = 1000;

type SampleState =
	| { status: 'loading'; promise: Promise<AudioBuffer | null> }
	| { status: 'loaded'; buffer: AudioBuffer }
	| { status: 'failed' };

/** Per-AudioContext sample cache — isolates sfx.ts vs bossAudio.ts contexts. */
const sampleCaches = new WeakMap<AudioContext, Map<string, SampleState>>();

function getSampleCache(c: AudioContext): Map<string, SampleState> {
	let cache = sampleCaches.get(c);
	if (!cache) {
		cache = new Map();
		sampleCaches.set(c, cache);
	}
	return cache;
}

/**
 * Kick off fetch+decode for `path` against context `c` if not already
 * loading/loaded/failed for that pair. Fire-and-forget; never plays audio.
 * Safe to call repeatedly (dedupes).
 */
export function preloadSample(c: AudioContext, path: string): void {
	const cache = getSampleCache(c);
	if (cache.has(path)) return;

	const promise = (async (): Promise<AudioBuffer | null> => {
		try {
			const res = await fetch(path);
			if (!res.ok) {
				cache.set(path, { status: 'failed' });
				return null;
			}
			const arrayBuffer = await res.arrayBuffer();
			const buffer = await c.decodeAudioData(arrayBuffer);
			cache.set(path, { status: 'loaded', buffer });
			return buffer;
		} catch {
			cache.set(path, { status: 'failed' });
			return null;
		}
	})();

	cache.set(path, { status: 'loading', promise });
}

/**
 * Play a cached sample, wait for an in-flight load, or fall back to synth
 * only once the load is known to have permanently failed. On a still-loading
 * miss, attaches to the promise and plays when it resolves — unless mute
 * flipped mid-flight or more than SAMPLE_STALE_MS have elapsed (then silence).
 */
export function playSampleOrSynth(
	c: AudioContext,
	path: string,
	playFn: (c: AudioContext, buffer: AudioBuffer) => void,
	synthFn: (c: AudioContext) => void,
	isMutedNow: () => boolean
): void {
	const cache = getSampleCache(c);
	let state = cache.get(path);

	if (state?.status === 'loaded') {
		playFn(c, state.buffer);
		return;
	}
	if (state?.status === 'failed') {
		synthFn(c);
		return;
	}

	if (!state || state.status !== 'loading') {
		preloadSample(c, path);
		state = cache.get(path);
	}

	if (!state || state.status !== 'loading') {
		// Completed between check and preload (or failed immediately).
		state = cache.get(path);
		if (state?.status === 'loaded') {
			playFn(c, state.buffer);
			return;
		}
		if (state?.status === 'failed') {
			synthFn(c);
			return;
		}
		return;
	}

	const firedAt = Date.now();
	void state.promise.then((buffer) => {
		if (isMutedNow()) return;
		if (Date.now() - firedAt > SAMPLE_STALE_MS) return;
		if (buffer) {
			playFn(c, buffer);
		} else {
			synthFn(c);
		}
	});
}

function playSampleBuffer(c: AudioContext, buffer: AudioBuffer, rate = 1): void {
	const src = c.createBufferSource();
	src.buffer = buffer;
	if (rate !== 1) {
		src.playbackRate.value = rate;
	}
	src.connect(getMasterGain(c));
	src.start();
}

// ============================================================
// EVENT DISPATCH
// ============================================================

const DISPATCH: Record<SfxEvent, (c: AudioContext) => void> = {
	correct: playCorrect,
	wrong: playWrong,
	lp_gain: playLpGain,
	tier_up: playTierUp,
	rank_up: playRankUp,
	card_flip: playCardFlip,
	mission_complete: playMissionComplete,
	boss_hit: () => {},
	boss_win: () => {},
	boss_loss: () => {},
	// v2 additions (Stream 4)
	button_tap: playButtonTap,
	tab_switch: playTabSwitch,
	session_start: playSessionStart,
	session_complete: playSessionComplete,
	// streak_pip uses a mid-range default pitch here; callers that
	// want pitch-by-streak should use playStreakPip(streak) below.
	streak_pip: (c) => playStreakPipInternal(c, 3),
	story_page_turn: playStoryPageTurn,
	daily_homework_complete: playDailyHomeworkComplete,
	error_buzz: playErrorBuzz,
	kuromi_appear: playKuromiAppear,
	sticker_send: playKuromiAppear,
	chat_message_in: playChatMessageIn
};

export function playSfx(event: SfxEvent): void {
	if (muted) return;
	const c = getCtx();
	if (!c) return;

	const path = SAMPLE_PATHS[event];
	if (path) {
		playSampleOrSynth(c, path, playSampleBuffer, DISPATCH[event], () => muted);
		return;
	}

	DISPATCH[event](c);
}

// Pitch-by-streak variant for the match streak pip. Routes through
// the streak_pip sample when available, pitching via playbackRate
// so a static mp3 can still escalate with streak. Equivalent of the
// synth ladder (800 + streak*200)/800, clamped at 2.0x (streak >= 4).
// Synth fallback keeps the original escalating-frequency formula.
export function playStreakPip(streak: number): void {
	if (muted) return;
	const c = getCtx();
	if (!c) return;
	const path = SAMPLE_PATHS.streak_pip;
	if (path) {
		const rate = Math.min(1 + Math.max(streak, 0) * 0.25, 2.0);
		playSampleOrSynth(
			c,
			path,
			(ctx, buf) => playSampleBuffer(ctx, buf, rate),
			(ctx) => playStreakPipInternal(ctx, streak),
			() => muted
		);
		return;
	}
	playStreakPipInternal(c, streak);
}

export function setSfxMuted(value: boolean): void {
	muted = value;
}

export function isSfxMuted(): boolean {
	return muted;
}
