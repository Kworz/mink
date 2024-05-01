import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { unit_of_work } from "@prisma/client";
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

export const load = (async ({ params, locals }) => {

    try
    {
        const articleID = params.id;

        const article = await locals.prisma.scm_article.findFirstOrThrow({ 
            where: { id: articleID },
            include: articleIncludeQuery
        });

        const fileRequest = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME as string,
            "Prefix": `scm/article/${articleID}/`
        });

        const fileResult = await locals.s3.send(fileRequest);

        const stores = await locals.prisma.scm_store.findMany({ where: { assemblies_buylist: { is: null }}});

        return {
            article,
            stores,
            files: fileResult.Contents || []
        }
    }
    catch(ex) 
    {
        console.log(ex);
        throw redirect(303, "/app/scm/articles");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    deleteArticle: async ({ params, locals, request }) => {

        const form = await request.formData();
        const force = form.has("force") && form.get("force") === "true";

        try
        {
            if(!force)
            {
                // fetch all relations and check if there are any dependents
                const storeRelations = await locals.prisma.scm_store_relation.findMany({ where: { article_id: params.id, quantity: { gt: 0} }, include: { store: true }});
                const orders = await locals.prisma.scm_order.findMany({ where: { order_rows: { some: { article_id: params.id }}}});
                const assembliesWithArticle = await locals.prisma.scm_assembly.findMany({ where: { article_childrens: { some: { article_child_id: params.id}}}});
                const articleMovements = await locals.prisma.scm_article_movements.count({ where: { article_id: params.id }});

                return fail(400, { deleteArticle: { error: "errors.scm.article.delete.has-dependents", storeRelations, orders, articleMovements, assembliesWithArticle }});
            }

            await locals.prisma.scm_article.delete({
                where: {
                    id: params.id
                }
            });

            return redirect(303, "/app/scm/articles");
        }
        catch(ex)
        {
            console.error(ex);
            return { deleteArticle: { error: "errors.generic" }};
        }
    },
    
    editArticle: async ({ params, request, locals }) => {
        try
        {
            //TODO: typecheck form data

            const form = await request.formData();

            const orderQuantity = Number(form.get("order_quantity")?.toString());
            const criticalQuantity = Number(form.get("critical_quantity")?.toString());
            const unitQuantity = Number(form.get("unit_quantity")?.toString());

            await locals.prisma.scm_article.update({
                where: {
                    id: params.id
                },
                data: {

                    name: form.get("name")?.toString(),
                    reference: form.get("reference")?.toString(),
                    brand: form.get("brand")?.toString(),

                    consumable: form.has("consumable"),
                    non_physical: form.has("non_physical"),
                    internal: form.has("internal"),

                    order_quantity: orderQuantity ? orderQuantity : undefined,
                    critical_quantity: criticalQuantity ? criticalQuantity : undefined,

                    unit: form.get("unit")?.toString() as unit_of_work,
                    unit_quantity: unitQuantity ? unitQuantity : undefined

                }
            });

            return { edit: { success: "Updated object successfully" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { edit: { error: "Failed to update object" }};
        }
    },

    copyArticle: async ({ params, locals }) => {

        try
        {
            const article = await locals.prisma.scm_article.findFirstOrThrow({ where: { id: params.id }});

            article.name = article.name + " — Copie"; //TODO: i18n

            const { id } = await locals.prisma.scm_article.create({
                data: {...article, id: undefined, thumbnail: undefined }
            });

            return redirect(303, `/app/scm/articles/${id}`);
        }
        catch(ex)
        {
            console.log(ex);
            return { copyArticle: { error: "errors.generic" }};
        }
    },

    updateStock: async ({ locals, params, request }) => {

        if(locals.session === null)
            return fail(403, { updateStock: { error: "generic.unauthed" }});

        const form = await request.formData();

        try
        {
            const direction = form.get("direction")?.toString();

            const storeInID = form.get("store_in")?.toString();
            const storeOutID = form.get("store_out")?.toString();

            const quantityDelta = Number(form.get("quantity_update")?.toString());

            if(isNaN(quantityDelta))
                return fail(400, { updateStock: { error: "errors.scm.article.movement.quantity_not_number" }});

            const storeOut = await locals.prisma.scm_store_relation.findFirst({ where: { store_id: storeOutID, article_id: params.id }});
            const storeIn = await locals.prisma.scm_store.findFirst({ where: { id: storeInID }});

            if(direction === "outward" && storeOut === null)
                return fail(404, { updateStock: { error: "errors.scm.article.movement.store_out_not_defined" }});

            if(direction === "inward" && storeIn === null)
                return fail(400, { updateStock: { error: "errors.scm.article.movement.store_in_not_defined" }});

            if(direction === "moved" && (storeIn === null || storeOut === null))
                return fail(400, { updateStock: { error: "errors.scm.article.movement.stores_undefined" }});

            if(direction === "inward")
            {
                const upsertWhere = (storeIn === null) ? undefined : { article_id: params.id, store_id: storeIn?.id };
                await locals.prisma.scm_store_relation.upsert({ where: { article_id_store_id: upsertWhere }, create: { article_id: params.id, store_id: storeIn!.id, quantity: quantityDelta }, update: { quantity: { increment: quantityDelta }}});

                await locals.prisma.scm_article_movements.create({
                    data: {
                        article_id: params.id,
                        user_id: locals.user!.id,
                        quantity_update: quantityDelta,
                        store_in_id: storeInID,
                        store_out_id: storeOutID
                    }
                });
            }
            else if (direction === "outward")
            {
                if(storeOut === null)
                    return fail(404, { updateStock: { error: "errors.scm.article.movement.store_out_not_defined" }});
                
                if(storeOut.quantity < quantityDelta)
                    return fail(404, { udpateStock: { error: "errors.scm.article.movement.store_out_not_enough_items" }});
                
                await locals.prisma.scm_store_relation.update({ where: { article_id_store_id: { article_id: params.id, store_id: storeOut.store_id }}, data: { quantity: { decrement: quantityDelta }}});
                await locals.prisma.scm_article_movements.create({
                    data: {
                        article_id: params.id,
                        user_id: locals.user!.id,
                        quantity_update: quantityDelta,
                        store_in_id: storeInID,
                        store_out_id: storeOutID
                    }
                });
            }
            else if (direction === "moved")
            {
                if(storeOut === null)
                    return fail(404, { updateStock: { error: "errors.scm.article.movement.store_out_not_defined" }});
                
                if(storeInID === storeOutID)
                    return fail(400, { updateStock: { error: "errors.scm.article.movement.same_stores" }});

                if(storeOut.quantity < quantityDelta)
                    return fail(404, { udpateStock: { error: "errors.scm.article.movement.store_out_not_enough_items" }});

                const upsertWhere = (storeIn === null) ? undefined : { article_id: params.id, store_id: storeIn?.id };
                await locals.prisma.scm_store_relation.upsert({ where: { article_id_store_id: upsertWhere }, create: { article_id: params.id, store_id: storeIn!.id, quantity: quantityDelta }, update: { quantity: { increment: quantityDelta }}});

                await locals.prisma.scm_store_relation.update({ where: { article_id_store_id: { article_id: params.id, store_id: storeOut.store_id }}, data: { quantity: { decrement: quantityDelta }}});

                await locals.prisma.scm_article_movements.create({
                    data: {
                        article_id: params.id,
                        user_id: locals.user!.id,
                        quantity_update: quantityDelta,
                        store_in_id: storeInID,
                        store_out_id: storeOutID
                    }
                });
            }

            return { updateStock: { success: true }};
        }
        catch(ex)
        {
            console.error(ex);
            return { updateStock: { error: "errors.generic" }};
        }
    },

    addAttachedFile: async ({ locals, params, request }) => {

        const form = await request.formData();

        const file = form.get("attached_file") as File;

        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: `scm/article/${params.id}/${file.name}`,

            //@ts-ignore
            Body: await file.arrayBuffer() 
        });

        const uploadResult = await locals.s3.send(uploadCommand);

        if(uploadResult.$metadata.httpStatusCode !== 200)
            return fail(500, { addAttachedFile: { error: "errors.scm.supplier.upsert.logo_upload_failed" }});

        return { addAttachedFile: { success: true }};
    },

    deleteAttachedFile: async ({ locals, params, request}) => {

        const form = await request.formData();

        const fileKey = form.get("file_key")?.toString();

        if(fileKey === undefined || fileKey.startsWith("scm/article/") == false)
            return fail(400, { deleteAttachedFile: { error: "errors.scm.article.file_id_not_defined" }});

        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: fileKey
        });

        const { $metadata: { httpStatusCode }} = await locals.s3.send(deleteCommand);

        if(httpStatusCode !== 204)
            return fail(500, { deleteAttachedFile: { error: "errors.scm.article.file_delete_failed" }});

        const article = await locals.prisma.scm_article.findFirst({ where: { thumbnail: fileKey }});

        if(article?.thumbnail === fileKey)
            await locals.prisma.scm_article.update({ where: { id: params.id }, data: { thumbnail: null }});

        return { deleteAttachedFile: { success: true }};
    },

    selectThumbnail: async ({ locals, params, request }) => {

        const form = await request.formData();

        const fileKey = form.get("file_key")?.toString();

        if(fileKey === undefined || fileKey.startsWith("scm/article/") == false)
            return fail(400, { selectThumbnail: { error: "errors.scm.article.file_id_not_defined" }});
        
        const checkExist = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: fileKey
        });

        const checkResult = await locals.s3.send(checkExist);

        if(checkResult.$metadata.httpStatusCode !== 200)
            return fail(404, { selectThumbnail: { error: "errors.scm.article.file_not_found" }});

        await locals.prisma.scm_article.update({
            where: { id: params.id },
            data: { thumbnail: fileKey }
        });

        return { selectThumbnail: { success: true }};

    },

    removeThumbnail: async ({ locals, params }) => {

        await locals.prisma.scm_article.update({
            where: { id: params.id },
            data: { thumbnail: null }
        });

        return { removeThumbnail: { success: true }};

    }
}