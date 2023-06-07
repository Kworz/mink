import { Collections, type ArticleMovementsRecord, type OrdersRowsResponse, type OrdersResponse, type SuppliersResponse, type ListResponse, OrdersStateOptions, StoresResponse, type StoresRelationsResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import type { Actions, PageServerLoad } from "./$types";
import type { ArticleResponseExpanded } from "$lib/components/article/ArticleRow.svelte";

export type OrderRowsResponseExpanded = OrdersRowsResponse<{ article: ArticleResponseExpanded, order: OrdersResponse<{ supplier: SuppliersResponse}> }>;

export type ListResponseCompleteExpand = ListResponse;

export const load = (async ({ locals}) => {

    const order_rows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ expand: "article.supplier,order.supplier,article.article_fabrication_quantity(article),article.article_order_quantity(article),article.article_store_quantity(article),article.article_price(article)", filter: `(order.state = "placed" || order.state = "acknowledged") && quantity != quantity_received`});
    const suppliers = await locals.pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>();
    const stores = await locals.pb.collection(Collections.Stores).getFullList<StoresResponse>();

    return {
        order_rows: structuredClone(order_rows),
        suppliers: structuredClone(suppliers),
        stores: structuredClone(stores)
    }
}) satisfies PageServerLoad;

export const actions: Actions = {

    receiveArticle: async ({ request, locals }) => {

        try {

            const form = await request.formData();

            const order_row = form.get("order_row")?.toString();
            const articleID = form.get("article")?.toString();
            const quantity_received = Number(form.get("received_quantity")?.toString());

            const store_in = form.get("store_in")?.toString();

            if(order_row ===  undefined)
                throw "Order row id is null";

            if(articleID === undefined)
                throw "Article ID is null";
            
            if(quantity_received === undefined)
                throw "Quantity received is null";

            if(locals.user === undefined || locals.user === null)
                throw "User not logged in";

            if(store_in === undefined)
                throw "Le stock de destination n'est pas défini";

            const storeInRecord = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `store = "${store_in}" && article = "${articleID}"`})).at(0);

            if(storeInRecord === undefined)
                await locals.pb.collection(Collections.StoresRelations).create({ store: store_in, article: articleID, quantity: quantity_received });
            else
                await locals.pb.collection(Collections.StoresRelations).update(storeInRecord.id, { "quantity+": quantity_received });
            
            await locals.pb.collection(Collections.ArticleMovements).create({
                article: articleID,
                quantity_update: quantity_received,
                user: locals.user.id,
                store_in,
            } satisfies ArticleMovementsRecord);

            const order_row2 = await locals.pb.collection(Collections.OrdersRows).update<OrdersRowsResponse<{order: OrdersResponse}>>(order_row, {
                "quantity_received+": quantity_received
            }, { expand: "order"});  

            const orderRowsIncomplete = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ expand: "article.supplier,order.supplier", filter: `(order.state = "placed" || order.state = "acknowledged") && order = "${order_row2.order}" && quantity > quantity_received`});
            
            if(orderRowsIncomplete.length === 0)
                await locals.pb.collection(Collections.Orders).update(order_row2.order, { state: OrdersStateOptions.completed });

            return { receiveArticle: { success: true }};
        }
        catch(ex)
        {
            console.log(ex);
            return { receiveArticle: { error: (ex instanceof ClientResponseError) ? ex.message : ex }};
        }
    }
};