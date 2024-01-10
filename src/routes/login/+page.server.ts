import { redirect, type Actions } from "@sveltejs/kit";
import { auth as authServer } from "$lib/server/lucia";

export const actions: Actions = {
    default: async ({ request, locals, url }) => {


        const targetPage = url.searchParams.get('target');

        const formData = await request.formData();

        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();

        try
        {

            if(username === undefined || password === undefined)
                throw "invalid params";

            const auth = authServer(locals.prisma);

			const key = await auth.useKey(
				"username",
				username.toLowerCase(),
				password
			);
			const session = await auth.createSession({
				userId: key.userId,
                //@ts-ignore
				attributes: {}
			});

            locals.lucia.setSession(session); // set session cookie

        }
        catch(ex)
        {
            console.log(ex);
            return {
                error: 'Wrong username or password'
            }
        }

        throw redirect(303, targetPage ? atob(targetPage) : '/app');
    }
}