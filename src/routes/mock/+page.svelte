<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { pickMockExam, mockReady, passedMock, MOCK_MINUTES, MINUTES_PER_TEXT, PASS_SCORE } from '$lib/reading/mock';
	import TimeBox from '$lib/components/reading/TimeBox.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();
	const today = getTodayDate();
	const exam = pickMockExam(today);
	const allQuestions = exam.passages.flatMap((p) =>
		p.questions.map((q) => ({ ...q, slug: p.slug, passageName: p.name }))
	);

	let started = $state(false);
	let passageIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let flagged = $state<Record<string, boolean>>({});
	let done = $state(false);

	let passage = $derived(exam.passages[passageIndex]);
	let ready = $derived(mockReady(ctx.state.readingFork.lastMockAt, today));

	let correctCount = $derived(
		allQuestions.filter((q) => answers[q.id] === q.answer).length
	);
	let answered = $derived(Object.keys(answers).length);

	function start() {
		started = true;
		playSfx('session_start');
	}

	function select(id: string, letter: string) {
		answers = { ...answers, [id]: letter };
	}

	function finish() {
		done = true;
		const passed = passedMock(correctCount);
		ctx.state.readingFork.lastMockAt = today;
		ctx.state.readingFork.lastMockScore = {
			correct: correctCount,
			total: allQuestions.length,
			passed
		};
		playSfx(passed ? 'rank_up' : 'session_complete');
	}

	function onPaperExpire() {
		finish();
	}
</script>

<div class="mock-page stagger">
	<p class="eyebrow">Exam-day replica · {MOCK_MINUTES} min · pass {PASS_SCORE}</p>
	<h1>Mock exam</h1>
	<p class="lede">
		Dress rehearsal, not weekly. Six texts, computer questions. Flag and move. You need 22, not a
		perfect paper. Don’t hunt one word. Van Dale NT2 pocket is allowed on the real day — bring
		yours; we don’t fake one here.
	</p>

	{#if !started && !done}
		<Card variant="soft-teal">
			{#if !ready && ctx.state.readingFork.lastMockScore}
				<p>
					Last mock: {ctx.state.readingFork.lastMockScore.correct}/{ctx.state.readingFork.lastMockScore.total}
					({ctx.state.readingFork.lastMockScore.passed ? 'pass' : 'not yet'}). Daily eval is the
					habit; this is dress rehearsal — wait a couple of weeks or start anyway if you want.
				</p>
			{/if}
			<p>{exam.year} paper · {exam.passages.length} texts · {allQuestions.length} questions (real booklet, not padded to 36).</p>
			<p class="tiny">Kuromi: 22 of 36. Skip hard. Flag. Don’t hunt one word.</p>
			<button type="button" class="btn" onclick={start}>Start 110:00</button>
			<a class="ghost" href={resolve('/')}>Not today</a>
		</Card>
	{:else if done}
		<Card variant="soft-lavender">
			<h2>{passedMock(correctCount) ? 'That’s a pass line.' : 'Under 22 — the pulse still counts.'}</h2>
			<p>{correctCount} / {allQuestions.length} · cesuur {PASS_SCORE}</p>
			<a class="btn" href={resolve('/eval')}>Back to the 5-minute eval</a>
		</Card>
	{:else}
		<div class="toolbar">
			<TimeBox totalSeconds={MOCK_MINUTES * 60} label="Paper 110" onExpire={onPaperExpire} />
			{#key passageIndex}
				<TimeBox
					totalSeconds={MINUTES_PER_TEXT * 60}
					warnSeconds={120}
					label={`Text ${passageIndex + 1} · ~${MINUTES_PER_TEXT} min`}
				/>
			{/key}
		</div>

		<nav class="texts" aria-label="Texts">
			{#each exam.passages as p, i (p.slug)}
				<button
					type="button"
					class="chip"
					class:on={i === passageIndex}
					onclick={() => (passageIndex = i)}
				>
					{i + 1}
				</button>
			{/each}
		</nav>

		<Card>
			<p class="intro">{passage.intro}</p>
			<div class="text">{passage.text}</div>
		</Card>

		{#each passage.questions as q (q.id)}
			<Card>
				<div class="qhead">
					<p class="q">{q.question}</p>
					<button
						type="button"
						class="flag"
						class:on={flagged[q.id]}
						onclick={() => (flagged = { ...flagged, [q.id]: !flagged[q.id] })}
					>
						{flagged[q.id] ? 'Flagged' : 'Flag'}
					</button>
				</div>
				<div class="opts">
					{#each Object.entries(q.options) as [letter, text] (letter)}
						<button
							type="button"
							class="opt"
							class:picked={answers[q.id] === letter}
							onclick={() => select(q.id, letter)}
						>
							<strong>{letter}</strong>
							{text}
						</button>
					{/each}
				</div>
			</Card>
		{/each}

		<p class="tiny">{answered} answered · {Object.values(flagged).filter(Boolean).length} flagged</p>
		<button type="button" class="btn" onclick={finish}>Hand in</button>
	{/if}
</div>

<style>
	.mock-page {
		padding: 0.5rem 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.eyebrow {
		font-size: var(--text-micro);
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}
	h1,
	h2 {
		font-family: var(--font-display);
		margin: 0;
	}
	h1 {
		font-size: var(--text-hero);
	}
	.lede,
	.intro,
	.q,
	.text {
		line-height: 1.6;
		font-size: var(--text-base);
	}
	.text {
		font-size: 18px;
		white-space: pre-wrap;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.texts {
		display: flex;
		gap: 6px;
	}
	.chip,
	.flag,
	.opt,
	.btn {
		border: 3px solid var(--color-ink);
		background: #fff;
		cursor: pointer;
	}
	.chip {
		width: 36px;
		height: 36px;
		border-radius: 999px;
		font-weight: 700;
	}
	.chip.on,
	.opt.picked {
		background: var(--color-lilac, #ede4ff);
	}
	.qhead {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		align-items: flex-start;
	}
	.flag {
		border-radius: 999px;
		padding: 4px 10px;
		flex-shrink: 0;
	}
	.flag.on {
		background: var(--color-blush);
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}
	.opt {
		text-align: left;
		border-radius: 14px;
		padding: 10px 12px;
	}
	.btn {
		display: inline-flex;
		padding: 10px 16px;
		border-radius: 999px;
		background: var(--color-pink, #ff9bb8);
		font-weight: 700;
		text-decoration: none;
		color: var(--color-ink);
	}
	.ghost {
		margin-left: 8px;
		color: var(--color-ink);
	}
	.tiny {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}
</style>
