import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, configDefaults } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		// Agent worktrees under .claude/worktrees/ are nested checkouts of this
		// same repo, so vitest collects THEIR test files too and the suite count
		// becomes a function of how many lanes happen to be live (15 worktrees
		// once turned 403 tests into 5650, all "passing"). Worse, worktree copies
		// can fail to COLLECT (TSCONFIG_ERROR), printing failed suites while every
		// real test passes. .gitignore does not help -- vitest does not read it.
		exclude: [...configDefaults.exclude, '**/.claude/worktrees/**']
	}
});
