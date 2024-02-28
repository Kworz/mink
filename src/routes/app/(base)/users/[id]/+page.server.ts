import type { PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {

    const user = await locals.prisma.user.findUnique({ where: { id: params.id }});

    if(user)
    {
        if(user.id === locals.user?.id) return redirect(303, "/app/me");

        return { user };
    }
    else
        return fail(404, { error: "app.user.error.not-found"});

}) satisfies PageServerLoad;