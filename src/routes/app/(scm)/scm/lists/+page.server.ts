import { Collections, type AssembliesBuylistsResponse, type ProjectsResponse, type AssembliesResponse } from '$lib/DBTypes';
import type { PageServerLoad } from './$types';

export type AssembliesBuylistsResponseExpanded = AssembliesBuylistsResponse<{
    project: ProjectsResponse,
    assembly: AssembliesResponse
}>

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";
    const sort = url.searchParams.get("sort") || "assembly.name";

    const lists = await locals.pb.collection(Collections.AssembliesBuylists).getFullList({ expand: "project,assembly", filter, sort });

    return {
        lists: structuredClone(lists)
    }

}) satisfies PageServerLoad;