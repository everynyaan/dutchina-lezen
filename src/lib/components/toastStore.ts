// ============================================================
// TOAST STORE
// Module-level toast queue. Any module can call addToast().
// Toast.svelte reads from this and renders the notifications.
// ============================================================

export interface ToastItem {
	id: number;
	message: string;
	color: string;
	visible: boolean;
	/** Optional action affordance (e.g. Undo). When present, toast uses ACTION_TOAST_LIFETIME_MS. */
	action?: { label: string; run: () => void | boolean };
	/** Per-toast display lifetime in ms. Progress bar and auto-dismiss both use this. */
	lifetime: number;
	/** True while the auto-dismiss countdown is paused (hover/focus). */
	paused?: boolean;
}

// Public lifetime constant so Toast.svelte / callers can size plain toasts.
// Actionable toasts use ACTION_TOAST_LIFETIME_MS instead.
export const TOAST_LIFETIME_MS = 2500;
export const ACTION_TOAST_LIFETIME_MS = 30000;
const FADE_OUT_MS = 300;

// Module-level state. Not reactive on its own.
// Toast.svelte polls or subscribes to this via a callback.
let toasts: ToastItem[] = [];
let nextId = 0;
let listener: ((toasts: ToastItem[]) => void) | null = null;

/** Pending timer handles per toast id — cleared on early dismiss so recycled ids stay safe. */
type ToastTimers = {
	showTimer?: number;
	hideTimer?: ReturnType<typeof setTimeout>;
	removeTimer?: ReturnType<typeof setTimeout>;
	/** Timestamp when the current hideTimer countdown segment started. */
	countdownStartedAt?: number;
	/** Remaining ms left when paused (no live hideTimer). */
	remainingMs?: number;
};
const pendingTimers = new Map<number, ToastTimers>();

function notify() {
	if (listener) listener([...toasts]);
}

function clearTimers(id: number) {
	const timers = pendingTimers.get(id);
	if (!timers) return;
	if (timers.showTimer != null) cancelAnimationFrame(timers.showTimer);
	if (timers.hideTimer != null) clearTimeout(timers.hideTimer);
	if (timers.removeTimer != null) clearTimeout(timers.removeTimer);
	pendingTimers.delete(id);
}

/** Shared fade-out-then-remove path used by auto-dismiss and dismissToast. */
function fadeOutAndRemove(id: number) {
	toasts = toasts.map((t) => (t.id === id ? { ...t, visible: false, paused: false } : t));
	notify();

	const removeTimer = setTimeout(() => {
		toasts = toasts.filter((t) => t.id !== id);
		notify();
		pendingTimers.delete(id);
	}, FADE_OUT_MS);

	const existing = pendingTimers.get(id) ?? {};
	pendingTimers.set(id, { ...existing, removeTimer });
}

export function addToast(
	message: string,
	color: string = 'var(--color-lavender-deep)',
	action?: { label: string; run: () => void | boolean }
): void {
	const id = nextId++;
	const lifetime = action ? ACTION_TOAST_LIFETIME_MS : TOAST_LIFETIME_MS;
	const toast: ToastItem = { id, message, color, visible: false, action, lifetime };
	toasts = [...toasts, toast];
	notify();

	const timers: ToastTimers = {
		countdownStartedAt: Date.now(),
		remainingMs: lifetime
	};
	pendingTimers.set(id, timers);

	// Trigger fade-in on next frame
	timers.showTimer = requestAnimationFrame(() => {
		toasts = toasts.map((t) => (t.id === id ? { ...t, visible: true } : t));
		notify();
	});

	// Auto-dismiss after this toast's own lifetime
	timers.hideTimer = setTimeout(() => {
		fadeOutAndRemove(id);
	}, lifetime);
}

/**
 * Pause the auto-dismiss countdown for a toast (e.g. on hover/focus).
 * Idempotent: safe if already paused, missing, fading, or gone.
 */
export function pauseToast(id: number): void {
	const timers = pendingTimers.get(id);
	if (!timers || timers.hideTimer == null) return;

	const toast = toasts.find((t) => t.id === id);
	if (!toast || !toast.visible) return;

	const startedAt = timers.countdownStartedAt ?? Date.now();
	const pending = timers.remainingMs ?? toast.lifetime;
	const elapsed = Date.now() - startedAt;
	const remaining = Math.max(0, pending - elapsed);

	clearTimeout(timers.hideTimer);
	timers.hideTimer = undefined;
	timers.countdownStartedAt = undefined;
	timers.remainingMs = remaining;

	toasts = toasts.map((t) => (t.id === id ? { ...t, paused: true } : t));
	notify();
}

/**
 * Resume a paused auto-dismiss countdown, continuing from remaining time.
 * Idempotent: safe if not paused, missing, fading, or gone.
 */
export function resumeToast(id: number): void {
	const timers = pendingTimers.get(id);
	if (!timers || timers.hideTimer != null) return;
	if (timers.remainingMs == null) return;

	const toast = toasts.find((t) => t.id === id);
	if (!toast || !toast.visible) return;

	const remaining = timers.remainingMs;
	timers.countdownStartedAt = Date.now();
	timers.hideTimer = setTimeout(() => {
		fadeOutAndRemove(id);
	}, remaining);

	toasts = toasts.map((t) => (t.id === id ? { ...t, paused: false } : t));
	notify();
}

/**
 * Dismiss a toast early (e.g. after its action button is clicked).
 * Cancels pending auto-dismiss timers, then runs the same fade-out/remove path.
 * Idempotent: safe if the toast is already gone or already fading.
 */
export function dismissToast(id: number): void {
	clearTimers(id);
	if (!toasts.some((t) => t.id === id)) return;
	fadeOutAndRemove(id);
}

export function subscribe(fn: (toasts: ToastItem[]) => void): () => void {
	listener = fn;
	fn([...toasts]);
	return () => {
		listener = null;
	};
}
