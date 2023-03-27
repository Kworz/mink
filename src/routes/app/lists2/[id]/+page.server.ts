import { Collections } from "$lib/DBTypes";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {

    const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne(params.id, { expand: "assembly,project"});
    const listItems = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFullList({ filter: `buylist = "${list.id}"`});
    const flattenAssemblyResult = await flattenAssembly(list.expand.assembly, locals.pb);

    return {
        list: structuredClone(list),
        listItems: structuredClone(listItems), 
        flattenAssemblyResult: structuredClone(flattenAssemblyResult)
    }

}) satisfies PageServerLoad;