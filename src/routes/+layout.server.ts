import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    return { 
        session: locals.session,
        user: locals.user,
        
        appSettings: locals.appSettings,
        userSettings: locals.userSettings
    }
    
}) satisfies LayoutServerLoad;