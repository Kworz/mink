import { redirect, type Actions, fail } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";

export const actions: Actions = {
    default: async ({ request, locals }) => {

        const formData = await request.formData();

        const authValidator = auth(locals.prisma);

        try {
            
            const password = formData.get("password")?.toString();
            const username = formData.get("username")?.toString();
            const email = formData.get("email")?.toString();

            if(password === undefined || username === undefined || email === undefined)
            {
                throw "invalid form data";
            }

            await authValidator.createUser({
				key: {
					providerId: "username", // auth method
					providerUserId: username.toLowerCase(), // unique id when using "username" auth method
					password // hashed by Lucia
				},
				attributes: {
					username
				}
			});

        }
        catch(ex)
        {            
            console.log(ex);
            return fail(400, { error: ex || 'failed to create account' });
        }

        throw redirect(303, "/login?registered=true");
    }
}