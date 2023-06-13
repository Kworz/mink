import { Collections, type UsersResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    try
    {
        const users = await locals.pb.collection(Collections.Users).getFullList<UsersResponse>();

        return { users: structuredClone(users) };
    }
    catch(ex)
    {
        return { error: (ex instanceof ClientResponseError) ? ex.message : ex }
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createUser: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            await locals.pb.collection(Collections.Users).create<UsersResponse>(form);
            return { createUser: { success: "Created user successfully" }};
        }
        catch(ex)
        {
            return { createUser: { error: (ex instanceof ClientResponseError) ? ex.message : ex }};
        }
    }
}