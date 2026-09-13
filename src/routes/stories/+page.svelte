<script lang="ts">
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { currentGateFromState } from '$lib/gates/gates';
	import { initialBrowseGate, storiesForBrowse } from '$lib/gates/browse';
	import GateBrowseFilter from '$lib/components/GateBrowseFilter.svelte';
	import type { ConversationStory } from '$lib/conversation/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Character from '$lib/components/art/Character.svelte';

	const ctx = getGameContext();

	const STORY_EMOJI = ['📖', '🧁', '🌷', '🎀', '☕', '🚲', '🌙', '🍓'];

	let engineGate = $derived(currentGateFromState(ctx.state));
	let browseGate = $state(initialBrowseGate(currentGateFromState(ctx.state)));
	let stories = $derived(storiesForBrowse(browseGate));

	function getStoryProgress(story: ConversationStory): { done: number; total: number } {
		let done = 0;
		for (const ch of story.chapters) {
			if (ctx.state.conversation.readChapters.includes(ch.id)) done++;
		}
		return { done, total: story.chapters.length };
	}

	function isStoryComplete(story: ConversationStory): boolean {
		return story.chapters.every((ch) => ctx.state.conversation.readChapters.includes(ch.id));
	}
</script>

<div class="stories-page">
	<div class="page-header r-card edge-ink offset-card">
		<div class="header-text">
			<div class="title-wrap">
				<h1 class="page-title">Stories</h1>
				<span class="squiggle">
					<Doodle
						name="speech-bubble-chat-chat-bubble-talk-speak-message-2"
						size={72}
						color="var(--color-lavender-deep)"
						tilt={-3}
					/>
				</span>
			</div>
			<p class="page-sub">read, learn words, test yourself</p>
			<GateBrowseFilter
				current={engineGate}
				selected={browseGate}
				noun="stories"
				onSelect={(g) => (browseGate = g)}
			/>
		</div>
		<div class="header-cameo" aria-hidden="true">
			<span class="sparkle">
				<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={4} />
			</span>
			<Character who="piano" mood="peek" size={40} />
		</div>
	</div>

	<div class="story-list">
		{#each stories as story, i (story.id)}
			{@const progress = getStoryProgress(story)}
			{@const complete = isStoryComplete(story)}
			{@const emoji = STORY_EMOJI[i % STORY_EMOJI.length]}
			{@const jitClass = `jit-${1 + (i % 3)}`}
			<a class="story-link tappable" href={resolve('/stories/[story]', { story: story.id })}>
				<div class="story-card r-card offset-card edge-hair">
					<span class="story-emoji" aria-hidden="true">{emoji}</span>
					<div class="story-info">
						<div class="story-title-row">
							<span class="story-title">{story.title}</span>
							{#if complete}
								<span class="check-badge {jitClass}" aria-hidden="true">✓</span>
							{/if}
						</div>
						<div class="story-meta">{story.chapters.length} chapters</div>
					</div>
					<Pill variant="lavender" size="sm">{progress.done} / {progress.total}</Pill>
				</div>
			</a>
		{/each}

		{#if stories.length === 0}
			<div class="empty-state">
				<Card variant="white" class="empty-card">
					<div class="empty-inner">
						<div class="empty-char" aria-hidden="true">
							<Character who="kuromi" mood="question" size={64} />
						</div>
						<p class="empty-title">No stories in this room</p>
						<p class="empty-sub">
							Gate 1 has no Olly chapters. Look up a later gate to browse — that is not unlocking
							them for homework.
						</p>
						<a class="empty-cta r-pill offset-pill" href={resolve('/')}>Back to Home</a>
					</div>
				</Card>
			</div>
		{/if}
	</div>
</div>

<style>
	.stories-page {
		padding: 0.35rem 0 calc(32px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
	}

	.page-header {
		position: relative;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding: 18px 18px 16px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.header-text {
		min-width: 0;
		flex: 1;
	}

	.title-wrap {
		position: relative;
		display: inline-block;
		padding-bottom: 6px;
	}

	.page-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.1;
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

	.page-sub {
		margin-top: 10px;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-lavender-deep);
		line-height: 1.3;
	}

	.header-cameo {
		position: relative;
		flex-shrink: 0;
		padding-top: 2px;
		line-height: 0;
	}

	.sparkle {
		position: absolute;
		top: -10px;
		right: -8px;
		pointer-events: none;
		line-height: 0;
	}

	.story-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.story-link {
		display: block;
		text-decoration: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
		transition:
			transform var(--press-duration) ease,
			filter var(--press-duration) ease;
	}

	.story-link:active {
		transform: scale(var(--press-scale));
		filter: brightness(0.96);
	}

	.story-card {
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

	.story-emoji {
		font-size: 36px;
		line-height: 1;
		flex-shrink: 0;
		width: 1.2em;
		text-align: center;
	}

	.story-info {
		flex: 1;
		min-width: 0;
	}

	.story-title-row {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}

	.story-title {
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

	.story-meta {
		font-size: var(--text-small);
		color: var(--color-lavender-deep);
		margin-top: 2px;
		line-height: 1.3;
	}

	.check-badge {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-teal) 55%, white);
		border: 1.5px solid var(--color-teal-deep);
		color: var(--color-teal-deep);
		font-size: var(--text-small);
		font-weight: 700;
		line-height: 1;
		box-shadow: var(--shadow-offset-pill);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		min-height: 40vh;
		padding: 8px 0;
	}

	.stories-page :global(.empty-card) {
		padding: 28px 22px;
	}

	.empty-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}

	.empty-char {
		line-height: 0;
		margin-bottom: 4px;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.empty-sub {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		max-width: 280px;
		line-height: 1.45;
	}

	.empty-cta {
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

	.empty-cta:active {
		transform: scale(var(--press-scale));
	}
</style>
