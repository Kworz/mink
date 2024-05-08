import type { LayoutServerLoad } from "./accounting/$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    return { 
        session: locals.session,
        user: locals.user,
        appSettings: locals.appSettings
    }
    
}) satisfies LayoutServerLoad;