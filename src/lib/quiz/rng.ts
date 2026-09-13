/** Standard xmur3 string seeder. Returns a function producing successive uint32 seeds. */
export function xmur3(str: string): () => number {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return function () {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		h ^= h >>> 16;
		return h >>> 0;
	};
}

/** Standard mulberry32 PRNG. Returns a function producing floats in [0, 1). */
export function mulberry32(seed: number): () => number {
	return function () {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Convenience: a PRNG seeded from an arbitrary string. */
export function seededRng(seed: string): () => number {
	return mulberry32(xmur3(seed)());
}

/** Deterministic Fisher-Yates. Returns a NEW array; does not mutate the input. */
export function shuffle<T>(items: T[], rng: () => number): T[] {
	const out = items.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const tmp = out[i];
		out[i] = out[j];
		out[j] = tmp;
	}
	return out;
}

/** Deterministic pick of `count` distinct items. Returns fewer if the pool is short. */
export function sample<T>(items: T[], count: number, rng: () => number): T[] {
	if (count <= 0) return [];
	if (items.length <= count) return shuffle(items, rng);
	return shuffle(items, rng).slice(0, count);
}
