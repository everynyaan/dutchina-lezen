<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getGameContext } from '$lib/state/context';
	import { STORY_MAP } from '$lib/conversation/CONVERSATION_CONTENT';
	import { currentGateFromState, getStoriesUpToGate } from '$lib/gates/gates';
	import { GATE_COPY } from '$lib/gates/home';
	import { gateForStoryId } from '$lib/gates/mastery';
	import type { ConversationQuestion } from '$lib/conversation/types';
	import type { DailyConversationQuestion } from '$lib/daily/types';
	import { playSfx } from '$lib/sound/sfx';
	import { speak, stopSpeaking } from '$lib/audio/tts';
	import { Play, Pause, Gauge } from 'lucide-svelte';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Bubble from '$lib/components/ui/Bubble.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import ConversationQuestionCard from '$lib/components/question/ConversationQuestion.svelte';

	const ctx = getGameContext();

	// Same fallback key the SpeakerButton uses. Without this, the
	// chapter playback would fall back to the browser voice every
	// time, which is fine but worse quality.
	const FALLBACK_TTS_KEY = 'AIzaSyCVAh2sR1nWsS-Gi_dEeeh0mLho6KSo2RU';

	// ============================================================
	// ROUTE PARAMS (reactive — component instance is reused across
	// chapter-to-chapter navigations within the same route)
	// ============================================================
	let storyId = $derived(page.params.story ?? '');
	let chapterNum = $derived(Number(page.params.chapter));
	let availableStories = $derived(getStoriesUpToGate(currentGateFromState(ctx.state)));
	let story = $derived(availableStories.find((s) => s.id === storyId) ?? null);
	let storyExistsButLocked = $derived(!story && !!STORY_MAP[storyId]);
	let lockLine = $derived.by(() => {
		const g = gateForStoryId(storyId);
		if (g && g > currentGateFromState(ctx.state)) return GATE_COPY[g].when;
		return 'This story is not in an open room yet.';
	});
	let chapter = $derived(story?.chapters.find((c) => c.chapterNumber === chapterNum) ?? null);
	let chapterKey = $derived(`${page.params.story}:${page.params.chapter}`);

	let chapterIndex = $derived(
		story && chapter ? story.chapters.findIndex((c) => c.id === chapter.id) : -1
	);
	let prevChapter = $derived(story && chapterIndex > 0 ? story.chapters[chapterIndex - 1] : null);
	let nextChapter = $derived(
		story && chapterIndex >= 0 && chapterIndex < story.chapters.length - 1
			? story.chapters[chapterIndex + 1]
			: null
	);

	// ============================================================
	// READING / QUIZ STATE
	// ============================================================
	type ReadingStep = 'read' | 'vocab' | 'quiz';

	let readingStep = $state<ReadingStep>('read');

	// Quiz state
	let quizIndex = $state(0);
	let showQuizResult = $state(false);
	let quizWasCorrect = $state(false);
	let selectedQuizOption = $state<number | null>(null);
	let quizCorrectCount = $state(0);
	let quizFinished = $state(false);

	// ============================================================
	// CHAPTER PLAYBACK STATE MACHINE
	//
	// idle: nothing playing, cursor at chapter start (0, 0).
	// playing: walking through sentences sequentially.
	// paused: cursor frozen at the last-played sentence, ready to resume.
	//
	// playbackToken is a generation counter. Every state change that
	// should cancel an in-flight loop bumps it; the loop checks the
	// token before each await and bails if the value moved on.
	// ============================================================
	type PlaybackState = 'idle' | 'playing' | 'paused';

	let playbackState = $state<PlaybackState>('idle');
	let playbackSpeed = $state<1 | 0.75>(1);
	let playbackPIdx = $state(0);
	let playbackSIdx = $state(0);
	let playbackToken = 0;

	function bumpToken(): number {
		playbackToken = (playbackToken + 1) | 0;
		return playbackToken;
	}

	function scrollSentenceIntoView(pi: number, si: number) {
		requestAnimationFrame(() => {
			const el = document.querySelector<HTMLElement>(`[data-sentence-key="${pi}-${si}"]`);
			if (!el) return;
			const rect = el.getBoundingClientRect();
			// Bring the sentence to roughly the middle of the viewport
			// if it's near the top edge or below the 65% mark. Avoids
			// jitter when the sentence is already comfortably visible.
			if (rect.top < 80 || rect.bottom > window.innerHeight * 0.65) {
				el.scrollIntoView({ block: 'center', behavior: 'smooth' });
			}
		});
	}

	async function runPlayback(startPI: number, startSI: number, myToken: number): Promise<void> {
		const apiKey = ctx.state.tts.googleApiKey || FALLBACK_TTS_KEY;
		let pi = startPI;
		let si = startSI;

		while (pi < paragraphs.length) {
			if (playbackToken !== myToken) return;
			const sentences = paragraphs[pi].sentences;
			while (si < sentences.length) {
				if (playbackToken !== myToken) return;

				playbackPIdx = pi;
				playbackSIdx = si;
				scrollSentenceIntoView(pi, si);

				await speak(sentences[si], apiKey, playbackSpeed);

				if (playbackToken !== myToken) return;
				si++;
			}
			pi++;
			si = 0;
		}

		// Reached end of chapter naturally
		playbackState = 'idle';
		playbackPIdx = 0;
		playbackSIdx = 0;
	}

	function playChapter() {
		// Resume from current cursor if paused, otherwise from origin.
		const startPI = playbackState === 'paused' ? playbackPIdx : 0;
		const startSI = playbackState === 'paused' ? playbackSIdx : 0;
		const myToken = bumpToken();
		playbackState = 'playing';
		runPlayback(startPI, startSI, myToken).catch(() => {
			// runPlayback never throws — defensive
			playbackState = 'idle';
		});
	}

	function pausePlayback() {
		bumpToken();
		stopSpeaking();
		playbackState = 'paused';
	}

	function togglePlayback() {
		if (playbackState === 'playing') {
			pausePlayback();
		} else {
			playChapter();
		}
	}

	function toggleSpeed() {
		// Flip between normal and slow. If actively playing, the next
		// sentence will use the new rate (current-sentence rate is set
		// inside the Audio element and can't be retroactively changed
		// without re-fetching).
		playbackSpeed = playbackSpeed === 1 ? 0.75 : 1;
	}

	function stopPlayback() {
		bumpToken();
		stopSpeaking();
		playbackState = 'idle';
		playbackPIdx = 0;
		playbackSIdx = 0;
	}

	// Cancel any in-flight playback when the user leaves the reading page.
	onDestroy(() => {
		stopPlayback();
	});

	// ============================================================
	// SENTENCE SPLITTING (for TTS highlighting)
	// ============================================================
	interface StoryParagraph {
		sentences: string[];
	}

	function splitIntoParagraphs(text: string): StoryParagraph[] {
		return text
			.split(/\n\n+/)
			.filter((p) => p.trim())
			.map((para) => {
				// Split paragraph into sentences on sentence-ending punctuation
				// followed by space and uppercase letter (start of next sentence).
				// Keeps punctuation with the preceding sentence.
				const parts = para.trim().split(/(?<=[.!?][''""]?)\s+(?=[A-ZÀ-ÖØ-Þ''"])/);
				return { sentences: parts.map((s) => s.trim()).filter((s) => s.length > 0) };
			});
	}

	let paragraphs = $derived<StoryParagraph[]>(chapter ? splitIntoParagraphs(chapter.text) : []);

	let selectedKey = $state<string | null>(null);
	let selectedText = $state<string | null>(null);
	let popoverPos = $state<{ top: number; left: number } | null>(null);

	function handleSentenceClick(e: MouseEvent, pIdx: number, sIdx: number, text: string) {
		// Tap-to-jump: when chapter playback is active, tapping a
		// sentence cancels current playback and continues sequentially
		// from there. The popover is suppressed in that mode since
		// the user clearly wants the chapter to keep flowing.
		if (playbackState === 'playing' || playbackState === 'paused') {
			clearSentenceSelection();
			playbackPIdx = pIdx;
			playbackSIdx = sIdx;
			const myToken = bumpToken();
			stopSpeaking();
			playbackState = 'playing';
			runPlayback(pIdx, sIdx, myToken).catch(() => {
				playbackState = 'idle';
			});
			return;
		}

		const key = `${pIdx}-${sIdx}`;
		if (selectedKey === key) {
			selectedKey = null;
			selectedText = null;
			popoverPos = null;
			return;
		}
		selectedKey = key;
		selectedText = text;

		const span = e.currentTarget as HTMLElement;
		const card = span.closest('.story-text-card') as HTMLElement;
		if (!card) return;
		const spanRect = span.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();

		popoverPos = {
			top: spanRect.top - cardRect.top - 42,
			left: Math.max(0, Math.min(spanRect.left - cardRect.left, cardRect.width - 110))
		};
	}

	function clearSentenceSelection() {
		selectedKey = null;
		selectedText = null;
		popoverPos = null;
	}

	// ============================================================
	// DERIVED
	// ============================================================
	let currentQuestion = $derived<ConversationQuestion | null>(
		chapter && quizIndex < chapter.questions.length ? chapter.questions[quizIndex] : null
	);

	/** Pure presentational adapter: chapter questions → DailyConversationQuestion for the shared renderer. */
	function excerptOf(text: string): string {
		const paragraphs = text
			.split(/\n\n+/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0);
		if (paragraphs.length === 0) return '';
		return paragraphs.slice(0, Math.min(2, paragraphs.length)).join('\n\n');
	}

	let dailyQuizQuestion = $derived<DailyConversationQuestion | null>(
		currentQuestion && chapter
			? {
					type: 'conversation',
					questionId: currentQuestion.id,
					chapterId: chapter.id,
					excerpt: excerptOf(chapter.text),
					text: currentQuestion.text,
					options: currentQuestion.options,
					correctIndex: currentQuestion.correctIndex
				}
			: null
	);

	// Reset per-chapter local state when the route params change.
	// Component instance is reused for prev/next chapter nav, so
	// onDestroy will NOT fire — stopPlayback must run here too.
	$effect(() => {
		// chapterKey establishes the dependency so prev/next chapter nav
		// (same component instance) resets local state.
		const key = chapterKey;
		stopPlayback();
		readingStep = 'read';
		clearSentenceSelection();
		quizIndex = 0;
		quizCorrectCount = 0;
		quizFinished = false;
		showQuizResult = false;
		quizWasCorrect = false;
		selectedQuizOption = null;
		// Only start a session when params resolve to real content.
		// Reading story/chapter here also tracks them; that's fine.
		if (key && story && chapter) {
			playSfx('session_start');
		}
	});

	// ============================================================
	// READING FLOW
	// ============================================================
	function goToVocab() {
		stopPlayback();
		readingStep = 'vocab';
		playSfx('story_page_turn');
	}

	function goToQuiz() {
		stopPlayback();
		readingStep = 'quiz';
		playSfx('story_page_turn');
		quizIndex = 0;
		quizCorrectCount = 0;
		quizFinished = false;
		showQuizResult = false;
		selectedQuizOption = null;
	}

	// ============================================================
	// QUIZ
	// ============================================================
	function handleQuizSelect(optionIndex: number) {
		if (!currentQuestion || showQuizResult) return;

		selectedQuizOption = optionIndex;
		const correct = optionIndex === currentQuestion.correctIndex;
		showQuizResult = true;
		quizWasCorrect = correct;

		if (correct) {
			quizCorrectCount++;
			playSfx('correct');
			ctx.applyLpEvent({ type: 'conversation_correct' });
			ctx.updateMissions('conversation_correct', 1);
		} else {
			playSfx('wrong');
		}

		// Persist question result
		ctx.state.conversation.questionResults[currentQuestion.id] = {
			correct,
			attemptedAt: new Date().toISOString()
		};

		setTimeout(
			() => {
				advanceQuiz();
			},
			correct ? 1500 : 2500
		);
	}

	function advanceQuiz() {
		if (!chapter) return;

		const nextIdx = quizIndex + 1;
		if (nextIdx >= chapter.questions.length) {
			quizFinished = true;
			showQuizResult = false;
			playSfx('session_complete');

			// Mark chapter as read
			if (!ctx.state.conversation.readChapters.includes(chapter.id)) {
				ctx.state.conversation.readChapters = [...ctx.state.conversation.readChapters, chapter.id];
			}
		} else {
			quizIndex = nextIdx;
			showQuizResult = false;
			selectedQuizOption = null;
		}
	}
</script>

<div class="reading-page">
	{#if !story || !chapter}
		<div class="not-found-wrap">
			<Card variant="white" class="not-found-card">
				<div class="not-found-inner">
					<div class="not-found-title">
						{#if storyExistsButLocked}
							Not open yet
						{:else if !story}
							Story not found
						{:else}
							Chapter not found
						{/if}
					</div>
					<p class="not-found-body">
						{#if storyExistsButLocked}
							{lockLine}
						{:else if !story}
							We couldn't find that story. It may have moved, or the link is incomplete.
						{:else}
							That chapter isn't in this story. Pick another from the chapter list.
						{/if}
					</p>
					<a class="not-found-cta r-pill offset-pill" href={resolve('/stories')}>Back to Stories</a>
				</div>
			</Card>
		</div>
	{:else if quizFinished}
		<!-- QUIZ SUMMARY -->
		<div class="summary-view">
			<Card variant="soft-teal" class="summary-card">
				<div class="summary-header">
					<div class="summary-title-wrap">
						<div class="summary-title">Chapter Complete</div>
						<span class="summary-swirl" aria-hidden="true">
							<Doodle
								name="swirl-loops-97"
								size={36}
								color="var(--color-lavender-deep)"
								tilt={-4}
							/>
						</span>
					</div>
					<span class="summary-sparkle" aria-hidden="true">
						<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={5} />
					</span>
				</div>
				<div class="summary-name">{chapter.title}</div>

				<div class="summary-score">
					<span class="score-num">{quizCorrectCount}</span>
					<span class="score-sep">/</span>
					<span class="score-den">{chapter.questions.length}</span>
				</div>
				<div class="score-label">correct</div>

				{#if chapter.summary}
					<div class="chapter-summary">
						<div class="summary-heading">Summary</div>
						<Bubble side="left" class="summary-bubble">
							{chapter.summary}
						</Bubble>
					</div>
				{/if}

				<a class="action-btn" href={resolve('/stories/[story]', { story: story.id })}>
					Back to Chapters
				</a>

				<nav class="chapter-nav" aria-label="Chapter navigation">
					{#if prevChapter}
						<a
							class="chapter-nav-btn"
							href={resolve('/stories/[story]/[chapter]', {
								story: story.id,
								chapter: String(prevChapter.chapterNumber)
							})}
						>
							← Prev
						</a>
					{:else}
						<span class="chapter-nav-btn disabled" aria-disabled="true">← Prev</span>
					{/if}
					{#if nextChapter}
						<a
							class="chapter-nav-btn primary"
							href={resolve('/stories/[story]/[chapter]', {
								story: story.id,
								chapter: String(nextChapter.chapterNumber)
							})}
						>
							Next →
						</a>
					{:else}
						<span class="chapter-nav-btn disabled" aria-disabled="true">Next →</span>
					{/if}
				</nav>
			</Card>
		</div>
	{:else if readingStep === 'read'}
		<!-- READ -->
		<div class="reading-view">
			<div class="reading-header">
				<a
					class="header-back tappable"
					href={resolve('/stories/[story]', { story: story.id })}
					aria-label="Back to Chapters"
					onclick={() => stopPlayback()}
				>
					<Icon name="chevron-left" size={20} color="var(--color-ink)" />
				</a>
				<div class="header-text">
					<div class="title-wrap">
						<div class="header-title">{story.title}</div>
						<span class="squiggle" aria-hidden="true">
							<Doodle
								name="speech-bubble-chat-chat-bubble-talk-speak-message-2"
								size={72}
								color="var(--color-lavender-deep)"
								tilt={-3}
							/>
						</span>
					</div>
					<div class="header-step">Reading</div>
				</div>
				<span class="header-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={28} color="var(--color-lavender-deep)" tilt={4} />
				</span>
			</div>

			<div class="chapter-meta-row">
				<div class="chapter-title-bar">
					Chapter {chapter.chapterNumber}: {chapter.title}
				</div>
				<div class="play-fab" class:active={playbackState !== 'idle'}>
					<button
						class="play-fab-speed"
						class:slow={playbackSpeed === 0.75}
						onclick={toggleSpeed}
						aria-label={playbackSpeed === 1
							? 'Switch to slow playback'
							: 'Switch to normal playback'}
					>
						<Gauge size={16} />
						<span class="play-fab-speed-label">{playbackSpeed === 1 ? '1.0×' : '0.75×'}</span>
					</button>
					<button
						class="play-fab-main"
						onclick={togglePlayback}
						aria-label={playbackState === 'playing'
							? 'Pause chapter playback'
							: 'Play chapter aloud'}
					>
						{#if playbackState === 'playing'}
							<Pause size={20} />
						{:else}
							<Play size={20} />
						{/if}
					</button>
				</div>
			</div>

			<div class="story-text-card">
				<div class="story-text">
					{#each paragraphs as para, pi (pi)}
						<p class="story-para">
							{#each para.sentences as sentence, si (si)}
								<span
									class="story-sentence"
									class:selected={selectedKey === `${pi}-${si}`}
									class:playing={playbackState !== 'idle' &&
										playbackPIdx === pi &&
										playbackSIdx === si}
									data-sentence-key="{pi}-{si}"
									onclick={(e) => handleSentenceClick(e, pi, si, sentence)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleSentenceClick(e as unknown as MouseEvent, pi, si, sentence);
										}
									}}
									role="button"
									tabindex="0"
									>{sentence}
								</span>
							{/each}
						</p>
					{/each}
				</div>

				{#if selectedText && popoverPos}
					<div class="tts-popover" style="top: {popoverPos.top}px; left: {popoverPos.left}px;">
						<SpeakerButton text={selectedText} />
						<SpeakerButton text={selectedText} slow />
					</div>
				{/if}
			</div>

			<button class="action-btn" onclick={goToVocab}>Continue to Vocabulary</button>

			<nav class="chapter-nav" aria-label="Chapter navigation">
				{#if prevChapter}
					<a
						class="chapter-nav-btn"
						href={resolve('/stories/[story]/[chapter]', {
							story: story.id,
							chapter: String(prevChapter.chapterNumber)
						})}
						onclick={() => stopPlayback()}
					>
						← Prev
					</a>
				{:else}
					<span class="chapter-nav-btn disabled" aria-disabled="true">← Prev</span>
				{/if}
				{#if nextChapter}
					<a
						class="chapter-nav-btn"
						href={resolve('/stories/[story]/[chapter]', {
							story: story.id,
							chapter: String(nextChapter.chapterNumber)
						})}
						onclick={() => stopPlayback()}
					>
						Next →
					</a>
				{:else}
					<span class="chapter-nav-btn disabled" aria-disabled="true">Next →</span>
				{/if}
			</nav>
		</div>
	{:else if readingStep === 'vocab'}
		<!-- VOCABULARY -->
		<div class="reading-view">
			<div class="reading-header">
				<button
					class="header-back tappable"
					onclick={() => (readingStep = 'read')}
					aria-label="Back to Text"
				>
					<Icon name="chevron-left" size={20} color="var(--color-ink)" />
				</button>
				<div class="header-text">
					<div class="title-wrap">
						<div class="header-title">Vocabulary</div>
						<span class="squiggle" aria-hidden="true">
							<Doodle
								name="speech-bubble-chat-chat-bubble-talk-speak-message-2"
								size={72}
								color="var(--color-lavender-deep)"
								tilt={-3}
							/>
						</span>
					</div>
					<div class="header-step">Vocab</div>
				</div>
				<span class="header-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={28} color="var(--color-lavender-deep)" tilt={4} />
				</span>
			</div>

			<div class="vocab-list">
				{#each chapter.vocabulary as entry, i (i)}
					<div class="vocab-row">
						<div class="vocab-dutch">
							<Pill variant="lavender" size="sm">
								{entry.dutch}
								{#if entry.article}
									<span class="vocab-article">({entry.article})</span>
								{/if}
							</Pill>
						</div>
						<div class="vocab-english">{entry.english}</div>
					</div>
				{/each}
			</div>

			<button class="action-btn" onclick={goToQuiz}>Continue to Quiz</button>
		</div>
	{:else if readingStep === 'quiz' && currentQuestion}
		<!-- QUIZ -->
		<div class="reading-view">
			<div class="reading-header">
				<a
					class="header-back tappable"
					href={resolve('/stories/[story]', { story: story.id })}
					aria-label="Back to Chapters"
					onclick={() => stopPlayback()}
				>
					<Icon name="chevron-left" size={20} color="var(--color-ink)" />
				</a>
				<div class="header-text">
					<div class="title-wrap">
						<div class="header-title">Comprehension Questions</div>
						<span class="squiggle" aria-hidden="true">
							<Doodle
								name="speech-bubble-chat-chat-bubble-talk-speak-message-2"
								size={72}
								color="var(--color-lavender-deep)"
								tilt={-3}
							/>
						</span>
					</div>
					<div class="header-step">
						{quizIndex + 1} / {chapter.questions.length}
					</div>
				</div>
				<span class="header-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={28} color="var(--color-lavender-deep)" tilt={4} />
				</span>
			</div>

			{#if dailyQuizQuestion}
				<ConversationQuestionCard
					question={dailyQuizQuestion}
					showResult={showQuizResult}
					selectedIndex={selectedQuizOption}
					onanswer={handleQuizSelect}
				/>
			{/if}

			{#if showQuizResult}
				<div
					class="result-feedback"
					class:result-correct={quizWasCorrect}
					class:result-wrong={!quizWasCorrect}
				>
					{#if quizWasCorrect}
						<span class="result-icon">&#10003;</span> Correct!
					{:else}
						<span class="result-icon">&#10007;</span> Answer: {currentQuestion.options[
							currentQuestion.correctIndex
						]}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.reading-page {
		padding: 0.35rem 0 calc(32px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
	}

	/* ============================================ */
	/* SHARED HEADER                                */
	/* ============================================ */
	.reading-header {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.header-back {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 4px;
		padding: 4px;
		background: none;
		border: none;
		color: var(--color-ink);
		cursor: pointer;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.header-back:active {
		transform: scale(var(--press-scale));
	}

	.header-text {
		min-width: 0;
		flex: 1;
	}

	.title-wrap {
		position: relative;
		display: inline-block;
		max-width: 100%;
		padding-bottom: 6px;
	}

	.header-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.15;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	.squiggle {
		position: absolute;
		left: 0;
		bottom: -10px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
		opacity: 0.85;
	}

	.title-wrap :global(.doodle) {
		width: 72px !important;
		height: 28px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.header-step {
		margin-top: 10px;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		line-height: 1.3;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.header-sparkle {
		flex-shrink: 0;
		padding-top: 2px;
		pointer-events: none;
		line-height: 0;
	}

	/* ============================================ */
	/* READING VIEW                                 */
	/* ============================================ */
	.reading-view {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.chapter-meta-row {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 0;
		background: var(--color-cream);
		background-image: linear-gradient(
			to bottom,
			var(--color-cream) 70%,
			color-mix(in srgb, var(--color-cream) 0%, transparent)
		);
	}

	.chapter-title-bar {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--color-lavender-deep);
		min-width: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.story-text-card {
		position: relative;
		background: #fff;
		border: 3px solid var(--color-ink);
		border-radius: 22px;
		padding: 20px;
		box-shadow: var(--shadow-offset-card);
	}

	/* Reading-copy exception: 19px body with comfortable line-height.
	   Shared type scale has no 18–19px step for long-form reading. */
	.story-text {
		font-family: var(--font-sans);
		font-size: 19px;
		line-height: 1.6;
		color: var(--color-ink);
	}

	.story-para {
		margin: 0 0 1em 0;
	}

	.story-para:last-child {
		margin-bottom: 0;
	}

	.story-sentence {
		cursor: pointer;
		border-radius: 4px;
		padding: 1px 2px;
		transition:
			background 0.15s,
			color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.story-sentence:hover {
		background: color-mix(in srgb, var(--color-lavender) 18%, transparent);
	}

	.story-sentence.selected {
		background: color-mix(in srgb, var(--color-rose) 35%, transparent);
		color: var(--color-rose-deep);
	}

	.story-sentence.playing {
		background: color-mix(in srgb, var(--color-teal) 28%, transparent);
		color: var(--color-teal-deep);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-teal) 30%, transparent);
	}

	.tts-popover {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: #fff;
		border: 2px solid var(--color-rose-deep);
		border-radius: 12px;
		box-shadow: var(--shadow-offset-pill);
		z-index: 10;
		animation: popIn 0.15s ease-out;
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 14px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		color: var(--color-rose-ink);
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		box-shadow: var(--shadow-offset-pill);
		transition:
			opacity 0.15s,
			transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.action-btn:hover {
		opacity: 0.92;
	}

	.action-btn:active {
		transform: scale(var(--press-scale));
	}

	/* ============================================ */
	/* CHAPTER PLAYBACK FAB                         */
	/* ============================================ */
	.play-fab {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.play-fab-speed {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		background: #fff;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		color: var(--color-muted-ink);
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		cursor: pointer;
		box-shadow: var(--shadow-offset-pill);
		transition:
			border-color 0.15s,
			color 0.15s,
			background 0.15s,
			transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.play-fab-speed.slow {
		color: var(--color-lavender-deep);
		border-color: var(--color-lavender-deep);
		background: color-mix(in srgb, var(--color-lavender) 35%, white);
	}

	.play-fab-speed:active {
		transform: scale(var(--press-scale));
	}

	.play-fab-speed-label {
		line-height: 1;
	}

	.play-fab-main {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		border: 2px solid var(--color-ink);
		border-radius: 50%;
		color: var(--color-rose-ink);
		cursor: pointer;
		box-shadow: var(--shadow-offset-pill);
		transition:
			opacity 0.15s,
			transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.play-fab-main:hover {
		opacity: 0.92;
	}

	.play-fab-main:active {
		transform: scale(var(--press-scale));
	}

	.play-fab.active .play-fab-main {
		animation: fab-pulse 1.6s ease-in-out infinite;
	}

	@keyframes fab-pulse {
		0%,
		100% {
			box-shadow:
				var(--shadow-offset-pill),
				0 0 0 0 color-mix(in srgb, var(--color-rose-deep) 35%, transparent);
		}
		50% {
			box-shadow:
				var(--shadow-offset-pill),
				0 0 0 8px color-mix(in srgb, var(--color-rose-deep) 0%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.play-fab.active .play-fab-main {
			animation: none;
		}

		.tts-popover {
			animation: none;
		}
	}

	/* ============================================ */
	/* CHAPTER PREV / NEXT                          */
	/* ============================================ */
	.chapter-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-top: 4px;
	}

	.chapter-nav-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 14px;
		background: #fff;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		color: var(--color-ink);
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-decoration: none;
		box-shadow: var(--shadow-offset-pill);
		-webkit-tap-highlight-color: transparent;
		transition:
			opacity 0.15s,
			transform var(--press-duration) ease;
	}

	.chapter-nav-btn.primary {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
		color: var(--color-rose-ink);
	}

	.chapter-nav-btn:active:not(.disabled) {
		transform: scale(var(--press-scale));
	}

	.chapter-nav-btn.disabled {
		opacity: 0.4;
		cursor: default;
		box-shadow: none;
	}

	/* ============================================ */
	/* VOCAB LIST                                   */
	/* ============================================ */
	.vocab-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		background: #fff;
		border: 3px solid var(--color-ink);
		border-radius: 22px;
		overflow: hidden;
		box-shadow: var(--shadow-offset-card);
	}

	.vocab-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		border-bottom: 1px solid color-mix(in srgb, var(--color-rose) 34%, white);
	}

	.vocab-row:last-child {
		border-bottom: none;
	}

	.vocab-dutch {
		flex-shrink: 0;
	}

	.vocab-article {
		font-weight: 400;
		opacity: 0.85;
		margin-left: 2px;
	}

	.vocab-english {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		text-align: right;
		min-width: 0;
	}

	/* ============================================ */
	/* QUIZ RESULT FEEDBACK                         */
	/* ============================================ */
	.result-feedback {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 14px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.04em;
		box-shadow: var(--shadow-offset-pill);
	}

	.result-correct {
		background: color-mix(in srgb, var(--color-teal) 45%, #fff);
		border: 2px solid var(--color-teal-deep);
		color: var(--color-teal-deep);
	}

	.result-wrong {
		background: color-mix(in srgb, var(--color-rose) 14%, #fff);
		border: 2px solid var(--color-rose-deep);
		color: var(--color-rose-deep);
	}

	.result-icon {
		font-size: var(--text-lead);
	}

	/* ============================================ */
	/* SUMMARY VIEW                                 */
	/* ============================================ */
	.summary-view {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.reading-page :global(.summary-card) {
		position: relative;
		text-align: center;
		max-width: 360px;
		width: 100%;
		padding: 28px 24px;
	}

	.summary-header {
		position: relative;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.summary-title-wrap {
		position: relative;
		display: inline-block;
		padding-bottom: 4px;
	}

	.summary-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
	}

	.summary-swirl {
		position: absolute;
		right: -28px;
		top: -10px;
		pointer-events: none;
		line-height: 0;
		opacity: 0.85;
	}

	.summary-sparkle {
		position: absolute;
		right: 8px;
		top: 4px;
		pointer-events: none;
		line-height: 0;
	}

	.summary-name {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		margin-bottom: 24px;
		letter-spacing: -0.02em;
	}

	.summary-score {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 4px;
		margin-bottom: 4px;
	}

	.score-num {
		font-family: var(--font-display);
		font-size: 48px;
		font-weight: 700;
		color: var(--color-teal-deep);
	}

	.score-sep {
		font-family: var(--font-display);
		font-size: 28px;
		color: var(--color-muted-ink);
	}

	.score-den {
		font-family: var(--font-display);
		font-size: 28px;
		color: var(--color-muted-ink);
	}

	.score-label {
		font-size: var(--text-micro);
		color: var(--color-muted-ink);
		margin-bottom: 20px;
	}

	.chapter-summary {
		text-align: left;
		margin-bottom: 20px;
	}

	.summary-heading {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin-bottom: 8px;
	}

	.reading-page :global(.summary-bubble) {
		width: 100%;
		text-align: left;
	}

	/* ============================================ */
	/* NOT FOUND                                    */
	/* ============================================ */
	.not-found-wrap {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		min-height: 40vh;
		padding: 8px 0;
	}

	.reading-page :global(.not-found-card) {
		max-width: 360px;
		width: 100%;
		margin: 0 auto;
		padding: 28px 22px;
	}

	.not-found-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}

	.not-found-title {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.not-found-body {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.45;
		max-width: 280px;
	}

	.not-found-cta {
		margin-top: 12px;
		padding: 10px 22px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
		border: 2px solid var(--color-ink);
		color: var(--color-lavender-deep);
		text-decoration: none;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.02em;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.not-found-cta:active {
		transform: scale(var(--press-scale));
	}
</style>
