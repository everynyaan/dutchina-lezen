<script lang="ts">
	import Character from '$lib/components/art/Character.svelte';

	interface Props {
		onSummon: () => void;
	}

	let { onSummon }: Props = $props();
</script>

<div class="resident edge-dashed jit-4">
	<Character who="kuromi" mood="mischief" size={72} alt="" />
	<button type="button" class="rant-btn tappable" onclick={onSummon}>rant here</button>
</div>

<style>
	.resident {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 16px 12px 14px;
		border-radius: 18px;
		background: color-mix(in srgb, var(--color-cream) 55%, white);
		box-shadow: var(--shadow-offset-pill);
	}

	.rant-btn {
		appearance: none;
		border: none;
		cursor: pointer;
		background: var(--color-ink);
		color: var(--color-cream);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		line-height: 1.2;
		padding: 8px 16px;
	}
</style>
