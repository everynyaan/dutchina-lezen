import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createDefaultState } from '$lib/state/defaults';
import { GATE_COPY, homeGateCards } from '$lib/gates/home';
import GatePath from './GatePath.svelte';
import HomeShelfHost from './homeShelf.host.svelte';

const pageSrc = readFileSync(fileURLToPath(new URL('../../../routes/+page.svelte', import.meta.url)), 'utf8');
const shelfSrc = readFileSync(fileURLToPath(new URL('./HomeShelf.svelte', import.meta.url)), 'utf8');

describe('home page — gates then collection', () => {
	it('SSR GatePath still has the four gate titles', () => {
		const { body } = render(GatePath, { props: { cards: homeGateCards(1) } });
		expect(body).toContain(GATE_COPY[1].title);
		expect(body).toContain(GATE_COPY[2].title);
		expect(body).toContain(GATE_COPY[3].title);
		expect(body).toContain(GATE_COPY[4].title);
		expect(homeGateCards(1)).toHaveLength(4);
	});

	it('home is the reading-fork hub, not the four-gate path', () => {
		expect(pageSrc).toContain("resolve('/eval')");
		expect(pageSrc).toContain("resolve('/mock')");
		expect(pageSrc).toContain('Showed up');
		expect(pageSrc).toContain('feed the cards');
		expect(pageSrc).not.toContain('<GatePath {cards} />');
		expect(pageSrc).not.toContain('<HomeShelf />');
		expect(pageSrc).not.toContain('HomeRail');
		expect(pageSrc).not.toContain('DoelenSheet');
		expect(pageSrc).not.toContain('StatBadges');
	});

	it('HomeShelf always stacks collection then achievements', () => {
		expect(shelfSrc).toContain('CollectionShelf');
		expect(shelfSrc).toContain('AchievementGrid');
		expect(shelfSrc.indexOf('CollectionShelf')).toBeLessThan(shelfSrc.indexOf('AchievementGrid'));
		expect(shelfSrc).not.toMatch(/progressionDisplay === ['"]collection['"]/);
		expect(shelfSrc).not.toMatch(/\{#if progressionDisplay/);
	});

	it('SSR empty shelf shows collection and achievements headings plus kind empty copy', () => {
		const { body } = render(HomeShelfHost, { props: { state: createDefaultState() } });
		expect(body.toLowerCase()).toContain('collection');
		expect(body.toLowerCase()).toContain('achievements');
		expect(body.toLowerCase()).toContain('no achievements yet');
	});

	it('SSR earned shelf still keeps both headings and shows the unlocked title', () => {
		const state = createDefaultState();
		state.achievements = { first_blood: { unlockedAt: '2026-04-10T09:00:00Z' } };
		const { body } = render(HomeShelfHost, { props: { state } });
		expect(body.toLowerCase()).toContain('collection');
		expect(body.toLowerCase()).toContain('achievements');
		expect(body).toContain('Skill-test debut');
	});

	it('collection is four gate stickers, not Iron–Master ranks', () => {
		const collectionSrc = readFileSync(
			fileURLToPath(new URL('./CollectionShelf.svelte', import.meta.url)),
			'utf8'
		);
		expect(collectionSrc).not.toContain('RANKS');
		expect(collectionSrc).not.toMatch(/>ranks</);
		expect(collectionSrc).not.toMatch(/\bIron\b/);
		expect(collectionSrc).toContain('GATE_STICKERS');
		expect(shelfSrc).not.toContain('RankStrip');
		expect(pageSrc).not.toContain('RankStrip');

		const state = createDefaultState();
		state.appConfig.progression.display = 'collection';
		const { body } = render(HomeShelfHost, { props: { state } });
		expect(body).toContain('First words');
		expect(body).toContain('Everyday Dutch');
		expect(body).toContain('Real sentences');
		expect(body).toContain('B1');
		expect(body.toLowerCase()).not.toContain('>ranks<');
		expect(body).not.toMatch(/\bIron\b/);
		expect(body).not.toMatch(/\bBronze\b/);
		expect(body).not.toMatch(/\bMaster\b/);
	});

	it('reserves space so jittered gate stickers do not cover shelf titles', () => {
		const collectionSrc = readFileSync(
			fileURLToPath(new URL('./CollectionShelf.svelte', import.meta.url)),
			'utf8'
		);
		expect(collectionSrc).toContain('padding-block: 16px');
		expect(collectionSrc).toContain('width: fit-content');
		expect(collectionSrc).toMatch(/\.shelf\s*\{[^}]*overflow:\s*visible/);
		expect(collectionSrc).toMatch(/\.sticker-grid\s*\{[^}]*overflow:\s*visible/);
		expect(collectionSrc).not.toContain('transition:slide');
		expect(shelfSrc).toMatch(/\.home-shelf\s*\{[^}]*overflow:\s*visible/);
	});
});
