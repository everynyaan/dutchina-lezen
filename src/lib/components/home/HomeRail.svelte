<script lang="ts">
	import Character from '$lib/components/art/Character.svelte';
	import AchievementGrid from '$lib/components/AchievementGrid.svelte';
	import { getGameContext } from '$lib/state/context';
	import WeeksetCard from './WeeksetCard.svelte';
	import MissionRows from './MissionRows.svelte';
	import CollectionShelf from './CollectionShelf.svelte';

	interface Props {
		total: number;
		answered: number;
		correct: number;
		completed: boolean;
		lpEarned: number;
		isThisWeek: boolean;
	}

	let { total, answered, correct, completed, lpEarned, isThisWeek }: Props = $props();

	const ctx = getGameContext();
	let progressionDisplay = $derived(ctx.state.appConfig.progression.display);
</script>

<aside class="home-rail" aria-label="goals">
	<WeeksetCard {total} {answered} {correct} {completed} {lpEarned} {isThisWeek} />
	<MissionRows />
	{#if progressionDisplay === 'collection'}
		<CollectionShelf expanded={false} />
	{:else}
		<AchievementGrid expanded={false} />
	{/if}
	<div class="rail-corner">
		<Character who="piano" mood="dreamy" size={44} alt="" />
	</div>
</aside>

<style>
	.home-rail {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding-top: 4px;
		min-width: 0;
	}

	.rail-corner {
		display: flex;
		justify-content: flex-end;
		margin-top: auto;
		padding-top: 8px;
	}
</style>
