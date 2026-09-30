<script lang="ts">
	import { resolve } from '$app/paths';
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
</script>

<div class="playbook">
	<p class="eyebrow">Handbook</p>
	<h1>Playbook</h1>
	<p class="lead">
		Moves, traps, and signal words from the papers. Examples are pulled from the texts, not
		invented.
	</p>

	<section>
		<h2>Time plan</h2>
		<Card variant="soft-teal">
			<p>{TIME_PLAN}</p>
		</Card>
	</section>

	<section>
		<h2>Question types</h2>
		{#each types as card (card.qtype)}
			<Card variant="soft-lavender">
				<h3>{card.label}</h3>
				<p>{card.move}</p>
				<p class="meta">{card.count} of {card.total} official items.</p>
				{#if card.example}
					<p class="meta">{card.example.year}. {card.example.passage}</p>
					<p>{card.example.question}</p>
					<blockquote>{card.example.quote}</blockquote>
				{/if}
				<a href="{resolve('/cards')}?qtype={card.qtype}">Practice this</a>
			</Card>
		{/each}
	</section>

	<section>
		<h2>Traps</h2>
		{#each traps as card (card.trap)}
			<Card variant="soft-peach">
				<h3>{card.label}</h3>
				<p>{card.explanation}</p>
				{#each card.examples as example, index (example.lure)}
					<p class="meta">Example {index + 1}. {example.year}. {example.passage}</p>
					<blockquote>{example.lure}</blockquote>
					<p>{example.why}</p>
				{/each}
			</Card>
		{/each}
	</section>

	<section>
		<h2>Purpose questions</h2>
		<Card variant="soft-rose">
			<p>{purposeLine(purpose)}</p>
			<p>{purpose.decide}</p>
			<ul>
				{#each purpose.keyed as row (`${row.year}-${row.passage}`)}
					<li>{row.year}. {row.passage}. {row.purpose}</li>
				{/each}
			</ul>
		</Card>
	</section>

	<section>
		<h2>Rules texts</h2>
		<p>{RULES_TEXT}</p>
	</section>

	<section>
		<h2>Signal words</h2>
		{#each signals as group (group.name)}
			<h3>{group.name}</h3>
			<ul>
				{#each group.words as hit (hit.word)}
					<li>
						<strong>{hit.word}</strong>
						{#if hit.example}
							{hit.source}. {hit.example}
						{:else}
							Not in these papers.
						{/if}
					</li>
				{/each}
			</ul>
		{/each}
	</section>

	<section>
		<h2>Paragraph roles</h2>
		{#each roles as role (role.role)}
			<Card variant="soft-lavender">
				<h3>{role.label}</h3>
				<p>{role.looksLike}</p>
				{#if role.example}
					<p class="meta">{role.source}</p>
					<blockquote>{role.example}</blockquote>
				{:else}
					<p class="meta">No example in the packs yet.</p>
				{/if}
			</Card>
		{/each}
	</section>

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
	.lead,
	p,
	li {
		line-height: 1.45;
		margin: 0;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}
	.meta {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}
	blockquote {
		margin: 0;
		padding-left: 0.75rem;
		border-left: 3px solid var(--color-ink);
		white-space: pre-wrap;
	}
	a {
		color: var(--color-ink);
		font-weight: 700;
	}
	ul {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.secondary {
		margin-top: 0.5rem;
	}
</style>
