<script lang="ts">
	import ChatSheet from '$lib/components/kuromi/ChatSheet.svelte';
	import ConversationList from '$lib/components/kuromi/ConversationList.svelte';
	import AdjustmentsLog from '$lib/components/kuromi/AdjustmentsLog.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';

	// Domi is already in the chat on this hub; the summon button has nothing to offer here.
	// Restore on unmount (cleanup).
	$effect(() => {
		setKuromiVisible(false);
		return () => {
			setKuromiVisible(true);
		};
	});

	let activeConversationId = $state<string | null>(null);
</script>

<div class="kuromi-page">
	<div class="page-header">
		<div class="title-row">
			<h1 class="page-title">Kuromi</h1>
			<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={-6} />
		</div>
		<Doodle
			name="swirl-loops-97"
			size={56}
			color="var(--color-rose-deep)"
			tilt={-3}
			class="title-squiggle"
		/>
		<p class="page-sub">Chat and complain. No LP. No farming.</p>
	</div>

	<div class="hub-stack">
		<section class="conversations-section" aria-label="Conversation history">
			<ConversationList
				activeId={activeConversationId}
				onSelect={(id) => (activeConversationId = id)}
				onNew={() => (activeConversationId = null)}
			/>
		</section>

		<section class="chat-section" aria-label="Chat with Kuromi">
			<ChatSheet open={true} presentation="inline" bind:activeConversationId />
		</section>

		<section class="adjustments-section" aria-label="Adjustments audit log">
			<AdjustmentsLog />
		</section>
	</div>
</div>

<style>
	.kuromi-page {
		padding: 0.5rem 0 1.5rem;
	}

	.page-header {
		margin: 12px 0 4px;
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

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	:global(.title-squiggle) {
		display: block;
		margin: 2px 0 0;
	}

	.page-sub {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-kuromi-mid);
		margin-top: 4px;
	}

	.hub-stack {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-top: 16px;
	}

	.conversations-section {
		max-height: 220px;
		overflow-y: auto;
		padding: 12px;
		background: #fff;
		border: 2px solid var(--color-line);
		border-radius: 16px;
		box-sizing: border-box;
	}

	.chat-section {
		min-height: 50vh;
	}

	@media (min-width: 1200px) {
		.kuromi-page {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 460px;
			align-items: stretch;
			min-height: calc(100vh - 8rem);
			margin: -1.5rem -1.25rem -1.5rem 0;
			padding: 0;
		}

		.page-header {
			padding: 1.5rem 1rem 0 0;
		}

		.page-sub {
			display: none;
		}

		.hub-stack {
			grid-column: 2;
			grid-row: 1 / span 2;
			width: 460px;
			min-height: 100%;
			margin: 0;
			gap: 0;
			border-left: 3px solid var(--color-ink);
			background: #fff;
		}

		.conversations-section {
			max-height: 160px;
			border: none;
			background: transparent;
			border-radius: 0;
		}

		.conversations-section :global(.empty-state) {
			display: none;
		}

		.conversations-section :global(.new-btn),
		.conversations-section :global(.item) {
			border: none !important;
			box-shadow: none !important;
		}

		.adjustments-section {
			display: none;
		}

		.chat-section {
			flex: 1;
			min-height: 0;
		}

		.chat-section :global(.kuromi-shell.inline) {
			width: 460px;
			min-height: 640px;
			border: none !important;
			border-radius: 0 !important;
			box-shadow: none !important;
		}

		.chat-section :global(.sheet-header),
		.chat-section :global(.composer),
		.chat-section :global(.composer-input),
		.chat-section :global(.send-btn),
		.chat-section :global(.history-btn),
		.chat-section :global(.open-hub-btn),
		.chat-section :global(.close-btn) {
			border: none !important;
		}
	}
</style>
