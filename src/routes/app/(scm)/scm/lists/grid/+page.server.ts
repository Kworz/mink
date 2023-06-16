import { Collections, type ArticleMovementsRecord, type OrdersRowsRecord, type OrdersRecord, OrdersStateOptions, type StoresRelationsResponse, type SuppliersResponse, type AssembliesBuylistsResponse, type StoresResponse, type FabricationOrdersRecord, FabricationOrdersStateOptions } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad, Actions } from "./$types";
import type { AssembliesBuylistsResponseExpanded } from "../+page.server";

import { env } from "$env/dynamic/public";

import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {

    const ids = url.searchParams.get("ids");

    if(ids === null)
        throw redirect(303, "/app/scm/lists");

    const listsFilter = ids.split(",").map(k => `id = "${k}"`).join(" || ");

    const lists = await locals.pb.collection(Collections.AssembliesBuylists).getFullList<AssembliesBuylistsResponseExpanded>({ expand: "assembly,project,store_relations(store)", filter: listsFilter, sort: "name" });

    const referenceList = lists.at(0);

    if(referenceList === undefined || lists.some(k => k.assembly !== referenceList.assembly))
        throw redirect(303, "/app/scm/lists");
    
    const flattenAssemblyReference = await flattenAssembly(referenceList.expand?.assembly, locals.pb);

    const storesLists = lists.map(k => `store = "${k.store}"`).join(" || ");
    
    const storeRelations = await locals.pb.collection(Collections.StoresRelations).getFullList({ filter: storesLists });

    return {
        lists: structuredClone(lists),
        flattenAssemblyReference: structuredClone(flattenAssemblyReference),
        storeRelations: structuredClone(storeRelations)
    };

}) satisfies PageServerLoad;

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request }) => {

        const form = await request.formData();
        const articleID = form.get("article")?.toString();
        const quantity = Number(form.get("quantity")?.toString());
        const buylist = form.get("list")?.toString();

        let storeToUse = form.get('store')?.toString();

        try
        {
            if(articleID === undefined || quantity === undefined || buylist === undefined)
                throw "Invalid form data";

            const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponse>(buylist);
            const storeRelationLinkedList = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && store = "${list.store}"` });

            const deltaQuantity = quantity - (storeRelationLinkedList.at(0)?.quantity ?? 0);

            if(storeToUse === undefined)
            {
                if(deltaQuantity > 0)
                {
                    const storesToChooseFrom = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse<{ store: StoresResponse }>>({ filter: `article = "${articleID}" && quantity > 0 && store.temporary = false`, expand: "store" });

                    if(storesToChooseFrom.length > 1)
                        return { buyListRelationEdit: { [list.id]: { [articleID]: { storesToGetFrom: structuredClone(storesToChooseFrom).map(k => k.expand?.store) }}}};
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
                            return { buyListRelationEdit: { [list.id]: { [articleID]: { storesToSendTo: structuredClone(storesToSendTo) }}}};
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
            return { buyListRelationEdit: { [buylist ?? "all"]: { [articleID ?? "all"]: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}}};
        }

        return {
            buyListRelationEdit: { 
                success: true,
                [buylist]: { [articleID]: { success: "Successfully Created/updated row row" }}
            }
        };
    }
};