import { parseQRCodeData } from "$lib/components/qrcode/qrcode";
import type { RequestHandler } from "./$types";

export const GET = (({ url }) => {

    const qrData = url.searchParams.get("qr");

    if(qrData === null)
        return new Response("No QR Code data provided", { status: 400 });

    const qrDataParsed = parseQRCodeData(qrData);
    
    // return a redirect to the parsed URL
    return new Response(null, {
        status: 303,
        headers: {
            "Location": qrDataParsed
        }
    });
    
}) satisfies RequestHandler;
