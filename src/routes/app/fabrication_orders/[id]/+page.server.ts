import { Collections, type UsersResponse } from "$lib/DBTypes";
import { redirect } from "@sveltejs/kit";
import type { FabricationOrdersResponseExpanded } from "../+page.server";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {

    const fabricationOrder = await locals.pb.collection(Collections.FabricationOrders).getOne<FabricationOrdersResponseExpanded>(params.id, { expand: "article,applicant,receiver"});
    const users = await locals.pb.collection(Collections.Users).getFullList<UsersResponse>();

    return {
        fabricationOrder: structuredClone(fabricationOrder),
        users: structuredClone(users)
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    deleteFabOrder: async ({ params, locals }) => {
        try
        {
            await locals.pb.collection(Collections.FabricationOrders).delete(params.id);
        }
        catch(ex)
        {
            return { delete: { error: ex }};            
        }

        throw redirect(303, "/app/fabrication_orders");
    },
    editFabOrder: async ({ params, locals, request }) => {
        try
        {
            const form = await request.formData();
            await locals.pb.collection(Collections.FabricationOrders).update(params.id, form);
        }
        catch(ex)
        {
            return { edit: { error: ex }};
        }

        return { edit: { success: "Successfully updated fabrication order" }};
    }
}