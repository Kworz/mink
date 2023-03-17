import { browser } from "$app/environment";
import { getPocketbase } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const load = (async () => {

    return {
        pb: (browser) ? await getPocketbase(document.cookie) : undefined
    }

}) satisfies LayoutLoad;