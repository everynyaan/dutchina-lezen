<script lang="ts">
	import { onMount } from 'svelte';
	import { createParticleEngine } from '$lib/effects/particles';
	import { onEffect, onLoop, stopLoop } from '$lib/effects/effectStore';
	import { isSfxMuted } from '$lib/sound/sfx';
	import type { ParticleEngine, EffectType } from '$lib/effects/particles';

	let canvas: HTMLCanvasElement | undefined = $state();
	let engine: ParticleEngine | null = null;
	let rafId: number | null = null;
	let running = false;

	// Loop state
	let loopEffect: EffectType | null = null;
	let loopFrame = 0;
	const LOOP_INTERVAL = 50;

	// Audio context for burst sounds
	let actx: AudioContext | null = null;

	function getCtx(): AudioContext | null {
		if (typeof window === 'undefined') return null;
		if (!actx) {
			try {
				actx = new AudioContext();
			} catch {
				return null;
			}
		}
		if (actx.state === 'suspended') {
			actx.resume().catch(() => {});
		}
		return actx;
	}

	// ---- Ported from original HTML: osc, noiseShot, coin ----

	function osc(freq: number, type: OscillatorType, st: number, dur: number, vol: number) {
		const c = getCtx();
		if (!c) return;
		const o = c.createOscillator();
		const g = c.createGain();
		o.connect(g);
		g.connect(c.destination);
		o.type = type;
		o.frequency.setValueAtTime(freq, st);
		g.gain.setValueAtTime(vol, st);
		g.gain.exponentialRampToValueAtTime(0.001, st + dur);
		o.start(st);
		o.stop(st + dur + 0.05);
	}

	function noiseShot(st: number, dur: number, vol: number, ff: number) {
		const c = getCtx();
		if (!c) return;
		const sz = Math.floor(c.sampleRate * dur);
		const buf = c.createBuffer(1, sz, c.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
		const src = c.createBufferSource();
		src.buffer = buf;
		const flt = c.createBiquadFilter();
		flt.type = 'bandpass';
		flt.frequency.value = ff;
		flt.Q.value = 0.5;
		const g = c.createGain();
		g.gain.setValueAtTime(vol, st);
		g.gain.exponentialRampToValueAtTime(0.001, st + dur);
		src.connect(flt);
		flt.connect(g);
		g.connect(c.destination);
		src.start(st);
		src.stop(st + dur + 0.05);
	}

	/** The casino coin ping: C6 + E6 + C7 + noise sparkle */
	function coin(st: number, vol: number) {
		osc(1047, 'sine', st, 0.04, vol * 0.8);
		osc(1319, 'sine', st + 0.01, 0.05, vol * 0.5);
		osc(2093, 'sine', st + 0.005, 0.02, vol * 0.3);
		noiseShot(st, 0.03, vol * 0.15, 2000);
	}

	// ---- Per-burst sound: coin cascade + short ascending phrase ----

	/** Plays a mini celebration per firework burst. Randomized to avoid repetition. */
	function playBurstSound() {
		if (isSfxMuted()) return;
		const c = getCtx();
		if (!c) return;
		const t = c.currentTime;

		// 2-4 coin pings staggered
		const coinCount = 2 + Math.floor(Math.random() * 3);
		for (let i = 0; i < coinCount; i++) {
			coin(t + i * 0.055, 0.1 + Math.random() * 0.06);
		}

		// Short ascending phrase (2-3 notes from a pool)
		const notePool = [523, 659, 784, 988, 1047, 1175, 1319, 1568];
		const startIdx = Math.floor(Math.random() * (notePool.length - 3));
		const phraseLen = 2 + Math.floor(Math.random() * 2);
		const phraseStart = t + coinCount * 0.055;

		for (let i = 0; i < phraseLen; i++) {
			osc(notePool[startIdx + i], 'sine', phraseStart + i * 0.06, 0.1, 0.12);
		}

		// Tiny noise sparkle
		noiseShot(phraseStart, 0.15, 0.04, 1200 + Math.random() * 800);
	}

	onMount(() => {
		if (!canvas) return;

		const resize = () => {
			if (!canvas) return;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			engine = createParticleEngine(canvas.width, canvas.height);
		};

		resize();
		window.addEventListener('resize', resize);

		const unsubEffect = onEffect((effect) => {
			engine?.fire(effect);
			if (!running) startRaf();
		});

		const unsubLoop = onLoop((effect) => {
			if (effect) {
				loopEffect = effect;
				loopFrame = 0;
				engine?.fire(effect);
				if (!running) startRaf();
			} else {
				loopEffect = null;
			}
		});

		function handleDismiss() {
			if (loopEffect) {
				stopLoop();
				loopEffect = null;
			}
		}

		document.addEventListener('click', handleDismiss, true);
		document.addEventListener('touchstart', handleDismiss, true);

		function startRaf() {
			if (running) return;
			running = true;
			tick();
		}

		function tick() {
			if (!canvas || !engine) {
				running = false;
				return;
			}

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				running = false;
				return;
			}

			if (loopEffect) {
				loopFrame++;
				if (loopFrame % LOOP_INTERVAL === 0) {
					engine.fire(loopEffect);
				}
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			engine.update();

			// Play coin cascade for each burst
			const bursts = engine.popBursts();
			bursts.forEach(() => {
				playBurstSound();
			});

			engine.draw(ctx);

			if (engine.hasParticles() || loopEffect) {
				rafId = requestAnimationFrame(tick);
			} else {
				running = false;
				rafId = null;
			}
		}

		return () => {
			unsubEffect();
			unsubLoop();
			document.removeEventListener('click', handleDismiss, true);
			document.removeEventListener('touchstart', handleDismiss, true);
			window.removeEventListener('resize', resize);
			if (rafId != null) cancelAnimationFrame(rafId);
		};
	});
</script>

<canvas class="particle-overlay" bind:this={canvas}></canvas>

<style>
	.particle-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 150;
	}
</style>
