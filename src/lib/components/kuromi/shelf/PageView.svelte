<script lang="ts">
	import { resolve } from '$app/paths';
	import type { KuromiPage } from '$lib/state/schema';
	import { getGameContext } from '$lib/state/context';
	import { setArchivedIn } from '$lib/kuromi/pageStore';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import BlockRenderer from '$lib/components/kuromi/blocks/BlockRenderer.svelte';

	interface Props {
		page: KuromiPage;
	}

	let { page }: Props = $props();

	const ctx = getGameContext();

	function formatDate(iso: string): string {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function archiveIt() {
		ctx.state.pages = setArchivedIn(ctx.state.pages, page.id, true, new Date().toISOString());
	}

	function restore() {
		ctx.state.pages = setArchivedIn(ctx.state.pages, page.id, false, new Date().toISOString());
	}
</script>

<div class="page-view">
	<a class="back-link tappable" href={resolve('/kuromi/shelf')}>
		<Icon name="chevron-left" size={18} color="var(--color-muted-ink)" />
		<span>Shelf</span>
	</a>

	<header class="page-hero r-card edge-ink offset-card">
		<span class="hero-sparkle" aria-hidden="true">
			<Doodle name="spark-sparkle-26" size={22} color="var(--color-lavender-deep)" tilt={6} />
		</span>
		<div class="hero-heading-wrap">
			<h1 class="page-title">{page.title}</h1>
			<span class="hero-squiggle" aria-hidden="true">
				<Doodle name="swirl-loops-97" size={48} color="var(--color-rose-deep)" tilt={-2} />
			</span>
		</div>
		{#if page.quip}
			<p class="page-quip">{page.quip}</p>
		{/if}
		{#if page.labels.length > 0}
			<div class="page-labels">
				{#each page.labels as label (label)}
					<Pill variant="lavender" size="sm">{label}</Pill>
				{/each}
			</div>
		{/if}
		<div class="page-dates">
			<span>Created {formatDate(page.createdAt)}</span>
			<span aria-hidden="true">&middot;</span>
			<span>Updated {formatDate(page.updatedAt)}</span>
		</div>
	</header>

	<div class="blocks">
		{#each page.blocks as block, i (i)}
			<BlockRenderer {block} />
		{/each}
	</div>

	{#if page.blocks.length === 0}
		<p class="no-blocks">No blocks on this page yet.</p>
	{/if}

	<div class="archive-row">
		{#if page.archived}
			<button type="button" class="archive-btn tappable" onclick={restore}>Restore</button>
		{:else}
			<button type="button" class="archive-btn tappable" onclick={archiveIt}>Archive</button>
		{/if}
	</div>

	<span class="footer-doodle" aria-hidden="true">
		<Doodle name="shape-swirl-loops-4" size={48} color="var(--color-lavender-deep)" tilt={-4} />
	</span>
</div>

<style>
	.page-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 0.5rem 0 1.5rem;
		min-width: 0;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		align-self: flex-start;
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

	.page-hero {
		position: relative;
		overflow: visible;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: #fff;
		min-width: 0;
	}

	.hero-sparkle {
		position: absolute;
		top: 12px;
		right: 14px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.hero-heading-wrap {
		position: relative;
		display: inline-block;
		padding-bottom: 4px;
		max-width: 100%;
		padding-right: 28px;
	}

	.page-title {
		position: relative;
		z-index: 1;
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.hero-squiggle {
		position: absolute;
		left: 0;
		bottom: -4px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.page-quip {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.45;
		color: var(--color-muted-ink);
		overflow-wrap: anywhere;
	}

	.page-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.page-dates {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		font-family: var(--font-sans);
		font-size: var(--text-micro);
		line-height: 1.2;
		color: var(--color-muted-ink);
	}

	.blocks {
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
	}

	.no-blocks {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-muted-ink);
	}

	.archive-row {
		display: flex;
		justify-content: flex-start;
		padding-top: 4px;
	}

	.archive-btn {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-ink);
		background: color-mix(in srgb, white 70%, var(--color-lavender));
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		padding: 8px 16px;
		cursor: pointer;
		box-shadow: var(--sticker-shadow);
		-webkit-tap-highlight-color: transparent;
	}

	.footer-doodle {
		display: flex;
		justify-content: center;
		pointer-events: none;
		line-height: 0;
		padding-top: 4px;
	}
</style>
