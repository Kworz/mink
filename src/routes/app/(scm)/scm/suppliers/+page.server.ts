import { payment_method, payment_rule } from "$lib/prisma-enums";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { DeleteObjectCommand, PutObjectAclCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const load = (async ({ locals }) => {

    const suppliers = await locals.prisma.scm_supplier.findMany();

    return {
        suppliers
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    upsertSupplier: async ({ locals, request }) => {
        try
        {
            const form = await request.formData();

            const supplierId = form.get("id")?.toString();

            const name = form.get("name")?.toString();
            if(!name || name.length < 1) return fail(400, { error: "errors.scm.supplier.upsert.no_name_given" });

            const internal = form.has("internal");

            const website = form.get("website")?.toString();

            const addressRoad = form.get("address_road")?.toString();
            const addressCity = form.get("address_city")?.toString();
            const addressPostalcode = form.get("address_postal_code")?.toString();
            const addressCountry = form.get("address_country")?.toString();

            const paymentRule = form.get("payment_rule")?.toString();
            const paymentMethod = form.getAll("payment_method").map(m => m.toString());

            if(paymentMethod !== undefined && !paymentMethod.every(m => Object.keys(payment_method).indexOf(m) !== -1))
                return fail(400, { upsertSupplier: { error: "errors.scm.supplier.upsert.invalid_payment_method" }});            
            
            if(paymentRule !== undefined && Object.keys(payment_rule).indexOf(paymentRule) === -1)
                return fail(400, { upsertSupplier: { error: "errors.scm.supplier.upsert.invalid_payment_rule" }});

            const { id, logo: oldLogo } = await locals.prisma.scm_supplier.upsert({
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

            if(oldLogo !== null && (!form.has("logo") || logo === undefined))
            {
                const deleteObjectCommand = new DeleteObjectCommand({
                    Bucket: locals.appSettings!.app_s3_bucketname,
                    Key: `scm/supplier/${id}/logo.${oldLogo.split(".").at(-1)}`
                });

                const deleteResult = await locals.s3.send(deleteObjectCommand);

                await locals.prisma.scm_supplier.update({ where: { id }, data: { logo: null }});

                if(deleteResult.DeleteMarker === false)
                    return fail(500, { upsertSupplier: { error: "errors.scm.supplier.upsert.old_logo_delete_failed" }});
            }

            if(logo)
            {
                const newLogoName = `logo.${logo.name.split(".").at(-1)}`;

                const uploadCommand = new PutObjectCommand({
                    Bucket: locals.appSettings!.app_s3_bucketname,
                    Key: `scm/supplier/${id}/${newLogoName}`,

                    //@ts-ignore
                    Body: await logo.arrayBuffer(), 
                });

                const uploadResult = await locals.s3.send(uploadCommand);

                if(uploadResult.$metadata.httpStatusCode !== 200)
                    return fail(500, { upsertSupplier: { error: "errors.scm.supplier.upsert.logo_upload_failed" }});

                const aclCommand = new PutObjectAclCommand({
                    Bucket: locals.appSettings!.app_s3_bucketname,
                    Key: `scm/supplier/${id}/${newLogoName}`,
                    ACL: "public-read"
                });

                const aclResult = await locals.s3.send(aclCommand);

                if(aclResult.$metadata.httpStatusCode !== 200)
                    return fail(500, { upsertSupplier: { error: "errors.scm.supplier.upsert.logo_acl_failed" }});

                await locals.prisma.scm_supplier.update({ where: { id }, data: { logo: newLogoName }});
            }

            return { upsertSupplier: { success: true }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { upsertSupplier: { error: "errors.scm.supplier.upsert.generic" }});
        }
    },
    deleteSupplier: async ({ locals, request }) => {

        try {
            const form = await request.formData();
            const deleteID = form.get("id")?.toString();
            const deleteForce = form.has("force") && form.get("force") === "true";

            if(deleteID === null)
                return fail(400, { deleteSupplier: { error: "errors.scm.supplier.delete.no_id_given" }});

            if(!deleteForce)
            {
                const orders = await locals.prisma.scm_order.findMany({ where: { supplier_id: deleteID }});

                if(orders.length > 0)
                    return fail(400, { deleteSupplier: { error: "errors.scm.supplier.delete.has-dependencies", payload: orders }});
            }

            await locals.prisma.scm_supplier.delete({
                where: { id: deleteID }
            });

            return { deleteSupplier: { success: true }};

        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { deleteSupplier: { error: "errors.scm.supplier.delete.generic" }});
        }
    }
}