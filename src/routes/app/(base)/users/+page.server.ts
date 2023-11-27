import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    
    const users = await locals.prisma.user.findMany();
    return { users };

}) satisfies PageServerLoad;

export const actions: Actions = {
    inviteUser: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            // create table in prisma to generate an invitation code
        }
        catch(ex)
        {
            return { inviteUser: { error: ex }};
        }
    }
}