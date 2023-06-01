import { Collections, type ArticleResponse, type FabricationOrdersResponse, type UsersResponse, type ProjectsResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export type FabricationOrdersResponseExpanded = FabricationOrdersResponse<{
    article: ArticleResponse,
    applicant: UsersResponse,
    receiver: UsersResponse,
    project: ProjectsResponse
}>

export const load = (async ({ locals }) => {

    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ expand: 'article,applicant,receiver,project'});

    return {
        fabricationOrders: structuredClone(fabricationOrders)
    }

}) satisfies PageServerLoad;