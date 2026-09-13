import { describe, it, expect } from 'vitest';
import { weekLabel, woordparenLabel, kaartenLabel, takenOpenLabel, dutchCount } from './pluralize';

describe('weekLabel', () => {
	it('uses plural for 0', () => {
		expect(weekLabel(0)).toBe('0 weeks');
	});
	it('uses singular for 1', () => {
		expect(weekLabel(1)).toBe('1 week');
	});
	it('uses plural for 2', () => {
		expect(weekLabel(2)).toBe('2 weeks');
	});
	it('uses plural for 11 (regular English plural)', () => {
		expect(weekLabel(11)).toBe('11 weeks');
	});
});

describe('woordparenLabel', () => {
	it('singular at 1, plural otherwise', () => {
		expect(woordparenLabel(0)).toBe('0 word pairs');
		expect(woordparenLabel(1)).toBe('1 word pair');
		expect(woordparenLabel(2)).toBe('2 word pairs');
	});
});

describe('kaartenLabel', () => {
	it('singular at 1, plural otherwise', () => {
		expect(kaartenLabel(0)).toBe('0 cards');
		expect(kaartenLabel(1)).toBe('1 card');
		expect(kaartenLabel(3)).toBe('3 cards');
	});
});

describe('takenOpenLabel', () => {
	it('singular at 1, plural otherwise', () => {
		expect(takenOpenLabel(0)).toBe('0 tasks open');
		expect(takenOpenLabel(1)).toBe('1 task open');
		expect(takenOpenLabel(5)).toBe('5 tasks open');
	});
});

describe('dutchCount', () => {
	it('picks singular or plural by count', () => {
		expect(dutchCount(1, 'a', 'b')).toBe('1 a');
		expect(dutchCount(0, 'a', 'b')).toBe('0 b');
	});
});
