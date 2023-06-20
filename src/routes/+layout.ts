import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { getPocketbase } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const load = (async ({ data }) => {

    const pbInstance = browser ? await getPocketbase(data.pbCookie) : await getPocketbase(data.pbCookie, `http://${env.PUBLIC_POCKETBASE_ADDRESS}/`)

    return { 
        user: data.user,
        pb: pbInstance,
    }

}) satisfies LayoutLoad;