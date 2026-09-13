<script lang="ts">
	import { Plus, MessageSquare } from 'lucide-svelte';
	import { getGameContext } from '$lib/state/context';
	import { sortByRecency } from '$lib/kuromi/conversations';

	interface Props {
		activeId: string | null;
		onSelect: (id: string) => void;
		onNew: () => void;
	}

	let { activeId, onSelect, onNew }: Props = $props();

	const ctx = getGameContext();
	const conversations = $derived(sortByRecency(ctx.state.conversations));

	function formatRelative(iso: string): string {
		const then = new Date(iso).getTime();
		if (Number.isNaN(then)) return 'just now';
		const diffMs = Math.max(0, Date.now() - then);
		const secs = Math.floor(diffMs / 1000);
		if (secs < 60) return 'Just now';
		const mins = Math.floor(secs / 60);
		if (mins < 60) return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
		const days = Math.floor(hours / 24);
		return days === 1 ? '1 day ago' : `${days} days ago`;
	}
</script>

<div class="conversation-list">
	<button type="button" class="new-btn tappable" onclick={() => onNew()}>
		<Plus size={16} aria-hidden="true" />
		<span>New conversation</span>
	</button>

	{#if conversations.length === 0}
		<p class="empty-state">No conversations yet.</p>
	{:else}
		<ul class="list" role="list">
			{#each conversations as c (c.id)}
				<li>
					<button
						type="button"
						class="item"
						class:active={c.id === activeId}
						aria-current={c.id === activeId ? 'true' : undefined}
						onclick={() => onSelect(c.id)}
					>
						<span class="item-icon" aria-hidden="true">
							<MessageSquare size={16} />
						</span>
						<span class="item-text">
							<span class="item-title">{c.title}</span>
							<span class="item-date">{formatRelative(c.updatedAt)}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.conversation-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-height: 0;
	}

	.new-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		align-self: stretch;
		padding: 10px 14px;
		border-radius: 999px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		background: color-mix(in srgb, var(--color-lavender) 40%, white);
		border: 2px solid var(--color-kuromi);
		color: var(--color-kuromi);
		box-shadow: var(--card-shadow);
		transition: transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.new-btn:active {
		transform: scale(var(--press-scale));
	}

	.empty-state {
		margin: 4px 0 0;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		text-align: center;
		line-height: 1.4;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		overflow-y: auto;
		min-height: 0;
	}

	.item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		width: 100%;
		text-align: left;
		padding: 10px 12px;
		border-radius: 14px;
		border: 2px solid var(--color-line);
		background: var(--color-s1);
		color: var(--color-ink);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			transform var(--press-duration) ease;
	}

	.item:hover {
		border-color: var(--color-kuromi);
		background: color-mix(in srgb, var(--color-blush) 55%, white);
	}

	.item:active {
		transform: scale(var(--press-scale));
	}

	.item.active {
		border-color: var(--color-kuromi);
		background: color-mix(in srgb, var(--color-lavender) 32%, white);
		box-shadow: var(--card-shadow);
	}

	.item-icon {
		flex-shrink: 0;
		color: var(--color-kuromi-mid);
		margin-top: 2px;
		display: flex;
	}

	.item.active .item-icon {
		color: var(--color-kuromi);
	}

	.item-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.item-title {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-date {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.3;
	}
</style>
