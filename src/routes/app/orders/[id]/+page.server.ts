import { Collections } from "$lib/DBTypes";
import type { OrdersResponseExpanded } from "../+page.server";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {

    const order = await locals.pb.collection(Collections.Orders).getOne<OrdersResponseExpanded>(params.id, { expand: "issuer,project,orders_rows(order).article,supplier" });

    return {
        order: structuredClone(order)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    editOrder: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();
            await locals.pb.collection(Collections.Orders).update(params.id, form);

            return { edit: { success: "Successfully updated order "}};
        }
        catch(ex)
        {
            return { edit: { error: ex }};
        }
    }
}