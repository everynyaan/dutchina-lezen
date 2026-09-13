<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		subscribe,
		dismissToast,
		addToast,
		pauseToast,
		resumeToast,
		type ToastItem
	} from './toastStore';
	import Icon from '$lib/icons/Icon.svelte';
	import Character from '$lib/components/art/Character.svelte';

	let toasts = $state<ToastItem[]>([]);
	let unsubscribe: (() => void) | null = null;

	/** Per-toast hover/focus interaction flags so pause only lifts when both end. */
	let interactions = $state<Record<number, { hovered: boolean; focused: boolean }>>({});

	function interactionActive(id: number): boolean {
		const state = interactions[id];
		return !!(state?.hovered || state?.focused);
	}

	function setHovered(id: number, hovered: boolean) {
		const prev = interactionActive(id);
		const current = interactions[id] ?? { hovered: false, focused: false };
		interactions = { ...interactions, [id]: { ...current, hovered } };
		const next = interactionActive(id);
		if (!prev && next) pauseToast(id);
		else if (prev && !next) resumeToast(id);
	}

	function setFocused(id: number, focused: boolean) {
		const prev = interactionActive(id);
		const current = interactions[id] ?? { hovered: false, focused: false };
		interactions = { ...interactions, [id]: { ...current, focused } };
		const next = interactionActive(id);
		if (!prev && next) pauseToast(id);
		else if (prev && !next) resumeToast(id);
	}

	onMount(() => {
		unsubscribe = subscribe((items) => {
			toasts = items;
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	// Presentation-only tone derivation. The store's `color` field carries
	// whatever the caller passed (some deprecated tokens live in
	// +layout.svelte, out of this component's scope) so the auto-icon is
	// derived from the message's semantic prefix instead of trusting it.
	// Two tones per V3_DESIGN section 8: 'success' (teal check) for progress
	// milestones (mission complete, tier up), 'kuromi' (her 28px face) for
	// personal celebratory moments (rank up, achievement unlocked).
	type ToastTone = 'success' | 'kuromi';

	function toneOf(message: string): ToastTone {
		if (message.startsWith('RANK UP') || message.startsWith('UNLOCKED')) return 'kuromi';
		return 'success';
	}

	function handleAction(toast: ToastItem) {
		if (!toast.action) return;
		const result = toast.action.run();
		if (result === false) {
			dismissToast(toast.id);
			addToast('Undo could not be applied.', 'var(--color-peach-deep)');
		} else {
			dismissToast(toast.id);
		}
	}
</script>

{#if toasts.length > 0}
	<div class="toast-stack" aria-live="polite">
		{#each toasts as toast (toast.id)}
			{@const tone = toneOf(toast.message)}
			<div class="toast-wrap" class:jit-a={toast.id % 2 === 0} class:jit-b={toast.id % 2 !== 0}>
				<div
					class="toast"
					class:visible={toast.visible}
					class:paused={toast.paused}
					class:tone-success={tone === 'success'}
					class:tone-kuromi={tone === 'kuromi'}
					style="--toast-lifetime: {toast.lifetime}ms"
					role="status"
					onmouseenter={() => setHovered(toast.id, true)}
					onmouseleave={() => setHovered(toast.id, false)}
					onfocusin={() => setFocused(toast.id, true)}
					onfocusout={() => setFocused(toast.id, false)}
				>
					<span class="toast-icon">
						{#if tone === 'success'}
							<Icon name="check" size={18} color="var(--color-teal-deep)" />
						{:else}
							<Character who="kuromi" mood="excited" size={28} animated alt="" />
						{/if}
					</span>
					<div class="toast-message">{toast.message}</div>
					{#if toast.action}
						<button type="button" class="toast-action" onclick={() => handleAction(toast)}>
							{toast.action.label}
						</button>
					{/if}
					<div class="toast-progress" class:running={toast.visible}></div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-stack {
		position: fixed;
		top: env(safe-area-inset-top, 0px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 300;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding-top: 12px;
		width: 100%;
		max-width: 360px;
		pointer-events: none;
	}

	.toast-wrap {
		display: flex;
		justify-content: center;
	}

	.toast {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 220px;
		max-width: 100%;
		border: 2px solid var(--color-ink);
		border-radius: 16px;
		padding: 8px 14px 8px 10px;
		overflow: hidden;
		box-shadow: var(--shadow-offset-pill);
		opacity: 0;
		transform: translateY(-14px);
		transition:
			opacity 0.28s ease,
			transform 0.36s cubic-bezier(0.34, 1.5, 0.5, 1);
		pointer-events: auto;
	}

	.toast.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.toast.tone-success {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.toast.tone-kuromi {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 28px;
	}

	.toast-message {
		flex: 1;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.2;
	}

	.toast.tone-success .toast-message {
		color: var(--color-teal-deep);
	}

	.toast.tone-kuromi .toast-message {
		color: var(--color-lavender-deep);
	}

	.toast-action {
		pointer-events: auto;
		flex-shrink: 0;
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
		padding: 4px 12px;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		background: color-mix(in srgb, white 70%, transparent);
		box-shadow: var(--shadow-offset-pill);
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1.2;
		cursor: pointer;
	}

	.toast-action:hover {
		background: white;
	}

	.toast-action:active {
		transform: translateY(1px);
		box-shadow: 0 1px 0 rgba(209, 103, 143, 0.25);
	}

	.toast-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 2px;
		width: 100%;
		opacity: 0.4;
		transform-origin: left center;
		transform: scaleX(1);
	}

	.toast.tone-success .toast-progress {
		background: var(--color-teal-deep);
	}

	.toast.tone-kuromi .toast-progress {
		background: var(--color-lavender-deep);
	}

	@keyframes toast-progress {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}

	.toast-progress.running {
		animation: toast-progress var(--toast-lifetime) linear forwards;
	}

	.toast.paused .toast-progress.running {
		animation-play-state: paused;
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			transition: opacity 0.1s ease;
			transform: none;
		}
		.toast.visible {
			transform: none;
		}
		.toast-progress.running {
			animation: none;
		}
	}
</style>
