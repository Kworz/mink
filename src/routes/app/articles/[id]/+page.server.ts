import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { Collections, type ArticleResponse, type ArticleMovementsResponse, type ArticleMovementsRecord, type UsersResponse, type ArticleTagsResponse, OrdersStateOptions } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../+page.server";
import { ClientResponseError } from "pocketbase";
import type { OrderRowsResponseExpanded } from "../../approx/+page.server";

export type ArticleTagsRelationsResponseExpanded = ArticleTagsRelationsResponse<{
    tag: ArticleTagsResponse
}>;

export const load = (async ({ params, locals }) => {

    try
    {
        const itemId = params.id;
        const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponseExpanded>(itemId, { expand: "supplier,store" });
        const orderRows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ filter: `article="${itemId}"`, expand: "order.supplier" });
        const articleMovements = await locals.pb.collection(Collections.ArticleMovements).getFullList<ArticleMovementsResponse<{"user": UsersResponse}>>(undefined, { filter: `article="${itemId}"`, sort: "-created", expand: "user" });
        const articleTags = await locals.pb.collection(Collections.ArticleTagsRelations).getFullList<ArticleTagsRelationsResponseExpanded>({ filter: `article="${itemId}"`, expand: "tag" });
        const tags = await locals.pb.collection(Collections.ArticleTags).getFullList<ArticleTagsResponse>();

        return {
            article: structuredClone(article),
            articleMovements: structuredClone(articleMovements),
            orderRows: structuredClone(orderRows.filter(row => [OrdersStateOptions.completed, OrdersStateOptions.placed, OrdersStateOptions.acknowledged].includes(row.expand?.order?.state))),
            articleTags: structuredClone(articleTags),
            tags: structuredClone(tags)
        }
    }
    catch(ex) 
    {
        console.log(ex);
        throw redirect(303, "/app/articles");
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

        throw redirect(303, "/app/articles");
    },
    
    editArticle: async ({ params, request, locals }) => {
        try
        {
            if(locals.user?.id === undefined)
                throw "user not authed";
            
            const form = await request.formData();
            form.set("consumable", String(form.has("consumable")));

            const oldArticle = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(params.id);
            const newArticle = await locals.pb.collection(Collections.Article).update<ArticleResponse>(params.id, form);

            if(oldArticle.quantity !== newArticle.quantity)
            {
                const articleMovement: ArticleMovementsRecord = { article: params.id, user: locals.user.id, quantity_update: (Number(newArticle.quantity) - Number(oldArticle.quantity)), reason: "Article update"} 
                await locals.pb.collection(Collections.ArticleMovements).create<ArticleMovementsResponse>(articleMovement);
            }

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
                name: article.name + " — Copy"
            };
            
            newArticle = await locals.pb.collection(Collections.Article).create(newArticleObject);

        }
        catch(ex)
        {
            console.log(ex);
            return { copy: { error: "Failed to copy article" }};
        }

        throw redirect(303, "/app/articles/" + newArticle.id);
    },

    addToNomenclature: async ({ locals, request, params }) => {
        const form = await request.formData();

        const parent_nomenclature = form.get("parent_nomenclature");
        const item_id = params.id;
        const item_quantity = form.get("item_quantity");

        try {

            if(parent_nomenclature === null || item_id === undefined || item_quantity === null)
                throw "too few arguments"

            try
            {
                const existingNomRow = await locals.pb.collection(Collections.NomenclatureRow).getFirstListItem<NomenclatureRowResponse>(`child_article="${item_id}" && parent_nomenclature="${parent_nomenclature.toString()}"`);
                await locals.pb.collection(Collections.NomenclatureRow).update<NomenclatureRowResponse>(existingNomRow.id, { "quantity_required+": Number(item_quantity.toString()) });

                return { addToNomenclature: { success: "Nomenclature updated successfully" }};
            }
            catch(ex)
            {
                console.log(ex);
            }

            const nomRow: NomenclatureRowRecord = {
                parent_nomenclature: parent_nomenclature.toString(),
                child_article: item_id,
                quantity_required: Number(item_quantity.toString())
            };

            await locals.pb.collection(Collections.NomenclatureRow).create<NomenclatureRowResponse>(nomRow);

            return { addToNomenclature: { success: "Article added successfully" }};
        }
        catch(ex)
        {
            return { addToNomenclature: { error: "Failed to add to nomenclature" }};
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
            if(locals.user?.id === undefined)
                throw "user not authed";

            const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(params.id);

            const quantityUpdate = Number(form.get("quantity_update"));
            const quantityDirection = Number(form.get("direction"));

            if(quantityUpdate === 0)
                throw "La quantité à sortir est nulle";

            const newQuantity = (article.quantity ?? 0) + (quantityUpdate * quantityDirection);

            if(newQuantity < 0)
                throw "Le stock tombe en dessous de 0, vérifiez la quantité initiale et la quantité à sortir";

            const articleMovement: ArticleMovementsRecord = { 
                article: params.id, 
                user: locals.user.id, 
                quantity_update: quantityUpdate * quantityDirection, 
                reason: (form.get("reason")?.toString()) ?? "Mise à jour du stock"
            };

            await locals.pb.collection(Collections.ArticleMovements).create<ArticleMovementsResponse>(articleMovement);
            await locals.pb.collection(Collections.Article).update(params.id, { "quantity": newQuantity });

            return { updateStock: { success: "Successfully updated stock" }};
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