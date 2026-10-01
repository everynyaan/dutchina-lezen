<script lang="ts">
	import { paragraphsOf } from '$lib/reading/annotations';
	import {
		isHeading,
		roleChoices,
		ROLE_LABEL,
		type ParagraphMapEntry,
		type ParagraphRole
	} from '$lib/reading/loop';
	import ReadingPane from './ReadingPane.svelte';

	interface Props {
		passage: { name: string; intro: string; text: string };
		entries: ParagraphMapEntry[];
		seed?: string;
		onDone?: () => void;
	}

	let { passage, entries, seed = passage.name, onDone }: Props = $props();

	let step = $state(0);
	let chosen = $state<ParagraphRole | null>(null);

	let paragraphs = $derived(paragraphsOf(passage.text));
	let bodyEntries = $derived(
		entries.filter((entry) => {
			const paragraph = paragraphs[entry.p];
			return paragraph !== undefined && !isHeading(paragraph, entry.p);
		})
	);
	let current = $derived(bodyEntries[step]);
	let choices = $derived(
		current
			? roleChoices(
					current.role,
					bodyEntries.map((entry) => entry.role),
					`${seed}|${current.p}`
				)
			: []
	);
	let right = $derived(chosen !== null && current !== undefined && chosen === current.role);

	function pick(role: ParagraphRole) {
		if (chosen || !current) return;
		chosen = role;
	}

	function next() {
		if (!current) return;
		if (step + 1 >= bodyEntries.length) {
			onDone?.();
			return;
		}
		step += 1;
		chosen = null;
	}
</script>

<div class="map">
	{#if current}
		<ReadingPane {passage} locatedP={current.p} />
		<p class="ask">What does this paragraph mainly do?</p>
		<div class="choices">
			{#each choices as role (role)}
				<button type="button" disabled={chosen !== null} onclick={() => pick(role)}>
					{ROLE_LABEL[role]}
				</button>
			{/each}
		</div>
		{#if chosen && current}
			<p class="verdict">{right ? 'Right.' : 'Not this one.'}</p>
			<p>{current.summary}</p>
			<button type="button" class="next" onclick={next}>
				{step + 1 >= bodyEntries.length ? 'Done' : 'Next'}
			</button>
		{/if}
	{:else}
		<p>No body paragraphs to map.</p>
	{/if}
</div>

<style>
	.map {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.ask {
		margin: 0;
		font-weight: 700;
	}
	.choices {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	button {
		font: inherit;
		text-align: left;
		border: 2px solid var(--color-ink);
		border-radius: 10px;
		background: white;
		padding: 0.45rem 0.7rem;
		cursor: pointer;
	}
	.verdict {
		margin: 0;
		font-weight: 700;
	}
	p {
		margin: 0;
	}
</style>
