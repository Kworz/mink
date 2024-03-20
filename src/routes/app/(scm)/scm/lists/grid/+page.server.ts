import { flattenAssembly } from '$lib/components/derived/assemblies/flattenAssembly';
import { articleIncludeQuery } from '$lib/components/derived/article/article';
import type { PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {

    const ids = url.searchParams.get("ids");

    if(ids === null)
        return redirect(303, "/app/scm/lists?gridNoIds=true");

    const listsAssemblies = await locals.prisma.scm_assembly_buylist.findMany({ where: { id: { in: ids.split(",") }}, include: { assembly: true }});

    const referenceList = listsAssemblies.at(0);

    if(referenceList === undefined || listsAssemblies.length === 0 || listsAssemblies.some(list => list.assembly.id !== referenceList.assembly.id))
        return redirect(303, "/app/scm/lists?gridDifferentAssemblies=true");

    const lists = [];

    for(const id of ids.split(","))
    {
        const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id }, include: { assembly: true, project: true }});
        if(list === null) return redirect(303, "/app/scm/lists?listNotFound=true");
            
        const listStoreRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: list.store_id }, include: { article: { include: articleIncludeQuery }}});
        const flattenedAssembly = await flattenAssembly(list.assembly_id, locals.prisma);

        lists.push({
            list,
            listStoreRelations,
    
            flattenedAssembly
        });
    }

    const articleFilter = url.searchParams.get("articleFilter") ? JSON.parse(decodeURIComponent(url.searchParams.get("articleFilter") as string)) : undefined;
    const articleSort = url.searchParams.get("articleSort") ? JSON.parse(decodeURIComponent(url.searchParams.get("articleSort") as string)) : undefined;

    const articles = await locals.prisma.scm_article.findMany({ where: {...{ id: { in: Object.keys(lists.at(0)!.flattenedAssembly) }}, ...articleFilter }, include: articleIncludeQuery, orderBy: articleSort });
    
    return {
        lists,

        articles
    }

}) satisfies PageServerLoad;
