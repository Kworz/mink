import { error, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { Collections, type NomenclatureRowResponse, type ListResponse, type ListRowResponse, type ArticleMovementsResponse, type ArticleMovementsRecord, type ArticleResponse } from "$lib/DBTypes";

export const load = (async ({ params, locals }) => {

    try
    {
        const list = await locals.pb.collection(Collections.List).getOne<ListResponse>(params.id, {
            expand: "parent_nomenclature"
        });

        const list_rows = await locals.pb.collection(Collections.ListRow).getFullList<ListRowResponse>(undefined, {
            filter: `parent_list="${params.id}"`,
            expand: ``
        });

        const nomenclature_rows = await locals.pb.collection(Collections.NomenclatureRow).getFullList<NomenclatureRowResponse>(undefined, {
            filter: `parent_nomenclature="${list.parent_nomenclature}"`,
            expand: `child_article`
        });

        return {
            list: structuredClone(list),
            list_rows: structuredClone(list_rows),
            nomenclature_rows: structuredClone(nomenclature_rows)
        }
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load list");
    }
}) satisfies PageServerLoad;

export const actions: Actions = {
    updateRow: async ({ params, request, locals }) => {

        try
        {
            const data = await request.formData();
            const id = params.id;

            if(id === undefined)
                throw Error("Failed to find request route id");

            data.set("parent_list", id);

            const listRowID = data.get("id");
            const listID = params.id;
            const parentNomenclatureRowID = data.get("parent_nomenclature_row");

            if(parentNomenclatureRowID === null)
                throw "Parent nomenclature row not found";

            if(listID === undefined)
                throw "List id undefined";

            if(locals.user?.id === undefined)
                throw "User not authed";

            const list = await locals.pb.collection(Collections.List).getOne<ListResponse>(listID);
            const parentNomenclatureRow = await locals.pb.collection(Collections.NomenclatureRow).getOne<NomenclatureRowResponse>(parentNomenclatureRowID.toString());

            const articleMovement: ArticleMovementsRecord = {
                article: parentNomenclatureRow.child_article,
                user: locals.user.id,
                quantity_update: 0,
                reason: `Ajout a la liste: ${list.name}.`
            } 

            if(listRowID !== null)
            {
                const oldRow = await locals.pb.collection(Collections.ListRow).getOne<ListRowResponse>(listRowID.toString());
                
                const oldQuantity = oldRow.quantity ?? 0;
                const newQuantity = data.get("quantity");

                if(newQuantity === null)
                    throw "New quantity not defined";

                articleMovement.quantity_update = oldQuantity - Number(newQuantity.toString());

                console.log(Number(newQuantity.toString()), oldQuantity, articleMovement.quantity_update);
    
                await locals.pb.collection(Collections.ListRow).update(data.get("id") as string, data);
            }
            else
            {
                const formQuantity = data.get("quantity");

                if(formQuantity === null)
                    throw "Quantity not defined";

                articleMovement.quantity_update = -Number(formQuantity.toString());

                await locals.pb.collection(Collections.ListRow).create(data);

            }

            await locals.pb.collection(Collections.ArticleMovements).create<ArticleMovementsResponse>(articleMovement);
            const oldArticle = await locals.pb.collection(Collections.Article).getOne<ArticleResponse>(articleMovement.article);

            const newQuantity = Number(oldArticle.quantity) + articleMovement.quantity_update;

            await locals.pb.collection(Collections.Article).update<ArticleResponse>(articleMovement.article, {
                quantity: newQuantity
            });

            return { success: true }
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to create list row" };
        }
    },
    editList: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();

            await locals.pb.collection(Collections.List).update(params.id, form);

            return { success: true };
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to edit list properties" };
        }
    },
    removeList: async ({ params, locals }) => {
        try
        {
            await locals.pb.collection(Collections.List).delete(params.id);
            throw redirect(303, "/app/lists/");
        }
        catch(ex)
        {
            return { error: "Failed to delete list" };
        }
    }
}