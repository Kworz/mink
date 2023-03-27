import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    // get request cookie

    return { 
        user: locals.user,
        pbCookie: locals.pb.authStore.exportToCookie(),
    }
    
}) satisfies LayoutServerLoad;