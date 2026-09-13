<script lang="ts">
	import type { DailyQuestion } from '$lib/daily/types';
	import MatchQuestion from './MatchQuestion.svelte';
	import RecallQuestion from './RecallQuestion.svelte';
	import ConversationQuestion from './ConversationQuestion.svelte';
	import LezenQuestion from './LezenQuestion.svelte';
	import LuisterenQuestion from './LuisterenQuestion.svelte';

	interface Props {
		question: DailyQuestion;
		showResult: boolean;
		selectedIndex: number | null;
		selectedLetter: string | null;
		onanswer: (key: number | string) => void;
		expandedLezen: boolean;
		ontoggleexpand: () => void;
	}

	let {
		question,
		showResult,
		selectedIndex,
		selectedLetter,
		onanswer,
		expandedLezen,
		ontoggleexpand
	}: Props = $props();
</script>

{#if question.type === 'match'}
	<MatchQuestion {question} {showResult} {selectedIndex} onanswer={(index) => onanswer(index)} />
{:else if question.type === 'recall'}
	<RecallQuestion {question} {showResult} {selectedIndex} onanswer={(index) => onanswer(index)} />
{:else if question.type === 'conversation'}
	<ConversationQuestion
		{question}
		{showResult}
		{selectedIndex}
		onanswer={(index) => onanswer(index)}
	/>
{:else if question.type === 'lezen'}
	<LezenQuestion
		{question}
		{showResult}
		{selectedLetter}
		onanswer={(letter) => onanswer(letter)}
		expanded={expandedLezen}
		{ontoggleexpand}
	/>
{:else if question.type === 'luisteren'}
	<LuisterenQuestion
		{question}
		{showResult}
		{selectedLetter}
		onanswer={(letter) => onanswer(letter)}
	/>
{/if}
