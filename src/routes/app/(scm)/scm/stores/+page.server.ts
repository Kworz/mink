import type { Actions, PageServerLoad } from "./$types";
import type { scm_store } from "@prisma/client";

export const load = (async ({ locals }) => {
    const stores = await locals.prisma.scm_store.findMany();

    return { 
        stores
    }
})  satisfies PageServerLoad;

export const actions: Actions = {
    createStore: async ({ locals, request }) => {
        const form = await request.formData();

        try {
            await locals.prisma.scm_store.create({
                data: {
                    ...Object.fromEntries(form) as unknown as scm_store,
                    temporary: form.has("temporary") && form.get("temporary") === "true"
                }
            });
            return { createStore: { success: "scm.store.create.success" }};
        }
        catch(e)
        {
            return { createStore: { error: "scm.store.create.error" }};
        }
    },
    editStore: async ({ locals, request }) => {
        const form = await request.formData();

        const id = form.get("id")?.toString();

        try {
            if(!id)
                throw "scm.store.update.error";
            
            await locals.prisma.scm_store.update({
                where: { id },
                data: {
                    ...Object.fromEntries(form) as unknown as scm_store,
                    temporary: form.has("temporary") && form.get("temporary") === "true"
                }
            });
            return { editStore: { success: "scm.store.update.success" }};
        }
        catch(e)
        {
            return { editStore: { error: "scm.store.update.error" }}
        }
    },
    deleteStore: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get("id")?.toString();

        try {
            if(!id)
                throw "scm.store.delete.error";
            
            await locals.prisma.scm_store.delete({
                where: { id }
            });
            return { deleteStore: { success: "scm.store.delete.success" }};
        }
        catch(e)
        {
            return { deleteStore: { error: "scm.store.delete.error" }}
        }
    }
}