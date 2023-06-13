import { Collections, type ArticleResponse, type SuppliersResponse, type OrdersRowsResponse, type StoresResponse, type StoresRelationsResponse, type FabricationOrdersResponse } from "$lib/DBTypes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { articleResponseExpand, type ArticleResponseExpanded } from "$lib/components/article/ArticleRow.svelte";

export type ArticleResponseExpanded2 = ArticleResponse<{
    supplier: Array<SuppliersResponse>,
    'orders_rows(article)': Array<OrdersRowsResponse>,
    'stores_relations(article)': Array<StoresRelationsResponse<{
        store: StoresResponse
    }>>,
    'fabrication_orders(article)': Array<FabricationOrdersResponse>
}>;

export const load = (async ({ locals, url }) => {

    try
    {
        const sort = url.searchParams.get("sort") ?? "name";
        const filter = url.searchParams.get("filter") ?? "";
        const page = Number(url.searchParams.get("page")) ?? 1;
        
        const articles = await locals.pb.collection(Collections.Article).getList<ArticleResponseExpanded>(page, 50, { sort, filter, expand: articleResponseExpand });
        
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