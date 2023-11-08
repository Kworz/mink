import type { SCMSupplier } from "@prisma/client";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    const suppliers = await locals.prisma.sCMSupplier.findMany();
    return {
        suppliers
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    editSupplier: async ({ locals, request }) => {
        try {
            const form = await request.formData();
            form.set("internal", String(form.has("internal")));

            const supplierID = form.get("id")?.toString();

            if(supplierID === null)
                throw "could not find supplier ID";

            if((form.get("logo") as (Blob | null))?.size === 0)
                form.delete("logo");

            await locals.prisma.sCMSupplier.update({
                where: { id: supplierID },
                data: {
                    ...(Object.fromEntries(form) as unknown as SCMSupplier),
                    internal: form.has("internal") && form.get("internal") === "true"
                }
            })

            return {
                edit: { success: "scm.supplier.update.success" }
            };
        }
        catch(ex)
        {
            console.log(ex);
            return {
                edit: { error: "scm.supplier.update.error" }
            }
        }
    },
    createSupplier: async ({ locals, request }) => {
        try {
            const form = await request.formData();

            if((form.get("logo") as (File | null))?.size === 0)
                form.delete("logo");

            await locals.prisma.sCMSupplier.create({
                data: {
                    ...(Object.fromEntries(form) as unknown as SCMSupplier),
                    internal: form.has("internal") && form.get("internal") === "true"
                }
            })

            return { create: { success: "scm.supplier.create.success" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { create: { error: "scm.supplier.create.error" }};
        }
    },
    deleteSupplier: async ({ locals, request }) => {

        try {
            const form = await request.formData();
            const deleteID = form.get("id")?.toString();

            if(deleteID === null)
                throw "scm.supplier.delete.error.no_id_given";

            await locals.prisma.sCMSupplier.delete({
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