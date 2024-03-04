import type { PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {

    const ids = url.searchParams.get("ids");

    if(ids === null) return redirect(303, "/app/scm/lists?noIdGiven=true");

    const lists = await locals.prisma.scm_assembly_buylist.findMany({ where: { id: { in: ids.split(",") }}, include: { assembly: true, project: true }});
    const referenceList = lists.at(0);

    // Check if all lists are from the same assembly
    if(referenceList === undefined || lists.some(list => list.assembly !== referenceList.assembly)) return redirect(303, "/app/scm/lists");
    
    const flattenAssemblyReference = await flatAssembly(referenceList.assembly_id, locals.prisma); //TODO: Replace old assembly flattening function
    const storeRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: { in: lists.map(k => k.store_id) }}});

    return {
        lists,
        storeRelations,
        flattenAssemblyReference: structuredClone(flattenAssemblyReference),
    };

}) satisfies PageServerLoad;
