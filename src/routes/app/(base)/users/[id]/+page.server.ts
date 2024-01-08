import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {

    const user = await locals.prisma.user.findUnique({ where: { id: params.id }});

    if(user)
        return { user };
    else
        return fail(404, { error: "app.user.error.not-found"});

}) satisfies PageServerLoad;