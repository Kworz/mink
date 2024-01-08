import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const fabricationOrders = await locals.prisma.scm_fabrication_order.findMany();

    return {
        fabricationOrders
    }

}) satisfies PageServerLoad;