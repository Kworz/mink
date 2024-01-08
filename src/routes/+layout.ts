import type { LayoutLoad } from "./$types";

export const load = (async ({ data }) => {

    return { 
        user: data.user
    }

}) satisfies LayoutLoad;