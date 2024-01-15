import { S3Client } from "@aws-sdk/client-s3";

export const getS3Client = (region: string) => new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
});