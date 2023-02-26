import { Collections, type ArticleResponse, type FabricationOrdersResponse, type UsersResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export type FabricationOrdersResponseExpanded = FabricationOrdersResponse<{
    article: ArticleResponse,
    applicant: UsersResponse,
    receiver: UsersResponse
}>

export const load = (async ({ locals }) => {

    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ expand: 'article,applicant,receiver'});

    return {
        fabricationOrders: structuredClone(fabricationOrders)
    }

}) satisfies PageServerLoad;