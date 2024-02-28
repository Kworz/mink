import "$lib/i18n/i18n";
import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";
import type { LayoutLoad } from "./$types";

export const load = (async ({ data }) => {

    if(browser) locale.set(data.userSettings?.app_language ?? window.navigator.language.split('-')[0]);

    await waitLocale();

    return {
        session: null,
        user: null,
        appSettings: data.appSettings,
        userSettings: data.userSettings,
    }

}) satisfies LayoutLoad;