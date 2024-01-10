import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";

const defaultLocale = "en";

register("en", () => import('./lang/en.json'));
register("fr", () => import('./lang/fr.json'));

init({
    fallbackLocale: defaultLocale,
    initialLocale: browser ? navigator.language.split('-')[0] : defaultLocale
});