import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { Collections, type NomenclatureResponse, type NomenclatureRowResponse, type NomenclatureRowRecord, type ArticleResponse } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../../articles/+page.server";

type NomenclatureResponseExpanded = NomenclatureResponse<{
    "nomenclature_row(parent_nomenclature)": Array<NomenclatureRowResponseExpanded>
}>;

export type NomenclatureRowResponseExpanded = NomenclatureRowResponse<{
    "child_article": ArticleResponse
}>

export type NomenclatureRowResponseExpandedWithArticle = NomenclatureRowResponse<{
    child_article: ArticleResponseExpanded
}>

export const load = (async ({ params, locals }) => {

    try {

        const nomenclature = await locals.pb.collection(Collections.Nomenclature).getOne<NomenclatureResponseExpanded>(params.id, {
            expand: `nomenclature_row(parent_nomenclature).child_article`
        });

        return {
            nomenclature: structuredClone(nomenclature),
        }
    }
    catch(ex)
    {
        throw redirect(303, "/app/nomenclatures");
    }

}) satisfies PageServerLoad;


export const actions: Actions = {

    addItem: async ({ params, request, locals }) => {
        
        try {
            const formData = await request.formData();

            formData.set("parent_nomenclature", params.id);

            await locals.pb.collection("nomenclature_row").create(formData);

            return { success: true };
        }
        catch(ex)
        {
            return { error: ex };
        }
    },

    deleteItem: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();
            const row_id = form.get("row_id")?.toString();

            if(row_id === undefined)
                throw "Could not find item id to delete";

            await locals.pb.collection("nomenclature_row").delete(row_id);

            return { success: true };
        }
        catch(ex)
        {
            return { error: ex };
        } 
    },

    editItem: async ({ request, locals }) => {
        try{
            const form = await request.formData();
            const row_id = form.get("row_id")?.toString();

            if(row_id === undefined)
                throw "Could not find item id to update";

            const item = {
                quantity_required: Number(form.get("quantity_required")?.toString()),
                group: form.get("group")?.toString()
            } satisfies Partial<NomenclatureRowRecord>;

            await locals.pb.collection(Collections.NomenclatureRow).update<NomenclatureRowResponse>(row_id, item);

            return { success: true };
        }
        catch(ex)
        {
            return { error: ex };
        }
    },

    editNomenclature: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();

            await locals.pb.collection(Collections.Nomenclature).update(params.id, form);

            return { success: true };
        }
        catch(ex)
        {
            return { error: ex };
        }
    },

    copyNomenclature: async ({ params, locals }) => {
        try {
            const nom = await locals.pb.collection(Collections.Nomenclature).getOne<Partial<NomenclatureResponse>>(params.id);

            const nom_rows = await locals.pb.collection(Collections.NomenclatureRow).getFullList(undefined, {
                filter: `parent_nomenclature="${params.id}"` 
            });

            nom.name = nom.name + "- copie";
            nom.id = undefined;

            const new_nom_row = await locals.pb.collection(Collections.Nomenclature).create<NomenclatureResponse>(nom);
            
            for(const row of nom_rows)
            {
                await locals.pb.collection(Collections.NomenclatureRow).create({...row, parent_nomenclature: new_nom_row.id, id: undefined})
            }

            throw redirect(303, "/app/nomenclatures/" + new_nom_row.id);
        }
        catch(ex)
        {
            return { error: ex };
        }
    }
}