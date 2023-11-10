import { Collections } from "$lib/DBTypes";
import type { SCMOrder, SCMOrderRows } from "@prisma/client";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ params, locals }) => {

    const order = await locals.prisma.sCMOrder.findUniqueOrThrow({ where: { id: params.id }, include: { order_rows: { include: { article: true, project: true }}, supplier: true, issuer: true }});
    const projects = await locals.prisma.sCMProject.findMany({ where: { closed: false }})

    const articles = await locals.prisma.sCMArticle.findMany({ include: { store_relations: { include: { store: true }}, order_rows: { include: { order: true }} }});

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
            await locals.prisma.sCMOrder.update({ where: { id: params.id }, data: {
                name: form.has("name") ? form.get("name")?.toString() : undefined,
                state: form.has("state") ? form.get("state")?.toString() : undefined,
                delivery_fees: form.has("delivery_fees") ? Number(form.get("delivery_fees")) : undefined,
                vat: form.has("vat") ? Number(form.get("vat")) : undefined,
            } });

            return { edit: { success: "scm.order.update.success" }};
        }
        catch(ex)
        {
            return { edit: { error: ex }};
        }
    },
    editOrderRow: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();
            const row_id = form.get("id")?.toString();

            if(row_id === undefined)
                throw "scm.order.edit_row.error.row_id_not_found";

            await locals.prisma.sCMOrderRows.update({ where: { id: row_id }, data: {
                needed_quantity: form.has("needed_quantity") ? Number(form.get("needed_quantity")) : undefined,
                ack_price: form.has("ack_price") ? Number(form.get("ack_price")) : undefined,
                ack_date: form.has("ack_date") ? new Date(form.get("ack_date")?.toString() ?? new Date().toISOString()) : undefined,
            } });

            return { editRow: { success: "scm.order.edit_row.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { editRow: { error: "scm.order.edit_row.error.generic" }};
        }
    },

    createOrderRow: async ({ request, locals, params }) => {
        try
        {
            const form = await request.formData();
            console.log(form);

            await locals.prisma.sCMOrderRows.create({
                data: {
                    order_id: params.id,
                    article_id: form.get("article_id")?.toString(),
                    needed_quantity: Number(form.get("needed_quantity")),
                }
            })

            return { createRow: { success: "scm.order.create_row.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { createRow: { error: "scm.order.create_row.error.generic" }};
        }
    },

    deleteOrderRow: async ({ request, locals }) => {
        try {
            const form = await request.formData();
            const row_id = form.get("id")?.toString();

            if(row_id === undefined) 
                throw "scm.order.delete_row.error.row_id_undefined";

            await locals.prisma.sCMOrderRows.delete({ where: { id: row_id }});

            return { deleteRow: { success: "scm.order.delete_row.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { deleteRow: { error: "scm.order.delete_row.error.generic" }};
        }
    },

    deleteOrder: async ({ params, locals }) => {
        try
        {
            await locals.prisma.sCMOrder.delete({ where: { id: params.id }});
        }
        catch(ex)
        {
            throw fail(400, { delete: { error :"scm.order.delete.error.generic" }});
        }
        throw redirect(302, "/app/scm/orders");
    }
}