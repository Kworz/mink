import { articleIncludeQuery } from "$lib/components/derived/article/article";
import type { scm_manufacturing_order_state } from "@prisma/client";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const showCompleted = url.searchParams.get('show_completed') === 'true';
    const showCancelled = url.searchParams.get('show_cancelled') === 'true';

    const manufacturingOrderFilter: scm_manufacturing_order_state[] = ["draft", "in_progress", "ready"];

    if(showCompleted) manufacturingOrderFilter.push("completed");
    if(showCancelled) manufacturingOrderFilter.push("cancelled");

    const manufacturingOrders = await locals.prisma.scm_manufacturing_order.findMany({ where: {state: { in: manufacturingOrderFilter }}, include: { article: { include: articleIncludeQuery }, project: true, askedBy: true, receiver: true }});

    return {
        manufacturingOrders
    }

}) satisfies PageServerLoad;