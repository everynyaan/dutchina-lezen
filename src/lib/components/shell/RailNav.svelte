<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolvePath } from '$lib/paths';
	import { onMount } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import { playSfx } from '$lib/sound/sfx';

	interface Tab {
		href: Pathname;
		label: string;
		icon: IconName;
	}

	interface SecondaryLink {
		href: Pathname;
		label: string;
		character?: boolean;
	}

	interface Props {
		tabs: readonly Tab[];
		secondaryLinks: readonly SecondaryLink[];
		pathname: string;
		isActive: (href: string, pathname: string) => boolean;
	}

	let { tabs, secondaryLinks, pathname, isActive }: Props = $props();

	let isDesktopRail = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(min-width: 1080px)');
		isDesktopRail = mq.matches;
		const handler = (e: MediaQueryListEvent) => {
			isDesktopRail = e.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

<div class="rail-nav">
	<div class="wordmark">
		<span class="wordmark-text">Dutchina</span>
		{#if isDesktopRail}
			<span class="jit-5">
				<Doodle name="spark-sparkle-26" size={18} color="var(--color-rose-deep)" />
			</span>
		{/if}
	</div>

	<nav class="primary-nav" aria-label="Main">
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href, pathname)}
			<a
				href={resolvePath(tab.href)}
				class="nav-link"
				class:active
				onclick={() => {
					if (!active) playSfx('tab_switch');
				}}
			>
				<Icon name={tab.icon} size={active ? 24 : 22} secondaryOpacity={0.35} />
				<span class="nav-label">{tab.label}</span>
			</a>
		{/each}
	</nav>

	<div class="secondary-links">
		{#each secondaryLinks as link (link.href)}
			{#if link.character}
				<a href={resolvePath(link.href)} class="secondary-link secondary-link--character">
					<Character who="kuromi" mood="mischief" size={24} alt="" />
					<span>{link.label}</span>
				</a>
			{:else}
				<a href={resolvePath(link.href)} class="secondary-link">{link.label}</a>
			{/if}
		{/each}
	</div>
</div>

<style>
	.rail-nav {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.wordmark {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 6px 4px;
	}

	.wordmark-text {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-title);
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.primary-nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		text-decoration: none;
		color: var(--color-muted-ink);
		border-radius: 999px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-small);
		line-height: 1.2;
		transition:
			background-color 180ms ease-out,
			color 180ms ease-out;
	}

	.nav-link.active {
		background: var(--color-rose);
		color: var(--color-ink);
		box-shadow: var(--shadow-offset-pill);
	}

	.nav-label {
		font-size: var(--text-small);
	}

	.secondary-links {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px 6px 0;
	}

	.secondary-link {
		display: block;
		padding: 6px 6px;
		text-decoration: none;
		color: var(--color-muted-ink);
		font-family: var(--font-display);
		font-weight: 500;
		font-size: var(--text-small);
		line-height: 1.3;
	}

	.secondary-link--character {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: #fff;
		border: 2px solid var(--color-kuromi);
		border-radius: 14px;
		color: var(--color-kuromi);
		font-weight: 500;
		box-sizing: border-box;
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-link {
			transition: none;
		}
	}
</style>
