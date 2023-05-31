import { Collections, type ProjectsResponse } from "$lib/DBTypes";
import type { OrderRowsResponseExpanded } from "../../approx/proxy+page.server";
import type { FabricationOrdersResponseExpanded } from "../../fabrication_orders/+page.server";
import type { PageServerLoad, Actions } from "./$types";

export const load = (async ({ locals, params }) => {

    const projectID = params.id;

    const project = await locals.pb.collection(Collections.Projects).getOne<ProjectsResponse>(projectID);
    const order_rows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ filter: `project = "${projectID}"`, expand: 'order,article' });
    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ filter: `project="${projectID}"`, expand: 'article,applicant,receiver'});

    return {
        project: structuredClone(project),
        order_rows: structuredClone(order_rows),
        fabricationOrders: structuredClone(fabricationOrders),
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    editProject: async ({ locals, params, request }) => {

        const form = await request.formData();

        form.set('closed', String(form.has('closed')));

        try
        {
            await locals.pb.collection(Collections.Projects).update(params.id, form);
        }
        catch(e)
        {
            return { editProject: { error: e.message }};
        }

    }

}