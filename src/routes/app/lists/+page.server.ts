import { error, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Collections, type ListResponse, type NomenclatureResponse, type ProjectsResponse } from "$lib/DBTypes";

export type ListResponseExpanded = ListResponse<{
    parent_nomenclature: NomenclatureResponse,
    project: ProjectsResponse
}>;

export const load = (async ({ locals }) => {

    try
    {
        const lists = await locals.pb.collection(Collections.List).getFullList<ListResponseExpanded>(undefined, {
            expand: "parent_nomenclature,project"
        });

        const nomenclatures = await locals.pb.collection(Collections.Nomenclature).getFullList<NomenclatureResponse>();
        const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>();

        return {
            lists: structuredClone(lists),
            nomenclatures: structuredClone(nomenclatures),
            projects: structuredClone(projects)
        }
    }
    catch(ex)
    {
        console.log(ex);
        throw error(500, "Failed to load lists");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    newList: async ({ request, locals }) => {

        let list: ListResponse | undefined = undefined;
        try
        {
            const form = await request.formData();
            list = await locals.pb.collection(Collections.List).create<ListResponse>(form);
        }
        catch(ex)
        {
            return { error: "Failed to create list" };
        }

        throw redirect(303, `/app/list/${list.id}`);
    }
}