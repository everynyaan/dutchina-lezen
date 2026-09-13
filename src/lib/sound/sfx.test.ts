import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { playSfx, setSfxMuted, isSfxMuted } from '$lib/sound/sfx';

describe('SFX module', () => {
	beforeEach(() => {
		setSfxMuted(false);
	});

	it('starts unmuted', () => {
		expect(isSfxMuted()).toBe(false);
	});

	it('toggles mute state', () => {
		setSfxMuted(true);
		expect(isSfxMuted()).toBe(true);
		setSfxMuted(false);
		expect(isSfxMuted()).toBe(false);
	});

	it('does not throw when playing any event (even without AudioContext)', () => {
		// In the test environment there may not be a real AudioContext.
		// The module should handle this gracefully (return early, no crash).
		const events = [
			'correct',
			'wrong',
			'lp_gain',
			'tier_up',
			'rank_up',
			'boss_loss',
			'card_flip',
			'mission_complete'
		] as const;

		for (const event of events) {
			expect(() => playSfx(event)).not.toThrow();
		}
	});

	it('does not throw when muted', () => {
		setSfxMuted(true);
		expect(() => playSfx('correct')).not.toThrow();
		expect(() => playSfx('rank_up')).not.toThrow();
	});
});

// Unique paths declared in SAMPLE_PATHS (kuromi_appear + sticker_send share one).
const UNIQUE_SAMPLE_PATHS = [
	'/sfx/button_tap.mp3',
	'/sfx/tab_switch.mp3',
	'/sfx/correct.mp3',
	'/sfx/wrong.mp3',
	'/sfx/streak_pip.mp3',
	'/sfx/rank_up.mp3',
	'/sfx/kuromi_appear.mp3',
	'/sfx/chat_message_in.mp3',
	'/sfx/lp_gain.mp3',
	'/sfx/session_complete.mp3',
	'/sfx/daily_homework_complete.mp3'
];

type Deferred<T> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
};

function deferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('SFX sample-vs-synth discipline', () => {
	type FakeBufferSource = {
		buffer: unknown;
		playbackRate: { value: number };
		connect: ReturnType<typeof vi.fn>;
		start: ReturnType<typeof vi.fn>;
	};

	type FakeOscillator = {
		type: string;
		frequency: {
			setValueAtTime: ReturnType<typeof vi.fn>;
			exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
		};
		connect: ReturnType<typeof vi.fn>;
		start: ReturnType<typeof vi.fn>;
		stop: ReturnType<typeof vi.fn>;
	};

	let fetchDeferreds: Map<string, Deferred<Response>>;
	let fetchMock: ReturnType<typeof vi.fn>;
	let bufferSourceStarts: ReturnType<typeof vi.fn>[];
	let bufferSources: FakeBufferSource[];
	let oscillatorStarts: ReturnType<typeof vi.fn>[];
	let oscillators: FakeOscillator[];
	let createBufferSource: ReturnType<typeof vi.fn>;
	let createOscillator: ReturnType<typeof vi.fn>;
	let decodeAudioData: ReturnType<typeof vi.fn>;
	let fakeBuffer: { duration: number };
	let originalWindow: unknown;
	let originalAudioContext: unknown;
	let originalFetch: typeof globalThis.fetch | undefined;

	function installFakes() {
		bufferSourceStarts = [];
		bufferSources = [];
		oscillatorStarts = [];
		oscillators = [];
		fakeBuffer = { duration: 0.1 };

		const gainParam = () => ({
			value: 0,
			setValueAtTime: vi.fn(),
			linearRampToValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn(),
			setTargetAtTime: vi.fn()
		});

		const makeGain = () => {
			const node = {
				gain: gainParam(),
				connect: vi.fn(function (this: unknown, dest: unknown) {
					return dest ?? this;
				})
			};
			return node;
		};

		createBufferSource = vi.fn(() => {
			const start = vi.fn();
			bufferSourceStarts.push(start);
			const src: FakeBufferSource = {
				buffer: null,
				playbackRate: { value: 1 },
				connect: vi.fn(function (this: unknown, dest: unknown) {
					return dest ?? this;
				}),
				start
			};
			bufferSources.push(src);
			return src;
		});

		createOscillator = vi.fn(() => {
			const start = vi.fn();
			oscillatorStarts.push(start);
			const osc: FakeOscillator = {
				type: 'sine',
				frequency: {
					setValueAtTime: vi.fn(),
					exponentialRampToValueAtTime: vi.fn()
				},
				connect: vi.fn(function (this: unknown, dest: unknown) {
					return dest ?? this;
				}),
				start,
				stop: vi.fn()
			};
			oscillators.push(osc);
			return osc;
		});

		decodeAudioData = vi.fn(() => Promise.resolve(fakeBuffer));

		class FakeAudioContext {
			currentTime = 0;
			sampleRate = 44100;
			state = 'running';
			destination = {};
			createGain = vi.fn(makeGain);
			createBufferSource = createBufferSource;
			createOscillator = createOscillator;
			createBiquadFilter = vi.fn(() => ({
				type: 'lowpass',
				frequency: gainParam(),
				Q: gainParam(),
				connect: vi.fn(function (this: unknown, dest: unknown) {
					return dest ?? this;
				})
			}));
			createBuffer = vi.fn((_channels: number, length: number) => ({
				getChannelData: () => new Float32Array(length)
			}));
			decodeAudioData = decodeAudioData;
			resume = vi.fn(() => Promise.resolve());
		}

		originalWindow = (globalThis as { window?: unknown }).window;
		originalAudioContext = (globalThis as { AudioContext?: unknown }).AudioContext;
		originalFetch = globalThis.fetch;

		(globalThis as { window: unknown }).window = globalThis;
		(globalThis as { AudioContext: unknown }).AudioContext = FakeAudioContext;

		fetchDeferreds = new Map();
		fetchMock = vi.fn((url: string) => {
			const d = deferred<Response>();
			fetchDeferreds.set(String(url), d);
			return d.promise;
		});
		globalThis.fetch = fetchMock as unknown as typeof fetch;
	}

	function resolveOk(path: string) {
		const d = fetchDeferreds.get(path);
		if (!d) throw new Error(`no deferred fetch for ${path}`);
		d.resolve({
			ok: true,
			arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
		} as Response);
	}

	function resolveFail(path: string) {
		const d = fetchDeferreds.get(path);
		if (!d) throw new Error(`no deferred fetch for ${path}`);
		d.resolve({ ok: false } as Response);
	}

	function rejectFetch(path: string) {
		const d = fetchDeferreds.get(path);
		if (!d) throw new Error(`no deferred fetch for ${path}`);
		d.reject(new Error('network error'));
	}

	async function flushMicrotasks() {
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
	}

	async function importSfx() {
		vi.resetModules();
		installFakes();
		return await import('$lib/sound/sfx');
	}

	afterEach(() => {
		vi.useRealTimers();
		if (originalWindow === undefined) {
			delete (globalThis as { window?: unknown }).window;
		} else {
			(globalThis as { window: unknown }).window = originalWindow;
		}
		if (originalAudioContext === undefined) {
			delete (globalThis as { AudioContext?: unknown }).AudioContext;
		} else {
			(globalThis as { AudioContext: unknown }).AudioContext = originalAudioContext;
		}
		if (originalFetch === undefined) {
			delete (globalThis as { fetch?: unknown }).fetch;
		} else {
			globalThis.fetch = originalFetch;
		}
	});

	it('cache miss waits for sample and never fires synth for that call', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');

		// Still loading: neither sample nor synth should have started.
		expect(bufferSourceStarts.every((s) => s.mock.calls.length === 0)).toBe(true);
		expect(oscillatorStarts.every((s) => s.mock.calls.length === 0)).toBe(true);
		expect(createOscillator).not.toHaveBeenCalled();

		resolveOk('/sfx/button_tap.mp3');
		await flushMicrotasks();

		expect(createBufferSource).toHaveBeenCalled();
		expect(bufferSourceStarts.some((s) => s.mock.calls.length > 0)).toBe(true);
		expect(createOscillator).not.toHaveBeenCalled();
	});

	it('permanent load failure falls back to synth, and again on later calls', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');
		expect(createOscillator).not.toHaveBeenCalled();

		resolveFail('/sfx/button_tap.mp3');
		await flushMicrotasks();

		expect(createOscillator).toHaveBeenCalled();
		const oscCallsAfterFirst = createOscillator.mock.calls.length;
		expect(oscCallsAfterFirst).toBeGreaterThan(0);

		// Failure is remembered: subsequent call plays synth synchronously.
		sfx.playSfx('button_tap');
		expect(createOscillator.mock.calls.length).toBeGreaterThan(oscCallsAfterFirst);
	});

	it('rejected fetch also falls back to synth on a later call', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');
		// Must not fall through to synth while the load is still in flight.
		expect(createOscillator).not.toHaveBeenCalled();

		rejectFetch('/sfx/button_tap.mp3');
		await flushMicrotasks();

		const afterFail = createOscillator.mock.calls.length;
		expect(afterFail).toBeGreaterThan(0);

		sfx.playSfx('button_tap');
		expect(createOscillator.mock.calls.length).toBeGreaterThan(afterFail);
	});

	it('resolution after 1000 ms plays nothing (neither sample nor synth)', async () => {
		vi.useFakeTimers();
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');
		vi.advanceTimersByTime(1001);

		resolveOk('/sfx/button_tap.mp3');
		await flushMicrotasks();

		expect(createOscillator).not.toHaveBeenCalled();
		expect(bufferSourceStarts.every((s) => s.mock.calls.length === 0)).toBe(true);
	});

	it('muting between call and resolution suppresses playback', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');
		sfx.setSfxMuted(true);

		resolveOk('/sfx/button_tap.mp3');
		await flushMicrotasks();

		expect(createOscillator).not.toHaveBeenCalled();
		expect(bufferSourceStarts.every((s) => s.mock.calls.length === 0)).toBe(true);
	});

	it('cache hit plays synchronously with no additional fetch', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');
		const fetchesAfterFirst = fetchMock.mock.calls.length;

		resolveOk('/sfx/button_tap.mp3');
		await flushMicrotasks();
		expect(bufferSourceStarts.some((s) => s.mock.calls.length > 0)).toBe(true);

		const startsBeforeHit = bufferSourceStarts.filter((s) => s.mock.calls.length > 0).length;
		sfx.playSfx('button_tap');

		expect(fetchMock.mock.calls.length).toBe(fetchesAfterFirst);
		expect(bufferSourceStarts.filter((s) => s.mock.calls.length > 0).length).toBe(
			startsBeforeHit + 1
		);
		expect(createOscillator).not.toHaveBeenCalled();
	});

	it('getCtx preloads every unique SAMPLE_PATHS entry without playing audio', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');

		const fetched = new Set(fetchMock.mock.calls.map((c) => String(c[0])));
		for (const path of UNIQUE_SAMPLE_PATHS) {
			expect(fetched.has(path)).toBe(true);
		}
		expect(fetched.size).toBe(UNIQUE_SAMPLE_PATHS.length);

		// Preload + in-flight playSampleOrSynth must not start anything yet.
		expect(bufferSourceStarts.every((s) => s.mock.calls.length === 0)).toBe(true);
		expect(oscillatorStarts.every((s) => s.mock.calls.length === 0)).toBe(true);
		expect(createOscillator).not.toHaveBeenCalled();
	});

	async function resolveStreakPipSample(sfx: typeof import('$lib/sound/sfx')): Promise<void> {
		// Touch getCtx via any play so preloads kick off (streak_pip included).
		sfx.playSfx('button_tap');
		resolveOk('/sfx/button_tap.mp3');
		resolveOk('/sfx/streak_pip.mp3');
		for (const path of UNIQUE_SAMPLE_PATHS) {
			if (path === '/sfx/button_tap.mp3' || path === '/sfx/streak_pip.mp3') continue;
			if (fetchDeferreds.has(path)) resolveOk(path);
		}
		await flushMicrotasks();
		createBufferSource.mockClear();
		createOscillator.mockClear();
		bufferSourceStarts.length = 0;
		bufferSources.length = 0;
		oscillatorStarts.length = 0;
		oscillators.length = 0;
	}

	it('playStreakPip plays the sample (not synth) once streak_pip.mp3 is loaded', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);
		await resolveStreakPipSample(sfx);

		sfx.playStreakPip(2);

		expect(createBufferSource).toHaveBeenCalled();
		expect(bufferSourceStarts.some((s) => s.mock.calls.length > 0)).toBe(true);
		expect(createOscillator).not.toHaveBeenCalled();
	});

	it('playStreakPip playbackRate scales with streak and clamps at 2.0', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);
		await resolveStreakPipSample(sfx);

		sfx.playStreakPip(2);
		expect(bufferSources[bufferSources.length - 1]?.playbackRate.value).toBe(1.5);

		sfx.playStreakPip(4);
		expect(bufferSources[bufferSources.length - 1]?.playbackRate.value).toBe(2.0);

		sfx.playStreakPip(10);
		expect(bufferSources[bufferSources.length - 1]?.playbackRate.value).toBe(2.0);
	});

	it('playStreakPip uses 1.0x for streak 0 and negative streak', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);
		await resolveStreakPipSample(sfx);

		sfx.playStreakPip(0);
		// rate === 1 leaves the default playbackRate untouched
		expect(bufferSources[bufferSources.length - 1]?.playbackRate.value).toBe(1);

		sfx.playStreakPip(-3);
		expect(bufferSources[bufferSources.length - 1]?.playbackRate.value).toBe(1);
	});

	it('playStreakPip falls back to synth with escalating frequency on permanent failure', async () => {
		const sfx = await importSfx();
		sfx.setSfxMuted(false);

		sfx.playSfx('button_tap');
		resolveFail('/sfx/streak_pip.mp3');
		resolveOk('/sfx/button_tap.mp3');
		for (const path of UNIQUE_SAMPLE_PATHS) {
			if (path === '/sfx/button_tap.mp3' || path === '/sfx/streak_pip.mp3') continue;
			if (fetchDeferreds.has(path)) resolveOk(path);
		}
		await flushMicrotasks();
		createBufferSource.mockClear();
		createOscillator.mockClear();
		bufferSources.length = 0;
		oscillators.length = 0;

		sfx.playStreakPip(3);

		expect(createOscillator).toHaveBeenCalled();
		expect(createBufferSource).not.toHaveBeenCalled();
		const osc = oscillators[0];
		expect(osc).toBeDefined();
		expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(1400, expect.any(Number));
	});
});
