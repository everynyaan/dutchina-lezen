<script lang="ts">
	import ReadingLoop from './ReadingLoop.svelte';

	let {
		passage,
		hideNotebook = false
	}: { passage: { name: string; intro: string; text: string }; hideNotebook?: boolean } = $props();
</script>

<ReadingLoop {passage} {hideNotebook}>
	{#snippet question()}
		<p>Where does she pay?</p>
	{/snippet}
</ReadingLoop>
