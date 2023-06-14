import { type AssembliesResponse, Collections } from "$lib/DBTypes";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ClientResponseError } from "pocketbase";

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";

    const assemblies = await locals.pb.collection(Collections.Assemblies).getFullList<AssembliesResponse>({ sort: '-favorite,name', filter });
    const assembliesRelations = await locals.pb.collection(Collections.AssembliesRelations).getFullList();

    return {
        assemblies: structuredClone(assemblies),
        assembliesRelations: structuredClone(assembliesRelations),
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createAssembly: async ({ locals, request }) => {
        const form = await request.formData();
        
        let createAssemblyID = "";

        try
        {
           const {id} = await locals.pb.collection(Collections.Assemblies).create(form);
           createAssemblyID = id;
        }
        catch(ex)
        {
            return { createAssembly: { error: (ex instanceof ClientResponseError ? ex.message : ex) }};
        }

        throw redirect(303, `/app/scm/assemblies/${createAssemblyID}`);
    }
}