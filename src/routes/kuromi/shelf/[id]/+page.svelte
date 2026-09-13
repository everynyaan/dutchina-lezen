<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import PageView from '$lib/components/kuromi/shelf/PageView.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	const ctx = getGameContext();
	let pageId = $derived(page.params.id ?? '');
	let kuromiPage = $derived(ctx.state.pages.find((p) => p.id === pageId) ?? null);

	$effect(() => {
		setKuromiVisible(false);
		return () => setKuromiVisible(true);
	});
</script>

{#if kuromiPage}
	<PageView page={kuromiPage} />
{:else}
	<div class="not-found">
		<div class="not-found-flavor" aria-hidden="true">
			<Doodle name="spark-sparkle-26" size={24} color="var(--color-lavender-deep)" tilt={-6} />
			<Doodle name="shape-swirl-loops-4" size={56} color="var(--color-rose-deep)" tilt={-3} />
		</div>
		<Character who="kuromi" mood="grumpy" size={72} />
		<p class="not-found-copy">I don't have that page. Or you made it up. Rude either way.</p>
		<a class="back-link tappable" href={resolve('/kuromi/shelf')}>
			<Icon name="chevron-left" size={18} color="var(--color-muted-ink)" />
			<span>Shelf</span>
		</a>
		<span class="not-found-doodle" aria-hidden="true">
			<Doodle
				name="thoughts-dreams-clouds-thought-bubble-11"
				size={36}
				color="var(--color-lavender-deep)"
				tilt={4}
			/>
		</span>
	</div>
{/if}

<style>
	.not-found {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 14px;
		padding: 0.5rem 0 1.5rem;
		min-width: 0;
	}

	.not-found-flavor {
		display: flex;
		align-items: center;
		gap: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.not-found-copy {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.45;
		color: var(--color-muted-ink);
		max-width: 28rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		text-decoration: none;
		padding: 4px 0;
		-webkit-tap-highlight-color: transparent;
	}

	.back-link:hover {
		color: var(--color-ink);
	}

	.not-found-doodle {
		pointer-events: none;
		line-height: 0;
	}
</style>
