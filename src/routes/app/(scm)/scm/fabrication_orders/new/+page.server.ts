import { type ArticleResponse, Collections, type UsersResponse, type FabricationOrdersResponse, type ProjectsResponse } from "$lib/DBTypes";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { Temporal } from "@js-temporal/polyfill";

export const load = (async ({ locals }) => {

    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponse>({ filter: 'internal = "true"'});
    const users = await locals.pb.collection(Collections.Users).getFullList<UsersResponse>();
    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>();

    return {
        articles: structuredClone(articles),
        users: structuredClone(users),
        projects: structuredClone(projects)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, locals }) => {

        let newFabricationOrder: FabricationOrdersResponse | undefined = undefined;

        try {
            const form = await request.formData();
            form.set("start_date", Temporal.Now.plainDateISO().toString());
            form.set("applicant", locals.user?.id ?? "");
            form.set("state", "asked");

            newFabricationOrder = await locals.pb.collection(Collections.FabricationOrders).create(form);
        }
        catch(ex)
        {
            console.log(ex)
            return { error: "Failed to create Fabrication order" };
        }

        throw redirect(303, `/app/scm/fabrication_orders/${newFabricationOrder?.id}`);
    }
}