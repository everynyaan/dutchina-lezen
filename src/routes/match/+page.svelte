<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { type WordEntry } from '$lib/data/wordPool';
	import { currentGateFromState, getWordsUpToGate } from '$lib/gates/gates';
	import {
		buildQuestion,
		updateStreak,
		highlightWord,
		shouldResetDaily,
		getTodayDate,
		DAILY_TARGET,
		type MatchQuestion,
		type MatchOption
	} from '$lib/match/engine';
	import { playSfx, playStreakPip } from '$lib/sound/sfx';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import WordHighlight from '$lib/components/WordHighlight.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { resolve } from '$app/paths';

	const ctx = getGameContext();

	// SESSION STATE
	let pool: WordEntry[] = [];
	let question = $state<MatchQuestion | null>(null);
	let streak = $state(0);
	let selectedOption = $state<MatchOption | null>(null);
	let showResult = $state(false);
	let recentIds = new SvelteSet<string>();
	const RECENT_WINDOW = 15;
	let recentQueue: string[] = [];

	// Daily tracking
	let completedToday = $state(0);
	let dailyTargetJustMet = $state(false);

	// Session-scoped accuracy (view state only, never persisted). Used solely
	// to gauge the reactor's "finish" moment (strong/poor) the instant the
	// daily target is hit - mirrors /quiz's 5/5 vs 0-2/5 finish read, scoped
	// to what happened in THIS session since the page mounted.
	let sessionCorrect = $state(0);
	let sessionTotal = $state(0);

	// KUROMI CORNER REACTOR (V3_DESIGN section 8 - same protocol as /quiz)
	// correct -> hehe, wrong -> shocked, strong finish -> excited (animated)
	// + confetti doodle burst, poor finish -> defeated + melody/smile cameo.
	// Character.svelte resolves each mood to its real .gif when one exists
	// and to the manifest's static fallback otherwise (and always collapses
	// to static under prefers-reduced-motion) - we always request animated
	// and let it decide, never hardcode a path.
	type ReactorMood = 'mischief' | 'hehe' | 'shocked' | 'excited' | 'defeated';
	let reactorMood = $state<ReactorMood>('mischief');
	let reactorConfetti = $state(false);
	let reactorConfettiKey = $state(0);
	let consoleCameo = $state(false);
	let reactorTimer: ReturnType<typeof setTimeout> | undefined;

	function revertReactor() {
		reactorMood = 'mischief';
		reactorConfetti = false;
		consoleCameo = false;
	}

	function fireReactor(
		mood: ReactorMood,
		holdMs: number,
		opts?: { confetti?: boolean; console?: boolean }
	) {
		clearTimeout(reactorTimer);
		reactorMood = mood;
		reactorConfetti = !!opts?.confetti;
		if (reactorConfetti) reactorConfettiKey++;
		consoleCameo = !!opts?.console;
		reactorTimer = setTimeout(revertReactor, holdMs);
	}

	// INIT
	function initSession() {
		// Reset daily counter if new day
		if (shouldResetDaily(ctx.state.match.lastMatchDate)) {
			ctx.state.match.completedToday = 0;
			ctx.state.match.lastMatchDate = getTodayDate();
		}
		completedToday = ctx.state.match.completedToday;
		sessionCorrect = 0;
		sessionTotal = 0;

		const gate = currentGateFromState(ctx.state);
		pool = getWordsUpToGate(gate);

		// Session-start cue only when there's actually content to practice.
		// If the pool is empty the empty-state renders instead.
		if (pool.length > 0) playSfx('session_start');

		nextQuestion();
	}

	function nextQuestion() {
		selectedOption = null;
		showResult = false;
		const gate = currentGateFromState(ctx.state);
		question = buildQuestion(pool, ctx.state.rank, recentIds, { fromEntirePool: gate === 1 });
	}

	function trackRecent(id: string) {
		recentQueue.push(id);
		recentIds.add(id);
		if (recentQueue.length > RECENT_WINDOW) {
			const oldest = recentQueue.shift()!;
			recentIds.delete(oldest);
		}
	}

	// ANSWER HANDLING
	function handleSelect(option: MatchOption) {
		if (showResult) return;

		selectedOption = option;
		showResult = true;

		sessionTotal++;
		if (option.isCorrect) sessionCorrect++;

		if (option.isCorrect) {
			streak = updateStreak(streak, true);
			playSfx('correct');
			// Pitch-by-streak pip layered on top of the correct sound.
			// Briefly conveys "the streak is climbing" without competing.
			playStreakPip(streak);

			ctx.applyLpEvent({
				type: 'match_correct',
				streakPipsLit: streak
			});

			// Track best streak for achievements
			if (streak > ctx.state.match.bestStreak) {
				ctx.state.match.bestStreak = streak;
			}

			// Mission: streak update (high-water mark)
			ctx.updateMissions('match_streak', streak);
		} else {
			streak = updateStreak(streak, false);
			playSfx('wrong');
			ctx.applyLpEvent({ type: 'match_wrong' });
		}

		// Track daily count
		completedToday++;
		ctx.state.match.completedToday = completedToday;
		ctx.state.match.lastMatchDate = getTodayDate();

		// Mission: match question answered (correct or wrong)
		ctx.updateMissions('match_questions', 1);

		if (question) trackRecent(question.target.id);

		const justHitTarget = completedToday === DAILY_TARGET && !dailyTargetJustMet;
		if (justHitTarget) {
			dailyTargetJustMet = true;
			playSfx('session_complete');
		}

		// Reactor: a finish moment (strong/poor session accuracy) overrides the
		// plain per-answer reaction on the exact question that hits the daily
		// target; otherwise it's just a correct/wrong beat.
		if (justHitTarget) {
			const ratio = sessionTotal > 0 ? sessionCorrect / sessionTotal : 0;
			if (ratio >= 0.9) {
				fireReactor('excited', 3200, { confetti: true });
			} else if (ratio <= 0.4) {
				fireReactor('defeated', 3200, { console: true });
			} else {
				fireReactor(option.isCorrect ? 'hehe' : 'shocked', option.isCorrect ? 1000 : 2200);
			}
		} else {
			fireReactor(option.isCorrect ? 'hehe' : 'shocked', option.isCorrect ? 1000 : 2200);
		}

		setTimeout(
			() => {
				nextQuestion();
			},
			option.isCorrect ? 1000 : 2200
		);
	}

	// HIGHLIGHT
	let highlight = $derived(
		question ? highlightWord(question.sentenceNl, question.target.dutch) : null
	);

	// Start on mount
	$effect(() => {
		if (pool.length === 0) {
			initSession();
		}
	});
</script>

<div class="match-page">
	<div class="section-head">
		<h1 class="section-title">match</h1>
		<span class="squiggle">
			<Doodle name="shape-swirl-loops-4" size={64} color="var(--color-rose-deep)" tilt={-3} />
		</span>
		<div class="daily-pill r-pill offset-pill">
			{completedToday} / {DAILY_TARGET}
		</div>
	</div>

	{#if dailyTargetJustMet}
		<div class="finish-banner r-chip offset-pill jit-a">
			Daily target reached! Keep going or take a break.
		</div>
	{/if}

	{#if question}
		<!-- SENTENCE CONTEXT (Match's identity hero: rose tint + kuromi reactor) -->
		<section class="sentence-card r-card edge-ink offset-card">
			<span class="sparkle">
				<Doodle name="spark-sparkle-26" size={26} color="var(--color-rose-deep)" tilt={-6} />
			</span>

			<div class="reactor jit-4" aria-hidden="true">
				<Character who="kuromi" mood={reactorMood} animated={true} size={32} />
				{#if reactorConfetti}
					{#key reactorConfettiKey}
						<span class="confetti">
							<Doodle
								name="spark-sparks-sparkle-stars-30"
								size={26}
								color="var(--color-rose-deep)"
							/>
						</span>
					{/key}
				{/if}
			</div>

			{#if consoleCameo}
				<div class="console-cameo jit-b" aria-hidden="true">
					<Character who="melody" mood="smile" animated={true} size={36} />
				</div>
			{/if}

			<div class="sentence-head">
				<div class="sentence-label">translate the highlighted word</div>
				<div class="streak-row" aria-label="Streak: {streak} of 5">
					{#each Array.from({ length: 5 }, (_, idx) => idx) as i (i)}
						<div class="pip" class:lit={i < streak}></div>
					{/each}
					{#if streak > 0}
						<span class="streak-bonus">+{streak}</span>
					{/if}
				</div>
			</div>
			<div class="sentence-row">
				<div class="sentence-text">
					{#if highlight}
						{highlight.before}<WordHighlight word={highlight.word} />{highlight.after}
					{:else}
						{question.sentenceNl}
					{/if}
				</div>
				<div class="speaker-group">
					<SpeakerButton text={question.sentenceNl} />
					<SpeakerButton text={question.sentenceNl} slow />
				</div>
			</div>
			{#if showResult}
				<div class="sentence-en">{question.target.sentence_en}</div>
			{/if}
		</section>

		<!-- OPTIONS -->
		<div class="options">
			{#each question.options as option (option.wordId)}
				{@const isSelected = selectedOption?.wordId === option.wordId}
				{@const showCorrect = showResult && option.isCorrect}
				{@const showWrong = showResult && isSelected && !option.isCorrect}
				<button
					class="option-btn edge-hair r-chip"
					class:correct={showCorrect}
					class:wrong={showWrong}
					class:dimmed={showResult && !isSelected && !option.isCorrect}
					onclick={() => handleSelect(option)}
					disabled={showResult}
				>
					{option.text}
				</button>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<Character who="kuromi" mood="question" size={72} />
			<p class="empty-title">No words ready right now</p>
			<p class="empty-sub">Nothing in this room is due. Try cards or the quiz.</p>
			<span class="empty-arrow">
				<Doodle name="arrow-down-33" size={22} color="var(--color-rose-deep)" tilt={8} />
			</span>
			<a class="empty-cta r-pill offset-pill edge-ink-2" href={resolve('/')}>Back to Home</a>
		</div>
	{/if}
</div>

<style>
	.match-page {
		padding: 0.5rem 0;
	}

	/* SECTION IDENTITY HEADER */
	.section-head {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 8px;
		margin-bottom: 12px;
	}

	.section-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
	}

	.squiggle {
		position: absolute;
		left: 0;
		bottom: -2px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.section-head :global(.squiggle .doodle) {
		width: 64px !important;
		height: 14px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.daily-pill {
		flex-shrink: 0;
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 6px 14px;
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		border: 2px solid var(--color-rose-deep);
	}

	.finish-banner {
		text-align: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		border: 2px solid var(--color-rose-deep);
		padding: 10px 14px;
		margin-bottom: 16px;
	}

	/* SENTENCE CARD - Match's rose identity surface */
	.sentence-card {
		position: relative;
		overflow: visible;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		padding: 20px 16px 18px;
		margin-bottom: 16px;
	}

	.sparkle {
		position: absolute;
		top: -10px;
		left: 14px;
		pointer-events: none;
		line-height: 0;
		z-index: 1;
	}

	.reactor {
		position: absolute;
		top: -14px;
		right: 10px;
		line-height: 0;
		z-index: 2;
	}

	.confetti {
		position: absolute;
		top: -6px;
		left: -6px;
		pointer-events: none;
		line-height: 0;
		animation: confetti-pop 900ms ease-out forwards;
	}

	@keyframes confetti-pop {
		0% {
			opacity: 0;
			transform: scale(0.4) rotate(-10deg);
		}
		40% {
			opacity: 1;
			transform: scale(1.15) rotate(8deg);
		}
		100% {
			opacity: 0;
			transform: scale(1.4) rotate(20deg) translate(6px, -10px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.confetti {
			animation: none;
			opacity: 0;
		}
	}

	.console-cameo {
		position: absolute;
		left: 10px;
		bottom: -14px;
		line-height: 0;
		z-index: 2;
	}

	.sentence-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 12px;
		padding-right: 40px;
	}

	.sentence-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--color-rose-ink);
		text-transform: uppercase;
	}

	.sentence-text {
		font-size: var(--text-title);
		line-height: 1.5;
		color: var(--color-rose-ink);
		flex: 1;
	}

	.sentence-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.speaker-group {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.sentence-en {
		font-size: var(--text-base);
		color: var(--color-rose-ink);
		margin-top: 12px;
		font-style: italic;
		border-top: 2px dashed var(--color-rose-deep);
		padding-top: 10px;
		opacity: 0.9;
	}

	/* STREAK */
	.streak-row {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.pip {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: color-mix(in srgb, white 60%, var(--color-rose));
		border: 1.5px solid var(--color-rose-deep);
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.pip.lit {
		background: var(--color-rose-deep);
		border-color: var(--color-ink);
		box-shadow: 0 0 6px color-mix(in srgb, var(--color-rose-deep) 55%, transparent);
	}

	.streak-bonus {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		color: var(--color-rose-ink);
		letter-spacing: 0.04em;
		margin-left: 2px;
	}

	/* OPTIONS */
	.options {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.option-btn {
		width: 100%;
		padding: 14px 18px;
		background: var(--color-s1);
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--text-lead);
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.option-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-rose) 18%, white);
	}

	.option-btn:active:not(:disabled) {
		transform: scale(var(--press-scale));
	}

	.option-btn.correct {
		border-color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
		color: var(--color-teal-deep);
		box-shadow: var(--shadow-offset-pill);
	}

	.option-btn.wrong {
		border-color: var(--color-rose-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		color: var(--color-rose-ink);
		box-shadow: var(--shadow-offset-pill);
	}

	.option-btn.dimmed {
		opacity: 0.4;
	}

	.option-btn:disabled {
		cursor: default;
	}

	/* EMPTY STATE */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
		gap: 8px;
		color: var(--color-muted-ink);
		text-align: center;
		padding: 0 24px;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: 0.04em;
	}

	.empty-sub {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		max-width: 280px;
		line-height: 1.45;
	}

	.empty-arrow {
		line-height: 0;
	}

	.empty-cta {
		margin-top: 4px;
		display: inline-flex;
		align-items: center;
		padding: 10px 22px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		border-color: var(--color-rose-deep);
		color: var(--color-rose-ink);
		text-decoration: none;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		-webkit-tap-highlight-color: transparent;
	}

	.empty-cta:hover {
		opacity: 0.92;
	}

	.empty-cta:active {
		transform: scale(var(--press-scale));
	}
</style>
