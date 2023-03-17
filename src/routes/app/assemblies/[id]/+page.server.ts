import { Collections, type AssembliesResponse } from "$lib/DBTypes";
import type { PageServerLoad, Actions } from "./$types";

export const load = (async ({ locals, params }) => {

    const assembly = await locals.pb.collection(Collections.Assemblies).getOne<AssembliesResponse>(params.id);

    return {
        assembly: structuredClone(assembly),

    };

}) satisfies PageServerLoad;