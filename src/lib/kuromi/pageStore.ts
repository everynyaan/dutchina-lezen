import type { KuromiPage } from '$lib/state/schema';

/** Missing / non-boolean archived counts as active (fail toward active). */
function isActive(page: KuromiPage): boolean {
	return (page as { archived?: unknown }).archived !== true;
}

export function upsertPageIn(pages: KuromiPage[], page: KuromiPage): KuromiPage[] {
	const idx = pages.findIndex((p) => p.id === page.id);
	if (idx === -1) return [...pages, page];
	return pages.map((p, i) => (i === idx ? page : p));
}

export function removePageFrom(pages: KuromiPage[], id: string): KuromiPage[] {
	return pages.filter((p) => p.id !== id);
}

export function setArchivedIn(
	pages: KuromiPage[],
	id: string,
	archived: boolean,
	nowISO: string
): KuromiPage[] {
	return pages.map((p) => (p.id === id ? { ...p, archived, updatedAt: nowISO } : p));
}

export function labelsInUse(pages: KuromiPage[]): string[] {
	const seen = new Set<string>();
	for (const page of pages) {
		if (!isActive(page)) continue;
		for (const label of page.labels) {
			seen.add(label);
		}
	}
	return [...seen].sort((a, b) => a.localeCompare(b));
}

export function filterPages(
	pages: KuromiPage[],
	opts: { labels: string[]; query: string; archived: boolean }
): KuromiPage[] {
	const query = opts.query.trim().toLowerCase();

	return pages.filter((page) => {
		if (opts.archived) {
			if (page.archived !== true) return false;
		} else {
			if (!isActive(page)) return false;
		}

		if (opts.labels.length > 0) {
			for (const label of opts.labels) {
				if (!page.labels.includes(label)) return false;
			}
		}

		if (query) {
			const haystack = [page.title, page.quip, ...page.labels].join(' ').toLowerCase();
			if (!haystack.includes(query)) return false;
		}

		return true;
	});
}
