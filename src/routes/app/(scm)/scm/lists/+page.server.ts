import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import type { scm_assembly_buylist } from '@prisma/client';

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.has("filter") ? JSON.parse(atob(url.searchParams.get("filter") as string)) : undefined;
    const sort = url.searchParams.has("sort") ? JSON.parse(atob(url.searchParams.get("sort") as string)) : undefined;

    const lists = await locals.prisma.scm_assembly_buylist.findMany({ include: { project: true, assembly: true }, where: filter, orderBy: sort });

    const assemblies = await locals.prisma.scm_assembly.findMany();
    const projects = await locals.prisma.pr_project.findMany();

    return {
        lists,
        assemblies,
        projects
    }

}) satisfies PageServerLoad;

export const actions = {

    createList: async ({ locals, request }) => {

        const form = await request.formData();

        const name = form.get("name")?.toString();

        const storeLocation = form.get("store_location")?.toString();

        if(name === undefined || name.length < 4)
            return fail(400, { createList: { error: "errors.scm.lists.create.name-invalid" }});

        const assemblyId = form.get("assembly_id")?.toString();

        const assembly = await locals.prisma.scm_assembly.findUnique({ where: { id: assemblyId }});
    
        if(assembly === null)
            return fail(400, { createList: { error: "errors.scm.lists.create.assembly-not-found" }});

        const projectId = form.get("project_id")?.toString();

        const listAmountStr = form.get("list_amount")?.toString();
        const listAmount = Number(listAmountStr);

        if(isNaN(listAmount))
        {
            const store = await locals.prisma.scm_store.create({
                data: { 
                    name,
                    temporary: true,
                    location: storeLocation,

                    assemblies_buylists: {
                        create: {
                            name,
                            assembly_id: assembly.id,
                            project_id: projectId,
                        }
                    }
                },
                include: { assemblies_buylists: true },
            });

            const listId = store.assemblies_buylists.find(k => k.store_id === store.id)?.id;

            if(listId === undefined)
            {
                console.error("Failed to find created list store");
                return fail(500, { createList: { error: "errors.generic" }});
            }

            return redirect(302, `/app/scm/lists/${listId}`);
        }
        else
        {
            const createdLists = [];
            for(let i = 0; i < listAmount; i++)
            {
                const store = await locals.prisma.scm_store.create({
                    data: { 
                        name,
                        temporary: true,
                        location: storeLocation,

                        assemblies_buylists: {
                            create: {
                                name,
                                assembly_id: assembly.id,
                                project_id: projectId,
                            }
                        }
                    },
                    include: { assemblies_buylists: true },
                });
                const listId = store.assemblies_buylists.find(k => k.store_id === store.id)?.id;

                if(listId === undefined)
                {
                    console.error("Failed to find created list store");
                    return fail(500, { createList: { error: "errors.generic" }});
                }
                createdLists.push(listId);
            }

            return redirect(302, `/app/scm/lists/grid/?ids=${createdLists.join(",")}`);
        }
    }
} satisfies Actions;