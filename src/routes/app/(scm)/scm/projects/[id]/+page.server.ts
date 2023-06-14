import { Collections, type AssembliesBuylistsResponse, type ProjectsResponse, type ArticleMovementsResponse, type ArticleResponse, type StoresResponse } from "$lib/DBTypes";
import type { OrderRowsResponseExpanded } from "../../approx/proxy+page.server";
import type { FabricationOrdersResponseExpanded } from "../../fabrication_orders/+page.server";
import type { PageServerLoad, Actions } from "./$types";

import { env } from "$env/dynamic/public";

export const load = (async ({ locals, params }) => {

    const projectID = params.id;

    const project = await locals.pb.collection(Collections.Projects).getOne<ProjectsResponse>(projectID);

    // Fetch all buylist stores and map the article movement to the project
    const buylistsStores = (await locals.pb.collection(Collections.AssembliesBuylists).getFullList<AssembliesBuylistsResponse>({ filter: `project = "${projectID}"` })).map(buylist => buylist.store);

    let filter = `${buylistsStores.map(bls => `store_in = "${bls}"`).join(" || ")}`;
    filter += (filter.length > 0) ? "&&" : "";
    filter += `store_out != "" && quantity_update > 0`;

    const stores_relations = buylistsStores.length > 0 ? (await locals.pb.collection(Collections.ArticleMovements).getFullList<ArticleMovementsResponse<{ article: ArticleResponse, store_in: StoresResponse, store_out: StoresResponse}>>({ filter, expand: "article,store_in,store_out"})) : [];

    const order_rows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ filter: `project = "${projectID}"`, expand: 'order,article' });
    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ filter: `project = "${projectID}" && article.supplier !~ "${env.PUBLIC_INTERNAL_SUPPLIER}"`, expand: 'article,applicant,receiver'});

    return {
        project: structuredClone(project),
        order_rows: structuredClone(order_rows),
        fabricationOrders: structuredClone(fabricationOrders),
        stores_relations: structuredClone(stores_relations),
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    editProject: async ({ locals, params, request }) => {

        const form = await request.formData();

        form.set('closed', String(form.has('closed')));

        try
        {
            await locals.pb.collection(Collections.Projects).update(params.id, form);
        }
        catch(e)
        {
            return { editProject: { error: e.message }};
        }
    }
}