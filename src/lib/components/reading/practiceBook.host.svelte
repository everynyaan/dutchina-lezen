<script lang="ts">
	import PracticeBook from './PracticeBook.svelte';

	let {
		answers,
		flagged
	}: { answers: Record<string, string>; flagged: Record<string, boolean> } = $props();
</script>

<PracticeBook />
<p class="snap">{JSON.stringify({ answers, flagged })}</p>
