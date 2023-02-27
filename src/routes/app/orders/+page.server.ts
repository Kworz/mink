import { Collections, type ArticleResponse, type OrdersResponse, type OrdersRowsResponse, type ProjectsResponse, type UsersResponse, type SuppliersResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export type OrdersResponseExpanded = OrdersResponse<{
    issuer: UsersResponse,
    project: ProjectsResponse,
    'orders_rows(order)': Array<OrdersRowsResponse<{
        article: ArticleResponse
    }>>,
    supplier: SuppliersResponse
}>;

export const load = (async ({ locals }) => {

    const orders = await locals.pb.collection(Collections.Orders).getFullList<OrdersResponseExpanded>({ expand: "issuer,project,orders_rows(order).article,supplier"});

    return {
        orders: structuredClone(orders)
    };

}) satisfies PageServerLoad;