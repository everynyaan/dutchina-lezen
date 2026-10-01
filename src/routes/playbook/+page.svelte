<script lang="ts">
	import { resolve } from '$app/paths';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import {
		RULES_TEXT,
		TIME_PLAN,
		purposeGuide,
		purposeLine,
		qtypeCards,
		roleCards,
		signalGroups,
		trapCards
	} from '$lib/reading/playbook';

	const types = qtypeCards();
	const traps = trapCards();
	const purpose = purposeGuide();
	const signals = signalGroups();
	const roles = roleCards();

	const chapters = [
		{ id: 'types', n: '1', label: 'Question types' },
		{ id: 'traps', n: '2', label: 'Traps' },
		{ id: 'purpose', n: '3', label: 'Purpose' },
		{ id: 'rules', n: '4', label: 'Rules texts' },
		{ id: 'signals', n: '5', label: 'Signal words' },
		{ id: 'roles', n: '6', label: 'Paragraph roles' }
	] as const;

	type ChapterId = (typeof chapters)[number]['id'];
	let chapter = $state<ChapterId>('types');
</script>

<div class="playbook">
	<p class="eyebrow">Handbook</p>
	<h1>Playbook</h1>
	<span class="jit-2"
		><Doodle name="spark-sparkle-26" size={22} color="var(--color-rose-deep)" /></span
	>
	<span class="jit-4"
		><Doodle name="shape-swirl-loops-4" size={28} color="var(--color-rose-deep)" /></span
	>
	<div class="chips">
		<span class="chip">Moves</span>
		<span class="chip">Traps</span>
		<span class="chip">Signals</span>
	</div>

	<nav class="picks" aria-label="Playbook chapters">
		{#each chapters as row (row.id)}
			<button
				type="button"
				class="pick"
				class:on={chapter === row.id}
				aria-pressed={chapter === row.id}
				aria-label={row.label}
				onclick={() => (chapter = row.id)}
			>
				{row.n}
			</button>
		{/each}
	</nav>

	<section>
		<h2>Time plan</h2>
		<Card variant="soft-teal">
			<p>{TIME_PLAN}</p>
		</Card>
	</section>

	{#if chapter === 'types'}
		<section>
			<h2 class="jit-2">Question types</h2>
			<div class="cols">
				{#each types as card, index (card.qtype)}
					<article class="tile">
						<h3>{card.label}</h3>
						<span class="chip">{card.count} / {card.total}</span>
						{#if index === 0 && card.example}
							<blockquote>{card.example.quote}</blockquote>
						{/if}
						<a href="{resolve('/cards')}?qtype={card.qtype}">Practice this</a>
					</article>
				{/each}
			</div>
		</section>
	{:else if chapter === 'traps'}
		<section>
			<h2 class="jit-3">Traps</h2>
			<div class="cols">
				{#each traps as card, index (card.trap)}
					<article class="tile">
						<h3>{card.label}</h3>
						<span class="chip">{card.examples.length} lures</span>
						{#if index === 0}
							<blockquote>{card.examples[0].lure}</blockquote>
						{/if}
					</article>
				{/each}
			</div>
		</section>
	{:else if chapter === 'purpose'}
		<section>
			<h2 class="jit-a">Purpose questions</h2>
			<div class="chips">
				<span class="chip">{purpose.keyed.length} keyed</span>
				<span class="chip">{purpose.passageCount} passages</span>
			</div>
			<blockquote>{purposeLine(purpose)}</blockquote>
		</section>
	{:else if chapter === 'rules'}
		<section>
			<h2>Rules texts</h2>
			<blockquote>{RULES_TEXT}</blockquote>
		</section>
	{:else if chapter === 'signals'}
		<section>
			<h2>Signal words</h2>
			{#each signals as group (group.name)}
				<h3>{group.name}</h3>
				<div class="chips">
					{#each group.words as hit (hit.word)}
						<span class="chip">{hit.word}</span>
					{/each}
				</div>
			{/each}
		</section>
	{:else}
		<section>
			<h2>Paragraph roles</h2>
			<div class="cols">
				{#each roles as role, index (role.role)}
					<article class="tile">
						<h3>{role.label}</h3>
						{#if index === 0 && role.example}
							<blockquote>{role.example}</blockquote>
						{/if}
					</article>
				{/each}
			</div>
		</section>
	{/if}

	<p class="secondary">
		<a href={resolve('/grammar')}>Patterns</a>
	</p>
</div>

<style>
	.playbook {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0.35rem 0 2rem;
		min-width: 0;
	}
	.eyebrow {
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1,
	h2,
	h3 {
		font-family: var(--font-display);
		margin: 0;
	}
	h1 {
		font-size: var(--text-hero);
		line-height: 1.1;
	}
	h2 {
		font-size: var(--text-title);
		margin-bottom: 0.35rem;
	}
	h3 {
		font-size: var(--text-lead);
	}
	p {
		line-height: 1.45;
		margin: 0;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		display: inline-flex;
		width: fit-content;
		padding: 3px 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-lavender) 40%, white);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.2;
	}
	.picks {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.pick {
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-rose) 55%, white);
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-ink);
		cursor: pointer;
	}
	.pick.on {
		background: var(--color-rose);
		box-shadow: var(--shadow-offset-pill);
	}
	.tile {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 12px;
		border: none;
		border-radius: 18px;
		background: color-mix(in srgb, var(--color-lavender) 22%, white);
		box-shadow: var(--shadow-offset-card);
	}
	blockquote {
		margin: 0;
		padding: 8px 10px;
		border: 2px dashed var(--color-ink);
		border-radius: 14px;
		white-space: pre-wrap;
		font-size: 17px;
	}
	.playbook {
		counter-reset: chapter;
	}
	h2::before {
		counter-increment: chapter;
		content: counter(chapter);
		display: inline-grid;
		place-items: center;
		width: 32px;
		height: 32px;
		margin-right: 8px;
		border-radius: 999px;
		background: var(--color-rose);
		font-size: 16px;
	}
	h3 {
		font-size: 20px;
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	@media (max-width: 800px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
	a {
		color: var(--color-ink);
		font-weight: 700;
	}
	.secondary {
		margin-top: 0.5rem;
	}
</style>
