import { Collections, type ArticleMovementsRecord, type OrdersRowsRecord, type OrdersRecord, OrdersStateOptions, type StoresRelationsResponse, type SuppliersResponse, type AssembliesBuylistsResponse, type StoresResponse, type FabricationOrdersRecord, FabricationOrdersStateOptions } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad, Actions } from "./$types";
import type { AssembliesBuylistsResponseExpanded } from "../+page.server";

import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {

    const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(params.id, { expand: "assembly,project"});
    const storeRelations = await locals.pb.collection(Collections.StoresRelations).getFullList({ filter: `store = "${list.store}"`});

    const flattenAssemblyResult = await flattenAssembly(list.expand?.assembly, locals.pb);

    const suppliers = await locals.pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>({ filter: [...new Set(flattenAssemblyResult.map(k => k.article.supplier).flat())].map(k => `id = "${k}"`).join(" || ") });

    return {
        list: structuredClone(list),
        flattenAssemblyResult: structuredClone(flattenAssemblyResult),
        suppliers: structuredClone(suppliers),
        storeRelations: structuredClone(storeRelations)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request, params }) => {

        const form = await request.formData();
        const articleID = form.get("article")?.toString();
        const quantity = Number(form.get("quantity")?.toString());
        const buylist = form.get("buylist")?.toString();
        let storeToUse = form.get('store')?.toString();

        try
        {
            if(articleID === undefined || quantity === undefined || buylist === undefined)
                throw "Invalid form data";

            const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponse>(params.id);
            const storeRelationLinkedList = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && store = "${list.store}"` });

            const deltaQuantity = quantity - (storeRelationLinkedList.at(0)?.quantity ?? 0);

            if(storeToUse === undefined)
            {
                if(deltaQuantity > 0)
                {
                    const storesToChooseFrom = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${articleID}" && quantity > 0 && store.temporary = false` });

                    if(storesToChooseFrom.length > 1)
                        return { buyListRelationEdit: { [articleID]: { storesToGetFrom: structuredClone(storesToChooseFrom) }}};
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
                    quantity_update: -deltaQuantity,
                    user: locals.user?.id,
                    store_in: selectedStore?.store,
                    store_out: list.store
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
                    store_in: list.store,
                    store_out: storeToUse
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

    generateOrder: async ({ locals, params, request }) => {
    
        const form = await request.formData();

        const supplier = form.get("supplier")?.toString();

        if(supplier === undefined)
            return;

        const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(params.id, { expand: "assembly,project" });
        const supplierResponse = await locals.pb.collection(Collections.Suppliers).getOne<SuppliersResponse>(supplier);
        const assemblyRows = await flattenAssembly(list.expand?.assembly, locals.pb);

        const orderRows: OrdersRowsRecord[] = [];

        for(const assemblyRow of assemblyRows.filter(k => k.article.supplier?.includes(supplier)))
        {
            const buyListRelation = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${assemblyRow.article.id}" && store = "${list.store}"` })).at(0);

            if((buyListRelation?.quantity ?? 0) >= assemblyRow.quantity)
                continue;

            orderRows.push({
                order: "",
                article: assemblyRow.article.id,
                quantity: assemblyRow.quantity - (buyListRelation?.quantity ?? 0),
                project: list.project,
            });
        }

        if(orderRows.length > 0)
        {
            const orderRecord = { 
                name: `Commande ${list.name} — ${supplierResponse.name}`,
                supplier: supplier,
                issuer: locals.user?.id,
                state: OrdersStateOptions.draft,
            } satisfies OrdersRecord;

            const order = await locals.pb.collection(Collections.Orders).create(orderRecord);
            orderRows.map(k => { return { ...k, order: order.id }});

            for(const orderRow of orderRows)
            {
                await locals.pb.collection(Collections.OrdersRows).create({ ...orderRow, order: order.id });
            }

            throw redirect(303, `/app/orders/${order.id}`);
        }
        else
        {
            return { generateOrder: { error: "Nothing to order with this supplier" }};
        }
    },

    generateFabOrders: async ({ locals, params, request }) => {

        let generatedFabOrder = 0;

        try
        {
            const internalSupplier = import.meta.env.VITE_INTERNAL_SUPPLIER as string | undefined;

            if(internalSupplier === undefined)
                throw "No internal supplier defined";

            const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(params.id, { expand: "assembly,project" });
            const assemblyRows = await flattenAssembly(list.expand?.assembly, locals.pb);

            for(const assemblyRow of assemblyRows.filter(k => k.article.supplier?.includes(internalSupplier)))
            {
                const buyListRelation = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${assemblyRow.article.id}" && store = "${list.store}"` })).at(0);
                const availableQuantity = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${assemblyRow.article.id}" && quantity > 0 && store.temporary = false`})).reduce((p, c) => p + c.quantity, 0);

                const deltaQuantity = assemblyRow.quantity - (buyListRelation?.quantity ?? 0) - availableQuantity;

                if(deltaQuantity <= 0)
                    continue;

                await locals.pb.collection(Collections.FabricationOrders).create({

                    article: assemblyRow.article.id,
                    quantity: deltaQuantity,
                    project: list.project,
                    receiver: locals.user?.id,
                    applicant: locals.user?.id,
                    start_date: new Date(),
                    end_date: new Date(),
                    state: FabricationOrdersStateOptions.asked

                } satisfies FabricationOrdersRecord);

                generatedFabOrder++;
            }
        }
        catch(ex)
        {
            console.log(ex);
            return { generateFabOrders: { error: (ex instanceof ClientResponseError) ? ex.message : ex }};
        }

        if(generatedFabOrder > 0)
            return redirect(303, `/app/fabrication_orders`);
        
        return { generateFabOrders: { warning: "Generated 0 fabrication orders" }};
    },

    editList: async ({ locals, request, params }) => {

        const form = await request.formData();
        form.set("closed", String(form.has("closed")));

        try
        {
            await locals.pb.collection(Collections.AssembliesBuylists).update(params.id, form);
            return { editList: { success: "Successfully updated row" }};
        }
        catch(e)
        {
            return { editList: { error: e.message }};
        }
    }
};