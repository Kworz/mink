import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    const logged = locals.user !== undefined;
    throw logged ? redirect(303, "/app/") : redirect(303, "/auth/login");

}) satisfies PageServerLoad;