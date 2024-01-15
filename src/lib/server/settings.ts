import { app_settings_keys, type app_settings } from "@prisma/client";

const defaultSettings = {

    app_configured: true,

    app_s3_bucketname: "mink",
    app_s3_region: "eu-west-1",

    company_name: "Your Company Name",
    company_address_road: "",
    company_address_city: "",
    company_address_postal_code: "",
    company_address_country: "",

    company_default_vat: 20,

} satisfies Record<app_settings_keys, boolean | string | number>;

export type AppSettings = typeof defaultSettings;

/**
 * Convert stored app settings to app settings with defaults for unset values
 * @param storedAppSettings App settings stored in the database
 * @throws
 * @returns Exploitable app settings
 */
export const getSettings = (storedAppSettings: Array<app_settings>): typeof defaultSettings | undefined => {

    const appIsConfigured = storedAppSettings.find(s => s.key === "app_configured")?.value === "true";

    if(appIsConfigured === false) return undefined;

    return {
        app_configured: true,

        app_s3_bucketname: storedAppSettings.find(s => s.key === "app_s3_bucketname")?.value ?? defaultSettings.app_s3_bucketname,
        app_s3_region: storedAppSettings.find(s => s.key === "app_s3_region")?.value ?? defaultSettings.app_s3_region,

        company_name: storedAppSettings.find(s => s.key === "company_name")?.value ?? defaultSettings.company_name,

        company_address_road: storedAppSettings.find(s => s.key === "company_address_road")?.value ?? defaultSettings.company_address_road,
        company_address_city: storedAppSettings.find(s => s.key === "company_address_city")?.value ?? defaultSettings.company_address_city,
        company_address_postal_code: storedAppSettings.find(s => s.key === "company_address_postal_code")?.value ?? defaultSettings.company_address_postal_code,
        company_address_country: storedAppSettings.find(s => s.key === "company_address_country")?.value ?? defaultSettings.company_address_country,

        company_default_vat: Number(storedAppSettings.find(s => s.key === "company_default_vat")?.value ?? defaultSettings.company_default_vat),
    }
}