import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { NomenclatureResponse } from "$lib/DBTypes";

export const load = (async ({ locals }) => {

    const nomenclatures = await locals.pb.collection("nomenclature").getFullList(undefined, {
        expand: "nomenclature_row(parent_nomenclature).child_group,nomenclature_row(parent_nomenclature).child_article,created_by"
    });

    return {
        nomenclatures: structuredClone(nomenclatures),
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    newNomenclature: async ({ request, locals}) => {

        let nomenclature: NomenclatureResponse | undefined = undefined;
        
        try
        {
            const form = await request.formData();
            if(locals.user?.id !== undefined)
                form.set("created_by", locals.user.id);
            nomenclature = await locals.pb.collection("nomenclature").create<NomenclatureResponse>(form);
        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to create nomenclature" };
        } 

        throw redirect(303, `/app/nomenclatures/${nomenclature.id}`)
    }
}