<script lang="ts">
	import { onMount } from 'svelte';
	import { getGameContext } from '$lib/state/context';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { playSfx } from '$lib/sound/sfx';
	import Icon from '$lib/icons/Icon.svelte';
	import InstallSticker from '$lib/components/home/InstallSticker.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { resolve } from '$app/paths';
	import { getTodayDate } from '$lib/match/engine';
	import { evalResults, unseenMisses } from '$lib/reading/eval';
	import { predictiveAvailable, yearStudied } from '$lib/reading/mock';
	import { readCoachNote } from '$lib/kuromi/note';
	import { reflexLine } from '$lib/kuromi/lines';
	import { showWeeklyMessage } from '$lib/kuromi/live';
	import { setMondayBrief } from '$lib/kuromi/focus';
	import { requestKuromiChat } from '$lib/kuromi/visibility.svelte';
	import {
		PLAN_LINE,
		examCountdown,
		lastMockLine,
		lastMockView,
		locateLine,
		locateWindow,
		openTraps,
		qtypeLine,
		qtypeReadiness,
		trapLine
	} from '$lib/reading/readiness';

	const ctx = getGameContext();
	let settingsOpen = $state(false);
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
	let predictiveOpen = $derived(
		predictiveAvailable(
			ctx.state.readingFork.satMocks,
			yearStudied(
				2023,
				ctx.state.lezen.questionResults,
				evalResults(ctx.state.readingFork.eval),
				ctx.state.readingFork.misses.map((miss) => miss.questionId)
			)
		)
	);
	let examLine = $derived(examCountdown(ctx.state.readingFork.settings.examDate, today));
	let mockLine = $derived(lastMockLine(lastMockView(ctx.state.readingFork)));
	let typeRows = $derived(qtypeReadiness(ctx.state.readingFork));
	let locatedLine = $derived(locateLine(locateWindow(ctx.state.readingFork, 50)));
	let trapsLine = $derived(trapLine(openTraps(ctx.state.readingFork)));
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

	<Card variant="soft-rose">
		<p class="kicker">Kuromi says</p>
		<p class="hero-copy">
			The published papers needed 24 of 35. Aim for 25 or more. Skip, flag, don't hunt one word.
			Training is 2024 and 2025. 2023 stays sealed for one predictive mock.
		</p>
	</Card>

	<section class="readiness">
		<h2>Days to the exam</h2>
		<p>{examLine}</p>
		<h2>Last mock</h2>
		<p>{mockLine}</p>
		<h2>Plan</h2>
		<p class="plan">{PLAN_LINE}</p>
		{#if coachNoteText && noteLabel}
			<h2>{noteLabel}</h2>
			<p class="plan">{coachNoteText}</p>
		{/if}
		{#if weekly}
			<button type="button" class="weekly" onclick={openWeekly}>Weekly message</button>
		{/if}
		<h2>Question types</h2>
		<ul class="types">
			{#each typeRows as row (row.qtype)}
				<li class="type-row">
					<span>{qtypeLine(row)}</span>
					<a href="{resolve('/cards')}?qtype={row.qtype}">Practice this</a>
				</li>
			{/each}
		</ul>
		<h2>Found the right paragraph</h2>
		<p>{locatedLine}</p>
		<h2>Open trap cards</h2>
		<p>{trapsLine}</p>
	</section>

	<a class="hub-card" href={resolve('/eval')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">{evalDone ? 'Daily text done' : 'Daily text'}</span>
		<span class="hub-sub">One passage. Map, three questions, one paraphrase.</span>
	</a>
	<a class="hub-card" href={resolve('/cards')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">Drills</span>
		<span class="hub-sub">{unseen ? `${unseen} unseen` : 'Clear.'}</span>
	</a>
	<a class="hub-card" href={resolve('/mock')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">Mock</span>
		<span class="hub-sub">{predictiveOpen ? 'Predictive mock. Once.' : 'Format rehearsal.'}</span>
		<span class="hub-sub">The published papers needed 24 of 35. Aim for 25 or more.</span>
	</a>
	<a class="hub-card" href={resolve('/lezen')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">Texts</span>
		<span class="hub-sub">2024 and 2025. 2023 is saved for your mock.</span>
	</a>

	{#if installVisible}
		<InstallSticker onInstall={installApp} onDismiss={dismissInstall} />
	{/if}
</div>

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

	.kicker {
		font-size: var(--text-micro);
		text-transform: uppercase;
		color: var(--color-muted-ink);
		margin: 0 0 6px;
	}
	.hero-copy {
		font-size: var(--text-lead);
		line-height: 1.45;
		margin: 0;
	}
	.hub-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px 18px;
		border: 3px solid var(--color-ink);
		border-radius: 22px;
		box-shadow: var(--card-shadow);
		background: #fff;
		text-decoration: none;
		color: var(--color-ink);
	}
	.hub-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
	}
	.hub-sub {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.4;
	}

	.readiness {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.readiness h2 {
		font-family: var(--font-display);
		font-size: var(--text-title);
		margin: 0.6rem 0 0;
	}

	.readiness p,
	.plan {
		margin: 0;
		line-height: 1.45;
	}

	.weekly {
		align-self: flex-start;
		font: inherit;
		font-weight: 700;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		background: var(--color-rose);
		padding: 0.35rem 0.8rem;
		cursor: pointer;
	}

	.types {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.type-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.25rem 0.75rem;
		align-items: baseline;
	}

	.type-row a {
		color: var(--color-ink);
		font-weight: 700;
	}

	.plan {
		margin: 0;
		line-height: 1.45;
		color: var(--color-ink);
	}
</style>
