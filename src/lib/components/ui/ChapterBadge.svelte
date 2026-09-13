<script lang="ts">
	interface Props {
		n: number | string;
		state?: 'locked' | 'active' | 'done';
		tone?: 'rose' | 'lavender' | 'teal' | 'peach';
		class?: string;
		[key: string]: unknown;
	}

	let { n, state = 'active', tone = 'rose', class: className = '', ...rest }: Props = $props();
</script>

<span class={['chapter-badge', className]} data-state={state} data-tone={tone} {...rest}>
	{#if state === 'done'}
		✓
	{:else}
		{n}
	{/if}
</span>

<style>
	.chapter-badge {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 3px solid var(--color-ink);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-title);
		color: var(--color-ink);
		box-shadow: var(--sticker-shadow);
	}

	.chapter-badge[data-state='active'][data-tone='rose'],
	.chapter-badge[data-state='done'][data-tone='rose'] {
		background: linear-gradient(180deg, var(--color-rose) 0%, #fff 72%);
	}

	.chapter-badge[data-state='active'][data-tone='lavender'],
	.chapter-badge[data-state='done'][data-tone='lavender'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-lavender) 24%, white) 0%,
			#fff 72%
		);
	}

	.chapter-badge[data-state='active'][data-tone='teal'],
	.chapter-badge[data-state='done'][data-tone='teal'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-teal) 42%, white) 0%,
			#fff 72%
		);
	}

	.chapter-badge[data-state='active'][data-tone='peach'],
	.chapter-badge[data-state='done'][data-tone='peach'] {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-peach) 55%, white) 0%,
			#fff 72%
		);
	}

	.chapter-badge[data-state='locked'] {
		background: color-mix(in srgb, var(--color-rose) 34%, white);
		color: var(--color-rose-ink);
		border-color: var(--color-muted-ink);
		opacity: 0.7;
	}
</style>
