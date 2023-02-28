import { Collections, type ArticleMovementsRecord, type OrdersRowsResponse, type OrdersResponse } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../articles/+page.server";
import type { Actions, PageServerLoad } from "./$types";

export type OrderRowsResponseExpanded = OrdersRowsResponse<{ article: ArticleResponseExpanded }>;

export const load = (async ({ locals}) => {

    const order_rows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ expand: "article.supplier", filter: `order.state = "placed" && quantity != quantity_received`});

    return {
        order_rows: structuredClone(order_rows)
    }
}) satisfies PageServerLoad;

export const actions: Actions = {

    receiveArticle: async ({ request, locals }) => {

        try {

            const form = await request.formData();

            const order_row = form.get("order_row")
            const articleID = form.get("article");
            const quantity_received = form.get("received_quantity");

            if(order_row === null)
                throw "Order row id is null";

            if(articleID === null)
                throw "Article ID is null";
            
            if(quantity_received === null)
                throw "Quantity received is null";

            if(locals.user === undefined || locals.user === null)
                throw "User not logged in";

            const order_rows = await locals.pb.collection(Collections.OrdersRows).update<OrdersRowsResponse<{order: OrdersResponse}>>(order_row.toString(), {
                "quantity_received+": quantity_received.toString()
            }, { expand: "order"});

            await locals.pb.collection(Collections.Article).update(articleID.toString(), { "quantity+": quantity_received.toString()});
            
            const movement: ArticleMovementsRecord = {
                article: articleID.toString(),
                quantity_update: Number(quantity_received.toString()),
                user: locals.user.id,
                reason: `Réception commande ${order_rows.expand?.order.name}`
            };

            await locals.pb.collection(Collections.ArticleMovements).create(movement);
        }
        catch(ex)
        {
            console.log(ex);
            return { receiveArticle: { error: ex }};
        }
    }
};