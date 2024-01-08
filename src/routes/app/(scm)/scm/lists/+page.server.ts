import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import type { scm_assembly_buylist } from '@prisma/client';

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";
    const sort = url.searchParams.get("sort") || "assembly.name";

    const lists = await locals.prisma.scm_assembly_buylist.findMany({ include: { project: true, assembly: true }});

    const assemblies = await locals.prisma.scm_assembly.findMany();
    const projects = await locals.prisma.pr_project.findMany();

    return {
        lists,
        assemblies,
        projects
    }

}) satisfies PageServerLoad;

export const actions = {

    createBuyList: async ({ locals, request }) => {

        let createdList: scm_assembly_buylist | scm_assembly_buylist[] = [];

        const form = await request.formData();

        try {

            const name = form.get("name")?.toString();
            const assembly_id = form.get("assembly_id")?.toString();
            const project_id = form.get("project_id")?.toString();

            const listAmountStr = form.get("list_amount")?.toString();
            const listAmount = Number(listAmountStr);

            if(!name || !assembly_id || !project_id || !listAmountStr) {
                throw new Error("Missing required fields");
            }

            if(isNaN(listAmount))
            {
                createdList = await locals.prisma.scm_assembly_buylist.create({
                    data: {
                        name,
                        assembly_id,
                        project_id
                    }
                });
            }
            else
            {
                createdList = [];
                for(let i = 0; i < listAmount; i++)
                {
                    const list = await locals.prisma.scm_assembly_buylist.create({
                        data: {
                            name: `${name} ${i + 1}`,
                            assembly_id,
                            project_id
                        }
                    });
                    createdList.push(list);
                }
            }
        }
        catch(ex)
        {
            return fail(400, { createLists: { error: "Failed to create lists" }});
        }

        if(createdList instanceof Array)
        {
            throw redirect(302, `/app/scm/lists/grid/?ids=${createdList.map(k => k.id).join(",")}`);
        }
        else
        {
            throw redirect(302, `/app/scm/lists/${createdList.id}`)
        }
    }

} satisfies Actions;