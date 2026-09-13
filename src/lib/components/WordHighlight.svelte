<script lang="ts">
	import { onMount } from 'svelte';
	import SpeakerButton from './SpeakerButton.svelte';

	interface Props {
		word: string;
	}
	let { word }: Props = $props();

	let open = $state(false);
	let wrapperEl: HTMLSpanElement | undefined = $state();

	function toggle(e: Event) {
		e.stopPropagation();
		open = !open;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle(e);
		}
	}

	onMount(() => {
		function handleClickOutside(e: MouseEvent) {
			if (open && wrapperEl && !wrapperEl.contains(e.target as Node)) {
				open = false;
			}
		}
		document.addEventListener('click', handleClickOutside, true);
		return () => document.removeEventListener('click', handleClickOutside, true);
	});
</script>

<span class="wh-wrapper" bind:this={wrapperEl}>
	<span class="wh-word" onclick={toggle} onkeydown={handleKeydown} role="button" tabindex="0"
		>{word}</span
	>
	{#if open}
		<span class="wh-popover">
			<SpeakerButton text={word} size={16} />
			<SpeakerButton text={word} size={16} slow />
		</span>
	{/if}
</span>

<style>
	.wh-wrapper {
		position: relative;
		display: inline;
	}

	.wh-word {
		color: var(--color-kuromi);
		font-weight: 700;
		background: color-mix(in srgb, var(--color-blush) 75%, white);
		padding: 0 0.28em;
		border-radius: 0.4em;
		text-decoration: underline;
		text-decoration-color: var(--color-kuromi);
		text-underline-offset: 3px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}

	.wh-word:hover {
		background: color-mix(in srgb, var(--color-peach) 55%, white);
		text-decoration-style: double;
	}

	.wh-popover {
		position: absolute;
		bottom: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 6px;
		background: var(--color-s1);
		border: 2px solid var(--color-kuromi);
		border-radius: 14px;
		padding: 8px 10px;
		box-shadow: var(--sticker-shadow);
		z-index: 50;
		white-space: nowrap;
	}

	/* small triangle pointing down */
	.wh-popover::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: var(--color-kuromi);
	}
</style>
