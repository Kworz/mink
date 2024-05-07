import { articleIncludeQuery } from "$lib/components/derived/article/article";
import Prisma, { type scm_order_state } from "@prisma/client";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { validatePermission } from "$lib/permission";

export const load = (async ({ params, locals, url }) => {

    const articleFilter = url.searchParams.has("articleFilter") ? JSON.parse(decodeURIComponent(url.searchParams.get("articleFilter") as string)) : undefined;

    const order = await locals.prisma.scm_order.findUniqueOrThrow({ where: { id: params.id }, include: { order_rows: { orderBy: { created: "asc" }, include: { article: true, project: true }}, text_rows: { orderBy: { created: "asc" }, include: { project: true }}, supplier: true, issuer: true }});

    /// — Secondary data
    const projects = await locals.prisma.pr_project.findMany({ where: { closed: false }})
    const articles = await locals.prisma.scm_article.findMany({ include: articleIncludeQuery, where: articleFilter, take: 15 });
    const orderFiles = await locals.s3.send(new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_NAME as string,
        Prefix: `scm/orders/${params.id}/`
    }));

    return {
        order,
        projects,
        articles,
        orderFiles: orderFiles.Contents || []
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    /** Update order with the specified body */
    editOrder: async ({ params, request, locals }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { editOrder: { error: "errors.permission.u" }});

        try
        {
            const form = await request.formData();

            const name = form.has("name") ? form.get("name")?.toString() : undefined
            const state = form.has("state") ? (form.get("state")?.toString()) : undefined;
            const deliveryFees = form.has("delivery_fees") ? Number(form.get("delivery_fees")) : undefined
            const vat = form.has("vat") ? Number(form.get("vat")) : undefined;

            if(state !== undefined && !Object.values(Prisma.scm_order_state).includes(state as any))
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

    /** Create an order Row with a linked article  */
    createArticleOrderRow: async ({ request, locals, params }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { createArticleOrderRow: { error: "errors.permission.u" }});

        try
        {
            const form = await request.formData();

            const articleId = form.get("article_id")?.toString();
            const neededQuantity = Number(form.get("needed_quantity"));

            if(articleId === undefined || articleId.length === 0)
                return fail(400, { createArticleOrderRow: { error: "errors.scm.order.create_order_row.article_id_invalid" }});

            if(Number.isNaN(neededQuantity) || neededQuantity <= 0)
                return fail(400, { createArticleOrderRow: { error: "errors.scm.order.create_order_row.needed_quantity_invalid" }});

            await locals.prisma.scm_order_rows.create({
                data: {
                    order_id: params.id,
                    article_id: articleId,
                    needed_quantity: neededQuantity,
                }
            });

            return { createArticleOrderRow: { success: true }};
        }
        catch(ex)
        {
            console.log(ex);
            return { createArticleOrderRow: { error: "errors.scm.order.create_order_row.failed" }};
        }
    },

    /** Create an order row with text instead of an article */
    createTextOrderRow: async ({ request, locals, params }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { createTextOrderRow: { error: "errors.permission.u" }});

        try
        {
            const form = await request.formData();

            const text = form.get("text")?.toString();
            const neededQuantity = Number(form.get("needed_quantity"));

            if(Number.isNaN(neededQuantity) || neededQuantity <= 0)
                return fail(400, { createTextOrderRow: { error: "errors.scm.order.create_order_row.needed_quantity_invalid" }});

            await locals.prisma.scm_order_text_rows.create({
                data: {
                    order_id: params.id,
                    text: text || "",
                    needed_quantity: neededQuantity,
                }
            });

            return { createTextOrderRow: { success: true }};
        }
        catch(ex)
        {
            console.log(ex);
            return { createTextOrderRow: { error: "errors.scm.order.create_order_row.failed" }};
        }
    },

    /** Update an article order row */
    editArticleOrderRow: async ({ request, locals }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { editArticleOrderRow: { error: "errors.permission.u" }});

        try
        {
            const form = await request.formData();
            let rowsId: string[] | string | undefined = form.get("id")?.toString();

            if(rowsId !== undefined)
                rowsId = rowsId.split(',');
            else
                return fail(400, { editArticleOrderRow: { error: "errors.scm.order.edit_order_row.row_id_not_found" }});

            const neededQuantity = form.has("needed_quantity") ? Number(form.get("needed_quantity")) : undefined;
            const ackPrice = form.has("ack_price") ? Number(form.get("ack_price")) : undefined;
            const ackDate = form.has("ack_date") ? form.get("ack_date")?.toString() : undefined;

            const { count } = await locals.prisma.scm_order_rows.updateMany({ where: { id: { in: rowsId }}, data: {
                needed_quantity: neededQuantity,
                ack_price: ackPrice,
                ack_date: ackDate,
            }});

            if(count !== rowsId.length)
                return fail(400, { editArticleOrderRow: { error: "errors.scm.order.edit_order_row.failed" }});

            return { editArticleOrderRow: { success: "scm.order.edit_row.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { editArticleOrderRow: { error: "errors.scm.order.edit_order_row.failed" }});
        }
    },

    /** 
     * Delete one or many article order rows
     * @info Nearly identical to deleteTextOrderRows
     */
    deleteArticleOrderRows: async ({ request, locals }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { deleteArticleOrderRows: { error: "errors.permission.u" }});

        const form = await request.formData();
        let orderRowsIds: string | string[] | undefined = form.get("id")?.toString();

        if(orderRowsIds === undefined || orderRowsIds.length === 0) 
            return fail(400, { deleteArticleOrderRows: { error: "errors.scm.order.delete_rows.row_id_undefined" }});

        orderRowsIds = orderRowsIds.split(',');

        const { count } = await locals.prisma.scm_order_rows.deleteMany({ where: { id: { in: orderRowsIds }}});

        if(count !== orderRowsIds.length)
            return fail(400, { deleteArticleOrderRows: { error: "errors.scm.order.delete_rows.failed" }});

        return { deleteArticleOrderRows: { success: true }};
    },

    /** 
     * Delete one or many text order rows
     * @info Nearly identical to deleteArticleOrderRows
     */
    deleteTextOrderRows: async ({ request, locals }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { deleteTextOrderRows: { error: "errors.permission.u" }});

        const form = await request.formData();
        let orderRowsIds: string | string[] | undefined = form.get("id")?.toString();

        if(orderRowsIds === undefined || orderRowsIds.length === 0) 
            return fail(400, { deleteTextOrderRows: { error: "errors.scm.order.delete_rows.row_id_undefined" }});

        orderRowsIds = orderRowsIds.split(',');

        const { count } = await locals.prisma.scm_order_text_rows.deleteMany({ where: { id: { in: orderRowsIds }}});

        if(count !== orderRowsIds.length)
            return fail(400, { deleteTextOrderRows: { error: "errors.scm.order.delete_rows.failed" }});

        return { deleteTextOrderRows: { success: true }};
    },

    /** Remove order */
    deleteOrder: async ({ params, locals }) => {

        if(!validatePermission(locals.user, "orders", "d"))
            return fail(403, { delete: { error: "errors.permission.d" }});

        try
        {
            await locals.prisma.scm_order.delete({ where: { id: params.id }});
        }
        catch(ex)
        {
            throw fail(400, { delete: { error :"scm.order.delete.error.generic" }});
        }
        throw redirect(302, "/app/scm/orders");
    },

    /** Add a linked file to this order */
    addLinkedFile: async ({ params, locals, request }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { addLinkedFile: { error: "errors.permission.u" }});

        const form = await request.formData();

        const file = form.get("file") as File;

        if(file === undefined)
            return fail(400, { addLinkedFile: { error: "errors.scm.order.add_linked_file.file_not_found" }});

        const uploadRequest = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: `scm/orders/${params.id}/${file.name}`,
            Body: file
        });

        const result = await locals.s3.send(uploadRequest);

        if(result.$metadata.httpStatusCode !== 200)
            return fail(500, { addLinkedFile: { error: "errors.scm.order.add_linked_file.failed" }});

        return { addLinkedFile: { success: true }};

    },

    /** Remove order linked file */
    removeLinkedFile: async ({ params, locals, request }) => {

        if(!validatePermission(locals.user, "orders", "u"))
            return fail(403, { removeLinkedFile: { error: "errors.permission.u" }});

        const form = await request.formData();
        const fileName = form.get("file") as string;

        if(fileName === undefined)
            return fail(400, { removeLinkedFile: { error: "errors.scm.order.remove_linked_file.file_not_found" }});

        const deleteRequest = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Prefix: `scm/orders/${params.id}/${fileName}`
        });

        const files = await locals.s3.send(deleteRequest);

        if(files.Contents === undefined || files.Contents.length === 0)
            return fail(404, { removeLinkedFile: { error: "errors.scm.order.remove_linked_file.file_not_found" }});

        const deleteFileRequest = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: `scm/orders/${params.id}/${fileName}`
        });

        const result = await locals.s3.send(deleteFileRequest);

        if(result.$metadata.httpStatusCode !== 200)
            return fail(500, { removeLinkedFile: { error: "errors.scm.order.remove_linked_file.failed" }});

        return { removeLinkedFile: { success: true }};
    }
}