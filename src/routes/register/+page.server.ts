import { redirect, type Actions, fail } from "@sveltejs/kit";
import { lucia } from "$lib/server/lucia";
import { hash } from "argon2";

export const actions: Actions = {
    default: async ({ request, locals, cookies }) => {

        const formData = await request.formData();

        try {
            
            const password = formData.get("password")?.toString();
            const username = formData.get("username")?.toString();
            const email = formData.get("email")?.toString();

            if(password === undefined || username === undefined || email === undefined)
            {
                throw "invalid form data";
            }

            const hashedPassword = await hash(password);

            const { id } = await locals.prisma.user.create({
                data: {
                    username,
                    email,
                    hashed_password: hashedPassword
                }
            });

            const session = await lucia.createSession(id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);

            cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });

        }
        catch(ex)
        {            
            console.log(ex);
            return fail(400, { error: ex || 'failed to create account' });
        }

        throw redirect(303, "/login?registered=true");
    }
}