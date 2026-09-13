// ============================================================
// DUTCHINA BOSS AUDIO MODULE
// Layered Web Audio synthesis for boss fights.
// Separate from the SFX module because boss sounds need
// noise generators, filter sweeps, multi-oscillator layering,
// and a persistent tension drone, none of which fit the
// simple tone-config pattern in sfx.ts.
//
// Respects the global SFX mute state via isSfxMuted().
// ============================================================

import { isSfxMuted, preloadSample, playSampleOrSynth } from './sfx';

const REALM_ENTRY_PATH = '/sfx/realm_entry.mp3';
const REALM_BOSS_HIT_PATH = '/sfx/realm_boss_hit.mp3';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!ctx) {
		try {
			ctx = new AudioContext();
			preloadSample(ctx, REALM_ENTRY_PATH);
			preloadSample(ctx, REALM_BOSS_HIT_PATH);
		} catch {
			return null;
		}
	}
	if (ctx.state === 'suspended') {
		ctx.resume().catch(() => {});
	}
	return ctx;
}

/** Create a buffer of white noise for impact/swoosh sounds. */
function noiseBuffer(audioCtx: AudioContext, seconds: number): AudioBuffer {
	const len = Math.floor(audioCtx.sampleRate * seconds);
	const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < len; i++) {
		data[i] = Math.random() * 2 - 1;
	}
	return buf;
}

// ============================================================
// SAMPLE PLAYBACK (own AudioContext — shared helper from sfx.ts,
// WeakMap-keyed so caches never leak across contexts)
// ============================================================

function playSampleAtGain(c: AudioContext, buffer: AudioBuffer, gainValue: number): void {
	const src = c.createBufferSource();
	src.buffer = buffer;
	const g = c.createGain();
	g.gain.value = gainValue;
	src.connect(g).connect(c.destination);
	src.start();
}

// ============================================================
// REALM ENTRY (fight-start whoosh)
// Tries /sfx/realm_entry.mp3; falls back to a short noise whoosh
// only if the sample is known to have permanently failed.
// ============================================================

function playRealmEntrySynth(c: AudioContext): void {
	const now = c.currentTime;

	// Whoosh: noise through descending bandpass (entry feel)
	const noiseSrc = c.createBufferSource();
	noiseSrc.buffer = noiseBuffer(c, 0.25);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(2500, now);
	bp.frequency.exponentialRampToValueAtTime(300, now + 0.2);
	bp.Q.setValueAtTime(2.5, now);
	const noiseGain = c.createGain();
	noiseGain.gain.setValueAtTime(0.22, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
	noiseSrc.connect(bp).connect(noiseGain).connect(c.destination);
	noiseSrc.start(now);

	// Soft low body underneath
	const body = c.createOscillator();
	const bodyGain = c.createGain();
	body.type = 'sine';
	body.frequency.setValueAtTime(120, now);
	body.frequency.exponentialRampToValueAtTime(60, now + 0.2);
	bodyGain.gain.setValueAtTime(0.2, now);
	bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
	body.connect(bodyGain).connect(c.destination);
	body.start(now);
	body.stop(now + 0.25);
}

export function playRealmEntry(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;

	playSampleOrSynth(
		c,
		REALM_ENTRY_PATH,
		(ac, buf) => playSampleAtGain(ac, buf, 0.3),
		playRealmEntrySynth,
		isSfxMuted
	);
}

// ============================================================
// BOSS HIT (player damages boss, correct answer)
// Tries /sfx/realm_boss_hit.mp3 first; falls back to the existing
// thump + noise burst + mid crack synthesis only on permanent fail.
// Punchy, satisfying, ~150ms.
// ============================================================

function playBossHitSynth(c: AudioContext): void {
	const now = c.currentTime;

	// Low thump
	const thump = c.createOscillator();
	const thumpGain = c.createGain();
	thump.type = 'sine';
	thump.frequency.setValueAtTime(80, now);
	thump.frequency.exponentialRampToValueAtTime(40, now + 0.1);
	thumpGain.gain.setValueAtTime(0.35, now);
	thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
	thump.connect(thumpGain).connect(c.destination);
	thump.start(now);
	thump.stop(now + 0.15);

	// Noise burst through bandpass filter
	const noiseSrc = c.createBufferSource();
	noiseSrc.buffer = noiseBuffer(c, 0.12);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(1200, now);
	bp.frequency.exponentialRampToValueAtTime(400, now + 0.08);
	bp.Q.setValueAtTime(2, now);
	const noiseGain = c.createGain();
	noiseGain.gain.setValueAtTime(0.25, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
	noiseSrc.connect(bp).connect(noiseGain).connect(c.destination);
	noiseSrc.start(now);

	// Mid crack
	const crack = c.createOscillator();
	const crackGain = c.createGain();
	crack.type = 'triangle';
	crack.frequency.setValueAtTime(600, now);
	crack.frequency.exponentialRampToValueAtTime(200, now + 0.06);
	crackGain.gain.setValueAtTime(0.15, now);
	crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
	crack.connect(crackGain).connect(c.destination);
	crack.start(now);
	crack.stop(now + 0.1);
}

export function playBossHit(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;

	playSampleOrSynth(
		c,
		REALM_BOSS_HIT_PATH,
		(ac, buf) => playSampleAtGain(ac, buf, 0.35),
		playBossHitSynth,
		isSfxMuted
	);
}

// ============================================================
// BOSS ATTACK (boss damages player, wrong answer)
// Swooshing slash: high-to-low noise sweep + delayed thud.
// Menacing, ~250ms.
// ============================================================

export function playBossAttack(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;
	const now = c.currentTime;

	// Swoosh: noise through descending bandpass
	const noiseSrc = c.createBufferSource();
	noiseSrc.buffer = noiseBuffer(c, 0.2);
	const bp = c.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(3000, now);
	bp.frequency.exponentialRampToValueAtTime(200, now + 0.15);
	bp.Q.setValueAtTime(3, now);
	const noiseGain = c.createGain();
	noiseGain.gain.setValueAtTime(0.2, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
	noiseSrc.connect(bp).connect(noiseGain).connect(c.destination);
	noiseSrc.start(now);

	// Impact thud at the end of the swoosh
	const thud = c.createOscillator();
	const thudGain = c.createGain();
	thud.type = 'sine';
	thud.frequency.setValueAtTime(60, now + 0.12);
	thudGain.gain.setValueAtTime(0, now);
	thudGain.gain.linearRampToValueAtTime(0.3, now + 0.12);
	thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
	thud.connect(thudGain).connect(c.destination);
	thud.start(now + 0.1);
	thud.stop(now + 0.3);
}

// ============================================================
// IMPACT CRUNCH (layered on boss hit for extra punch)
// Sub-bass slam + distorted noise crunch + metallic ring.
// Heavy, visceral, ~250ms.
// ============================================================

export function playImpactCrunch(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;
	const now = c.currentTime;

	// Sub-bass slam
	const sub = c.createOscillator();
	const subGain = c.createGain();
	sub.type = 'sine';
	sub.frequency.setValueAtTime(50, now);
	sub.frequency.exponentialRampToValueAtTime(25, now + 0.15);
	subGain.gain.setValueAtTime(0.5, now);
	subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
	sub.connect(subGain).connect(c.destination);
	sub.start(now);
	sub.stop(now + 0.2);

	// Distorted crunch: noise through lowpass with high gain
	const noiseSrc = c.createBufferSource();
	noiseSrc.buffer = noiseBuffer(c, 0.15);
	const lp = c.createBiquadFilter();
	lp.type = 'lowpass';
	lp.frequency.setValueAtTime(2000, now);
	lp.frequency.exponentialRampToValueAtTime(300, now + 0.12);
	lp.Q.setValueAtTime(8, now);
	const noiseGain = c.createGain();
	noiseGain.gain.setValueAtTime(0.4, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
	noiseSrc.connect(lp).connect(noiseGain).connect(c.destination);
	noiseSrc.start(now);

	// Metallic ring for satisfying feedback
	const ring = c.createOscillator();
	const ringGain = c.createGain();
	ring.type = 'square';
	ring.frequency.setValueAtTime(800, now);
	ring.frequency.exponentialRampToValueAtTime(400, now + 0.08);
	ringGain.gain.setValueAtTime(0.1, now);
	ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
	ring.connect(ringGain).connect(c.destination);
	ring.start(now);
	ring.stop(now + 0.12);
}

// ============================================================
// PAIN STING (layered on boss attack when Domi takes damage)
// Sharp high sting + glass-shatter noise + descending oof tone.
// Ouch, ~300ms.
// ============================================================

export function playPainSting(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;
	const now = c.currentTime;

	// Sharp high sting
	const sting = c.createOscillator();
	const stingGain = c.createGain();
	sting.type = 'sawtooth';
	sting.frequency.setValueAtTime(1800, now);
	sting.frequency.exponentialRampToValueAtTime(900, now + 0.06);
	stingGain.gain.setValueAtTime(0.2, now);
	stingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
	sting.connect(stingGain).connect(c.destination);
	sting.start(now);
	sting.stop(now + 0.1);

	// Glass-shatter noise through highpass
	const noiseSrc = c.createBufferSource();
	noiseSrc.buffer = noiseBuffer(c, 0.18);
	const hp = c.createBiquadFilter();
	hp.type = 'highpass';
	hp.frequency.setValueAtTime(4000, now);
	hp.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
	hp.Q.setValueAtTime(2, now);
	const noiseGain = c.createGain();
	noiseGain.gain.setValueAtTime(0.18, now);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
	noiseSrc.connect(hp).connect(noiseGain).connect(c.destination);
	noiseSrc.start(now);

	// Descending "oof" tone
	const oof = c.createOscillator();
	const oofGain = c.createGain();
	oof.type = 'triangle';
	oof.frequency.setValueAtTime(400, now + 0.04);
	oof.frequency.exponentialRampToValueAtTime(120, now + 0.25);
	oofGain.gain.setValueAtTime(0, now);
	oofGain.gain.linearRampToValueAtTime(0.25, now + 0.05);
	oofGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
	oof.connect(oofGain).connect(c.destination);
	oof.start(now + 0.03);
	oof.stop(now + 0.3);
}

// ============================================================
// BOSS WIN (victory stinger)
// Ascending 4-note fanfare: C5, E5, G5, C6.
// Triumphant, with a held final note + harmonic. ~700ms.
// ============================================================

export function playBossWin(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;
	const now = c.currentTime;

	const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
	const spacing = 0.12;

	notes.forEach((freq, i) => {
		const osc = c.createOscillator();
		const gain = c.createGain();
		const start = now + i * spacing;
		const dur = i === notes.length - 1 ? 0.4 : 0.15;

		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, start);
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
		gain.gain.setValueAtTime(0.3, start + dur * 0.6);
		gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

		osc.connect(gain).connect(c.destination);
		osc.start(start);
		osc.stop(start + dur + 0.05);

		// Harmonic shimmer on the final note
		if (i === notes.length - 1) {
			const harm = c.createOscillator();
			const harmGain = c.createGain();
			harm.type = 'triangle';
			harm.frequency.setValueAtTime(freq * 2, start);
			harmGain.gain.setValueAtTime(0.08, start);
			harmGain.gain.exponentialRampToValueAtTime(0.001, start + dur);
			harm.connect(harmGain).connect(c.destination);
			harm.start(start);
			harm.stop(start + dur + 0.05);
		}
	});
}

// ============================================================
// BOSS LOSS (defeat sting)
// Descending 3-note doom: E4, C4, A3, with sawtooth grime.
// Low rumble underneath. ~900ms.
// ============================================================

export function playBossLoss(): void {
	if (isSfxMuted()) return;
	const c = getCtx();
	if (!c) return;
	const now = c.currentTime;

	const notes = [330, 262, 220]; // E4, C4, A3
	const spacing = 0.2;

	notes.forEach((freq, i) => {
		const osc = c.createOscillator();
		const gain = c.createGain();
		const start = now + i * spacing;
		const dur = i === notes.length - 1 ? 0.5 : 0.22;

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(freq, start);
		// Slight pitch droop on each note for hopelessness
		osc.frequency.exponentialRampToValueAtTime(freq * 0.95, start + dur);
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
		gain.gain.setValueAtTime(0.2, start + dur * 0.5);
		gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

		osc.connect(gain).connect(c.destination);
		osc.start(start);
		osc.stop(start + dur + 0.05);
	});

	// Low rumble underneath
	const rumble = c.createOscillator();
	const rumbleGain = c.createGain();
	rumble.type = 'sine';
	rumble.frequency.setValueAtTime(55, now);
	rumbleGain.gain.setValueAtTime(0.15, now);
	rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
	rumble.connect(rumbleGain).connect(c.destination);
	rumble.start(now);
	rumble.stop(now + 1);
}

// ============================================================
// TENSION DRONE (ambient during fight)
// Two sine oscillators forming a low fifth (A1 + E2).
// As boss HP drops: volume increases, second oscillator
// detunes toward a tritone for increasing dissonance.
// ============================================================

let tensionOsc1: OscillatorNode | null = null;
let tensionOsc2: OscillatorNode | null = null;
let tensionMasterGain: GainNode | null = null;
let tensionOsc2Gain: GainNode | null = null;

export function startBossTension(): void {
	if (isSfxMuted()) return;
	stopBossTension();
	const c = getCtx();
	if (!c) return;

	tensionMasterGain = c.createGain();
	tensionMasterGain.gain.setValueAtTime(0, c.currentTime);
	tensionMasterGain.gain.linearRampToValueAtTime(0.04, c.currentTime + 1.5);
	tensionMasterGain.connect(c.destination);

	// Base: A1 (55 Hz)
	tensionOsc1 = c.createOscillator();
	tensionOsc1.type = 'sine';
	tensionOsc1.frequency.setValueAtTime(55, c.currentTime);
	tensionOsc1.connect(tensionMasterGain);
	tensionOsc1.start();

	// Harmonic: perfect fifth above (E2, 82.41 Hz), slightly flat for unease
	tensionOsc2 = c.createOscillator();
	tensionOsc2.type = 'sine';
	tensionOsc2.frequency.setValueAtTime(82, c.currentTime);
	tensionOsc2Gain = c.createGain();
	tensionOsc2Gain.gain.setValueAtTime(0.5, c.currentTime);
	tensionOsc2.connect(tensionOsc2Gain).connect(tensionMasterGain);
	tensionOsc2.start();
}

export function updateBossTension(hpPercent: number): void {
	// Kill drone if muted mid-fight
	if (isSfxMuted()) {
		stopBossTension();
		return;
	}
	if (!tensionMasterGain || !tensionOsc2) return;
	const c = getCtx();
	if (!c) return;

	// intensity: 0 at full HP, 1 at 0 HP
	const intensity = 1 - Math.max(0, Math.min(hpPercent, 100)) / 100;

	// Volume: 0.04 (calm) to 0.10 (danger)
	const targetGain = 0.04 + intensity * 0.06;
	tensionMasterGain.gain.setTargetAtTime(targetGain, c.currentTime, 0.5);

	// Detune second osc from perfect fifth (82 Hz) toward tritone (~77 Hz)
	const detuneTarget = 82 - intensity * 5;
	tensionOsc2.frequency.setTargetAtTime(detuneTarget, c.currentTime, 0.3);
}

export function stopBossTension(): void {
	const c = getCtx();
	if (tensionMasterGain && c) {
		try {
			tensionMasterGain.gain.setTargetAtTime(0, c.currentTime, 0.3);
		} catch {
			// Node may already be disconnected
		}
	}
	setTimeout(() => {
		try {
			tensionOsc1?.stop();
		} catch {
			/* already stopped */
		}
		try {
			tensionOsc2?.stop();
		} catch {
			/* already stopped */
		}
		tensionOsc1 = null;
		tensionOsc2 = null;
		tensionMasterGain = null;
		tensionOsc2Gain = null;
	}, 500);
}
