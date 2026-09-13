<script lang="ts">
	import type { PageBlock } from '$lib/state/schema';
	import GrammarCardBlock from './GrammarCardBlock.svelte';
	import VocabSetBlock from './VocabSetBlock.svelte';
	import DrillBlock from './DrillBlock.svelte';
	import ReadBlock from './ReadBlock.svelte';
	import NoteBlock from './NoteBlock.svelte';

	interface Props {
		block: PageBlock;
	}

	let { block }: Props = $props();
</script>

{#if block.type === 'grammar-card'}
	<GrammarCardBlock {block} />
{:else if block.type === 'vocab-set'}
	<VocabSetBlock {block} />
{:else if block.type === 'drill'}
	<DrillBlock {block} />
{:else if block.type === 'read'}
	<ReadBlock {block} />
{:else if block.type === 'note'}
	<NoteBlock {block} />
{/if}
