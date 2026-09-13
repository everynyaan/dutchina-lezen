import { redirect } from '@sveltejs/kit';
import { isRetiredPath } from '$lib/reading/retired';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (isRetiredPath(event.url.pathname)) {
		redirect(308, '/');
	}
	return resolve(event);
};
