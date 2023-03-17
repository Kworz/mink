import { type AssembliesResponse, Collections } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const assemblies = await locals.pb.collection(Collections.Assemblies).getFullList<AssembliesResponse>();

    return {
        assemblies: structuredClone(assemblies)
    }

}) satisfies PageServerLoad;