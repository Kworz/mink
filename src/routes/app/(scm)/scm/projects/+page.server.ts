import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {

    const showClosed = url.searchParams.get("showClosed") === "true";

    const projects = await locals.prisma.sCMProject.findMany({ where: { closed: !showClosed }, include: { attached_users: { include: { user: true }}}});
    const users = await locals.prisma.user.findMany();

    return {
        projects,
        users
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createProject: async ({ locals, request }) => {

        const form = await request.formData();
        let createdProject = null;

        try
        {
            const name = form.get("name")?.toString();

            if(name === null)
                throw new Error("Name is required");

            createdProject = await locals.prisma.sCMProject.create({
                data: {
                    name
                }
            });
        }
        catch(ex)
        {
            return fail(400, { createProject: { error: "Failed to create project" }});
        }

        throw redirect(302, `/app/scm/projects/${createdProject.id}`);
    }
}