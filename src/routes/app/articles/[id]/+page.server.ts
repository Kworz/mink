import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type ArticleResponse, type NomenclatureResponse, type NomenclatureRowRecord, type NomenclatureRowResponse, type ArticleMovementsResponse, type ArticleMovementsRecord, type UsersResponse, type ArticleRecord } from "$lib/DBTypes";

export const load = (async ({ params, locals }) => {

    try
    {
        const itemId = params.id;
        const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(itemId);
        const articleMovements = await locals.pb.collection(Collections.ArticleMovements).getFullList<ArticleMovementsResponse<{"user": UsersResponse}>>(undefined, { filter: `article="${itemId}"`, sort: "-created", expand: "user" });
        const nomenclatures = await locals.pb.collection(Collections.Nomenclature).getFullList<NomenclatureResponse>();
    
        return {
            article: structuredClone(article),
            articleMovements: structuredClone(articleMovements),
            nomenclatures: structuredClone(nomenclatures)
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
            if(params.id === undefined)
                throw "Id not given";
            
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
            if(params.id === undefined)
                throw "params id not given";

            if(locals.user?.id === undefined)
                throw "user not authed";
            
            const form = await request.formData();
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

        console.log("copy article")

        try
        {
            if(params.id === undefined)
                throw "Article id undefined";

            const article = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(params.id);

            const newArticleObject: ArticleRecord = {
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
            console.log(ex);
            return { addToNomenclature: { error: "Failed to add to nomenclature" }};
        }
    },

    addAttachedFile: async ({ locals, params, request }) => {
        const form = await request.formData();
        const articleID = params.id;

        try {
            if(articleID === undefined)
                throw "could not find article id";

            await locals.pb.collection(Collections.Article).update(articleID, form);
        }
        catch(ex)
        {
            console.log(ex);
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
            console.log(ex);
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
            console.log(ex);
            return { pinAttachedFile: { error: ex }};
        }

        return { pinAttachedFile: { success: "Successfully pinned file"}}
    }
}