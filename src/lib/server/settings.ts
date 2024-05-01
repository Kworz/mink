import type { app_settings_keys, app_settings, user_settings_keys, user_settings } from "@prisma/client";

export type AppSettings = Record<app_settings_keys, boolean | string | number>;

/**
 * Convert stored app settings to app settings with defaults for unset values
 * @param storedAppSettings App settings stored in the database
 * @throws
 * @returns Exploitable app settings
 */
export const getSettings = (storedAppSettings: Array<app_settings>): AppSettings | undefined => {

    const companyName = storedAppSettings.find(s => s.key === "company_name")?.value;
    const companyAddressRoad = storedAppSettings.find(s => s.key === "company_address_road")?.value;
    const companyAddressCity = storedAppSettings.find(s => s.key === "company_address_city")?.value;
    const companyAddressPostalCode = storedAppSettings.find(s => s.key === "company_address_postal_code")?.value;
    const companyAddressCountry = storedAppSettings.find(s => s.key === "company_address_country")?.value;
    const companyDefaultVat = storedAppSettings.find(s => s.key === "company_default_vat")?.value;

    if(companyName === undefined || companyAddressRoad === undefined || companyAddressCity === undefined || companyAddressPostalCode === undefined || companyAddressCountry === undefined || companyDefaultVat === undefined) return undefined;

    return {
        company_name: companyName,
        company_address_road: companyAddressRoad,
        company_address_city: companyAddressCity,
        company_address_postal_code: companyAddressPostalCode,
        company_address_country: companyAddressCountry,
        company_default_vat: Number(companyDefaultVat)
    }
}

const defaultUserSettings = {

    app_language: "en",
    app_menu_left: true as boolean,
    app_pages_top_of_table: false as boolean    

} satisfies Record<user_settings_keys, boolean | string | number>;

export type UserSettings = typeof defaultUserSettings;

/**
 * Convert stored user settings to user settings with defaults for unset values
 * @param storedUserSettings User settings stored in the database
 * @throws
 * @returns Exploitable user settings
 */
export const getUserSettings = (storedUserSettings: Array<user_settings>): typeof defaultUserSettings => {

    const appLeftMenu = storedUserSettings.find(s => s.key === "app_menu_left")?.value;
    const appPagesTopOfTable = storedUserSettings.find(s => s.key === "app_pages_top_of_table")?.value;

    return {
        app_language: storedUserSettings.find(s => s.key === "app_language")?.value ?? defaultUserSettings.app_language,
        app_menu_left: appLeftMenu !== undefined ? (appLeftMenu === "true") : defaultUserSettings.app_menu_left,
        app_pages_top_of_table: appPagesTopOfTable !== undefined ? (appPagesTopOfTable === "true") : defaultUserSettings.app_pages_top_of_table
    }
}