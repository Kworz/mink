import { Collections, type CrmCompanyResponse, type CrmCompanyContactResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import type { Actions, PageServerLoad } from "./$types";

export type CrmCompanyResponseExpanded = CrmCompanyResponse<{
    "crm_company_contact(company)": Array<CrmCompanyContactResponse>;
}>;

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "name";
    const filter = url.searchParams.get("filter") ?? "";
    const page = Number(url.searchParams.get("page")) ?? 1;

    try
    {
        const companies = await locals.pb.collection(Collections.CrmCompany).getList<CrmCompanyResponseExpanded>(page, 50,{ expand: "crm_company_contact(company)", filter, sort });
        return { companies: structuredClone(companies) };
    }
    catch(ex)
    {
        return { error: ex instanceof ClientResponseError ? ex.message : ex };
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    createCompany: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            await locals.pb.collection(Collections.CrmCompany).create(form);
            return { createCompany: { success: "Successfully created company" }};
        }
        catch(ex)
        {
            return { createCompany: { error: ex instanceof ClientResponseError ? ex.message : ex }};
        }
    },

    editCompany: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            const id = form.get("id");

            if(!id)
                throw "Missing company id";

            await locals.pb.collection(Collections.CrmCompany).update(id.toString(), form);
            return { editCompany: { success: "Successfully updated company" }};
        }
        catch(ex)
        {
            return { editCompany: { error: ex instanceof ClientResponseError ? ex.message : ex }};
        }
    },

    createContact: async ({ locals, request }) => {
            
            const form = await request.formData();
    
            try
            {
                await locals.pb.collection(Collections.CrmCompanyContact).create(form);
                return { createContact: { success: "Successfully created contact" }};
            }
            catch(ex)
            {
                return { createContact: { error: ex instanceof ClientResponseError ? ex.message : ex }};
            }
    },

    editContact: async ({ locals, request }) => {
            
        const form = await request.formData();

        try
        {
            const id = form.get("id");

            if(!id)
                throw "Missing contact id";

            await locals.pb.collection(Collections.CrmCompanyContact).update(id.toString(), form);
            return { editContact: { success: "Successfully updated contact" }};
        }
        catch(ex)
        {
            return { editContact: { error: ex instanceof ClientResponseError ? ex.message : ex }};
        }
    }
}