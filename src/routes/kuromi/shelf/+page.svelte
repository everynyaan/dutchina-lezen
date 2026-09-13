<script lang="ts">
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import ShelfView from '$lib/components/kuromi/shelf/ShelfView.svelte';
	import DrillPanel from '$lib/components/kuromi/DrillPanel.svelte';

	// Domi is on the Shelf now; the summon FAB has nothing to add here.
	// Restore on unmount (cleanup) -- same pattern as /kuromi/shelf/[id].
	$effect(() => {
		setKuromiVisible(false);
		return () => {
			setKuromiVisible(true);
		};
	});
</script>

<div class="shelf-page">
	<div class="shelf-header">
		<Character who="kuromi" mood="mischief" size={56} alt="" />
		<div class="shelf-header-text">
			<div class="title-row">
				<h1 class="page-title">Shelf</h1>
				<Doodle name="spark-sparkle-26" size={26} color="var(--color-rose-deep)" tilt={-6} />
			</div>
			<p class="page-sub">Everything she's made you, kept her way.</p>
		</div>
	</div>

	<ShelfView />

	<section class="drill-section" aria-label="Sandbox drill">
		<div class="drill-section-header">
			<h2 class="drill-title">Bored? Make me build you a drill.</h2>
			<p class="drill-sub">Sandbox only. Zero LP. Nothing gets saved to your reviews.</p>
		</div>
		<DrillPanel />
	</section>
</div>

<style>
	.shelf-page {
		padding: 0.5rem 0 1.5rem;
	}

	.shelf-header {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		margin: 12px 0 4px;
		background: #fff;
		border: 3px solid var(--color-kuromi);
		border-radius: 20px;
		box-shadow: var(--shadow-offset-pill);
		box-sizing: border-box;
		min-width: 0;
	}

	.shelf-header-text {
		min-width: 0;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-kuromi);
		letter-spacing: 0.02em;
		line-height: 1.15;
		margin: 0;
	}

	.page-sub {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin-top: 4px;
	}

	.drill-section {
		margin-top: 20px;
		padding: 14px 16px;
		background: #fff;
		border: 3px solid var(--color-kuromi);
		border-radius: 20px;
		box-shadow: var(--shadow-offset-pill);
		box-sizing: border-box;
		min-width: 0;
	}

	.drill-section-header {
		margin-bottom: 12px;
	}

	.drill-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-kuromi);
		letter-spacing: 0.02em;
		line-height: 1.2;
		margin: 0;
	}

	.drill-sub {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: 4px 0 0;
		line-height: 1.4;
	}
</style>
