<script lang="ts">
	import { page } from '$app/stores';
	import Character from '$lib/components/art/Character.svelte';
	import KuromiBubble from '$lib/components/reading/KuromiBubble.svelte';
	import ReadinessCapsule from '$lib/components/reading/ReadinessCapsule.svelte';
	import TypeGrid from '$lib/components/reading/TypeGrid.svelte';
	import { openMockResult, setAllTypesOpen } from '$lib/shell/desk.svelte';
	import { resolve } from '$app/paths';
	import { setHistoryLabel } from '$lib/reading/sets';
	import { getGameContext } from '$lib/state/context';

	const ctx = getGameContext();

	let onMock = $derived($page.url.pathname === '/mock' || $page.url.pathname.startsWith('/mock/'));
	let onHome = $derived($page.url.pathname === '/');
	let history = $derived(ctx?.state.readingFork.mocks ?? []);

	function when(iso: string): string {
		const day = iso.slice(0, 10);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
		const [year, month, date] = day.split('-').map(Number);
		return new Date(year, month - 1, date).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<aside class="right-rail" aria-label="Side rail">
	{#if onMock}
		<div class="history">
			<h2 class="rail-title jit-2">History</h2>
			{#if history.length === 0}
				<KuromiBubble mood="hmph" size={44}>
					<p>No mock yet. Start the sealed paper.</p>
				</KuromiBubble>
				<a class="action" href="#mock-start">Start</a>
			{:else}
				{#each history as mock (mock.id)}
					{#if mock.setId}
						<a class="hist" href="{resolve('/sets')}?result={mock.id}">
							<span class="chip">{when(mock.finishedAt)}</span>
							<span class="chip">{setHistoryLabel(mock.setId)}</span>
							<span class="chip">{mock.correct} / {mock.total}</span>
							<span class="chip">line {mock.passLine}</span>
						</a>
					{:else}
						<button type="button" class="hist" onclick={() => openMockResult(mock.id)}>
							<span class="chip">{when(mock.finishedAt)}</span>
							<span class="chip">{mock.paperYear || 'mock'}</span>
							<span class="chip">{mock.correct} / {mock.total}</span>
							<span class="chip">line {mock.passLine}</span>
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	{:else}
		<ReadinessCapsule />
		{#if onHome}
			<TypeGrid limit={3} />
			<button type="button" class="all" onclick={() => setAllTypesOpen(true)}>all types</button>
		{/if}
		<div class="cameo">
			<Character who="piano" mood="dreamy" size={120} animated={false} alt="" />
		</div>
	{/if}
</aside>

<style>
	.right-rail {
		display: none;
	}

	.rail-title {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 20px;
	}

	.history {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.hist {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 10px;
		border-radius: 16px;
		background: color-mix(in srgb, var(--color-teal) 24%, white);
		box-shadow: var(--shadow-offset-pill);
		border: none;
		font: inherit;
		text-align: left;
		text-decoration: none;
		color: var(--color-ink);
		cursor: pointer;
		width: 100%;
	}

	.chip {
		display: inline-flex;
		padding: 3px 8px;
		border-radius: 999px;
		background: white;
		font-size: 14px;
		font-weight: 700;
	}

	.action,
	.all {
		align-self: flex-start;
		font: inherit;
		font-weight: 700;
		font-size: 14px;
		text-decoration: none;
		color: var(--color-ink);
		background: var(--color-rose);
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		padding: 6px 12px;
		cursor: pointer;
		box-shadow: var(--shadow-offset-pill);
	}

	.cameo {
		margin-top: 8px;
		display: flex;
		justify-content: center;
	}

	@media (min-width: 1200px) {
		:global(.frame:not(:has(.reading-desk)):not(:has(.exam-chrome))) .right-rail {
			display: flex;
			flex-direction: column;
			gap: 14px;
			height: 100%;
			min-height: 0;
			overflow-y: auto;
			padding: 24px 16px;
			border-left: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
		}
	}
</style>
