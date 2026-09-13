<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { getTasksByYear, getTaskById } from '$lib/reviews/SCHRIJVEN_CONTENT';
	import { currentGateFromState } from '$lib/gates/gates';
	import {
		examYearsForBrowse,
		initialBrowseGate,
		practiceRankForGate,
		schrijvenTasksForBrowse
	} from '$lib/gates/browse';
	import GateBrowseFilter from '$lib/components/GateBrowseFilter.svelte';
	import ExamPaperBanner from '$lib/components/ExamPaperBanner.svelte';
	import type { SchrijvenTask, SchrijvenTaskType } from '$lib/reviews/types';
	import type { ReviewSubmission } from '$lib/state/schema';
	import { playSfx } from '$lib/sound/sfx';
	import Character from '$lib/components/art/Character.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	const ctx = getGameContext();
	let engineGate = $derived(currentGateFromState(ctx.state));
	let browseGate = $state(initialBrowseGate(currentGateFromState(ctx.state)));
	let roomTasks = $derived(schrijvenTasksForBrowse(browseGate));
	let roomYears = $derived(examYearsForBrowse(browseGate));
	let roomPracticeRank = $derived(practiceRankForGate(browseGate));
	let examGym = $derived(browseGate === 4);
	let identitySub = $derived(
		examGym ? 'B1 exam writing' : 'short notes — not the exam paper'
	);

	// ============================================================
	// VIEW STATE
	// ============================================================
	type View = 'list' | 'write' | 'review' | 'detail';

	let view = $state<View>('list');
	let activeTask = $state<SchrijvenTask | null>(null);
	let activeSubmissionId = $state<string | null>(null);

	// Write view state
	let answerText = $state('');

	// Review view state
	let reviewComment = $state('');

	// List view: which tab (write vs history)
	let listTab = $state<'write' | 'history'>('write');

	// Prefers-reduced-motion (detail-view Kuromi corner reactor)
	let reducedMotion = $state(false);

	// Detail-view reactor: flash mood → settled mood + optional confetti burst
	let reactorMood = $state('hmph');
	let reactorBurst = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = () => {
			reducedMotion = mq.matches;
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	// Re-runs every time detail view is entered for a graded submission
	// (and if the verdict changes while already on detail).
	$effect(() => {
		if (view !== 'detail' || !activeSubmissionId || !activeSubmission?.verdict) {
			reactorBurst = false;
			return;
		}

		const verdict = activeSubmission.verdict;
		void activeSubmissionId;
		void reducedMotion;

		const settled = verdict === 'pass' ? 'excited' : verdict === 'fail' ? 'defeated' : 'hmph';
		const flash = verdict === 'pass' ? 'hehe' : verdict === 'fail' ? 'shocked' : null;

		let settleTimer: ReturnType<typeof setTimeout> | undefined;
		let burstTimer: ReturnType<typeof setTimeout> | undefined;

		reactorBurst = false;

		if (reducedMotion || !flash) {
			// Skip flash entirely under reduced motion; close has no flash.
			reactorMood = settled;
			return () => {
				if (settleTimer) clearTimeout(settleTimer);
				if (burstTimer) clearTimeout(burstTimer);
			};
		}

		reactorMood = flash;
		settleTimer = setTimeout(() => {
			reactorMood = settled;
			if (verdict === 'pass') {
				reactorBurst = true;
				burstTimer = setTimeout(() => {
					reactorBurst = false;
				}, 1000);
			}
		}, 500);

		return () => {
			if (settleTimer) clearTimeout(settleTimer);
			if (burstTimer) clearTimeout(burstTimer);
		};
	});

	// ============================================================
	// DERIVED
	// ============================================================
	let submissions = $derived(ctx.state.reviews.submissions);

	let submissionList = $derived(
		Object.entries(submissions)
			.map(([id, sub]) => ({ id, ...sub }))
			.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
	);

	let pendingSubmissions = $derived(submissionList.filter((s) => s.verdict === null));
	let reviewedSubmissions = $derived(submissionList.filter((s) => s.verdict !== null));

	let activeSubmission = $derived(
		activeSubmissionId ? (submissions[activeSubmissionId] ?? null) : null
	);

	let activeSubmissionTask = $derived(
		activeSubmission ? (getTaskById(activeSubmission.taskId) ?? null) : null
	);

	// Tasks not yet attempted (list hero badge)
	let openTaskCount = $derived(
		roomTasks.filter((t) => !submissionList.some((s) => s.taskId === t.id)).length
	);

	// ============================================================
	// CONSTANTS
	// ============================================================
	const TYPE_LABELS: Record<SchrijvenTaskType, string> = {
		zinstaak: 'Sentence',
		deelschrijftaak: 'Part',
		korte_schrijftaak: 'Short'
	};

	type TintIdentity = 'lavender' | 'rose' | 'teal';

	const TYPE_COLORS: Record<SchrijvenTaskType, TintIdentity> = {
		zinstaak: 'lavender',
		deelschrijftaak: 'rose',
		korte_schrijftaak: 'teal'
	};

	const VERDICT_LABELS: Record<string, string> = {
		pass: 'PASS',
		close: 'CLOSE',
		fail: 'FAIL'
	};

	const VERDICT_COLORS: Record<string, TintIdentity> = {
		pass: 'teal',
		close: 'lavender',
		fail: 'rose'
	};

	const RANK_LABELS: Record<number, string> = {
		0: 'First words',
		1: 'Everyday Dutch',
		2: 'Real sentences'
	};

	// ============================================================
	// NAVIGATION
	// ============================================================
	function openTask(task: SchrijvenTask) {
		activeTask = task;
		answerText = '';
		view = 'write';
	}

	function openSubmission(submissionId: string) {
		activeSubmissionId = submissionId;
		const sub = submissions[submissionId];
		if (!sub) return;

		if (sub.verdict === null) {
			// Pending review: open the review packet for the boyfriend
			reviewComment = '';
			view = 'review';
		} else {
			// Already reviewed: show detail
			view = 'detail';
		}
	}

	function goBack() {
		view = 'list';
		activeTask = null;
		activeSubmissionId = null;
	}

	// ============================================================
	// SUBMIT ANSWER
	// ============================================================
	function submitAnswer() {
		if (!activeTask || !answerText.trim()) return;

		const id = `rev_${Date.now()}`;
		const submission: ReviewSubmission = {
			taskId: activeTask.id,
			answer: answerText.trim(),
			submittedAt: new Date().toISOString(),
			verdict: null,
			comment: '',
			reviewedAt: null
		};

		ctx.state.reviews.submissions[id] = submission;

		// Mission: review_submitted
		ctx.updateMissions('review_submitted', 1);

		playSfx('lp_gain');

		// Switch to history tab to show the pending submission
		listTab = 'history';
		goBack();
	}

	// ============================================================
	// BOYFRIEND VERDICT
	// ============================================================
	function submitVerdict(verdict: 'pass' | 'close' | 'fail') {
		if (!activeSubmissionId) return;
		const sub = ctx.state.reviews.submissions[activeSubmissionId];
		if (!sub) return;

		sub.verdict = verdict;
		sub.comment = reviewComment.trim();
		sub.reviewedAt = new Date().toISOString();

		// Award LP based on verdict
		ctx.applyLpEvent({ type: 'review_verdict', verdict });

		// Show the reviewed detail
		view = 'detail';
	}

	// ============================================================
	// HELPERS
	// ============================================================
	function getSubmissionCountForTask(taskId: string): number {
		return submissionList.filter((s) => s.taskId === taskId).length;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<!-- ============================================================ -->
<!-- TASK LIST VIEW                                                -->
<!-- ============================================================ -->
{#if view === 'list'}
	<div class="reviews-page">
		<!-- Identity header (hero) -->
		<section class="identity-header r-card edge-ink offset-card" aria-label="writing">
			<div class="sparkle">
				<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={-4} />
			</div>
			<div class="identity-row">
				<Character who="kuromi" mood="sit" size={72} />
				<div class="identity-copy">
					<h1 class="identity-title">writing</h1>
					<p class="identity-sub">{identitySub}</p>
					{#if openTaskCount > 0}
						<span class="open-badge r-pill offset-pill">{openTaskCount} still open</span>
					{/if}
				</div>
			</div>
		</section>

		<GateBrowseFilter
			current={engineGate}
			selected={browseGate}
			noun="writing tasks"
			onSelect={(g) => (browseGate = g)}
		/>

		{#if examGym}
			<ExamPaperBanner />
		{/if}

		<!-- Squiggle heading + segmented tab toggle -->
		<div class="list-controls">
			<div class="oefenen-head">
				<h2 class="oefenen-title">{listTab === 'write' ? 'practice' : 'history'}</h2>
				<span class="squiggle">
					<Doodle name="shape-swirl-loops-4" size={80} color="var(--color-rose-deep)" tilt={-3} />
				</span>
			</div>

			<div class="tab-toggle edge-hair r-pill" role="tablist" aria-label="list view">
				<button
					type="button"
					class="tab-seg"
					class:active={listTab === 'write'}
					role="tab"
					aria-selected={listTab === 'write'}
					onclick={() => (listTab = 'write')}
				>
					practice
					<span class="count-badge r-pill tint-teal">{roomTasks.length}</span>
				</button>
				<button
					type="button"
					class="tab-seg"
					class:active={listTab === 'history'}
					role="tab"
					aria-selected={listTab === 'history'}
					onclick={() => (listTab = 'history')}
				>
					history
					{#if pendingSubmissions.length > 0}
						<span class="count-badge r-pill tint-rose">{pendingSubmissions.length}</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- WRITE TAB: Task list grouped by practice ranks + exam years -->
		{#if listTab === 'write'}
			<div class="task-list">
				{#if roomPracticeRank != null}
					<div class="year-group">
						<h2 class="group-heading">practice</h2>
						<h3 class="rank-subheading">{RANK_LABELS[roomPracticeRank]}</h3>
						<div class="task-rows">
							{#each roomTasks as task (task.id)}
								{@const subCount = getSubmissionCountForTask(task.id)}
								<button
									type="button"
									class="task-row tappable r-chip"
									onclick={() => openTask(task)}
								>
									<span
										class="type-pill r-pill"
										class:tint-lavender={TYPE_COLORS[task.type] === 'lavender'}
										class:tint-rose={TYPE_COLORS[task.type] === 'rose'}
										class:tint-teal={TYPE_COLORS[task.type] === 'teal'}
									>
										{TYPE_LABELS[task.type]}
									</span>
									<div class="task-info">
										<span class="task-title">{task.taskNumber}. {task.title}</span>
										<span class="task-meta">{task.maxPoints} pt</span>
									</div>
									{#if subCount > 0}
										<span class="count-badge r-pill tint-teal">{subCount}x</span>
									{/if}
									<span class="chevron" aria-hidden="true">
										<Icon name="chevron-right" size={16} color="var(--color-muted-ink)" />
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#each roomYears as year (year)}
					{@const yearTasks = getTasksByYear(year)}
					<div class="year-group">
						<h2 class="group-heading">{year}</h2>
						<div class="task-rows">
							{#each yearTasks as task (task.id)}
								{@const subCount = getSubmissionCountForTask(task.id)}
								<button
									type="button"
									class="task-row tappable r-chip"
									onclick={() => openTask(task)}
								>
									<span
										class="type-pill r-pill"
										class:tint-lavender={TYPE_COLORS[task.type] === 'lavender'}
										class:tint-rose={TYPE_COLORS[task.type] === 'rose'}
										class:tint-teal={TYPE_COLORS[task.type] === 'teal'}
									>
										{TYPE_LABELS[task.type]}
									</span>
									<div class="task-info">
										<span class="task-title">{task.taskNumber}. {task.title}</span>
										<span class="task-meta">{task.maxPoints} pt</span>
									</div>
									{#if subCount > 0}
										<span class="count-badge r-pill tint-teal">{subCount}x</span>
									{/if}
									<span class="chevron" aria-hidden="true">
										<Icon name="chevron-right" size={16} color="var(--color-muted-ink)" />
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}

				{#if roomTasks.length === 0}
					<p class="empty-message">
						No writing tasks in this room. Look up Gate 4 for exam papers — that is browsing, not
						unlocking homework.
					</p>
				{/if}
			</div>

			<!-- HISTORY TAB -->
		{:else}
			<div class="history-list">
				{#if submissionList.length === 0}
					<div class="empty-state">
						<p class="empty-message">No submissions yet.</p>
						<div class="empty-hint edge-dashed r-chip">
							Pick a task under practice to get started!
						</div>
					</div>
				{:else}
					<!-- Pending reviews first -->
					{#if pendingSubmissions.length > 0}
						<h3 class="group-heading">pending review</h3>
						<div class="task-rows">
							{#each pendingSubmissions as sub (sub.id)}
								{@const task = getTaskById(sub.taskId)}
								<button
									type="button"
									class="task-row tappable r-chip"
									onclick={() => openSubmission(sub.id)}
								>
									<div class="task-info">
										<span class="task-title">{task?.title ?? sub.taskId}</span>
										<span class="task-meta"
											>{formatDate(sub.submittedAt)} {formatTime(sub.submittedAt)}</span
										>
									</div>
									<span class="type-pill r-pill tint-peach">PENDING</span>
								</button>
							{/each}
						</div>
					{/if}

					<!-- Reviewed submissions -->
					{#if reviewedSubmissions.length > 0}
						<h3 class="group-heading">reviewed</h3>
						<div class="task-rows">
							{#each reviewedSubmissions as sub (sub.id)}
								{@const task = getTaskById(sub.taskId)}
								<button
									type="button"
									class="task-row tappable r-chip"
									onclick={() => openSubmission(sub.id)}
								>
									<div class="task-info">
										<span class="task-title">{task?.title ?? sub.taskId}</span>
										<span class="task-meta">{formatDate(sub.submittedAt)}</span>
									</div>
									{#if sub.verdict}
										<span
											class="type-pill r-pill"
											class:tint-teal={VERDICT_COLORS[sub.verdict] === 'teal'}
											class:tint-lavender={VERDICT_COLORS[sub.verdict] === 'lavender'}
											class:tint-rose={VERDICT_COLORS[sub.verdict] === 'rose'}
										>
											{VERDICT_LABELS[sub.verdict]}
										</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>

	<!-- ============================================================ -->
	<!-- WRITE VIEW                                                    -->
	<!-- ============================================================ -->
{:else if view === 'write' && activeTask}
	<div class="write-page">
		<button type="button" class="back-btn" onclick={goBack}>
			<Icon name="chevron-left" size={18} color="var(--color-ink)" />
			Back
		</button>

		<div class="write-header">
			<span
				class="type-pill r-pill"
				class:tint-lavender={TYPE_COLORS[activeTask.type] === 'lavender'}
				class:tint-rose={TYPE_COLORS[activeTask.type] === 'rose'}
				class:tint-teal={TYPE_COLORS[activeTask.type] === 'teal'}
			>
				{TYPE_LABELS[activeTask.type]} &middot; {activeTask.year === 0
					? 'practice'
					: activeTask.year}
			</span>
			<div class="write-title-wrap">
				<h2 class="write-title">{activeTask.taskNumber}. {activeTask.title}</h2>
				<span class="squiggle">
					<Doodle name="shape-swirl-loops-4" size={80} color="var(--color-rose-deep)" tilt={-3} />
				</span>
			</div>
		</div>

		<!-- Hero: combined scenario + tekst prompt card -->
		<section class="prompt-hero r-card edge-ink offset-card" aria-label="assignment">
			<div class="hero-sparkle">
				<Doodle name="spark-sparkle-26" size={24} color="var(--color-rose-deep)" tilt={4} />
			</div>
			<div class="prompt-section">
				<h3 class="prompt-label">Scenario</h3>
				<p class="prompt-text">{activeTask.scenario}</p>
			</div>
			<div class="prompt-section prompt-section-tekst">
				<h3 class="prompt-label">Text</h3>
				<pre class="partial-text">{activeTask.partialText}</pre>
			</div>
		</section>

		<!-- Answer textarea (not a bordered card) -->
		<div class="answer-area">
			<h3 class="prompt-label">Your answer</h3>
			<textarea
				class="answer-input"
				bind:value={answerText}
				placeholder="Write your answer here..."
				rows={activeTask.type === 'zinstaak' ? 4 : activeTask.type === 'deelschrijftaak' ? 8 : 12}
			></textarea>
			<div class="char-count-row">
				<span class="char-count r-pill tint-peach">{answerText.length} characters</span>
			</div>
		</div>

		<button type="button" class="submit-btn" disabled={!answerText.trim()} onclick={submitAnswer}>
			Submit
		</button>
	</div>

	<!-- ============================================================ -->
	<!-- REVIEW PACKET (boyfriend view)                                -->
	<!-- ============================================================ -->
{:else if view === 'review' && activeSubmission && activeSubmissionTask}
	<div class="review-page">
		<button type="button" class="back-btn" onclick={goBack}>
			<Icon name="chevron-left" size={18} color="var(--color-ink)" />
			Back
		</button>

		<div class="review-header">
			<h2 class="review-title">Review</h2>
			<p class="review-subtitle">
				{activeSubmissionTask.title} &middot; {activeSubmissionTask.year}
			</p>
		</div>

		<!-- Secondary context: Opdracht + Tekst (non-hero, hairline) -->
		<section class="context-card r-card edge-hair" aria-label="assignment">
			<div class="prompt-section">
				<h3 class="prompt-label">Assignment</h3>
				<p class="prompt-text">{activeSubmissionTask.scenario}</p>
			</div>
			<div class="prompt-section prompt-section-tekst">
				<h3 class="prompt-label">Text</h3>
				<pre class="partial-text">{activeSubmissionTask.partialText}</pre>
			</div>
		</section>

		<!-- Hero: Domi's submitted answer -->
		<div class="answer-display">
			<h3 class="answer-label">Answer</h3>
			<div class="answer-hero-wrap">
				<div class="hero-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={20} color="var(--color-rose-deep)" tilt={-6} />
				</div>
				<div class="answer-bubble bubble-d edge-ink offset-card">
					{activeSubmission.answer}
				</div>
			</div>
		</div>

		<!-- Grading criteria (non-hero, lavender wash) -->
		<section class="criteria-card r-card edge-hair" aria-label="grading criteria">
			<h3 class="prompt-label criteria-label">Grading Criteria</h3>
			<div class="criteria-section">
				<span class="criteria-key">Adequacy:</span>
				<span class="criteria-value">{activeSubmissionTask.gradingCriteria.adequacy}</span>
			</div>
			<div class="criteria-section">
				<span class="criteria-key">Grammar:</span>
				<span class="criteria-value">{activeSubmissionTask.gradingCriteria.grammar}</span>
			</div>
			{#if activeSubmissionTask.gradingCriteria.extraAspects}
				<div class="criteria-section">
					<span class="criteria-key">Extra:</span>
					<span class="criteria-value">{activeSubmissionTask.gradingCriteria.extraAspects}</span>
				</div>
			{/if}
		</section>

		<!-- Optional comment -->
		<div class="comment-area">
			<h3 class="prompt-label">Comment (optional)</h3>
			<textarea class="comment-input" bind:value={reviewComment} placeholder="Feedback..." rows="3"
			></textarea>
		</div>

		<!-- Verdict chips (3-across, tint recipe per verdict) -->
		<div class="verdict-wrap">
			<div class="verdict-doodle" aria-hidden="true">
				<Doodle name="arrow-9" size={28} color="var(--color-rose-deep)" tilt={12} />
			</div>
			<div class="verdict-buttons">
				<button
					type="button"
					class="verdict-btn r-chip offset-pill tint-teal tappable"
					onclick={() => submitVerdict('pass')}
				>
					<span class="verdict-label">{VERDICT_LABELS.pass}</span>
				</button>
				<button
					type="button"
					class="verdict-btn r-chip offset-pill tint-lavender tappable"
					onclick={() => submitVerdict('close')}
				>
					<span class="verdict-label">{VERDICT_LABELS.close}</span>
				</button>
				<button
					type="button"
					class="verdict-btn r-chip offset-pill tint-rose tappable"
					onclick={() => submitVerdict('fail')}
				>
					<span class="verdict-label">{VERDICT_LABELS.fail}</span>
				</button>
			</div>
		</div>
	</div>

	<!-- ============================================================ -->
	<!-- DETAIL VIEW (reviewed submission)                             -->
	<!-- ============================================================ -->
{:else if view === 'detail' && activeSubmission && activeSubmissionTask}
	<div class="detail-page">
		<button type="button" class="back-btn" onclick={goBack}>
			<Icon name="chevron-left" size={18} color="var(--color-ink)" />
			Back
		</button>

		<div class="detail-header">
			<h2 class="detail-title">{activeSubmissionTask.title}</h2>
			{#if activeSubmission.verdict}
				<span
					class="verdict-badge r-pill"
					class:tint-teal={VERDICT_COLORS[activeSubmission.verdict] === 'teal'}
					class:tint-lavender={VERDICT_COLORS[activeSubmission.verdict] === 'lavender'}
					class:tint-rose={VERDICT_COLORS[activeSubmission.verdict] === 'rose'}
				>
					{VERDICT_LABELS[activeSubmission.verdict]}
				</span>
			{/if}
		</div>

		<div class="detail-date">
			Submitted {formatDate(activeSubmission.submittedAt)}
			{#if activeSubmission.reviewedAt}
				&middot; Reviewed {formatDate(activeSubmission.reviewedAt)}
			{/if}
		</div>

		<!-- Secondary context: Opdracht only (detail does not show partial text) -->
		<section class="context-card r-card edge-hair" aria-label="assignment">
			<div class="prompt-section">
				<h3 class="prompt-label">Assignment</h3>
				<p class="prompt-text">{activeSubmissionTask.scenario}</p>
			</div>
		</section>

		<!-- Hero: Domi's answer + Kuromi corner reactor -->
		<div class="answer-display">
			<h3 class="answer-label">Answer</h3>
			<div class="answer-hero-wrap">
				<div class="hero-sparkle" aria-hidden="true">
					<Doodle name="spark-sparkle-26" size={20} color="var(--color-rose-deep)" tilt={-6} />
				</div>
				<div class="answer-bubble bubble-d edge-ink offset-card">
					{activeSubmission.answer}

					{#if activeSubmission.verdict}
						<div class="reactor jit-5 offset-pill" aria-hidden="true">
							{#if activeSubmission.verdict === 'fail'}
								<div class="melody-cameo">
									<Character who="melody" mood="smile" size={40} animated={false} />
								</div>
							{/if}
							<Character
								mood={reactorMood}
								size={32}
								animated={(reactorMood === 'excited' || reactorMood === 'defeated') &&
									!reducedMotion}
							/>
							{#if reactorBurst && !reducedMotion}
								<span class="burst burst-1">
									<Doodle
										name="spark-sparkle-26"
										size={16}
										color="var(--color-teal-deep)"
										tilt={-12}
									/>
								</span>
								<span class="burst burst-2">
									<Doodle
										name="circle-round-mark-30"
										size={18}
										color="var(--color-rose-deep)"
										tilt={20}
									/>
								</span>
								<span class="burst burst-3">
									<Doodle
										name="spark-sparkle-26"
										size={14}
										color="var(--color-rose-deep)"
										tilt={8}
									/>
								</span>
								<span class="burst burst-4">
									<Doodle
										name="circle-round-mark-30"
										size={20}
										color="var(--color-teal-deep)"
										tilt={-18}
									/>
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Feedback note (dashed tip surface) -->
		{#if activeSubmission.comment}
			<div class="comment-display">
				<div class="feedback-doodle" aria-hidden="true">
					<Doodle
						name="thoughts-dreams-clouds-thought-bubble-11"
						size={24}
						color="var(--color-rose-deep)"
						tilt={-8}
					/>
				</div>
				<h3 class="prompt-label">Feedback</h3>
				<div
					class="feedback-box edge-dashed r-chip"
					class:tint-teal={activeSubmission.verdict === 'pass'}
					class:tint-lavender={activeSubmission.verdict === 'close'}
					class:tint-rose={activeSubmission.verdict === 'fail'}
				>
					{activeSubmission.comment}
				</div>
			</div>
		{/if}

		<!-- Criteria for reference (de-emphasized) -->
		<section
			class="criteria-card r-card edge-hair collapsed"
			class:criteria-with-doodle={!activeSubmission.comment}
			aria-label="criteria"
		>
			{#if !activeSubmission.comment}
				<div class="criteria-doodle" aria-hidden="true">
					<Doodle
						name="thoughts-dreams-clouds-thought-bubble-11"
						size={24}
						color="var(--color-rose-deep)"
						tilt={-8}
					/>
				</div>
			{/if}
			<h3 class="prompt-label criteria-label">Criteria</h3>
			<div class="criteria-section">
				<span class="criteria-key">Adequacy:</span>
				<span class="criteria-value">{activeSubmissionTask.gradingCriteria.adequacy}</span>
			</div>
			<div class="criteria-section">
				<span class="criteria-key">Grammar:</span>
				<span class="criteria-value">{activeSubmissionTask.gradingCriteria.grammar}</span>
			</div>
		</section>
	</div>
{/if}

<style>
	/* ============================================ */
	/* PAGE LAYOUT                                  */
	/* ============================================ */
	.reviews-page,
	.write-page,
	.review-page,
	.detail-page {
		padding: 0 16px 100px;
		max-width: 600px;
		margin: 0 auto;
	}

	.reviews-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* ============================================ */
	/* IDENTITY HEADER (list hero)                  */
	/* ============================================ */
	.identity-header {
		position: relative;
		overflow: visible;
		background: #fff;
		padding: 16px;
		margin-top: 12px;
	}

	.sparkle {
		position: absolute;
		top: -8px;
		right: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.identity-row {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.identity-copy {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
	}

	.identity-title {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.1;
		margin: 0;
	}

	.identity-sub {
		margin: 0;
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.3;
	}

	.open-badge {
		display: inline-block;
		margin-top: 4px;
		padding: 3px 10px;
		font-size: var(--text-micro);
		font-weight: 600;
		line-height: 1.3;
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	/* ============================================ */
	/* SQUIGGLE HEADING + TAB TOGGLE                */
	/* ============================================ */
	.list-controls {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.oefenen-head {
		position: relative;
		display: inline-block;
		padding-bottom: 6px;
		margin-bottom: -4px;
	}

	.oefenen-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.15;
		margin: 0;
	}

	.squiggle {
		position: absolute;
		left: 0;
		bottom: -6px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.oefenen-head :global(.doodle) {
		width: 80px !important;
		height: 16px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	.tab-toggle {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 3px;
		background: #fff;
		gap: 2px;
	}

	.tab-seg {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: transparent;
		border: none;
		border-radius: 999px;
		color: var(--color-muted-ink);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 600;
		letter-spacing: -0.01em;
		padding: 8px 12px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.tab-seg.active {
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	/* ============================================ */
	/* TINTED BADGE RECIPES                         */
	/* ============================================ */
	.tint-peach {
		color: var(--color-peach-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	.tint-rose {
		color: var(--color-rose-ink);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
		);
	}

	.tint-lavender {
		color: var(--color-lavender-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.tint-teal {
		color: var(--color-teal-deep);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2px 8px;
		font-size: var(--text-micro);
		font-weight: 700;
		line-height: 1.2;
		flex-shrink: 0;
	}

	.type-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 3px 10px;
		font-size: var(--text-micro);
		font-weight: 700;
		line-height: 1.2;
		flex-shrink: 0;
		letter-spacing: 0.02em;
	}

	/* ============================================ */
	/* TASK / HISTORY FLAT ROWS                     */
	/* ============================================ */
	.task-list,
	.history-list {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.year-group {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.group-heading {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--color-ink);
		text-transform: uppercase;
		margin: 0 0 6px;
	}

	.rank-subheading {
		font-family: var(--font-sans);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--color-muted-ink);
		margin: 8px 0 4px;
	}

	.task-rows {
		display: flex;
		flex-direction: column;
	}

	.task-row {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-line);
		padding: 12px;
		cursor: pointer;
		text-align: left;
		color: var(--color-text);
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s;
	}

	.task-row:last-child {
		border-bottom: none;
	}

	.task-row:hover,
	.task-row:active {
		background: color-mix(in srgb, var(--color-peach) 12%, transparent);
	}

	.task-info {
		flex: 1;
		min-width: 0;
	}

	.task-title {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text);
		display: block;
		line-height: 1.3;
	}

	.task-meta {
		font-size: var(--text-micro);
		color: var(--color-muted-ink);
		margin-top: 1px;
		display: block;
		line-height: 1.3;
	}

	.chevron {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}

	/* ============================================ */
	/* EMPTY STATE                                  */
	/* ============================================ */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
		padding: 40px 12px;
	}

	.empty-message {
		margin: 0;
		font-size: var(--text-base);
		color: var(--color-muted-ink);
		line-height: 1.4;
	}

	.empty-hint {
		padding: 14px 16px;
		font-size: var(--text-small);
		color: var(--color-text);
		line-height: 1.4;
		background: color-mix(in srgb, var(--color-peach) 14%, white);
		max-width: 280px;
	}

	/* ============================================ */
	/* BACK BUTTON                                  */
	/* ============================================ */
	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		color: var(--color-ink);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
		padding: 12px 0;
		-webkit-tap-highlight-color: transparent;
	}

	/* ============================================ */
	/* WRITE VIEW                                   */
	/* ============================================ */
	.write-page .back-btn {
		color: var(--color-ink);
		gap: 6px;
	}

	.write-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		margin-bottom: 16px;
	}

	.write-title-wrap {
		position: relative;
		display: inline-block;
		padding-bottom: 6px;
		margin-bottom: -4px;
	}

	.write-title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.15;
		color: var(--color-ink);
		margin: 0;
	}

	.write-title-wrap .squiggle {
		position: absolute;
		left: 0;
		bottom: -6px;
		z-index: 0;
		pointer-events: none;
		line-height: 0;
	}

	.write-title-wrap :global(.doodle) {
		width: 80px !important;
		height: 16px !important;
		mask-size: 100% 100% !important;
		-webkit-mask-size: 100% 100% !important;
	}

	/* Hero prompt card — sole ink-bordered surface in write view */
	.prompt-hero {
		position: relative;
		overflow: visible;
		background: #fff;
		padding: 18px;
		margin-bottom: 16px;
	}

	.hero-sparkle {
		position: absolute;
		top: -8px;
		right: 10px;
		pointer-events: none;
		line-height: 0;
	}

	.prompt-section-tekst {
		margin-top: 14px;
		padding-top: 14px;
		border-top: 1px solid var(--color-line);
	}

	/* Shared label/body rules — write + review + detail */
	.prompt-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-peach-deep);
		margin: 0 0 8px;
	}

	.prompt-text {
		font-size: var(--text-base);
		line-height: 1.55;
		color: var(--color-text);
		white-space: pre-wrap;
		margin: 0;
	}

	.partial-text {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.55;
		color: var(--color-text);
		white-space: pre-wrap;
		word-wrap: break-word;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
	}

	.answer-area {
		margin-bottom: 16px;
	}

	.answer-input {
		width: 100%;
		box-sizing: border-box;
		background: color-mix(in srgb, var(--color-peach) 10%, white);
		border: 1px solid var(--color-line);
		border-radius: 14px;
		padding: 14px;
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--text-lead);
		line-height: 1.5;
		resize: vertical;
		outline: none;
		transition: border 0.15s;
	}

	.answer-input:focus {
		border: 2px solid var(--color-peach-deep);
		outline: none;
	}

	.answer-input::placeholder {
		color: var(--color-muted-ink);
	}

	.char-count-row {
		display: flex;
		justify-content: flex-end;
		margin-top: 6px;
	}

	.char-count {
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		font-size: var(--text-micro);
		font-weight: 600;
		line-height: 1.2;
	}

	.submit-btn {
		width: 100%;
		padding: 14px;
		background: var(--color-peach-deep);
		color: var(--color-cream);
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		letter-spacing: 0.04em;
		border: none;
		border-radius: 999px;
		box-shadow: var(--shadow-offset-ink);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			opacity 0.15s,
			transform 0.1s,
			box-shadow 0.15s;
	}

	.submit-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
		box-shadow: none;
	}

	.submit-btn:not(:disabled):active {
		transform: scale(0.98);
	}

	/* ============================================ */
	/* REVIEW PACKET                                */
	/* ============================================ */
	.review-page .back-btn,
	.detail-page .back-btn {
		color: var(--color-ink);
		gap: 6px;
	}

	.review-header {
		margin-bottom: 16px;
	}

	.review-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		margin: 0;
	}

	.review-subtitle {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin: 2px 0 0;
		line-height: 1.35;
	}

	/* Non-hero reference card (Opdracht / Tekst) */
	.context-card {
		position: relative;
		padding: 14px 16px;
		margin-bottom: 14px;
		background: color-mix(in srgb, var(--color-peach) 10%, white);
	}

	/* Hero answer surface */
	.answer-display {
		margin-bottom: 14px;
	}

	.answer-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		margin: 0 0 8px;
	}

	.answer-hero-wrap {
		position: relative;
	}

	.answer-bubble {
		position: relative;
		width: 100%;
		box-sizing: border-box;
		padding: 14px 16px;
		/* Promote past bubble-d's 2px border (edge-ink loses cascade order in app.css) */
		border: 3px solid var(--color-ink);
		white-space: pre-wrap;
		word-wrap: break-word;
		font-size: var(--text-base);
		line-height: 1.5;
		color: var(--color-text);
		/* Room for the corner reactor on detail without crowding short answers */
		min-height: 56px;
	}

	/* Criteria card — lavender wash, hairline only (not edge-ink) */
	.criteria-card {
		position: relative;
		padding: 14px 16px;
		margin-bottom: 14px;
		background: color-mix(in srgb, var(--color-lavender) 12%, white);
	}

	.criteria-card.collapsed {
		opacity: 0.7;
	}

	.criteria-label {
		color: var(--color-lavender-deep);
	}

	.criteria-section {
		margin-bottom: 10px;
	}

	.criteria-section:last-child {
		margin-bottom: 0;
	}

	.criteria-key {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-muted-ink);
		display: block;
		margin-bottom: 2px;
	}

	.criteria-value {
		font-size: var(--text-small);
		line-height: 1.5;
		color: var(--color-text);
	}

	.comment-area {
		margin-bottom: 16px;
	}

	.comment-input {
		width: 100%;
		box-sizing: border-box;
		background: color-mix(in srgb, var(--color-peach) 10%, white);
		border: 1px solid var(--color-line);
		border-radius: 14px;
		padding: 14px;
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.4;
		resize: vertical;
		outline: none;
		transition: border 0.15s;
	}

	.comment-input:focus {
		border: 2px solid var(--color-peach-deep);
		outline: none;
	}

	.comment-input::placeholder {
		color: var(--color-muted-ink);
	}

	.verdict-wrap {
		position: relative;
		padding-top: 8px;
	}

	.verdict-doodle {
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		pointer-events: none;
		line-height: 0;
		z-index: 1;
	}

	.verdict-buttons {
		display: flex;
		gap: 10px;
	}

	.verdict-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 14px 8px;
		border: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: transform 0.1s;
	}

	.verdict-btn:active {
		transform: scale(0.96);
	}

	.verdict-label {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.2;
	}

	.verdict-lp {
		font-size: var(--text-micro);
		font-weight: 600;
		opacity: 0.85;
		line-height: 1.2;
	}

	/* ============================================ */
	/* DETAIL VIEW                                  */
	/* ============================================ */
	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 4px;
		flex-wrap: wrap;
	}

	.detail-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		margin: 0;
		line-height: 1.15;
		flex: 1;
		min-width: 0;
	}

	.verdict-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 4px 12px;
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.03em;
		line-height: 1.2;
		flex-shrink: 0;
	}

	.detail-date {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		margin-bottom: 16px;
		line-height: 1.35;
	}

	/* Kuromi corner reactor — pinned inside answer hero, not fixed */
	.reactor {
		position: absolute;
		top: -10px;
		right: -6px;
		z-index: 2;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		width: 40px;
		height: 40px;
		pointer-events: none;
		line-height: 0;
		background: color-mix(in srgb, var(--color-peach) 18%, white);
		border-radius: 999px;
		padding: 2px;
	}

	.melody-cameo {
		position: absolute;
		right: 22px;
		bottom: -2px;
		z-index: 0;
		opacity: 0.92;
		line-height: 0;
		pointer-events: none;
	}

	.reactor :global(.character) {
		position: relative;
		z-index: 1;
	}

	/* Confetti-doodle burst (pass only, transient, never under reduced motion) */
	.burst {
		position: absolute;
		pointer-events: none;
		line-height: 0;
		animation: reactor-burst 1000ms ease-out both;
	}

	.burst-1 {
		top: -14px;
		left: -10px;
		--burst-x: -14px;
		--burst-y: -18px;
		--burst-r: -18deg;
	}

	.burst-2 {
		top: -16px;
		right: -12px;
		--burst-x: 16px;
		--burst-y: -14px;
		--burst-r: 22deg;
	}

	.burst-3 {
		bottom: -8px;
		left: -16px;
		--burst-x: -18px;
		--burst-y: 10px;
		--burst-r: 12deg;
	}

	.burst-4 {
		bottom: -10px;
		right: -14px;
		--burst-x: 14px;
		--burst-y: 12px;
		--burst-r: -14deg;
	}

	@keyframes reactor-burst {
		0% {
			opacity: 0;
			transform: translate(0, 0) rotate(0deg) scale(0.6);
		}
		18% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(var(--burst-x, 12px), var(--burst-y, -16px))
				rotate(var(--burst-r, 12deg)) scale(1.05);
		}
	}

	.comment-display {
		position: relative;
		margin-bottom: 14px;
	}

	.feedback-doodle {
		position: absolute;
		top: -4px;
		right: 4px;
		pointer-events: none;
		line-height: 0;
	}

	.feedback-box {
		padding: 12px 14px;
		font-size: var(--text-small);
		line-height: 1.5;
		color: var(--color-text);
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.criteria-with-doodle {
		padding-top: 18px;
	}

	.criteria-doodle {
		position: absolute;
		top: -6px;
		right: 8px;
		pointer-events: none;
		line-height: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.burst {
			animation: none;
			display: none;
		}
	}
</style>
