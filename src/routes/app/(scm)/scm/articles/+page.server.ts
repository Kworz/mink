import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.has("sort") ? JSON.parse(decodeURIComponent(url.searchParams.get("sort") as string)) : undefined;
    const filter = url.searchParams.has("filter") ? JSON.parse(decodeURIComponent(url.searchParams.get("filter") as string)) : undefined;
    const page = Number(url.searchParams.get("page")) || 1;

    const itemsPerPage = Number(url.searchParams.get("itemsPerPage") || 50);

    const articles = await locals.prisma.scm_article.findMany({
        orderBy: sort,
        where: filter,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        include: articleIncludeQuery,
    });

    const totalItems = await locals.prisma.scm_article.count({
        orderBy: sort,
        where: filter,
    });
            
    return {
        articles: articles,
        totalItems: totalItems,
    };

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
            return fail(400, { create: { error: "errors.scm.article.create.generic" }})
        }

        throw redirect(303, `/app/scm/articles/${createdArticle.id}`);
    },
    delete: async ({ params, locals, request }) => {

        const form = await request.formData();
        const articles = form.get("articles")?.toString();

        if(!articles)
            return fail(400, { delete: { error: "errors.scm.article.delete.no-articles" }});

        await locals.prisma.scm_article.deleteMany({ where: { id: { in: articles.split(",") }}});

        return { delete: { success: true }}
    }
};