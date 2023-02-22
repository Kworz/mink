import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const nomenclatures = await locals.pb.collection("nomenclature").getFullList(undefined, {
        expand: "nomenclature_row(parent_nomenclature).child_group,nomenclature_row(parent_nomenclature).child_article,created_by"
    })

    return {
        nomenclatures: structuredClone(nomenclatures),
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    newNomenclature: async ({ request, locals}) => {
        try
        {
            const form = await request.formData();
            const nomenclature = await locals.pb.collection("nomenclature").create(form);

            throw redirect(303, '/app/nomenclature/' + nomenclature.id)

        }
        catch(ex)
        {
            console.log(ex);
            return { error: "Failed to create nomenclature" };
        } 
    }
}