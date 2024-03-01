import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { scm_store } from "@prisma/client";

export const load = (async ({ locals }) => {
    const stores = await locals.prisma.scm_store.findMany();

    return { 
        stores
    }
})  satisfies PageServerLoad;

export const actions: Actions = {
    upsertStore: async ({ locals, request }) => {
        const form = await request.formData();

        const id = form.get("id")?.toString();

        const name = form.get("name")?.toString();
        const location = form.get("location")?.toString();
        const temporary = form.has("temporary") && form.get("temporary") === "true";
        
        if(name === undefined || name.length === 0) return fail(400, { upsertStore: { error : "scm.store.upsert.error.name_null", name, location, temporary }});

        await locals.prisma.scm_store.upsert({
            where: { id: id || '' },
            create: { name, location, temporary },
            update: { name, location, temporary }
        });

        return { upsertStore: { success: true }};
    },

    deleteStore: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get("id")?.toString();

        try {
            if(!id)
                return fail(400, { deleteStore: { error: "errors.scm.store.delete.no-id-given" }});
            
            await locals.prisma.scm_store.delete({
                where: { id }
            });

            return { deleteStore: { success: true }};
        }
        catch(e)
        {
            return fail(500, { deleteStore: { error: "errors.scm.store.delete.error" }});
        }
    }
}