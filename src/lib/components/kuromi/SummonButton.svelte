<script lang="ts">
	import { isKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import { playSfx } from '$lib/sound/sfx';

	interface Props {
		onSummon: () => void;
		/** Bound to the underlying button so the parent can restore focus on close. */
		buttonEl?: HTMLButtonElement | undefined;
	}

	let { onSummon, buttonEl = $bindable() }: Props = $props();

	let visible = $derived(isKuromiVisible());

	function handleSummon() {
		playSfx('kuromi_appear');
		onSummon();
	}
</script>

{#if visible}
	<button
		bind:this={buttonEl}
		type="button"
		class="summon-btn"
		aria-label="Summon Kuromi"
		onclick={handleSummon}
	>
		<!-- Future art: <img src="/kuromi/summon.png" alt="" /> -->
		<span class="summon-face" aria-hidden="true">🖤</span>
	</button>
{/if}

<style>
	.summon-btn {
		position: fixed;
		/* Tab bar sits at safe-area + 12px; ~66px tall (padding + 52 min-height + borders).
		   Clear it with a visible gap so the FAB sits above the pill nav. */
		bottom: calc(env(safe-area-inset-bottom, 0px) + 100px);
		right: calc(16px + env(safe-area-inset-right, 0px));
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: 3px solid var(--color-kuromi);
		background: var(--color-lilac);
		box-shadow: var(--sticker-shadow);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 150;
		padding: 0;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.summon-btn:active {
		transform: scale(var(--press-scale));
	}

	.summon-btn:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: 3px;
	}

	.summon-face {
		font-size: 22px;
		line-height: 1;
		user-select: none;
	}

	/* Desktop: tab bar is a static left sidebar — no bottom clearance needed. */
	@media (min-width: 1024px) {
		.summon-btn {
			bottom: calc(24px + env(safe-area-inset-bottom, 0px));
			right: calc(24px + env(safe-area-inset-right, 0px));
		}
	}
</style>
