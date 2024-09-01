import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { RequestHandler } from "./$types";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GET: RequestHandler = async ({ locals, params }) => {

    try
    {
        const result = await locals.s3.send(new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: params.filePath
        }));

        return new Response(await result.Body?.transformToByteArray(), { status: 200, headers: {
            'Content-Type': String(result.ContentType),
            'Content-Length': String(result.ContentLength)
        }});
    }
    catch(ex)
    {
        console.error(ex);
        return new Response("Not found", { status: 404 });
    }
}