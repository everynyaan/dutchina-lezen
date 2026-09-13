<script module lang="ts">
	import type { IconName } from '$lib/icons/icons';
	import type { AdjustmentEntry } from '$lib/state/schema';

	export const TOOL_META: Record<
		AdjustmentEntry['tool'],
		{ label: string; icon: IconName; jit: string }
	> = {
		update_config: { label: 'Update config', icon: 'gear', jit: 'jit-2' },
		award_lp: { label: 'Extra credit', icon: 'bolt', jit: 'jit-5' },
		forgive_streak: { label: 'Forgive streak', icon: 'rotate-left', jit: 'jit-a' },
		create_page: { label: 'Create page', icon: 'pen-line', jit: 'jit-4' },
		update_page: { label: 'Update page', icon: 'pen-line', jit: 'jit-1' },
		archive_page: { label: 'Archive page', icon: 'trash-can', jit: 'jit-7' }
	};

	const TOOL_META_FALLBACK: { label: string; icon: IconName; jit: string } = {
		label: '',
		icon: 'gear',
		jit: 'jit-2'
	};

	/** Lookup helper: known tools use TOOL_META; unknown tools get a neutral fallback. */
	export function toolMeta(tool: string): { label: string; icon: IconName; jit: string } {
		const row = (TOOL_META as Record<string, { label: string; icon: IconName; jit: string }>)[tool];
		if (row) return row;
		return { ...TOOL_META_FALLBACK, label: tool };
	}
</script>

<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import Icon from '$lib/icons/Icon.svelte';

	const ctx = getGameContext();

	const tsFmt = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	const OUTCOME_META: Record<
		AdjustmentEntry['outcome'],
		{ label: string; icon: IconName; jit: string }
	> = {
		applied: { label: 'Applied', icon: 'check', jit: 'jit-3' },
		capped: { label: 'Capped', icon: 'lock', jit: 'jit-b' },
		rejected: { label: 'Rejected', icon: 'xmark', jit: 'jit-6' }
	};

	const PAYLOAD_MAX = 300;

	let entries = $derived(
		[...ctx.state.adjustments].sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		)
	);

	function formatTimestamp(iso: string): string {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return tsFmt.format(d);
	}

	function formatPayload(payload: unknown): string {
		try {
			const raw = JSON.stringify(payload);
			if (typeof raw !== 'string') return String(payload);
			if (raw.length <= PAYLOAD_MAX) return raw;
			return `${raw.slice(0, PAYLOAD_MAX)}…`;
		} catch {
			return '[unserializable]';
		}
	}
</script>

<details class="adj-log edge-ink-2 r-card offset-pill">
	<summary class="adj-summary">
		<span class="summary-mark">
			<Icon name="list-check" size={16} color="var(--color-kuromi-mid)" />
		</span>
		<span class="summary-label jit-4">Adjustments</span>
		<span class="summary-count">{entries.length}</span>
	</summary>

	{#if entries.length === 0}
		<p class="empty">No adjustments yet.</p>
	{:else}
		<ul class="adj-list">
			{#each entries as entry (entry.id)}
				<li class="adj-row" class:is-undone={entry.undone}>
					<div class="row-meta">
						<time class="timestamp" datetime={entry.timestamp}
							>{formatTimestamp(entry.timestamp)}</time
						>
						{#if entry.undone}
							<span class="badge undone-badge r-pill offset-pill jit-c">
								<Icon name="rotate-left" size={14} color="var(--color-rose-ink)" />
								<span>Undone</span>
							</span>
						{/if}
					</div>

					<div class="row-badges">
						<span class="badge tool-badge r-pill offset-pill {toolMeta(entry.tool).jit}">
							<Icon name={toolMeta(entry.tool).icon} size={14} color="var(--color-lavender-deep)" />
							<span>{toolMeta(entry.tool).label}</span>
						</span>
						<span
							class="badge outcome-badge r-pill offset-pill {OUTCOME_META[entry.outcome].jit}"
							data-outcome={entry.outcome}
						>
							<Icon name={OUTCOME_META[entry.outcome].icon} size={14} color="currentColor" />
							<span>{OUTCOME_META[entry.outcome].label}</span>
						</span>
					</div>

					<p class="detail">{entry.detail}</p>

					{#if entry.reason !== ''}
						<p class="reason">
							<span class="reason-label">Reason</span>
							{entry.reason}
						</p>
					{/if}

					<pre class="payload">{formatPayload(entry.payload)}</pre>
				</li>
			{/each}
		</ul>
	{/if}
</details>

<style>
	.adj-log {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-lavender) 18%, white) 0%,
			#fff 70%
		);
		padding: 0;
		overflow: hidden;
		min-width: 0;
	}

	.adj-summary {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		cursor: pointer;
		list-style: none;
		min-width: 0;
		user-select: none;
	}

	.adj-summary::-webkit-details-marker {
		display: none;
	}

	.summary-mark {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.summary-label {
		display: inline-block;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-kuromi);
		line-height: 1.2;
	}

	.summary-count {
		margin-left: auto;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-muted-ink);
		flex-shrink: 0;
	}

	.empty {
		padding: 4px 14px 16px;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: 0;
	}

	.adj-list {
		list-style: none;
		margin: 0;
		padding: 0 14px 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.adj-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid var(--color-muted-line);
		border-radius: 14px;
		background: color-mix(in srgb, white 88%, var(--color-lavender));
		min-width: 0;
	}

	.adj-row.is-undone {
		opacity: 0.85;
	}

	.row-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.timestamp {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.3;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.row-badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px 4px 8px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		line-height: 1.2;
		white-space: nowrap;
	}

	.tool-badge {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 40%, white),
			color-mix(in srgb, var(--color-lavender) 18%, white)
		);
	}

	.outcome-badge {
		color: var(--color-kuromi-mid);
		background: linear-gradient(160deg, color-mix(in srgb, var(--color-ink) 10%, white), #fff);
	}

	.outcome-badge[data-outcome='applied'] {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 35%, white),
			color-mix(in srgb, var(--color-teal) 14%, white)
		);
	}

	.outcome-badge[data-outcome='capped'] {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 42%, white),
			color-mix(in srgb, var(--color-lavender) 16%, white)
		);
	}

	.outcome-badge[data-outcome='rejected'] {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 42%, white),
			color-mix(in srgb, var(--color-rose) 16%, white)
		);
	}

	.undone-badge {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 48%, white),
			color-mix(in srgb, var(--color-rose) 20%, white)
		);
	}

	.detail {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-ink);
		line-height: 1.4;
		overflow-wrap: anywhere;
		word-break: break-word;
		min-width: 0;
	}

	.reason {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.4;
		overflow-wrap: anywhere;
		word-break: break-word;
		min-width: 0;
	}

	.reason-label {
		display: inline-block;
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-kuromi-mid);
		margin-right: 6px;
	}

	.payload {
		margin: 0;
		padding: 8px 10px;
		border-radius: 10px;
		border: 1px solid var(--color-muted-line);
		background: color-mix(in srgb, var(--color-ink) 4%, white);
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.35;
		white-space: pre-wrap;
		word-break: break-word;
		overflow-wrap: anywhere;
		min-width: 0;
		max-width: 100%;
	}
</style>
