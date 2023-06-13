import { Collections, type AssembliesResponse } from "$lib/DBTypes";
import type { PageServerLoad, Actions } from "./$types";

export const load = (async ({ locals, params }) => {

    const assembly = await locals.pb.collection(Collections.Assemblies).getOne<AssembliesResponse>(params.id);

    return {
        assembly: structuredClone(assembly),
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    editAssembly: async ({ locals, request, params }) => {
        try
        {
            const form = await request.formData();

            form.set("favorite", String(form.has("favorite")));

            if((form.get("thumbnail") as (Blob | null))?.size === 0)
                form.delete("thumbnail");

            await locals.pb.collection(Collections.Assemblies).update(params.id, form);

            return { editAssembly: { success: "Successfully updated assembly" }};
        }
        catch(ex)
        {
            return { editAssembly: { error: ex.toJSON() }};
        }
    } 
}