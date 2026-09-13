<script lang="ts">
	import { ICON_SVG, ICON_WEIGHT, type IconName } from './icons';

	interface Props {
		name: IconName;
		size?: number;
		color?: string;
		secondaryColor?: string;
		secondaryOpacity?: number;
		title?: string;
		class?: string;
		[key: string]: unknown;
	}

	let {
		name,
		size = 20,
		color = 'currentColor',
		secondaryColor,
		secondaryOpacity = 0.35,
		title,
		class: className,
		...rest
	}: Props = $props();

	// The title is interpolated into an {@html} string below, so it must be
	// escaped to prevent a future caller from injecting markup or script via
	// the icon accessible title.
	function escapeHtml(value: string): string {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	const transformedSvg = $derived.by(() => {
		let svg = ICON_SVG[name];

		svg = svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
			let cleaned = attrs
				.replace(/\s*width="[^"]*"/g, '')
				.replace(/\s*height="[^"]*"/g, '')
				.replace(/\s*fill="[^"]*"/g, '');
			return `<svg${cleaned} width="${size}" height="${size}" fill="currentColor">`;
		});

		if (ICON_WEIGHT[name] === 'duotone') {
			const sec = secondaryColor ?? color;
			svg = svg.replace(/class="fa-primary"/g, `class="fa-primary" fill="${color}"`);
			svg = svg.replace(
				/class="fa-secondary"/g,
				`class="fa-secondary" fill="${sec}" opacity="${secondaryOpacity}"`
			);
		}

		if (title) {
			svg = svg.replace(/(<svg\b[^>]*>)/, `$1<title>${escapeHtml(title)}</title>`);
		}

		return svg;
	});
</script>

{#if title}
	<span {...rest} class={['icon', className]} style="color: {color}" role="img">
		<!-- Trusted vendor SVG subset from ICON_SVG; colors/title injected in-module. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html transformedSvg}
	</span>
{:else}
	<span
		{...rest}
		{...{ 'aria-hidden': true, focusable: 'false' } as Record<string, string | boolean>}
		class={['icon', className]}
		style="color: {color}"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html transformedSvg}
	</span>
{/if}

<style>
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		flex-shrink: 0;
	}

	.icon :global(svg) {
		display: block;
	}
</style>
