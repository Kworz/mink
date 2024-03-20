import type { PageServerLoad, Actions } from "./$types";

import { fail, redirect } from "@sveltejs/kit";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import type { scm_store } from "@prisma/client";
import { flattenAssembly } from "$lib/components/derived/assemblies/flattenAssembly";

export const load = (async ({ locals, params, url }) => {

    const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }, include: { assembly: true, project: true }});
    if(list === null) return redirect(303, "/app/scm/lists?listNotFound=true");
    
    const articleFilter = url.searchParams.get("articleFilter") ? JSON.parse(decodeURIComponent(url.searchParams.get("articleFilter") as string)) : undefined;
    const articleSort = url.searchParams.get("articleSort") ? JSON.parse(decodeURIComponent(url.searchParams.get("articleSort") as string)) : undefined;

    console.log(articleSort);

    const listStoreRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: list.store_id }, include: { article: { include: articleIncludeQuery }}});

    const flattenedAssembly = await flattenAssembly(list.assembly_id, locals.prisma);

    const articles = await locals.prisma.scm_article.findMany({ where: {...{ id: { in: Object.keys(flattenedAssembly) }}, ...articleFilter }, include: articleIncludeQuery, orderBy: articleSort });
    
    /// - Secondary data

    const assemblies = await locals.prisma.scm_assembly.findMany({ where: { id: { in: [...Object.keys(flattenedAssembly).flatMap(k => flattenedAssembly[k].parentAssemblies).reduce((p, c) => new Set([...p, ...c]), new Set<string>()).keys()]}}});
    const projects = await locals.prisma.pr_project.findMany({});

    return {
        list,
        listStoreRelations,

        flattenedAssembly,
        articles,

        assemblies,
        projects
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request, params }) => {

        const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }});

        if(!list) return fail(404, { buyListRelationEdit: { error: "List not found" }});

        /// — Form parsing
        const form = await request.formData();
        const articleId = form.get("article")?.toString();
        const quantity = Number(form.get("quantity")?.toString());
        let storeToUse = form.get('store')?.toString();

        if(articleId === undefined)
            return fail(400, { buyListRelationEdit: { error: "Missing article ID" }});

        if(Number.isNaN(quantity))
            return fail(400, { buyListRelationEdit: { error: "Quantity is not a number" }});


        /// — Quantity data to check with
        const buylistArticleStoreRelation = await locals.prisma.scm_store_relation.findUnique({ where: { article_id_store_id: { article_id: articleId, store_id: list.store_id} }});
        const articleAvailableStores = await locals.prisma.scm_store_relation.findMany({ where: { article_id: articleId, quantity: { gt: 0 }, store: { assemblies_buylist: null }}, orderBy: { quantity: "desc" }, include: { store: true }});

        let storeToUseId: string | undefined = undefined;

        if(storeToUse === undefined && articleAvailableStores.length > 1)
            return fail(400, { buyListRelationEdit: { 
                error: "Multiple stores available for this article, please specify one", 
                
                article: articleId,
                list: list.id,
                storesToGetFrom: articleAvailableStores.map(aas => aas.store) as scm_store[], 
                quantity 
            }});
        else if(storeToUse === undefined && articleAvailableStores.length === 1)
            storeToUseId = articleAvailableStores.at(0)!.store_id;
        else if(storeToUse !== undefined)
            storeToUseId = storeToUse;
        else
            return fail(400, { buyListRelationEdit: { 
                error: "No stores with the specified article", 

                article: articleId,
                list: list.id,
            }});

        const articleQuantityDelta = quantity - (buylistArticleStoreRelation?.quantity ?? 0);

        if(articleQuantityDelta > 0) // Adding article to the list from the specified store
        {
            // check if store has enough quantity (choose either from the specified store or the first available one as it is the default one)
            const availableQuantity = articleAvailableStores.find(storeRelation => storeRelation.store_id === storeToUseId)?.quantity;

            if(availableQuantity === undefined || availableQuantity < articleQuantityDelta)
                return fail(400, { buyListRelationEdit: { 
                    error: "Not enough quantity in store", 
                    
                    article: articleId,
                    list: list.id,
                    quantity 
                }});

            // update relations

            // update buylist store_relation
            await locals.prisma.scm_store_relation.upsert({ 
                where: { article_id_store_id: { article_id: articleId, store_id: list.store_id }}, 
                create: { article_id: articleId, store_id: list.store_id, quantity: quantity }, 
                update: { quantity: { increment: articleQuantityDelta }}
            });

            await locals.prisma.scm_store_relation.update({ where: { article_id_store_id: { article_id: articleId, store_id: storeToUseId }}, data: { quantity: { decrement: articleQuantityDelta }}});

            await locals.prisma.scm_article_movements.create({
                data: {
                    article_id: articleId,
                    quantity_update: articleQuantityDelta,
                    user_id: locals.user!.id,
                    store_in_id: list.store_id,
                    store_out_id: storeToUseId
                }
            });
        }
        else // Removing article from the list to the specied store if given
        {
            if(storeToUse === undefined && articleAvailableStores.length > 1)
                return fail(400, { buyListRelationEdit: { 
                    error: "Multiple stores available for this article, please specify one", 

                    article: articleId,
                    list: list.id,
                    storesToSendTo: articleAvailableStores.map(aas => aas.store), 
                    quantity 
                }});

            // check if store has enough quantity (choose either from the specified store or the first available one as it is the default one)
            const availableQuantity = buylistArticleStoreRelation?.quantity;

            if(availableQuantity === undefined || availableQuantity < -articleQuantityDelta)
                return fail(400, { buyListRelationEdit: { 
                    error: "Not enough quantity in list's store", 

                    article: articleId,
                    list: list.id, 
                    quantity
                }});

            // update relations

            // update buylist store_relation
            await locals.prisma.scm_store_relation.upsert({ 
                where: { article_id_store_id: { article_id: articleId, store_id: storeToUseId }}, 
                create: { article_id: articleId, store_id: storeToUseId, quantity: quantity }, 
                update: { quantity: { decrement: -articleQuantityDelta }}
            });

            await locals.prisma.scm_store_relation.update({ where: { article_id_store_id: { article_id: articleId, store_id: list.store_id }}, data: { quantity: { decrement: articleQuantityDelta }}});

            await locals.prisma.scm_article_movements.create({
                data: {
                    article_id: articleId,
                    quantity_update: -articleQuantityDelta,
                    user_id: locals.user!.id,
                    store_in_id: storeToUseId,
                    store_out_id: list.store_id,
                }
            });
        }

        return {
            buyListRelationEdit: { 
                success: true,
                
                article: articleId,
                list: list.id
            }
        };
    },

    editList: async ({ locals, request, params }) => {

        const form = await request.formData();
        const name = form.get("name")?.toString();

        if(name === undefined || name.length < 4)
            return fail(400, { editList: { error: "errors.scm.lists.create.name-invalid" }});

        const assemblyId = form.get("assembly")?.toString();

        if(assemblyId === undefined)
            return fail(400, { editList: { error: "errors.scm.lists.create.assembly-invalid" }});

        const projectId = form.get("list")?.toString();
        const closed = form.has("closed");
        
        try
        {
            const buyList = await locals.prisma.scm_assembly_buylist.update({ where: { id: params.id }, data: { name, closed, assembly_id: assemblyId, project_id: projectId }});
            await locals.prisma.scm_store.update({ where: { id: buyList.store_id }, data: { name }});

            return { editList: { success: true }};
        }
        catch(e)
        {
            return fail(500, { editList: { error: "errors.generic" }});
        }
    }
};