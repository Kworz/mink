import { Collections } from "$lib/DBTypes";
import { redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    import: async ({ request, locals }) => {
        try
        {
            const form = await request.formData();

            const file = form.get("file") as File;
    
            console.log(await file.text());
    
            const json: Array<{name: string, quantity: number, reference: string, manufacturer: string, price: number}> = JSON.parse(await file.text());
    
            for(const row of json)
            {
                await locals.pb.collection(Collections.Article).create(row);
            }
    
            throw redirect(303, "/app/articles");
        }
        catch(ex)
        {
            console.log(ex);
            return { error: true }
        }
    }
}