import type { PageServerLoad } from "./$types";
import { Collections, type ProjectsResponse, type UsersResponse } from "$lib/DBTypes";

type ProjectsResponseExpanded = ProjectsResponse<{
    attached_users: Array<UsersResponse>
}>;

export const load = (async ({ locals }) => {

    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponseExpanded>(undefined, { expand: "attached_users" });

    return {
        projects: structuredClone(projects)
    }

}) satisfies PageServerLoad;