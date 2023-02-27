import { Collections, type ListResponse, type ProjectsResponse } from "$lib/DBTypes";
import type { FabricationOrdersResponseExpanded } from "../../fabrication_orders/+page.server";
import type { OrdersResponseExpanded } from "../../orders/+page.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {

    const projectID = params.id;

    const project = await locals.pb.collection(Collections.Projects).getOne<ProjectsResponse>(projectID);
    const lists = await locals.pb.collection(Collections.List).getFullList<ListResponse>({ filter: `project="${projectID}"`});
    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ filter: `project="${projectID}"`, expand: 'article,applicant,receiver'});
    const orders = await locals.pb.collection(Collections.Orders).getFullList<OrdersResponseExpanded>({filter: `project="${projectID}"`, expand: "issuer,project,orders_rows(order).article"});

    return {
        project: structuredClone(project),
        lists: structuredClone(lists),
        fabricationOrders: structuredClone(fabricationOrders),
        orders: structuredClone(orders)
    }

}) satisfies PageServerLoad;