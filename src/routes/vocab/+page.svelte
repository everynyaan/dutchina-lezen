<script lang="ts">
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import {
		WORD_CATEGORIES,
		type WordEntry,
		type WordCategory
	} from '$lib/data/wordPool';
	import { currentGateFromState } from '$lib/gates/gates';
	import {
		initialBrowseGate,
		vocabUnlockLabel,
		wordsForBrowse,
		wordsInCategoryForBrowse
	} from '$lib/gates/browse';
	import GateBrowseFilter from '$lib/components/GateBrowseFilter.svelte';
	import SpeakerButton from '$lib/components/SpeakerButton.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { speak } from '$lib/audio/tts';
	import { getDb, type CardReviewEntry } from '$lib/db/db';

	const ctx = getGameContext();
	let engineGate = $derived(currentGateFromState(ctx.state));
	let browseGate = $state(initialBrowseGate(currentGateFromState(ctx.state)));
	let roomWords = $derived(wordsForBrowse(browseGate));
	let unlockLabel = $derived(vocabUnlockLabel(browseGate, engineGate));

	const FALLBACK_TTS_KEY = 'AIzaSyCVAh2sR1nWsS-Gi_dEeeh0mLho6KSo2RU';

	function speakWord(word: string) {
		const apiKey = ctx.state.tts.googleApiKey || FALLBACK_TTS_KEY;
		speak(word, apiKey, 1);
	}

	let selectedCategory = $state<WordCategory | null>(null);
	let searchQuery = $state('');
	let reviewMap = $state<Map<string, CardReviewEntry>>(new Map());
	const MASTERED_INTERVAL_DAYS = 21;

	const SRS_LABEL: Record<'new' | 'learning' | 'mastered', string> = {
		new: 'New',
		learning: 'Learning',
		mastered: 'Mastered'
	};

	/** Map wordPool tone → V3 section hue (local only; do not edit wordPool). */
	const TONE_HUE = {
		'soft-pink': 'rose',
		'soft-lilac': 'lavender',
		'soft-mint': 'teal',
		'soft-butter': 'peach'
	} as const;

	const JIT_CLASSES = ['jit-a', 'jit-b', 'jit-c', 'jit-1', 'jit-2'] as const;

	function openCategory(id: WordCategory) {
		selectedCategory = id;
		searchQuery = '';
	}

	function closeCategory() {
		selectedCategory = null;
		searchQuery = '';
	}

	function srsStatus(wordId: string): 'new' | 'learning' | 'mastered' {
		const entry = reviewMap.get(wordId);
		if (!entry) return 'new';
		return entry.interval >= MASTERED_INTERVAL_DAYS ? 'mastered' : 'learning';
	}

	onMount(async () => {
		try {
			const rows = await getDb().cardReviews.toArray();
			reviewMap = new Map(rows.map((r) => [r.wordId, r]));
		} catch (err) {
			console.warn('[vocab] failed to load card reviews', err);
			reviewMap = new Map();
		}
	});

	let categoryStats = $derived.by<
		Record<WordCategory, { total: number; unlocked: number; mastered: number }>
	>(() => {
		const result = {} as Record<
			WordCategory,
			{ total: number; unlocked: number; mastered: number }
		>;
		for (const cat of WORD_CATEGORIES) {
			const words = wordsInCategoryForBrowse(cat.id, browseGate);
			let mastered = 0;
			for (const w of words) {
				const entry = reviewMap.get(w.id);
				if (entry && entry.interval >= MASTERED_INTERVAL_DAYS) mastered++;
			}
			result[cat.id] = { total: words.length, unlocked: words.length, mastered };
		}
		return result;
	});

	let visibleCategories = $derived(WORD_CATEGORIES.filter((c) => categoryStats[c.id].total > 0));

	let filteredWords = $derived.by<WordEntry[]>(() => {
		if (!selectedCategory) return [];
		const words = wordsInCategoryForBrowse(selectedCategory, browseGate);
		const q = searchQuery.trim().toLowerCase();
		if (!q) return words;
		return words.filter(
			(w) => w.dutch.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)
		);
	});

	let selectedMeta = $derived(
		selectedCategory ? (WORD_CATEGORIES.find((c) => c.id === selectedCategory) ?? null) : null
	);
</script>

<div class="vocab-page">
	{#if selectedCategory === null}
		<section class="vocab-hero r-card edge-ink offset-card" aria-label="words">
			<div class="sparkle">
				<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={-6} />
			</div>
			<div class="hero-row">
				<Character who="kuromi" mood="question" size={64} />
				<div class="hero-copy">
					<h1 class="hero-title">words</h1>
					<p class="hero-sub">
						{roomWords.length} words in this room
						{#if unlockLabel}
							· {unlockLabel}
						{/if}
					</p>
				</div>
			</div>
			<GateBrowseFilter
				current={engineGate}
				selected={browseGate}
				noun="words"
				onSelect={(g) => {
					browseGate = g;
					selectedCategory = null;
					searchQuery = '';
				}}
			/>
		</section>

		<div class="section-head">
			<h2 class="section-title">categories</h2>
			<span class="squiggle">
				<Doodle name="shape-swirl-loops-4" size={72} color="var(--color-rose-deep)" tilt={-3} />
			</span>
		</div>

		<div class="category-grid">
			{#each visibleCategories as cat, index (cat.id)}
				{@const stats = categoryStats[cat.id]}
				{@const hue = TONE_HUE[cat.tone]}
				{@const jit = JIT_CLASSES[index % JIT_CLASSES.length]}
				<button type="button" class="cat-btn" onclick={() => openCategory(cat.id)}>
					<div class="cat-card r-card offset-card edge-hair tappable {jit} hue-{hue}">
						<span class="cat-emoji">{cat.emoji}</span>
						<span class="cat-label">{cat.label}</span>
						<div class="cat-badges">
							<span class="info-badge">{stats.unlocked}/{stats.total}</span>
							<span class="info-badge">{stats.mastered} mastered</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{:else if selectedMeta}
		{@const stats = categoryStats[selectedMeta.id]}
		<button type="button" class="back-categories tappable" onclick={closeCategory}>
			<Icon name="chevron-left" size={18} color="var(--color-muted-ink)" />
			<span>categories</span>
		</button>

		<div class="category-hero r-card edge-ink offset-card">
			<span class="cat-hero-corner" aria-hidden="true">
				<Doodle name="spark-sparkle-26" size={22} color="var(--color-lavender-deep)" tilt={6} />
			</span>
			<div class="cat-hero-top">
				<span class="cat-hero-emoji">{selectedMeta.emoji}</span>
				<div class="cat-hero-copy">
					<div class="cat-hero-heading-wrap">
						<h2 class="cat-hero-title">{selectedMeta.label}</h2>
						<span class="cat-hero-squiggle">
							<Doodle
								name="shape-swirl-loops-4"
								size={56}
								color="var(--color-rose-deep)"
								tilt={-2}
							/>
						</span>
					</div>
					<div class="cat-badges">
						<span class="info-badge">{stats.unlocked}/{stats.total}</span>
						<span class="info-badge">{stats.mastered} mastered</span>
					</div>
				</div>
			</div>

			<div class="search-wrap">
				<span class="search-prefix" aria-hidden="true">
					<Icon name="magnifying-glass" size={16} color="var(--color-muted-ink)" />
				</span>
				<input
					type="text"
					class="search-input"
					placeholder="Search words..."
					bind:value={searchQuery}
					aria-label="Search words"
				/>
				{#if searchQuery}
					<button
						type="button"
						class="search-clear tappable"
						onclick={() => (searchQuery = '')}
						aria-label="Clear search"
					>
						<Icon name="xmark" size={16} color="var(--color-muted-ink)" />
					</button>
				{/if}
			</div>
		</div>

		{#if filteredWords.length === 0}
			<div class="empty-search">
				<div class="empty-doodle">
					<Doodle
						name="thoughts-dreams-clouds-thought-bubble-11"
						size={40}
						color="var(--color-lavender-deep)"
						tilt={4}
					/>
				</div>
				<Character who="kuromi" mood="question" size={64} />
				<p class="empty-copy">No matches for "{searchQuery}"</p>
			</div>
		{:else}
			<div class="word-list">
				{#each filteredWords as word (word.id)}
					{@const status = srsStatus(word.id)}
					{#if unlockLabel}
						<div class="word-row locked r-chip edge-hair">
							<button
								type="button"
								class="word-dutch"
								onclick={() => speakWord(word.dutch)}
								title="Listen to word"
							>
								{word.dutch}
							</button>
							<span class="locked-label">{unlockLabel}</span>
						</div>
					{:else}
						<div class="word-row r-chip edge-hair">
							<div class="word-row1">
								<button
									type="button"
									class="word-dutch"
									onclick={() => speakWord(word.dutch)}
									title="Listen to word"
								>
									{word.dutch}
								</button>
								<Pill variant="lavender" size="sm">{word.pos}</Pill>
								<span class="srs-dot" data-status={status} title={SRS_LABEL[status]}></span>
							</div>
							<div class="word-english">{word.english}</div>
							<div class="word-row3">
								<span class="word-sentence">{word.sentence_nl}</span>
								<span class="word-tts">
									<SpeakerButton text={word.sentence_nl} size={16} />
									<SpeakerButton text={word.sentence_nl} size={16} slow />
								</span>
							</div>
							<div class="word-sentence-en">{word.sentence_en}</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.vocab-page {
		padding: 0.35rem 0 calc(32px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
		max-width: 100%;
		overflow-x: hidden;
	}

	/* ---- Grid hero ---- */
	.vocab-hero {
		position: relative;
		overflow: visible;
		padding: 16px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 30%, white),
			color-mix(in srgb, var(--color-lavender) 14%, white)
		);
	}

	.sparkle {
		position: absolute;
		top: -8px;
		right: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.hero-row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.hero-copy {
		min-width: 0;
		flex: 1;
	}

	.hero-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
		color: var(--color-ink);
	}

	.hero-sub {
		margin: 4px 0 0;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		line-height: 1.35;
		color: var(--color-lavender-deep);
	}

	/* ---- Section label + squiggle (home oefenen-head pattern) ---- */
	.section-head {
		position: relative;
		display: inline-block;
		padding-bottom: 6px;
		margin-bottom: -2px;
		align-self: flex-start;
	}

	.section-title {
		position: relative;
		z-index: 1;
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.15;
	}

	.squiggle {
		position: absolute;
		left: 0;
		bottom: -6px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.section-head :global(.doodle) {
		width: 72px !important;
		height: 14px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	/* ---- Category grid ---- */
	.category-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		min-width: 0;
	}

	.cat-btn {
		all: unset;
		display: block;
		width: 100%;
		min-width: 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
	}

	.cat-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px;
		min-width: 0;
		min-height: 96px;
		text-align: left;
		box-sizing: border-box;
	}

	.hue-rose {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
	}

	.hue-lavender {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.hue-teal {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.hue-peach {
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	.cat-emoji {
		font-size: var(--text-title);
		line-height: 1.2;
	}

	.cat-label {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.25;
		overflow-wrap: anywhere;
		color: inherit;
	}

	.cat-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: auto;
	}

	.info-badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 8px;
		border-radius: 999px;
		border: none;
		font-family: var(--font-sans);
		font-size: var(--text-micro);
		line-height: 1.2;
		color: inherit;
		background: color-mix(in srgb, white 55%, transparent);
		box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 10%, transparent);
		white-space: nowrap;
	}

	/* ---- Detail back ---- */
	.back-categories {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		align-self: flex-start;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted-ink);
		background: none;
		border: none;
		padding: 4px 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.back-categories:hover {
		color: var(--color-ink);
	}

	/* ---- Category detail hero ---- */
	.category-hero {
		position: relative;
		overflow: visible;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 30%, white),
			color-mix(in srgb, var(--color-lavender) 14%, white)
		);
		min-width: 0;
	}

	.cat-hero-top {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		min-width: 0;
	}

	.cat-hero-emoji {
		font-size: var(--text-title);
		line-height: 1.2;
		flex-shrink: 0;
	}

	.cat-hero-copy {
		min-width: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.cat-hero-heading-wrap {
		position: relative;
		display: inline-block;
		padding-bottom: 4px;
		max-width: 100%;
	}

	.cat-hero-title {
		position: relative;
		z-index: 1;
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.cat-hero-squiggle {
		position: absolute;
		left: 0;
		bottom: -4px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.cat-hero-corner {
		position: absolute;
		top: 10px;
		right: 14px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.cat-hero-heading-wrap :global(.doodle) {
		width: 56px !important;
		height: 12px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	/* ---- Search ---- */
	.search-wrap {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.search-prefix {
		position: absolute;
		left: 12px;
		display: flex;
		align-items: center;
		pointer-events: none;
		line-height: 0;
	}

	.search-input {
		width: 100%;
		min-width: 0;
		padding: 10px 40px 10px 38px;
		background: color-mix(in srgb, white 70%, transparent);
		border: 1px solid var(--color-line);
		border-radius: 999px;
		color: var(--color-ink);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		outline: none;
		box-sizing: border-box;
	}

	.search-input::placeholder {
		color: var(--color-muted-ink);
	}

	.search-input:focus {
		border-color: var(--color-lavender-deep);
	}

	.search-clear {
		position: absolute;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	/* ---- Empty search ---- */
	.empty-search {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 18px 12px;
		min-width: 0;
	}

	.empty-doodle {
		position: absolute;
		top: 4px;
		left: 52px;
		pointer-events: none;
		line-height: 0;
	}

	.empty-copy {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.4;
		color: var(--color-muted-ink);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	/* ---- Word list ---- */
	.word-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.word-row {
		padding: 12px;
		background: color-mix(in srgb, white 72%, var(--color-cream));
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-sizing: border-box;
	}

	.word-row.locked {
		flex-direction: row;
		align-items: center;
		gap: 8px;
		opacity: 0.72;
	}

	.locked-label {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.35;
		min-width: 0;
	}

	.word-row1 {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.word-dutch {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: var(--color-ink);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		text-align: left;
		line-height: 1.25;
		overflow-wrap: anywhere;
		min-width: 0;
	}

	.word-dutch:hover {
		opacity: 0.75;
	}

	.word-dutch:active {
		opacity: 0.55;
	}

	.srs-dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		flex-shrink: 0;
		display: inline-block;
		margin-left: auto;
	}

	.srs-dot[data-status='new'] {
		background: var(--color-muted-line);
	}

	.srs-dot[data-status='learning'] {
		background: var(--color-rose-deep);
	}

	.srs-dot[data-status='mastered'] {
		background: var(--color-teal-deep);
	}

	.word-english {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-muted-ink);
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.word-row3 {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
	}

	.word-sentence {
		flex: 1;
		min-width: 0;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-text);
		font-style: italic;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	.word-tts {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
		align-items: center;
	}

	.word-sentence-en {
		font-family: var(--font-sans);
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		font-style: italic;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
</style>
