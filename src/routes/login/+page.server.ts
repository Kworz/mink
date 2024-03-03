import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/lucia";
import { verify } from "argon2";

export const actions: Actions = {
    default: async ({ request, locals, url, cookies }) => {

        const targetPage = url.searchParams.get('target');

        const formData = await request.formData();

        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();

        try
        {

            if(username === undefined || password === undefined)
                return fail(400, { error: 'errors.app.login.incomplete_username_or_password' })

            const user = await locals.prisma.user.findUnique({
                where: {
                    username: username.toLowerCase()
                },
                select: {
                    id: true,
                    hashed_password: true
                }
            });

            if(!user)
                return fail(400, { error: 'errors.app.login.incorrect_username' });

            const loginHashedPassword = await verify(user.hashed_password, password);

            if(!loginHashedPassword)
                return fail(400, { error: 'errors.app.login.incorrect_password' });

            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });

        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { error: 'errors.app.login.generic' });
        }

        throw redirect(303, targetPage ? decodeURIComponent(targetPage) : '/app');
    }
}