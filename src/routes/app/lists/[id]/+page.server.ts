import { Collections } from "$lib/DBTypes";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad, Actions } from "./$types";

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

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            const buyListRelation = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFirstListItem(`article = "${form.get("article")}" && buylist = "${form.get("buylist")}"`);
            await locals.pb.collection(Collections.AssembliesBuylistsRows).update(buyListRelation.id, { quantity: form.get("quantity") });
        }
        catch(ex)
        {
            console.log(ex);
            try
            {
                await locals.pb.collection(Collections.AssembliesBuylistsRows).create({ article: form.get("article"), buylist: form.get("buylist"), quantity: form.get("quantity") });
            }
            catch(ex)
            {
                console.log(ex)
                return { buyListRelationEdit: { error: "Failed to create row" }}
            }
        }
        return { buyListRelationEdit: { success: "Successfully Created/updated row row" }};
    }
};