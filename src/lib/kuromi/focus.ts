import type { CoachPacket, MockDebriefPacket, TextChatPacket } from './coach';

/**
 * What the open chat turn may attach.
 * Text and mock debrief stay until the page clears them.
 * Hint and the Monday flag are consumed on the next send.
 */
let hintItem: CoachPacket | null = null;
let textChat: TextChatPacket | null = null;
let mockDebrief: MockDebriefPacket | null = null;
let mondayBrief = false;

export function setHintItem(packet: CoachPacket | null): void {
	hintItem = packet;
}

export function setTextChat(packet: TextChatPacket | null): void {
	textChat = packet;
}

export function setMockDebrief(packet: MockDebriefPacket | null): void {
	mockDebrief = packet;
}

export function setMondayBrief(on: boolean): void {
	mondayBrief = on;
}

export interface KuromiFocusExtra {
	currentItem?: CoachPacket;
	textChat?: TextChatPacket;
	mockDebrief?: MockDebriefPacket;
	mondayBrief?: true;
}

export function readKuromiFocus(): KuromiFocusExtra {
	const extra: KuromiFocusExtra = {};
	if (hintItem) extra.currentItem = hintItem;
	if (textChat) extra.textChat = textChat;
	if (mockDebrief) extra.mockDebrief = mockDebrief;
	if (mondayBrief) extra.mondayBrief = true;
	hintItem = null;
	mondayBrief = false;
	return extra;
}
