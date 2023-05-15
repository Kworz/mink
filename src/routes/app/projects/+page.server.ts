import type { Actions, PageServerLoad } from "./$types";
import { Collections, type ProjectsResponse, type UsersResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";

type ProjectsResponseExpanded = ProjectsResponse<{
    attached_users: Array<UsersResponse>
}>;

export const load = (async ({ locals }) => {

    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponseExpanded>(undefined, { expand: "attached_users" });
    const users = await locals.pb.collection(Collections.Users).getFullList<UsersResponse>();

    return {
        projects: structuredClone(projects),
        users: structuredClone(users)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createProject: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            await locals.pb.collection(Collections.Projects).create(form);
            return { createProject: { success: true }};
        }
        catch(ex)
        {
            return { createProject: { error: (ex instanceof ClientResponseError) ? ex.message : ex } };
        }
    }
}