import type { LayoutServerLoad } from "./$types";

export const ssr = false;

export const load = (async ({ locals }) => {

    return { 
        user: locals.user
    }
    
}) satisfies LayoutServerLoad;