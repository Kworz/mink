import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";

    const assemblies = await locals.prisma.scm_assembly.findMany();

    return {
        assemblies,
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createAssembly: async ({ locals, request }) => {
        const form = await request.formData();

        let createAssemblyID = "";

        try {

            const name = form.get("name")?.toString();

            if (!name) {
                throw new Error("Name is required");
            }

            const { id } = await locals.prisma.scm_assembly.create({
                data: {
                    name
                }
            });

            createAssemblyID = id;
        }
        catch (ex) {
            
            return fail(500, { createAssembly: { error: String(ex) }});
        }

        throw redirect(303, `/app/scm/assemblies/${createAssemblyID}`);
    }
}