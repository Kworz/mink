import { Collections, type ProjectsResponse } from "$lib/DBTypes";
import type { OrdersResponseExpanded } from "../+page.server";
import type { ArticleResponseExpanded } from "../../articles/+page.server";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {

    const order = await locals.pb.collection(Collections.Orders).getOne<OrdersResponseExpanded>(params.id, { expand: "issuer,project,orders_rows(order).article,supplier" });
    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>();

    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponseExpanded>({ filter: `supplier = "${order.supplier}"`});

    return {
        order: structuredClone(order),
        projects: structuredClone(projects),
        articles: structuredClone(articles)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    editOrder: async ({ params, request, locals }) => {
        try
        {
            const form = await request.formData();
            await locals.pb.collection(Collections.Orders).update(params.id, form);

            return { edit: { success: "Successfully updated order "}};
        }
        catch(ex)
        {
            return { edit: { error: ex }};
        }
    },
    editOrderRow: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();
            const row_id = form.get("id");

            if(row_id === null)
                throw "Could not find row id";

            await locals.pb.collection(Collections.OrdersRows).update(row_id.toString(), form);

            return { editRow: { success: "Successfully updated order row" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { editRow: { error: ex }};
        }
    },

    createOrderRow: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();
            await locals.pb.collection(Collections.OrdersRows).create(form);
            return { createRow: { success: "Created new order row" }};

        }
        catch(ex)
        {
            console.log(ex);
            return { createRow: { error: "" }};
        }
    },

    deleteOrderRow: async ({ request, locals }) => {
        try {
            const form = await request.formData();
            const rowId = form.get("id");

            if(rowId === null) 
                throw "Row id is not defined";

            await locals.pb.collection(Collections.OrdersRows).delete(rowId.toString());

            return { deleteRow: { success: "Successfully deleted order row" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { deleteRow: { error: ex }};
        }
    }
}