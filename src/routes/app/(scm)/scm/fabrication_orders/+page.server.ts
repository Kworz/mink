import { articleIncludeQuery } from "$lib/components/derived/article/article";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const fabricationOrders = await locals.prisma.scm_fabrication_order.findMany({ include: { article: { include: articleIncludeQuery }, project: true, askedBy: true, receiver: true }});

    return {
        fabricationOrders
    }

}) satisfies PageServerLoad;