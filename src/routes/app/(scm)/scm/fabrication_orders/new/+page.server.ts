import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import { scm_fabrication_order_state } from "@prisma/client";

export const load = (async ({ locals }) => {

    const articles = await locals.prisma.scm_article.findMany({ include: articleIncludeQuery });
    const users = await locals.prisma.user.findMany();
    const projects = await locals.prisma.pr_project.findMany();

    return {
        articles,
        users,
        projects
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, locals }) => {

        const form = await request.formData();

        const articleId = form.get("article")?.toString();
        const receiverId = form.get("receiver")?.toString();
        const quantity = Number(form.get("quantity")?.toString());

        if(articleId === undefined)
            return fail(400, { error: "Article not found" });

        if(Number.isNaN(quantity))
            return fail(400, { error: "Quantity is not a number" });

        const fabricationOrder = await locals.prisma.scm_fabrication_order.create({
            data: {
                article_id: articleId,
                askedBy_id: locals.session!.user.id,
                receiver_id: receiverId,
                state: scm_fabrication_order_state.draft,
                quantity,
            }
        });

        if(fabricationOrder === undefined) return fail(400, { error: "Failed to create Fabrication order" });

        return redirect(303, `/app/scm/fabrication_orders/${fabricationOrder.id}`);
    }
}