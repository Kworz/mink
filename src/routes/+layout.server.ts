import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    return { 
        user: locals.user,
    }
    
}) satisfies LayoutServerLoad;