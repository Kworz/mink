import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { lucia } from "$lib/server/lucia";
import { hash } from "argon2";

export const load = (async ({ locals }) => {

    const userCount = await locals.prisma.user.count();

    if(userCount > 0)
        return redirect(303, "/install/setup-s3");

}) satisfies PageServerLoad;

export const actions = {

    createFirstAccount: async ({ locals, request, cookies }) => {
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

            const hashedPassword = await hash(password); // hash password using argon2

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
            return fail(400, { error: ex as string });
        }

        throw redirect(303, "/install/setup-s3")
    }

} satisfies Actions;