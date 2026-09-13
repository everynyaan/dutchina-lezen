<script lang="ts">
	import { Volume2 } from 'lucide-svelte';
	import { speak, stopSpeaking, onPlaybackEnd } from '$lib/audio/tts';
	import { getGameContext } from '$lib/state/context';
	import { onMount } from 'svelte';

	interface Props {
		text: string;
		size?: number;
		slow?: boolean;
	}
	let { text, size = 18, slow = false }: Props = $props();

	const rate = slow ? 0.7 : 1;
	const ctx = getGameContext();
	let playing = $state(false);

	onMount(() => {
		const unsub = onPlaybackEnd(() => {
			playing = false;
		});
		return unsub;
	});

	// Hard-wired TTS key. Falls back to state value if someone overrides
	// it in settings, but in practice this just works out of the box.
	const FALLBACK_TTS_KEY = 'AIzaSyCVAh2sR1nWsS-Gi_dEeeh0mLho6KSo2RU';

	async function handleClick(e: Event) {
		e.stopPropagation();

		if (playing) {
			stopSpeaking();
			playing = false;
			return;
		}

		playing = true;
		const apiKey = ctx.state.tts.googleApiKey || FALLBACK_TTS_KEY;
		await speak(text, apiKey, rate);
		// onPlaybackEnd callback will set playing = false
		// but also set it here in case the promise resolves
		// after the callback (race condition safety)
		playing = false;
	}
</script>

<button
	class="speaker-btn"
	class:playing
	class:slow
	onclick={handleClick}
	aria-label={slow ? 'Play audio slowly' : 'Play audio'}
	type="button"
>
	<Volume2 {size} strokeWidth={2} />
	{#if slow}
		<span class="slow-label">slow</span>
	{/if}
</button>

<style>
	.speaker-btn {
		background: color-mix(in srgb, var(--color-peach) 55%, white);
		border: 2px solid var(--color-kuromi);
		border-radius: 50%;
		padding: 6px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 3px;
		color: var(--color-kuromi);
		box-shadow: var(--sticker-shadow);
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
		flex-shrink: 0;
	}

	.speaker-btn.slow {
		border-radius: 999px;
		padding: 6px 10px;
	}

	.speaker-btn:hover {
		border-color: var(--color-kuromi);
		color: var(--color-accent);
		background: color-mix(
			in srgb,
			color-mix(in srgb, var(--color-peach) 55%, white) 70%,
			var(--color-rose)
		);
	}

	.speaker-btn:active {
		transform: scale(var(--press-scale));
	}

	.speaker-btn.playing {
		color: var(--color-accent);
		border-color: var(--color-accent);
		animation: pulse-speaker 1s ease-in-out infinite;
	}

	.slow-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	@keyframes pulse-speaker {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
