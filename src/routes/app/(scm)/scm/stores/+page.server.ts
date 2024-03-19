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

    delete: async ({ locals, request }) => {

        const form = await request.formData();
        let ids = form.get("ids")?.toString();

        const forceDelete = form.has("force") && form.get("force") === "true";

        try {
            if(!ids)
                return fail(400, { delete: { error: "errors.scm.store.delete.no-id-given" }});

            if(!forceDelete)
            {
                const warnings = [];

                for(const id of ids.split(","))
                {
                    const store = await locals.prisma.scm_store.findUnique({ where: { id }});
                    const storeRelations = await locals.prisma.scm_store_relation.count({ where: { store_id: id, quantity: { gt: 0 }}});
                    const articleMovements = await locals.prisma.scm_article_movements.count({ where: { OR: [{ store_in_id: id }, { store_out_id: id }] }});
                    const linkedList = await locals.prisma.scm_assembly_buylist.findFirst({ where: { store_id: id }});
    
                    if(storeRelations > 0 || articleMovements > 0 || linkedList !== null)
                        warnings.push({ store, storeRelations, articleMovements, linkedList });
                }

                if(warnings.length > 0)
                    return fail(400, { delete: { error: "errors.scm.store.delete.relations-exist", warnings }});
            }
            
            await locals.prisma.scm_store.deleteMany({
                where: { id: { in: ids.split(",") }}
            });

            return { delete: { success: true }};
        }
        catch(e)
        {
            console.error(e);
            return fail(500, { delete: { error: "errors.scm.store.delete.generic" }});
        }
    }
}