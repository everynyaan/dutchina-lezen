<script lang="ts">
	import { setGameContext, type GameContext } from '$lib/state/context';
	import { createDefaultState } from '$lib/state/defaults';
	import type { CurrentState } from '$lib/state/schema';
	import HomeShelf from './HomeShelf.svelte';

	let { state = createDefaultState() }: { state?: CurrentState } = $props();

	setGameContext({
		get state() {
			return state;
		},
		lastLpDelta: 0,
		lpEventCounter: 0,
		activeProfile: 'domi',
		syncStatus: 'disabled',
		cardsDue: 0,
		applyLpEvent: () => {
			throw new Error('unused in home shelf host');
		},
		toggleMute: () => {},
		updateMissions: () => {},
		resetProgress: () => {},
		refreshCardsDue: async () => {},
		steward: {} as GameContext['steward']
	} as GameContext);
</script>

<HomeShelf />
