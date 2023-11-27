import type { AppSettings as StoredAppSettings } from "@prisma/client";

export type AppSettings = {

    appConfigured: boolean,
    appCompanyName: string,
    appCompanyAddress: string,
    appCompanyDefaultVat: number

};

const defaultSettings: AppSettings = {

    appConfigured: true,
    appCompanyName: "Your Company Name",
    appCompanyAddress: "Your Company Address",
    appCompanyDefaultVat: 20

};

/**
 * Convert stored app settings to app settings with defaults for unset values
 * @param storedAppSettings App settings stored in the database
 * @returns Exploitable app settings
 */
export const getSettings = (storedAppSettings: Array<StoredAppSettings>) => {

    return {
        appConfigured: storedAppSettings.find(s => s.key === "appConfigured")?.value === "true",
        appCompanyName: storedAppSettings.find(s => s.key === "appCompanyName")?.value ?? defaultSettings.appCompanyName,
        appCompanyAddress: storedAppSettings.find(s => s.key === "appCompanyAddress")?.value ?? defaultSettings.appCompanyAddress,
        appCompanyDefaultVat: Number(storedAppSettings.find(s => s.key === "appCompanyDefaultVat")?.value ?? defaultSettings.appCompanyDefaultVat)
    }
}