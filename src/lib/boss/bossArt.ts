// ============================================================
// DUTCHINA BOSS ART CONFIG
// Maps each rank to pixel art sprite paths (main/damage/victory),
// per-boss arena backgrounds, cover art, and soundtracks.
// ============================================================

export interface BossArtConfig {
	name: string;
	mainImage: string;
	damageImage: string;
	victoryImage: string;
	/** Cover art for catalogue card. Falls back to mainImage if null. */
	coverImage: string | null;
	/** Per-boss arena background image */
	arena: string;
	/** Per-boss soundtrack path */
	soundtrack: string;
}

const BOSS_ART: Record<number, BossArtConfig> = {
	0: {
		name: 'Cat Gogh',
		mainImage: '/bosses/catgogh-main.png',
		damageImage: '/bosses/catgogh-damage.png',
		victoryImage: '/bosses/catgogh-victory.png',
		coverImage: '/bosses/cat-gogh.jpg',
		arena: '/bosses/cat-gogh-arena.png',
		soundtrack: '/bosses/catgogh-ost.mp3'
	},
	1: {
		name: 'Dutchina Cattatina',
		mainImage: '/bosses/cattatina-main.png',
		damageImage: '/bosses/cattatina-damage.png',
		victoryImage: '/bosses/cattatina-victory.png',
		coverImage: '/bosses/dutchina-cattatina.jpg',
		arena: '/bosses/dutchina-arena.jpg',
		soundtrack: '/bosses/cattatina-ost.mp3'
	},
	2: {
		name: 'Hell Kitty',
		mainImage: '/bosses/hellkitty-main.png',
		damageImage: '/bosses/hellkitty-damage.png',
		victoryImage: '/bosses/hellkitty-victory.png',
		coverImage: '/bosses/hell-kitty.jpg',
		arena: '/bosses/hell-kitty-arena.jpg',
		soundtrack: '/bosses/hellkitty-ost.mp3'
	},
	3: {
		name: 'Huggie Bear',
		mainImage: '/bosses/huggie-main.png',
		damageImage: '/bosses/huggie-damage.png',
		victoryImage: '/bosses/huggie-victory.png',
		coverImage: '/bosses/huggie-bear.jpg',
		arena: '/bosses/huggie-arena.jpg',
		soundtrack: '/bosses/huggie-ost.mp3'
	},
	4: {
		name: 'Lalo Salamanca',
		mainImage: '/bosses/lalo-salamanca-main.png',
		damageImage: '/bosses/lalo-salamanca-damage.png',
		victoryImage: '/bosses/lalo-salamanca-victory.png',
		coverImage: '/bosses/lalo-salamanca.jpg',
		arena: '/bosses/lalo-arena.jpg',
		soundtrack: '/bosses/lalo-ost.mp3'
	},
	5: {
		name: 'John Wheelchair',
		mainImage: '/bosses/wheelchair-main.png',
		damageImage: '/bosses/wheelchair-damage.png',
		victoryImage: '/bosses/wheelchair-victory.png',
		coverImage: '/bosses/john-wheelchair.jpg',
		arena: '/bosses/wheelchair-arena.jpg',
		soundtrack: '/bosses/wheelchair-ost.mp3'
	},
	6: {
		name: 'Papier Raccoon',
		mainImage: '/bosses/raccoon-main.png',
		damageImage: '/bosses/raccoon-damage.png',
		victoryImage: '/bosses/raccoon-victory.png',
		coverImage: '/bosses/papier-raccoon.jpg',
		arena: '/bosses/papier-arena.jpg',
		soundtrack: '/bosses/raccoon-ost.mp3'
	},
	7: {
		name: 'Kitten De Oranje',
		mainImage: '/bosses/kitten-de-oranje-main.png',
		damageImage: '/bosses/kitten-de-oranje-damage.png',
		victoryImage: '/bosses/kitten-de-oranje-victory.png',
		coverImage: '/bosses/kitten-de-oranje.jpg',
		arena: '/bosses/kitten-de-oranje-arena.jpg',
		soundtrack: '/bosses/kitten-ost.mp3'
	}
};

// Fallback config for unknown ranks (should never happen with 0-7)
const FALLBACK: BossArtConfig = {
	name: 'Unknown Boss',
	mainImage: '/bosses/catgogh-main.png',
	damageImage: '/bosses/catgogh-damage.png',
	victoryImage: '/bosses/catgogh-victory.png',
	coverImage: null,
	arena: '/bosses/cat-gogh-arena.png',
	soundtrack: '/bosses/catgogh-ost.mp3'
};

export function getBossArt(rank: number): BossArtConfig {
	return BOSS_ART[rank] ?? FALLBACK;
}

// Player (Domi) sprites, same for all ranks
export const PLAYER_ART = {
	main: '/bosses/domi-main.png',
	damage: '/bosses/domi-damage.png',
	victory: '/bosses/domi-victory.png'
} as const;
