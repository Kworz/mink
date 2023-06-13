import { redirect } from "@sveltejs/kit";
import type { Actions} from "./$types";
import { Collections, type ArticleResponse } from "$lib/DBTypes";

export const actions: Actions = {
    create: async ({ request, locals }) =>
    {
        const formData = await request.formData();

        let createdArticle = undefined;

        formData.set("consumable", String(formData.has("consumable")));
        formData.set("non_physical", String(formData.has("non_physical")));
        
        try
        {
            createdArticle = await locals.pb.collection(Collections.Article).create<ArticleResponse>(formData);
        }
        catch(err)
        {
            console.log(err);
            return { error: "Failed to create object" };
        }

        throw redirect(303, `/app/scm/articles/${createdArticle.id}`);
    }
};