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
	import { unseenMisses } from '$lib/reading/eval';

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

	let evalDone = $derived(ctx.state.readingFork.eval.date === today && ctx.state.readingFork.eval.completed);
	let unseen = $derived(unseenMisses(ctx.state.readingFork.misses).length);
	let bothRehearsals = $derived(
		ctx.state.readingFork.satMocks.includes(2024) && ctx.state.readingFork.satMocks.includes(2023)
	);

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
			Live paper is 22 of 36. Skip, flag, don't hunt one word. The mock is a paper you have not
			practiced.
		</p>
	</Card>

	<a class="hub-card" href={resolve('/eval')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">{evalDone ? 'Today done' : 'Today'}</span>
		<span class="hub-sub">One full text. All its questions.</span>
	</a>
	<a class="hub-card" href={resolve('/cards')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">Debrief</span>
		<span class="hub-sub">{unseen ? `${unseen} unseen` : 'Clear.'}</span>
	</a>
	<a class="hub-card" href={resolve('/mock')} onclick={() => playSfx('button_tap')}>
		<span class="hub-title">Mock</span>
		<span class="hub-sub">{bothRehearsals ? 'Both rehearsals done.' : 'Sealed paper. Once.'}</span>
		<span class="hub-sub">Live paper is 22 of 36.</span>
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
</style>
