import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type ArticleResponse, type NomenclatureResponse, type NomenclatureRowRecord, type NomenclatureRowResponse } from "$lib/DBTypes";

export const load = (async ({ params, locals }) => {

    try
    {
        const itemId = params.id;
        const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(itemId);
        const nomenclatures = await locals.pb.collection(Collections.Nomenclature).getFullList<NomenclatureResponse>();
    
        return {
            article: structuredClone(article),
            nomenclatures: structuredClone(nomenclatures)
        }
    }catch(ex) 
    {
        throw redirect(303, "/app/articles");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    deleteArticle: async ({ params, locals }) => {
        try
        {
            await locals.pb.collection("article").delete(params.id);
        }
        catch(ex)
        {
            return { error: "Failed to delete item" };
        }

        throw redirect(303, "/app/articles");
    },
    
    editArticle: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();
            await locals.pb.collection(Collections.Article).update(params.id, form);

            return { success: "Updated object successfully" };
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to update object" };
        }
    },

    copyArticle: async ({ params, locals }) => {

        let newArticle = undefined;

        try
        {
            const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(params.id);
            newArticle = await locals.pb.collection(Collections.Article).create({...article, id: undefined, name: article.name + " - Copy" });

        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to copy article" };
        }

        throw redirect(303, "/app/articles/" + newArticle.id);
    },

    addToNomenclature: async ({ locals, request, params }) => {
        const form = await request.formData();

        const parent_nomenclature = form.get("parent_nomenclature");
        const item_id = params.id;
        const item_quantity = form.get("item_quantity");

        try {

            if(parent_nomenclature === null || item_id === undefined || item_quantity === null)
                throw "too few arguments"
            
            const nomRow: NomenclatureRowRecord = {
                parent_nomenclature: parent_nomenclature.toString(),
                child_article: item_id,
                quantity_required: Number(item_quantity.toString())
            };

            await locals.pb.collection(Collections.NomenclatureRow).create<NomenclatureRowResponse>(nomRow);

            return { success: "Article added successfully" };
        }
        catch(ex)
        {
            return { error: "Failed to add to nomenclature" };
        }
    }
}