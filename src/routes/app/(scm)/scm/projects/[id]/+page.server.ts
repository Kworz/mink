import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load = (async ({ locals, params }) => {

    const projectID = params.id;

    const project = await locals.prisma.pr_project.findUniqueOrThrow({ where: { id: projectID } });

    /*

    // Fetch all buylist stores and map the article movement to the project
    const buylistsStores = (await locals.pb.collection(Collections.AssembliesBuylists).getFullList<AssembliesBuylistsResponse>({ filter: `project = "${projectID}"` })).map(buylist => buylist.store);

    let filter = `${buylistsStores.map(bls => `store_in = "${bls}"`).join(" || ")}`;
    filter = (filter.length > 0) ? `(${filter}) && ` : "";
    filter += `store_out != "" && quantity_update > 0 && article.internal != true`;

    const stores_relations = buylistsStores.length > 0 ? (await locals.pb.collection(Collections.ArticleMovements).getFullList<ArticleMovementsResponse<{ article: ArticleResponse, store_in: StoresResponse, store_out: StoresResponse}>>({ filter, expand: "article,store_in,store_out"})) : [];
    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponse>({ expand: articleResponseExpand });

    const stores_relationsMapped = stores_relations.map(store_relation => {

        const article = articles.find(a => a.id === store_relation.article)

        if(store_relation.expand && article)
            store_relation.expand.article = article;

        return store_relation;
    }) as Array<ArticleMovementsResponse<{ article: ArticleResponseExpanded, store_in: StoresResponse, store_out: StoresResponse}>>;


    const order_rows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>({ filter: `project = "${projectID}" && quantity = quantity_received `, expand: 'order,article' });
    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ filter: `project = "${projectID}"`, expand: 'article,applicant,receiver'});

    */
   
    return {
        project,
        order_rows: [],
        fabricationOrders: [],
        stores_relations: [],
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    editProject: async ({ locals, params, request }) => {

        const form = await request.formData();

        form.set('closed', String(form.has('closed')));

        try
        {
            //await locals.pb.collection(Collections.Projects).update(params.id, form);
            await locals.prisma.pr_project.update({ where: { id: params.id }, data: { 
                name: form.get("name"),
                customer: form.get("customer")
            }});
        }
        catch(e)
        {
            return fail(400, { editProject: { error: String(e) }});
        }
    }
}