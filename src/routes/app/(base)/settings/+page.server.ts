import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getSettings } from "$lib/server/settings";

export const load = (async ({ locals }) => {

    try
    {
        const storedSettings = await locals.prisma.appSettings.findMany();
        const settings = getSettings(storedSettings);

        return { 
            settings
        }
    }
    catch(ex)
    {
        console.log(ex);
        throw redirect(302, "/app/");
    }


}) satisfies PageServerLoad;

export const actions: Actions = {
    updateSetting: async ({ request, locals }) => {

        const form = await request.formData();

        try
        {
            const key = form.get("key")?.toString();
            const value = form.get("value")?.toString();

            if(key === undefined || value === undefined)
                throw "app.settings.update.error.missing_key_or_value";

            await locals.prisma.appSettings.upsert({
                where: { key },
                create: { key, value },
                update: { value }
            });

            return {
                status: 200,
                body: { success: "app.settings.update.success" }
            }
        }
        catch(ex)
        {
            console.log(ex);
            throw fail(400, {
                error: "app.settings.update.error.generic",
                message: ex
            })
        }
    }
}