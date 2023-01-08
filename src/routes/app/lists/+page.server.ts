import { error, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Collections, type ListResponse, type NomenclatureRecord, type ListRecord } from "$lib/DBTypes";

export const load = (async ({ locals }) => {

    try
    {
        const lists = await locals.pb.collection(Collections.List).getFullList<ListRecord>(undefined, {
            expand: "parent_nomenclature"
        });

        const nomenclatures = await locals.pb.collection(Collections.Nomenclature).getFullList<NomenclatureRecord>();

        return {
            lists: structuredClone(lists),
            nomenclatures: structuredClone(nomenclatures)
        }
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load lists");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    newList: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();
            const list = await locals.pb.collection(Collections.List).create<ListResponse>(form);

            throw redirect(303, `/app/list/${list.id}`);
        }
        catch(ex)
        {
            return { error: "Failed to create list" };
        }
    }
}