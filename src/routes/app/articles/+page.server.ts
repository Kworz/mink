import { Collections, type ArticleResponse, type SuppliersResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export type ArticleResponseExpanded = ArticleResponse<{
    supplier: Array<SuppliersResponse>
}>;

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "name";
    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponseExpanded>(undefined, { sort, expand: "supplier" });

    return {
        articles: structuredClone(articles)
    };
}) satisfies PageServerLoad;