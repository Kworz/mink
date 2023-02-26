import { Collections } from "$lib/DBTypes";
import type { FabricationOrdersResponseExpanded } from "../+page.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {

    const fabricationOrder = await locals.pb.collection(Collections.FabricationOrders).getOne<FabricationOrdersResponseExpanded>(params.id, { expand: "article,applicant,receiver"});

    return {
        fabricationOrder: structuredClone(fabricationOrder)
    };

}) satisfies PageServerLoad