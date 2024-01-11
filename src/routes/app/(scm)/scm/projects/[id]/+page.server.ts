import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { articleIncludeQuery } from "$lib/components/derived/article/article";

export const load = (async ({ locals, params }) => {

    const projectID = params.id;

    const project = await locals.prisma.pr_project.findUniqueOrThrow({ where: { id: projectID }, include: {

        manufacturing_orders: { include: { article: { include: articleIncludeQuery }, askedBy: true, receiver: true }},
        order_rows: { include: { order: true, article: { include: articleIncludeQuery }}},
        assembly_buylists: true

    }});

    return {
        project
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    editProject: async ({ locals, params, request }) => {

        const form = await request.formData();
        form.set('closed', String(form.has('closed')));

        try
        {
            await locals.prisma.pr_project.update({ where: { id: params.id }, data: { 
                name: form.get("name")?.toString(),
                customer: form.get("customer")?.toString()
            }});

            return { editProject: { success: true }};
        }
        catch(e)
        {
            return fail(400, { editProject: { error: String(e) }});
        }
    }
}