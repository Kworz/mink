import { Collections, type StoresRelationsResponse, type StoresResponse } from "$lib/DBTypes";
import { articleResponseExpand, type ArticleResponseExpanded } from "$lib/components/article/ArticleRow.svelte";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params, url }) => {

    const sort = url.searchParams.get("sort") ?? "article.name";
    const filter = url.searchParams.get("filter") ?? "";
    const page = Number(url.searchParams.get("page")) ?? 1;

    const store = await locals.pb.collection(Collections.Stores).getOne<StoresResponse>(params.id);
    const storeRelations = await locals.pb.collection(Collections.StoresRelations).getList<StoresRelationsResponse<{ article: ArticleResponseExpanded }>>(page, 50, { filter: `store = "${params.id}"`, sort });

    for(const relation of storeRelations.items)
    {
        relation.expand.article = await locals.pb.collection(Collections.Article).getOne<ArticleResponseExpanded>(relation.article, { expand: articleResponseExpand });
    }

    return {
        store: structuredClone(store),
        storeRelations: structuredClone(storeRelations)
    };

}) satisfies PageServerLoad;