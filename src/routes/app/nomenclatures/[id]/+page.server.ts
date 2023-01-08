import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type NomenclatureResponse, type ArticleResponse } from "$lib/DBTypes";

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

            return { success: true }
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "failed to delete row" };
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
    }
}