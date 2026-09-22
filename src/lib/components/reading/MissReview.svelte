<script lang="ts">
	import { findQuestion } from '$lib/reading/bank';
	import { evidenceOf } from '$lib/reading/evidence';
	import { MOVE_LINE, moveOf } from '$lib/reading/moves';
	import { looksLikeWordCopy, WORD_COPY_LINE } from '$lib/reading/wordCopy';
	import PassageText from './PassageText.svelte';

	interface Props {
		questionId: string;
		picked: string;
	}
	let { questionId, picked }: Props = $props();

	let found = $derived(findQuestion(questionId));
	let optionText = $derived(
		found && picked ? (found.question.options[picked] ?? picked) : ''
	);
	let wordCopy = $derived(
		found && optionText ? looksLikeWordCopy(optionText, found.passage.text) : false
	);
	let needle = $derived(found ? evidenceOf(questionId) : '');
	let moveLine = $derived(found ? MOVE_LINE[moveOf(questionId)] : '');
</script>

{#if found}
	<p class="meta">{found.passage.name}</p>
	<PassageText text={found.passage.text} {needle} />
	<p class="q">{found.question.question}</p>
	<p class="line">
		Picked {picked || '—'}{#if optionText}: {optionText}{/if}
	</p>
	<p class="line">Correct {found.question.answer}</p>
	<p class="move">{moveLine}</p>
	{#if wordCopy}
		<p class="echo">{WORD_COPY_LINE}</p>
	{/if}
{/if}

<style>
	.meta {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: 0;
	}
	.q,
	.line,
	.move,
	.echo {
		line-height: 1.5;
		font-size: var(--text-base);
	}
	.move,
	.echo {
		font-weight: 700;
	}
</style>
