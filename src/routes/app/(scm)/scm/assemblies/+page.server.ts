import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.has("filter") ? JSON.parse(decodeURIComponent(url.searchParams.get("filter") as string)) : undefined;

    const assemblies = await locals.prisma.scm_assembly.findMany({
        where: filter,
    });

    return {
        assemblies,
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createAssembly: async ({ locals, request }) => {

        const form = await request.formData();
        const name = form.get("name")?.toString();
        const description = form.get("description")?.toString();

        if(!name || name.length === 0) return fail(400, { createAssembly: { error : "errors.scm.assembly.create.name_null", name, description }});

        const { id } = await locals.prisma.scm_assembly.create({
            data: { name, description }
        });

        if(id === null) return fail(500, { createAssembly: { error : "errors.scm.assembly.create.failed", name, description }});

        return redirect(303, `/app/scm/assemblies/${id}`);
    }
}