import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";

export const load = (async ({ locals, url }) => {

    try
    {
        const sort = url.searchParams.get("sort");
        const filter = url.searchParams.get("filter");
        const page = Number(url.searchParams.get("page")) || 1;

        const articles = await locals.prisma.scm_article.findMany({
            orderBy: (sort !== null) ? JSON.parse(atob(sort)) : undefined,
            where: (filter !== null) ? JSON.parse(atob(filter)) : undefined,
            skip: (page - 1) * 50,
            take: 50,
            include: articleIncludeQuery,
        });

        const totalItems = await locals.prisma.scm_article.count();
                
        return {
            articles: articles,
            totalItems: totalItems,

            sort: sort ?? "",
            filter: filter ?? "",
            page
        };
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load errors");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    create: async ({ request, locals }) =>
    {
        const form = await request.formData();

        let createdArticle = undefined;
        
        try
        {
            createdArticle = await locals.prisma.scm_article.create({
                data: {
                    ...Object.fromEntries(form),
                    name: form.get("name")?.toString() as string,

                    consumable: form.has("consumable"),
                    non_physical: form.has("non_physical"),

                    order_quantity: Number(form.get("order_quantity")),
                    critical_quantity: Number(form.get("critical_quantity")),
                }
            });
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { create: { error: "scm.article.create.error.generic" }})
        }

        throw redirect(303, `/app/scm/articles/${createdArticle.id}`);
    }
};