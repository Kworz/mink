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
    createInterest: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            const interest = await locals.prisma.crm_interest.create({
                data: form
            });

            return { createInterest: { success: interest }};
        }
        catch(ex)
        {
            return fail(500, { createInterest: { error: ex }});
        }
    },
    editInterest: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            const id = form.get("id");

            if(id === null)
                throw "Missing id";

            await locals.prisma.crm_interest.update({ where: { id: id.toString() }, data: form });

            return { editInterest: { success: true }};

        }
        catch(ex)
        {
            return fail(500, { editInterest: { error: ex }});
        }
    },
    deleteInterest: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            const id = form.get("id");

            if(id === null)
                throw "Missing id";

            await locals.prisma.crm_interest.delete({ where: { id: id.toString() }});
            
            return { deleteInterest: { success: true }};

        }
        catch(ex)
        {
            return fail(500, { deleteInterest: { error: ex }});
        }
    }
}