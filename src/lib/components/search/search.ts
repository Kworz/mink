import { type AssembliesResponse, Collections, type AssembliesBuylistsResponse } from "$lib/DBTypes"
import type Client from "pocketbase";
import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";

export const search = async (search: string, pb: Client) => {

    console.log("searching for", search)

    const articles = await pb.collection(Collections.Article).getFullList<ArticleResponseExpanded>({ filter: `name ~ "${search}"`, batch: 5, expand: "supplier", sort: "name" });
    const assemblies = await pb.collection(Collections.Assemblies).getFullList<AssembliesResponse>({ filter: `name ~ "${search}"`, batch: 5, sort: "name" });
    const lists = await pb.collection(Collections.AssembliesBuylists).getFullList<AssembliesBuylistsResponse>({ filter: `name ~ "${search}"`, batch: 5, sort: "name" });

    return {
        lists: structuredClone(lists).slice(0, 5),
        articles: structuredClone(articles).slice(0, 5),
        assemblies: structuredClone(assemblies).slice(0, 5)
    };
}