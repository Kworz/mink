import type { Actions, PageServerLoad } from "./$types";
import type { SCMStore } from "@prisma/client";

export const load = (async ({ locals }) => {
    const stores = await locals.prisma.sCMStore.findMany();

    return { 
        stores
    }
})  satisfies PageServerLoad;

export const actions: Actions = {
    createStore: async ({ locals, request }) => {
        const form = await request.formData();

        try {
            await locals.prisma.sCMStore.create({
                data: {
                    ...Object.fromEntries(form) as unknown as SCMStore,
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
            
            await locals.prisma.sCMStore.update({
                where: { id },
                data: {
                    ...Object.fromEntries(form) as unknown as SCMStore,
                    temporary: form.has("temporary") && form.get("temporary") === "true"
                }
            });
            return { editStore: { success: "scm.store.update.success" }};
        }
        catch(e)
        {
            return { editStore: { error: "scm.store.update.error" }}
        }
    }
}