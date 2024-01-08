import type { PageServerLoad, Actions } from "./$types";

import { fail, redirect } from "@sveltejs/kit";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { flatAssembly } from "$lib/components/derived/assemblies/flattenAssembly";

export const load = (async ({ locals, params }) => {

    const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }, include: { assembly: true, project: true }});
    if(list === null) return redirect(303, "/app/scm/lists");

    const listStoreRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: list.store_id }, include: { article: { include: articleIncludeQuery }}});
    const assemblyRows = await flatAssembly(list.assembly_id, locals.prisma);

    /// - Secondary data

    const assemblies = await locals.prisma.scm_assembly.findMany({});
    const projects = await locals.prisma.pr_project.findMany({});

    return {
        list,
        assemblyRows,
        listStoreRelations,

        assemblies,
        projects
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request, params }) => {

        const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }});

        if(!list) return fail(404, { buyListRelationEdit: { error: "List not found" }});

        /// — Form parsing
        const form = await request.formData();
        const articleId = form.get("article")?.toString();
        const quantity = Number(form.get("quantity")?.toString());
        const buylist = form.get("buylist")?.toString();
        let storeToUse = form.get('store')?.toString();

        if(articleId === undefined)
            return fail(400, { buyListRelationEdit: { error: "Missing article ID" }});

        if(Number.isNaN(quantity))
            return fail(400, { buyListRelationEdit: { error: "Quantity is not a number" }});

        if(buylist === undefined)
            return fail(400, { buyListRelationEdit: { error: "Missing buylist ID" }});

        /// — Quantity data to check with
        const buylistArticleStoreRelation = await locals.prisma.scm_store_relation.findUnique({ where: { article_id_store_id: { article_id: articleId, store_id: list.store_id} }});
        const articleAvailableStores = await locals.prisma.scm_store_relation.findMany({ where: { article_id: articleId, quantity: { gt: 0 }, store: { temporary: false }}, orderBy: { quantity: "desc" }});

        if(storeToUse === undefined && articleAvailableStores.length > 1)
            return fail(400, { buyListRelationEdit: { [articleId]: { error: "Multiple stores available for this article, please specify one", stores: articleAvailableStores }}});

        const articleQuantityDelta = quantity - (buylistArticleStoreRelation?.quantity ?? 0);

        if(articleQuantityDelta > 0) // Adding article to the list from the specified store
        {
            // check if store has enough quantity (choose either from the specified store or the first available one as it is the default one)
            const availableQuantity = storeToUse ? articleAvailableStores.find(k => k.store_id === storeToUse)?.quantity : articleAvailableStores.at(0)?.quantity;

            if(availableQuantity === undefined || availableQuantity < articleQuantityDelta)
                return fail(400, { buyListRelationEdit: { [articleId]: { error: "Not enough quantity in store" }}});

            // update relations

            // update buylist store_relation
            await locals.prisma.scm_store_relation.upsert({ 
                where: { article_id_store_id: { article_id: articleId, store_id: list.store_id }}, 
                create: { article_id: articleId, store_id: list.store_id, quantity: quantity }, 
                update: { quantity: { increment: articleQuantityDelta }}
            });

            await locals.prisma.scm_store_relation.update({ where: { article_id_store_id: { article_id: articleId, store_id: storeToUse ?? articleAvailableStores.at(0)?.store_id }}, data: { quantity: { decrement: articleQuantityDelta }}});

            await locals.prisma.scm_article_movements.create({
                data: {
                    article_id: articleId,
                    quantity_update: articleQuantityDelta,
                    user_id: locals.session!.user.id,
                    store_in_id: list.store_id,
                    store_out_id: storeToUse ?? articleAvailableStores.at(0)?.store_id
                }
            });
        }
        else // Removing article from the list to the specied store if given
        {
            // check if store has enough quantity (choose either from the specified store or the first available one as it is the default one)
            const availableQuantity = buylistArticleStoreRelation?.quantity

            if(availableQuantity === undefined || availableQuantity < -articleQuantityDelta)
                return fail(400, { buyListRelationEdit: { [articleId]: {error: "Not enough quantity in list's store" }}});

            // update relations

            // update buylist store_relation
            await locals.prisma.scm_store_relation.upsert({ 
                where: { article_id_store_id: { article_id: articleId, store_id: storeToUse ?? articleAvailableStores.at(0)?.store_id }}, 
                create: { article_id: articleId, store_id: storeToUse ?? articleAvailableStores.at(0)?.store_id, quantity: quantity }, 
                update: { quantity: { decrement: -articleQuantityDelta }}
            });

            await locals.prisma.scm_store_relation.update({ where: { article_id_store_id: { article_id: articleId, store_id: list.store_id }}, data: { quantity: { decrement: articleQuantityDelta }}});

            await locals.prisma.scm_article_movements.create({
                data: {
                    article_id: articleId,
                    quantity_update: -articleQuantityDelta,
                    user_id: locals.session!.user.id,
                    store_in_id: storeToUse ?? articleAvailableStores.at(0)?.store_id,
                    store_out_id: list.store_id,
                }
            });
        }

        return {
            buyListRelationEdit: { 
                success: true,
                [articleId]: { success: "Successfully Created/updated row row" }
            }
        };
    },

    editList: async ({ locals, request, params }) => {

        const form = await request.formData();

        const name = form.get("name")?.toString();
        const assembly_id = form.get("assembly")?.toString();
        const project_id = form.get("list")?.toString();
        const closed = form.has("closed");

        try
        {
            await locals.prisma.scm_assembly_buylist.update({ where: { id: params.id }, data: { name, closed, assembly_id, project_id }});
            return { editList: { success: "Successfully updated row" }};
        }
        catch(e)
        {
            return fail(400, { editList: { error: String(e) }});
        }
    }
};