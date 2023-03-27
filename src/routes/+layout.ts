import { browser } from "$app/environment";
import { getPocketbase } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const load = (async ({ data, url }) => {

    const pbInstance = browser ? await getPocketbase(data.pbCookie) : await getPocketbase(data.pbCookie, `http://${url.hostname}:8090/`)

    return { 
        user: data.user,
        pb: pbInstance,
    }

}) satisfies LayoutLoad;