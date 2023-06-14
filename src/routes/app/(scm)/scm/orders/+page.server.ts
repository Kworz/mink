import { Collections, type ArticleResponse, type OrdersResponse, type OrdersRowsResponse, type ProjectsResponse, type UsersResponse, type SuppliersResponse } from "$lib/DBTypes";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { ClientResponseError } from "pocketbase";

import { env } from "$env/dynamic/public";

export type OrdersResponseExpanded = OrdersResponse<{
    issuer: UsersResponse,
    project: ProjectsResponse,
    'orders_rows(order)': Array<OrdersRowsResponse<{
        article: ArticleResponse
    }>>,
    'orders_total_price(order_ref)': [{ gross_price: number, net_price: number }],
    supplier: SuppliersResponse
}>;

export const load = (async ({ locals }) => {

    const orders = await locals.pb.collection(Collections.Orders).getFullList<OrdersResponseExpanded>({ expand: "issuer,orders_rows(order).article,supplier,orders_total_price(order_ref)", sort: "-created"});
    
    const suppliers = await locals.pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>();

    return {
        orders: structuredClone(orders),
        suppliers: structuredClone(suppliers)
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    createOrder: async ({ request, locals }) => {

        let createdOrder: OrdersResponse | undefined = undefined;

        try
        {
            const creationDate = new Date();

            const currentDayOrders = await locals.pb.collection(Collections.Orders).getFullList<OrdersResponseExpanded>({ filter: `created ~ "${creationDate.toISOString().split("T").at(0)}"`, sort: "-created" });
            const subId = `${currentDayOrders.length+1}-${creationDate.toISOString().split("T").at(0)?.replaceAll("-", "")}`;
            
            const form = await request.formData();

            form.set("sub_id", subId)

            form.set("state", "draft");
            form.set("issuer", locals.user!.id);
            form.set("vat", env.PUBLIC_DEFAULT_VAT);

            createdOrder = await locals.pb.collection(Collections.Orders).create<OrdersResponse>(form);
        }
        catch(ex)
        {
            console.log(ex);
            return { create: { error: (ex instanceof ClientResponseError) ? ex.message : ex }};
        }
        throw redirect(303, `/app/scm/orders/${createdOrder.id}`);
    }
}