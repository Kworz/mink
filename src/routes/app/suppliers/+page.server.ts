import { Collections, type SuppliersResponse } from "$lib/DBTypes";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const suppliers = await locals.pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>();

    return {
        suppliers: structuredClone(suppliers)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    editSupplier: async ({ locals, request }) => {
        try {
            const form = await request.formData();
            form.set("internal", String(form.has("internal")));

            const supplierID = form.get("id");

            if(supplierID === null)
                throw "could not find supplier ID";

            if((form.get("thumbnail") as (Blob | null))?.size === 0)
                form.delete("thumbnail");

            await locals.pb.collection(Collections.Suppliers).update(supplierID.toString(), form);

            return {
                edit: { success: "Updated supplier" }
            };
        }
        catch(ex)
        {
            console.log(ex);
            return {
                edit: { error: ex }
            }
        }
    },
    createSupplier: async ({ locals, request }) => {
        try {
            const form = await request.formData();
            form.set("internal", String(form.has("internal")));

            await locals.pb.collection(Collections.Suppliers).create(form);
            return { create: { success: "Created successfully" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { create: { error: ex }};
        }
    },
    deleteSupplier: async ({ locals, request }) => {

        try {
            const form = await request.formData();
            const deleteID = form.get("id");

            if(deleteID === null)
                throw "could not find supplier ID";

            await locals.pb.collection(Collections.Suppliers).delete(deleteID.toString());

            return { delete: { success: "Deleted successfully" }};

        }
        catch(ex)
        {
            console.log(ex);
            return { delete: { error: ex }};
        }
    }
}