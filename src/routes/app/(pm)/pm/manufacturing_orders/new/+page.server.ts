import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import Prisma from "@prisma/client";

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

        let endDate: string | Date | undefined = form.get("end_date")?.toString();
        endDate = endDate ? new Date(endDate) : undefined;

        if(articleId === undefined)
            return fail(400, { error: "Article not found" });

        if(Number.isNaN(quantity))
            return fail(400, { error: "Quantity is not a number" });

        const manufacturingOrder = await locals.prisma.scm_manufacturing_order.create({
            data: {
                article_id: articleId,
                askedBy_id: locals.user!.id,
                receiver_id: receiverId,
                state: Prisma.scm_manufacturing_order_state.draft,
                end_date: endDate,
                quantity
            }
        });

        if(manufacturingOrder === undefined) return fail(400, { error: "Failed to create Manufacturing order" });

        return redirect(303, `/app/scm/manufacturing_orders/${manufacturingOrder.id}`);
    }
}