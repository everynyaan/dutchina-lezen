<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import Icon from '$lib/icons/Icon.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import { WORD_POOL } from '$lib/data/wordPool';
	import { getGameContext } from '$lib/state/context';

	interface Props {
		dailyAnswered: number;
		dailyTotal: number;
		dailyIsThisWeek: boolean;
		dailyCorrect?: number;
		onOpenDoelen?: () => void;
		hideWeekset?: boolean;
	}

	let {
		dailyAnswered,
		dailyTotal,
		dailyIsThisWeek,
		dailyCorrect,
		onOpenDoelen,
		hideWeekset = false
	}: Props = $props();

	const ctx = getGameContext();
	let missionsMode = $derived(ctx.state.appConfig.missions);
	let doelenWord = $derived(missionsMode === 'off' ? 'goals' : 'missions');

	const bankLinks: { href: Pathname; label: string; aria?: string; character?: boolean }[] = [
		{ href: '/vocab', label: 'Words', aria: `Vocab Bank, ${WORD_POOL.length} words` },
		{ href: '/lezen', label: 'Reading' },
		{ href: '/luisteren', label: 'Listening' },
		{ href: '/kuromi/shelf', label: 'Kuromi', character: true }
	];

	const weeksetLabel = $derived(
		hideWeekset
			? doelenWord
			: dailyIsThisWeek
				? `week set ${dailyAnswered}/${dailyTotal}${dailyCorrect != null ? `, ${dailyCorrect} correct` : ''} · ${doelenWord}`
				: 'week set · new'
	);

	function handleWeeksetClick(event: MouseEvent) {
		if (!onOpenDoelen) return;
		event.preventDefault();
		onOpenDoelen();
	}
</script>

<div class="quiet">
	<div class="line line-weekset" class:line-weekset--compact={hideWeekset}>
		{#if !hideWeekset}
			<span class="arrow">
				<Doodle name="arrow-9" size={28} color="var(--color-rose-deep)" tilt={18} />
			</span>
		{/if}
		<a
			class="weekset"
			href={resolve('/daily')}
			aria-label={weeksetLabel}
			onclick={handleWeeksetClick}
		>
			{#if hideWeekset}
				{doelenWord}
			{:else if dailyIsThisWeek}
				week set {dailyAnswered}/{dailyTotal} · {doelenWord}
			{:else}
				week set · new
			{/if}
			<Icon name="chevron-right" size={14} color="var(--color-muted-ink)" />
		</a>
	</div>
	<div class="line line-bank">
		{#each bankLinks as link, i (link.href)}
			{#if i > 0}<span class="sep"> · </span>{/if}
			{#if link.character}
				<a href={resolve(link.href)} aria-label={link.aria} class="bank-link-character">
					<Character who="kuromi" mood="mischief" size={16} alt="" />
					<span>{link.label}</span>
				</a>
			{:else}
				<a href={resolve(link.href)} aria-label={link.aria}>{link.label}</a>
			{/if}
		{/each}
	</div>
</div>

<style>
	.quiet {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 2px;
	}

	.line {
		font-size: var(--text-small);
		line-height: 1.45;
		color: var(--color-muted-ink);
	}

	.line-weekset {
		position: relative;
		display: flex;
		align-items: center;
		padding-left: 28px;
	}

	.line-weekset--compact {
		padding-left: 0;
	}

	.arrow {
		position: absolute;
		left: -2px;
		top: 50%;
		translate: 0 -58%;
		pointer-events: none;
		line-height: 0;
	}

	.weekset {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: inherit;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.weekset:hover {
		color: var(--color-ink);
	}

	.line-bank a {
		color: inherit;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.line-bank a:hover {
		color: var(--color-ink);
	}

	.bank-link-character {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: var(--color-kuromi);
		font-weight: 700;
		vertical-align: middle;
	}

	.sep {
		color: var(--color-muted-ink);
	}
</style>
