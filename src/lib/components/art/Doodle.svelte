<script lang="ts" module>
	const warnedNames: Record<string, true> = {};
</script>

<script lang="ts">
	import { isDoodle, doodleUrl } from '$lib/art/manifest';

	interface Props {
		name: string;
		size?: number;
		color?: string;
		tilt?: number;
		class?: string;
		[key: string]: unknown;
	}

	let {
		name,
		size = 40,
		color = 'currentColor',
		tilt = 0,
		class: className,
		...rest
	}: Props = $props();

	const known = $derived(isDoodle(name));

	const style = $derived(
		known
			? `--doodle-src: url('${doodleUrl(name)}'); width: ${size}px; height: ${size}px; color: ${color}; transform: rotate(${tilt}deg)`
			: ''
	);

	$effect(() => {
		if (!known && import.meta.env.DEV) {
			if (!warnedNames[name]) {
				warnedNames[name] = true;
				console.warn(`[Doodle] unknown doodle name: "${name}"`);
			}
		}
	});
</script>

{#if known}
	<span {...rest} class={['doodle', className]} {style} aria-hidden="true"></span>
{/if}

<style>
	.doodle {
		display: inline-block;
		background-color: currentColor;
		-webkit-mask-image: var(--doodle-src);
		mask-image: var(--doodle-src);
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-position: center;
		mask-position: center;
	}
</style>
