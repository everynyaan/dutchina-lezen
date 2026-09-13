// ============================================================
// GAME CONTEXT
// Typed context helpers for sharing reactive state between
// the layout and child components in Svelte 5.
//
// The layout calls createGameContext() during component init.
// Child components call getGameContext() to access state and
// the applyLpEvent function.
//
// This module does NOT own the state. It provides typed access
// to the state that lives in +layout.svelte's $state variable.
// ============================================================

import { setContext, getContext } from 'svelte';
import type { CurrentState } from '$lib/state/schema';
import type { LpEvent, LpResult } from '$lib/lp/lp';
import type { MissionProgressSource } from '$lib/missions/MISSIONS';
import type { ProfileId } from '$lib/profiles/profiles';
import type { StewardHost } from '$lib/kuromi/executor';

/** Three-value UI summary of sync health, derived in +layout from the engine phase. */
export type SyncStatus = 'online' | 'offline' | 'disabled';

const CONTEXT_KEY = 'dutchina-game';

export interface GameContext {
	/** Reactive getter for current state. Read this in templates or $derived. */
	readonly state: CurrentState;
	/** The LP delta from the most recent event. Resets to 0 after read. */
	readonly lastLpDelta: number;
	/** Incrementing counter that changes on each LP event (triggers effects). */
	readonly lpEventCounter: number;
	/** Active profile ID. */
	readonly activeProfile: ProfileId;
	/** Current sync status. */
	readonly syncStatus: SyncStatus;
	/** Number of cards available for today (due + new). 0 = no badge. */
	readonly cardsDue: number;
	/** Apply an LP event. Updates state, fires SFX, shows toasts. */
	applyLpEvent: (event: LpEvent) => LpResult;
	/** Toggle SFX mute. */
	toggleMute: () => void;
	/** Report progress on a mission source. Handles completion, LP award, achievement check. */
	updateMissions: (source: MissionProgressSource, value: number) => void;
	/** Nuclear reset: wipes all progress (local, server, IndexedDB) and reloads. */
	resetProgress: () => void;
	/** Refresh the cards due count (call after reviewing cards). */
	refreshCardsDue: () => Promise<void>;
	/** Steward host: the executor's only route into app state. */
	readonly steward: StewardHost;
}

export function setGameContext(ctx: GameContext): void {
	setContext(CONTEXT_KEY, ctx);
}

export function getGameContext(): GameContext {
	return getContext<GameContext>(CONTEXT_KEY);
}
