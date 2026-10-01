import { addCoachEntry, notebookOf, withNotebook } from '$lib/reading/notebook';
import { QTYPES, TRAP_KINDS, type QType, type TrapKind } from '$lib/reading/types';
import type { CurrentState } from '$lib/state/schema';
import type { KuromiToolCall, StewardToolResult } from './types';
import { writeCoachNote } from './note';

export const COACH_TOOL_NAMES = ['add_notebook_entry', 'suggest_drill', 'save_coach_note'] as const;

export type CoachToolName = (typeof COACH_TOOL_NAMES)[number];

let pendingDrill: string | null = null;

export function takePendingDrill(): string | null {
	const path = pendingDrill;
	pendingDrill = null;
	return path;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function executeCoachCall(
	call: KuromiToolCall,
	parsed: unknown,
	host?: { getState: () => CurrentState; nowISO: () => string }
): StewardToolResult {
	if (call.name === 'add_notebook_entry') {
		if (!host) {
			return {
				id: call.id,
				outcome: 'rejected',
				detail: 'Notebook is not stored in this build.'
			};
		}
		const kind = isRecord(parsed) ? parsed.kind : '';
		const quote = isRecord(parsed) && typeof parsed.quote === 'string' ? parsed.quote : '';
		const note = isRecord(parsed) && typeof parsed.note === 'string' ? parsed.note : '';
		if (kind !== 'word' && kind !== 'sentence') {
			return { id: call.id, outcome: 'rejected', detail: 'Rejected: kind must be word or sentence.' };
		}
		const state = host.getState();
		const next = addCoachEntry(notebookOf(state.readingFork), {
			kind: kind === 'sentence' ? 'sentence' : 'word',
			quote,
			note,
			now: host.nowISO()
		});
		if (!next) {
			return { id: call.id, outcome: 'rejected', detail: 'Rejected: the note was empty.' };
		}
		state.readingFork = withNotebook(state.readingFork, next);
		return { id: call.id, outcome: 'applied', detail: 'Saved the notebook entry.' };
	}
	if (call.name === 'save_coach_note') {
		const text = isRecord(parsed) ? parsed.text : undefined;
		if (typeof text !== 'string' || text.trim().length === 0) {
			return { id: call.id, outcome: 'rejected', detail: 'Rejected: the note was empty.' };
		}
		writeCoachNote(text);
		return { id: call.id, outcome: 'applied', detail: 'Saved the weekly note.' };
	}
	if (call.name === 'suggest_drill') {
		const qtype = isRecord(parsed) && typeof parsed.qtype === 'string' ? parsed.qtype : '';
		const trap = isRecord(parsed) && typeof parsed.trap === 'string' ? parsed.trap : '';
		const qOk = qtype.length > 0 && (QTYPES as readonly string[]).includes(qtype);
		const tOk = trap.length > 0 && (TRAP_KINDS as readonly string[]).includes(trap);
		if (qOk === tOk) {
			return {
				id: call.id,
				outcome: 'rejected',
				detail: 'Rejected: send a question type or a trap, not both.'
			};
		}
		const path = qOk ? `/cards?qtype=${qtype as QType}` : `/cards?trap=${trap as TrapKind}`;
		pendingDrill = path;
		return { id: call.id, outcome: 'applied', detail: `Drill: ${path}` };
	}
	return { id: call.id, outcome: 'rejected', detail: 'Rejected: unknown coach tool.' };
}
