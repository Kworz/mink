import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
    updateUserSettings: async ({ request, locals }) => {

        if(locals.user === null)
            return fail(401, { updateUserSettings: { error: "errors.app.user_settings.update.not_authenticated" }});

        const form = await request.formData();

        const appLanguage = form.get("app_language")?.toString();

        if(appLanguage === undefined || ["fr", "en"].includes(appLanguage) === false)
            return fail(400, { updateUserSettings: { error: "errors.app.user_settings.update.no_app_language" }});

        const appMenuLeft = form.has("app_menu_left") ? "true" : "false";
        const appPagesTopOfTable = form.has("app_pages_top_of_table") ? "true" : "false";

        try
        {
            await locals.prisma.user_settings.upsert({
                where: { user_id_key: { key: "app_language", user_id: locals.user!.id }},
                create: { key: "app_language", value: appLanguage, user_id: locals.user!.id },
                update: { value: appLanguage }
            });
    
            await locals.prisma.user_settings.upsert({
                where: { user_id_key: { key: "app_menu_left", user_id: locals.user!.id }},
                create: { key: "app_menu_left", value: appMenuLeft, user_id: locals.user!.id },
                update: { value: appMenuLeft }
            });
    
            await locals.prisma.user_settings.upsert({
                where: { user_id_key: { key: "app_pages_top_of_table", user_id: locals.user!.id }},
                create: { key: "app_pages_top_of_table", value: appPagesTopOfTable, user_id: locals.user!.id },
                update: { value: appPagesTopOfTable }
            });

            return { updateUserSettings: { success: true }}
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { updateUserSettings: { error: "errors.app.user_settings.update.failed" }});
        }
    },

    updateUser: async ({ request, locals }) => {

        console.log("updateUser");

        if(locals.user === null)
            return fail(401, { updateUser: { error: "errors.app.user.update.not_authenticated" }});

        const form = await request.formData();

        const username = form.get("username")?.toString();
        const email = form.get("email")?.toString();

        if(username === undefined || email === undefined)
            return fail(400, { updateUser: { error: "errors.app.user.update.no_username_or_email" }});

        try
        {
            await locals.prisma.user.update({
                where: { id: locals.user!.id },
                data: { username, email }
            });

            return { updateUser: { success: true }}
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { updateUser: { error: "errors.app.user.update.failed" }});
        }
    }
}