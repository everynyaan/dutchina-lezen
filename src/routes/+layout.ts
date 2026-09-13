import { redirect } from '@sveltejs/kit';
import { isRetiredPath } from '$lib/reading/retired';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	if (isRetiredPath(url.pathname)) {
		redirect(308, '/');
	}
};
