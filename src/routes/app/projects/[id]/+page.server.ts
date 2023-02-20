import { Collections, type ProjectsResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "../$types";

export const load = (async ({ locals, params }) => {

    const projectID = params.id;

    const project = await locals.pb.collection(Collections.Projects).getOne<ProjectsResponse>(projectID);

    return {
        project: structuredClone(project)
    }

}) satisfies PageServerLoad;