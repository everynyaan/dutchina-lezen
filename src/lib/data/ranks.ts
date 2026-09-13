// ============================================================
// DUTCHINA RANK DEFINITIONS
// 8 ranks (0-7), ending at B1. Names, icons, colors.
//
// Icons are lucide-svelte component names. The component that
// renders the icon imports from lucide-svelte dynamically or
// uses a lookup map.
//
// Colors reference CSS custom property names (without the var()).
// ============================================================

export interface RankDef {
	rank: number;
	name: string;
	/** lucide-svelte icon component name */
	icon: string;
	/** CSS custom property name for the rank's accent color */
	colorVar: string;
	/** Hex color value for contexts where CSS vars are unavailable */
	colorHex: string;
}

export const RANKS: RankDef[] = [
	{ rank: 0, name: 'Iron', icon: 'Wrench', colorVar: '--color-muted', colorHex: '#8B9BC0' },
	{ rank: 1, name: 'Bronze', icon: 'Shield', colorVar: '--color-orange', colorHex: '#FF8C42' },
	{ rank: 2, name: 'Silver', icon: 'Award', colorVar: '--color-text', colorHex: '#F0EDE4' },
	{ rank: 3, name: 'Gold', icon: 'Trophy', colorVar: '--color-peach-deep', colorHex: '#FFD600' },
	{
		rank: 4,
		name: 'Platinum',
		icon: 'Crown',
		colorVar: '--color-lavender-deep',
		colorHex: '#4F7CFF'
	},
	{ rank: 5, name: 'Emerald', icon: 'Gem', colorVar: '--color-green', colorHex: '#00E676' },
	{ rank: 6, name: 'Diamond', icon: 'Diamond', colorVar: '--color-rose', colorHex: '#FF5A2A' },
	{ rank: 7, name: 'Master', icon: 'Sparkles', colorVar: '--color-purple', colorHex: '#B9A7FF' }
];

export function getRank(rank: number): RankDef {
	return RANKS[Math.max(0, Math.min(rank, RANKS.length - 1))];
}
