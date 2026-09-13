// ============================================================
// DUTCHINA EFFECT STORE
// Allows any component to trigger visual effects globally.
// Supports one-shot effects and looping effects that persist
// until dismissed (e.g. fireworks on rank-up).
//
// Usage:
//   import { triggerEffect, startLoop, stopLoop } from '$lib/effects/effectStore';
//   triggerEffect('confetti');        // one-shot
//   startLoop('fireworks');           // loops until stopLoop()
// ============================================================

import type { EffectType } from './particles';

type EffectListener = (effect: EffectType) => void;
type LoopListener = (effect: EffectType | null) => void;

let effectListeners: EffectListener[] = [];
let loopListeners: LoopListener[] = [];

/** Fire a one-shot effect. */
export function triggerEffect(effect: EffectType): void {
	for (const fn of effectListeners) {
		try {
			fn(effect);
		} catch {
			/* */
		}
	}
}

/** Start a looping effect. Persists until stopLoop() is called. */
export function startLoop(effect: EffectType): void {
	for (const fn of loopListeners) {
		try {
			fn(effect);
		} catch {
			/* */
		}
	}
}

/** Stop the current looping effect. */
export function stopLoop(): void {
	for (const fn of loopListeners) {
		try {
			fn(null);
		} catch {
			/* */
		}
	}
}

export function onEffect(fn: EffectListener): () => void {
	effectListeners.push(fn);
	return () => {
		effectListeners = effectListeners.filter((f) => f !== fn);
	};
}

export function onLoop(fn: LoopListener): () => void {
	loopListeners.push(fn);
	return () => {
		loopListeners = loopListeners.filter((f) => f !== fn);
	};
}
