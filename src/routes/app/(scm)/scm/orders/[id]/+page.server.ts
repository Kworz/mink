import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { scm_order_state } from "@prisma/client";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ params, locals, url }) => {

    const articleFilter = url.searchParams.has("articleFilter") ? JSON.parse(atob(url.searchParams.get("articleFilter")!)) : undefined;

    const order = await locals.prisma.scm_order.findUniqueOrThrow({ where: { id: params.id }, include: { order_rows: { orderBy: { created: "asc" }, include: { article: true, project: true }}, supplier: true, issuer: true }});

    /// — Secondary data
    const projects = await locals.prisma.pr_project.findMany({ where: { closed: false }})
    const articles = await locals.prisma.scm_article.findMany({ include: articleIncludeQuery, where: articleFilter, take: 15 });

    return {
        order,
        projects,
        articles
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    editOrder: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();

            const name = form.has("name") ? form.get("name")?.toString() : undefined
            const state = form.has("state") ? (form.get("state")?.toString()) : undefined;
            const deliveryFees = form.has("delivery_fees") ? Number(form.get("delivery_fees")) : undefined
            const vat = form.has("vat") ? Number(form.get("vat")) : undefined;

            if(state !== undefined && !Object.values(scm_order_state).includes(state as any))
                return fail(400, { editOrder: { error: "errors.scm.order.edit_order.state_invalid" }});

            await locals.prisma.scm_order.update({ where: { id: params.id }, data: {
                name,
                state: state as scm_order_state,
                delivery_fees: deliveryFees,
                vat,
            }});

            return { editOrder: { success: true }};
        }
        catch(ex)
        {
            console.error(ex);
            return fail(500, { editOrder: { error: "errors.scm.order.edit_order.failed" }});
        }
    },
    createOrderRow: async ({ request, locals, params }) => {
        try
        {
            const form = await request.formData();

            const articleId = form.get("article_id")?.toString();
            const neededQuantity = Number(form.get("needed_quantity"));

            if(articleId === undefined || articleId.length === 0)
                return fail(400, { createOrderRow: { error: "errors.scm.order.create_order_row.article_id_invalid" }});

            if(Number.isNaN(neededQuantity) || neededQuantity <= 0)
                return fail(400, { createOrderRow: { error: "errors.scm.order.create_order_row.needed_quantity_invalid" }});

            await locals.prisma.scm_order_rows.create({
                data: {
                    order_id: params.id,
                    article_id: articleId,
                    needed_quantity: neededQuantity,
                }
            });

            return { createOrderRow: { success: true }};
        }
        catch(ex)
        {
            console.log(ex);
            return { createOrderRow: { error: "errors.scm.order.create_order_row.failed" }};
        }
    },
    editOrderRows: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();
            let rowsId: string[] | string | undefined = form.get("id")?.toString();

            if(rowsId !== undefined)
                rowsId = rowsId.split(',');
            else
                return fail(400, { editOrderRow: { error: "errors.scm.order.edit_order_row.row_id_not_found" }});

            const neededQuantity = form.has("needed_quantity") ? Number(form.get("needed_quantity")) : undefined;
            const ackPrice = form.has("ack_price") ? Number(form.get("ack_price")) : undefined;
            const ackDate = form.has("ack_date") ? form.get("ack_date")?.toString() : undefined;

            const { count } = await locals.prisma.scm_order_rows.updateMany({ where: { id: { in: rowsId }}, data: {
                needed_quantity: neededQuantity,
                ack_price: ackPrice,
                ack_date: ackDate,
            }});

            if(count !== rowsId.length)
                return fail(400, { editOrderRow: { error: "errors.scm.order.edit_order_row.failed" }});

            return { editOrderRow: { success: "scm.order.edit_row.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { editOrderRow: { error: "errors.scm.order.edit_order_row.failed" }});
        }
    },
    deleteOrderRows: async ({ request, locals }) => {
        const form = await request.formData();
            let orderRowsIds: string | string[] | undefined = form.get("id")?.toString();

            if(orderRowsIds === undefined || orderRowsIds.length === 0) 
                return fail(400, { deleteOrderRows: { error: "errors.scm.order.delete_rows.row_id_undefined" }});

            orderRowsIds = orderRowsIds.split(',');

            const { count } = await locals.prisma.scm_order_rows.deleteMany({ where: { id: { in: orderRowsIds }}});

            if(count !== orderRowsIds.length)
                return fail(400, { deleteOrderRows: { error: "errors.scm.order.delete_rows.failed" }});

            return { deleteOrderRows: { success: true }};
    },
    deleteOrder: async ({ params, locals }) => {
        try
        {
            await locals.prisma.scm_order.delete({ where: { id: params.id }});
        }
        catch(ex)
        {
            throw fail(400, { delete: { error :"scm.order.delete.error.generic" }});
        }
        throw redirect(302, "/app/scm/orders");
    }
}