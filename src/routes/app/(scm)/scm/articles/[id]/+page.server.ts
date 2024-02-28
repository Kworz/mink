import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { unit_of_work } from "@prisma/client";

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

            const storeOut = await locals.prisma.scm_store_relation.findFirst({ where: { article_id: params.id, store_id: storeOutID }});
            const storeIn = await locals.prisma.scm_store_relation.findFirst({ where: { article_id: params.id, store_id: storeInID }});

            if(direction === "outward" && storeOut === null)
                throw "scm.article.movement.error.store_out_not_defined"; //"L'emplacement de provenance n'est pas défini";

            if(direction === "inward" && storeIn === null)
                throw "scm.article.movement.error.store_in_not_defined"; //"L'emplacement de destination n'est pas défini";

            if(direction === "moved" && (storeIn === null || storeOut === null))
                throw "scm.article.movement.error.stores_undefined"; //"L'emplacement de provenance ou de destination n'est pas défini";

            if(direction === "inward")
            {
                const upsertWhere = (storeIn === null) ? undefined : { article_id: params.id, store_id: storeIn?.store_id };
                await locals.prisma.scm_store_relation.upsert({ where: { article_id_store_id: upsertWhere }, create: { article_id: params.id, store_id: storeIn!.store_id, quantity: quantityDelta }, update: { quantity: { increment: quantityDelta }}});

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
                    throw "scm.article.movement.error.store_missing_item"; //"L'article n'est pas présent dans l'emplacement de provenance";
                
                if(storeOut.quantity < quantityDelta)
                    throw "scm.article.movement.error.store_not_enough_items"; //"La quantité à sortir est supérieure à la quantité présente dans l'emplacement de provenance";
                
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
                    throw "scm.article.movement.error.store_missing_item"; //"L'article n'est pas présent dans l'emplacement de provenance";
                
                if(storeInID === storeOutID)
                    throw "scm.article.movement.error.same_stores"; //"L'emplacement de provenance et de destination sont identiques";

                if(storeOut.quantity < quantityDelta)
                    throw "scm.article.movement.error.out_store_not_enough_items"; //"La quantité à sortir est supérieure à la quantité présente dans l'emplacement de provenance";

                const upsertWhere = (storeIn === null) ? undefined : { article_id: params.id, store_id: storeIn?.store_id };
                await locals.prisma.scm_store_relation.upsert({ where: { article_id_store_id: upsertWhere }, create: { article_id: params.id, store_id: storeIn!.store_id, quantity: quantityDelta }, update: { quantity: { increment: quantityDelta }}});

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

            return { updateStock: { success: "scm.article.movement.success" }};
        }
        catch(ex)
        {
            return { updateStock: { error: String(ex) }};
        }
    }
}