const baseURL: Record<string, string> = {
    "article": "/app/scm/articles/",
    "list": "/app/scm/lists/",
};

/**
 * Parses the QR Code data and returns the URL to redirect to
 * @param data Parse the data from the QR Code ```Encapsulated data: INSTANCE_ID:PREFIX:ID```
 * @returns URL to redirect to
 */
export function parseQRCodeData(data: string): string
{
    const [instance, prefix, id] = data.split(':');

    if(instance === undefined || prefix === undefined || id === undefined)
        throw new Error("Invalid QR Code data");

    if(baseURL[prefix] === undefined)
        throw new Error(`Prefix (${prefix}) not found`);

    return `${baseURL[prefix]}${id}`;
}