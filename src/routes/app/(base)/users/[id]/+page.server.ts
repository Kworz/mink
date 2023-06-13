import { Collections, type UsersResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {

    const { id } = params;

    try {
        const user = await locals.pb.collection(Collections.Users).getOne<UsersResponse>(id);

        return {
            user: structuredClone(user)
        }
    }
    catch(ex)
    {
        return { status: 404, error: "User not found" }
    }

}) satisfies PageServerLoad;