import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    if(locals.user !== undefined)
    {
        console.log("user is already logged in redirect");
        throw redirect(303, "/app");
    }

    return {};

}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, locals }) => {

        const formData = await request.formData();

        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        try
        {
            if(email !== undefined && password !== undefined)
            {
                await locals.pb.collection('users').authWithPassword(email, password);

                console.log(locals.user);
            }
            else
            {
                return {
                    error: "Failed to login with given data"
                }
            }

        }
        catch(ex)
        {
            return {
                error: 'Wrong username or password'
            }
        }

        throw redirect(303, '/app');
    }
}