import "$lib/i18n/i18n";
import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";

export const load = async () => {
    if(browser) locale.set(window.navigator.language.split('-')[0]);

    await waitLocale();
}