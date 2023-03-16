import { type BuildResponse, Collections } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const builds = await locals.pb.collection(Collections.Build).getFullList<BuildResponse>();

    return {
        builds: structuredClone(builds)
    }

}) satisfies PageServerLoad;