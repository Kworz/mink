import { Collections, type ArticleMovementsRecord, type OrdersRowsRecord, type OrdersRecord, OrdersStateOptions, type StoresRelationsResponse, type SuppliersResponse, type AssembliesBuylistsResponse, type StoresResponse, type FabricationOrdersRecord, FabricationOrdersStateOptions } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad, Actions } from "./$types";
import type { AssembliesBuylistsResponseExpanded } from "../+page.server";

import { fail, redirect } from "@sveltejs/kit";
import { articleIncludeQuery } from "$lib/components/article/article";
import type { scm_assembly_relation_article } from "@prisma/client";

// TODO: test this
async function flatAssembly(assembly_id: string, prisma: App.Locals["prisma"]): Promise<Array<scm_assembly_relation_article>> {

    const articleRelations = await prisma.scm_assembly_relation_article.findMany({ where: { parent_id: assembly_id }});
    const subassembliesRelations = await prisma.scm_assembly_relation_sub_assembly.findMany({ where: { parent_id: assembly_id }});

    return [...articleRelations, (await Promise.all(subassembliesRelations.map(k => flatAssembly(k.assembly_child_id, prisma)))).flat()].flat();

}

export const load = (async ({ locals, params }) => {

    const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }, include: { assembly: true, project: true }});
    if(list === null) return redirect(303, "/app/scm/lists");

    const storeRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: list.store_id }, include: { article: { include: articleIncludeQuery }}});
    const flattenAssemblyResult = flatAssembly(list.assembly_id, locals.prisma);

    /// - Secondary data

    const assemblies = await locals.prisma.scm_assembly.findMany({});
    const projects = await locals.prisma.pr_project.findMany({});

    return {
        list,
        flattenAssemblyResult,
        storeRelations,

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
        const buylist = form.get("buylist")?.toString();
        let storeToUse = form.get('store')?.toString();

        if(articleId === undefined)
            return fail(400, { buyListRelationEdit: { error: "Missing article ID" }});

        if(Number.isNaN(quantity))
            return fail(400, { buyListRelationEdit: { error: "Quantity is not a number" }});

        if(buylist === undefined)
            return fail(400, { buyListRelationEdit: { error: "Missing buylist ID" }});

        /// — Quantity data to check with
        const buylistArticleStoreRelation = await locals.prisma.scm_store_relation.findUnique({ where: { article_id_store_id: { article_id: articleId, store_id: list.store_id} }});
        const articleAvailableStores = await locals.prisma.scm_store_relation.findMany({ where: { article_id: articleId, quantity: { gt: 0 }, store: { temporary: false }}});

        if(storeToUse === undefined && articleAvailableStores.length > 1)
            return fail(400, { buyListRelationEdit: { error: "Multiple stores available for this article, please specify one" }});

        const articleQuantityDelta = quantity - (buylistArticleStoreRelation?.quantity ?? 0);

        // TODO: implement this next

        try
        {
            

            const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponse>(params.id);
            const storeRelationLinkedList = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && store = "${list.store}"` });

            const deltaQuantity = quantity - (storeRelationLinkedList.at(0)?.quantity ?? 0);

            if(storeToUse === undefined)
            {
                if(deltaQuantity > 0)
                {
                    const storesToChooseFrom = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse<{ store: StoresResponse }>>({ filter: `article = "${articleID}" && quantity > 0 && store.temporary = false`, expand: "store" });

                    if(storesToChooseFrom.length > 1)
                        return { buyListRelationEdit: { [articleID]: { storesToGetFrom: structuredClone(storesToChooseFrom).map(k => k.expand?.store) }}};
                    else
                        storeToUse = storesToChooseFrom[0].store;
                }
                else
                {
                    const storesWithRelations = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && quantity > 0 && store.temporary = false`, expand: "store" })).at(0);
                    
                    if(storesWithRelations !== undefined)
                        storeToUse = storesWithRelations.expand?.store?.id;
                    else
                    {
                        const storesToSendTo = await locals.pb.collection(Collections.Stores).getFullList<StoresResponse>({ filter: "temporary = false"});

                        if(storesToSendTo.length > 1)
                            return { buyListRelationEdit: { [articleID]: { storesToSendTo: structuredClone(storesToSendTo) }}};
                        else
                            storeToUse = storesToSendTo[0].id;
                    }
                }
            }

            if(deltaQuantity > 0)
            {
                const storesRelationsWithArticle = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && quantity > 0 && store = "${storeToUse}"` });
                const selectedStore = storesRelationsWithArticle.at(0);

                if(storesRelationsWithArticle.length === 0 || selectedStore === undefined)
                    throw "No article in stock";

                if((selectedStore?.quantity ?? 0) < deltaQuantity)
                    throw "Buy list affectation quantity is higher than article quantity";

                const buyListRelation = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && store = "${list.store}"` })).at(0);

                const articleMovement: ArticleMovementsRecord = {
                    article: articleID,
                    quantity_update: Math.abs(deltaQuantity),
                    user: locals.user?.id,
                    store_in: list.store,
                    store_out: selectedStore?.store
                };
                
                if(buyListRelation === undefined)
                    await locals.pb.collection(Collections.StoresRelations).create({ article: articleID, store: list.store, quantity: quantity });
                else
                    await locals.pb.collection(Collections.StoresRelations).update(buyListRelation.id, { "quantity+": deltaQuantity });
                
                await locals.pb.collection(Collections.StoresRelations).update(selectedStore.id, { "quantity-": deltaQuantity });
                await locals.pb.collection(Collections.ArticleMovements).create(articleMovement);

            }
            else
            {
                const buyListRelation = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && store = "${list.store}"` })).at(0);

                if(buyListRelation !== undefined)
                    await locals.pb.collection(Collections.StoresRelations).update(buyListRelation.id, { "quantity+": deltaQuantity });
                else
                    throw "Cant decrease undefined quantity"

                const storeRelation = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `store = "${storeToUse}" && article = "${articleID}"` })).at(0);

                if(storeRelation === undefined)
                    await locals.pb.collection(Collections.StoresRelations).create({ article: articleID, store: storeToUse, quantity: -deltaQuantity });
                else
                    await locals.pb.collection(Collections.StoresRelations).update(storeRelation.id, { "quantity-": deltaQuantity });
                
                await locals.pb.collection(Collections.ArticleMovements).create({
                    article: articleID,
                    quantity_update: -deltaQuantity,
                    user: locals.user?.id,
                    store_in: storeToUse,
                    store_out: list.store
                });
            }
        }
        catch(ex)
        {
            console.log(ex);
            return { buyListRelationEdit: { [articleID ?? "all"]: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}};
        }

        return {
            buyListRelationEdit: { 
                success: true,
                [articleID]: { success: "Successfully Created/updated row row" }
            }};
    },

    editList: async ({ locals, request, params }) => {

        const form = await request.formData();

        const name = form.get("name")?.toString();
        const assembly_id = form.get("assembly")?.toString();
        const project_id = form.get("list")?.toString();
        const closed = form.has("closed");

        try
        {
            await locals.prisma.scm_assembly_buylist.update({ where: { id: params.id }, data: { name, closed, assembly_id, project_id }});
            return { editList: { success: "Successfully updated row" }};
        }
        catch(e)
        {
            return fail(400, { editList: { error: String(e) }});
        }
    }
};