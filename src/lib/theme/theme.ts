// ============================================================
// DUTCHINA THEME TOGGLE
// Manages light/dark theme switching via data-theme attribute
// on <html>. Persisted in its own localStorage key (not in
// game state) to avoid schema bumps for a UI preference.
//
// Usage:
//   import { getTheme, setTheme, toggleTheme } from '$lib/theme/theme';
//   toggleTheme(); // flips between light and dark
// ============================================================

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'dutchina-theme';

export function getTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'dark') return 'dark';
	return 'light';
}

export function setTheme(theme: Theme): void {
	if (typeof window === 'undefined') return;

	if (theme === 'dark') {
		document.documentElement.setAttribute('data-theme', 'dark');
	} else {
		document.documentElement.removeAttribute('data-theme');
	}

	localStorage.setItem(STORAGE_KEY, theme);

	// Update meta theme-color for mobile browser chrome
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) {
		meta.setAttribute('content', theme === 'dark' ? '#0C1628' : '#F5F2EC');
	}
}

export function toggleTheme(): Theme {
	const current = getTheme();
	const next: Theme = current === 'light' ? 'dark' : 'light';
	setTheme(next);
	return next;
}
