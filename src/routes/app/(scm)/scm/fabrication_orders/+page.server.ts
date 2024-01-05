import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const fabricationOrders = await locals.prisma.sCMFabricationOrders.findMany();

    return {
        fabricationOrders
    }

}) satisfies PageServerLoad;