import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	addToast,
	dismissToast,
	pauseToast,
	resumeToast,
	subscribe,
	TOAST_LIFETIME_MS,
	ACTION_TOAST_LIFETIME_MS,
	type ToastItem
} from './toastStore';

function snapshotToasts(): ToastItem[] {
	let items: ToastItem[] = [];
	const unsub = subscribe((t) => {
		items = t;
	});
	unsub();
	return items;
}

function clearAllToasts(): void {
	const items = snapshotToasts();
	for (const t of items) {
		dismissToast(t.id);
	}
	// Flush fade-out remove timers so the queue is empty for the next test.
	vi.runAllTimers();
}

describe('toastStore', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Node has no rAF; toastStore calls it for fade-in. Route through fake timers.
		vi.stubGlobal(
			'requestAnimationFrame',
			(cb: FrameRequestCallback): number =>
				setTimeout(() => cb(Date.now()), 16) as unknown as number
		);
		vi.stubGlobal('cancelAnimationFrame', (id: number): void => {
			clearTimeout(id);
		});
		clearAllToasts();
	});

	afterEach(() => {
		clearAllToasts();
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('action toast uses ACTION_TOAST_LIFETIME_MS; plain toast uses TOAST_LIFETIME_MS', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		addToast('with action', 'var(--color-lavender-deep)', {
			label: 'Undo',
			run: () => true
		});
		expect(latest.length).toBe(1);
		expect(latest[0].lifetime).toBe(ACTION_TOAST_LIFETIME_MS);
		expect(latest[0].action).toEqual({ label: 'Undo', run: expect.any(Function) });

		addToast('plain toast');
		expect(latest.length).toBe(2);
		expect(latest[1].lifetime).toBe(TOAST_LIFETIME_MS);
		expect(latest[1].action).toBeUndefined();

		unsub();
	});

	it('dismissToast removes the toast and cancels its pending timers', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		addToast('early dismiss', 'var(--color-lavender-deep)', {
			label: 'Undo',
			run: () => true
		});
		expect(latest.length).toBe(1);
		const id = latest[0].id;

		dismissToast(id);

		// Immediately after dismiss: toast is fading (still present, visible false)
		// or already on the remove path — either way it must not stay actionable forever.
		const afterDismiss = latest.find((t) => t.id === id);
		expect(afterDismiss).toBeDefined();
		expect(afterDismiss!.visible).toBe(false);

		// Advance well past action lifetime + fade. Cancelled hideTimer must not
		// throw or resurrect the toast; the fade removeTimer should finish cleanup.
		vi.advanceTimersByTime(ACTION_TOAST_LIFETIME_MS + 10_000);
		expect(latest.find((t) => t.id === id)).toBeUndefined();
		expect(latest.length).toBe(0);

		// Fresh toast afterward: queue stays correct, no stray timer side effects.
		addToast('after cleanup');
		expect(latest.length).toBe(1);
		expect(latest[0].message).toBe('after cleanup');
		expect(latest[0].lifetime).toBe(TOAST_LIFETIME_MS);
		expect(latest[0].id).not.toBe(id);

		unsub();
	});

	it('addToast is backward compatible with 1-arg and 2-arg calls', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		expect(() => addToast('message only')).not.toThrow();
		expect(latest.length).toBe(1);
		expect(latest[0].message).toBe('message only');
		expect(latest[0].color).toBe('var(--color-lavender-deep)');
		expect(latest[0].lifetime).toBe(TOAST_LIFETIME_MS);
		expect(latest[0].action).toBeUndefined();

		expect(() => addToast('message and color', 'var(--color-peach-deep)')).not.toThrow();
		expect(latest.length).toBe(2);
		expect(latest[1].message).toBe('message and color');
		expect(latest[1].color).toBe('var(--color-peach-deep)');
		expect(latest[1].lifetime).toBe(TOAST_LIFETIME_MS);
		expect(latest[1].action).toBeUndefined();

		unsub();
	});

	it('ACTION_TOAST_LIFETIME_MS equals 30000', () => {
		expect(ACTION_TOAST_LIFETIME_MS).toBe(30000);
	});

	it('pauseToast prevents auto-dismiss; resumeToast continues and dismisses', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		addToast('paused action', 'var(--color-lavender-deep)', {
			label: 'Undo',
			run: () => true
		});
		vi.advanceTimersByTime(16); // fade-in rAF
		const id = latest[0].id;
		expect(latest[0].visible).toBe(true);

		pauseToast(id);
		expect(latest.find((t) => t.id === id)?.paused).toBe(true);

		// Well past full lifetime while paused — must still be present.
		vi.advanceTimersByTime(ACTION_TOAST_LIFETIME_MS + 50_000);
		expect(latest.find((t) => t.id === id)).toBeDefined();
		expect(latest.find((t) => t.id === id)?.visible).toBe(true);

		resumeToast(id);
		expect(latest.find((t) => t.id === id)?.paused).toBe(false);

		// Remaining nearly full lifetime + fade buffer should remove it.
		vi.advanceTimersByTime(ACTION_TOAST_LIFETIME_MS + 500);
		expect(latest.find((t) => t.id === id)).toBeUndefined();

		unsub();
	});

	it('pause then resume preserves remaining time', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		addToast('remaining time', 'var(--color-lavender-deep)', {
			label: 'Undo',
			run: () => true
		});
		vi.advanceTimersByTime(16);
		const id = latest[0].id;

		vi.advanceTimersByTime(10_000);
		pauseToast(id);
		expect(latest.find((t) => t.id === id)).toBeDefined();

		// 50s while paused must not dismiss.
		vi.advanceTimersByTime(50_000);
		expect(latest.find((t) => t.id === id)).toBeDefined();
		expect(latest.find((t) => t.id === id)?.visible).toBe(true);

		resumeToast(id);

		// Remaining ~20000ms: still present just before.
		vi.advanceTimersByTime(19_000);
		expect(latest.find((t) => t.id === id)).toBeDefined();

		// Remaining + fade buffer: gone.
		vi.advanceTimersByTime(1_000 + 500);
		expect(latest.find((t) => t.id === id)).toBeUndefined();

		unsub();
	});

	it('pauseToast and resumeToast on nonexistent id do not throw', () => {
		expect(() => pauseToast(99999)).not.toThrow();
		expect(() => resumeToast(99999)).not.toThrow();

		addToast('temp', 'var(--color-lavender-deep)', { label: 'Undo', run: () => true });
		const id = snapshotToasts()[0].id;
		dismissToast(id);
		vi.advanceTimersByTime(500);
		expect(snapshotToasts().find((t) => t.id === id)).toBeUndefined();

		expect(() => pauseToast(id)).not.toThrow();
		expect(() => resumeToast(id)).not.toThrow();
	});

	it('pauseToast twice and resumeToast on running toast are idempotent', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		addToast('idempotent', 'var(--color-lavender-deep)', {
			label: 'Undo',
			run: () => true
		});
		vi.advanceTimersByTime(16);
		const id = latest[0].id;

		// resume on already-running toast: no throw, no early dismiss
		expect(() => resumeToast(id)).not.toThrow();
		expect(latest.find((t) => t.id === id)?.visible).toBe(true);
		expect(latest.find((t) => t.id === id)?.paused).toBeFalsy();

		expect(() => pauseToast(id)).not.toThrow();
		expect(() => pauseToast(id)).not.toThrow();
		expect(latest.find((t) => t.id === id)?.paused).toBe(true);

		// Still present well past lifetime while paused
		vi.advanceTimersByTime(ACTION_TOAST_LIFETIME_MS + 10_000);
		expect(latest.find((t) => t.id === id)).toBeDefined();

		resumeToast(id);
		// Single dismiss schedule: advances once through remaining (~full) + fade
		vi.advanceTimersByTime(ACTION_TOAST_LIFETIME_MS + 500);
		expect(latest.find((t) => t.id === id)).toBeUndefined();

		unsub();
	});

	it('dismissToast removes a currently paused toast with no dangling timer', () => {
		let latest: ToastItem[] = [];
		const unsub = subscribe((t) => {
			latest = t;
		});

		addToast('dismiss while paused', 'var(--color-lavender-deep)', {
			label: 'Undo',
			run: () => true
		});
		vi.advanceTimersByTime(16);
		const id = latest[0].id;

		pauseToast(id);
		expect(latest.find((t) => t.id === id)?.paused).toBe(true);

		dismissToast(id);
		expect(latest.find((t) => t.id === id)?.visible).toBe(false);

		vi.advanceTimersByTime(500);
		expect(latest.find((t) => t.id === id)).toBeUndefined();

		// No stale timer resurrects it even far past original lifetime
		vi.advanceTimersByTime(ACTION_TOAST_LIFETIME_MS + 60_000);
		expect(latest.find((t) => t.id === id)).toBeUndefined();
		expect(latest.length).toBe(0);

		addToast('after paused dismiss');
		expect(latest.length).toBe(1);
		expect(latest[0].message).toBe('after paused dismiss');
		expect(latest[0].id).not.toBe(id);

		unsub();
	});
});
