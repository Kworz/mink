import { Collections, type UsersResponse } from "$lib/DBTypes";
import { redirect, type Actions, fail } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request, locals }) => {

        const formData = await request.formData();

        try {
            const user = await locals.pb.collection(Collections.Users).create<UsersResponse>(formData);            
        }
        catch(ex)
        {            
            console.log(ex);
            return fail(400, { error: 'failed to create account'});
        }

        throw redirect(303, "/auth/login");
    }
}