import { Collections } from "$lib/DBTypes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { articleResponseExpand, type ArticleResponseExpanded } from "$lib/components/article/ArticleRow.svelte";

export const load = (async ({ locals, url }) => {

    try
    {
        const sort = url.searchParams.get("sort") ?? "name";
        const filter = url.searchParams.get("filter") ?? "";
        const page = Number(url.searchParams.get("page")) || 1;

        const articles = await locals.prisma.sCMArticle.findMany({
            orderBy: { name: "asc" },
            skip: (page - 1) * 50,
            take: 50,
        });

        const totalItems = await locals.prisma.sCMArticle.count();
                
        return {
            articles: articles,
            totalItems: totalItems
        };
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load errors");
    }

}) satisfies PageServerLoad;