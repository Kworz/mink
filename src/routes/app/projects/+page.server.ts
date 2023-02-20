import type { PageServerLoad } from "./$types";
import { Collections, type ProjectsResponse } from "$lib/DBTypes";

export const load = (async ({ locals }) => {

    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>(undefined, { expand: "attached_users" });

    return {
        projects: structuredClone(projects)
    }

}) satisfies PageServerLoad;