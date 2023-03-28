import { type AssembliesResponse, Collections, type AssembliesBuylistsResponse } from "$lib/DBTypes"
import type Client from "pocketbase";
import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";

export const search = async (search: string, pb: Client) => {

    const lists = await pb.collection(Collections.AssembliesBuylists).getFullList<AssembliesBuylistsResponse>({ filter: `name ~ "${search}"`, batch: 5 });
    const articles = await pb.collection(Collections.Article).getFullList<ArticleResponseExpanded>({ filter: `name ~ "${search}"`, batch: 5, expand: "supplier" });
    const assemblies = await pb.collection(Collections.Assemblies).getFullList<AssembliesResponse>({ filter: `name ~ "${search}"`, batch: 5 });

    return {
        lists: structuredClone(lists),
        articles: structuredClone(articles),
        assemblies: structuredClone(assemblies)
    };
}