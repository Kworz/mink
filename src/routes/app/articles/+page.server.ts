import { Collections, type ArticleResponse, type SuppliersResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

type ArticleResponseExpanded = ArticleResponse<{
    supplier: SuppliersResponse
}>;

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "name";

    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponseExpanded>(undefined, { sort, expand: "supplier" });

    console.log(articles.at(69));

    return {
        articles: structuredClone(articles)
    };
}) satisfies PageServerLoad;