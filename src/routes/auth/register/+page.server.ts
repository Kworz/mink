import { redirect, type Actions, fail } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request, locals }) => {

        const formData = await request.formData();

        try {
            await locals.pb.collection("users").create(formData);
        }
        catch(ex)
        {            
            return fail(400, { error: 'failed to create account'});
        }

        throw redirect(303, "/auth/login");
    }
}