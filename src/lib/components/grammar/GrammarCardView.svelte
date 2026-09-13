<script lang="ts">
	import type { Snippet } from 'svelte';
	import Bead from '$lib/components/ui/Bead.svelte';
	import FormulaBar from '$lib/components/ui/FormulaBar.svelte';

	interface Props {
		title: string;
		formula: { text: string; variant?: 'default' | 'verb' | 'subject' | 'ghost' }[];
		formulaTone?: 'rose' | 'lavender' | 'teal' | 'peach';
		example: { nl: string; en: string };
		trap?: { title: string; body: string; variant?: 'tip' | 'trap' };
		class?: string;
		aboveTrap?: Snippet;
	}

	let {
		title,
		formula,
		formulaTone = 'rose',
		example,
		trap,
		class: className = '',
		aboveTrap
	}: Props = $props();

	const INK_BY_TONE: Record<'rose' | 'lavender' | 'teal' | 'peach', string> = {
		rose: 'var(--color-rose-ink)',
		lavender: 'var(--color-lavender-deep)',
		teal: 'var(--color-teal-deep)',
		peach: 'var(--color-peach-deep)'
	};

	let resolvedInk = $derived(INK_BY_TONE[formulaTone ?? 'rose']);
</script>

<article class={['grammar-card', className]} style="--gcv-ink: {resolvedInk}">
	<h2 class="card-title">{title}</h2>
	<FormulaBar tone={formulaTone ?? 'rose'} class="card-formula">
		{#each formula as bead, bi (bi)}
			<Bead variant={bead.variant ?? 'default'}>{bead.text}</Bead>
		{/each}
	</FormulaBar>
	<div class="bubble-k example-bubble">
		<span class="example-nl">{example.nl}</span>
		<span class="example-en">{example.en}</span>
	</div>
	{#if trap}
		<div class="callout-wrap">
			{@render aboveTrap?.()}
			<div
				class="callout r-chip"
				class:callout-tip={trap.variant === 'tip'}
				class:callout-trap={trap.variant !== 'tip'}
			>
				<strong class="callout-title">{trap.title}</strong>
				<p class="callout-body">{trap.body}</p>
			</div>
		</div>
	{/if}
</article>

<style>
	.grammar-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}

	.grammar-card:not(:first-child) {
		padding-top: 16px;
		border-top: 1px solid color-mix(in srgb, var(--color-muted-line) 55%, transparent);
	}

	.card-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--gcv-ink);
		margin: 0;
		word-break: break-word;
	}

	:global(.card-formula) {
		width: 100%;
		box-sizing: border-box;
	}

	.example-bubble {
		display: flex;
		flex-direction: column;
		gap: 3px;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		padding: 11px 14px;
	}

	.example-nl {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.5;
		word-break: break-word;
	}

	.example-en {
		font-size: var(--text-base);
		color: var(--color-text);
		line-height: 1.5;
	}

	.callout-wrap {
		position: relative;
	}

	.callout-arrow {
		position: absolute;
		top: -16px;
		left: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.callout {
		padding: 12px 14px;
		font-size: var(--text-small);
		line-height: 1.55;
	}

	.callout-title {
		display: block;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		margin-bottom: 4px;
	}

	.callout-body {
		color: var(--color-text);
	}

	.callout-tip {
		border: 2px dashed var(--color-rose-deep);
		background: color-mix(in srgb, var(--color-rose) 22%, white);
	}

	.callout-tip .callout-title {
		color: var(--color-rose-ink);
	}

	.callout-trap {
		border: 2px solid var(--color-ink);
		background: color-mix(in srgb, var(--color-lavender) 30%, white);
	}

	.callout-trap .callout-title {
		color: var(--color-lavender-deep);
	}
</style>
