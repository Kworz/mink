import type { PageServerLoad } from "./$types";
import { fail, type Actions } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    
    const users = await locals.prisma.user.findMany();
    const invitations = await locals.prisma.userInvitation.findMany();

    return { users, invitations };

}) satisfies PageServerLoad;

export const actions: Actions = {
    inviteUser: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            // create table in prisma to generate an invitation code
            const invivation = await locals.prisma.userInvitation.create({
                data: {
                    email: form.get("email") as string,
                }
            });
            
            // TODO: send email with invitation code

            return { inviteUser: { success: "Invitation has been sent" }};
        }
        catch(ex)
        {
            return fail(400, { inviteUser: { error: "Failed to send invitation" }});
        }
    }
}