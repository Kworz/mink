import { Collections, type ArticleResponse, type OrdersResponse, type OrdersRowsResponse, type ProjectsResponse, type UsersResponse, type SuppliersResponse } from "$lib/DBTypes";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export type OrdersResponseExpanded = OrdersResponse<{
    issuer: UsersResponse,
    project: ProjectsResponse,
    'orders_rows(order)': Array<OrdersRowsResponse<{
        article: ArticleResponse
    }>>,
    supplier: SuppliersResponse
}>;

export const load = (async ({ locals }) => {

    const orders = await locals.pb.collection(Collections.Orders).getFullList<OrdersResponseExpanded>({ expand: "issuer,orders_rows(order).article,supplier"});

    return {
        orders: structuredClone(orders)
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    createOrder: async ({ request, locals }) => {

        let createdOrder: OrdersResponse | undefined = undefined;

        try
        {
            const form = await request.formData();
            createdOrder = await locals.pb.collection(Collections.Orders).create<OrdersResponse>(form);
        }
        catch(ex)
        {
            console.log(ex);
            return { create: { error: ex }};
        }
        throw redirect(303, `/app/orders/${createdOrder.id}`);
    }
}