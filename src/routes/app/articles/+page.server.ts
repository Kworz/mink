import { Collections, type ArticleResponse, type SuppliersResponse, type OrdersRowsResponse, type ArticleStoresResponse } from "$lib/DBTypes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export type ArticleResponseExpanded = ArticleResponse<{
    supplier: Array<SuppliersResponse>,
    'orders_rows(article)': Array<OrdersRowsResponse>,
    store: ArticleStoresResponse
}>;

export const load = (async ({ locals, url }) => {

    try {
        const sort = url.searchParams.get("sort") ?? "name";
        const filter = url.searchParams.get("filter") ?? "";
        const page = Number(url.searchParams.get("page")) ?? 1;
        
        const articles = await locals.pb.collection(Collections.Article).getList<ArticleResponseExpanded>(page, 50, { sort, filter, expand: "supplier,store,orders_rows(article),article_view(article)" });
        
        return {
            articleList: structuredClone(articles)
        };
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load errors");
    }

}) satisfies PageServerLoad;