import { payment_method, payment_rule, type scm_supplier } from "@prisma/client";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { DeleteObjectCommand, PutObjectAclCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";

export const load = (async ({ locals }) => {

    const suppliers = await locals.prisma.scm_supplier.findMany();

    return {
        suppliers: JSON.parse(JSON.stringify(suppliers)) as unknown as scm_supplier[] // ? this is due to a bug in Prisma https://github.com/prisma/prisma/issues/20627
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    upsertSupplier: async ({ locals, request }) => {
        try
        {
            const form = await request.formData();

            const supplierId = form.get("id")?.toString();

            const name = form.get("name")?.toString();
            if(!name || name.length < 1) return fail(400, { error: "scm.supplier.update.error.no_name_given" });

            const internal = form.has("internal");

            const website = form.get("website")?.toString();

            const addressRoad = form.get("address_road")?.toString();
            const addressCity = form.get("address_city")?.toString();
            const addressPostalcode = form.get("address_postal_code")?.toString();
            const addressCountry = form.get("address_country")?.toString();

            const paymentRule = form.get("payment_rule")?.toString();
            const paymentMethod = form.getAll("payment_method").map(m => m.toString());

            if(paymentMethod !== undefined && !paymentMethod.every(m => Object.keys(payment_method).indexOf(m) !== -1))
                throw "scm.supplier.update.error.invalid_payment_method";
            
            if(paymentRule !== undefined && Object.keys(payment_rule).indexOf(paymentRule) === -1)
                throw "scm.supplier.update.error.invalid_payment_rule";

            const { id, logo: Oldlogo } = await locals.prisma.scm_supplier.upsert({
                where: { id: supplierId ?? "" },
                create: {
                    name,
                    internal,
                    website,
                    address_road: addressRoad,
                    address_city: addressCity,
                    address_postal_code: addressPostalcode,
                    address_country: addressCountry,
                    payment_rule: (paymentRule as payment_rule),
                    payment_method: (paymentMethod as payment_method[])
                },
                update: {
                    name,
                    internal,
                    website,
                    address_road: addressRoad,
                    address_city: addressCity,
                    address_postal_code: addressPostalcode,
                    address_country: addressCountry,
                    payment_rule: (paymentRule as payment_rule),
                    payment_method: (paymentMethod as payment_method[])
                }
            });

            let logo: File | null | undefined = form.get("logo") as File | null;
            logo = (logo?.size ?? 0) === 0 ? undefined : logo;

            if(Oldlogo !== null && (!form.has("logo") || logo === undefined))
            {
                const deleteObjectCommand = new DeleteObjectCommand({
                    Bucket: env.AWS_BUCKET_NAME,
                    Key: `scm/supplier/${id}/logo.${Oldlogo.split(".").at(-1)}`
                });

                const deleteResult = await locals.s3.send(deleteObjectCommand);

                await locals.prisma.scm_supplier.update({ where: { id }, data: { logo: null }});

                if(deleteResult.DeleteMarker === false)
                    throw "scm.supplier.update.error.old_logo_delete_failed";
            }

            if(logo)
            {
                const newLogoName = `logo.${logo.name.split(".").at(-1)}`;

                const uploadCommand = new PutObjectCommand({
                    Bucket: env.AWS_BUCKET_NAME,
                    Key: `scm/supplier/${id}/${newLogoName}`,

                    //@ts-ignore
                    Body: await logo.arrayBuffer(), 
                });

                const uploadResult = await locals.s3.send(uploadCommand);

                if(uploadResult.$metadata.httpStatusCode !== 200)
                    throw "scm.supplier.update.error.logo_upload_failed";

                const aclCommand = new PutObjectAclCommand({
                    Bucket: env.AWS_BUCKET_NAME,
                    Key: `scm/supplier/${id}/${newLogoName}`,
                    ACL: "public-read"
                });

                const aclResult = await locals.s3.send(aclCommand);

                if(aclResult.$metadata.httpStatusCode !== 200)
                    throw "scm.supplier.update.error.logo_upload_failed";

                await locals.prisma.scm_supplier.update({ where: { id }, data: { logo: newLogoName }});
            }

            return { upsertSupplier: { success: "scm.supplier.update.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return {
                edit: { error: "scm.supplier.update.error" }
            }
        }
    },
    deleteSupplier: async ({ locals, request }) => {

        try {
            const form = await request.formData();
            const deleteID = form.get("id")?.toString();

            if(deleteID === null)
                throw "scm.supplier.delete.error.no_id_given";

            await locals.prisma.scm_store.delete({
                where: { id: deleteID }
            })

            return { delete: { success: "scm.supplier.delete.success" }};

        }
        catch(ex)
        {
            console.log(ex);
            return { delete: { error: ex }};
        }
    }
}