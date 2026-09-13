import { describe, it, expect } from 'vitest';
import {
	GATE1_DRILLS,
	G1_DRILL_EXAM_REGISTER_RE,
	G1_DRILL_PATTERNS,
	drillsForGate,
	isApprovedG1Pattern
} from './drills';

const APPROVED = new Set<string>(G1_DRILL_PATTERNS);

const INTERMEDIATE_TELLS =
	/\b(omdat|terwijl|voordat|gisteren heb|ik heb ge|invers|morgen ga ik|woon jij)\b/i;

describe('Gate 1 drill bank', () => {
	it('has 15–20 items and only approved beginner patterns', () => {
		expect(GATE1_DRILLS.length).toBeGreaterThanOrEqual(15);
		expect(GATE1_DRILLS.length).toBeLessThanOrEqual(20);
		const ids = new Set<string>();
		for (const drill of GATE1_DRILLS) {
			expect(APPROVED.has(drill.pattern), drill.id).toBe(true);
			expect(isApprovedG1Pattern(drill.pattern)).toBe(true);
			expect(drill.options).toContain(drill.answer);
			expect(ids.has(drill.id), `duplicate ${drill.id}`).toBe(false);
			ids.add(drill.id);
		}
		expect(drillsForGate(1)).toHaveLength(GATE1_DRILLS.length);
		expect(drillsForGate(2)).toEqual([]);
		expect(drillsForGate(4)).toEqual([]);
	});

	it('covers de/het, V2 subject-first, and present ik/jij/hij', () => {
		const byPattern = Object.fromEntries(G1_DRILL_PATTERNS.map((p) => [p, 0]));
		for (const drill of GATE1_DRILLS) {
			byPattern[drill.pattern] += 1;
		}
		expect(byPattern.de_het).toBeGreaterThanOrEqual(5);
		expect(byPattern.v2_subject_first).toBeGreaterThanOrEqual(5);
		expect(byPattern.present_ik_jij_hij).toBeGreaterThanOrEqual(5);
	});

	it('has no exam-register and no intermediate frames', () => {
		for (const drill of GATE1_DRILLS) {
			const blob = [drill.prompt, drill.cue, drill.explain, ...drill.options].join(' ');
			expect(G1_DRILL_EXAM_REGISTER_RE.test(blob), drill.id).toBe(false);
			expect(INTERMEDIATE_TELLS.test(blob), drill.id).toBe(false);
		}
	});

	it('V2 items keep the subject first on the keyed answer', () => {
		const v2 = GATE1_DRILLS.filter((d) => d.pattern === 'v2_subject_first');
		expect(v2.length).toBeGreaterThan(0);
		for (const drill of v2) {
			const words = drill.answer.trim().split(/\s+/);
			expect(words.length).toBeGreaterThanOrEqual(3);
			// Subject (Ik/Jij/Hij/Zij/De …) then finite verb — never "Morgen ga ik".
			expect(/^(Ik|Jij|Hij|Zij|De)\b/.test(drill.answer), drill.id).toBe(true);
			expect(/^Morgen\b/.test(drill.answer), drill.id).toBe(false);
		}
	});

	it('present items stay ik/jij/hij — no jij-inversion', () => {
		const present = GATE1_DRILLS.filter((d) => d.pattern === 'present_ik_jij_hij');
		for (const drill of present) {
			expect(/^(Ik|Jij|Hij)\b/.test(drill.cue), drill.id).toBe(true);
			expect(/\b(Woon jij|Maakt hij|Zie jij)\b/.test(drill.cue), drill.id).toBe(false);
		}
	});
});
