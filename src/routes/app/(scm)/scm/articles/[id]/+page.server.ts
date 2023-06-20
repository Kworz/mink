import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { Collections, type ArticleResponse, type ArticleMovementsResponse, type ArticleMovementsRecord, type UsersResponse, type ArticleTagsResponse, OrdersStateOptions, type StoresResponse, type StoresRelationsResponse } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../+page.server";
import { ClientResponseError } from "pocketbase";
import type { OrderRowsResponseExpanded } from "../../approx/+page.server";

export type ArticleTagsRelationsResponseExpanded = ArticleTagsRelationsResponse<{
    tag: ArticleTagsResponse
}>;

export const load = (async ({ params, locals }) => {

    try
    {
        const articleID = params.id;

        const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponseExpanded>(articleID, { expand: "supplier,store,stores_relations(article).store" });
        const orderRows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ filter: `article="${articleID}"`, expand: "order.supplier" });
        const articleMovements = await locals.pb.collection(Collections.ArticleMovements).getFullList<ArticleMovementsResponse<{ "user": UsersResponse, "store_in": StoresResponse, "store_out": StoresResponse }>>(undefined, { filter: `article="${articleID}"`, sort: "-created", expand: "user,store_in,store_out" });
        const articleTags = await locals.pb.collection(Collections.ArticleTagsRelations).getFullList<ArticleTagsRelationsResponseExpanded>({ filter: `article="${articleID}"`, expand: "tag" });
        const tags = await locals.pb.collection(Collections.ArticleTags).getFullList<ArticleTagsResponse>();

        const storeRelations = await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse<{ store: StoresResponse }>>({ filter: `article = "${articleID}"` , expand: "store"})
        const stores = await locals.pb.collection(Collections.Stores).getFullList<StoresResponse>();

        return {
            article: structuredClone(article),
            articleMovements: structuredClone(articleMovements),
            orderRows: structuredClone(orderRows.filter(row => [OrdersStateOptions.completed, OrdersStateOptions.placed, OrdersStateOptions.acknowledged].includes(row.expand?.order?.state))),
            articleTags: structuredClone(articleTags),
            tags: structuredClone(tags),
            storeRelations: structuredClone(storeRelations),
            stores: structuredClone(stores)
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
            const relations = await locals.pb.collection(Collections.ArticleMovements).getFullList<ArticleMovementsResponse>({ filter: `article = "${params.id}"` });
            
            for(const relation of relations)
            {
                await locals.pb.collection(Collections.ArticleMovements).delete(relation.id);
            }

            await locals.pb.collection("article").delete(params.id);
        }
        catch(ex)
        {
            return { delete: { error: "Failed to delete item" }};
        }

        throw redirect(303, "/app/scm/articles");
    },
    
    editArticle: async ({ params, request, locals }) => {
        try
        {
            if(locals.user?.id === undefined)
                throw "user not authed";
            
            const form = await request.formData();
            form.set("consumable", String(form.has("consumable")));
            form.set("non_physical", String(form.has("non_physical")));
            form.set("internal", String(form.has("internal")));

            await locals.pb.collection(Collections.Article).update<ArticleResponse>(params.id, form);

            return { edit: { success: "Updated object successfully" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { edit: { error: "Failed to update object" }};
        }
    },

    copyArticle: async ({ params, locals }) => {

        let newArticle = undefined;

        try
        {
            const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(params.id);

            const newArticleObject: Partial<ArticleResponse> = {
                ...article,
                id: undefined,
                attached_files: undefined,
                pinned_file: undefined,
                name: article.name + " — Copie"
            };
            
            newArticle = await locals.pb.collection(Collections.Article).create(newArticleObject);

        }
        catch(ex)
        {
            console.log(ex);
            return { copy: { error: "Failed to copy article" }};
        }

        throw redirect(303, "/app/scm/articles/" + newArticle.id);
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
            if(locals.user?.id === undefined)
                throw "user not authed";

            const direction = form.get("direction")?.toString();

            const storeInID = form.get("store_in")?.toString();
            const storeOutID = form.get("store_out")?.toString();

            const quantityDelta = Number(form.get("quantity_update")?.toString());

            const storeIn = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${params.id}" && store = "${storeInID}"` })).at(0);
            const storeOut = (await locals.pb.collection(Collections.StoresRelations).getFullList<StoresRelationsResponse>({ filter: `article = "${params.id}" && store = "${storeOutID}"` })).at(0);

            if(direction === "outward" && storeOutID === undefined)
                throw "L'emplacement de provenance n'est pas défini";

            if(direction === "inward" && storeInID === undefined)
                throw "L'emplacement de destination n'est pas défini";

            if(direction === "moved" && (storeInID === undefined || storeOutID === undefined))
                throw "L'emplacement de provenance ou de destination n'est pas défini";

            if(direction === "inward")
            {
                if(storeIn === undefined)
                    await locals.pb.collection(Collections.StoresRelations).create<StoresRelationsResponse>({ article: params.id, store: storeInID, quantity: quantityDelta });
                else
                    await locals.pb.collection(Collections.StoresRelations).update<StoresRelationsResponse>(storeIn.id, { "quantity+": quantityDelta });

                await locals.pb.collection(Collections.ArticleMovements).create(
                    {
                        article: params.id,
                        user: locals.user.id,
                        quantity_update: quantityDelta,
                        store_in: storeInID,
                        store_out: storeOutID,
                    } satisfies ArticleMovementsRecord
                );
            }
            else if (direction === "outward")
            {
                if(storeOut === undefined)
                    throw "L'article n'est pas présent dans l'emplacement de provenance";
                
                if((storeOut.quantity ?? 0) < quantityDelta)
                    throw "La quantité à sortir est supérieure à la quantité présente dans l'emplacement de provenance";
                
                await locals.pb.collection(Collections.StoresRelations).update<StoresRelationsResponse>(storeOut.id, { "quantity-": quantityDelta });
                await locals.pb.collection(Collections.ArticleMovements).create(
                    {
                        article: params.id,
                        user: locals.user.id,
                        quantity_update: quantityDelta,
                        store_in: storeInID,
                        store_out: storeOutID,
                    } satisfies ArticleMovementsRecord
                );
            }
            else if (direction === "moved")
            {
                if(storeOut === undefined)
                    throw "L'article n'est pas présent dans l'emplacement de provenance";
                
                if(storeInID === storeOutID)
                    throw "L'emplacement de provenance et de destination sont identiques";

                if((storeOut.quantity ?? 0) < quantityDelta)
                    throw "La quantité à sortir est supérieure à la quantité présente dans l'emplacement de provenance";

                if(storeIn === undefined)
                    await locals.pb.collection(Collections.StoresRelations).create<StoresRelationsResponse>({ article: params.id, store: storeInID, quantity: quantityDelta });
                else
                    await locals.pb.collection(Collections.StoresRelations).update<StoresRelationsResponse>(storeIn.id, { "quantity+": quantityDelta });

                await locals.pb.collection(Collections.StoresRelations).update<StoresRelationsResponse>(storeOut.id, { "quantity-": quantityDelta });

                await locals.pb.collection(Collections.ArticleMovements).create(
                    {
                        article: params.id,
                        user: locals.user.id,
                        quantity_update: quantityDelta,
                        store_in: storeInID,
                        store_out: storeOutID,
                    } satisfies ArticleMovementsRecord
                );
            }

            return { updateStock: { success: "Stock mis à jour" }};
        }
        catch(ex)
        {
            if(ex instanceof ClientResponseError)
            {
                return { updateStock: { error: ex.message }};
            }

            return { updateStock: { error: ex }};
        }
    },

    createTag: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            await locals.pb.collection(Collections.ArticleTags).create(form);
        }
        catch(ex)
        {
            if(ex instanceof ClientResponseError)
                return { createTag: { error: ex.message }};

            return { createTag: { error: ex }};
        }
    },

    addTag: async ({ locals, params, request }) => {
        const form = await request.formData();

        try
        {
            await locals.pb.collection(Collections.ArticleTagsRelations).create({ article: params.id, tag: form.get("tag")?.toString(), value: form.get("value")?.toString() });
        }
        catch(ex)
        {
            if(ex instanceof ClientResponseError)
                return { addTag: { error: ex.message }};

            return { addTag: { error: ex }};
        }
    },

    editTag: async ({ locals, request }) => {
        const form = await request.formData();

        const id = form.get("id")?.toString();

        try
        {
            if(id === undefined)
                throw "id not found";
            
            await locals.pb.collection(Collections.ArticleTagsRelations).update(id, form);
            
            return { editTag: { success: true }};
        }
        catch(ex)
        {
            return { editTag: { error: (ex instanceof ClientResponseError) ? ex.message : ex}};
        }
    }
}