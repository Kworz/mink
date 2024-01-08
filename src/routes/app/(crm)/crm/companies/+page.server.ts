import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { crm_company_size } from "@prisma/client";

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "name";
    const filter = url.searchParams.get("filter") ?? "";
    const page = Number(url.searchParams.get("page")) ?? 1;

    const companies = await locals.prisma.crm_company.findMany({ include: { contacts: true }});
    
    return { companies };

}) satisfies PageServerLoad;

export const actions: Actions = {

    upsertCompany: async ({ locals, request }) => {

        const form = await request.formData();

        const id = form.get("id")?.toString();
        const name = form.get("name")?.toString();

        if(name === undefined)
            return fail(400, { createCompany: { error: "Missing company name" }});

        const size = form.get("size")?.toString();

        if(size === undefined || !(crm_company_size[size as (keyof typeof crm_company_size)] === undefined))
            return fail(400, { createCompany: { error: "Invalid company size" }});

        const sector = form.get("sector")?.toString();
        const type = form.get("type")?.toString();
        const country = form.get("country")?.toString();

        const company = await locals.prisma.crm_company.upsert({
            where: { id },
            update: { name, sector, type, size: (size as keyof typeof crm_company_size), country },
            create: { name, sector, type, size: (size as keyof typeof crm_company_size), country }
        });

        if(company === undefined)
            return fail(400, { createCompany: { error: "Failed to create/update company" }});
    },

    upsertContact: async ({ locals, request }) => {

        const form = await request.formData();

        const id = form.get("id")?.toString();
        const companyId = form.get("companyId")?.toString();
        const name = form.get("name")?.toString();

        if(name === undefined)
            return fail(400, { createContact: { error: "Missing contact name" }});

        if(companyId === undefined)
            return fail(400, { createContact: { error: "Missing company id" }});

        const email = form.get("email")?.toString();
        const phone = form.get("phone")?.toString();
        const position = form.get("position")?.toString();

        const contact = await locals.prisma.crm_company_contact.upsert({
            where: { id },
            update: { name, email, phone, position, company_id: companyId },
            create: { name, email, phone, position, company_id: companyId }
        });

        if(contact === undefined)
            return fail(400, { createContact: { error: "Failed to create/update contact" }});

    }
}