import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { deleteFile, saveFile } from "$lib/server/files";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {

    try
    {
        const articleID = params.id;

        const article = await locals.prisma.scm_article.findFirstOrThrow({ 
            where: { id: articleID },
            include: articleIncludeQuery
        });

        const stores = await locals.prisma.scm_store.findMany({ where: { temporary: false }});

        return {
            article,
            stores
        }
    }
    catch(ex) 
    {
        console.log(ex);
        throw redirect(303, "/app/scm/articles");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    deleteArticle: async ({ params, locals }) => {
        try
        {
            await locals.prisma.scm_article.delete({
                where: {
                    id: params.id
                }
            });
        }
        catch(ex)
        {
            return { delete: { error: "scm.article.delete.error" }};
        }

        throw redirect(303, "/app/scm/articles");
    },
    
    editArticle: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();

            const order_quantity = Number(form.get("order_quantity")?.toString());
            const critical_quantity = Number(form.get("critical_quantity")?.toString());
            const unit_quantity = Number(form.get("unit_quantity")?.toString());

            //TODO: This might require a zod validation before being sent to the database
            //TODO: This needs proper field types

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

                    order_quantity: order_quantity ? order_quantity : undefined,
                    critical_quantity: critical_quantity ? critical_quantity : undefined,

                    unit: form.get("unit")?.toString(),
                    unit_quantity: unit_quantity ? unit_quantity : undefined

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

        let newID = undefined;

        try
        {
            const article = await locals.prisma.scm_article.findFirstOrThrow({ where: { id: params.id }});

            article.name = article.name + " — Copie";

            let { id } = await locals.prisma.scm_article.create({
                data: {...article, id: undefined, thumbnail: undefined }
            });

            newID = id;
        }
        catch(ex)
        {
            console.log(ex);
            return { copy: { error: "Failed to copy article" }};
        }

        throw redirect(303, "/app/scm/articles/" + newID);
    },

    editThumbnail: async ({ locals, params, request }) => {

        const form = await request.formData();

        try
        {
            const { thumbnail } = await locals.prisma.scm_article.findFirstOrThrow({ where: { id: params.id }});

            if(thumbnail !== null)
                await deleteFile(thumbnail);

            if(!form.has("thumbnail"))
                return { editThumbnail: { success: "scm.article.thumbnail.delete_success" } };

            const path = await saveFile("scm/articles/thumbnails", form.get("thumbnail") as Blob);
            await locals.prisma.scm_article.update({ where: { id: params.id }, data: { thumbnail: path }});

            return { editThumbnail: { success: "scm.article.thumbnail.update_success" } };
        }
        catch(ex)
        {
            console.log(ex);
            return { editThumbnail: { error: "scm.article.thumbnail.error" } };
        }
    },

    addAttachedFile: async ({ locals, params, request }) => {
        const form = await request.formData();

        try {
            await locals.pb.collection(Collections.Article).update(params.id, form);
        }
        catch(ex)
        {
            return { addAttachedFile: { error: ex }};
        }

        return { addAttachedFile: { success: "Successfully added file" }};
    },

    removeAttachedFile: async ({ locals, params, request }) => {
        const form = await request.formData();
        const articleID = params.id;

        try {

            if(articleID === undefined)
                throw "Article ID not found";

            await locals.pb.collection(Collections.Article).update(articleID, form);
        }

        catch(ex)
        {
            return { removeAttachedFile: { error: ex }};
        }

        return { removeAttachedFile: { success: "Successfully remove file" }};
    },

    pinAttachedFile: async ({ locals, params, request }) => {
        const form = await request.formData();
        const articleID = params.id;

        try 
        {
            if(articleID === undefined)
                throw "Failed to find articleID";

            await locals.pb.collection(Collections.Article).update(articleID, form);
        }
        catch(ex)
        {
            return { pinAttachedFile: { error: ex }};
        }

        return { pinAttachedFile: { success: "Successfully pinned file"}}
    },

    updateStock: async ({ locals, params, request }) => {

        const form = await request.formData();

        try
        {
            if(locals.session === null)
                throw "app.user.error.no_auth";

            const direction = form.get("direction")?.toString();

            const storeInID = form.get("store_in")?.toString();
            const storeOutID = form.get("store_out")?.toString();

            const quantityDelta = Number(form.get("quantity_update")?.toString());

            const storeIn = await locals.prisma.scm_store_relation.findFirst({ where: { article_id: params.id, store_id: storeInID }});
            const storeOut = await locals.prisma.scm_store_relation.findFirst({ where: { article_id: params.id, store_id: storeOutID }});

            if(direction === "outward" && storeOutID === undefined)
                throw "scm.article.movement.error.store_out_not_defined"; //"L'emplacement de provenance n'est pas défini";

            if(direction === "inward" && storeInID === undefined)
                throw "scm.article.movement.error.store_in_not_defined"; //"L'emplacement de destination n'est pas défini";

            if(direction === "moved" && (storeInID === undefined || storeOutID === undefined))
                throw "scm.article.movement.error.stores_undefined"; //"L'emplacement de provenance ou de destination n'est pas défini";

            if(direction === "inward")
            {
                if(storeIn === null)
                {
                    await locals.prisma.scm_store_relation.create({ data: { article_id: params.id, store_id: storeInID, quantity: quantityDelta }});
                }
                else
                {
                    await locals.prisma.scm_store_relation.update({ where: { id: storeIn.store_id }, data: { quantity: { increment: quantityDelta }}});
                }

                await locals.prisma.scm_article_movements.create({
                    data: {
                        article_id: params.id,
                        user_id: locals.session.user.userId,
                        quantity_update: quantityDelta,
                        store_in_id: storeInID,
                        store_out_id: storeOutID
                    }
                });
            }
            else if (direction === "outward")
            {
                if(storeOut === null)
                    throw "scm.article.movement.error.store_missing_item"; //"L'article n'est pas présent dans l'emplacement de provenance";
                
                if(storeOut.quantity < quantityDelta)
                    throw "scm.article.movement.error.store_not_enough_items"; //"La quantité à sortir est supérieure à la quantité présente dans l'emplacement de provenance";
                
                await locals.prisma.scm_store_relation.update({ where: { id: storeOut.id }, data: { quantity: { decrement: quantityDelta }}});
                await locals.prisma.scm_article_movements.create({
                    data: {
                        article_id: params.id,
                        user_id: locals.session.user.userId,
                        quantity_update: quantityDelta,
                        store_in_id: storeInID,
                        store_out_id: storeOutID
                    }
                });
            }
            else if (direction === "moved")
            {
                if(storeOut === null)
                    throw "scm.article.movement.error.store_missing_item"; //"L'article n'est pas présent dans l'emplacement de provenance";
                
                if(storeInID === storeOutID)
                    throw "scm.article.movement.error.same_stores"; //"L'emplacement de provenance et de destination sont identiques";

                if(storeOut.quantity < quantityDelta)
                    throw "scm.article.movement.error.out_store_not_enough_items"; //"La quantité à sortir est supérieure à la quantité présente dans l'emplacement de provenance";

                if(storeIn === null)
                    await locals.prisma.scm_store_relation.create({ data: { article_id: params.id, store_id: storeInID, quantity: quantityDelta }});
                else
                    await locals.prisma.scm_store_relation.update({ where: { id: storeIn.id }, data: { quantity: { increment: quantityDelta }}});

                await locals.prisma.scm_store_relation.update({ where: { id: storeOut.id }, data: { quantity: { decrement: quantityDelta }}});

                await locals.prisma.scm_article_movements.create({
                    data: {
                        article_id: params.id,
                        user_id: locals.session.user.userId,
                        quantity_update: quantityDelta,
                        store_in_id: storeInID,
                        store_out_id: storeOutID
                    }
                });
            }

            return { updateStock: { success: "scm.article.movement.success" }};
        }
        catch(ex)
        {
            return { updateStock: { error: String(ex) }};
        }
    }
}