<script lang="ts">
	interface Props {
		text: string;
		needle?: string | null;
	}
	let { text, needle = null }: Props = $props();

	let parts = $derived.by(() => {
		if (!needle) return null;
		const at = text.indexOf(needle);
		if (at < 0) return null;
		return {
			before: text.slice(0, at),
			hit: needle,
			after: text.slice(at + needle.length)
		};
	});
</script>

<div class="passage">
	{#if parts}
		{parts.before}<mark>{parts.hit}</mark>{parts.after}
	{:else}
		{text}
	{/if}
</div>

<style>
	.passage {
		white-space: pre-wrap;
		font-size: 18px;
		line-height: 1.6;
		margin: 0.5rem 0 1rem;
	}
	mark {
		background: color-mix(in srgb, var(--color-teal) 45%, white);
		color: inherit;
		padding: 0 2px;
	}
</style>
