import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";

export const load = (async ({ params, locals }) => {

    const fabricationOrder = await locals.prisma.scm_fabrication_order.findUnique({ where: { id: params.id }, include: { askedBy: true, receiver: true, article: { include: articleIncludeQuery }}});
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
            await locals.prisma.scm_fabrication_order.update({ where: { id: params.id }, data: form });
        }
        catch(ex)
        {
            return { edit: { error: ex }};
        }

        return { edit: { success: "Successfully updated fabrication order" }};
    },
    completeFabOrder: async ({ params, locals, request }) => {

        const form = await request.formData();
        const storeIn = form.get("store_in")?.toString();

        try
        {
            if(storeIn === undefined) return fail(400, { completeFabOrder: { error: "Missing store_in", stores: await locals.prisma.scm_store.findMany({ where: { temporary: false }}) }});

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
            return { completeFabOrder: { error: ex }};
        }

        return { completeFabOrder: { success: "Successfully completed fabrication order" }};

    }
}