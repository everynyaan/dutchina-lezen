<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	interface Props {
		onInstall: () => void;
		onDismiss: () => void;
	}

	let { onInstall, onDismiss }: Props = $props();
</script>

<div
	class="sticker r-card edge-ink-2 offset-card jit-a"
	role="region"
	aria-label="Dutchina installeren"
>
	<span class="icon-wrap">
		<Icon name="download" size={18} color="var(--color-ink)" />
	</span>
	<div class="copy">
		<div class="title">Dutchina installeren</div>
		<div class="sub">zet op je startscherm voor het echte app-gevoel.</div>
	</div>
	<button
		type="button"
		class="install"
		onclick={onInstall}
		aria-label="Dutchina installeren op dit apparaat"
	>
		installeer
	</button>
	<button type="button" class="dismiss" onclick={onDismiss} aria-label="Dismiss install prompt">
		<Icon name="xmark" size={16} color="var(--color-muted-ink)" />
	</button>
</div>

<style>
	.sticker {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 12px 12px 14px;
		background: var(--color-s1);
	}

	.icon-wrap {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-lavender) 22%, white);
	}

	.copy {
		flex: 1;
		min-width: 0;
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-ink);
		line-height: 1.2;
	}

	.sub {
		margin-top: 2px;
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.3;
	}

	.install {
		flex-shrink: 0;
		padding: 8px 14px;
		background: var(--color-ink);
		border: none;
		border-radius: 10px;
		color: var(--color-cream);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			opacity 0.15s,
			transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.install:hover {
		opacity: 0.92;
	}

	.install:active {
		transform: scale(var(--press-scale));
	}

	.dismiss {
		flex-shrink: 0;
		background: none;
		border: none;
		padding: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: 8px;
		-webkit-tap-highlight-color: transparent;
	}

	.dismiss:hover {
		background: color-mix(in srgb, var(--color-rose) 16%, transparent);
	}
</style>
