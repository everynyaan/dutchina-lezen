<script lang="ts">
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import Icon from '$lib/icons/Icon.svelte';
	import InstallSticker from '$lib/components/home/InstallSticker.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import KuromiBubble from '$lib/components/reading/KuromiBubble.svelte';
	import TypeGrid from '$lib/components/reading/TypeGrid.svelte';
	import { allTypesOpen, setAllTypesOpen } from '$lib/shell/desk.svelte';
	import { resolve } from '$app/paths';
	import { getTodayDate } from '$lib/match/engine';
	import { unseenMisses } from '$lib/reading/eval';
	import { readCoachNote } from '$lib/kuromi/note';
	import { reflexLine } from '$lib/kuromi/lines';
	import { showWeeklyMessage } from '$lib/kuromi/live';
	import { setMondayBrief } from '$lib/kuromi/focus';
	import { requestKuromiChat } from '$lib/kuromi/visibility.svelte';
	import { PLAN_LINE } from '$lib/reading/readiness';

	const ctx = getGameContext();
	let settingsOpen = $state(false);
	let planOpen = $state(false);
	const today = getTodayDate();

	function greetingForHour(hour: number): string {
		if (hour < 6) return 'good night';
		if (hour < 12) return 'good morning';
		if (hour < 18) return 'good afternoon';
		return 'good evening';
	}

	function formatDateLabel(date: Date): string {
		return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
	}

	let greeting = $state(greetingForHour(new Date().getHours()));
	let dateLabel = $state(formatDateLabel(new Date()));

	let evalDone = $derived(
		ctx.state.readingFork.eval.date === today && ctx.state.readingFork.eval.completed
	);
	let unseen = $derived(unseenMisses(ctx.state.readingFork.misses).length);
	let reservedYears = $derived(
		[...(ctx.state.readingFork.settings.reservedPapers ?? [])].sort((a, b) => a - b)
	);
	let nextPaper = $derived(reservedYears[0] ?? null);
	let glow = $derived(!evalDone ? 'daily' : unseen > 0 ? 'drills' : 'mock');
	let heroBubble = $derived.by(() => {
		const sealed =
			reservedYears.length === 0
				? 'Nothing is sealed.'
				: reservedYears.length === 1
					? `${reservedYears[0]} is sealed.`
					: `${reservedYears.join(' and ')} are sealed.`;
		if (!evalDone) return `${sealed} Open today's text.`;
		if (unseen > 0) return `${unseen} drills are due. Open drills.`;
		return `${sealed} Open the next mock.`;
	});
	let planItems = $derived(
		PLAN_LINE.split('. ')
			.map((part) => part.replace(/\.$/, ''))
			.filter(Boolean)
	);
	let coachNoteText = $state('');
	let noteLabel = reflexLine('note-label');
	let weekly = showWeeklyMessage(today);

	function openWeekly() {
		setMondayBrief(true);
		requestKuromiChat();
	}

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	const INSTALL_DISMISSED_KEY = 'dutchina-install-dismissed';

	let deferredInstall = $state<BeforeInstallPromptEvent | null>(null);
	let installVisible = $state(false);

	onMount(() => {
		const now = new Date();
		greeting = greetingForHour(now.getHours());
		dateLabel = formatDateLabel(now);
		coachNoteText = readCoachNote();

		if (localStorage.getItem(INSTALL_DISMISSED_KEY) === '1') return;

		const onBeforeInstall = (e: Event) => {
			e.preventDefault();
			deferredInstall = e as BeforeInstallPromptEvent;
			installVisible = true;
		};

		const onAppInstalled = () => {
			deferredInstall = null;
			installVisible = false;
			localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		window.addEventListener('appinstalled', onAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', onBeforeInstall);
			window.removeEventListener('appinstalled', onAppInstalled);
		};
	});

	async function installApp() {
		if (!deferredInstall) return;
		playSfx('button_tap');
		try {
			await deferredInstall.prompt();
			await deferredInstall.userChoice;
		} catch {
			// Browser rejected the call.
		}
		deferredInstall = null;
		installVisible = false;
	}

	function dismissInstall() {
		installVisible = false;
		localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
	}
</script>

<div class="home stagger">
	<div class="greeting-row">
		<div class="greeting-text">
			<h1 class="greeting">{greeting}</h1>
			<p class="date">{dateLabel}</p>
		</div>
		<div class="header-actions">
			{#if ctx.syncStatus === 'offline'}
				<span class="offline-glyph" title="Offline">
					<Icon name="cloud-slash" size={14} color="var(--color-muted-ink)" />
				</span>
			{/if}
			<button
				type="button"
				class="icon-btn"
				onclick={() => (settingsOpen = true)}
				aria-label="Open settings"
			>
				<Icon name="gear" size={20} color="var(--color-ink)" />
			</button>
			<button
				type="button"
				class="icon-btn"
				onclick={() => ctx.toggleMute()}
				aria-label={ctx.state.audio.sfxMuted ? 'Unmute sound effects' : 'Mute sound effects'}
			>
				{#if ctx.state.audio.sfxMuted}
					<Icon name="volume-slash" size={20} color="var(--color-ink)" />
				{:else}
					<Icon name="volume-high" size={20} color="var(--color-ink)" />
				{/if}
			</button>
		</div>
	</div>

	<div class="hero-wrap">
		<span class="hero-spark jit-5">
			<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" />
		</span>
		<Card variant="soft-rose">
			<KuromiBubble mood={evalDone ? 'wink' : 'coffee'} bare>
				<p>{heroBubble}</p>
			</KuromiBubble>
		</Card>
		<span class="hero-arrow jit-3">
			<Doodle name="swirl-arrow-6" size={36} color="var(--color-ink)" />
		</span>
	</div>

	<section class="today">
		<h2 class="section-label jit-a">Today</h2>
		<span class="squiggle">
			<Doodle name="shape-swirl-loops-4" size={42} color="var(--color-rose-deep)" />
		</span>
		<div class="today-pair">
			<a
				class="action peach"
				class:glow={glow === 'daily'}
				href={resolve('/eval')}
				onclick={() => playSfx('button_tap')}
			>
				<span class="hub-title">{evalDone ? 'Daily text done' : 'Daily text'}</span>
				<span class="chip">{evalDone ? 'Done' : 'About 15 min'}</span>
				<span class="hub-sub">One passage. Map, three questions, one paraphrase.</span>
			</a>
			<a
				class="action lavender"
				class:glow={glow === 'drills'}
				href={resolve('/cards')}
				onclick={() => playSfx('button_tap')}
			>
				<span class="hub-title">Drills</span>
				<span class="chip">{unseen ? `${unseen} due` : 'Clear'}</span>
			</a>
		</div>
		<button type="button" class="quiet" onclick={() => (planOpen = true)}>
			Next: baseline mock by 12 Oct
		</button>
	</section>

	<div class="secondary">
		<a
			class="action teal"
			class:glow={glow === 'mock'}
			href={resolve('/mock')}
			onclick={() => playSfx('button_tap')}
		>
			<span class="hub-title">Mock</span>
			<span class="chip">{nextPaper ? `next paper: ${nextPaper}, sealed` : 'no paper sealed'}</span>
			<span class="chip">12 Oct</span>
		</a>
		<a class="action rose" href={resolve('/sets')} onclick={() => playSfx('button_tap')}>
			<span class="hub-title">Practice sets</span>
			<span class="chip">Next set: 2</span>
		</a>
		<a class="action peach" href={resolve('/lezen')} onclick={() => playSfx('button_tap')}>
			<span class="hub-title">Texts</span>
			<span class="chip">Training papers</span>
		</a>
		<a class="action lavender" href={resolve('/playbook')} onclick={() => playSfx('button_tap')}>
			<span class="hub-title">Playbook</span>
			<span class="chip">Moves and traps</span>
		</a>
	</div>

	{#if allTypesOpen()}
		<section class="all-types">
			<div class="all-head">
				<h2 class="section-label">All types</h2>
				<button type="button" class="quiet" onclick={() => setAllTypesOpen(false)}>Close</button>
			</div>
			<TypeGrid />
		</section>
	{/if}

	{#if coachNoteText && noteLabel}
		<p class="quiet-note">{noteLabel}. {coachNoteText}</p>
	{/if}
	{#if weekly}
		<button type="button" class="weekly" onclick={openWeekly}>Weekly message</button>
	{/if}

	{#if installVisible}
		<InstallSticker onInstall={installApp} onDismiss={dismissInstall} />
	{/if}
</div>

{#if planOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="plan-backdrop"
		role="presentation"
		onclick={() => (planOpen = false)}
		onkeydown={(event) => {
			if (event.key === 'Escape') planOpen = false;
		}}
	>
		<div
			class="plan-sheet"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="plan-title"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => {
				if (event.key === 'Escape') planOpen = false;
			}}
		>
			<h2 id="plan-title">Plan</h2>
			<ul>
				{#each planItems as item (item)}
					<li>
						<span class="tick" aria-hidden="true">○</span>
						{item}
					</li>
				{/each}
			</ul>
			<button type="button" class="quiet" onclick={() => (planOpen = false)}>Close</button>
		</div>
	</div>
{/if}

<SettingsPanel open={settingsOpen} onclose={() => (settingsOpen = false)} />

<style>
	.home {
		padding: 0.35rem 0 calc(32px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.greeting-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.greeting-text {
		min-width: 0;
	}

	.greeting {
		font-family: var(--font-display);
		font-size: var(--text-hero);
		font-weight: 700;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.date {
		margin-top: 4px;
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.3;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		padding-top: 4px;
	}

	.offline-glyph {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 4px;
	}

	.icon-btn {
		background: none;
		border: none;
		border-radius: 12px;
		padding: 8px;
		cursor: pointer;
		display: flex;
	}

	.home {
		max-width: 1100px;
	}

	.hero-wrap {
		position: relative;
	}

	.hero-spark,
	.hero-arrow,
	.squiggle {
		position: absolute;
		pointer-events: none;
		line-height: 0;
	}

	.hero-spark {
		top: -8px;
		right: 12px;
		z-index: 1;
	}

	.hero-arrow {
		left: 72px;
		bottom: -18px;
		z-index: 1;
	}

	.today {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.section-label {
		margin: 0;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 700;
	}

	.squiggle {
		position: absolute;
		left: 78px;
		top: -6px;
	}

	.today-pair,
	.secondary {
		display: grid;
		gap: 12px;
	}

	.today-pair {
		grid-template-columns: 1fr 1fr;
	}

	.secondary {
		grid-template-columns: 1fr 1fr;
	}

	.action {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		min-height: 92px;
		padding: 16px;
		border-radius: 22px;
		text-decoration: none;
		color: var(--color-ink);
		box-shadow: var(--shadow-offset-card);
	}

	.action.peach {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-peach) 70%, white),
			#fff 70%
		);
	}
	.action.lavender {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-lavender) 45%, white),
			#fff 72%
		);
	}
	.action.teal {
		background: linear-gradient(180deg, color-mix(in srgb, var(--color-teal) 50%, white), #fff 72%);
	}
	.action.rose {
		background: linear-gradient(180deg, color-mix(in srgb, var(--color-rose) 55%, white), #fff 72%);
	}

	.hub-title {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 700;
		line-height: 1.15;
	}

	.hub-sub {
		font-size: 14px;
		color: var(--color-muted-ink);
		line-height: 1.4;
	}

	.chip {
		display: inline-flex;
		padding: 3px 8px;
		border-radius: 999px;
		background: white;
		font-size: 14px;
		font-weight: 700;
		line-height: 1.2;
	}

	.quiet,
	.weekly {
		align-self: flex-start;
		font: inherit;
		font-size: 14px;
		font-weight: 700;
		color: var(--color-muted-ink);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.weekly {
		color: var(--color-ink);
	}

	.quiet-note {
		margin: 0;
		font-size: 14px;
		color: var(--color-muted-ink);
	}

	.all-types {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.all-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.glow {
		box-shadow:
			0 0 0 3px var(--color-rose),
			var(--shadow-offset-card);
		animation: home-glow 1.2s ease-in-out infinite;
	}

	.plan-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-ink) 35%, transparent);
		z-index: 200;
		display: grid;
		place-items: end center;
	}

	.plan-sheet {
		width: min(560px, 100%);
		max-height: 80vh;
		overflow: auto;
		background: white;
		border: 3px solid var(--color-ink);
		border-radius: 22px 22px 0 0;
		box-shadow: var(--shadow-offset-frame);
		padding: 20px 20px 28px;
	}

	.plan-sheet h2 {
		font-family: var(--font-display);
		font-size: 28px;
		margin: 0 0 12px;
	}

	.plan-sheet ul {
		list-style: none;
		margin: 0 0 16px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.plan-sheet li {
		display: flex;
		gap: 8px;
		font-size: 17px;
		line-height: 1.4;
	}

	@keyframes home-glow {
		50% {
			box-shadow:
				0 0 0 6px color-mix(in srgb, var(--color-rose) 55%, transparent),
				var(--shadow-offset-card);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glow {
			animation: none;
		}
	}

	@media (max-width: 720px) {
		.today-pair,
		.secondary {
			grid-template-columns: 1fr;
		}
	}
</style>
