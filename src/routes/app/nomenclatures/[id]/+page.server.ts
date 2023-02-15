import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type NomenclatureResponse, type ArticleResponse, NomenclatureRecord, type ListRowRecord } from "$lib/DBTypes";

export const load = (async ({ params, locals }) => {

    try {
        const nomenclature = await locals.pb.collection(Collections.Nomenclature).getOne<NomenclatureResponse>(params.id, {
            expand: `nomenclature_row(parent_nomenclature).child_article`
        });

        const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponse>();

        return {
            nomenclature: structuredClone(nomenclature),
            articles: structuredClone(articles),
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
            console.log(ex);
            return { error: "failed to create new row" };
        }

    },

    deleteItem: async ({ request, locals }) => {
        try {
            const form = await request.formData();
            await locals.pb.collection("nomenclature_row").delete(form.get("row_id"));

            return { success: true };
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "failed to delete row" };
        } 
    },

    editItem: async ({ request, locals }) => {
        try{
            const form = await request.formData();

            console.log(form);

            let item = {};

            if(form.has("quantity_required"))
                item.quantity_required = form.get("quantity_required")
        
            if(form.has("group"))
                item.group = form.get("group");

            await locals.pb.collection(Collections.NomenclatureRow).update<ListRowRecord>(form.get("row_id"), item);

            return { success: true };
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to update item" };
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
            console.log(ex);
            return { error: "Failed to edit nomenclature properties" };
        }
    },

    copyNomenclature: async ({ params, locals }) => {
        try {
            const nom = await locals.pb.collection(Collections.Nomenclature).getOne<NomenclatureResponse>(params.id);
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
            console.log(ex);
            return { error: "Failed to copy nomenclature" };
        }
    }
}