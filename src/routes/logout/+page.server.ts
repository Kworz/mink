import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { auth as authServer } from "$lib/server/lucia";

export const load = (async ({ locals }) => {

    const session = await locals.auth.validate();
    
    if (!session)
        throw redirect(302, "/login");

    await authServer(locals.prisma).invalidateSession(session.sessionId);
    locals.auth.setSession(null);

    throw redirect(302, "/login");

}) satisfies PageServerLoad;