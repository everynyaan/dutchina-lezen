<script lang="ts">
	import { Play, Pause, RotateCcw } from 'lucide-svelte';
	import type { DailyLuisterenQuestion } from '$lib/daily/types';
	import Sticker from '$lib/components/ui/Sticker.svelte';
	import OptionList, { type OptionItem } from './OptionList.svelte';

	interface Props {
		question: DailyLuisterenQuestion;
		showResult: boolean;
		selectedLetter: string | null;
		onanswer: (letter: string) => void;
	}

	let { question, showResult, selectedLetter, onanswer }: Props = $props();

	let mediaRef = $state<HTMLAudioElement | HTMLVideoElement | null>(null);
	let isPlaying = $state(false);
	let hasPlayed = $state(false);

	function playMedia() {
		if (!mediaRef) return;
		mediaRef.play();
		isPlaying = true;
		hasPlayed = true;
	}
	function pauseMedia() {
		if (!mediaRef) return;
		mediaRef.pause();
		isPlaying = false;
	}
	function replayMedia() {
		if (!mediaRef) return;
		mediaRef.currentTime = 0;
		mediaRef.play();
		isPlaying = true;
	}
	function onMediaEnded() {
		isPlaying = false;
	}

	// Reset media when the question changes (component instance is reused).
	$effect(() => {
		void question.questionId;
		if (mediaRef) {
			mediaRef.pause();
			mediaRef.currentTime = 0;
		}
		isPlaying = false;
		hasPlayed = false;
	});

	let options = $derived<OptionItem[]>(
		(['A', 'B', 'C'] as const).map((letter) => ({
			key: letter,
			letter,
			text: question.options[letter]
		}))
	);
</script>

<div class="question-card qcard">
	<div class="q-eyebrow">Listening — Question {question.opgave}</div>

	<Sticker variant="audio" class="media-sticker">
		{#if question.mediaType === 'video'}
			{#key question.mediaUrl}
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<video
					bind:this={mediaRef}
					src={question.mediaUrl}
					class="media-video"
					onended={onMediaEnded}
					playsinline
				/>
			{/key}
		{:else}
			{#key question.mediaUrl}
				<audio bind:this={mediaRef} src={question.mediaUrl} onended={onMediaEnded} preload="auto" />
			{/key}
		{/if}

		<div class="media-controls">
			{#if !hasPlayed}
				<button class="media-btn" onclick={playMedia}>
					<Play size={18} />
					<span>Play {question.mediaType === 'video' ? 'video' : 'audio'}</span>
				</button>
			{:else if isPlaying}
				<button class="media-btn pause" onclick={pauseMedia}>
					<Pause size={18} />
					<span>Pause</span>
				</button>
			{:else}
				<div class="media-btn-row">
					<button class="media-btn" onclick={playMedia}>
						<Play size={16} />
						<span>Resume</span>
					</button>
					<button class="media-btn replay" onclick={replayMedia}>
						<RotateCcw size={16} />
						<span>Restart</span>
					</button>
				</div>
			{/if}
		</div>
	</Sticker>

	<div class="q-prompt">{question.question}</div>
</div>

<OptionList
	{options}
	selectedKey={selectedLetter}
	correctKey={question.answer}
	{showResult}
	onselect={(key) => onanswer(key as string)}
/>

<style>
	.qcard {
		background: var(--color-s1);
		border: 2px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--shadow-offset-card);
		padding: 18px;
	}

	.q-eyebrow {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-muted-ink);
		text-transform: uppercase;
	}

	:global(.media-sticker) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.media-video {
		width: 100%;
		border-radius: 14px;
		background: #000;
		max-height: 220px;
		border: 3px solid var(--color-ink);
	}

	.media-controls {
		display: flex;
		justify-content: center;
	}

	.media-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 18px;
		border: 2px solid var(--color-ink);
		background: var(--color-rose);
		border-radius: 999px;
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		cursor: pointer;
		box-shadow: var(--sticker-shadow);
		-webkit-tap-highlight-color: transparent;
	}

	.media-btn:active {
		transform: scale(var(--press-scale));
	}

	.media-btn.pause {
		border-color: var(--color-ink);
		background: color-mix(in srgb, var(--color-peach) 45%, white);
		color: var(--color-peach-deep);
	}

	.media-btn.replay {
		border-color: var(--color-ink);
		background: color-mix(in srgb, var(--color-lavender) 24%, white);
		color: var(--color-ink);
	}

	.media-btn-row {
		display: flex;
		gap: 8px;
	}

	.q-prompt {
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--color-text);
		font-weight: 500;
	}
</style>
