import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    addCompanyDetails: async ({ locals, request }) => {
        const form = await request.formData();

        try {
            const companyName = form.get("companyName")?.toString();
            const companyAddress = form.get("companyAddress")?.toString();
            const companyDefaultVat = form.get("companyDefaultVat")?.toString();

            if (companyName === undefined || companyAddress === undefined || companyDefaultVat === undefined)
                throw new Error("Missing required fields");

            if (companyName?.length < 3)
                throw new Error("Company name must be at least 3 characters long");

            await locals.prisma.appSettings.create({ data: { key: "appCompanyName", value: companyName }});
            await locals.prisma.appSettings.create({ data: { key: "appCompanyAddress", value: companyAddress }});
            await locals.prisma.appSettings.create({ data: { key: "appCompanyDefaultVat", value: companyDefaultVat }});
            await locals.prisma.appSettings.create({ data: { key: "appConfigured", value: "true" }});

        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { error: ex as string });
        }

        throw redirect(303, "/install/setup-finished");
    }
}