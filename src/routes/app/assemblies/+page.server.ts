import { type AssembliesResponse, Collections } from "$lib/DBTypes";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ClientResponseError } from "pocketbase";

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";

    const assemblies = await locals.pb.collection(Collections.Assemblies).getFullList<AssembliesResponse>({ sort: '-favorite,name', filter });

    return {
        assemblies: structuredClone(assemblies)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createAssembly: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            const assembly = await locals.pb.collection(Collections.Assemblies).create(form);

            return redirect(303, `/app/assemblies/${assembly.id}`);
        }
        catch(ex)
        {
            return { createAssembly: { error: (ex instanceof ClientResponseError ? ex.message : ex) }};
        }
    }
}