<script lang="ts">
	import { page } from '$app/stores';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { buildKuromiContext } from '$lib/kuromi/context';
	import { startKuromiDrill, pollKuromiDrill } from '$lib/kuromi/drillClient';
	import type { KuromiDrillSet } from '$lib/kuromi/drill';
	import type { KuromiErrorCode } from '$lib/kuromi/types';
	import { WORD_CATEGORIES } from '$lib/data/wordPool';
	import { GRAMMAR_CONTENT } from '$lib/grammar/GRAMMAR_CONTENT';
	import QuizRunner from '$lib/components/kuromi/QuizRunner.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Character from '$lib/components/art/Character.svelte';

	type Phase = 'idle' | 'waiting' | 'running' | 'error';
	type Difficulty = 'easy' | 'medium' | 'hard';

	const ctx = getGameContext();

	let topic = $state('');
	let count = $state(5);
	let difficulty = $state<Difficulty>('medium');
	let phase = $state<Phase>('idle');
	let errorCode = $state<KuromiErrorCode | 'network' | 'timeout' | null>(null);
	let drillSet = $state<KuromiDrillSet | null>(null);
	let waitSeconds = $state(0);
	let waitTimer: ReturnType<typeof setInterval> | null = null;

	const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

	function clampCount(n: number): number {
		if (!Number.isFinite(n)) return 5;
		return Math.min(10, Math.max(1, Math.round(n)));
	}

	function pickTopic(value: string) {
		topic = value;
	}

	function mapError(code: KuromiErrorCode | 'network' | 'timeout'): string {
		if (code === 'network' || code === 'upstream' || code === 'timeout') {
			return 'Ugh. The internet gave up. I refuse to work under these conditions -- try me again.';
		}
		if (code === 'unauthorized' || code === 'not_configured') {
			return 'Something is unplugged behind the scenes and it is not my fault. Tell someone technical.';
		}
		return 'That came out wrong and I am not showing you. Ask me again.';
	}

	function clearWaitTimer() {
		if (waitTimer !== null) {
			clearInterval(waitTimer);
			waitTimer = null;
		}
	}

	function startWaitClock() {
		clearWaitTimer();
		waitSeconds = 0;
		waitTimer = setInterval(() => {
			waitSeconds += 1;
		}, 1000);
	}

	function resetToIdle() {
		clearWaitTimer();
		phase = 'idle';
		errorCode = null;
		drillSet = null;
		waitSeconds = 0;
	}

	async function submitDrill() {
		const trimmed = topic.trim();
		if (!trimmed || phase === 'waiting') return;

		const safeCount = clampCount(count);
		count = safeCount;
		errorCode = null;
		drillSet = null;
		phase = 'waiting';
		startWaitClock();

		const pathname = $page.url.pathname;
		const today = getTodayDate();
		const context = await buildKuromiContext(pathname, ctx.state, today);

		const start = await startKuromiDrill(
			ctx.activeProfile,
			trimmed,
			safeCount,
			difficulty,
			context
		);

		if (!start.ok) {
			clearWaitTimer();
			phase = 'error';
			errorCode = start.code;
			return;
		}

		const poll = await pollKuromiDrill(ctx.activeProfile, start.jobId);
		clearWaitTimer();

		if (!poll.ok) {
			phase = 'error';
			errorCode = poll.code;
			return;
		}

		drillSet = poll.set;
		phase = 'running';
	}
</script>

<section class="drill-panel" aria-label="Make me a drill">
	{#if phase === 'running' && drillSet}
		<QuizRunner set={drillSet} onreset={resetToIdle} />
	{:else if phase === 'waiting'}
		<Card variant="soft-lavender" class="wait-card">
			<div class="wait-eyebrow">Working on it</div>
			<p class="wait-voice">
				Ugh, fine. Building your little sandbox drill. Do not rush me — this takes a minute.
			</p>
			<div class="wait-meter" aria-hidden="true">
				<div
					class="wait-meter-fill"
					style="width: {Math.min(100, (waitSeconds / 20) * 100)}%"
				></div>
			</div>
			<p class="wait-timer" aria-live="polite">{waitSeconds}s so far…</p>
		</Card>
	{:else if phase === 'error' && errorCode}
		<Card variant="soft-rose" class="error-card">
			<div class="error-row">
				<Character
					who="kuromi"
					mood={errorCode === 'network' || errorCode === 'upstream' || errorCode === 'timeout'
						? 'defeated'
						: 'grumpy'}
					size={48}
					animated
					alt=""
				/>
				<p class="error-voice">{mapError(errorCode)}</p>
			</div>
			<button type="button" class="primary-btn" onclick={resetToIdle}>Try again</button>
		</Card>
	{:else}
		<Card variant="soft-rose" class="form-card">
			<div class="form-header">
				<Character who="kuromi" mood="mischief" size={72} alt="" class="form-avatar" />
				<div class="form-header-text">
					<h2 class="form-title">Make me a drill</h2>
					<p class="form-sub">Sandbox only — zero LP, nothing saved.</p>
				</div>
			</div>

			<label class="field-label" for="drill-topic">Topic</label>
			<input
				id="drill-topic"
				class="topic-input"
				type="text"
				bind:value={topic}
				placeholder="e.g. Food & Drink, Word Order…"
				autocomplete="off"
			/>

			<div class="chips" role="group" aria-label="Quick topic picks">
				{#each WORD_CATEGORIES as cat (cat.id)}
					<button type="button" class="chip-btn" onclick={() => pickTopic(cat.label)}>
						<Pill variant="rose" size="sm">{cat.emoji} {cat.label}</Pill>
					</button>
				{/each}
				{#each GRAMMAR_CONTENT as chapter (chapter.id)}
					<button type="button" class="chip-btn" onclick={() => pickTopic(chapter.title)}>
						<Pill variant="lavender" size="sm">{chapter.title}</Pill>
					</button>
				{/each}
			</div>

			<div class="row-fields">
				<div class="field">
					<label class="field-label" for="drill-count">Questions</label>
					<input
						id="drill-count"
						class="count-input"
						type="number"
						min="1"
						max="10"
						bind:value={count}
						onblur={() => {
							count = clampCount(count);
						}}
					/>
				</div>
				<div class="field field-grow">
					<span class="field-label" id="diff-label">Difficulty</span>
					<div class="diff-row" role="group" aria-labelledby="diff-label">
						{#each DIFFICULTIES as d (d)}
							<button
								type="button"
								class="diff-btn"
								class:active={difficulty === d}
								onclick={() => {
									difficulty = d;
								}}
							>
								{d}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<button
				type="button"
				class="primary-btn"
				disabled={!topic.trim()}
				onclick={() => void submitDrill()}
			>
				Make me a drill
			</button>
		</Card>
	{/if}
</section>

<style>
	.drill-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}
	:global(.form-avatar) {
		flex-shrink: 0;
	}
	.form-header-text {
		min-width: 0;
	}

	.form-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-kuromi);
		margin: 0;
		letter-spacing: 0.02em;
	}

	.form-sub {
		font-size: var(--text-small);
		color: var(--color-kuromi-mid);
		margin: 4px 0 0;
	}

	.field-label {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-kuromi-mid);
		margin-bottom: 6px;
	}

	.topic-input,
	.count-input {
		width: 100%;
		padding: 12px 14px;
		border: 2px solid var(--color-kuromi);
		border-radius: 14px;
		background: #fff;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-kuromi);
		outline: none;
		box-sizing: border-box;
	}

	.topic-input:focus,
	.count-input:focus {
		box-shadow: var(--sticker-shadow);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 12px 0 16px;
	}

	.chip-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.chip-btn:active {
		transform: scale(var(--press-scale));
	}

	.row-fields {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		margin-bottom: 16px;
	}

	.field {
		display: flex;
		flex-direction: column;
		min-width: 88px;
	}

	.field-grow {
		flex: 1;
		min-width: 180px;
	}

	.count-input {
		max-width: 96px;
	}

	.diff-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.diff-btn {
		padding: 8px 14px;
		border: 2px solid var(--color-kuromi);
		border-radius: 999px;
		background: var(--color-s1);
		color: var(--color-kuromi);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		text-transform: capitalize;
		cursor: pointer;
		box-shadow: var(--sticker-shadow);
		-webkit-tap-highlight-color: transparent;
	}

	.diff-btn.active {
		background: var(--color-kuromi);
		color: var(--color-cream);
	}

	.diff-btn:hover:not(.active) {
		background: var(--color-blush);
	}

	.primary-btn {
		width: 100%;
		padding: 14px 18px;
		background: var(--color-rose);
		color: var(--color-kuromi);
		border: 2px solid var(--color-kuromi);
		border-radius: 999px;
		box-shadow: var(--sticker-shadow);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.primary-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}

	.primary-btn:not(:disabled):hover {
		background: var(--color-accent);
		color: var(--color-cream);
	}

	.primary-btn:not(:disabled):active {
		transform: scale(var(--press-scale));
	}

	.wait-eyebrow {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-kuromi-mid);
	}

	.wait-voice {
		font-size: var(--text-base);
		line-height: 1.45;
		color: var(--color-text);
		margin: 8px 0 14px;
	}

	.wait-meter {
		height: 10px;
		border-radius: 999px;
		border: 2px solid var(--color-kuromi);
		background: var(--color-s1);
		overflow: hidden;
	}

	.wait-meter-fill {
		height: 100%;
		background: var(--color-lilac);
		transition: width 0.4s ease;
	}

	.wait-timer {
		font-size: var(--text-small);
		color: var(--color-kuromi-mid);
		margin: 10px 0 0;
	}

	.error-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.error-voice {
		font-size: var(--text-base);
		line-height: 1.45;
		color: var(--color-text);
		margin: 0 0 14px;
	}
</style>
