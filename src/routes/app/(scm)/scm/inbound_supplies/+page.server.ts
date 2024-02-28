import type { Actions, PageServerLoad } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { fail } from "@sveltejs/kit";

export const load = (async ({ locals}) => {

    const orderRows = await locals.prisma.scm_order_rows.findMany(
        { 
            where: { 
                order: { state: { in: ["acknowledged", "sent"] }},
                received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity }
            }, 
            include: { article: { include: articleIncludeQuery }, order: true }
        });
    const suppliers = await locals.prisma.scm_supplier.findMany();
    const stores = await locals.prisma.scm_store.findMany();

    return {
        orderRows,
        suppliers,
        stores
    }
}) satisfies PageServerLoad;

export const actions: Actions = {

    receiveArticle: async ({ request, locals }) => {

        try {
            const form = await request.formData();

            const orderRow = form.get("order_row")?.toString();
            const articleId = form.get("article")?.toString();
            const quantityReceived = Number(form.get("received_quantity")?.toString());

            const storeInId = form.get("store_in")?.toString();

            if(orderRow ===  undefined)
                throw "scm.order_row.receive.error.order_row_undefined";

            if(articleId === undefined)
                throw "scm.order_row.receive.error.article_undefined";
            
            if(quantityReceived === undefined)
                throw "scm.order_row.receive.error.quantity_received_undefined";

            if(locals.session === null)
                throw "app.user.error.no_auth";

            if(storeInId === undefined)
                throw "scm.order_row.receive.error.store_in_undefined";

            await locals.prisma.scm_store_relation.upsert({
                where: { article_id_store_id: { article_id: articleId, store_id: storeInId } },
                create: {
                    store_id: storeInId,
                    article_id: articleId,
                    quantity: quantityReceived
                },
                update: {
                    quantity: { increment: quantityReceived }
                }
            });

            await locals.prisma.scm_article_movements.create({
                data: {
                    article_id: articleId,
                    quantity_update: quantityReceived,
                    user_id: locals.user!.id,
                    store_in_id: storeInId,
                }
            });

            const orderRowUpdated = await locals.prisma.scm_order_rows.update({
                where: { id: orderRow },
                data: {
                    received_quantity: { increment: quantityReceived }
                }
            });

            const incompleteOrderRows = await locals.prisma.scm_order_rows.findMany({ where: { order_id: { equals: orderRowUpdated.order_id }, received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity  }}});

            if(incompleteOrderRows.length === 0)
                await locals.prisma.scm_order.update({ where: { id: orderRowUpdated.order_id }, data: { state: "completed" }});

            return { receiveArticle: { success: "scm.order_row.receive.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { receiveArticle: { error: "scm.order_row.receive.error.generic" }});
        }
    }
};