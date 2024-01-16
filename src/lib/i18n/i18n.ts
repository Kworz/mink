import { init, register } from "svelte-i18n";

const defaultLocale = "en";

register("en", () => import('./lang/en.json'));
register("fr", () => import('./lang/fr.json'));

init({
    fallbackLocale: defaultLocale
});