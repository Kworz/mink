import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load = (async ({ locals}) => {

    const order_rows = await locals.prisma.scm_order_rows.findMany(
        { 
            where: { 
                order: { state: { in: ["acknowledged", "ordered"] }},
                received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity }
            }, 
            include: { article: { include: { order_rows: { include: { order: true }}, store_relations: { include: { store: true }}}}, order: { include: { supplier: true }}}
        });
    const suppliers = await locals.prisma.scm_supplier.findMany();
    const stores = await locals.prisma.scm_store.findMany();

    return {
        order_rows,
        suppliers,
        stores
    }
}) satisfies PageServerLoad;

export const actions: Actions = {

    receiveArticle: async ({ request, locals }) => {

        try {
            const form = await request.formData();

            const order_row = form.get("order_row")?.toString();
            const articleID = form.get("article")?.toString();
            const quantity_received = Number(form.get("received_quantity")?.toString());

            const store_in = form.get("store_in")?.toString();

            if(order_row ===  undefined)
                throw "scm.order_row.receive.error.order_row_undefined";

            if(articleID === undefined)
                throw "scm.order_row.receive.error.article_undefined";
            
            if(quantity_received === undefined)
                throw "scm.order_row.receive.error.quantity_received_undefined";

            if(locals.session === null)
                throw "app.user.error.no_auth";

            if(store_in === undefined)
                throw "scm.order_row.receive.error.store_in_undefined";

            await locals.prisma.scm_store_relation.upsert({
                where: { article_id_store_id: { article_id: articleID, store_id: store_in } },
                create: {
                    store_id: store_in,
                    article_id: articleID,
                    quantity: quantity_received
                },
                update: {
                    quantity: { increment: quantity_received }
                }
            });

            await locals.prisma.scm_article_movements.create({
                data: {
                    article_id: articleID,
                    quantity_update: quantity_received,
                    user_id: locals.session.user.userId,
                    store_in_id: store_in,
                }
            });

            const order_row_prisma = await locals.prisma.scm_order_rows.update({
                where: { id: order_row },
                data: {
                    received_quantity: { increment: quantity_received }
                }
            });

            const incompleteOrderRows = await locals.prisma.scm_order_rows.findMany({ where: { order_id: { equals: order_row_prisma.order_id }, received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity  }}});

            if(incompleteOrderRows.length === 0)
                await locals.prisma.scm_order.update({ where: { id: order_row_prisma.order_id }, data: { state: "completed" }});

            return { receiveArticle: { success: "scm.order_row.receive.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { receiveArticle: { error: "scm.order_row.receive.error.generic" }});
        }
    }
};