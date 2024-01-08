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
        const name = form.get("name")?.toString();

        try {
            
            if(!name) throw 'scm.assembly.create.error.name.null';

            const { id } = await locals.prisma.scm_assembly.create({
                data: { name }
            });

            return redirect(303, `/app/scm/assemblies/${id}`);
        }
        catch (ex)
        {    
            return fail(500, { createAssembly: { name, error: String(ex) }});
        }
    }
}