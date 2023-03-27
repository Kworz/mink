import { type AssembliesResponse, Collections } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";

    const assemblies = await locals.pb.collection(Collections.Assemblies).getFullList<AssembliesResponse>({ sort: '-favorite,name', filter });

    return {
        assemblies: structuredClone(assemblies)
    }

}) satisfies PageServerLoad;