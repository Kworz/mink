const prefixes = {
    "list": "lists"
}

/**
 * Parses the QR Code data and returns the URL to redirect to
 * @param data Parse the data from the QR Code
 * @returns URL to redirect to
 */
export function parseQRCodeData(data: string): string
{
    const split = data.split(':');

    if(split.length > 1)
    {
        const part = prefixes[split.at(0)];
        const part2 = split.at(1);
        return `/app/scm/${part}/${part2}`;
    }
    else
        return `/app/scm/articles/${data}`;
}