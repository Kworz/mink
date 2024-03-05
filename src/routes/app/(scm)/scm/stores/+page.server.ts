import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const showListLinkedStores = url.searchParams.get("showListLinkedStores") === "true";
    const where = showListLinkedStores ? {} : { assemblies_buylist: { is: null }};

    const stores = await locals.prisma.scm_store.findMany({ where, include: { assemblies_buylist: true }});

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

        if(name === undefined || name.length < 4) return fail(400, { upsertStore: { error: "errors.scm.store.upsert.name-invalid", name, location }});

        await locals.prisma.scm_store.upsert({
            where: { id: id ?? '' },
            create: { name, location },
            update: { name, location }
        });

        return { upsertStore: { success: true }};
    },

    deleteStore: async ({ locals, request }) => {

        const form = await request.formData();
        const id = form.get("id")?.toString();

        const forceDelete = form.has("force") && form.get("force") === "true";

        try {
            if(!id)
                return fail(400, { deleteStore: { error: "errors.scm.store.delete.no-id-given" }});

            if(!forceDelete)
            {
                const storeRelations = await locals.prisma.scm_store_relation.count({ where: { store_id: id, quantity: { gt: 0 }}});
                const articleMovements = await locals.prisma.scm_article_movements.count({ where: { OR: [{ store_in_id: id }, { store_out_id: id }] }});
                const linkedList = await locals.prisma.scm_assembly_buylist.findFirst({ where: { store_id: id }});

                if(storeRelations > 0 || articleMovements > 0 || linkedList !== null)
                    return fail(400, { deleteStore: { error: "errors.scm.store.delete.relations-exist", storeRelations, articleMovements, linkedList }});
            }
            
            await locals.prisma.scm_store.delete({
                where: { id }
            });

            return { deleteStore: { success: true }};
        }
        catch(e)
        {
            console.error(e);
            return fail(500, { deleteStore: { error: "errors.scm.store.delete.generic" }});
        }
    }
}