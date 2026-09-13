<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { STORY_MAP } from '$lib/conversation/CONVERSATION_CONTENT';
	import { currentGateFromState, getStoriesUpToGate } from '$lib/gates/gates';
	import { GATE_COPY } from '$lib/gates/home';
	import { gateForStoryId } from '$lib/gates/mastery';
	import Card from '$lib/components/ui/Card.svelte';
	import ChapterBadge from '$lib/components/ui/ChapterBadge.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	const ctx = getGameContext();

	let storyId = $derived(page.params.story ?? '');
	let availableStories = $derived(getStoriesUpToGate(currentGateFromState(ctx.state)));
	// Story must exist in content AND be available at the player's rank.
	// A known-but-locked story is treated the same as not-found.
	let story = $derived(availableStories.find((s) => s.id === storyId) ?? null);
	let storyExistsButLocked = $derived(!story && !!STORY_MAP[storyId]);
	let lockLine = $derived.by(() => {
		const g = gateForStoryId(storyId);
		if (g && g > currentGateFromState(ctx.state)) return GATE_COPY[g].when;
		return 'This story is not in an open room yet.';
	});

	function isChapterComplete(chapterId: string): boolean {
		return ctx.state.conversation.readChapters.includes(chapterId);
	}

	/** First incomplete chapter index (visual "active" only; all rows stay navigable). */
	function activeChapterIndex(chapters: { id: string }[]): number {
		const idx = chapters.findIndex((ch) => !ctx.state.conversation.readChapters.includes(ch.id));
		return idx === -1 ? 0 : idx;
	}

	function badgeState(
		chapterId: string,
		index: number,
		activeIdx: number
	): 'locked' | 'active' | 'done' {
		if (isChapterComplete(chapterId)) return 'done';
		if (index === activeIdx) return 'active';
		return 'locked';
	}
</script>

<div class="chapters-page">
	{#if !story}
		<div class="not-found-wrap">
			<Card variant="white" class="not-found-card">
				<div class="not-found-inner">
					<div class="not-found-title">{storyExistsButLocked ? 'Not open yet' : 'Story not found'}</div>
					<p class="not-found-body">
						{#if storyExistsButLocked}
							{lockLine}
						{:else}
							We couldn't find that story. It may have moved, or the link is incomplete.
						{/if}
					</p>
					<a class="not-found-cta r-pill offset-pill" href={resolve('/stories')}>Back to Stories</a>
				</div>
			</Card>
		</div>
	{:else}
		{@const activeIdx = activeChapterIndex(story.chapters)}
		{@const doneCount = story.chapters.filter((ch) => isChapterComplete(ch.id)).length}
		<div class="chapter-list-view">
			<div class="page-header r-card edge-ink offset-card">
				<a class="header-back tappable" href={resolve('/stories')} aria-label="Back to Stories">
					<Icon name="chevron-left" size={20} color="var(--color-ink)" />
				</a>
				<div class="header-text">
					<div class="title-wrap">
						<h1 class="page-title">{story.title}</h1>
						<span class="squiggle">
							<Doodle
								name="speech-bubble-chat-chat-bubble-talk-speak-message-2"
								size={72}
								color="var(--color-lavender-deep)"
								tilt={-3}
							/>
						</span>
					</div>
					<div class="header-meta-row">
						<p class="page-sub">{story.chapters.length} chapters</p>
						<Pill variant="lavender" size="sm">{doneCount} / {story.chapters.length}</Pill>
					</div>
				</div>
				<span class="header-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={28} color="var(--color-lavender-deep)" tilt={4} />
				</span>
			</div>

			<div class="chapter-cards">
				{#each story.chapters as chapter, i (chapter.id)}
					{@const state = badgeState(chapter.id, i, activeIdx)}
					<div class="chapter-row-wrap">
						{#if state === 'active'}
							<span class="active-doodle" aria-hidden="true">
								<Doodle name="arrow-9" size={26} color="var(--color-lavender-deep)" tilt={-5} />
							</span>
						{/if}
						<a
							class="chapter-link tappable"
							href={resolve('/stories/[story]/[chapter]', {
								story: story.id,
								chapter: String(chapter.chapterNumber)
							})}
						>
							<div
								class="chapter-card r-card offset-card edge-hair"
								class:is-locked={state === 'locked'}
							>
								<ChapterBadge
									n={chapter.chapterNumber}
									{state}
									tone="lavender"
									class={`jit-${1 + (i % 5)}`}
								/>
								<div class="chapter-info">
									<div class="chapter-card-title">{chapter.title}</div>
									<div class="chapter-meta">
										{chapter.vocabulary.length} words &middot; {chapter.questions.length} questions
									</div>
								</div>
								<span class="chevron" aria-hidden="true">
									<Icon name="chevron-right" size={16} color="var(--color-muted-ink)" />
								</span>
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.chapters-page {
		padding: 0.35rem 0 calc(32px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
	}

	.chapter-list-view {
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
	}

	.page-header {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 16px 16px 14px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.header-back {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 4px;
		padding: 4px;
		text-decoration: none;
		color: var(--color-ink);
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.header-back:active {
		transform: scale(var(--press-scale));
	}

	.header-text {
		min-width: 0;
		flex: 1;
	}

	.title-wrap {
		position: relative;
		display: inline-block;
		max-width: 100%;
		padding-bottom: 6px;
	}

	.page-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.15;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	.squiggle {
		position: absolute;
		left: 0;
		bottom: -10px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
		opacity: 0.85;
	}

	.title-wrap :global(.doodle) {
		width: 72px !important;
		height: 28px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.header-meta-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 10px;
		flex-wrap: wrap;
	}

	.page-sub {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-lavender-deep);
		line-height: 1.3;
	}

	.header-sparkle {
		flex-shrink: 0;
		padding-top: 2px;
		pointer-events: none;
		line-height: 0;
	}

	.chapter-cards {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.chapter-row-wrap {
		position: relative;
	}

	.active-doodle {
		position: absolute;
		right: 10px;
		top: -12px;
		z-index: 2;
		pointer-events: none;
		line-height: 0;
	}

	.chapter-link {
		display: block;
		text-decoration: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
	}

	.chapter-link:active {
		transform: scale(var(--press-scale));
		filter: brightness(0.96);
	}

	.chapter-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 14px 14px 12px;
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.chapter-card.is-locked {
		opacity: 0.6;
	}

	.chapter-info {
		flex: 1;
		min-width: 0;
	}

	.chapter-card-title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.25;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chapter-meta {
		font-size: var(--text-small);
		color: var(--color-lavender-deep);
		margin-top: 2px;
		line-height: 1.3;
	}

	.chevron {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		line-height: 0;
	}

	.not-found-wrap {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		min-height: 40vh;
		padding: 8px 0;
	}

	.chapters-page :global(.not-found-card) {
		max-width: 360px;
		width: 100%;
		margin: 0 auto;
		padding: 28px 22px;
	}

	.not-found-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}

	.not-found-title {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.not-found-body {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.45;
		max-width: 280px;
	}

	.not-found-cta {
		margin-top: 12px;
		padding: 10px 22px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
		border: 2px solid var(--color-ink);
		color: var(--color-lavender-deep);
		text-decoration: none;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.02em;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.not-found-cta:active {
		transform: scale(var(--press-scale));
	}
</style>
