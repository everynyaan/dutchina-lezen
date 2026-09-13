<script lang="ts">
	import type { PageBlockDrill } from '$lib/state/schema';
	import type { KuromiDrillSet } from '$lib/kuromi/drill';
	import QuizRunner from '$lib/components/kuromi/QuizRunner.svelte';

	interface Props {
		block: PageBlockDrill;
	}

	let { block }: Props = $props();

	let replayNonce = $state(0);

	let drillSet = $derived<KuromiDrillSet>({
		title: block.title,
		intro_quip: block.intro_quip,
		questions: block.questions
	});
</script>

{#key replayNonce}
	<QuizRunner set={drillSet} onreset={() => (replayNonce += 1)} />
{/key}
