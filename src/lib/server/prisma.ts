import { env } from "$env/dynamic/private";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient().$extends({
    result: {
        scm_supplier: {
            logo: {
                needs: { id: true, logo: true },
                compute({ id, logo }) { return (logo === null) ? null : `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/scm/supplier/${id}/${logo}` }
            }
        }
    }
});

prisma.$connect();