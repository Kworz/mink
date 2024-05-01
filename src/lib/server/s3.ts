import { S3Client } from "@aws-sdk/client-s3";

export const getS3Client = () => new S3Client({
    endpoint: process.env.S3_ENDPOINT as string,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string
    }
});