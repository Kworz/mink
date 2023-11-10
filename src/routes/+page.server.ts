import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    const logged = locals.session !== null;
    throw logged ? redirect(303, "/app/") : redirect(303, "/login");

}) satisfies PageServerLoad;