import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type ArticleResponse } from "$lib/DBTypes";

export const load = (async ({ params, locals }) => {

    try
    {
        const itemId = params.id;
        const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(itemId);
    
        return {
            article: structuredClone(article)
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

            return { success: true };
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
            return { error: "Failed to copyt article" };
        }

        throw redirect(303, "/app/articles/" + newArticle.id);
    }
}