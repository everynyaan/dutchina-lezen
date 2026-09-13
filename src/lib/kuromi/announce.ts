import type { KuromiPage } from '$lib/state/schema';
import type { KuromiToolCall, StewardToolResult } from '$lib/kuromi/types';
import { PAGE_TOOL_NAMES } from '$lib/kuromi/executor';

export interface PageAnnouncement {
	text: string;
	href: import('$app/types').Pathname;
	pageTitle: string;
}

const PAGE_TOOL_SET: ReadonlySet<string> = new Set(PAGE_TOOL_NAMES);

function verbFor(toolName: string): string {
	if (toolName === 'create_page') return 'Added';
	if (toolName === 'archive_page') return 'Archived';
	return 'Updated';
}

export function buildPageAnnouncement(
	result: StewardToolResult,
	call: KuromiToolCall,
	pages: KuromiPage[]
): PageAnnouncement | null {
	if (!PAGE_TOOL_SET.has(call.name)) return null;
	if (result.outcome === 'rejected') return null;

	let id: string | undefined;
	try {
		const parsed: unknown = JSON.parse(call.arguments);
		if (
			parsed !== null &&
			typeof parsed === 'object' &&
			typeof (parsed as { id?: unknown }).id === 'string'
		) {
			id = (parsed as { id: string }).id;
		}
	} catch {
		return null;
	}
	if (!id) return null;

	const page = pages.find((p) => p.id === id);
	if (!page) return null;

	return {
		text: verbFor(call.name) + ' "' + page.title + '".',
		href: ('/kuromi/shelf/' + id) as import('$app/types').Pathname,
		pageTitle: page.title
	};
}
