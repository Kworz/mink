import { user_settings_keys } from "@prisma/client";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    return { };

}) satisfies PageServerLoad;

export const actions: Actions = {
    updateUserSettings: async ({ request, locals }) => {

        const form = await request.formData();

        try
        {
            const key = form.get("key")?.toString();
            let value = form.get("value")?.toString();

            if(form.has("checkbox"))
                value = form.has("value") ? "true" : "false";

            if(key === undefined || value === undefined)
                throw "errors.app.user_settings.update.missing_key_or_value";

            if(Object.keys(user_settings_keys).indexOf(key) === -1)
                throw "errors.app.user_settings.update.invalid_key";

            await locals.prisma.user_settings.upsert({
                where: { key: key as user_settings_keys, user_id: locals.session!.user.id },
                create: { key: key as user_settings_keys, value, user_id: locals.session!.user.id },
                update: { value }
            });

            return { updateUserSettings: { success: true }}
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { updateUserSettings: { error: "errors.app.user_settings.update.failed" }});
        }
    }
}