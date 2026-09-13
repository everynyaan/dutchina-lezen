<script lang="ts">
	import type { PageBlockGrammarCard } from '$lib/state/schema';
	import GrammarCardView from '$lib/components/grammar/GrammarCardView.svelte';

	interface Props {
		block: PageBlockGrammarCard;
	}

	let { block }: Props = $props();
</script>

<GrammarCardView
	title={block.title}
	formula={block.formula}
	formulaTone={block.formulaTone}
	example={block.example}
	trap={block.trap}
/>
