import { error, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type NomenclatureRowResponse, type ListResponse, type ListRowResponse } from "$lib/DBTypes";

export const load = (async ({ params, locals }) => {

    try
    {
        const list = await locals.pb.collection(Collections.List).getOne<ListResponse>(params.id, {
            expand: "parent_nomenclature"
        });

        const list_rows = await locals.pb.collection(Collections.ListRow).getFullList<ListRowResponse>(undefined, {
            filter: `parent_list="${params.id}"`,
            expand: ``
        });

        const nomenclature_rows = await locals.pb.collection(Collections.NomenclatureRow).getFullList<NomenclatureRowResponse>(undefined, {
            filter: `parent_nomenclature="${list.parent_nomenclature}"`,
            expand: `child_article`
        });

        return {
            list: structuredClone(list),
            list_rows: structuredClone(list_rows),
            nomenclature_rows: structuredClone(nomenclature_rows)
        }
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load list");
    }
}) satisfies PageServerLoad;

export const actions: Actions = {
    updateRow: async ({ params, request, locals }) => {

        try
        {
            const data = await request.formData();
            const id = params.id;

            if(id === undefined)
                throw Error("Failed to find request route id");

            data.set("parent_list", id);

            if(data.has("id"))
            {
                await locals.pb.collection(Collections.ListRow).update(data.get("id") as string, data)
            }
            else
            {
                await locals.pb.collection(Collections.ListRow).create(data)
            }

            return { success: true }
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to create list row" };
        }
    },
    editList: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();

            await locals.pb.collection(Collections.List).update(params.id, form);

            return { success: true };
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to edit list properties" };
        }
    }
}