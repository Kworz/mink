import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { S3 } from "@aws-sdk/client-s3";

export const load = (async ({ locals }) => {

    const appS3Bucket = await locals.prisma.app_settings.findFirst({ where: { key: "app_s3_bucketname" }});

    if(appS3Bucket !== null)
        return redirect(303, "/install/setup-company");

}) satisfies PageServerLoad;

export const actions: Actions = {

    setupS3: async ({ locals, request }) => {

        const s3Regions = [
            "us-east-2",
            "us-east-1",
            "us-west-1",
            "us-west-2",
            "af-south-1",
            "ap-east-1",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-southeast-1",
            "ap-southeast-2",
            "ap-northeast-1",
            "ca-central-1",
            "cn-north-1",
            "cn-northwest-1",
            "eu-central-1",
            "eu-west-1",
            "eu-west-2",
            "eu-south-1",
            "eu-west-3",
            "eu-north-1",
            "me-south-1",
            "sa-east-1"
        ];

        const form = await request.formData();

        const s3Bucket = form.get("s3_bucket")?.toString();
        const s3Region = form.get("s3_region")?.toString();

        if(s3Bucket === undefined || s3Bucket.length === 0)
            return fail(400, { setupS3: { error: "errors.app.setup_s3.bucket_name_invalid" }});

        if(s3Region === undefined || s3Region.length === 0 || !s3Regions.includes(s3Region))
            return fail(400, { setupS3: { error: "errors.app.setup_s3.region_invalid" }});

        const s3Client = new S3({ region: s3Region, 
            credentials: { 
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
            }
        });
        
        try
        {
            await s3Client.headBucket({ Bucket: s3Bucket });
        }
        catch(ex)
        {
            return fail(400, { setupS3: { error: "errors.app.setup_s3.bucket_not_found" }});
        }

        await locals.prisma.app_settings.createMany({
            data: [
                {
                    key: "app_s3_bucketname",
                    value: s3Bucket
                },
                {
                    key: "app_s3_region",
                    value: s3Region
                }
            ]
        });

        return redirect(303, "/install/setup-company");
    }
}