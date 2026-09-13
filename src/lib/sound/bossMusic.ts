// ============================================================
// DUTCHINA BOSS MUSIC MODULE
// Looping MP3 soundtrack for boss fights.
// Uses HTML Audio element, not Web Audio API.
// Respects the global SFX mute state.
// Does NOT use the Dexie audio cache (that's for TTS).
// ============================================================

import { isSfxMuted } from './sfx';

let audio: HTMLAudioElement | null = null;
let fadeInterval: ReturnType<typeof setInterval> | null = null;
const TARGET_VOLUME = 0.4;

function clearFade(): void {
	if (fadeInterval) {
		clearInterval(fadeInterval);
		fadeInterval = null;
	}
}

/**
 * Start the boss fight soundtrack. Fades in over ~1 second.
 * @param soundtrackPath - path to the MP3 in static/bosses/
 * If already playing the same track, does nothing.
 * If muted, creates the element but doesn't play (so unmuting mid-fight works).
 */
export function startBossMusic(soundtrackPath: string): void {
	if (typeof window === 'undefined') return;

	// Already playing the same track
	if (audio && !audio.paused && audio.src.endsWith(soundtrackPath)) return;

	// Different track or no audio: stop old, create new
	if (audio) {
		clearFade();
		audio.pause();
		audio = null;
	}

	audio = new Audio(soundtrackPath);
	audio.loop = true;
	audio.preload = 'auto';

	if (isSfxMuted()) {
		// Don't play, but keep the element ready
		audio.volume = 0;
		return;
	}

	clearFade();
	audio.volume = 0;
	audio.currentTime = 0;
	audio.play().catch(() => {
		// Autoplay blocked, will retry on next user interaction
	});

	// Fade in: 0 -> TARGET_VOLUME over ~1s (20 steps at 50ms)
	const step = TARGET_VOLUME / 20;
	fadeInterval = setInterval(() => {
		if (!audio) {
			clearFade();
			return;
		}
		const next = Math.min(audio.volume + step, TARGET_VOLUME);
		audio.volume = next;
		if (next >= TARGET_VOLUME) clearFade();
	}, 50);
}

/**
 * Stop the boss fight soundtrack. Fades out over ~1.5s then pauses.
 * If not playing, does nothing.
 */
export function stopBossMusic(): void {
	if (!audio || audio.paused) {
		// Clean up even if paused
		clearFade();
		audio = null;
		return;
	}

	clearFade();

	const currentVol = audio.volume;
	if (currentVol <= 0) {
		audio.pause();
		audio = null;
		return;
	}

	// Fade out: current -> 0 over ~1.5s (30 steps at 50ms)
	const step = currentVol / 30;
	fadeInterval = setInterval(() => {
		if (!audio) {
			clearFade();
			return;
		}
		const next = Math.max(audio.volume - step, 0);
		audio.volume = next;
		if (next <= 0) {
			clearFade();
			audio.pause();
			audio = null;
		}
	}, 50);
}

/**
 * Called when SFX mute state changes mid-fight.
 * If unmuted and music was supposed to be playing, start it.
 * If muted, pause immediately.
 */
export function syncBossMusicMute(): void {
	if (!audio) return;

	if (isSfxMuted()) {
		clearFade();
		audio.pause();
	} else if (audio.paused) {
		// Was paused due to mute, resume with fade
		audio.volume = 0;
		audio.play().catch(() => {});
		const step = TARGET_VOLUME / 20;
		fadeInterval = setInterval(() => {
			if (!audio) {
				clearFade();
				return;
			}
			const next = Math.min(audio.volume + step, TARGET_VOLUME);
			audio.volume = next;
			if (next >= TARGET_VOLUME) clearFade();
		}, 50);
	}
}
