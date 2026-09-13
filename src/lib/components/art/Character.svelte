<script lang="ts">
	import { resolveCharacter, type CharacterName } from '$lib/art/manifest';

	interface Props {
		who?: CharacterName;
		mood: string;
		size?: number;
		animated?: boolean;
		alt?: string;
		class?: string;
		[key: string]: unknown;
	}

	let {
		who = 'kuromi',
		mood,
		size = 64,
		animated = false,
		alt = '',
		class: className,
		...rest
	}: Props = $props();

	let reducedMotion = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = () => {
			reducedMotion = mq.matches;
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const effectiveAnimated = $derived(animated && !reducedMotion);

	const resolved = $derived(
		resolveCharacter(who, mood, effectiveAnimated) ??
			resolveCharacter('kuromi', 'talk', effectiveAnimated)
	);

	const src = $derived(resolved?.src ?? null);
	const isPixel = $derived(mood === 'pixel');
</script>

{#if src}
	{#key src}
		<img
			{...rest}
			class={['character', className]}
			class:pixel={isPixel}
			{src}
			width={size}
			height={size}
			{alt}
			aria-hidden={alt === '' ? true : undefined}
			draggable="false"
			loading="lazy"
			decoding="async"
		/>
	{/key}
{/if}

<style>
	.character {
		display: block;
		object-fit: contain;
		animation: fade-in 150ms ease-out;
	}

	.character.pixel {
		image-rendering: pixelated;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.character {
			animation: none;
		}
	}
</style>
