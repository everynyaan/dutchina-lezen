<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		totalSeconds: number;
		warnSeconds?: number;
		label?: string;
		onExpire?: () => void;
	}

	let { totalSeconds, warnSeconds = 120, label = 'Time', onExpire }: Props = $props();

	let remaining = $state(totalSeconds);

	onMount(() => {
		remaining = totalSeconds;
		const tick = setInterval(() => {
			remaining = Math.max(0, remaining - 1);
			if (remaining === 0) {
				clearInterval(tick);
				onExpire?.();
			}
		}, 1000);
		return () => clearInterval(tick);
	});

	let mm = $derived(Math.floor(remaining / 60));
	let ss = $derived(String(remaining % 60).padStart(2, '0'));
	let warn = $derived(remaining <= warnSeconds);
</script>

<div class="timebox" class:warn>
	<span class="k">{label}</span>
	<span class="t">{mm}:{ss}</span>
</div>

<style>
	.timebox {
		display: inline-flex;
		align-items: baseline;
		gap: 8px;
		border: 3px solid var(--color-ink);
		border-radius: 999px;
		padding: 6px 14px;
		background: #fff;
		font-family: var(--font-display);
		box-shadow: var(--card-shadow);
	}
	.timebox.warn {
		background: var(--color-blush, #ffe8ef);
	}
	.k {
		font-size: var(--text-micro);
		color: var(--color-muted-ink);
		text-transform: lowercase;
	}
	.t {
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.03em;
	}
</style>
