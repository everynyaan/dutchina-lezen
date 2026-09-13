<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { getISOWeekKey } from '$lib/time/week';
	import { getTodayDate } from '$lib/match/engine';
	import { currentGateFromState } from '$lib/gates/gates';
	import {
		GATE_COPY,
		homeworkGateForHub,
		hubLinks,
		hubWords,
		parseGateQuery,
		resolveHub
	} from '$lib/gates/home';
	import { evaluateGateProgress, hubChecks, masteryInputFromState } from '$lib/gates/progress';
	import Icon from '$lib/icons/Icon.svelte';
	import WeeksetCard from '$lib/components/home/WeeksetCard.svelte';
	import HubMastery from '$lib/components/home/HubMastery.svelte';

	const ctx = getGameContext();

	let current = $derived(currentGateFromState(ctx.state));
	let requested = $derived(parseGateQuery(page.url.searchParams.get('n')));
	let hub = $derived(resolveHub(requested, current));
	let links = $derived(hubLinks(hub));
	let words = $derived(hubWords(hub));
	let homeworkGate = $derived(homeworkGateForHub(hub, current));

	let dailyState = $derived(ctx.state.dailyHomework);
	let dailyIsThisWeek = $derived(
		dailyState.date === getISOWeekKey() &&
			Array.isArray(dailyState.questions) &&
			dailyState.questions.length > 0
	);
	let dailyTotal = $derived(dailyIsThisWeek ? (dailyState.questions as unknown[]).length : 0);
	let dailyAnswered = $derived(dailyIsThisWeek ? Object.keys(dailyState.results).length : 0);
	let dailyCorrect = $derived(
		dailyIsThisWeek ? Object.values(dailyState.results).filter((v) => v === true).length : 0
	);

	let today = $derived(getTodayDate());
	let quizIsToday = $derived(ctx.state.dailyQuiz.date === today);
	let quizAnswered = $derived(quizIsToday ? Object.keys(ctx.state.dailyQuiz.results).length : 0);
	let quizDone = $derived(quizIsToday && ctx.state.dailyQuiz.completed);
	let quizState = $derived(quizDone ? 'done' : quizAnswered > 0 ? `${quizAnswered}/5` : 'open');

	let lockLine = $derived(
		hub.kind === 'locked' ? GATE_COPY[hub.requested].when : ''
	);
	let title = $derived(
		hub.kind === 'open' ? GATE_COPY[hub.gate].title : GATE_COPY[hub.requested].title
	);
	let gateNum = $derived(hub.kind === 'open' ? hub.gate : hub.requested);
	let openProgress = $derived(
		hub.kind === 'open'
			? evaluateGateProgress(
					hub.gate,
					current,
					ctx.state.gates.mastered,
					masteryInputFromState(ctx.state)
				)
			: null
	);
	let openChecks = $derived(openProgress ? hubChecks(openProgress) : []);
</script>

<div class="hub">
	<a href={resolve('/')} class="back-link">
		<Icon name="chevron-left" size={16} color="var(--color-muted-ink)" />
		<span>Home</span>
	</a>

	<header class="head">
		<p class="kicker">Gate {gateNum}</p>
		<h1 class="title">{title}</h1>
	</header>

	{#if hub.kind === 'locked'}
		<p class="lock-line" role="status">{lockLine}</p>
	{:else}
		{#if openProgress}
			<HubMastery progress={openProgress} checks={openChecks} gate={gateNum} {title} />
		{/if}

		<div class="actions">
			{#if links.includes('quiz')}
				<a class="card r-card offset-card edge-hair card-teal" href={resolve('/quiz')}>
					<span class="label">today's quiz</span>
					<span class="sub">{quizState}</span>
				</a>
			{/if}

			{#if links.includes('weekset')}
				<WeeksetCard
					total={dailyTotal}
					answered={dailyAnswered}
					correct={dailyCorrect}
					completed={dailyState.completed}
					lpEarned={dailyState.lpEarned}
					isThisWeek={dailyIsThisWeek}
				/>
			{/if}

			{#if links.includes('words')}
				<a class="card r-card offset-card edge-hair card-rose" href={resolve('/vocab')}>
					<span class="label">words</span>
					<span class="sub">{words.length} in this gate</span>
				</a>
			{/if}

			{#if links.includes('grammar')}
				<a class="card r-card offset-card edge-hair card-lavender" href={`${resolve('/grammar')}#drills`}>
					<span class="label">grammar</span>
					<span class="sub">de/het, verb second, ik/jij/hij</span>
				</a>
			{/if}

			{#if links.includes('boss')}
				<a class="card r-card offset-card edge-hair card-boss" href={resolve('/boss')}>
					<span class="label">boss</span>
					<span class="sub">optional — fun, not a key</span>
				</a>
			{/if}
		</div>

		{#if links.includes('lezen')}
			<p class="exam-quiet">
				<a href={resolve('/lezen')}>Reading</a>
				<span aria-hidden="true"> · </span>
				<a href={resolve('/luisteren')}>Listening</a>
				<span class="exam-note">B1 paper, optional</span>
			</p>
		{/if}

		{#if homeworkGate == null}
			<p class="sr-only">No homework generator on this screen.</p>
		{/if}
	{/if}
</div>

<style>
	.hub {
		padding: 0.35rem 0 calc(32px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		text-decoration: none;
		width: fit-content;
	}

	.kicker {
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0;
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
		margin: 4px 0 0;
		color: var(--color-ink);
	}

	.lock-line {
		font-size: var(--text-base);
		line-height: 1.45;
		color: var(--color-muted-ink);
		margin: 0;
		max-width: 36rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 88px;
		padding: 16px 18px;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-base);
		letter-spacing: -0.02em;
	}

	.sub {
		font-size: var(--text-small);
		opacity: 0.9;
	}

	.card-teal {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 50%, white),
			color-mix(in srgb, var(--color-teal) 22%, white)
		);
	}

	.card-rose {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 50%, white),
			color-mix(in srgb, var(--color-rose) 22%, white)
		);
	}

	.card-lavender {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 50%, white),
			color-mix(in srgb, var(--color-lavender) 22%, white)
		);
	}

	.card-boss {
		background: var(--color-realm-bg);
		color: var(--color-orchid);
	}

	.exam-quiet {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: 4px 0 0;
	}

	.exam-quiet a {
		color: inherit;
		text-decoration: none;
	}

	.exam-quiet a:hover {
		color: var(--color-ink);
	}

	.exam-note {
		margin-left: 8px;
		opacity: 0.8;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
