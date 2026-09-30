<script lang="ts">
	import { resolve } from '$app/paths';
	import '../app.css';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { loadState, saveState, debounce } from '$lib/state/store';
	import { createDefaultState } from '$lib/state/defaults';
	import type {
		CurrentState,
		AppConfig,
		AdjustmentEntry,
		StewardAward,
		KuromiPage
	} from '$lib/state/schema';
	import { setGameContext, type SyncStatus } from '$lib/state/context';
	import { applyEvent as applyLpEvent, type LpEvent, type LpResult } from '$lib/lp/lp';
	import {
		foldMissingSessionLogs,
		maybeAdvanceGates,
		unlockToastMessage
	} from '$lib/gates/mastery';
	import { CONFIG_TOP_LEVEL_KEYS, type StewardHost } from '$lib/kuromi/executor';
	import { upsertPageIn, removePageFrom } from '$lib/kuromi/pageStore';
	import { playSfx, setSfxMuted } from '$lib/sound/sfx';
	import { GATE_IDENTITY } from '$lib/gates/home';
	import Toast from '$lib/components/Toast.svelte';
	import ParticleOverlay from '$lib/components/ParticleOverlay.svelte';
	import { addToast } from '$lib/components/toastStore';
	import { triggerEffect, startLoop } from '$lib/effects/effectStore';
	import { checkAchievements, applyAchievementUnlocks } from '$lib/achievements/engine';
	import { ACHIEVEMENT_MAP } from '$lib/achievements/ACHIEVEMENTS';
	import { updateMissionProgress } from '$lib/missions/engine';
	import { MISSION_MAP } from '$lib/missions/MISSIONS';
	import type { MissionProgressSource } from '$lib/missions/MISSIONS';
	import { getISOWeekKey, weeksBetween } from '$lib/time/week';
	import { getActiveProfile, type ProfileId } from '$lib/profiles/profiles';
	import {
		startSync,
		stopSync,
		pushNow,
		flushOnUnload,
		resetRemote,
		syncStatus as engineStatus
	} from '$lib/sync/engine.svelte';
	import { initAuth } from '$lib/auth/session.svelte';
	import { initDb, seedCardReviews, exportCardReviews } from '$lib/db/db';
	import { currentGateFromState } from '$lib/gates/gates';
	import { dueTraps } from '$lib/reading/traps';
	import { getTodayDate } from '$lib/match/engine';

	import Icon from '$lib/icons/Icon.svelte';
	import SummonButton from '$lib/components/kuromi/SummonButton.svelte';
	import ChatSheet from '$lib/components/kuromi/ChatSheet.svelte';
	import RailNav from '$lib/components/shell/RailNav.svelte';
	import KuromiResident from '$lib/components/shell/KuromiResident.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}
	let { children }: Props = $props();

	// Kuromi chat sheet — local open flag only; history is profile-localStorage
	let kuromiOpen = $state(false);
	let summonButtonEl = $state<HTMLButtonElement | undefined>();

	function openKuromi() {
		kuromiOpen = true;
	}

	function closeKuromi() {
		kuromiOpen = false;
		// Return focus to the summon FAB after dismiss
		queueMicrotask(() => summonButtonEl?.focus());
	}

	// ============================================================
	// STATE + PROFILE
	// ============================================================
	let activeProfile = $state<ProfileId>(getActiveProfile());
	let syncStatus: SyncStatus = $derived(
		engineStatus.phase === 'idle' ||
			engineStatus.phase === 'pulling' ||
			engineStatus.phase === 'pushing'
			? 'online'
			: engineStatus.phase === 'offline' || engineStatus.phase === 'error'
				? 'offline'
				: 'disabled'
	);

	// ============================================================
	// PRE-INIT RESET CHECK
	// The reset button sets a flag and reloads. On the NEXT load,
	// we check the flag here, BEFORE state initializes. This way
	// loadState() below reads the zeroed state we write here,
	// and no $effect ever sees the old values.
	// ============================================================
	if (typeof window !== 'undefined') {
		const resetKey = `dutchina_reset_${activeProfile}`;
		if (localStorage.getItem(resetKey)) {
			// Write clean default state BEFORE loadState runs
			const fresh = createDefaultState();
			localStorage.setItem(`dutchina_state_${activeProfile}`, JSON.stringify(fresh));
			localStorage.removeItem(`dutchina_state_${activeProfile}_ts`);
			localStorage.removeItem(resetKey);
			// Wipe IndexedDB (card reviews, audio cache)
			indexedDB.deleteDatabase(`dutchina_${activeProfile}`);
			// Remote app_state rows are deleted in onMount via dutchina_reset_remote_<profile> + resetRemote()
			// Reload to get a fully clean init (fresh Dexie, fresh onMount)
			window.location.reload();
		}
	}

	let gameState = $state<CurrentState>(loadState(activeProfile) as CurrentState);

	// Initialize profile-scoped IndexedDB synchronously so child
	// components (Cards, Match) can access it in their onMount.
	// Svelte mounts children BEFORE parents, so if this runs in
	// the layout's onMount it's too late.
	if (typeof window !== 'undefined') {
		initDb(activeProfile);
	}

	// Keep runtime SFX mute flag aligned with state (engine pull, realtime, local toggles).
	$effect(() => {
		setSfxMuted(gameState.audio.sfxMuted);
	});

	// A finished daily / week set that never wrote quizLog / weekLog still
	// lands in the logs so hub and home bars move on the next paint.
	$effect(() => {
		const next = foldMissingSessionLogs(
			gameState.gates,
			gameState.dailyQuiz,
			gameState.dailyHomework
		);
		if (next !== gameState.gates) {
			gameState.gates = next;
		}
	});

	const debouncedSave = debounce((s: CurrentState, p: ProfileId) => {
		saveState(s, p);
		pushNow().catch(() => {});
	}, 500);

	$effect(() => {
		JSON.stringify(gameState);
		debouncedSave(gameState, activeProfile);
	});

	onDestroy(stopSync);

	onMount(async () => {
		// Reload state from localStorage now that we are definitely in the browser.
		activeProfile = getActiveProfile();
		gameState = loadState(activeProfile) as CurrentState;

		// Re-init DB if profile differs from the synchronous default
		initDb(activeProfile);

		// Auth then sync engine: pull+merge per-subsystem, then realtime.
		await initAuth();

		// Explicit "delete all progress": wipe server rows BEFORE startSync pull
		// so merge cannot resurrect pre-reset progress into the fresh local defaults.
		const resetRemoteKey = `dutchina_reset_remote_${activeProfile}`;
		if (localStorage.getItem(resetRemoteKey)) {
			const ok = await resetRemote();
			console.log('[sync] remote reset: %s', ok ? 'done' : 'failed, will retry next load');
			if (ok) localStorage.removeItem(resetRemoteKey);
		}

		await startSync({
			getState: () => gameState,
			applyState: (next) => {
				gameState = next;
				saveState(next, activeProfile);
			}
		});

		// Seed Dexie from state.cardReviews after engine has applied pulled state.
		if (Object.keys(gameState.cardReviews).length > 0) {
			const seeded = await seedCardReviews(gameState.cardReviews);
			if (seeded > 0) {
				console.log('[sync] seeded %d card reviews into Dexie', seeded);
			}
		}

		// ============================================================
		// BACKFILL: one-time Dexie -> state.cardReviews copy
		// On the first load after v15 migration, state.cardReviews is
		// empty but Dexie may have existing review data. Copy it in
		// so it syncs on the next push. Runs exactly once.
		// ============================================================
		if (Object.keys(gameState.cardReviews).length === 0) {
			const existing = await exportCardReviews();
			const count = Object.keys(existing).length;
			if (count > 0) {
				gameState.cardReviews = existing;
				console.log('[sync] backfilled %d card reviews from Dexie into state', count);
			}
		}

		// Persist local + push any dirty subsystems after seed/backfill.
		saveState(gameState, activeProfile);
		pushNow().catch(() => {});

		// Flush on unload; engine owns visibilitychange (pull on visible).
		window.addEventListener('pagehide', () => {
			saveState(gameState, activeProfile);
			flushOnUnload();
		});

		// ============================================================
		// WEEKLY RESET: streak, bonus, missions (+ daily lpEarnedToday)
		// Cadence gates compare ISO-week keys. lpEarnedToday stays a
		// per-day counter (it only feeds the Home "Today" card).
		// ============================================================
		const today = getTodayISO();
		const thisWeek = getISOWeekKey();

		// Streak tracking: consecutive ISO weeks with >= 1 session.
		if (!gameState.lastSessionDate || getISOWeekKey(gameState.lastSessionDate) !== thisWeek) {
			if (gameState.lastSessionDate) {
				// Increment only if last session was the immediately prior
				// ISO week; any longer gap resets the streak to 1
				// (except gentle mode, which auto-repairs the gap).
				if (weeksBetween(gameState.lastSessionDate, today) === 1) {
					gameState.practiceDays += 1;
				} else if (gameState.appConfig.streaks === 'gentle') {
					gameState.practiceDays += 1;
					// Kuromi auto-repairs the streak gap in gentle mode; log it to the
					// adjustments audit trail so Eyad sees it and Kuromi can narrate it.
					stewardHost.appendAdjustment({
						id: stewardHost.newId(),
						timestamp: stewardHost.nowISO(),
						tool: 'forgive_streak',
						outcome: 'applied',
						detail:
							'Gentle mode auto-repaired a broken practice streak after a gap of more than one week.',
						reason: 'gentle mode auto-repair',
						payload: {},
						undone: false
					});
				} else {
					gameState.practiceDays = 1;
				}
			} else {
				// First ever session
				gameState.practiceDays = 1;
			}
			gameState.lastSessionDate = today;
		}

		if (gameState.lastLpDate !== today) {
			gameState.lpEarnedToday = 0;
			gameState.lastLpDate = today;
		}

		await refreshCardsDue();

		// Production only. Dev Vite on :5173 must not be pinned to a cache-first
		// shell (old `/` with “You’re here.” and no mastery bars).
		if ('serviceWorker' in navigator) {
			if (import.meta.env.DEV) {
				void navigator.serviceWorker.getRegistrations().then(
					(regs) => {
						for (const reg of regs) {
							void reg.unregister().catch(() => {
								/* inactive worker during HMR */
							});
						}
					},
					() => {
						/* no controller */
					}
				);
			} else {
				navigator.serviceWorker.register('/service-worker.js').catch((err) => {
					console.warn('[dutchina] Service worker registration failed:', err);
				});
			}
		}

		if (import.meta.env.DEV) {
			// Expose applyLpEvent on window for console testing (dev only -- applyEvent
			// writes LP directly and getState returns live mutable state; never ship it).
			// Acceptance criterion 7: calling this from the console should work.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).__dutchina = {
				applyEvent: (event: LpEvent) => handleLpEvent(event),
				getState: () => gameState
			};
		}

		if (import.meta.env.DEV) {
			// Expose steward host on window for console testing (dev only -- this bypasses
			// all executor validation, caps, and audit logging; never ship it to production).
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).__kuromiSteward = stewardHost;
		}
	});

	// ============================================================
	// VIEW TRANSITIONS
	// Smooth fade between pages when navigating tabs.
	// Falls back to instant swap on unsupported browsers.
	// ============================================================
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		}).catch(() => {});
	});

	// ============================================================
	// LP EVENT HANDLER
	// Called by game modules (Match, Cards, Boss) when an LP-earning
	// event occurs. Updates state, fires SFX, shows toasts.
	// After applying LP: updates lp_earned_today missions and
	// checks achievements.
	// ============================================================
	let _insideLpEvent = false; // re-entry guard for mission_complete chains
	let cardsDue = $state(0);

	async function refreshCardsDue(): Promise<void> {
		try {
			cardsDue = dueTraps(gameState.readingFork, getTodayDate()).length;
		} catch {
			cardsDue = 0;
		}
	}

	// ============================================================
	// DATE HELPER
	// ============================================================
	function getTodayISO(): string {
		return new Date().toISOString().slice(0, 10);
	}

	function handleLpEvent(event: LpEvent): LpResult {
		const result = applyLpEvent(
			{
				rank: gameState.rank,
				tier: gameState.tier,
				lp: gameState.lp,
				totalLp: gameState.totalLp,
				bossCleared: true
			},
			event
		);

		// Apply result to state (triggers reactivity and debounced save)
		gameState.rank = result.rank;
		gameState.tier = result.tier;
		gameState.lp = result.lp;
		gameState.totalLp = result.totalLp;

		// Set delta tracking for child component floaters
		lastLpDelta = result.delta;
		lpEventCounter++;

		// Accumulate positive LP earned today
		if (result.delta > 0) {
			const today = getTodayISO();
			if (gameState.lastLpDate !== today) {
				gameState.lpEarnedToday = 0;
				gameState.lastLpDate = today;
			}
			gameState.lpEarnedToday += result.delta;
		}

		// Fire SFX
		for (const sfxEvent of result.sfxEvents) {
			playSfx(sfxEvent);
		}

		// Internal rank/tier may still move. Do not toast them — gates are the story.
		if (result.rankChanged) {
			startLoop('fireworks');
		} else if (result.tierChanged) {
			triggerEffect('confetti');
		}

		if (event.type === 'card_rated') {
			applyMasteryCheck();
		}

		// Update lp_earned_today missions (only for positive LP, skip re-entry from mission_complete)
		if (result.delta > 0 && !_insideLpEvent) {
			_insideLpEvent = true;
			const mResult = updateMissionProgress(
				gameState.missions.daily,
				'lp_earned_today',
				result.delta
			);
			gameState.missions.daily = mResult.missions;
			for (const mId of mResult.newlyCompleted) {
				const mDef = MISSION_MAP[mId];
				addToast(`MISSION: ${mDef?.description ?? mId}`, 'var(--color-peach-deep)');
				playSfx('mission_complete');
				triggerEffect('miniConfetti');
				handleLpEvent({ type: 'mission_complete' });
			}
			_insideLpEvent = false;
		}

		// Check achievements after state is fully updated
		runAchievementCheck();

		return result;
	}

	function applyMasteryCheck(): void {
		const next = maybeAdvanceGates(gameState.gates, gameState.cardReviews);
		gameState.gates = next.gates;
		if (next.unlocked) {
			addToast(unlockToastMessage(next.unlocked), 'var(--color-teal-deep)');
		}
	}

	// ============================================================
	// MISSION PROGRESS HANDLER
	// Called by game modules to report mission-relevant actions.
	// Handles completion, LP award, and achievement check.
	// ============================================================
	function handleMissionUpdate(source: MissionProgressSource, value: number): void {
		const mResult = updateMissionProgress(gameState.missions.daily, source, value);
		gameState.missions.daily = mResult.missions;

		for (const mId of mResult.newlyCompleted) {
			const mDef = MISSION_MAP[mId];
			addToast(`MISSION: ${mDef?.description ?? mId}`, 'var(--color-peach-deep)');
			playSfx('mission_complete');
			triggerEffect('miniConfetti');
			handleLpEvent({ type: 'mission_complete' });
		}

		// Achievement check after mission state changes
		runAchievementCheck();
	}

	// ============================================================
	// ACHIEVEMENT CHECK
	// Runs after any state change. Idempotent: already-unlocked
	// achievements are skipped.
	// ============================================================
	function runAchievementCheck(): void {
		const newlyUnlocked = checkAchievements(gameState);
		if (newlyUnlocked.length === 0) return;

		gameState.achievements = applyAchievementUnlocks(gameState.achievements, newlyUnlocked);

		for (const id of newlyUnlocked) {
			const def = ACHIEVEMENT_MAP[id];
			if (def?.learnerHidden) continue;
			addToast(`UNLOCKED: ${def?.title ?? id}`, 'var(--color-accent)');
		}

		// Sparkle effect for any achievement unlock
		triggerEffect('sparkles');
	}

	function toggleMute(): void {
		gameState.audio.sfxMuted = !gameState.audio.sfxMuted;
		setSfxMuted(gameState.audio.sfxMuted);
	}

	// ============================================================
	// LP EVENT TRACKING
	// lastLpDelta and lpEventCounter let child components (RankCard,
	// RankStrip) react to LP events and show floater animations.
	// ============================================================
	let lastLpDelta = $state(0);
	let lpEventCounter = $state(0);

	// ============================================================
	// STEWARD HOST
	// The executor's only route into app state. Plain object literal
	// matching StewardHost; mutations go through existing gameState.
	// ============================================================
	const stewardHost: StewardHost = {
		getState(): CurrentState {
			return gameState;
		},
		applyLpEvent(event: LpEvent): LpResult {
			return handleLpEvent(event);
		},
		patchConfig(patch: Partial<AppConfig>): void {
			for (const key of CONFIG_TOP_LEVEL_KEYS) {
				if (Object.prototype.hasOwnProperty.call(patch, key)) {
					// Presence (including explicit undefined) replaces the subtree —
					// no deep-merge; that is the documented StewardHost contract.
					(gameState.appConfig as unknown as Record<string, unknown>)[key] = patch[key];
				}
			}
		},
		setStreak(practiceDays: number, lastSessionDate: string | null): void {
			gameState.practiceDays = practiceDays;
			gameState.lastSessionDate = lastSessionDate;
		},
		appendAdjustment(entry: AdjustmentEntry): void {
			gameState.adjustments.push(entry);
			if (gameState.adjustments.length > 50) {
				gameState.adjustments = gameState.adjustments.slice(gameState.adjustments.length - 50);
			}
		},
		recordAward(award: StewardAward): void {
			gameState.steward.awards.push(award);
		},
		markForgivenWeek(week: string): void {
			gameState.steward.lastForgivenWeek = week;
		},
		nowISO(): string {
			return new Date().toISOString();
		},
		todayISO(): string {
			return getTodayISO();
		},
		newId(): string {
			if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
				return crypto.randomUUID();
			}
			return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
		},
		lpEventCounter(): number {
			return lpEventCounter;
		},
		markAdjustmentUndone(id: string): void {
			const entry = gameState.adjustments.find((a) => a.id === id);
			if (entry) {
				entry.undone = true;
			}
		},
		restoreLpSnapshot(snapshot: { rank: number; tier: number; lp: number; totalLp: number }): void {
			const undoneDelta = gameState.totalLp - snapshot.totalLp;
			gameState.rank = snapshot.rank;
			gameState.tier = snapshot.tier;
			gameState.lp = snapshot.lp;
			gameState.totalLp = snapshot.totalLp;
			if (undoneDelta > 0) {
				gameState.lpEarnedToday = Math.max(0, gameState.lpEarnedToday - undoneDelta);
			}
		},
		upsertPage(page: KuromiPage): void {
			gameState.pages = upsertPageIn(gameState.pages, page);
		},
		removePage(id: string): void {
			gameState.pages = removePageFrom(gameState.pages, id);
		}
	};

	// ============================================================
	// RESET PROGRESS
	// Sets a flag and reloads. The pre-init check at the top of
	// this script handles the actual cleanup on the next load,
	// before any reactive state exists.
	// ============================================================
	function resetProgress(): void {
		if (!confirm('This will permanently delete ALL progress. Are you sure?')) return;
		localStorage.setItem(`dutchina_reset_${activeProfile}`, 'true');
		// Marker for onMount: delete server app_state rows before startSync pull
		// so reset is not silently undone by merging pre-reset remote rows.
		localStorage.setItem(`dutchina_reset_remote_${activeProfile}`, 'true');
		window.location.reload();
	}

	// ============================================================
	// GAME CONTEXT
	// Provides reactive state and event handlers to child components.
	// ============================================================
	setGameContext({
		get state() {
			return gameState;
		},
		get lastLpDelta() {
			return lastLpDelta;
		},
		get lpEventCounter() {
			return lpEventCounter;
		},
		get activeProfile() {
			return activeProfile;
		},
		get syncStatus() {
			return syncStatus;
		},
		get cardsDue() {
			return cardsDue;
		},
		applyLpEvent: handleLpEvent,
		toggleMute,
		updateMissions: handleMissionUpdate,
		resetProgress,
		refreshCardsDue,
		steward: stewardHost
	});

	// ============================================================
	// TAB CONFIG
	// ============================================================
	const tabs = [
		{ href: '/', label: 'Home', icon: 'house' },
		{ href: '/eval', label: 'Daily text', icon: 'list-check' },
		{ href: '/cards', label: 'Debrief', icon: 'rectangle-history' },
		{ href: '/mock', label: 'Mock', icon: 'bullseye' },
		{ href: '/playbook', label: 'Playbook', icon: 'book-sparkles' }
	] as const;

	const secondaryLinks: {
		href: import('$app/types').Pathname;
		label: string;
		character?: boolean;
	}[] = [
		{ href: '/lezen', label: 'Texts' },
		{ href: '/grammar', label: 'Patterns' },
		{ href: '/kuromi/shelf', label: 'Kuromi', character: true }
	];

	function isActive(href: string, pathname: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	}

	const GATE_PILL: Record<(typeof GATE_IDENTITY)[1], string> = {
		rose: '--color-rose-deep',
		lavender: '--color-lavender-deep',
		peach: '--color-peach-deep',
		teal: '--color-teal-deep'
	};
	let currentRankColorVar = $derived(GATE_PILL[GATE_IDENTITY[currentGateFromState(gameState)]]);
</script>

<Toast />
<ParticleOverlay />

<div class="app-shell">
	<div class="frame grain">
		<aside class="rail">
			<RailNav {tabs} {secondaryLinks} pathname={$page.url.pathname} {isActive} />
			<KuromiResident onSummon={openKuromi} />
		</aside>

		<!-- MAIN CONTENT -->
		<main class="content" aria-hidden={kuromiOpen ? 'true' : undefined}>
			{@render children()}
		</main>
	</div>

	<!-- BOTTOM TAB BAR -->
	<nav
		class="tab-bar"
		style="--pill-color: var({currentRankColorVar})"
		aria-hidden={kuromiOpen ? 'true' : undefined}
	>
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href, $page.url.pathname)}
			<a
				href={resolve(tab.href)}
				class="tab-item"
				class:active
				onclick={() => {
					if (!active) playSfx('tab_switch');
				}}
			>
				<div class="tab-icon-wrap">
					<Icon name={tab.icon} size={active ? 24 : 22} secondaryOpacity={0.35} />
					{#if tab.href === '/cards' && cardsDue > 0}
						<span class="tab-badge">{cardsDue}</span>
					{/if}
				</div>
				<span class="tab-label">{tab.label}</span>
			</a>
		{/each}
	</nav>
</div>

<SummonButton bind:buttonEl={summonButtonEl} onSummon={openKuromi} />
<ChatSheet open={kuromiOpen} onClose={closeKuromi} />

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 680px;
		margin: 0 auto;
	}

	/* Mobile: inert wrapper so children stay direct flex participants of .app-shell */
	.frame {
		display: contents;
	}

	.rail {
		display: none;
	}

	.content {
		flex: 1;
		min-width: 0;
		/* The reading desk keys off this card, not the browser window. */
		container-type: inline-size;
		container-name: app-card;
		/* Bottom reservation must clear the Kuromi summon FAB, the tallest
		   fixed element above the safe area: FAB sits at
		   safe-area + 100px and is 56px tall, so its top edge is at
		   safe-area + 156px. Add a 16px gap so the last scrollable control
		   never sits flush against it: safe-area + 172px. (Previously
		   5.5rem/93.5px, sized only to clear the nav bar, which the FAB
		   now sits well above.) */
		padding: 1.25rem 1rem calc(172px + env(safe-area-inset-bottom, 0px));
		overflow-y: auto;
		view-transition-name: main-content;
	}

	/* BOTTOM TAB BAR — floating white pill */
	.tab-bar {
		position: fixed;
		bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 24px);
		max-width: 640px;
		display: flex;
		background: var(--color-s1);
		border: 3px solid var(--color-kuromi);
		border-radius: 999px;
		box-shadow: var(--shadow-offset-pill);
		z-index: 100;
		view-transition-name: tab-bar;
		padding: 4px 6px;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 6px 4px 10px;
		color: var(--color-kuromi-mid);
		text-decoration: none;
		transition:
			color 0.2s ease,
			transform 0.15s ease;
		-webkit-tap-highlight-color: transparent;
		position: relative;
		min-height: 58px;
		z-index: 0;
	}

	.tab-item:hover {
		color: var(--color-kuromi);
	}

	.tab-item:active {
		transform: scale(var(--press-scale));
	}

	.tab-item:focus-visible {
		outline: 2px solid var(--color-lavender-deep);
		outline-offset: -4px;
		border-radius: 16px;
	}

	/* Active fill covers icon + label as one shape.
	   Primary: pink + kuromi border. Secondary: rank-color ring via --pill-color. */
	.tab-item.active {
		color: var(--color-kuromi);
	}

	.tab-item.active::before {
		content: '';
		position: absolute;
		inset: 3px 3px;
		border-radius: 20px;
		background: var(--color-rose);
		border: 2px solid var(--color-kuromi);
		box-shadow:
			var(--sticker-shadow),
			0 0 0 3px color-mix(in srgb, var(--pill-color, var(--color-rose)) 40%, transparent);
		z-index: -1;
		transition:
			opacity 0.2s ease,
			transform 0.2s cubic-bezier(0.34, 1.4, 0.64, 1);
	}

	.tab-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1;
		position: relative;
		z-index: 1;
	}

	/* Reduced motion: drop tab scale and view-transition animations */
	@media (prefers-reduced-motion: reduce) {
		.tab-item,
		.tab-item:active {
			transform: none;
			transition: color 0.1s ease;
		}
	}

	.tab-icon-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.tab-badge {
		position: absolute;
		top: -6px;
		right: -10px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: 8px;
		background: var(--color-rose);
		color: var(--color-cream);
		border: 1.5px solid var(--color-kuromi);
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		line-height: 16px;
		text-align: center;
	}

	/* ============================================================
	   TABLET / NARROW DESKTOP (>= 768px): framed handbook, no rail.
	   Floating pill tab bar + FAB remain visible.
	   ============================================================ */
	@media (min-width: 768px) {
		.app-shell {
			max-width: none;
			min-height: 100vh;
			padding: 0 16px;
		}

		.frame {
			display: flex;
			flex-direction: column;
			position: relative;
			border: 3px solid var(--color-ink);
			border-radius: 26px;
			background: #ffffff;
			box-shadow: var(--shadow-offset-frame);
			max-width: 1180px;
			width: 100%;
			margin: 28px auto;
			overflow: hidden;
			height: calc(100vh - 56px);
		}

		.rail {
			display: none;
		}

		.content {
			height: 100%;
			min-height: 0;
			overflow-y: auto;
			padding: 2rem 2.5rem calc(172px + env(safe-area-inset-bottom, 0px));
			scrollbar-gutter: stable;
		}
	}

	/* ============================================================
	   DESKTOP (>= 1080px): frame + left rail. Tab bar and FAB hide.
	   ============================================================ */
	@media (min-width: 1080px) {
		.frame {
			display: grid;
			grid-template-columns: 180px 1fr;
		}

		.rail {
			display: flex;
			flex-direction: column;
			height: 100%;
			min-height: 0;
			overflow-y: auto;
			gap: 4px;
			padding: 24px 14px;
			border-right: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
		}

		.content {
			padding: 2.5rem 3rem 2.5rem 2.5rem;
		}

		.tab-bar {
			display: none;
		}

		/* Hide floating SummonButton at desktop rail tier (CSS-only; component unedited) */
		:global(.summon-btn.summon-btn) {
			display: none;
		}
	}
</style>
