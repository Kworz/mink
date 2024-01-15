import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { auth } from "$lib/server/lucia";

export const actions = {

    createFirstAccount: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            const username = form.get("username")?.toString();
            const email = form.get("email")?.toString();
            const password = form.get("password")?.toString();
            const passwordConfirm = form.get("password_confirmation")?.toString();

            if(password !== passwordConfirm)
                throw new Error("Passwords do not match");

            if(username === undefined || email === undefined || password === undefined)
                throw new Error("Missing required fields");

            if(username?.length < 3)
                throw new Error("Username must be at least 3 characters long");

            const luciaAuth = auth(locals.prisma);

            await luciaAuth.createUser({
				key: {
					providerId: "username", // auth method
					providerUserId: username.toLowerCase(), // unique id when using "username" auth method
					password // hashed by Lucia
				},
                //@ts-ignore
				attributes: {
					username,
                    email
				}
			});

            const key = await luciaAuth.useKey(
				"username",
				username.toLowerCase(),
				password
			);
			const session = await luciaAuth.createSession({
				userId: key.userId,
                //@ts-ignore
				attributes: {}
			});

            locals.lucia.setSession(session); // set session cookie
            
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { error: ex as string });
        }

        throw redirect(303, "/install/setup-s3")
    }

} satisfies Actions;