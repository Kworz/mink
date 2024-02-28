import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import Prisma, { type scm_manufacturing_order_state } from "@prisma/client";

export const load = (async ({ params, locals }) => {

    const manufacturingOrder = await locals.prisma.scm_manufacturing_order.findUnique({ where: { id: params.id }, include: { askedBy: true, receiver: true, article: { include: articleIncludeQuery }}});

    if(manufacturingOrder === null) return redirect(303, "/app/scm/manufacturing_orders");

    const users = await locals.prisma.user.findMany();

    return { 
        manufacturingOrder,
        users
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    deleteManufacturingOrder: async ({ params, locals }) => {

        try
        {
            await locals.prisma.scm_manufacturing_order.delete({ where: { id: params.id }});
        }
        catch(ex)
        {
            return { deleteManufacturingOrder: { error: ex }};            
        }

        throw redirect(303, "/app/scm/manufacturing_orders");
    },
    editManufacturingOrder: async ({ params, locals, request }) => {
        try
        {
            const form = await request.formData();

            const receiverId = form.get("receiver")?.toString();
            const quantity = Number(form.get("quantity")?.toString());
            const endDate = form.get("end_date")?.toString();  
            const state = form.get("state")?.toString(); 
                        
            if(Number.isNaN(quantity)) return fail(400, { editManufacturingOrder: { error: "error.manufacturing_order.edit.quantity_invalid" }});
            if(state === undefined || state === "" || !Object.keys(Prisma.scm_manufacturing_order_state).includes(state)) return fail(400, { editManufacturingOrder: { error: "error.manufacturing_order.edit.state_invalid" }});

            const { state: oldState } = await locals.prisma.scm_manufacturing_order.findUniqueOrThrow({ where: { id: params.id }});

            await locals.prisma.scm_manufacturing_order.update({ where: { id: params.id }, data: {
                receiver_id: receiverId === "" ? null : receiverId,
                quantity,
                end_date: endDate === "" || endDate === undefined ? null : new Date(endDate),
                state: (state as scm_manufacturing_order_state)
            }});

            if(oldState !== state)
            {
                await locals.prisma.scm_manufacturing_oder_state_change.create({ data: {
                    manufacturing_order_id: params.id,
                    user_id: locals.user!.id,
                    state: state as scm_manufacturing_order_state,
                }})
            }

        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { editManufacturingOrder: { error: "error.scm.manufacturing_order.edit.failed" }});
        }

        return { edit: { success: true }};
    },
    completeManufacturingOrder: async ({ params, locals, request }) => {

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
                    return fail(400, { completeManufacturingOrder: { error: "error.scm.manufacturing_order.complete.missing_store_in", stores: await locals.prisma.scm_store.findMany({ where: { temporary: false }}) }});
            }

            await locals.prisma.scm_manufacturing_oder_state_change.create({ data: { manufacturing_order_id: params.id, state: "completed", user_id: locals.user!.id }});
            const manufacturingOrder = await locals.prisma.scm_manufacturing_order.update({ where: { id: params.id }, data: { state: "completed" }});

            await locals.prisma.scm_article_movements.create({ data: { 
                article_id: manufacturingOrder.article_id, 
                store_in_id: storeIn, 
                quantity_update: manufacturingOrder.quantity, 
                user_id: locals.user!.id }
            });

            await locals.prisma.scm_store_relation.upsert({ 
                where: { article_id_store_id: { article_id: manufacturingOrder.article_id, store_id: storeIn }}, 
                create: { article_id: manufacturingOrder.article_id, store_id: storeIn, quantity: manufacturingOrder.quantity }, 
                update: { quantity: { increment: manufacturingOrder.quantity }}
            });

        }
        catch(ex)
        {
            console.error(ex);
            return fail(400, { completeManufacturingOrder: { error: "error.scm.manufacturing_order.complete.failed" }});
        }

        return { completeManufacturingOrder: { success: true }};

    }
}