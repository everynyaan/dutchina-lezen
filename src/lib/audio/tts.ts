// ============================================================
// DUTCHINA TTS MODULE
// Plays Dutch sentences aloud via Google Cloud Text-to-Speech.
// Cached in IndexedDB so repeat plays are instant and free.
// Falls back to browser SpeechSynthesis if no API key or on
// network/quota errors.
//
// Usage:
//   import { speak, stopSpeaking } from '$lib/audio/tts';
//   await speak('Hoe gaat het?', apiKey);
//
// This module never throws. Every failure path is silent to
// the end user. Errors are logged to console for debugging.
// ============================================================

import { getAudio, putAudio, evictOldest } from '$lib/db/db';

const VOICE_NAME = 'nl-NL-Wavenet-B'; // male, natural
const AUDIO_ENCODING = 'MP3';
const LANG_CODE = 'nl-NL';
const CACHE_MAX_MB = 50;

// Active playback tracking for stop functionality
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let speakGeneration = 0;

// Listeners waiting for playback to end
type PlaybackListener = () => void;
let onEndListeners: PlaybackListener[] = [];

/**
 * Register a callback for when playback ends (for UI animations).
 * Returns an unsubscribe function.
 */
export function onPlaybackEnd(fn: PlaybackListener): () => void {
	onEndListeners.push(fn);
	return () => {
		onEndListeners = onEndListeners.filter((f) => f !== fn);
	};
}

function notifyEnd(): void {
	for (const fn of onEndListeners) {
		try {
			fn();
		} catch {
			// never let a listener crash the module
		}
	}
}

/**
 * Generate a SHA-256 hex hash of the input string.
 * Used as the IndexedDB cache key.
 */
async function hashKey(text: string): Promise<string> {
	const input = `${text}|${VOICE_NAME}|${AUDIO_ENCODING}`;
	const encoded = new TextEncoder().encode(input);
	const buffer = await crypto.subtle.digest('SHA-256', encoded);
	const arr = Array.from(new Uint8Array(buffer));
	return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch TTS audio from Google Cloud Text-to-Speech API.
 * Returns an MP3 Blob on success, null on any failure.
 */
async function fetchGoogleTts(text: string, apiKey: string): Promise<Blob | null> {
	const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

	const body = {
		input: { text },
		voice: {
			languageCode: LANG_CODE,
			name: VOICE_NAME
		},
		audioConfig: {
			audioEncoding: AUDIO_ENCODING
		}
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			console.warn(`[dutchina-tts] Google TTS error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();
		if (!data.audioContent) {
			console.warn('[dutchina-tts] Google TTS response missing audioContent');
			return null;
		}

		// audioContent is base64-encoded MP3
		const binaryStr = atob(data.audioContent);
		const bytes = new Uint8Array(binaryStr.length);
		for (let i = 0; i < binaryStr.length; i++) {
			bytes[i] = binaryStr.charCodeAt(i);
		}
		return new Blob([bytes], { type: 'audio/mpeg' });
	} catch (err) {
		console.warn('[dutchina-tts] Google TTS fetch failed:', err);
		return null;
	}
}

/**
 * Play an audio Blob via HTMLAudioElement.
 * Returns a promise that resolves when playback finishes OR is
 * cancelled via stopSpeaking() / pause. The cleanup is guarded so
 * the natural-end "pause then ended" sequence doesn't double-fire.
 */
function playBlob(blob: Blob, rate: number = 1): Promise<void> {
	return new Promise<void>((resolve) => {
		const url = URL.createObjectURL(blob);
		const audio = new Audio(url);
		audio.playbackRate = rate;
		currentAudio = audio;

		let cleaned = false;
		const cleanup = () => {
			if (cleaned) return;
			cleaned = true;
			URL.revokeObjectURL(url);
			if (currentAudio === audio) currentAudio = null;
			notifyEnd();
			resolve();
		};

		// 'pause' fires both at natural end (browser auto-pauses) and
		// when stopSpeaking() calls audio.pause() mid-playback. Either
		// way, we want the promise to resolve so awaiters can move on.
		audio.addEventListener('pause', cleanup, { once: true });
		audio.addEventListener('ended', cleanup, { once: true });
		audio.addEventListener('error', cleanup, { once: true });

		audio.play().catch(() => {
			cleanup();
		});
	});
}

/**
 * Fallback: play text using browser SpeechSynthesis.
 * Returns a promise that resolves when speech finishes OR is
 * cancelled. Same idempotent cleanup pattern as playBlob.
 */
function playSpeechSynthesis(text: string, rate: number = 1): Promise<void> {
	return new Promise<void>((resolve) => {
		if (typeof window === 'undefined' || !window.speechSynthesis) {
			resolve();
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = LANG_CODE;
		utterance.rate = rate * 0.9; // base rate is 0.9 for learners, scale from there
		currentUtterance = utterance;

		let cleaned = false;
		const cleanup = () => {
			if (cleaned) return;
			cleaned = true;
			if (currentUtterance === utterance) currentUtterance = null;
			notifyEnd();
			resolve();
		};

		utterance.onend = cleanup;
		utterance.onerror = cleanup;

		// Safety net: some browsers don't fire onend on cancel.
		// Poll the speaking flag after start; resolve when it falls.
		const safetyId = setInterval(() => {
			if (!window.speechSynthesis.speaking) {
				clearInterval(safetyId);
				cleanup();
			}
		}, 250);
		const origCleanup = cleanup;
		const wrapped = () => {
			clearInterval(safetyId);
			origCleanup();
		};
		utterance.onend = wrapped;
		utterance.onerror = wrapped;

		window.speechSynthesis.speak(utterance);
	});
}

/**
 * Speak a Dutch sentence aloud.
 *
 * 1. Check IndexedDB cache for a previously fetched audio Blob.
 * 2. On cache miss, call Google Cloud TTS if apiKey is provided.
 * 3. On any failure, fall back to browser SpeechSynthesis.
 *
 * Never throws. All errors are logged and silently handled.
 *
 * @param text  The Dutch text to speak.
 * @param apiKey  Google Cloud TTS API key, or null to skip Google TTS.
 * @param rate  Playback speed multiplier. 1 = normal, 0.7 = slow. Default 1.
 */
export async function speak(text: string, apiKey: string | null, rate: number = 1): Promise<void> {
	if (!text.trim()) return;

	// Stop any current playback first
	stopSpeaking();
	const myGen = speakGeneration;

	try {
		const hash = await hashKey(text);

		// 1. Try cache
		const cached = await getAudio(hash);
		if (cached) {
			if (myGen !== speakGeneration) return;
			await playBlob(cached, rate);
			return;
		}

		// 2. Try Google TTS
		if (apiKey) {
			const blob = await fetchGoogleTts(text, apiKey);
			if (blob) {
				// Cache it, then play
				await putAudio(hash, blob);
				// Evict in background if cache is too large
				evictOldest(CACHE_MAX_MB).catch(() => {});
				if (myGen !== speakGeneration) return;
				await playBlob(blob, rate);
				return;
			}
		}

		// 3. Fallback to SpeechSynthesis
		if (myGen !== speakGeneration) return;
		await playSpeechSynthesis(text, rate);
	} catch (err) {
		console.warn('[dutchina-tts] speak() failed silently:', err);
		// Last resort fallback
		try {
			await playSpeechSynthesis(text, rate);
		} catch {
			// truly silent
		}
	}
}

/**
 * Stop any currently playing audio.
 */
export function stopSpeaking(): void {
	speakGeneration++;

	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		// The 'ended' or 'error' handler on the audio element
		// will clean up and call notifyEnd()
		currentAudio = null;
		notifyEnd();
	}

	if (currentUtterance) {
		window.speechSynthesis?.cancel();
		currentUtterance = null;
		notifyEnd();
	}
}
