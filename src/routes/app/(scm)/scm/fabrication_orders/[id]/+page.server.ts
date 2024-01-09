import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { scm_fabrication_order_state } from "@prisma/client";

export const load = (async ({ params, locals }) => {

    const fabricationOrder = await locals.prisma.scm_fabrication_order.findUnique({ where: { id: params.id }, include: { askedBy: true, receiver: true, article: { include: articleIncludeQuery }}});

    if(fabricationOrder === null) return redirect(303, "/app/scm/fabrication_orders");

    const users = await locals.prisma.user.findMany();

    return { 
        fabricationOrder,
        users
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    deleteFabOrder: async ({ params, locals }) => {

        try
        {
            await locals.prisma.scm_fabrication_order.delete({ where: { id: params.id }});
        }
        catch(ex)
        {
            return { delete: { error: ex }};            
        }

        throw redirect(303, "/app/scm/fabrication_orders");
    },
    editFabOrder: async ({ params, locals, request }) => {
        try
        {
            const form = await request.formData();

            const receiverId = form.get("receiver")?.toString();
            const quantity = Number(form.get("quantity")?.toString());
            const endDate = form.get("end_date")?.toString();  
            const state = form.get("state")?.toString(); 
                        
            if(Number.isNaN(quantity)) return fail(400, { edit: { error: "Quantity is not a number" }});
            if(state === undefined || state === "" || !Object.keys(scm_fabrication_order_state).includes(state)) return fail(400, { edit: { error: "State is invalid" }});

            const { state: oldState } = await locals.prisma.scm_fabrication_order.findUniqueOrThrow({ where: { id: params.id }});

            await locals.prisma.scm_fabrication_order.update({ where: { id: params.id }, data: {
                receiver_id: receiverId === "" ? null : receiverId,
                quantity,
                end_date: endDate === "" || endDate === undefined ? null : new Date(endDate),
                state: (state as scm_fabrication_order_state)
            }});

            if(oldState !== state)
            {
                await locals.prisma.scm_fabrication_oder_state_change.create({ data: {
                    fabrication_order_id: params.id,
                    user_id: locals.session!.user.id,
                    state: state as scm_fabrication_order_state,
                }})
            }

        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { edit: { error: "Failed to update the fabrication order" }});
        }

        return { edit: { success: "Successfully updated fabrication order" }};
    },
    completeFabOrder: async ({ params, locals, request }) => {

        const form = await request.formData();
        let storeIn = form.get("store_in")?.toString();
        storeIn = storeIn === "" ? undefined : storeIn;

        const singleStorePolicy = await locals.prisma.scm_store.count({ where: { temporary: false }}) === 1;

        try
        {
            if(storeIn === undefined)
            {
                if(singleStorePolicy)
                    storeIn = (await locals.prisma.scm_store.findFirst({ where: { temporary: false }}))!.id;
                else
                    return fail(400, { completeFabOrder: { error: "scm.fabricration_order.complete.error.missing_store_in", stores: await locals.prisma.scm_store.findMany({ where: { temporary: false }}) }});
            }

            await locals.prisma.scm_fabrication_oder_state_change.create({ data: { fabrication_order_id: params.id, state: "completed", user_id: locals.session!.user.id }});
            const fabricationOrder = await locals.prisma.scm_fabrication_order.update({ where: { id: params.id }, data: { state: "completed" }});

            await locals.prisma.scm_article_movements.create({ data: { 
                article_id: fabricationOrder.article_id, 
                store_in_id: storeIn, 
                quantity_update: fabricationOrder.quantity, 
                user_id: locals.session!.user.id }
            });

            await locals.prisma.scm_store_relation.upsert({ where: { article_id_store_id: { article_id: fabricationOrder.article_id, store_id: storeIn }}, create: { article_id: fabricationOrder.article_id, store_id: storeIn, quantity: fabricationOrder.quantity }, update: { quantity: { increment: fabricationOrder.quantity }}});

        }
        catch(ex)
        {
            console.error(ex);
            return fail(400, { completeFabOrder: { error: "Failed to complete fabrication order" }});
        }

        return { completeFabOrder: { success: "Successfully completed fabrication order" }};

    }
}