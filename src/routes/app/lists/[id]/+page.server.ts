import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { Collections, type NomenclatureRowResponse, type ListResponse, type ListRowResponse, type ArticleMovementsResponse, type ArticleMovementsRecord, type ArticleResponse, type NomenclatureResponse, type ProjectsResponse, type OrdersRecord, OrdersStateOptions, type OrdersRowsRecord, type OrdersRowsResponse, type OrdersResponse } from "$lib/DBTypes";
import type { NomenclatureRowResponseExpanded, NomenclatureRowResponseExpandedWithArticle } from "../../nomenclatures/[id]/+page.server";

export const load = (async ({ params, locals }) => {

    try
    {
        const list = await locals.pb.collection(Collections.List).getOne<ListResponse<{parent_nomenclature: NomenclatureResponse, project?: ProjectsResponse}>>(params.id, {
            expand: "parent_nomenclature,project"
        });

        const list_rows = await locals.pb.collection(Collections.ListRow).getFullList<ListRowResponse>(undefined, {
            filter: `parent_list="${params.id}"`,
            expand: ``
        });

        const nomenclature_rows = await locals.pb.collection(Collections.NomenclatureRow).getFullList<NomenclatureRowResponseExpandedWithArticle>(undefined, {
            filter: `parent_nomenclature="${list.parent_nomenclature}"`,
            expand: `child_article.supplier`
        });

        const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>();

        return {
            list: structuredClone(list),
            list_rows: structuredClone(list_rows),
            nomenclature_rows: structuredClone(nomenclature_rows),
            projects: structuredClone(projects)
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
        }
        catch(ex)
        {
            return { error: "Failed to delete list" };
        }

        throw redirect(303, "/app/lists/");
    },
    generateOrder: async ({ request, params, locals }) => {
        
        let order: OrdersResponse | undefined = undefined;

        try
        {
            const form = await request.formData();

            const projectID = form.get("project");
            const supplierID = form.get("supplier");

            if(locals.user === undefined || locals.user === null)
                throw "User not logged in";

            if(supplierID === null)
                throw "Could create order for undefined supplier";

            const order_object: OrdersRecord = {
                issuer: locals.user.id,
                supplier: supplierID?.toString(),
                state: OrdersStateOptions.draft,
                project: projectID?.toString()
            };

            const list = await locals.pb.collection(Collections.List).getOne<ListResponse>(params.id);
            const list_rows = await locals.pb.collection(Collections.ListRow).getFullList<ListRowResponse>({ filter: `parent_list="${params.id}"`});
            const nomenclature_rows = await locals.pb.collection(Collections.NomenclatureRow).getFullList<NomenclatureRowResponseExpanded>(undefined, {
                filter: `parent_nomenclature="${list.parent_nomenclature}"`,
                expand: `child_article`
            });

            order = await locals.pb.collection(Collections.Orders).create<OrdersResponse>(order_object);

            for(const nomRow of nomenclature_rows.filter(k => k.expand?.child_article.supplier === order_object.supplier))
            {
                const listRow = list_rows.find(k => k.parent_nomenclature_row === nomRow.id);
                let orderAmount = nomRow.quantity_required - (listRow?.quantity ?? 0);
                
                if(orderAmount <= 0)
                    continue;

                const minOrderQuantity = nomRow.expand?.child_article.order_quantity;

                if(minOrderQuantity !== undefined && orderAmount % minOrderQuantity != 0)
                {
                    const missingquantity = (orderAmount % minOrderQuantity);
                    console.log("Ajusted order amount", orderAmount, missingquantity, orderAmount + missingquantity);
                    orderAmount = orderAmount + missingquantity;
                }
                
                const order_row: OrdersRowsRecord = {
                    order: order.id,
                    article: nomRow.child_article,
                    quantity: orderAmount
                };

                await locals.pb.collection(Collections.OrdersRows).create<OrdersRowsResponse>(order_row);
            }
        }
        catch(ex)
        {
            console.log(ex);
            return { generateOrder: { error: ex }};
        }

        throw redirect(303, `/app/orders/${order.id}`)
    }
}