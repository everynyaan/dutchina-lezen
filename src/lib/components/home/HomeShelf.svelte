<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import CollectionShelf from './CollectionShelf.svelte';
	import AchievementGrid from '$lib/components/AchievementGrid.svelte';

	const ctx = getGameContext();
	let openBook = $derived(ctx.state.appConfig.progression.display === 'collection');
</script>

<section
	id="home-stickers"
	class="home-shelf"
	class:is-book={openBook}
	aria-label="collection and achievements"
>
	<CollectionShelf expanded={openBook} />
	<AchievementGrid expanded={false} />
</section>

<style>
	.home-shelf {
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
		padding: 16px 16px 18px;
		border-radius: 22px;
		background: color-mix(in srgb, var(--color-cream) 62%, white);
		border: 1px solid color-mix(in srgb, var(--color-line) 70%, transparent);
		scroll-margin-top: 12px;
		overflow: visible;
	}

	.home-shelf.is-book {
		border-color: color-mix(in srgb, var(--color-rose) 42%, var(--color-line));
		background: color-mix(in srgb, var(--color-rose) 10%, white);
	}
</style>
