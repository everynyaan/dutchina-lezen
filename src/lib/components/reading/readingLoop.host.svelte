<script lang="ts">
	import ReadingLoop from './ReadingLoop.svelte';

	let { passage }: { passage: { name: string; intro: string; text: string } } = $props();
</script>

<ReadingLoop {passage}>
	{#snippet question()}
		<p>Where does she pay?</p>
	{/snippet}
</ReadingLoop>
