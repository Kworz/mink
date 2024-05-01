/**
 * Checks if mink has the necessary env-vars to work
 * @returns 
 */
export function isEnvironementValid(): boolean {

    const neededKeys = [
        "DATABASE_URL", 
        "S3_ENDPOINT", 
        "S3_BUCKET_NAME",
        "S3_ACCESS_KEY_ID", 
        "S3_SECRET_ACCESS_KEY",
        "BRIDGEAPI_CLIENTID",
        "BRIDGEAPI_CLIENTSECRET",
    ];

    for (const key of neededKeys) {
        if (process.env[key] === "" || process.env[key] === undefined)  {
            console.error(`Missing environment variable: ${key}`);
            return false;
        }
    }

    return true;
}