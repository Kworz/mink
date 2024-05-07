import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getSettings } from "$lib/server/settings";
import type { app_settings_keys } from "@prisma/client";
import Prisma from "@prisma/client";

export const load = (async ({ locals }) => {

    try
    {
        const storedSettings = await locals.prisma.app_settings.findMany();
        const settings = getSettings(storedSettings);

        if(settings === undefined)
            throw "App settings are undefined.";

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

            if(Object.keys(Prisma.app_settings_keys).indexOf(key) === -1)
                throw "app.settings.update.error.invalid_key";

            await locals.prisma.app_settings.upsert({
                where: { key: key as app_settings_keys },
                create: { key: key as app_settings_keys, value },
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