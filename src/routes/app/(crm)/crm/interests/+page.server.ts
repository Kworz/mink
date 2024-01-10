import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    try
    {
        const interests = await locals.prisma.crm_interest.findMany();
        return { interests };
    }
    catch(ex)
    {
        throw redirect(303, "/app/crm");
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    upsertInterest: async ({ locals, request }) => {

        const form = await request.formData();

        const id = form.get("id")?.toString();

        const name = form.get("name")?.toString();
        if(name === undefined || name.length === 0) return fail(400, { upsertInterest: { error : "crm.interest.upsert.error.name_null" }});

        const color = form.get("color")?.toString();
        if(color === undefined || color.length === 0) return fail(400, { upsertInterest: { error : "crm.interest.upsert.error.color_null" }});

        const description = form.get("description")?.toString();

        await locals.prisma.crm_interest.upsert({
            create: { name, description, color },
            update: { name, description, color },
            where: { id: id || '' }
        });

        return { upsertInterest: { success: true }};
    },

    deleteInterest: async ({ locals, request }) => {

        const form = await request.formData();
        
        const id = form.get("id")?.toString();
        if(!id) return fail(400, { deleteInterest: { error: "crm.interest.delete.error.id_null" }});

        await locals.prisma.crm_interest.delete({ where: { id: id }});
    }
}