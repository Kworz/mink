import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (({ locals }) => {

    if(locals.appSettings.appConfigured && import.meta.env.PROD)
        throw redirect(302, "/app");

}) satisfies LayoutServerLoad;