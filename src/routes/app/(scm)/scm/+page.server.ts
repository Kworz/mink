import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (() => {

    throw redirect(302, "/app/scm/articles");

}) satisfies PageServerLoad;