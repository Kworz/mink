import { Collections, type UsersResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {

    const { id } = params;

    try {
        const user = await locals.prisma.user.findUnique({ where: { id }});

        return {
            user
        }
    }
    catch(ex)
    {
        return { status: 404, error: "User not found" }
    }

}) satisfies PageServerLoad;