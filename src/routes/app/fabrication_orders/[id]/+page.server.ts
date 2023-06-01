import { Collections, type ArticleMovementsRecord, type StoresResponse, type UsersResponse, type FabricationOrdersResponse } from "$lib/DBTypes";
import { redirect } from "@sveltejs/kit";
import type { FabricationOrdersResponseExpanded } from "../+page.server";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {

    const fabricationOrder = await locals.pb.collection(Collections.FabricationOrders).getOne<FabricationOrdersResponseExpanded>(params.id, { expand: "article,applicant,receiver" });
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
    },
    completeFabOrder: async ({ params, locals, request }) => {

        const form = await request.formData();
        const store_in = form.get("store_in")?.toString();

        try
        {
            if(store_in === undefined)
                return { completeFabOrder: { stores: structuredClone(await locals.pb.collection(Collections.Stores).getFullList<StoresResponse>()) }};

            const fabOrder = await locals.pb.collection(Collections.FabricationOrders).update<FabricationOrdersResponse>(params.id, { state: "completed" });
            
            await locals.pb.collection(Collections.ArticleMovements).create({

                article: fabOrder.article,
                store_in,
                store_out: "",
                quantity_update: fabOrder.quantity,
                user: locals.user.id

            } satisfies ArticleMovementsRecord);

            const storeRelations = await locals.pb.collection(Collections.StoresRelations).getFullList({ filter: `store = "${store_in}" && article = "${fabOrder.article}"` });

            if(storeRelations.length === 0)
                await locals.pb.collection(Collections.StoresRelations).create({ store: store_in, article: fabOrder.article, quantity: fabOrder.quantity });
            else
                await locals.pb.collection(Collections.StoresRelations).update(storeRelations[0].id, { "quantity+": fabOrder.quantity });

        }
        catch(ex)
        {
            return { completeFabOrder: { error: ex }};
        }

        return { completeFabOrder: { success: "Successfully completed fabrication order" }};

    }
}