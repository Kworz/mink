import { redirect } from "@sveltejs/kit";
import type { Actions} from "./$types";
import { Collections, type ArticleResponse } from "$lib/DBTypes";

export const actions: Actions = {
    create: async ({ request, locals }) =>
    {
        const formData = await request.formData();

        let createdArticle = undefined;

        try
        {
            createdArticle = await locals.pb.collection(Collections.Article).create<ArticleResponse>(formData);
        }
        catch(err)
        {
            console.log(err);
            return { error: "Failed to create object" };
        }

        throw redirect(303, `/app/articles/${createdArticle.id}`);
    }
};