import { redirect } from "@sveltejs/kit";
import type { Actions } from "../$types";

export const actions: Actions = {
    create: async ({ request, locals }) =>
    {
        const formData = await request.formData();

        try
        {
            await locals.pb.collection('article').create(formData);
            throw redirect(303, "/articles");
        }
        catch(err)
        {
            console.log(err);

            return { error: "Failed to create object" };
        }
    }
};