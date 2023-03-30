import { Collections, type ArticleMovementsRecord, AssembliesBuylistsRowsResponse, type OrdersRowsRecord, type OrdersRecord, OrdersStateOptions, SuppliersResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad, Actions } from "./$types";
import type { AssembliesBuylistsResponseExpanded } from "../+page.server";

import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {

    const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(params.id, { expand: "assembly,project"});
    const listItems = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFullList({ filter: `buylist = "${list.id}"`});
    const flattenAssemblyResult = await flattenAssembly(list.expand?.assembly, locals.pb);

    const suppliers = await locals.pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>({ filter: [...new Set(flattenAssemblyResult.map(k => k.article.supplier).flat())].map(k => `id = "${k}"`).join(" || ") });

    return {
        list: structuredClone(list),
        listItems: structuredClone(listItems), 
        flattenAssemblyResult: structuredClone(flattenAssemblyResult),
        suppliers: structuredClone(suppliers),
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request, params }) => {

        const form = await request.formData();
        const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne(params.id);

        try
        {
            const articleID = form.get("article")?.toString();
            const quantity = Number(form.get("quantity")?.toString());
            const buylist = form.get("buylist")?.toString();

            if(articleID === undefined || quantity === undefined || buylist === undefined)
                throw "Invalid form data";

            const article = await locals.pb.collection(Collections.Article).getOne(articleID);

            if(article.quantity < quantity)
                throw "Buy list affectation quantity is higher than article quantity";

            const buyListRelation = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFirstListItem(`article = "${articleID}" && buylist = "${buylist}"`);

            const articleMovement: ArticleMovementsRecord = {
                article: articleID,
                quantity_update: -(quantity - buyListRelation.quantity),
                user: locals.user?.id,
                reason: `${(quantity - buyListRelation.quantity) < 0 ? "Retour de " : "Affectation à"} ${list.name}`
            };

            await locals.pb.collection(Collections.AssembliesBuylistsRows).update(buyListRelation.id, { quantity: quantity });
            await locals.pb.collection(Collections.Article).update(articleID, { "quantity-": (quantity - buyListRelation.quantity)})
            await locals.pb.collection(Collections.ArticleMovements).create(articleMovement);
        }
        catch(ex)
        {
            if(ex instanceof ClientResponseError)
            {
                try
                {
                    const articleID = form.get("article")?.toString();
                    const quantity = Number(form.get("quantity")?.toString());
                    const buylist = form.get("buylist")?.toString();

                    if(articleID === undefined || quantity === undefined || buylist === undefined)
                        throw "Invalid form data";
                    
                    const article = await locals.pb.collection(Collections.Article).getOne(articleID);

                    if(article.quantity < quantity)
                        throw "Buy list affectation quantity is higher than article quantity";

                    const articleMovement: ArticleMovementsRecord = {
                        article: articleID,
                        quantity_update: -quantity,
                        user: locals.user?.id,
                        reason: `Affectation à ${list.name}`
                    };

                    await locals.pb.collection(Collections.AssembliesBuylistsRows).create({ article: form.get("article"), buylist: form.get("buylist"), quantity: form.get("quantity") });
                    await locals.pb.collection(Collections.ArticleMovements).create(articleMovement);
                    await locals.pb.collection(Collections.Article).update(articleID, { "quantity-": quantity });
                }
                catch(ex)
                {
                    return { buyListRelationEdit: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}
                }
            }
            else
                return { buyListRelationEdit: { [`${form.get("article")?.toString() ?? "all"}`]: { error: ex }}}

        }
        return { buyListRelationEdit: { success: "Successfully Created/updated row row" }};
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
            let buyListRelation: AssembliesBuylistsRowsResponse | undefined = undefined;

            try
            {
                buyListRelation = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFirstListItem<AssembliesBuylistsRowsResponse>(`article = "${assemblyRow.article}" && buylist = "${list.id}"`);
            }
            catch(ex) { null;}

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
            const orderRecord: OrdersRecord = { 
                "name": `Commande ${list.name} — ${supplierResponse.name}`,
                "supplier": supplier,
                "issuer": locals.user?.id,
                "state": OrdersStateOptions.draft
            };

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
    }
};